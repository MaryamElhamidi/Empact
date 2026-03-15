"""
Gemini client: summarization, value classification, charity matching.
Per _md/02_event_ai_processing.md and 07_gemini_prompt_library.md. Returns valid JSON only.
"""
import json
import re
import sys
from pathlib import Path
from typing import Any, Optional

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from config import GEMINI_API_KEY
from ai.prompts import PROMPT_CRISIS_SUMMARY, PROMPT_VALUE_CLASSIFICATION, PROMPT_CHARITY_MATCH


def _get_model():
    import google.generativeai as genai
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-2.5-flash")


def _parse_json_from_response(text: str) -> Optional[dict]:
    text = (text or "").strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if m:
        text = m.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def summarize_and_structure(article_text: str) -> Optional[dict]:
    """
    Prompt 1: Convert raw article into opportunity JSON. donation_url must stay empty.
    """
    if not (article_text or "").strip():
        return None
    prompt = PROMPT_CRISIS_SUMMARY.replace("{EVENT_ARTICLE_TEXT}", article_text[:12000])
    model = _get_model()
    response = model.generate_content(prompt)
    text = response.text if hasattr(response, "text") else str(response)
    out = _parse_json_from_response(text)
    if out and "donation" in out:
        out["donation"]["donation_url"] = ""
    return out


def classify_values(summary: str) -> list:
    """Prompt 2: Return list of value tags for a crisis summary."""
    if not (summary or "").strip():
        return []
    prompt = PROMPT_VALUE_CLASSIFICATION.replace("{EVENT_SUMMARY}", summary[:2000])
    model = _get_model()
    response = model.generate_content(prompt)
    text = response.text if hasattr(response, "text") else str(response)
    out = _parse_json_from_response(text)
    return (out.get("values") or []) if isinstance(out, dict) else []


def match_charity(
    event_summary: str,
    event_region: str,
    event_values: list,
    charity_registry_json: str,
) -> Optional[dict]:
    """
    Prompt 3: Pick one charity from registry; return organization + donation.donation_url.
    Never hallucinate charities; only from registry.
    """
    if not charity_registry_json.strip():
        return None
    prompt = (
        PROMPT_CHARITY_MATCH.replace("{EVENT_SUMMARY}", (event_summary or "")[:2000])
        .replace("{EVENT_REGION}", event_region or "")
        .replace("{EVENT_VALUES}", json.dumps(event_values if isinstance(event_values, list) else []))
        .replace("{CHARITY_REGISTRY_JSON}", charity_registry_json)
    )
    model = _get_model()
    response = model.generate_content(prompt)
    text = response.text if hasattr(response, "text") else str(response)
    return _parse_json_from_response(text)
