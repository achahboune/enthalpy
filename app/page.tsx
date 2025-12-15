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

  const metricConfig = useMemo(
    () => ({
      temp: {
        label: "Temp",
        data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
        status: "Warning: temperature excursion",
        level: "warn",
      },
      hum: {
        label: "Humidity",
        data: [45, 46, 44, 43, 42, 41],
        status: "Humidity stable",
        level: "ok",
      },
      vib: {
        label: "Vibration",
        data: [1, 2, 8, 6, 2, 1],
        status: "Critical shock detected",
        level: "risk",
      },
      co2: {
        label: "CO₂",
        data: [400, 420, 480, 650, 720, 680],
        status: "CO₂ level rising",
        level: "warn",
      },
    }),
    []
  )

  /* ================= CHART ================= */
  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00h", "04h", "08h", "12h", "16h", "20h"],
        datasets: [
          {
            data: metricConfig.temp.data,
            borderColor: "#1b73ff",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [metricConfig])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data =
      metricConfig[metric].data as any
    chartRef.current.update()
  }, [metric, metricConfig])

  /* ================= UI ================= */
  return (
    <>
      {/* ================= GLOBAL STYLE ================= */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            #f5f7fb;
          color: #0b1c33;
        }

        .container {
          max-width: 1200px;
          margin: auto;
          padding: 0 24px;
        }

        header {
          position: sticky;
          top: 0;
          background: rgba(245, 247, 251, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e5e7eb;
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

        .logo img {
          height: 40px;
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
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        .hero {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
        }

        h1 {
          font-size: clamp(36px, 4vw, 60px);
          margin: 0;
        }

        h1 span {
          color: #1b73ff;
        }

        .card {
          background: #fff;
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
        }

        /* DASHBOARD */
        .tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }

        .tabs button {
          flex: 1;
          border: none;
          border-radius: 10px;
          padding: 8px;
          font-weight: 600;
          background: #eef2ff;
          cursor: pointer;
        }

        .tabs button.active {
          background: #1b73ff;
          color: white;
        }

        /* ===== PROCESS (ancienne zone rouge) ===== */
        .process {
          padding: 80px 0;
        }

        .process h2 {
          text-align: center;
          margin-bottom: 10px;
        }

        .process p.subtitle {
          text-align: center;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .process-card {
          background: #fff;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
          border-left: 6px solid;
        }

        .process-card.blue {
          border-color: #1b73ff;
        }
        .process-card.orange {
          border-color: #f59e0b;
        }
        .process-card.green {
          border-color: #22c55e;
        }

        /* INDUSTRIES */
        .industries {
          padding: 80px 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        footer {
          padding: 60px 0;
          text-align: center;
          background: #fff;
        }

        /* POPUP */
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: ${popupOpen ? "flex" : "none"};
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .popup {
          width: 800px;
          height: 85vh;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }

        .popup iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .popup-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .hero-grid,
          .process-grid,
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" alt="Enthalpy" />
              <strong>Enthalpy</strong>
            </div>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Sensors you can trust.<br />
              <span>Evidence you can prove.</span>
            </h1>
            <p>
              Transform raw IoT data into cryptographically verified proof for
              compliance, insurance, and automated blockchain payments.
            </p>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </div>

          <div className="card">
            <strong>Live monitoring</strong>
            <div className="tabs">
              {(["temp", "hum", "vib", "co2"] as Metric[]).map((m) => (
                <button
                  key={m}
                  className={metric === m ? "active" : ""}
                  onClick={() => setMetric(m)}
                >
                  {metricConfig[m].label}
                </button>
              ))}
            </div>
            <div style={{ height: 200 }}>
              <canvas ref={canvasRef} />
            </div>
            <p>{metricConfig[metric].status}</p>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="process">
        <div className="container">
          <h2>From sensors to proof</h2>
          <p className="subtitle">
            Enthalpy turns real-world incidents into trusted digital evidence
            that can trigger compliance actions or payments.
          </p>

          <div className="process-grid">
            <div className="process-card blue">
              <strong>📡 Sensor event</strong>
              <p>Temperature, vibration or CO₂ threshold exceeded.</p>
            </div>
            <div className="process-card orange">
              <strong>🔐 Blockchain proof</strong>
              <p>Event is hashed, timestamped and sealed on-chain.</p>
            </div>
            <div className="process-card green">
              <strong>💸 Compliance / Payment</strong>
              <p>Audit, penalty or automated payout is triggered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INDUSTRIES ================= */}
      <section className="industries">
        <div className="container">
          <h2>Industries where a few degrees cost millions</h2>
          <div className="grid-3">
            <div className="card">
              <strong>💊 Pharma & Biotech</strong>
              <p>Audit-ready cold chain compliance.</p>
            </div>
            <div className="card">
              <strong>🥶 Food & Frozen</strong>
              <p>Spoilage prevention and liability proof.</p>
            </div>
            <div className="card">
              <strong>🚚 Logistics & 3PL</strong>
              <p>SLA enforcement and proof of delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>contact@enthalpy.site</p>
        <p><strong>Tangier, Morocco 🇲🇦</strong></p>
        <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
          Request pilot access
        </button>
      </footer>

      {/* ================= POPUP ================= */}
      <div className="popup-overlay">
        <div className="popup">
          <button className="popup-close" onClick={() => setPopupOpen(false)}>
            ×
          </button>
          <iframe src={FORM_URL} />
        </div>
      </div>
    </>
  )
}
