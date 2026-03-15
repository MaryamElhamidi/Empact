# User Matching

Users are matched with opportunities using shared values.

User preferences include:

{
"causes": [],
"regions": [],
"impact_types": []
}

Each event also contains value tags.

---

## Matching Algorithm

The system compares user values with event values.

Score = number of shared values.

Example:

User values:
["children","education"]

Event values:
["children","conflict_relief"]

Match score = 1

---

## Ranking

Opportunities should be sorted by:

1. value match score
2. recency
3. AI confidence score