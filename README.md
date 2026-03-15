# Empact: AI-Powered Humanitarian Impact Platform

**Empact** is an intelligent platform designed to bridge the gap between global humanitarian crises and collective action. By utilizing Generative AI and automation agents, we make finding and supporting verified causes effortless, personalized, and impactful.

---

## Features

- **AI Discovery**: Continuously monitors global news and ReliefWeb for urgent humanitarian needs.
- **Smart Summarization**: Gemini-powered reports that distill complex situations into actionable insights.
- **Personalized Matching**: Crises are ranked based on your individual causes (e.g., Education, Disaster Relief) and preferred regions.
- **Automation Agents**: Headless Selenium agents that navigate donation forms, autofilling information to ensure help reaches its destination faster.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React 19), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Cobe](https://github.com/shuding/cobe).
- **Backend (API)**: [FastAPI](https://fastapi.tiangolo.com/) (Python) & [Node.js](https://nodejs.org/) (Express).
- **AI**: [Google Gemini Flash](https://deepmind.google/technologies/gemini/).
- **Automation**: [Selenium WebDriver](https://www.selenium.dev/).
- **Data**: [ReliefWeb API](https://reliefweb.int/help/api).

---

## Getting Started

### 1. Prerequisites
- Node.js & npm
- Python 3.10+
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Update a `.env` file with `GEMINI_API_KEY`.

### 3. Pipeline & API
```bash
# Run the AI pipeline to fetch and process crises
python run_pipeline.py 20

# Start the API server
uvicorn api.main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Architecture

1. **ReliefWeb Fetcher**: Pulls raw humanitarian situational reports.
2. **Gemini Processor**: Processes text to extract structured "Opportunities."
3. **Charity Matcher**: Connects crises to verified partner organizations.
4. **Empact Agent**: Automates the donation UX, reducing friction in the final mile of giving.

---

## License
This project is for the **GenAI Genesis Hackathon 2026**.

