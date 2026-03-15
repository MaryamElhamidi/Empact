"""
Charity matcher: use Gemini to select charity from registry and fill organization + donation_url.
Per _md/03_charity_matching.md. Never generate charities outside the registry.
"""
import json
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from config import CHARITY_REGISTRY_PATH
from ai.gemini_client import match_charity


def load_registry() -> dict:
    with open(CHARITY_REGISTRY_PATH) as f:
        return json.load(f)


def populate_donation_and_organization(opportunity: dict) -> dict:
    """
    Match opportunity to a charity from registry; set organization.* and donation.donation_url.
    If Gemini fails or API key missing, use first registry charity or leave empty.
    """
    try:
        registry = load_registry()
        registry_json = json.dumps(registry.get("charities", []), indent=0)
        charities = registry.get("charities", [])
    except Exception:
        registry_json = "[]"
        charities = []

    summary = opportunity.get("summary", "")
    region = opportunity.get("region", "")
    values = opportunity.get("values") or []

    result = None
    try:
        result = match_charity(summary, region, values, registry_json)
    except ValueError:
        pass  # GEMINI_API_KEY not set
    except Exception:
        pass
    if not result and charities:
        # No Gemini: use first registry charity so donation_url can be set
        c = charities[0]
        result = {
            "organization": {"name": c.get("name", ""), "website": c.get("website", ""), "verified": c.get("verified", False)},
            "donation": {"donation_url": c.get("donation_url", "")},
        }
    if not result:
        return opportunity

    org = result.get("organization") or {}
    donation = result.get("donation") or {}
    opp_org = opportunity.get("organization") or {}
    opp_donation = opportunity.get("donation") or {}

    opportunity["organization"] = {
        "name": org.get("name") or opp_org.get("name", ""),
        "website": org.get("website") or opp_org.get("website", ""),
        "verified": org.get("verified", opp_org.get("verified", False)),
    }
    opportunity["donation"] = {
        "donation_url": donation.get("donation_url") or opp_donation.get("donation_url", ""),
        "suggested_amounts": opp_donation.get("suggested_amounts") or [10, 25, 50, 100],
    }
    return opportunity
