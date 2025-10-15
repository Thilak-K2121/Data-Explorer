// frontend/src/App.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import Plot from "react-plotly.js";

// Helper & Styling Components
const ChartCard = ({ children }) => (
  <motion.div
    className="p-4 rounded-2xl bg-black/60 border border-cyan-500/50 backdrop-blur-sm"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(0, 255, 255, 0.8)" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.3 }}
    style={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)" }}
  >
    {children}
  </motion.div>
);

// --- CHANGE #1: UPDATE THE LAYOUT COMPONENT ---
// We've wrapped the flex container in a div that will center it and add padding.
const Layout = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex">
      <aside className="w-64 bg-black border-r border-cyan-500/80 p-4 flex flex-col sticky top-0 h-screen">
        <h1 className="text-2xl font-bold text-cyan-400 mb-8" style={{ textShadow: "0 0 8px #0ff" }}>
          <center>📈 VizDash</center>
        </h1>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  </div>
);

const DashboardHeader = ({ rowCount }) => (
  <motion.div
    className="mb-10 p-6 border border-cyan-500/30 rounded-lg text-center bg-black/20"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <h1 className="text-4xl font-bold text-cyan-400" style={{ textShadow: "0 0 10px var(--primary-glow)" }}>
      Stock Market Data Visualization
    </h1>
    <p className="text-gray-400 mt-2">
      An interactive dashboard exploring historical stock data.
    </p>
    <div className="mt-4 inline-block p-3 px-5 bg-cyan-900/50 border border-cyan-500/50 rounded-md">
      <span className="font-bold text-xl text-white">{rowCount}</span>
      <span className="text-gray-300 ml-2">Data Rows Loaded</span>
    </div>
  </motion.div>
);

const ChartsSection = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/stock?nrows=1000") 
      .then((res) => res.json())
      .then((data) => {
        setCharts(data.charts); 
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch chart data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-cyan-400 text-xl text-center">Loading Charts...</p>;
  if (!charts || charts.length === 0)
    return <p className="text-red-500 text-xl text-center">No chart data available</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {charts.map((chart, idx) => (
        <ChartCard key={idx}>
          <Plot
            data={chart.data}
            layout={{ ...chart.layout, paper_bgcolor: "transparent", plot_bgcolor: "rgba(0,0,0,0.3)" }}
            style={{ width: "100%", height: "350px" }}
            useResizeHandler={true}
            config={{ responsive: true, displayModeBar: false }}
          />
        </ChartCard>
      ))}
    </div>
  );
};

const AboutSection = () => (
  <section id="about" className="mt-12">
    <h2 className="text-3xl font-bold mb-6 text-cyan-400" style={{ textShadow: "0 0 6px var(--primary-glow)" }}>
      About This Project
    </h2>
    <ChartCard>
      <div className="p-4 text-gray-300">
        <p>
          This interactive dashboard visualizes historical stock data using Python-generated charts. All processing happens in the backend, while the frontend only renders charts.
        </p>
        <h4 className="font-bold text-cyan-400 mt-4 mb-2">Technologies Used:</h4>
        <ul className="list-disc list-inside">
          <li><strong>Python + FastAPI:</strong> Backend processing and chart generation.</li>
          <li><strong>Plotly:</strong> Interactive charts.</li>
          <li><strong>React + Tailwind CSS:</strong> Frontend layout and styling.</li>
          <li><strong>Framer Motion:</strong> Smooth animations.</li>
          <li><strong>tsparticles:</strong> Background particle effects.</li>
        </ul>
      </div>
    </ChartCard>
  </section>
);

function App() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <div className="relative app-container">
      <Particles
        id="tsparticles"
        options={{
          fpsLimit: 120,
          particles: {
            number: { value: 300, density: { enable: true, area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: { min: 0.1, max: 0.8 }, animation: { enable: true, speed: 1 } },
            size: { value: { min: 0.5, max: 2 } },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              straight: false,
              outModes: { default: "out" },
              orbit: {
                enable: true,
                rotation: { value: 360, direction: "clockwise" },
                radius: { min: 20, max: 60 },
              },
            },
          },
          interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
          detectRetina: true,
        }}
      />
      
      {/* --- CHANGE #2: REMOVED THE WRAPPER FROM AROUND <Layout /> --- */}
      <div className="relative z-10">
        <Layout>
          <DashboardHeader rowCount="1000" />
          <ChartsSection />
          <AboutSection />
        </Layout>
      </div>
    </div>
  );
}

export default App;