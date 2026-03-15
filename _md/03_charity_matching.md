# Charity Matching

Once an event has been summarized and classified, the system must match it to the most relevant charity.

The system uses a trusted charity registry JSON file.

The AI agent compares the event with the charity registry.

Matching factors:

- geographic region
- mission focus
- value tags
- organization description

Example:

Event:
"School bombing affecting children in Iran"

Matching charity:
"Iranian Children's Relief Network"

The AI should populate:

organization.name
organization.website
organization.verified
donation.donation_url