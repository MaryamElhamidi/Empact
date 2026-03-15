# Gemini Event Processing

Gemini AI is responsible for converting raw event text into the platform's opportunity JSON format.

Input:
Raw text from the ReliefWeb event page.

The AI must:

1. Generate a short summary.
2. Determine the main humanitarian cause.
3. Identify the region.
4. Assign value tags from the value taxonomy.

Important rule:

The donation URL must remain empty during this step.

---

## Output JSON Structure

{
  "opportunity_id": "",
  "title": "",
  "summary": "",
  "cause": "",
  "region": "",
  "organization": {
    "name": "",
    "website": "",
    "verified": false
  },
  "donation": {
    "donation_url": "",
    "suggested_amounts": []
  },
  "values": [],
  "ai_confidence_score": 0.0,
  "date_discovered": ""
}