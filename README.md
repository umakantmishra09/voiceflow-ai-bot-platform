# VoiceFlow AI - Open Source Voice Bot Platform

VoiceFlow AI is a powerful, open-source platform for building and managing AI voice/text bots using 100% free tools. It features Telegram integration, Google Gemini 1.5 Flash, local Whisper STT, and Coqui TTS.

## 🚀 Features

- **Telegram Integration**: Chat via voice or text messages.
- **Gemini 1.5 Flash**: Multi-turn AI brain for high-speed, accurate responses.
- **Local STT/TTS**: Uses OpenAI Whisper (local) and Coqui TTS for zero-cost voice processing.
- **Lead Management**: Automated lead scoring and pipeline management.
- **Campaigns**: Run automated outreach campaigns via AI.
- **Dashboard**: Professional FastAPI + React dashboard for monitoring and control.

## 🛠️ Local Setup

### 1. Prerequisites

- Python 3.10+
- Node.js & npm (for the dashboard)
- [FFmpeg](https://ffmpeg.org/download.html) (required for audio processing)

### 2. Get API Keys

- **Google Gemini API Key**:
  1. Go to [Google AI Studio](https://aistudio.google.com/).
  2. Click on "Get API key".
  3. Create a new API key.
- **Telegram Bot Token**:
  1. Message [@BotFather](https://t.me/botfather) on Telegram.
  2. Run `/newbot` and follow the instructions to get your token.

### 3. Backend Installation

```bash
cd server
pip install -r requirements.txt
```

Create a `.env` file in the `server` directory:
```env
TELEGRAM_BOT_TOKEN=your_telegram_token
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Platform

**Start the FastAPI Dashboard:**
```bash
python main.py
```

**Start the Telegram Bot:**
```bash
python bot_runner.py
```

**Start the React Dashboard (separate terminal):**
```bash
npm install
npm run dev
```

## 📂 Project Structure

- `server/`: Python backend logic.
  - `database/`: SQLite management.
  - `utils/`: Gemini and AI utilities.
  - `modules/`: Feature-specific modules (FAQ, Leads, etc.).
- `src/`: React Dashboard frontend.
- `database/`: SQLite database storage.

## 📝 Modules

- **FAQ Support**: Intelligent response to common customer queries.
- **Lead Scoring**: Automatically qualifies leads based on conversation sentiment and intent.
- **Escalation Flow**: Detects negative sentiment or complex queries and alerts human agents.

## ⚖️ License

MIT License. Free to use, modify, and distribute.
