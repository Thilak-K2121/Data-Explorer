import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

export default function Chart({ apiUrl }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, [apiUrl]);

  if (!data) return <div>Loading...</div>;

  return (
    <Plot
      data={[
        {
          x: data.date,
          y: data.open,
          type: "scatter",
          mode: "lines",
          name: "Open",
          line: { color: "blue" }
        },
        {
          x: data.date,
          y: data.close,
          type: "scatter",
          mode: "lines",
          name: "Close",
          line: { color: "green" }
        },
        {
          x: data.date,
          y: data.high,
          type: "scatter",
          mode: "lines",
          name: "High",
          line: { color: "orange" }
        },
        {
          x: data.date,
          y: data.low,
          type: "scatter",
          mode: "lines",
          name: "Low",
          line: { color: "red" }
        },
      ]}
      layout={{
        title: "Stock Market Prices",
        xaxis: { title: "Date" },
        yaxis: { title: "Price" },
        autosize: true,
      }}
      style={{ width: "100%", height: "600px" }}
    />
  );
}
