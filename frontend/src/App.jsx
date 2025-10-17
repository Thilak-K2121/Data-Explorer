// frontend/src/App.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, AnimatePresence } from "framer-motion";
import Plot from "react-plotly.js";

// --- SVG Icons (zero-dependency) ---
const IconUpload = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconFileText = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconLoader = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconRotateCcw = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

// --- Inject styles for the futuristic glass UI ---
const injectStyles = () => {
  if (document.getElementById("app-futuristic-styles")) return;
  const style = document.createElement("style");
  style.id = "app-futuristic-styles";
  style.innerHTML = `
    :root{
      --bg-deep: #050816;
      --card-bg: rgba(10,18,30,0.45);
      --card-blur: 12px;
      --neon-a: #00f3ff;
      --neon-b: #7b4bff;
      --accent: linear-gradient(135deg, var(--neon-a), var(--neon-b));
      --glass-border: rgba(255,255,255,0.06);
      --muted: rgba(230,230,235,0.7);
      --glass-shadow: 0 8px 30px rgba(4,10,20,0.6);
    }
    html,body,#root { height: 100%; }
    body {
      margin: 0;
      background: radial-gradient(1200px 600px at 10% 10%, rgba(123,75,255,0.08), transparent 8%),
                  radial-gradient(800px 400px at 90% 85%, rgba(0,243,255,0.04), transparent 8%),
                  var(--bg-deep);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #e9eefb;
      -webkit-tap-highlight-color: transparent;
      overflow-x: hidden;
    }

    /* Gradient neon header text */
    .neon-title {
      font-weight: 800;
      line-height: 1;
      font-size: clamp(2.4rem, 4.8vw, 5.2rem);
      background: linear-gradient(180deg, rgba(255,255,255,1), rgba(235,245,255,0.92));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 6px 30px rgba(0,243,255,0.06));
      position: relative;
      text-align: center;
    }
    .neon-title::after{
      content: "";
      position: absolute;
      inset: 0;
      filter: blur(26px);
      background: radial-gradient(circle at 50% 20%, rgba(0,243,255,0.35), transparent 20%);
      z-index: -1;
      opacity: 0.9;
    }

    /* Glass card */
    .glass {
      background: var(--card-bg);
      backdrop-filter: blur(var(--card-blur));
      -webkit-backdrop-filter: blur(var(--card-blur));
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      transition: all .28s ease;
    }
    .glass-hover:hover {
      transform: translateY(-6px);
      box-shadow: 0 18px 60px rgba(3,8,18,0.7);
    }

    /* neon outline */
    .neon-outline {
      position: relative;
      border-radius: 20px;
      overflow: visible;
    }
    .neon-outline::before {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: 20px;
      background: linear-gradient(90deg, rgba(0,243,255,0.12), rgba(123,75,255,0.08));
      filter: blur(10px);
      z-index: -1;
    }

    /* upload area */
    .upload-area {
      border-radius: 16px;
      transition: border-color .22s ease, background .22s ease;
    }
    .upload-area.dragging {
      box-shadow: 0 14px 40px rgba(0,243,255,0.06);
      border-color: rgba(0,243,255,0.5);
      background: linear-gradient(180deg, rgba(0,243,255,0.03), rgba(123,75,255,0.02));
    }

    .btn-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.06);
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      cursor: pointer;
      font-weight: 600;
      transition: transform .16s ease, box-shadow .16s ease;
    }
    .btn-pill:active { transform: translateY(1px) scale(.995); }
    .btn-primary {
      background: var(--accent);
      color: #021018;
      box-shadow: 0 8px 30px rgba(123,75,255,0.12), 0 4px 12px rgba(0,243,255,0.06);
    }

    .muted {
      color: var(--muted);
      font-weight: 500;
    }

    /* subtle container sizes */
    .header-wrap { padding: 64px 18px 46px; max-width: 1100px; margin: 0 auto; }
    .uploader-wrap { max-width: 980px; margin: 0 auto; padding: 16px; }
    .card-padding { padding: 28px; }

    /* file row */
    .file-row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .file-row .filename { color: white; font-weight:600; }

    /* chart styles */
    .chart-card { min-height: 420px; display:flex; flex-direction:column; }
    .chart-inner { flex:1; border-radius:12px; overflow:hidden; padding:10px; }

    /* small responsive adjustments */
    @media (max-width: 768px) {
      .header-wrap { padding: 48px 14px 36px; }
      .card-padding { padding: 20px; }
    }
  `;
  document.head.appendChild(style);
};

