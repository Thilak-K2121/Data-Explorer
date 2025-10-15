# backend/app.py

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import plotly.graph_objects as go
import json

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

@app.get("/api/stock")
def get_stock(nrows: int = Query(1000, gt=0)):
    try:
        df = pd.read_csv("dataset.csv").head(nrows)
    except FileNotFoundError:
        return {"error": "dataset.csv not found in the backend folder."}
        
    df['Date'] = pd.to_datetime(df['Date'])

    # Define a theme for the chart layout
    layout_theme = {
        'font': {'color': '#00ffff'},  # Cyan font color for all text
        'title_font': {'color': '#00ffff'} # Cyan font color for title
    }

    # --- Chart 1: Line Plot ---
    fig_line = go.Figure()
    fig_line.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Close',
        line={'color': '#00ffff'} # Make the line cyan too
    ))
    # UPDATED LINE: Added title and applied the font color theme
    fig_line.update_layout(title="Closing Price Over Time", **layout_theme)


    # --- Chart 2: Moving Average ---
    df['MA20'] = df['Close'].rolling(20).mean()
    fig_ma = go.Figure()
    fig_ma.add_trace(go.Scatter(x=df['Date'], y=df['Close'], mode='lines', name='Close'))
    fig_ma.add_trace(go.Scatter(x=df['Date'], y=df['MA20'], mode='lines', name='20-Day Moving Average'))
    # UPDATED LINE: Added title and applied the font color theme
    fig_ma.update_layout(title="Closing Price vs. 20-Day MA", **layout_theme)


    # --- Chart 3: Candlestick ---
    fig_candle = go.Figure(data=[go.Candlestick(
        x=df['Date'],
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close']
    )])
    # UPDATED LINE: Added title and applied the font color theme
    fig_candle.update_layout(title="OHLC Candlestick Chart", **layout_theme)

    
    line_plot_dict = json.loads(fig_line.to_json())
    ma20_plot_dict = json.loads(fig_ma.to_json())
    candlestick_plot_dict = json.loads(fig_candle.to_json())
    
    response_data = {
        "charts": [
            line_plot_dict,
            ma20_plot_dict,
            candlestick_plot_dict
        ]
    }

    return response_data