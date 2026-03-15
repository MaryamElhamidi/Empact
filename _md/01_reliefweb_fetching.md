# ReliefWeb Event Fetching

Primary source of global humanitarian events:

https://reliefweb.int/updates

This page contains a list of the latest humanitarian crisis reports.

The backend should retrieve events from the first 10 pages.

---

## Cursor Instructions

Cursor should analyze the structure of the updates page and determine the best strategy for retrieving events.

Steps:

1. Inspect the HTML structure of the updates page.
2. Identify selectors that consistently locate event entries.
3. Extract the following fields:

- title
- event URL
- region
- publish date

4. Visit each event page.
5. Extract the main article text.

Cursor must avoid brittle selectors such as dynamic class names.

---

## Raw Event Format

The fetcher should produce the following raw structure:

{
"title": "Airstrikes Damage Schools in Northern Iran",
"url": "https://reliefweb.int/report/example",
"region": "Iran",
"date": "2026-03-14",
"raw_text": "Schools and hospitals were damaged following..."
}