"""
API layer: return opportunities to UI. Schema must remain unchanged for UI consumption.
Per _md/00: output JSON schema must remain unchanged.
"""
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

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
    Return opportunities. If user_id or preferences provided, rank by value match.
    Response schema must stay unchanged for UI.
    """
    prefs = {"causes": [], "regions": [], "impact_types": []}
    if causes:
        prefs["causes"] = [c.strip() for c in causes.split(",") if c.strip()]
    if regions:
        prefs["regions"] = [r.strip() for r in regions.split(",") if r.strip()]
    ranked = get_opportunities_for_user(prefs)
    return {"opportunities": ranked}


@app.post("/user/preferences")
def save_user_preferences(prefs: UserPreferences):
    """Accept user preferences (e.g. for persistence later). For now just ack."""
    return {"ok": True}
