"""
Charity matcher: match opportunities to charities from the registry by region (priority-ordered)
and values/causes. Regions in the registry are listed with first = highest priority.
Sets organization and donation.charity_id on the opportunity (donation_url is resolved from registry when serving).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from config import CHARITY_REGISTRY_PATH


def load_registry() -> dict:
    with open(CHARITY_REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def _normalize(s: str) -> str:
    return (s or "").strip().lower()


def _region_matches(opp_region: str, charity_region: str) -> bool:
    """True if opportunity region matches charity region (exact or substring)."""
    o = _normalize(opp_region)
    c = _normalize(charity_region)
    if not o or not c:
        return False
    return o == c or c in o or o in c


def _value_match_count(opportunity: dict, charity: dict) -> int:
    """Number of opportunity values/cause that appear in charity's focus_values."""
    opp_vals = set()
    for v in (opportunity.get("values") or []):
        if v:
            opp_vals.add(_normalize(v))
    cause = opportunity.get("cause")
    if cause:
        opp_vals.add(_normalize(cause))
    focus = set(_normalize(f) for f in (charity.get("focus_values") or []) if f)
    return len(opp_vals & focus)


def _best_region_priority_index(opp_region: str, charity_regions: list) -> Optional[int]:
    """
    Return the index of the first (highest-priority) charity region that matches opp_region.
    Lower index = higher priority. None if no match.
    """
    if not opp_region or not charity_regions:
        return None
    for i, cr in enumerate(charity_regions):
        if _region_matches(opp_region, cr):
            return i
    return None


def score_charity_for_opportunity(opportunity: dict, charity: dict) -> tuple:
    """
    Score a charity for an opportunity. Higher score = better match.
    Returns (total_score, region_priority_index, value_count) for tie-breaking.

    - Region: charity.regions are ordered (first = most prioritized). If opportunity's region
      matches a charity region, we get a bonus; earlier match = much higher bonus.
    - Values: count of overlap between opportunity values/cause and charity focus_values.

    So we match the opportunity to the charity with the highest-priority region match
    and the most cause/value overlap.
    """
    opp_region = opportunity.get("region") or ""
    charity_regions = charity.get("regions") or []
    region_idx = _best_region_priority_index(opp_region, charity_regions)
    value_count = _value_match_count(opportunity, charity)

    # Region score: first region = highest. Use (len - idx) so index 0 gets max.
    # Scale so region dominance: 1000 per "priority tier" so one tier beats any value count.
    if region_idx is not None:
        n = len(charity_regions)
        region_score = 1000 * (n - region_idx)  # first=1000*n, last=1000
    else:
        region_score = 0

    total = region_score + value_count
    return (total, region_idx if region_idx is not None else 9999, value_count)


def pick_best_charity(opportunity: dict, charities: list) -> Optional[dict]:
    """
    From the registry list, pick the charity that best matches the opportunity:
    highest-priority region match first, then most value/cause overlap.
    """
    if not charities:
        return None
    scored = []
    for c in charities:
        total, region_idx, value_count = score_charity_for_opportunity(opportunity, c)
        scored.append((total, region_idx, value_count, c))
    # Sort by total desc, then by region_idx asc (lower index = higher priority), then value_count desc
    scored.sort(key=lambda x: (-x[0], x[1], -x[2]))
    return scored[0][3]


def populate_donation_and_organization(opportunity: dict) -> dict:
    """
    Match opportunity to the best charity from the registry by region (priority order)
    and values/causes. Set organization and donation.charity_id (not donation_url; URL resolved when serving).
    """
    try:
        registry = load_registry()
        charities = registry.get("charities", [])
    except Exception:
        charities = []

    if not charities:
        return opportunity

    best = pick_best_charity(opportunity, charities)
    if not best:
        return opportunity

    opp_org = opportunity.get("organization") or {}
    opp_donation = opportunity.get("donation") or {}

    opportunity["organization"] = {
        "name": best.get("name") or opp_org.get("name", ""),
        "website": best.get("website") or opp_org.get("website", ""),
        "verified": best.get("verified", opp_org.get("verified", False)),
    }
    opportunity["donation"] = {
        "charity_id": best.get("charity_id", ""),
        "suggested_amounts": opp_donation.get("suggested_amounts") or [10, 25, 50, 100],
    }
    return opportunity


def get_donation_url_for_charity(charity_id: str) -> str:
    """Resolve charity_id to donation_url from the registry (for API responses)."""
    if not charity_id:
        return ""
    try:
        registry = load_registry()
        for c in registry.get("charities", []):
            if c.get("charity_id") == charity_id:
                return c.get("donation_url", "") or ""
    except Exception:
        pass
    return ""
