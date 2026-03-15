"""
Prompts from _md/07_gemini_prompt_library.md. Do not modify UI; backend only.
"""

PROMPT_CRISIS_SUMMARY = """You are an AI system that processes humanitarian crisis reports.

Your job is to convert the following article into a structured humanitarian opportunity.

Rules:

- Summarize the crisis clearly in under 60 words
- Set "cause" to exactly ONE of the allowed values below that best describes the primary cause of the crisis. Do NOT default to disaster_relief unless the crisis is primarily a natural disaster (flood, earthquake, cyclone, etc.). Use conflict_relief for armed conflict or war; refugees for displacement/refugee crises; climate for climate-related or drought; food_security for hunger/famine; healthcare or medical_aid for disease/health; education when education is disrupted; etc.
- Identify the geographic region (country or region name)
- Assign all relevant humanitarian values from the allowed list that apply (can be multiple)
- Leave the donation_url field empty
- Return ONLY valid JSON

Allowed values for both "cause" (pick one) and "values" (pick all that apply):

children
education
healthcare
food_security
refugees
poverty
climate
disaster_relief
conflict_relief
women_support
water_access
housing
medical_aid

Output JSON format:

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

Article text:

{EVENT_ARTICLE_TEXT}
"""

PROMPT_VALUE_CLASSIFICATION = """You are an AI classifier for humanitarian crises.

From the following crisis summary, select the most relevant values.

Allowed values:

children
education
healthcare
food_security
refugees
poverty
climate
disaster_relief
conflict_relief
women_support
water_access
housing
medical_aid

Return JSON only:

{
  "values": []
}

Crisis summary:

{EVENT_SUMMARY}
"""

PROMPT_CHARITY_MATCH = """You are an AI system that matches humanitarian crises with charities.

Choose the most appropriate charity from the registry.

Matching factors:

- geographic focus
- mission focus
- value alignment
- relevance to crisis summary

Return JSON only:

{
  "organization": {
    "name": "",
    "website": "",
    "verified": true
  },
  "donation": {
    "donation_url": ""
  }
}

Crisis summary:

{EVENT_SUMMARY}

Region:

{EVENT_REGION}

Values:

{EVENT_VALUES}

Charity registry:

{CHARITY_REGISTRY_JSON}
"""
