# Empact Backend System Overview

This backend powers the humanitarian opportunity discovery system.

The system identifies global humanitarian problems and connects them to relevant charities and users.

Primary data source:
https://reliefweb.int/updates

This website aggregates ongoing humanitarian crises and updates worldwide.

The backend performs the following steps:

1. Fetch crisis reports from ReliefWeb.
2. Use Gemini AI to summarize each crisis.
3. Convert each crisis into the platform’s opportunity JSON format.
4. Classify each crisis using a predefined value taxonomy.
5. Match each crisis to the most relevant charity from a trusted charity registry.
6. Match crises to users based on shared values.

The UI will display these matched opportunities.

Important:
The output JSON schema must remain unchanged so the UI can consume the data.

---

## System Pipeline

ReliefWeb Updates
→ Event Fetcher
→ Gemini Event Extraction
→ Value Classification
→ Charity Matching
→ User Matching
→ API Output