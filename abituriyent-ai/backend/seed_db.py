#!/usr/bin/env python3
"""
Database seeding script.
Run this to initialize/populate the SQLite database.
"""
from database import seed_database

if __name__ == "__main__":
    print("Seeding database...")
    seed_database()
    print("Done!")
