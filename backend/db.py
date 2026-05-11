import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.sqlite"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS crime_monthly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      total_case REAL NOT NULL,
      UNIQUE(district, year, month)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS risk_monthly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      ml_prediction_next_crime REAL,
      trend_score REAL,
      new_risk REAL,
      risk_class TEXT,
      UNIQUE(district, year, month)
    );
    """)

    conn.commit()
    conn.close()