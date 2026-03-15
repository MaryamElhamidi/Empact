"""
Full pipeline per _md/00_system_overview.md and 06_cursor_instructions.md.

Flow:
  ReliefWeb (first 10 pages) → extract events →
  Gemini (summarize + structure, donation_url empty) →
  Charity matching (populate organization + donation_url) →
  Store opportunities (in-memory + backend/data/opportunities.json) →
  User matching (by values) →
  API returns ranked opportunities.
"""
import json
import uuid
import sys
from pathlib import Path
from datetime import datetime, timezone

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from config import OPPORTUNITIES_PATH, VALUES_TAXONOMY_PATH
from fetcher.reliefweb import fetch_all_raw_events
from ai.gemini_client import summarize_and_structure
from charity_matching.matcher import populate_donation_and_organization, get_donation_url_for_charity
from matching.user_matching import rank_opportunities_for_user

# In-memory store for opportunities; also persisted to backend/data/opportunities.json
_opportunities_store: list = []

# Allowed cause values (same as values taxonomy) for validation
def _allowed_causes() -> list:
    try:
        with open(VALUES_TAXONOMY_PATH) as f:
            return json.load(f).get("values", [])
    except Exception:
        return ["children", "education", "healthcare", "food_security", "refugees", "poverty", "climate", "disaster_relief", "conflict_relief", "women_support", "water_access", "housing", "medical_aid"]


# Map common Gemini phrasing to taxonomy cause values
_CAUSE_SYNONYMS = {
    "conflict": "conflict_relief", "war": "conflict_relief", "armed conflict": "conflict_relief",
    "disaster": "disaster_relief", "flood": "disaster_relief", "earthquake": "disaster_relief",
    "cyclone": "disaster_relief", "natural disaster": "disaster_relief",
    "drought": "climate", "climate": "climate", "climate change": "climate",
    "refugee": "refugees", "displacement": "refugees",
    "famine": "food_security", "hunger": "food_security", "food": "food_security",
    "health": "healthcare", "disease": "medical_aid", "cholera": "medical_aid", "malnutrition": "medical_aid",
    "education": "education", "children": "children",
    "poverty": "poverty", "water": "water_access", "housing": "housing",
    "women": "women_support",
}

# Keyword hints to infer cause from text when model defaults to disaster_relief (order matters: first match wins)
_CAUSE_KEYWORDS = [
    ("conflict_relief", ["conflict", "war", "warring", "violence", "evacuation", "hostilities", "armed", "military", "displacement due to conflict"]),
    ("refugees", ["refugee", "displaced", "displacement", "fleeing", "fled", "asylum", "returnees"]),
    ("food_security", ["famine", "hunger", "food insecurity", "starving", "malnutrition", "food crisis", "acute food"]),
    ("climate", ["drought", "climate", "cyclone", "flooding", "floods", "rainfall", "heavy rain"]),
    ("medical_aid", ["cholera", "disease", "health crisis", "vaccine", "immunization", "outbreak", "medical"]),
    ("healthcare", ["health", "healthcare", "hospital", "clinics"]),
    ("education", ["education", "schools", "children out of school", "learning"]),
    ("disaster_relief", ["flood", "earthquake", "cyclone", "natural disaster", "flooding"]),  # keep as fallback
]


def _infer_cause_from_text(text: str) -> str:
    """Infer cause from summary/title when Gemini defaults to disaster_relief. Returns taxonomy cause value."""
    if not text:
        return "disaster_relief"
    t = text.lower()
    for cause, keywords in _CAUSE_KEYWORDS:
        if any(k in t for k in keywords):
            return cause
    return "disaster_relief"


def _normalize_cause(gemini_out: dict) -> None:
    """Ensure cause is exactly one of the allowed taxonomy values; fix if not."""
    allowed = _allowed_causes()
    cause = (gemini_out.get("cause") or "").strip().lower()
    summary = (gemini_out.get("summary") or gemini_out.get("title") or "")

    # When model defaults to disaster_relief, infer from text so causes are varied
    if cause == "disaster_relief" and summary:
        inferred = _infer_cause_from_text(summary)
        if inferred in allowed and inferred != "disaster_relief":
            gemini_out["cause"] = inferred
            return
    if cause in allowed:
        return
    # Try synonym map (e.g. "conflict" -> conflict_relief)
    if cause in _CAUSE_SYNONYMS and _CAUSE_SYNONYMS[cause] in allowed:
        gemini_out["cause"] = _CAUSE_SYNONYMS[cause]
        return
    for key, val in _CAUSE_SYNONYMS.items():
        if key in cause or cause in key:
            if val in allowed:
                gemini_out["cause"] = val
                return
    # Try first value from "values" that is allowed
    for v in gemini_out.get("values") or []:
        if v in allowed:
            gemini_out["cause"] = v
            return
    # Last resort: infer from summary/title text
    inferred = _infer_cause_from_text(summary)
    gemini_out["cause"] = inferred if inferred in allowed else "disaster_relief"


