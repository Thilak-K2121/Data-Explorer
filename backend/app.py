# backend/app.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import json
import io

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/visualize")
async def visualize_csv(file: UploadFile = File(...)):
    try:
        # Read the uploaded CSV file in-memory
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading or parsing CSV file: {e}")

    # --- Intelligent Column Identification ---
    numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
    date_col = None
    for col in df.select_dtypes(include=['object']).columns:
        try:
            # Attempt to convert column to datetime
            temp_col = pd.to_datetime(df[col], errors='coerce')
            # If conversion is successful (less than 50% NaT), identify it as date column
            if temp_col.notna().sum() / len(temp_col) > 0.5:
                date_col = col
                df[date_col] = temp_col # Convert the actual column
                break
        except Exception:
            continue

    if not numeric_cols:
        raise HTTPException(status_code=400, detail="No numeric columns found to visualize.")

    # --- Dynamic Chart Generation ---
    layout_theme = {
        'font': {'color': '#00ffff'}, 'title_font': {'color': '#00ffff', 'size': 20},
        'paper_bgcolor': 'rgba(0,0,0,0)', 'plot_bgcolor': 'rgba(0,0,0,0.3)',
        'xaxis': {'gridcolor': 'rgba(0, 255, 255, 0.2)'}, 'yaxis': {'gridcolor': 'rgba(0, 255, 255, 0.2)'},
    }
    
    charts_list = []

    # 1. Line plots if a date column is found
    if date_col:
        df_sorted = df.sort_values(by=date_col)
        for num_col in numeric_cols:
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df_sorted[date_col], y=df_sorted[num_col], mode='lines', name=num_col))
            fig.update_layout(title=f'Trend of {num_col} over {date_col}', **layout_theme)
            charts_list.append(json.loads(fig.to_json()))

    # 2. Histograms for numeric column distributions
    for num_col in numeric_cols:
        fig = go.Figure()
        fig.add_trace(go.Histogram(x=df[num_col], name=num_col, marker_color='#00ffff'))
        fig.update_layout(title=f'Distribution of {num_col}', **layout_theme)
        charts_list.append(json.loads(fig.to_json()))

    # 3. Correlation Heatmap if there are multiple numeric columns
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        fig_heatmap = go.Figure(data=go.Heatmap(
            z=corr_matrix.values,
            x=corr_matrix.columns,
            y=corr_matrix.columns,
            colorscale='Viridis',
            text=corr_matrix.round(2).values,
            texttemplate="%{text}"
        ))
        fig_heatmap.update_layout(title="Numeric Column Correlation Heatmap", **layout_theme)
        charts_list.append(json.loads(fig_heatmap.to_json()))

    # Return the list of generated charts
    return {"charts": charts_list, "fileName": file.filename}