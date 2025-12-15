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

  const metricConfig = useMemo(() => {
    const cfg: Record<
      Metric,
      {
        label: string
        data: number[]
        alert: string
        tone: "ok" | "warn" | "risk"
        colorVar: "--temp" | "--hum" | "--vib" | "--co2"
      }
    > = {
      temp: {
        label: "Temp",
        data: [4.2, 4.3, 5.6, 6.1, 5.2, 4.6],
        alert: "Temperature excursion detected",
        tone: "warn",
        colorVar: "--temp",
      },
      hum: {
        label: "Humidity",
        data: [45, 46, 45, 44, 43, 42],
        alert: "Humidity stable",
        tone: "ok",
        colorVar: "--hum",
      },
      vib: {
        label: "Vibration",
        data: [1, 2, 8, 6, 2, 1],
        alert: "Critical shock detected",
        tone: "risk",
        colorVar: "--vib",
      },
      co2: {
        label: "CO₂",
        data: [410, 420, 460, 620, 720, 680],
        alert: "CO₂ level rising",
        tone: "warn",
        colorVar: "--co2",
      },
    }
    return cfg
  }, [])

  // Create chart once
  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const initial = metricConfig.temp

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00h", "04h", "08h", "12h", "16h", "20h"],
        datasets: [
          {
            data: initial.data as any,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue("--temp").trim() || "#f59e0b",
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "rgba(10,20,40,.55)" } },
          y: { grid: { color: "rgba(0,0,0,.06)" }, ticks: { color: "rgba(10,20,40,.55)" } },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [metricConfig])

  // Update chart on metric change
  useEffect(() => {
    const c = chartRef.current
    if (!c) return

    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(metricConfig[metric].colorVar)
      .trim()

    c.data.datasets[0].data = metricConfig[metric].data as any
    ;(c.data.datasets[0] as any).borderColor = color || "#1b73ff"
    c.update()
  }, [metric, metricConfig])

  const alertTone = metricConfig[metric].tone

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --dark: #0b1c33;
          --muted: #6c7a92;
          --bg: #f5f7fb;
          --card: #ffffff;

          /* Metric colors (demandé : temp orange, vib rouge, etc.) */
          --temp: #f59e0b; /* orange */
          --hum: #06b6d4;  /* cyan */
          --vib: #ef4444;  /* red */
          --co2: #a855f7;  /* purple */
          --ok: #22c55e;
          --warn: #f59e0b;
          --risk: #ef4444;
        }

        * { box-sizing: border-box; }
        html, body { height: 100%; }
        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          background:
            radial-gradient(1200px 650px at 70% 0%, rgba(27,115,255,.14), transparent 60%),
            var(--bg);
          color: var(--dark);
        }

        .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(245, 247, 251, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 180px;
        }
        .brand img {
          height: 34px;
          width: auto;
          display: block;
        }
        .brand strong { font-weight: 800; letter-spacing: -0.01em; }
        .brand small {
          display: block;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: rgba(10, 25, 45, 0.55);
          font-weight: 700;
          margin-top: 2px;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease;
          white-space: nowrap;
        }
        .btn:active { transform: translateY(1px); }
        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27,115,255,.35);
        }

        .hero {
          padding: 34px 0 18px;
          min-height: calc(100dvh - 70px);
          display: flex;
          align-items: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: start;
        }

        .hero h1 {
          font-size: clamp(40px, 4.4vw, 70px);
          line-height: 1.03;
          margin: 0 0 14px;
          letter-spacing: -0.03em;
        }
        .hero h1 span { color: var(--blue); }

        .hero p {
          margin: 0 0 12px;
          max-width: 620px;
          color: rgba(10, 25, 45, 0.68);
          font-weight: 600;
          line-height: 1.55;
        }
        .hero .microline {
          margin-top: 10px;
          color: rgba(27, 115, 255, 0.9);
          font-weight: 800;
          font-size: 13px;
        }

        /* Live monitoring card */
        .monitor {
          background: var(--card);
          border-radius: 20px;
          box-shadow: 0 22px 60px rgba(6,19,37,.12);
          border: 1px solid rgba(0,0,0,.06);
          padding: 14px 14px 12px;
        }
        .monitor-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 2px 2px 0;
        }
        .monitor-title { font-weight: 900; font-size: 13px; }
        .online {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(10,25,45,.65);
          font-weight: 800;
        }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34,197,94,.18);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin: 10px 0 10px;
        }
        .tab {
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 900;
          background: #eef3ff;
          cursor: pointer;
          transition: background .12s ease, color .12s ease, border-color .12s ease;
        }
        .tab.active { color: #fff; border-color: rgba(0,0,0,.1); }

        .tab.temp.active { background: var(--temp); }
        .tab.hum.active  { background: var(--hum); }
        .tab.vib.active  { background: var(--blue); } /* visuel comme ta capture */
        .tab.co2.active  { background: var(--co2); }

        .chartWrap { height: 165px; }
        .statusline {
          margin-top: 10px;
          font-weight: 900;
          font-size: 13px;
          color: rgba(10,25,45,.82);
        }

        .pillrow {
          margin-top: 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 11px;
          font-weight: 900;
        }
        .pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(27,115,255,.08);
          border: 1px solid rgba(27,115,255,.18);
          color: rgba(27,115,255,.95);
        }
        .pill.warn { background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.25); color: #b45309; }
        .pill.risk { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.25); color: #b91c1c; }
        .pill.ok   { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.22); color: #15803d; }

        /* Section: From sensors to proof */
        .section {
          padding: 10px 0 0;
        }
        .centerTitle {
          text-align: center;
          margin: 22px 0 6px;
          font-size: 20px;
          font-weight: 1000;
          letter-spacing: -0.02em;
        }
        .centerSub {
          text-align: center;
          margin: 0 auto 18px;
          max-width: 720px;
          color: rgba(10,25,45,.6);
          font-weight: 700;
          font-size: 13px;
        }

        .grid3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 8px;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 16px 14px;
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 14px 40px rgba(6,19,37,.08);
          position: relative;
        }
        .accent {
          position: absolute;
          left: 0; top: 12px; bottom: 12px;
          width: 4px;
          border-radius: 99px;
        }
        .accent.blue { background: var(--blue); }
        .accent.amber { background: var(--temp); }
        .accent.green { background: var(--ok); }

        .card h3 { margin: 0 0 6px; font-size: 13px; font-weight: 1000; }
        .card p { margin: 0; color: rgba(10,25,45,.62); font-weight: 700; font-size: 12px; }

        /* Industries */
        .industriesTitle {
          text-align: center;
          margin: 22px 0 16px;
          font-size: 20px;
          font-weight: 1000;
          letter-spacing: -0.02em;
        }
        .industry h4 { margin: 0 0 6px; color: var(--blue); font-weight: 1000; }
        .industry p { margin: 0; color: rgba(10,25,45,.62); font-weight: 700; font-size: 12px; }

        /* Footer */
        footer {
          padding: 26px 0 34px;
          text-align: center;
          color: rgba(10,25,45,.65);
          font-weight: 800;
        }
        footer .email { color: rgba(10,25,45,.85); }
        footer .loc { margin-top: 6px; font-size: 12px; }

        /* Popup */
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.55);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
        }
        .popup-overlay.active { display: flex; }
        .popup {
          width: 860px;
          max-width: 100%;
          height: 86vh;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0,0,0,.35);
        }
        .popup iframe { width: 100%; height: 100%; border: none; }
        .popup-close {
          position: absolute;
          top: 10px; right: 12px;
          width: 40px; height: 40px;
          border-radius: 999px;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0,0,0,.2);
        }

        @media (max-width: 980px) {
          .hero { min-height: auto; }
          .hero-grid { grid-template-columns: 1fr; }
          .grid3 { grid-template-columns: 1fr; }
          nav { gap: 12px; }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="container">
          <nav>
            <div className="brand">
              <img src="/assets/logo.png" alt="Enthalpy logo" />
              <div>
                <strong>Enthalpy</strong>
                <small>COLD &amp; CRITICAL MONITORING</small>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <h1>
                Sensors you can trust.
                <br />
                <span>Evidence you can prove.</span>
              </h1>

              {/* PROBLEME -> SOLUTION (clair + net dès l’ouverture) */}
              <p>
                Capture, trace and alert on <strong>temperature</strong>, <strong>humidity</strong>, <strong>vibration</strong> and <strong>CO₂</strong> in real time.
                <br />
                Seal incidents into <strong>audit-ready proof</strong> on a blockchain-secured event ledger.
                <br />
                Use that proof to support compliance, insurance claims — and <strong>blockchain-triggered payments</strong>.
              </p>

              <div className="microline">From sensors → proof → payment.</div>

              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
                  Request pilot access
                </button>
              </div>
            </div>

            <div className="monitor">
              <div className="monitor-top">
                <div className="monitor-title">Live monitoring</div>
                <div className="online">
                  <span className="dot" />
                  Sensors online
                </div>
              </div>

              <div className="tabs">
                <button
                  className={`tab temp ${metric === "temp" ? "active" : ""}`}
                  onClick={() => setMetric("temp")}
                >
                  Temp
                </button>
                <button
                  className={`tab hum ${metric === "hum" ? "active" : ""}`}
                  onClick={() => setMetric("hum")}
                >
                  Humidity
                </button>
                <button
                  className={`tab vib ${metric === "vib" ? "active" : ""}`}
                  onClick={() => setMetric("vib")}
                >
                  Vibration
                </button>
                <button
                  className={`tab co2 ${metric === "co2" ? "active" : ""}`}
                  onClick={() => setMetric("co2")}
                >
                  CO₂
                </button>
              </div>

              <div className="chartWrap">
                <canvas ref={canvasRef} />
              </div>

              <div className="statusline">{metricConfig[metric].alert}</div>

              {/* Badges (preuve + paiement) */}
              <div className="pillrow">
                <span className={`pill ${alertTone}`}>● Incident captured</span>
                <span className="pill warn">🔒 Blockchain-sealed</span>
                <span className="pill ok">💸 Payment ready</span>
              </div>
            </div>
          </div>

          {/* FROM SENSORS TO PROOF */}
          <div className="section">
            <div className="centerTitle">From sensors to proof</div>
            <div className="centerSub">
              Enthalpy turns real-world incidents into trusted digital evidence that can trigger compliance actions or payments.
            </div>

            <div className="grid3">
              <div className="card">
                <span className="accent blue" />
                <h3>🔔 Sensor event</h3>
                <p>Temperature, vibration or CO₂ threshold exceeded.</p>
              </div>

              <div className="card">
                <span className="accent amber" />
                <h3>🔒 Blockchain proof</h3>
                <p>Event is hashed, timestamped and sealed on-chain.</p>
              </div>

              <div className="card">
                <span className="accent green" />
                <h3>✅ Compliance / Payment</h3>
                <p>Audit, penalty or automated payout is triggered.</p>
              </div>
            </div>

            {/* INDUSTRIES (remonté, centré, sans vide) */}
            <div className="industriesTitle">Industries where a few degrees cost millions</div>

            <div className="grid3">
              <div className="card industry">
                <h4>Pharma &amp; Biotech</h4>
                <p>Audit-ready traceability.</p>
              </div>
              <div className="card industry">
                <h4>Food &amp; Frozen</h4>
                <p>Prevent cold-chain failures.</p>
              </div>
              <div className="card industry">
                <h4>Logistics &amp; 3PL</h4>
                <p>Proof of compliance.</p>
              </div>
            </div>

            {/* FOOTER (email + Tangier, Morocco) */}
            <footer>
              <div className="email">contact@enthalpy.site</div>
              <div className="loc">Tangier, Morocco</div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
                  Request pilot access
                </button>
              </div>
            </footer>
          </div>
        </div>
      </section>

      {/* POPUP */}
      <div
        className={`popup-overlay ${popupOpen ? "active" : ""}`}
        onClick={() => setPopupOpen(false)}
        role="dialog"
        aria-modal="true"
      >
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={() => setPopupOpen(false)} aria-label="Close">
            ×
          </button>
          <iframe title="Pilot access form" src={FORM_URL} />
        </div>
      </div>
    </>
  )
}
