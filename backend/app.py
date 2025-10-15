from fastapi import FastAPI, Query
from fastapi.responses import Response
import pandas as pd
import plotly.graph_objects as go

app = FastAPI()

@app.get("/api/stock")
def get_stock(nrows: int = Query(1000, gt=0)):
    df = pd.read_csv("dataset.csv").head(nrows)
    df['Date'] = pd.to_datetime(df['Date'])

    fig_line = go.Figure()
    fig_line.add_trace(go.Scatter(
        x=df['Date'],
        y=df['Close'],
        mode='lines',
        name='Close'
    ))

    df['MA20'] = df['Close'].rolling(20).mean()
    fig_ma = go.Figure()
    fig_ma.add_trace(go.Scatter(x=df['Date'], y=df['Close'], mode='lines', name='Close'))
    fig_ma.add_trace(go.Scatter(x=df['Date'], y=df['MA20'], mode='lines', name='MA20'))

    fig_candle = go.Figure(data=[go.Candlestick(
        x=df['Date'],
        open=df['Open'],
        high=df['High'],
        low=df['Low'],
        close=df['Close']
    )])

    combined_json = {
        "line_plot": fig_line.to_json(),
        "ma20_plot": fig_ma.to_json(),
        "candlestick_plot": fig_candle.to_json()
    }

    import json
    return Response(content=json.dumps(combined_json), media_type="application/json")
