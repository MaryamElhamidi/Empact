# Testing relevance-ordered opportunities

## 1. Script tests (no DB / no server)

**Node** – uses `opportunities.json` and `sortByRelevancy`:

```bash
# From repo root
node backend/scripts/test_relevancy.js "food_security,refugees" "Kenya,Sudan"
```

**Python** – uses `opportunities.json` and `rank_opportunities_for_user`:

```bash
cd backend && .venv/bin/python scripts/test_relevancy.py
```

You should see the top 10 opportunities with `[region+cause]` or `[region]` first, then the rest.

## 2. Manual test in the browser (backend + DB required)

1. **Start Node backend** (with MySQL and seeded opportunities):
   ```bash
   cd backend && npm start
   ```
2. **Start frontend**:
   ```bash
   cd frontend && npm run dev
   ```
3. **Register or log in** with a user that has causes and regions (e.g. from the registration flow).
4. Open **Discover**. The list should be relevance-ordered (matching your causes/regions first, then most recent).
5. Log out and log back in; the list should refresh with the same ordering.

## 3. Optional: hit the API directly

With the Node server running:

```bash
curl "http://localhost:3001/api/opportunities?causes=food_security,refugees&regions=Kenya,Sudan"
```

The response array should be ordered by relevancy (region+cause match first, then date).
