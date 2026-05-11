import pandas as pd
from db import init_db, get_conn

CSV_PATH = "crime_data_combined.csv"   # ensure the CSV is inside backend/
DISTRICT_COL = "Unit"
YEAR_COL = "Year"
MONTH_COL = "Month"
TARGET_COL = "Total Case"

MONTH_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

def parse_month_to_int(x):
    if pd.isna(x):
        return None
    s = str(x).strip()

    # If it's already numeric like "1" or 1
    try:
        m = int(float(s))
        if 1 <= m <= 12:
            return m
    except:
        pass

    # Otherwise month name like "January"
    key = s.lower()
    return MONTH_MAP.get(key)

def main():
    init_db()
    df = pd.read_csv(CSV_PATH)

    # keep only necessary columns
    df = df[[DISTRICT_COL, YEAR_COL, MONTH_COL, TARGET_COL]].copy()

    # clean district
    df[DISTRICT_COL] = df[DISTRICT_COL].astype(str).str.strip()

    # year
    df[YEAR_COL] = pd.to_numeric(df[YEAR_COL], errors="coerce")

    # month (name -> int)
    df[MONTH_COL] = df[MONTH_COL].apply(parse_month_to_int)

    # target
    df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce").fillna(0.0)

    # drop rows with invalid year/month
    df = df.dropna(subset=[YEAR_COL, MONTH_COL])
    df[YEAR_COL] = df[YEAR_COL].astype(int)
    df[MONTH_COL] = df[MONTH_COL].astype(int)

    # aggregate duplicates per unit-month
    df = df.groupby([DISTRICT_COL, YEAR_COL, MONTH_COL], as_index=False)[TARGET_COL].sum()

    conn = get_conn()
    cur = conn.cursor()

    for _, r in df.iterrows():
        cur.execute("""
            INSERT INTO crime_monthly(district, year, month, total_case)
            VALUES(?,?,?,?)
            ON CONFLICT(district, year, month) DO UPDATE SET
              total_case=excluded.total_case
        """, (r[DISTRICT_COL], int(r[YEAR_COL]), int(r[MONTH_COL]), float(r[TARGET_COL])))

    conn.commit()
    conn.close()

    print("Imported rows:", len(df))
    print("Unique units:", df[DISTRICT_COL].nunique())
    print("Year range:", df[YEAR_COL].min(), "-", df[YEAR_COL].max())
    print("Month min/max:", df[MONTH_COL].min(), "-", df[MONTH_COL].max())

if __name__ == "__main__":
    main()