import logging
import os
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters
from .utils.gemini import GeminiAI
from .database.manager import db

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

class TelegramBot:
    def __init__(self, token: str, gemini_api_key: str):
        self.token = token
        self.ai = GeminiAI(gemini_api_key)
        self.app = ApplicationBuilder().token(token).build()
        self._setup_handlers()

    def _setup_handlers(self):
        self.app.add_handler(CommandHandler('start', self._start))
        self.app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), self._handle_text))
        self.app.add_handler(MessageHandler(filters.VOICE, self._handle_voice))

    async def _start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        db.get_or_create_conversation(str(user.id), user.username)
        await update.message.reply_text(f"Hi {user.first_name}! I am VoiceFlow AI. How can I help you today?")

    async def _handle_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = str(update.effective_user.id)
        conv_id = db.get_or_create_conversation(user_id)
        text = update.message.text

        db.add_message(conv_id, 'user', text)
        
        # Get history for Gemini
        history = []
        messages = db.get_messages(conv_id)
        for m in messages[-10:]: # Last 10 messages
            role = 'user' if m['role'] == 'user' else 'model'
            history.append({"role": role, "parts": [m['content']]})

        # Get AI response
        response = await self.ai.get_response(text, history)
        
        db.add_message(conv_id, 'assistant', response)
        await update.message.reply_text(response)

    async def _handle_voice(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        # Placeholder for local Whisper STT
        await update.message.reply_text("Voice received! (Local Whisper STT processing is integrated in the full package)")

    def run(self):
        self.app.run_polling()
