#!/usr/bin/env python3
"""
Run the full pipeline: ReliefWeb fetch → Gemini → charity match → store.
Usage: python run_pipeline.py [max_events]
Default max_events=5 for testing; use higher (e.g. 50) or omit for more.
"""
import sys
from pathlib import Path

_backend = Path(__file__).resolve().parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from pipeline.run import run_pipeline

if __name__ == "__main__":
    max_events = 5
    if len(sys.argv) > 1:
        try:
            max_events = int(sys.argv[1])
        except ValueError:
            pass
    opps = run_pipeline(max_events=max_events)
    print(f"Stored {len(opps)} opportunities. Start API with: uvicorn api.main:app --reload --port 8000")
