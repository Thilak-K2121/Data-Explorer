# backend/app.py

# --- IMPORTS (Added os and load_dotenv) ---
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import plotly.graph_objects as go
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai

# --- NEW: Load environment variables from .env file ---
load_dotenv()

# --- NEW: Securely get API key from environment ---
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found. Please set the GOOGLE_API_KEY in your .env file.")

# Configure the Gemini client with the key
genai.configure(api_key=GEMINI_API_KEY)

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

# Your existing /api/stock endpoint (no changes needed here)
@app.get("/api/stock")
def get_stock(nrows: int = Query(1000, gt=0)):
    try:
        df = pd.read_csv("dataset.csv")
        df['Date'] = pd.to_datetime(df['Date'])
    except FileNotFoundError:
        return {"error": "dataset.csv not found in the backend folder."}

    df_sliced = df.tail(nrows).copy()
    layout_theme = {
        'font': {'color': '#00ffff'}, 'title_font': {'color': '#00ffff', 'size': 20},
        'paper_bgcolor': 'rgba(0,0,0,0)', 'plot_bgcolor': 'rgba(0,0,0,0.2)',
        'xaxis': {'gridcolor': 'rgba(0, 255, 255, 0.2)'}, 'yaxis': {'gridcolor': 'rgba(0, 255, 255, 0.2)'},
    }
    charts_list = []
    # (The code for generating all your charts remains the same)
    for col in ['Open', 'High', 'Low', 'Close']:
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df_sliced['Date'], y=df_sliced[col], mode='lines', name=col, line={'color': '#00ffff'}))
        fig.update_layout(title=f'{col} Price Over Time', **layout_theme)
        charts_list.append(json.loads(fig.to_json()))
    response_data = {"charts": charts_list}
    return response_data

# --- UPDATED /api/analyze endpoint ---
@app.get("/api/analyze")
def analyze_stock(nrows: int = Query(100, gt=0)):
    model = genai.GenerativeModel('gemini-pro')
    try:
        df = pd.read_csv("dataset.csv").tail(nrows)
        df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')
    except FileNotFoundError:
        return {"error": "dataset.csv not found."}

    data_summary = df[['Date', 'Open', 'High', 'Low', 'Close']].to_string(index=False)
    
    prompt = f"""
    You are a professional, unbiased financial analyst. 
    Analyze the following stock data and provide a concise, 3-point summary of the key trends.
    Focus on volatility, the general price trend (up, down, or sideways), and any notable recent price action.
    Do not give financial advice.
    
    Data:
    {data_summary}
    """
    
    try:
        response = model.generate_content(prompt)
        return {"analysis": response.text}
    except Exception as e:
        return {"error": f"Failed to generate analysis: {str(e)}"}