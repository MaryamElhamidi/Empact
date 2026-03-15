# Empact Backend

Backend for the humanitarian discovery platform. Instructions are in `_md/`; do not use `_md` JSON files in production — use copies in `backend/data/`.

## Pipeline

```
ReliefWeb Updates (API) → Fetch first 10 pages → Gemini (summarize + values) →
Opportunity JSON (donation_url empty) → Charity matching → Populate donation_url →
Store → User matching (by values) → API
```

## Structure (per _md/06_cursor_instructions.md)

- `fetcher/` — ReliefWeb API client (first 10 pages of updates)
- `ai/` — Gemini: crisis summarization, value classification, charity matching
- `charity_matching/` — Match event to registry; set organization + donation_url
- `matching/` — User–opportunity matching by shared values
- `pipeline/` — Orchestration
- `api/` — FastAPI; output schema unchanged for UI
- `data/` — `charity_registry.json`, `values_taxonomy.json` (copies of _md templates)

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Env (project root `.env`):

- `GEMINI_API_KEY` — required for AI
- `RELIEFWEB_APPNAME` — optional; default `empact` (ReliefWeb may require pre-approved appname)

## Run

```bash
# Run pipeline (fetch + Gemini + charity match); then start API
python -c "
from pipeline.run import run_pipeline
run_pipeline(max_events=5)  # limit for testing
"
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Then: `GET /opportunities?causes=disaster_relief,education&regions=global`

## Data

- Edit `backend/data/charity_registry.json` to add real charities (do not use _md template in code).
- Edit `backend/data/values_taxonomy.json` if you change the value list (must match _md/04).
