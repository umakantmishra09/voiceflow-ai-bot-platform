import os
import google.generativeai as genai
from typing import List, Dict

class GeminiAI:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def get_response(self, prompt: str, history: List[Dict[str, str]] = None) -> str:
        """
        Sends a prompt to Gemini 1.5 Flash and returns the response.
        History should be in the format [{"role": "user/model", "parts": [text]}]
        """
        chat = self.model.start_chat(history=history or [])
        response = chat.send_message(prompt)
        return response.text

    def get_lead_score(self, conversation_text: str) -> int:
        """
        Analyzes conversation to determine a lead score from 0-100.
        """
        prompt = f"Analyze the following conversation and return ONLY a single integer from 0 to 100 representing the user's interest level/lead quality: {conversation_text}"
        response = self.model.generate_content(prompt)
        try:
            return int(response.text.strip())
        except:
            return 0

    def summarize_conversation(self, conversation_text: str) -> str:
        """
        Generates a concise summary of the conversation.
        """
        prompt = f"Provide a one-sentence summary of this conversation: {conversation_text}"
        response = self.model.generate_content(prompt)
        return response.text.strip()
