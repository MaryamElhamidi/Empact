# Devpost Submission: Empact - AI-Powered Humanitarian Impact Platform

## 🌍 Overview
**Empact** is Canada's first AI-driven humanitarian bridge, transforming global crisis awareness into immediate, frictionless action. While many want to help, the complexity of finding verified charities and navigating donation forms often leads to "intent friction." Empact solves this by using AI to discover urgent crises, match them to your personal values, and automate the donation process through intelligent software agents.

## 💡 Inspiration
We noticed a recurring problem: people see tragedies on the news and want to help, but the journey from "seeing" to "giving" is broken. Researching verified charities, understanding the specific needs of a region, and filling out repetitive forms creates a "friction barrier" that prevents immediate support. We built Empact to bridge the gap between empathy and action, making humanitarian giving as effortless as ordering a meal.

## 🚀 What it does
Empact is an AI-powered human-impact platform that:
1.  **Discovers**: Continuously scans global sources and the ReliefWeb API for urgent humanitarian situational reports.
2.  **Analyzes**: Uses Google Gemini to distill complex technical reports into clear, actionable summaries and classifies them into meaningful categories (e.g., Food Security, Disaster Relief).
3.  **Matches**: Ranks opportunities based on a user’s personal values and preferred regions, ensuring they see crisis updates they actually care about.
4.  **Automates**: Deploys "Empact Agents" (Selenium-based) that navigate donation pages, handle multi-step forms, and autofill donor information, leaving the user with just a final one-click confirmation.

## ⚙️ How we built it
Empact is a complex ecosystem orchestrated across three main layers:
*   **The Ingestion Engine (Python/FastAPI)**: A robust pipeline that fetches JSON situational reports, passes them through Gemini Flash for structured data extraction, and performs fuzzy-matching against a verified charity registry.
*   **The Intelligence Layer (Google Gemini)**: We leverage Gemini’s reasoning to transform messy news text into a structured, urgent taxonomy of needs.
*   **The Automation Agent (Node.js/Selenium)**: A headless automation environment that uses heuristic detection to identify donation fields on external websites (GoFundMe, charity sites) and handles the "checkout flow" on behalf of the user.
*   **The Experience (Next.js 15 & Framer Motion)**: A premium frontend featuring an interactive 3D globe and urgency-mapped notifications to create a "Live Crisis Feed" that feels alive.

## 🚧 Challenges we ran into
The biggest hurdle was **Agentic Heuristics**. Every charity website is built differently. Our Selenium agents had to be intelligent enough to identify a "Donate" button vs. a generic link, and handle multi-page forms where fields like "Address" might be dynamic. We solved this by implementing a scoring system that analyzes element IDs, classes, and surrounding text to "guess" the correct interaction point with high accuracy. 

Another challenge was **Orchestration**—managing a Python-based AI pipeline and a Node.js-based automation agent while keeping the Next.js frontend updated in real-time. We achieved this through a unified API layer and structured JSON messaging.

## 🏅 Accomplishments that we're proud of
*   **End-to-End Automation**: We successfully demonstrated a donor going from "Notification" to "Autofilled Checkout" in under 10 seconds.
*   **Gemini Information Extraction**: Seeing Gemini take a 5,000-word disaster report and turn it into a perfect 3-sentence summary with categorized metadata was a "wow" moment for the team.
*   **Technical Integration**: Building a "Polyglot" stack (Python, Node, React) that works together seamlessly was a major engineering win for us.

## 📖 What we learned
We learned that **AI is the glue of the modern web.** Traditional scraping breaks, but "Semantic Scraping" with AI allows software to understand the *purpose* of a webpage. We also deeply explored the ethics of automation—ensuring that our "Empact Agents" always keep the user in control of the final financial transaction for security and transparency.

## 🔮 What's next for Empact
*   **Deep Registry Expansion**: Partnering with more global NGOs to provide direct API integrations for even faster aid.
*   **Predictive Philanthropy**: Moving from "Discovery" to "Prediction"—using AI to notify users about potential crises *before* they Peak (e.g., predicted flooding).
*   **Smart Wallet Integration**: Securely storing encrypted user data to enable true "one-tap" global giving across any platform, including crypto and local payment gateways.

---

## 🏆 Alignment with Judging Criteria [FOR REFERENCE]
*   **Innovation**: Moving from static lists to active agents.
*   **Complexity**: Multi-environment (Python/Node/JS) and Selenium heuristics.
*   **Design**: Interactive globe and high-polish notifications.
*   **Impact**: Blueprints for the future of disaster response.

## 🏆 Alignment with Judging Criteria

### 1. Innovation & Originality (x2.5)
Empact moves beyond traditional "charity lists." By using AI-driven agents to handle the "dirty work" of form-filling, we’ve created a "Charity-as-an-API" experience that is entirely non-obvious and bold.

### 2. Technical Complexity & Execution (x3.0)
We integrated three distinct environments: a Next.js frontend, a Python/FastAPI pipeline for heavy AI processing, and a Node.js/Selenium environment for automation. Orchestrating these while maintaining a seamless user experience was our biggest technical challenge.

### 3. Product Experience & Design (x2.0)
The UI is built for "Impact." From the interactive 3D globe to the clean, urgency-mapped notifications, every element is designed to minimize cognitive load and maximize emotional connection.

### 4. Impact & Practical Value (x2.5)
Empact is a blueprint for the future of Philanthropy. By reducing the time-to-donation, we can directly increase the funding reaching organizations during the critical first hours of a disaster.

## 🔍 AI Use
Yes, Gemini Flash is the heartbeat of our data processing and matching logic.

## 🔗 GitHub Repository
[Link to Repository](https://github.com/MaryamElhamidi/Empact)
