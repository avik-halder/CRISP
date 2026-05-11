from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import init_db, get_conn
from models import get_last_n_cases, get_last_risk, compute_features_from_history, upsert_risk
from inference import predict_from_features, load_artifacts

app = FastAPI(title="Crime Risk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    load_artifacts()

class PredictRequest(BaseModel):
    district: str
    year: int
    month: int

@app.get("/districts")
def districts():
    conn = get_conn()
    rows = conn.execute("SELECT name, lat, lng FROM districts ORDER BY name").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/predict")
def predict(req: PredictRequest):
    # history from DB (previous months)
    history = get_last_n_cases(req.district, req.year, req.month, n=6)
    if len(history) < 3:
        raise HTTPException(status_code=400, detail="Not enough history (need at least 3 months).")

    lag_1, lag_2, lag_3, ma_3, ma_6 = compute_features_from_history(history)
    last_risk = get_last_risk(req.district, req.year, req.month)

    out = predict_from_features(
        district=req.district,
        month=req.month,
        lag_1=lag_1, lag_2=lag_2, lag_3=lag_3,
        ma_3=ma_3, ma_6=ma_6,
        last_risk=last_risk
    )

    # store so next month can use as last_risk
    upsert_risk(req.district, req.year, req.month, out)
    return out

@app.get("/risk_map")
def risk_map(year: int, month: int):
    """
    Returns marker data for map:
    district, lat/lng, risk_class, new_risk, trend_score, ml_prediction_next_crime
    """
    conn = get_conn()
    rows = conn.execute("""
      SELECT d.name as district, d.lat, d.lng,
             r.new_risk, r.risk_class, r.trend_score, r.ml_prediction_next_crime
      FROM districts d
      LEFT JOIN risk_monthly r
        ON r.district = d.name AND r.year = ? AND r.month = ?
      ORDER BY d.name
    """, (year, month)).fetchall()
    conn.close()
    return [dict(r) for r in rows]