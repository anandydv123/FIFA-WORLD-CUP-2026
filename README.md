# FIFA World Cup 2026: Smart Stadium Operations & Fan Assistant

A comprehensive, full-stack, Generative AI-enabled stadium operations and spectator companion application designed for the **FIFA World Cup 2026**. 

This system integrates advanced Gemini AI reasoning, interactive spatial dashboards, and real-time simulator states to elevate the match-day experience and provide critical logistical coordination for host stadiums (e.g., MetLife Stadium, Estadio Azteca, BC Place).

---

## 🌟 Solution Overview

Managing stadium traffic, concession lines, accessibility needs, and safety incidents during an 80,000+ attendee World Cup match requires rapid decision-making. This solution provides a centralized command hub that connects **Spectators (Fans)**, **Volunteers**, and **Operations Staff** in a single interactive ecosystem, backed by secure, server-side Generative AI.

---

## 🗂️ Chosen Verticals & Features

### 1. 🎫 Spectator / Fan Portal (Ecology & Accessibility focus)
*   **Match-Day Seat Routing**: Input any stadium section and receive instant recommendations for the optimal entrance gate (including live wait times) and nearest concessions.
*   **Sustainability Transit Tracker**: Highlights public transit schedules and dynamically grades carbon footprints (A-D). Incentivizes low-carbon travel (Train/Walking) over ride-sharing.
*   **Concessions & Services Directory**: Filter food stands by specific dietary needs (e.g., Vegan, Halal, Gluten-Free) or accessibility needs (e.g., wheelchair-friendly counters, sensory bag rentals).
*   **Multilingual Translation Companion**: Instantly decodes common English spectator queries into the primary host countries' languages (Spanish, French, Portuguese) for smooth venue entry.

### 2. 🦺 Volunteer Helper Portal (Tasking & Emergency focus)
*   **My Shift Task Board**: Shift checklist including venue setup tasks and critical incidents assigned directly by the main operations dashboard.
*   **Fan Phrase Helper**: Supports volunteers in translating spoken foreign queries (e.g., Japanese, Spanish, Arabic) into English along with step-by-step safety/operations checklists.
*   **Live Incident Reporter**: Empower volunteers to submit security, medical, or facility issues (e.g. liquid spills, lost passports, or elderly assistance needs) instantly to the Command Center.

### 3. 🖥️ Command Ops Dashboard (Intelligence & Dispatch focus)
*   **Real-time Telemetry Bento-Grid**: Tracks global arena density, average gate queue lines, active emergencies, transit load, and environmental sustainability scores with visual sparkline graphs.
*   **AI Auto-Dispatch & Routing Guide**: Powered by `gemini-3.5-flash` with JSON Structured Outputs. Operates as an automated triage dispatcher by matching incidents with the nearest available volunteer possessing the exact skills/languages needed. Outputs a professional mobile alert script and immediate safety instructions.
*   **Eco-Operations Optimizer**: Leverages Gemini AI to run a sustainability audit based on active gate congestion and transit loads, generating 3 dynamic tips to lower carbon offsets.

---

## 🛠️ Tech Stack & Architecture

-   **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, and responsive SVG visualizers.
-   **Backend**: Node.js, Express, and `@google/genai` TypeScript SDK.
-   **Generative AI**: Server-side `gemini-3.5-flash` utilizing:
    -   *Specialized System Instruction Roles* (customized for Fans, Volunteers, and Command staff contexts).
    -   *Structured JSON Schema Outputs* for type-safe volunteer assignment dispatch logic and ecology tips.
    -   *Lazy SDK Initialization* to prevent server start failures when keys are absent.

---

## 📌 Assumptions Made

1.  **Tournament Context**: The system assumes the match day corresponds to major matches in MetLife Stadium (New York New Jersey), Estadio Azteca (Mexico City), or BC Place Stadium (Vancouver) during the summer of 2026.
2.  **Sensors**: Live crowd telemetry (gate queues, density) is simulated dynamically using mild state updates to represent a constant stream of IoT stadium sensors.
3.  **Authentication**: Roles are fully accessible from a top selector to allow organizers and users to quickly trial the experience from all three participant perspectives.
4.  **Security**: All AI processing runs through server-side endpoints (`/api/gemini/*`) to ensure the user's `GEMINI_API_KEY` remains completely hidden from the browser.