// --- Header Component ---
const Header = () => {
  const [init, setInit] = useState(false);
  useEffect(() => {
    injectStyles();
    // Initialize particles engine
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: { detectsOn: "canvas", events: { resize: true } },
      particles: {
        color: { value: "#00f3ff" },
        links: { color: "#7b4bff", distance: 140, enable: true, opacity: 0.08, width: 1 },
        move: { enable: true, speed: 0.6, outModes: { default: "bounce" } },
        number: { density: { enable: true, area: 900 }, value: 50 },
        opacity: { value: 0.35 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <header className="relative">
      {/* Particles layer */}
      <div className="absolute inset-0 -z-10">
        {init && <Particles options={particlesOptions} />}
        {/* soft vignette / glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(2,6,20,0.12), rgba(2,4,10,0.6))" }} />
      </div>

      <div className="header-wrap">
        <div className="glass neon-outline rounded-3xl p-6 card-padding">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <motion.h1 initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="neon-title">
              Data Explorer
            </motion.h1>

            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="muted" style={{ maxWidth: 920 }}>
              Your intelligent platform for dynamic CSV visualization — a futuristic, polished workspace for exploring insights from your data.
            </motion.p>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- File Uploader Component ---
const FileUploader = ({ onChartsReceived }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileProcessing = async (selectedFile) => {
    if (!selectedFile || !selectedFile.name.endsWith(".csv")) {
      alert("Please upload a valid .csv file.");
      return;
    }
    setFile(selectedFile);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/visualize", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Upload failed");
      }
      const data = await response.json();
      // Expect data to contain { charts: [...], fileName: "..." }
      onChartsReceived({ charts: data.charts || data, fileName: selectedFile.name });
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileProcessing(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcessing(e.target.files[0]);
    }
  }, []);

  return (
    <section className="uploader-wrap">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass rounded-3xl neon-outline p-6 card-padding">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`upload-area glass rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${isDragging ? "dragging" : ""}`}
        >
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="btn-pill btn-primary" style={{ gap: 12 }}>
                <IconUpload className="w-6 h-6" style={{ color: "white" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
                  <div style={{ fontWeight: 700, color: "#021018" }}>Choose File</div>
                  <div style={{ fontSize: 12, color: "rgba(2,6,20,0.6)", marginTop: 2 }}>{file ? file.name : "No file chosen"}</div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl" style={{ marginTop: 22, marginBottom: 6 , marginLeft: 7 }}>Drop your CSV file here</h3>
            <p className="muted" style={{ marginLeft: '7px' }}>
  or click to browse
</p>

          </label>
        </div>

        {file && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.42 }} className="mt-6">
            <div className="glass rounded-lg p-4 file-row" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="glass rounded-md" style={{ padding: 8, background: "rgba(255,255,255,0.02)" }}>
                  <IconFileText className="w-5 h-5" style={{ color: "var(--neon-a)" }} />
                </div>
                <div>
                  <div className="filename">{file.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
                    <IconLoader className="w-4 h-4" style={{ color: "var(--neon-a)", animation: "spin 1s linear infinite" }} />
                    <span className="muted">Processing...</span>
                  </div>
                ) : (
                  <button onClick={() => { setFile(null); }} className="btn-pill" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

// --- Charts Dashboard ---
const ChartsDashboard = ({ charts, fileName, onReset }) => {
  if (!charts || charts.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="w-full px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold" style={{ fontSize: "1.6rem" }}>
            Insights for: <span style={{ color: "white", marginLeft: 8, fontWeight: 800 }}>{fileName}</span>
          </h2>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onReset} className="btn-pill glass" style={{ padding: "10px 14px" }}>
              <IconRotateCcw className="w-4 h-4" />
              <span className="muted" style={{ marginLeft: 6 }}>Upload New File</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.08 }} className="glass rounded-2xl p-6 chart-card">
              <h3 className="text-xl font-semibold mb-4" style={{ marginBottom: 12 }}>{chart.layout?.title?.text || `Chart ${index + 1}`}</h3>
              <div className="chart-inner" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))" }}>
                <Plot
                  data={chart.data}
                  layout={{
                    ...chart.layout,
                    autosize: true,
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    font: { color: "#e6eefc", family: "Inter, sans-serif" },
                    xaxis: { ...chart.layout?.xaxis, gridcolor: "rgba(255,255,255,0.06)", zerolinecolor: "rgba(255,255,255,0.03)" },
                    yaxis: { ...chart.layout?.yaxis, gridcolor: "rgba(255,255,255,0.06)", zerolinecolor: "rgba(255,255,255,0.03)" },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App ---
function App() {
  const [appData, setAppData] = useState({ charts: [], fileName: "" });

  useEffect(() => {
    // Ensure style injection for situations when Header might not mount first
    injectStyles();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main style={{ padding: "36px 20px" }}>
        <AnimatePresence mode="wait">
          {(!appData.charts || appData.charts.length === 0) ? (
            <motion.div key="uploader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FileUploader onChartsReceived={setAppData} />
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChartsDashboard
                charts={appData.charts}
                fileName={appData.fileName}
                onReset={() => setAppData({ charts: [], fileName: "" })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
