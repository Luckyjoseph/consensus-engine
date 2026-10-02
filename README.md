# ⚡ LLM Consensus Engine

> A high-throughput, multi-model evaluation dashboard built on top of the **TarqaAI Unified AI Gateway**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)
![TarqaAI](https://img.shields.io/badge/Gateway-TarqaAI-orange.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

---

## 🎯 Overview

Building applications with Large Language Models often leads to provider lock-in and fragmentation—every LLM provider introduces unique SDKs, authentication schemes, and pricing structures.

The **LLM Consensus Engine** solves this problem by utilizing **[TarqaAI](https://tarqaai.com)** as a unified API proxy. With a single standard SDK client and a single API key, this tool:

1. **Dispatches parallel queries** to two competing models (e.g., `gemini-2.5-flash` vs. `gpt-4o-mini`) via `Promise.all()`.
2. **Measures live generation latency** for each provider side-by-side.
3. **Pipes candidate outputs to an Arbiter Judge model**, which critiques discrepancies and synthesizes a concise, definitive "Gold Standard" answer.

---

## ✨ Features

- **Dynamic Model Discovery:** Automatically queries TarqaAI's `/v1/models` endpoint on load to populate all available models for your account.
- **Side-by-Side Comparison:** Visually audit response differences, nuances, and edge-case behavior across diverse LLM families.
- **Automated Arbiter & Critique:** An independent LLM judge flags inaccuracies and provides a structured consensus under 150 words.
- **Latency Benchmarking:** Displays live millisecond response timing badges for every query.
- **Zero Provider Lock-in:** Implements the official OpenAI specification—switch endpoints or add providers without refactoring application logic.

---

## 🏗️ Architecture

             ┌────────────────────────────────┐
             │       Browser Dashboard        │
             └───────────────┬────────────────┘
                             │ POST /api/consensus
                             ▼
             ┌────────────────────────────────┐
             │     Express Backend Server     │
             └───────────────┬────────────────┘
                             │ TarqaAI Gateway
               ┌─────────────┴─────────────┐
               ▼                           ▼
    ┌─────────────────────┐     ┌─────────────────────┐
    │ Candidate Model A   │     │  Candidate Model B  │
    │ (e.g. Gemini Flash) │     │  (e.g. GPT-4o-mini) │
    └──────────┬──────────┘     └──────────┬──────────┘
               │                           │
               └─────────────┬─────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Arbiter / Judge     │
                 │  (Structured Verdict) │
                 └───────────────────────┘

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- A free [TarqaAI](https://tarqaai.com) account and API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_GITHUB_USERNAME/consensus-engine.git](https://github.com/YOUR_GITHUB_USERNAME/consensus-engine.git)
   cd consensus-engine
Install dependencies:

Bash
npm install
Configure environment variables:
Create a .env file in the project root:

Code snippet
PORT=3000
TARQA_API_KEY=your_tarqa_api_key_here
TARQA_BASE_URL=[https://api.tarqaai.com/v1](https://api.tarqaai.com/v1)
Start the server:

Bash
npm start
Open the application:
Navigate to http://localhost:3000 in your browser.

🛠️️ Tech Stack
Backend: Node.js, Express.js

LLM Gateway: TarqaAI (openai SDK client)

Frontend: Vanilla JavaScript, HTML5, Tailwind CSS (CDN), Marked.js

Deployment: Render / Railway

🔑 Bringing Your Own Keys (BYOK)
TarqaAI provides managed access to Google Gemini models directly. To test proprietary models from OpenAI (gpt-4o, gpt-4o-mini) or Anthropic (claude-3-5-sonnet):

Head to your TarqaAI Dashboard.

Navigate to Settings > Provider Keys (or BYOK).

Add your personal provider keys. All calls routed through this app will immediately unlock those models without altering a single line of application code.

📄 License
This project is licensed under the MIT License.