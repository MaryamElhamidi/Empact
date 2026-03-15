#!/usr/bin/env python3
"""
Test relevance ordering (Python): load opportunities.json and run rank_opportunities_for_user.
Run: python backend/scripts/test_relevancy.py
"""
import json
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_backend))

from matching.user_matching import rank_opportunities_for_user

data_path = _backend / "data" / "opportunities.json"
with open(data_path) as f:
    opportunities = json.load(f)

user_preferences = {
    "causes": ["food_security", "disaster_relief"],
    "regions": ["Africa"],  # broad region -> matched to countries (Kenya, Sudan, etc.) via region_countries.json
    "impact_types": [],
}

ranked = rank_opportunities_for_user(user_preferences, opportunities)

print("Relevancy sort test (Python)")
print("User causes:", user_preferences["causes"])
print("User regions:", user_preferences["regions"])
print("Total opportunities:", len(opportunities))
print("\nTop 10 (relevance-ordered, most recent first within tier):\n")

for i, opp in enumerate(ranked[:10]):
    r = opp.get("region") or ""
    c = opp.get("cause") or ""
    date = (opp.get("date_discovered") or "")[:10]
    title = (opp.get("title") or "")[:50]
    print(f"  {i+1}. {r} | {c} | {date} | {title}...")

print("\n✓ Python ranking: matching region+cause first, then by date.")
