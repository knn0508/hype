"""
SQLite Database initialization and connection management.
"""
import sqlite3
import json
import os
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "data" / "abituriyent.db"

# Mapping of exam groups to JSON files (using user's existing files)
GROUP_FILES = {
    1: Path(__file__).parent.parent / "major_datas_1.json",
    2: Path(__file__).parent.parent / "major_datas_2.json",
    3: Path(__file__).parent.parent / "major_datas_3.json",
    4: Path(__file__).parent.parent / "major_datas_4.json",
    5: Path(__file__).parent.parent / "major_datas_5.json",
}


def get_connection() -> sqlite3.Connection:
    """Get database connection with row factory."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """Initialize database schema."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS majors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            major_name TEXT NOT NULL,
            attributes_json TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exam_group INTEGER NOT NULL,
            top_major TEXT NOT NULL,
            match_percentage REAL NOT NULL,
            ai_review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_group_id ON majors(group_id)
    """)

    conn.commit()
    conn.close()


def seed_database():
    """Seed database with major data from JSON files."""
    init_database()
    conn = get_connection()
    cursor = conn.cursor()

    # Clear existing data
    cursor.execute("DELETE FROM majors")

    for group_id, json_path in GROUP_FILES.items():
        if not json_path.exists():
            print(f"Warning: JSON file not found: {json_path}")
            continue

        with open(json_path, "r", encoding="utf-8") as f:
            majors = json.load(f)

        for major in majors:
            major_name = major.get("major")
            # Handle both 'attributes' and 'attributes_importance' keys
            attributes = major.get("attributes") or major.get("attributes_importance") or {}

            cursor.execute(
                "INSERT INTO majors (group_id, major_name, attributes_json) VALUES (?, ?, ?)",
                (group_id, major_name, json.dumps(attributes, ensure_ascii=False))
            )

    conn.commit()
    conn.close()
    print(f"Database seeded successfully at {DB_PATH}")


def get_all_attributes() -> list:
    """Get all unique attribute keys from all majors."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT attributes_json FROM majors")
    rows = cursor.fetchall()
    conn.close()

    all_attrs = set()
    for row in rows:
        attrs = json.loads(row[0])
        all_attrs.update(attrs.keys())

    return sorted(list(all_attrs))


def get_attributes_for_group(group_id: int) -> list:
    """Get attribute keys for a specific exam group."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT attributes_json FROM majors WHERE group_id = ?", (group_id,))
    rows = cursor.fetchall()
    conn.close()

    all_attrs = set()
    for row in rows:
        attrs = json.loads(row[0])
        all_attrs.update(attrs.keys())

    return sorted(list(all_attrs))


def get_majors_for_group(group_id: int) -> list:
    """Get all majors for a specific exam group."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, major_name, attributes_json FROM majors WHERE group_id = ?",
        (group_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "major_name": row[1],
            "attributes": json.loads(row[2])
        }
        for row in rows
    ]

def get_user_by_email(email: str) -> dict[str, Any] | None:
    """Retrieve user by email."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(name: str, email: str, hashed_password: str) -> dict[str, Any] | None:
    """Create a new user."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)",
            (name, email, hashed_password)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return None
    
    # get user
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def save_result(user_id: int, exam_group: int, top_major: str, match_percentage: float, ai_review: str) -> dict[str, Any] | None:
    """Save a career analysis result for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO results (user_id, exam_group, top_major, match_percentage, ai_review) VALUES (?, ?, ?, ?, ?)",
        (user_id, exam_group, top_major, match_percentage, ai_review)
    )
    conn.commit()
    
    result_id = cursor.lastrowid
    cursor.execute("SELECT * FROM results WHERE id = ?", (result_id,))
    result = cursor.fetchone()
    conn.close()
    return dict(result) if result else None

def get_user_results(user_id: int) -> list:
    """Get all saved results for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
