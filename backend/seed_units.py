import pandas as pd
from db import init_db, get_conn

init_db()

df = pd.read_csv("locations.csv")

conn = get_conn()
cur = conn.cursor()

for _, r in df.iterrows():
    cur.execute("""
        INSERT INTO districts(name, lat, lng)
        VALUES(?,?,?)
        ON CONFLICT(name) DO UPDATE SET
          lat=excluded.lat,
          lng=excluded.lng
    """, (r["name"], float(r["lat"]), float(r["lng"])))

conn.commit()
conn.close()
print("Inserted/updated:", len(df))