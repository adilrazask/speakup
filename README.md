# 🎙️ SpeakUp — AI English Coach & Interview Preparation Agent

> **Master workplace English, conquer job interviews, and build lasting career confidence.**  
> Tailored specifically for Indian working professionals (Operations, ERP, Logistics, Export-Import, Finance/Accounts, IT/Software, Freshers) with Indian accent support, real-time structured corrections, and bilingual explanations in Hindi/Telugu.

---

## 🌟 Key Features

1. **Free Conversation Coach (Talk Mode)**
   - Conversational AI coach (**Coach Priya**) who talks with you naturally, asks intelligent follow-up questions, and keeps the conversation flowing.
   - **Real-Time Structured Correction Cards**: Highlights mistakes in **red underline**, presents the **green corrected form**, and breaks down the grammatical rule in simple, encouraging language.
   - **Bilingual Explanations**: Instant "Explain in Hindi" (सरल हिन्दी) and "Explain in Telugu" (తెలుగు వివరణ) toggles.
   - **Indian English Tuning**: Detects and gently corrects common linguistic habits like *"I am having 3 years experience"* ➔ *"I have three years of experience"*, *"discuss about"* ➔ *"discuss"*, and *"revert back"* ➔ *"reply"*.

2. **Pluggable LLM Provider Architecture**
   - Built with an abstracted provider layer (`llm_provider.py`).
   - Defaults to **Google Gemini** (`gemini-2.5-flash`), switchable to **OpenAI** (`gpt-4o`), **Anthropic Claude** (`claude-3-5-sonnet`), or offline **MockLLM** simply by toggling `.env`.

3. **Spaced Repetition Flashcards (SM-2 Algorithm)**
   - One-click "Save to Cards" on any correction card to turn real mistakes into active recall drills.
   - Automatic SuperMemo-2 mathematical interval scheduling.

4. **Speech-to-Text & Text-to-Speech**
   - Browser Web Speech API configured for Indian English (`en-IN`).
   - Browser SpeechSynthesis with adjustable speed (0.7x to 1.3x) and dedicated "Slow Mode" for beginners.

---

## 🚀 Quick Start (Step-by-Step)

### Prerequisites
- **Node.js** (v18+ or v20+)
- **Python** (3.11, 3.12, 3.13, or 3.14)

---

### Step 1: Clone or Navigate to the Directory
```bash
cd /Users/adilraja/.gemini/antigravity/scratch/speakup
```

---

### Step 2: Configure Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your preferred LLM provider and API key:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
```
*(If no API key is set, SpeakUp automatically runs in offline **MockLLM** mode so you can test all features and UI flows without external dependencies).*

---

### Step 3: Start the Backend Server
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```
✅ Backend will start at: `http://localhost:8000`  
📖 Interactive Swagger API Docs at: `http://localhost:8000/docs`

---

### Step 4: Start the Frontend Application
In a separate terminal window:
```bash
npm install
npm run dev
```
✅ Web app will be running at: `http://localhost:3000`

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests (pytest)
Runs 14 automated tests covering database persistence, SuperMemo-2 math, pronunciation phonetic scoring, JSON repair, and LLM providers:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest -v
```

### End-to-End Browser Testing (Playwright)
Executes end-to-end browser user flows and records video evidence:
```bash
./backend/venv/bin/python tests_e2e_phase1.py
```

---

## 📂 Project Architecture

```
speakup/
├── .env.example               # Environment template
├── package.json               # Root orchestrator scripts
├── tests_e2e_phase1.py        # Playwright E2E browser test & video capture
├── docs/                      # Screenshots, recordings, and guides
│   ├── screenshots/
│   └── recordings/
├── backend/
│   ├── requirements.txt       # FastAPI, SQLAlchemy, Google-Genai, etc.
│   ├── generate_seed.py       # Seed dataset generator (150+ Qs, 100 vocab)
│   ├── prompts/               # Live editable agent prompts (*.md)
│   │   ├── coach.md           # Master conversation coach prompt
│   │   ├── interviewer.md     # In-character hiring manager prompt
│   │   ├── evaluator.md       # 7-dimension rubric scoring prompt
│   │   ├── builder.md         # STAR restructuring prompt
│   │   ├── writing.md         # Tracked changes writing prompt
│   │   └── qa.md              # Language Q&A prompt
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint & middleware
│   │   ├── core/              # Config, Async DB, LLM Provider Abstraction
│   │   ├── models/            # SQLAlchemy models (User, Correction, Interview, etc.)
│   │   ├── schemas/           # Pydantic schemas (CorrectionCard, Rubrics)
│   │   ├── services/          # Coach turn processor, SM-2 math, Pronunciation
│   │   └── api/v1/            # REST and WebSocket endpoints
│   └── tests/                 # Full pytest suite
└── frontend/
    ├── package.json           # Next.js 14, Tailwind CSS, Lucide Icons
    ├── tailwind.config.ts     # Dark/light theme & colors
    └── src/
        ├── app/               # Next.js App Router (talk, interview, etc.)
        ├── components/        # Sidebar, Header, CorrectionCard, MessageBubble
        ├── context/           # AuthContext & SettingsContext
        └── lib/               # Types & API client
```

---

## 🛠️ Switching LLM Providers

To switch the underlying model provider, simply edit `.env`:

| Provider | `.env` Configuration |
| :--- | :--- |
| **Google Gemini (Default)** | `LLM_PROVIDER=gemini`<br>`GEMINI_API_KEY=your_key` |
| **OpenAI** | `LLM_PROVIDER=openai`<br>`OPENAI_API_KEY=your_key` |
| **Anthropic Claude** | `LLM_PROVIDER=claude`<br>`ANTHROPIC_API_KEY=your_key` |
| **Offline Mock** | `LLM_PROVIDER=mock` *(Requires zero API keys)* |
