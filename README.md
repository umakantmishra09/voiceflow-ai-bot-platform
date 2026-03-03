# VoiceFlow AI - Full-Stack AI Bot OS

VoiceFlow AI is a professional, open-source platform for building and managing AI voice/text bots using free tools. This version is a fully functional full-stack implementation with a React dashboard and an Express.js/SQLite backend.

## 🚀 Key Features

- **Gemini 1.5 Flash Integration**: Multi-turn AI chat with real-time lead scoring.
- **Twilio Calling**: Real outbound dialing and inbound call handling via AI.
- **Web Speech API**: Browser-based Speech-to-Text (STT) and Text-to-Speech (TTS).
- **Lead Pipeline**: Automated lead qualification and CRM management.
- **Campaigns**: Scheduled AI outreach via voice or text.
- **Escalations**: Human-in-the-loop system for handling complex or high-priority queries.
- **Dashboard**: Real-time stats, charts, and system monitoring.

## 🛠️ Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [FFmpeg](https://ffmpeg.org/) (optional, for advanced audio processing)

### 2. Get API Keys

- **Google Gemini API Key**:
  1. Go to [Google AI Studio](https://aistudio.google.com/).
  2. Click on "Get API key".
  3. Create a new API key.
- **Twilio Credentials**:
  1. Create an account at [Twilio](https://www.twilio.com/).
  2. Get your **Account SID** and **Auth Token** from the console.
  3. Buy or get a free **Twilio Phone Number**.
- **Telegram Bot Token**:
  1. Message [@BotFather](https://t.me/botfather) on Telegram.
  2. Run `/newbot` and follow the instructions to get your token.

### 3. Environment Setup

Create a `.env.local` file in the project root:
```env
VITE_BLINK_PROJECT_ID=your_project_id
VITE_BLINK_PUBLISHABLE_KEY=your_publishable_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_number
```

### 4. Run the Platform

**Start the Express.js Backend:**
```bash
node server/index.js
```

**Start the React Dashboard:**
```bash
npm install
npm run dev
```

## 📂 Project Structure

- `server/index.js`: Express.js server with SQLite database and AI/Twilio logic.
- `src/pages/`: React dashboard pages (Conversations, Leads, etc.).
- `src/lib/api.ts`: Centralized API utility for backend communication.
- `voiceflow.db`: SQLite database file (created on first run).

## 📝 Usage Tips
- **Conversations**: Use the Microphone button to talk to the AI.
- **Leads**: Any conversation with a score > 70 is automatically added to the pipeline.
- **Settings**: Use the "Test Connection" buttons to verify your API keys.

## ⚖️ License
MIT License. Built with ❤️ by Blink.