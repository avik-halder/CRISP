import os
import joblib
import numpy as np
import pandas as pd

ART_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

_layer1 = None
_trend_scaler = None
_risk_scaler = None
_meta_art = None
_meta_model = None

def load_artifacts():
    global _layer1, _trend_scaler, _risk_scaler, _meta_art, _meta_model
    if _layer1 is not None:
        return

    _layer1 = joblib.load(os.path.join(ART_DIR, "layer1_best_model.joblib"))
    _trend_scaler = joblib.load(os.path.join(ART_DIR, "trend_scaler.joblib"))
    _risk_scaler = joblib.load(os.path.join(ART_DIR, "risk_scaler.joblib"))
    _meta_art = joblib.load(os.path.join(ART_DIR, "meta_weights.joblib"))
    _meta_model = _meta_art["meta_model"]

def _classify(new_risk: float) -> str:
    t1 = float(_meta_art.get("best_t1", 0.33))
    t2 = float(_meta_art.get("best_t2", 0.66))
    if new_risk < t1:
        return "Low"
    elif new_risk < t2:
        return "Medium"
    else:
        return "High"

def predict_from_features(
    district: str,
    month: int,
    lag_1: float, lag_2: float, lag_3: float,
    ma_3: float, ma_6: float,
    last_risk: float | None,
):
    """
    Inputs must be ready (lags/MA computed in backend from DB).
    last_risk should be 0-1 (previous predicted new_risk).
    """
    load_artifacts()

    # Layer-1 features: MUST match training feature names
    district_col = _meta_art["district_col"]
    X = pd.DataFrame([{
        district_col: district,
        "lag_1": lag_1,
        "lag_2": lag_2,
        "lag_3": lag_3,
        "ma_3": ma_3,
        "ma_6": ma_6,
        "month": month
    }])

    ml_pred = float(_layer1.predict(X)[0])

    eps = 1e-9
    trend_raw = (ma_3 - ma_6) / (abs(ma_6) + eps)
    trend_score = float(_trend_scaler.transform([[trend_raw]])[0, 0])

    # Convert predicted crime count -> risk space (0-1), using numpy to avoid col-name mismatch
    ml_pred_risk = float(_risk_scaler.transform(np.array([[ml_pred]], dtype=float))[0, 0])

    # last_risk handling (first prediction case)
    if last_risk is None or (isinstance(last_risk, float) and np.isnan(last_risk)):
        last_risk = ml_pred_risk

    last_risk = float(last_risk)
    # if someone accidentally passes count, normalize
    if last_risk > 1.0:
        last_risk = float(_risk_scaler.transform(np.array([[last_risk]], dtype=float))[0, 0])

    raw = float(_meta_model.predict(np.array([[ml_pred_risk, trend_score, last_risk]], dtype=float))[0])
    new_risk = max(0.0, min(1.0, raw))

    risk_class = _classify(new_risk)

    return {
        "ml_prediction_next_crime": ml_pred,
        "trend_score": trend_score,
        "new_risk": new_risk,
        "risk_class": risk_class
    }