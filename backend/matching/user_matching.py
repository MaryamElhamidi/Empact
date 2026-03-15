"""
User matching: score and rank opportunities by shared values, recency, AI confidence.
Per _md/05_user_matching.md. Score = number of shared values; sort by score, recency, ai_confidence_score.
"""
from datetime import datetime, timezone
from typing import Optional


def _parse_date(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def value_match_score(user_values: list, opportunity_values: list) -> int:
    """Number of values that appear in both lists."""
    if not opportunity_values:
        return 0
    uv = set(v.lower() for v in (user_values or []) if v)
    ov = set(v.lower() for v in opportunity_values if v)
    return len(uv & ov)


def rank_opportunities_for_user(
    user_preferences: dict,
    opportunities: list,
) -> list:
    """
    Sort opportunities by: 1) value match score desc, 2) recency desc, 3) ai_confidence_score desc.
    user_preferences: { "causes": [], "regions": [], "impact_types": [] } – treat causes as values for matching.
    """
    user_values = list(user_preferences.get("causes") or [])
    regions = set(r.lower() for r in (user_preferences.get("regions") or []) if r)

    def key(opp):
        opp_vals = opp.get("values") or []
        score = value_match_score(user_values, opp_vals)
        date_val = _parse_date(opp.get("date_discovered", ""))
        date_ts = date_val.timestamp() if date_val else 0
        confidence = float(opp.get("ai_confidence_score") or 0)
        return (-score, -date_ts, -confidence)

    return sorted(opportunities, key=key)
