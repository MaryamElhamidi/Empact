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

from config import OPPORTUNITIES_PATH
from fetcher.reliefweb import fetch_all_raw_events
from ai.gemini_client import summarize_and_structure
from charity_matching.matcher import populate_donation_and_organization
from matching.user_matching import rank_opportunities_for_user

# In-memory store for opportunities; also persisted to backend/data/opportunities.json
_opportunities_store: list = []


def _make_opportunity(raw: dict, gemini_out: dict, source_url: str) -> dict:
    """Build full opportunity JSON; ensure donation_url empty until charity match."""
    opp_id = gemini_out.get("opportunity_id") or f"opp_{uuid.uuid4().hex[:12]}"
    date_d = gemini_out.get("date_discovered") or datetime.now(timezone.utc).isoformat()
    return {
        "opportunity_id": opp_id,
        "title": gemini_out.get("title") or raw.get("title", ""),
        "summary": gemini_out.get("summary", ""),
        "cause": gemini_out.get("cause", ""),
        "region": gemini_out.get("region", ""),
        "organization": gemini_out.get("organization") or {"name": "", "website": "", "verified": False},
        "donation": gemini_out.get("donation") or {"donation_url": "", "suggested_amounts": [10, 25, 50, 100]},
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
                "donation": {"donation_url": "", "suggested_amounts": [10, 25, 50, 100]},
                "values": ["disaster_relief"],
                "ai_confidence_score": 0.0,
                "date_discovered": datetime.now(timezone.utc).isoformat(),
            }
        opp = _make_opportunity(raw, gemini_out, raw.get("url", ""))
        opp["donation"]["donation_url"] = ""
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
    """Return opportunities ranked by value match, recency, confidence."""
    return rank_opportunities_for_user(user_preferences, get_stored_opportunities())
