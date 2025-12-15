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
        text: "Temperature excursion detected",
      },
      hum: {
        label: "Humidity",
        data: [45, 46, 44, 43, 42, 41],
        text: "Humidity stable",
      },
      vib: {
        label: "Vibration",
        data: [1, 2, 8, 6, 2, 1],
        text: "Shock detected",
      },
      co2: {
        label: "CO₂",
        data: [400, 420, 480, 650, 720, 680],
        text: "CO₂ level rising",
      },
    }),
    []
  )

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
    chartRef.current.data.datasets[0].data = metricConfig[metric].data as any
    chartRef.current.update()
  }, [metric, metricConfig])

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
          border-bottom: 1px solid #ddd;
          z-index: 10;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
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
          align-items: center;
        }

        h1 {
          font-size: clamp(36px, 4vw, 64px);
          margin: 0;
          line-height: 1.05;
        }

        h1 span {
          color: #1b73ff;
        }

        .hero p {
          font-size: 16px;
          color: #4a5d7a;
          max-width: 520px;
        }

        section {
          padding: 80px 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .card {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
        }

        /* POPUP */
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .popup-overlay.active {
          display: flex;
        }

        .popup {
          width: 820px;
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

        footer {
          padding: 80px 0;
          text-align: center;
          background: #fff;
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header>
        <div className="container">
          <nav>
            <strong>Enthalpy</strong>
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
              Sensors you can trust.
              <br />
              <span>Evidence you can prove.</span>
            </h1>

            <p>
              Transform raw IoT data into <strong>cryptographically verified proof</strong>
              <br />
              for compliance, insurance, and automated payments.
            </p>

            <p>
              Enthalpy seals critical events on a <strong>blockchain-secured event ledger</strong>,
              turning real-world incidents into <strong>audit-ready evidence</strong> that can
              automatically trigger claims, penalties, or payments.
            </p>

            <p style={{ fontWeight: 700, color: "#1b73ff" }}>
              From sensors to proof. From proof to payment.
            </p>

            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </div>

          <div className="card">
            <canvas ref={canvasRef} style={{ height: 220 }} />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section>
        <div className="container grid-3">
          <div className="card">Sensor captures a critical event</div>
          <div className="card">Event sealed on blockchain ledger</div>
          <div className="card">Proof triggers compliance or payment</div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>contact@enthalpy.site</p>
        <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
          Request pilot access
        </button>
      </footer>

      {/* ================= POPUP ================= */}
      <div className={`popup-overlay ${popupOpen ? "active" : ""}`}>
        <div className="popup">
          <button className="popup-close" onClick={() => setPopupOpen(false)}>
            ×
          </button>
          <iframe src={FORM_URL} title="Pilot access form" />
        </div>
      </div>
    </>
  )
}
