"""
API layer: return opportunities to UI. Schema must remain unchanged for UI consumption.
Per _md/00: output JSON schema must remain unchanged.
"""
import json
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from config import CHARITY_REGISTRY_PATH
from pipeline.run import get_stored_opportunities, get_opportunities_for_user

app = FastAPI(title="Empact Backend API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserPreferences(BaseModel):
    causes: List[str] = []
    regions: List[str] = []
    impact_types: List[str] = []


@app.get("/opportunities")
def get_opportunities(
    user_id: Optional[str] = Query(None),
    causes: Optional[str] = Query(None),
    regions: Optional[str] = Query(None),
):
    """
    Return opportunities ordered by relevancy to the logged-in user.
    Pass the user's causes and regions (e.g. from profile) as query params:
    ?causes=disaster_relief,refugees&regions=Kenya,Global
    Ordering: matching region and cause first, then by value overlap, then most recent date first.
    Response schema must stay unchanged for UI.
    """
    prefs = {"causes": [], "regions": [], "impact_types": []}
    if causes:
        prefs["causes"] = [c.strip() for c in causes.split(",") if c.strip()]
    if regions:
        prefs["regions"] = [r.strip() for r in regions.split(",") if r.strip()]
    ranked = get_opportunities_for_user(prefs)
    return {"opportunities": ranked}


@app.get("/opportunities/{opportunity_id}")
def get_opportunity_by_id(opportunity_id: str):
    """Return one opportunity by id (from stored opportunities). Used by Support Initiative modal."""
    opportunities = get_stored_opportunities()
    for o in opportunities:
        if (o.get("opportunity_id") or "").strip() == (opportunity_id or "").strip():
            from pipeline.run import _enrich_with_donation_url
            [enriched] = _enrich_with_donation_url([o])
            return enriched
    return JSONResponse(status_code=404, content={"error": "Opportunity not found"})


@app.get("/charities/{charity_id}")
def get_charity_by_id(charity_id: str):
    """Return one charity by id from backend/data/charity_registry.json. Used by Support Initiative modal."""
    if not CHARITY_REGISTRY_PATH.exists():
        return JSONResponse(status_code=404, content={"error": "Charity registry not found"})
    with open(CHARITY_REGISTRY_PATH, encoding="utf-8") as f:
        registry = json.load(f)
    for c in registry.get("charities") or []:
        if (c.get("charity_id") or "").strip() == (charity_id or "").strip():
            return c
    return JSONResponse(status_code=404, content={"error": "Charity not found"})


@app.post("/user/preferences")
def save_user_preferences(prefs: UserPreferences):
    """Accept user preferences (e.g. for persistence later). For now just ack."""
    return {"ok": True}
