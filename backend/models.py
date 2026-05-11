from db import get_conn
import numpy as np

def get_last_n_cases(district: str, year: int, month: int, n: int = 6):
    """
    Get last n months total_case BEFORE (year,month), ordered newest->oldest.
    """
    conn = get_conn()
    cur = conn.cursor()

    # Convert year-month to sortable integer
    target_key = year * 100 + month

    rows = cur.execute("""
        SELECT year, month, total_case
        FROM crime_monthly
        WHERE district = ?
          AND (year * 100 + month) < ?
        ORDER BY (year * 100 + month) DESC
        LIMIT ?
    """, (district, target_key, n)).fetchall()

    conn.close()
    return [float(r["total_case"]) for r in rows]  # newest -> oldest

def get_last_risk(district: str, year: int, month: int):
    conn = get_conn()
    cur = conn.cursor()
    target_key = year * 100 + month
    row = cur.execute("""
        SELECT new_risk
        FROM risk_monthly
        WHERE district = ?
          AND (year * 100 + month) < ?
        ORDER BY (year * 100 + month) DESC
        LIMIT 1
    """, (district, target_key)).fetchone()
    conn.close()
    return None if row is None else float(row["new_risk"])

def upsert_risk(district: str, year: int, month: int, out: dict):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO risk_monthly(district, year, month, ml_prediction_next_crime, trend_score, new_risk, risk_class)
        VALUES(?,?,?,?,?,?,?)
        ON CONFLICT(district, year, month) DO UPDATE SET
          ml_prediction_next_crime=excluded.ml_prediction_next_crime,
          trend_score=excluded.trend_score,
          new_risk=excluded.new_risk,
          risk_class=excluded.risk_class
    """, (district, year, month, out["ml_prediction_next_crime"], out["trend_score"], out["new_risk"], out["risk_class"]))
    conn.commit()
    conn.close()

def compute_features_from_history(history_newest_first: list[float]):
    """
    history_newest_first: [lag_1, lag_2, lag_3, lag_4, lag_5, lag_6] if available
    """
    if len(history_newest_first) < 3:
        raise ValueError("Need at least 3 months history to compute lag_1..lag_3")

    lag_1 = history_newest_first[0]
    lag_2 = history_newest_first[1]
    lag_3 = history_newest_first[2]

    last3 = history_newest_first[:3]
    ma_3 = float(np.mean(last3))

    last6 = history_newest_first[:6] if len(history_newest_first) >= 6 else history_newest_first
    ma_6 = float(np.mean(last6))

    return lag_1, lag_2, lag_3, ma_3, ma_6