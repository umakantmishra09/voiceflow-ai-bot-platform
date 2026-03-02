import os
import sqlite3
from typing import List, Dict, Any
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path: str = "database/voiceflow.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Conversations
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    username TEXT,
                    channel TEXT DEFAULT 'telegram',
                    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    summary TEXT,
                    lead_score INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active'
                )
            ''')

            # Messages
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER,
                    role TEXT, -- 'user' or 'assistant'
                    content TEXT,
                    type TEXT DEFAULT 'text', -- 'text' or 'voice'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                )
            ''')

            # Leads
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS leads (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER,
                    name TEXT,
                    email TEXT,
                    phone TEXT,
                    score INTEGER,
                    interest_level TEXT,
                    status TEXT DEFAULT 'new',
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
                )
            ''')

            # Campaigns
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS campaigns (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    status TEXT DEFAULT 'draft',
                    total_targets INTEGER DEFAULT 0,
                    completed_targets INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.commit()

    def add_message(self, conversation_id: int, role: str, content: str, msg_type: str = 'text'):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO messages (conversation_id, role, content, type) VALUES (?, ?, ?, ?)",
                (conversation_id, role, content, msg_type)
            )
            cursor.execute(
                "UPDATE conversations SET last_interaction = CURRENT_TIMESTAMP WHERE id = ?",
                (conversation_id,)
            )
            conn.commit()

    def get_or_create_conversation(self, user_id: str, username: str = None) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM conversations WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return row[0]
            
            cursor.execute(
                "INSERT INTO conversations (user_id, username) VALUES (?, ?)",
                (user_id, username)
            )
            conn.commit()
            return cursor.lastrowid

    def get_all_conversations(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM conversations ORDER BY last_interaction DESC")
            return [dict(row) for row in cursor.fetchall()]

    def get_messages(self, conversation_id: int) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,))
            return [dict(row) for row in cursor.fetchall()]

db = DatabaseManager()
