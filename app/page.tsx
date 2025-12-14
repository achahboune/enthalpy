"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Chart from "chart.js/auto"

type Metric = "temp" | "hum" | "vib" | "co2"

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKqc44-iXAAwxkk2NEWLodNMkshh4u31NP1bWBRvmAcu1GIA/viewform?embedded=true"

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const [metric, setMetric] = useState<Metric>("temp")
  const [popupOpen, setPopupOpen] = useState(false)
  const [iframeSrc, setIframeSrc] = useState<string>("")

  const metricConfig = useMemo(() => ({
    temp: {
      label: "Temp",
      data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
      text: "Warning: Temperature excursion",
      cls: "warn",
    },
    hum: {
      label: "Humidity",
      data: [45, 46, 44, 43, 42, 41],
      text: "Status: Normal humidity",
      cls: "ok",
    },
    vib: {
      label: "Vibration",
      data: [1, 2, 8, 6, 2, 1],
      text: "Risk: Shock detected",
      cls: "risk",
    },
    co2: {
      label: "CO₂",
      data: [400, 420, 480, 650, 720, 680],
      text: "Warning: CO₂ rising",
      cls: "warn",
    },
  }), [])

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00h", "04h", "08h", "12h", "16h", "20h"],
        datasets: [{
          data: metricConfig.temp.data,
          borderColor: "#1b73ff",
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,.06)" } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [metricConfig])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data = metricConfig[metric].data as any
    chartRef.current.update()
  }, [metric, metricConfig])

  function openPopup() {
    setPopupOpen(true)
    setIframeSrc("")
    setTimeout(() => setIframeSrc(FORM_URL), 50)
  }

  function closePopup() {
    setPopupOpen(false)
  }

  const alert = metricConfig[metric]

  return (
    <>
      {/* ================= GLOBAL STYLES ================= */}
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --dark: #0b1c33;
          --muted: #6c7a92;
          --bg: #f5f7fb;
          --card: #ffffff;
          --ok: #2ecc71;
          --warn: #f1c40f;
          --risk: #e74c3c;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background:
            radial-gradient(1200px 600px at 70% 0%, rgba(27,115,255,.12), transparent 60%),
            var(--bg);
          color: var(--dark);
        }

        .container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        header {
          position: sticky;
          top: 0;
          background: rgba(245,247,251,.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,.06);
          z-index: 10;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo img { height: 42px; }

        .logo strong {
          color: var(--blue);
          font-size: 18px;
        }

        .logo span {
          display: block;
          font-size: 11px;
          letter-spacing: .18em;
          font-weight: 600;
          color: #4a5d7a;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27,115,255,.35);
        }

        /* HERO */
        .hero {
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 40px;
          align-items: center;
        }

        h1 {
          font-size: clamp(36px, 4vw, 64px);
          line-height: 1.05;
          margin: 0;
        }

        h1 span { color: var(--blue); }

        .hero p {
          max-width: 560px;
          color: var(--muted);
          margin: 18px 0 26px;
        }

        .dashboard {
          background: var(--card);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 22px 60px rgba(6,19,37,.12);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--ok);
          border-radius: 50%;
          box-shadow: 0 0 0 5px rgba(46,204,113,.2);
        }

        .dashboard-menu {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .dashboard-menu button {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: #eef3ff;
          font-weight: 700;
          cursor: pointer;
        }

        .dashboard-menu .active {
          background: var(--blue);
          color: #fff;
        }

        .alert {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .alert.ok { color: var(--ok); }
        .alert.warn { color: #b08900; }
        .alert.risk { color: var(--risk); }

        .chartWrap { height: 170px; }

        section {
          padding: 80px 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 18px;
        }

        .card {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 14px 40px rgba(6,19,37,.08);
        }

        footer {
          padding: 80px 0;
          text-align: center;
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" />
              <div>
                <strong>Enthalpy</strong>
                <span>COLD & CRITICAL MONITORING</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={openPopup}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <h1>
                Sensors you can trust.<br />
                <span>Evidence you can prove.</span>
              </h1>
              <p>
                Enthalpy combines IoT sensors and a blockchain-secured ledger
                to transform incidents into audit-ready proof.
              </p>
              <button className="btn btn-primary" onClick={openPopup}>
                Request pilot access
              </button>
            </div>

            <div className="dashboard">
              <div className="dashboard-header">
                <span>Live monitoring</span>
                <span><span className="dot" /> Online</span>
              </div>

              <div className="dashboard-menu">
                {(Object.keys(metricConfig) as Metric[]).map(m => (
                  <button
                    key={m}
                    className={metric === m ? "active" : ""}
                    onClick={() => setMetric(m)}
                  >
                    {metricConfig[m].label}
                  </button>
                ))}
              </div>

              <div className={`alert ${alert.cls}`}>{alert.text}</div>
              <div className="chartWrap">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INDUSTRIES ================= */}
      <section>
        <div className="container">
          <h2>Industries where a few degrees cost millions</h2>
          <div className="grid-3">
            <div className="card"><h3>Pharma & Biotech</h3><p>Audit-ready traceability.</p></div>
            <div className="card"><h3>Food & Frozen</h3><p>Prevent cold-chain failures.</p></div>
            <div className="card"><h3>Logistics & 3PL</h3><p>Proof of compliance.</p></div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <footer>
        <div className="container">
          <h2>Turn incidents into evidence.</h2>
          <button className="btn btn-primary" onClick={openPopup}>
            Request pilot access
          </button>
        </div>
      </footer>

      {/* ================= POPUP ================= */}
      <div className={`popup-overlay ${popupOpen ? "active" : ""}`}>
        <div className="popup">
          <button className="popup-close" onClick={closePopup}>×</button>
          <iframe src={iframeSrc} />
        </div>
      </div>
    </>
  )
}
