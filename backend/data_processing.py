import pandas as pd
import numpy as np

def read_stock_csv(path):
    """
    Expected columns: Date (or datetime), Open, High, Low, Close, Volume
    If Date is not datetime, will parse.
    """
    df = pd.read_csv(path)
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
    else:
        for col in ['date', 'timestamp', 'time']:
            if col in df.columns:
                df['Date'] = pd.to_datetime(df[col])
                break
    df = df.sort_values('Date').reset_index(drop=True)
    return df

def add_indicators(df, ma_windows=[20,50]):
    df = df.copy()
    for w in ma_windows:
        df[f"ma_{w}"] = df['Close'].rolling(window=w, min_periods=1).mean()
    df['pct_change'] = df['Close'].pct_change().fillna(0)
    return df

def to_json_for_plotly(df, nrows=500):
    df = df.tail(nrows)

    df.columns = [col.strip().lower() for col in df.columns]

    return {
        'date': df['date'].astype(str).tolist(),
        'open': df['open'].astype(float).tolist(),
        'high': df['high'].astype(float).tolist(),
        'low': df['low'].astype(float).tolist(),
        'close': df['close'].astype(float).tolist(),
    }
