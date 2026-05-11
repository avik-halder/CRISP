# CRISP - Explainable Crime Risk Forecasting System

CRISP is an explainable stacked hybrid framework for crime risk forecasting in Bangladesh. It combines historical crime data, time-series feature engineering, machine learning models, risk classification, SHAP-based explainability, and an interactive dashboard for crime risk visualization.

---

## Features

- Crime risk forecasting
- Monthly crime trend analysis
- District or police-unit-based prediction
- Time-series feature engineering
- Lag and rolling average features
- Machine learning-based crime prediction
- Stacked hybrid risk modeling
- Low, Medium, and High risk classification
- SHAP-based Explainable AI
- Interactive crime risk map
- FastAPI backend
- React frontend dashboard
- SQLite database storage
- Leaflet-based geographic visualization

---

## Tech Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLite
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- SHAP
- Joblib

### Frontend

- React
- JavaScript
- Tailwind CSS
- Axios
- Leaflet
- React Leaflet

---

## Project Overview

The system predicts future crime risk using historical monthly crime records. It calculates time-series features such as previous crime counts, moving averages, and trend scores. A machine learning model predicts next-month crime counts, and a stacked hybrid risk model converts the prediction into interpretable crime risk levels.

The dashboard allows users to visualize predicted crime risk across different districts or police units using an interactive map.

---

## Dataset

The dataset is based on monthly crime reports from Bangladesh Police covering multiple police units and crime categories.

The research dataset includes:

- Monthly crime records
- 17 police units
- Crime data from 2019 to 2026
- Crime categories such as robbery, murder, theft, burglary, kidnapping, riot, and others

---

## Machine Learning Approach

The framework uses time-series features such as:

- Lag-1 crime count
- Lag-2 crime count
- Lag-3 crime count
- 3-month moving average
- 6-month moving average
- Trend score
- Previous risk score
- Month-based seasonal information

Candidate models include:

- Random Forest
- Extra Trees
- Gradient Boosting
- HistGradientBoosting
- Ridge Regression
- XGBoost
- ETS
- SARIMA
- Drift
- Seasonal Naive

Random Forest achieved the best Layer-1 forecasting performance in the research evaluation.

---

## Model Performance

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| Random Forest | 86.18 | 138.83 | 0.9717 |
| Gradient Boosting | 86.36 | 142.43 | 0.9702 |
| HistGradientBoosting | 90.15 | 142.65 | 0.9701 |
| XGBoost | 90.98 | 145.19 | 0.9691 |
| Ridge | 99.74 | 145.67 | 0.9689 |

---

## Explainable AI

SHAP is used to explain the model predictions and identify the most important factors influencing crime risk.

Important features include:

- 6-month moving average
- 3-month moving average
- Lag-1 crime count
- Month
- Lag-2 crime count
- Lag-3 crime count
- Police unit information

---

## Project Structure

```bash
Crime-Risk-Forecasting/
│
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── models.py
│   ├── inference.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Backend Setup

```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

---

## Run Backend

```bash
python -m uvicorn app:app --reload
```

Backend will run at:

```bash
http://127.0.0.1:8000
```

API documentation:

```bash
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

## API Endpoints

### District Data

```bash
GET /districts
```

Returns available districts or police units with latitude and longitude.

### Crime Risk Prediction

```bash
POST /predict
```

Example request:

```json
{
  "district": "Dhaka",
  "year": 2025,
  "month": 7
}
```

### Risk Map

```bash
GET /risk_map?year=2025&month=7
```

Returns crime risk data for map visualization.

---

## Example Prediction Output

```json
{
  "district": "Dhaka",
  "year": 2025,
  "month": 7,
  "new_risk": 0.74,
  "risk_class": "High",
  "trend_score": 0.18,
  "ml_prediction_next_crime": 1234
}
```

---

## Research Purpose

This project aims to support data-driven crime monitoring and proactive policing by forecasting crime risk levels and providing interpretable insights for decision-making.

---

## Future Work

- Add larger and more detailed crime datasets
- Include socioeconomic and environmental factors
- Improve spatial-temporal modeling
- Add advanced deep learning models
- Expand dashboard analytics
- Deploy as a real-time crime monitoring system

---

## License

This project is licensed under the MIT License.