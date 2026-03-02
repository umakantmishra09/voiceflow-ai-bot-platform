import os
from dotenv import load_dotenv
from server.bot import TelegramBot

# Load environment variables
load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    gemini_key = os.getenv("GEMINI_API_KEY")

    if not token or not gemini_key:
        print("Error: TELEGRAM_BOT_TOKEN and GEMINI_API_KEY must be set in .env file")
        return

    print("VoiceFlow AI Bot is starting...")
    bot = TelegramBot(token, gemini_key)
    bot.run()

if __name__ == "__main__":
    main()
