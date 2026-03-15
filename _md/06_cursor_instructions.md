# Cursor Implementation Instructions

Cursor is responsible for generating backend code based on these instructions.

---

## Cursor Tasks

1. Analyze the structure of the website:

https://reliefweb.int/updates

2. Determine the best way to retrieve event listings.

3. Build a fetcher that retrieves the first 10 pages.

4. Extract event URLs and article content.

5. Send the article content to Gemini AI.

6. Convert the response into the opportunity JSON structure.

7. Leave donation_url empty initially.

8. Match events with charities from the charity registry.

9. Store structured opportunities.

10. Perform value-based matching between users and opportunities.

---

## Important Restrictions

Cursor must NOT modify UI code.

Only generate files under:

backend/
    fetcher/
    ai/
    charity_matching/
    matching/
    pipeline/