def _make_opportunity(raw: dict, gemini_out: dict, source_url: str) -> dict:
    """Build full opportunity JSON; donation uses charity_id (set by charity match)."""
    opp_id = gemini_out.get("opportunity_id") or f"opp_{uuid.uuid4().hex[:12]}"
    date_d = gemini_out.get("date_discovered") or datetime.now(timezone.utc).isoformat()
    donation = gemini_out.get("donation") or {}
    if "donation_url" in donation:
        donation = {k: v for k, v in donation.items() if k != "donation_url"}
    return {
        "opportunity_id": opp_id,
        "title": gemini_out.get("title") or raw.get("title", ""),
        "summary": gemini_out.get("summary", ""),
        "cause": gemini_out.get("cause", ""),
        "region": gemini_out.get("region", ""),
        "organization": gemini_out.get("organization") or {"name": "", "website": "", "verified": False},
        "donation": {
            "charity_id": donation.get("charity_id", ""),
            "suggested_amounts": donation.get("suggested_amounts") or [10, 25, 50, 100],
        },
        "values": gemini_out.get("values") or [],
        "ai_confidence_score": float(gemini_out.get("ai_confidence_score") or 0),
        "date_discovered": date_d,
        "source_url": source_url,
    }


def run_pipeline(max_events: int = 20) -> list:
    """
    Fetch ReliefWeb events, process with Gemini, match charities, store, return all opportunities.
    Limits to max_events for cost/speed (e.g. 20); set higher or remove for full 10 pages.
    """
    raw_events = fetch_all_raw_events()
    opportunities = []
    for i, raw in enumerate(raw_events):
        if i >= max_events:
            break
        if not (raw.get("raw_text") or raw.get("title")):
            continue
        text = (raw.get("raw_text") or raw.get("title", ""))[:12000]
        try:
            gemini_out = summarize_and_structure(text)
        except Exception:
            gemini_out = None
        if not gemini_out:
            # Fallback: minimal opportunity from raw when Gemini fails or returns invalid JSON
            gemini_out = {
                "opportunity_id": "",
                "title": raw.get("title", "Humanitarian update"),
                "summary": (raw.get("raw_text") or raw.get("title", ""))[:300],
                "cause": "disaster_relief",
                "region": raw.get("region", ""),
                "organization": {"name": "", "website": "", "verified": False},
                "donation": {"charity_id": "", "suggested_amounts": [10, 25, 50, 100]},
                "values": ["disaster_relief"],
                "ai_confidence_score": 0.0,
                "date_discovered": datetime.now(timezone.utc).isoformat(),
            }
        _normalize_cause(gemini_out)
        opp = _make_opportunity(raw, gemini_out, raw.get("url", ""))
        opp = populate_donation_and_organization(opp)
        opportunities.append(opp)
    global _opportunities_store
    _opportunities_store = opportunities
    # Persist to backend/data/opportunities.json (platform opportunity JSON format)
    try:
        OPPORTUNITIES_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(OPPORTUNITIES_PATH, "w", encoding="utf-8") as f:
            json.dump(opportunities, f, indent=2, ensure_ascii=False)
    except Exception:
        pass
    return opportunities


def _enrich_with_donation_url(opportunities: list) -> list:
    """Add donation_url to each opportunity's donation from charity_id (for API response)."""
    out = []
    for opp in opportunities:
        opp = dict(opp)
        donation = dict(opp.get("donation") or {})
        cid = donation.get("charity_id", "")
        if cid:
            donation["donation_url"] = get_donation_url_for_charity(cid)
        else:
            donation["donation_url"] = ""
        opp["donation"] = donation
        out.append(opp)
    return out


def get_stored_opportunities() -> list:
    """Return opportunities from memory, or load from data/opportunities.json if empty."""
    global _opportunities_store
    if _opportunities_store:
        return list(_opportunities_store)
    if OPPORTUNITIES_PATH.exists():
        try:
            with open(OPPORTUNITIES_PATH, "r", encoding="utf-8") as f:
                _opportunities_store = json.load(f)
            return list(_opportunities_store)
        except Exception:
            pass
    return []


def get_opportunities_for_user(user_preferences: dict) -> list:
    """Return opportunities ranked by value match, recency, confidence. Enriched with donation_url from charity_id."""
    raw = rank_opportunities_for_user(user_preferences, get_stored_opportunities())
    return _enrich_with_donation_url(raw)
