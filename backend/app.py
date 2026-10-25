from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import numpy as np
import pandas as pd
from joblib import load


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARTIFACTS_DIR = os.path.join(BASE_DIR, 'artifacts')
MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'model.joblib')
SCHEMA_PATH = os.path.join(ARTIFACTS_DIR, 'feature_schema.json')
CATEGORY_VALUES_PATH = os.path.join(ARTIFACTS_DIR, 'category_values.json')
DASHBOARD_PATH = os.path.join(ARTIFACTS_DIR, 'dashboard.json')


app = Flask(__name__)
CORS(app)

model = load(MODEL_PATH)
with open(SCHEMA_PATH, 'r') as f:
    feature_schema = json.load(f)

category_values = {}
if os.path.exists(CATEGORY_VALUES_PATH):
    with open(CATEGORY_VALUES_PATH, 'r') as f:
        category_values = json.load(f)


def apply_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # ltv_cac_ratio
    if {'ltv_usd', 'cac_usd'}.issubset(df.columns):
        df['ltv_cac_ratio'] = df['ltv_usd'] / (df['cac_usd'] + 1e-6)
    # startup_age
    if 'founding_year' in df.columns:
        df['startup_age'] = 2025 - df['founding_year']
    # is_profitable
    if 'profit_margin_pct' in df.columns:
        df['is_profitable'] = (df['profit_margin_pct'] > 0).astype(int)
    # high_growth (approximate using median if not available from training)
    if 'monthly_growth_rate_pct' in df.columns:
        median_growth = df['monthly_growth_rate_pct'].median()
        df['high_growth'] = (df['monthly_growth_rate_pct'] > median_growth).astype(int)
    return df


@app.route('/')
def root():
    return jsonify({'status': 'ok', 'message': 'Startup Success API'}), 200

@app.route('/api/dashboard')
def api_dashboard():
    if not os.path.exists(DASHBOARD_PATH):
        return jsonify({'error': 'dashboard.json not found. Please run the notebook export cell.'}), 404
    with open(DASHBOARD_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

@app.route('/download-notebook')
def download_notebook():
    # serve executed notebook if present else the main one
    nb_name = 'Predicting Startup Success - executed.ipynb'
    if not os.path.exists(os.path.join(BASE_DIR, nb_name)):
        nb_name = 'Predicting Startup Success.ipynb'
    return send_from_directory(BASE_DIR, nb_name, as_attachment=True)


@app.route('/predict', methods=['POST'])
def predict():
    payload = request.get_json(force=True)
    if isinstance(payload, dict) and 'instances' in payload:
        rows = payload['instances']
    else:
        rows = [payload]

    X = pd.DataFrame(rows)
    X_fe = apply_feature_engineering(X)

    # Ensure all expected columns exist; add missing with NaN
    expected_cols = feature_schema.get('all_input_features', [])
    for col in expected_cols:
        if col not in X_fe.columns:
            X_fe[col] = np.nan
    X_fe = X_fe[expected_cols]

    preds = model.predict(X_fe)
    if hasattr(model, 'predict_proba'):
        probas = model.predict_proba(X_fe)[:, 1].tolist()
    else:
        probas = [float(p) for p in preds]

    return jsonify({
        'predictions': [int(p) for p in preds],
        'probabilities': probas
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


