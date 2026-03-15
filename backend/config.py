"""
Backend config. Loads from .env at project root. Do not commit secrets.
"""
import os
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
_env = _root / ".env"
if _env.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(_env)
    except ImportError:
        pass

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
RELIEFWEB_APPNAME = os.getenv("RELIEFWEB_APPNAME", "empact")

# Paths to data files (copies of _md templates, not _md itself)
BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
CHARITY_REGISTRY_PATH = DATA_DIR / "charity_registry.json"
VALUES_TAXONOMY_PATH = DATA_DIR / "values_taxonomy.json"
OPPORTUNITIES_PATH = DATA_DIR / "opportunities.json"
REGION_COUNTRIES_PATH = DATA_DIR / "region_countries.json"
