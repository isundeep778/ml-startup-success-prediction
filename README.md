## Startup Success Predictor

### How to run

1. Open the notebook `Predicting Startup Success.ipynb` and run all cells to train and export artifacts. Ensure an `artifacts/` folder is created with `model.joblib`, `feature_schema.json`, and `category_values.json`.
2. Install dependencies:
   
   ```bash
   pip install -r requirements.txt
   ```

3. Start the web app:
   
   ```bash
   python backend/app.py
   ```

4. React frontend (new):
   - Open a new terminal in `frontend/` and run:
     ```bash
     npm install
     npm run dev
     ```
   - Frontend runs on `http://localhost:5173` and talks to Flask `http://127.0.0.1:5000`.

5. API endpoints:
   - `POST /predict` – JSON with feature fields → predictions
   - `GET /api/dashboard` – metrics for dashboard charts

Notes:
- If you retrain the model, re-run the export cell to refresh artifacts.
- The backend applies the same feature engineering steps as the notebook.

