#!/usr/bin/env python3
"""
Apply the rule-based charity matcher to existing opportunities.json.
Loads backend/data/opportunities.json, matches each opportunity to the best charity
(by region priority + values), sets organization and donation.charity_id, saves back.
Run from repo root: python backend/scripts/apply_charity_matching.py
"""
import json
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from config import OPPORTUNITIES_PATH
from charity_matching.matcher import populate_donation_and_organization

def main():
    path = OPPORTUNITIES_PATH
    if not path.exists():
        print(f"Not found: {path}")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        opportunities = json.load(f)
    for opp in opportunities:
        populate_donation_and_organization(opp)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(opportunities, f, indent=2, ensure_ascii=False)
    print(f"Updated {len(opportunities)} opportunities with charity_id (and organization).")

if __name__ == "__main__":
    main()
