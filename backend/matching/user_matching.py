"""
User matching: rank opportunities by relevancy to the logged-in user.
Relevancy = region match + cause/value match; then most recent date first.
User signup regions are broad (e.g. Africa, Eastern Europe); opportunities use countries.
We map region -> countries so e.g. user "Africa" matches opportunity "Kenya".
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

_backend = Path(__file__).resolve().parent.parent
_REGION_COUNTRIES_PATH = _backend / "data" / "region_countries.json"

_region_to_countries: Optional[dict] = None


def _load_region_countries() -> dict:
    """Load region -> list of countries (signup region name to country names for matching). Keys normalized to lowercase."""
    global _region_to_countries
    if _region_to_countries is not None:
        return _region_to_countries
    try:
        with open(_REGION_COUNTRIES_PATH, encoding="utf-8") as f:
            raw = json.load(f)
        _region_to_countries = {k.strip().lower(): v for k, v in raw.items() if isinstance(v, list)}
    except Exception:
        _region_to_countries = {}
    return _region_to_countries


def _expand_regions_to_countries(user_region_names: list) -> tuple[set[str], bool]:
    """
    Expand user's chosen regions (e.g. Africa, Eastern Europe) to a set of country names.
    Returns (set of normalized country names, has_global).
    If user chose "Global", has_global=True and we match any opportunity region.
    """
    mapping = _load_region_countries()
    countries = set()
    has_global = False
    for r in (user_region_names or []):
        name = (r or "").strip()
        if not name:
            continue
        n = name.lower()
        if n == "global":
            has_global = True
            continue
        if n in mapping:
            for c in mapping[n]:
                if c:
                    countries.add(_normalize(c))
        else:
            countries.add(_normalize(name))
    return countries, has_global


def _parse_date(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def _normalize(s: str) -> str:
    return (s or "").strip().lower()


def _region_matches(opp_region: str, expanded_countries: set[str], has_global: bool) -> bool:
    """
    True if opportunity region (country) matches user's chosen regions.
    expanded_countries = set of country names from user's regions (e.g. Africa -> Kenya, Sudan, ...).
    has_global = user chose Global (match any).
    """
    if has_global:
        return True
    if not opp_region or not expanded_countries:
        return False
    o = _normalize(opp_region)
    if o in expanded_countries:
        return True
    for c in expanded_countries:
        if c in o or o in c:
            return True
    return False


def value_match_score(user_values: list, opportunity_values: list) -> int:
    """Number of values that appear in both lists."""
    if not opportunity_values:
        return 0
    uv = set(_normalize(v) for v in (user_values or []) if v)
    ov = set(_normalize(v) for v in opportunity_values if v)
    return len(uv & ov)


def cause_matches_user(opp_cause: str, user_causes: list) -> bool:
    """True if opportunity cause is in user's causes."""
    if not opp_cause or not user_causes:
        return False
    oc = _normalize(opp_cause)
    return oc in set(_normalize(c) for c in user_causes if c)


def rank_opportunities_for_user(
    user_preferences: dict,
    opportunities: list,
) -> list:
    """
    Return opportunities ordered by relevancy to the user:
    1) Region and cause match (both match first, then region or cause, then neither)
    2) Value overlap count (more shared values = higher)
    3) Most recent date first (date_discovered desc)
    4) AI confidence desc

    user_preferences: { "causes": [], "regions": [], "impact_types": [] } from logged-in user.
    """
    user_causes = list(user_preferences.get("causes") or [])
    user_values = list(user_causes)  # treat causes as values for value_match_score
    user_region_names = list(user_preferences.get("regions") or [])
    expanded_countries, has_global = _expand_regions_to_countries(user_region_names)

    def key(opp):
        opp_region = opp.get("region") or ""
        opp_cause = opp.get("cause") or ""
        opp_vals = opp.get("values") or []
        region_ok = _region_matches(opp_region, expanded_countries, has_global)
        cause_ok = cause_matches_user(opp_cause, user_causes)
        value_score = value_match_score(user_values, opp_vals)
        # Relevancy tier: both=3, region only=2, cause only=1, none=0 (higher first)
        if region_ok and cause_ok:
            relevance = 3
        elif region_ok:
            relevance = 2
        elif cause_ok or value_score > 0:
            relevance = 1
        else:
            relevance = 0
        date_val = _parse_date(opp.get("date_discovered", ""))
        date_ts = date_val.timestamp() if date_val else 0
        confidence = float(opp.get("ai_confidence_score") or 0)
        return (-relevance, -value_score, -date_ts, -confidence)

    return sorted(opportunities, key=key)
