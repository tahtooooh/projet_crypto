import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = joblib.load("ml_service/model.joblib")

FEATURE_KEYS = {
    "asset_id": "Asset_ID",
    "shipment_status": "Shipment_Status",
    "traffic_status": "Traffic_Status",
    "logistics_delay_reason": "Logistics_Delay_Reason",
    "temperature": "Temperature",
    "humidity": "Humidity",
    "waiting_time": "Waiting_Time",
    "inventory_level": "Inventory_Level",
    "asset_utilization": "Asset_Utilization",
    "demand_forecast": "Demand_Forecast",
    "user_transaction_amount": "User_Transaction_Amount",
    "user_purchase_frequency": "User_Purchase_Frequency",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "timestamp": "Timestamp",
}


def build_features(data):
    lat = float(data.get("latitude", 0))
    lng = float(data.get("longitude", 0))
    temp = float(data.get("temperature", 25))
    humidity = float(data.get("humidity", 50))
    wait = int(data.get("waiting_time", 0))
    inv = int(data.get("inventory_level", 0))
    util = float(data.get("asset_utilization", 50))
    demand = int(data.get("demand_forecast", 100))
    amount = int(data.get("user_transaction_amount", 0))
    freq = int(data.get("user_purchase_frequency", 0))
    ts_str = data.get("timestamp", "2024-01-01 12:00:00")

    try:
        ts = pd.to_datetime(ts_str)
    except Exception:
        ts = pd.to_datetime("2024-01-01 12:00:00")

    traffic = data.get("traffic_status", "Clear")
    shipment = data.get("shipment_status", "In Transit")
    delay_reason = data.get("logistics_delay_reason", "")
    asset = data.get("asset_id", "Truck_Unknown")

    features = {
        "Asset_ID": asset,
        "Latitude": lat,
        "Longitude": lng,
        "Inventory_Level": inv,
        "Shipment_Status": shipment,
        "Temperature": temp,
        "Humidity": humidity,
        "Traffic_Status": traffic,
        "Waiting_Time": wait,
        "User_Transaction_Amount": amount,
        "User_Purchase_Frequency": freq,
        "Logistics_Delay_Reason": delay_reason,
        "Asset_Utilization": util,
        "Demand_Forecast": demand,
        "timestamp_month": ts.month,
        "timestamp_day": ts.day,
        "timestamp_hour": ts.hour,
        "timestamp_weekday": ts.weekday(),
        "is_weekend": 1 if ts.weekday() >= 5 else 0,
        "is_night": 1 if ts.hour < 6 or ts.hour >= 22 else 0,
        "is_business_hours": 1 if 9 <= ts.hour <= 17 else 0,
        "hour_sin": np.sin(2 * np.pi * ts.hour / 24),
        "hour_cos": np.cos(2 * np.pi * ts.hour / 24),
        "month_sin": np.sin(2 * np.pi * ts.month / 12),
        "month_cos": np.cos(2 * np.pi * ts.month / 12),
        "abs_latitude": abs(lat),
        "abs_longitude": abs(lng),
        "distance_from_origin": np.sqrt(lat**2 + lng**2),
        "inventory_to_demand_ratio": inv / max(demand, 1),
        "inventory_minus_demand": inv - demand,
        "utilization_x_waiting": util * wait,
        "traffic_waiting_pressure": wait * (2 if traffic == "Heavy" else 1 if traffic == "Detour" else 0),
        "humidity_temperature_index": humidity * temp,
        "purchase_value_score": amount * freq,
        "is_heavy_traffic": 1 if traffic == "Heavy" else 0,
        "is_detour": 1 if traffic == "Detour" else 0,
        "is_clear_traffic": 1 if traffic == "Clear" else 0,
    }
    return pd.DataFrame([features])


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        df = build_features(data)

        pred = int(model.predict(df)[0])
        proba = model.predict_proba(df)[0].tolist()

        return jsonify({
            "prediction": pred,
            "label": "Retard" if pred == 1 else "Pas de retard",
            "probability_0": round(proba[0], 4),
            "probability_1": round(proba[1], 4),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/features", methods=["GET"])
def features():
    return jsonify({
        "input_fields": [
            {"key": "asset_id", "label": "Camion", "type": "select", "options": ["Truck_1","Truck_2","Truck_3","Truck_4","Truck_5","Truck_6","Truck_7","Truck_8","Truck_9","Truck_10"]},
            {"key": "shipment_status", "label": "Statut expedition", "type": "select", "options": ["In Transit","Delivered","Delayed","Out for Delivery","Pickup Scheduled","Pending"]},
            {"key": "traffic_status", "label": "Etat du trafic", "type": "select", "options": ["Clear","Heavy","Detour"]},
            {"key": "logistics_delay_reason", "label": "Raison du retard", "type": "select", "options": ["","Weather","Traffic","Customs","Mechanical","Staff","Documentation"]},
            {"key": "temperature", "label": "Temperature (°C)", "type": "number"},
            {"key": "humidity", "label": "Humidite (%)", "type": "number"},
            {"key": "waiting_time", "label": "Temps d'attente (min)", "type": "number"},
            {"key": "inventory_level", "label": "Niveau de stock", "type": "number"},
            {"key": "asset_utilization", "label": "Utilisation (%)", "type": "number"},
            {"key": "demand_forecast", "label": "Prevision de demande", "type": "number"},
            {"key": "user_transaction_amount", "label": "Montant transaction", "type": "number"},
            {"key": "user_purchase_frequency", "label": "Frequence d'achat", "type": "number"},
            {"key": "latitude", "label": "Latitude", "type": "number"},
            {"key": "longitude", "label": "Longitude", "type": "number"},
        ],
        "engineered_count": 35,
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
