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
  const [iframeSrc, setIframeSrc] = useState("")

  const metricConfig = useMemo(() => {
    const cfg: Record<
      Metric,
      {
        label: string
        data: number[]
        status: string
        cls: "ok" | "warn" | "risk"
        tab: { bg: string; fg: string; border: string }
        line: string
      }
    > = {
      temp: {
        label: "Temp",
        data: [4.2, 4.3, 5.9, 6.2, 5.3, 4.7],
        status: "Temperature excursion detected",
        cls: "warn",
        tab: { bg: "#f59e0b", fg: "#0b1c33", border: "rgba(245,158,11,.45)" },
        line: "#f59e0b",
      },
      hum: {
        label: "Humidity",
        data: [45, 46, 44, 43, 42, 41],
        status: "Humidity stable",
        cls: "ok",
        tab: { bg: "#eaf1ff", fg: "#0b1c33", border: "rgba(27,115,255,.20)" },
        line: "#1b73ff",
      },
      vib: {
        label: "Vibration",
        data: [1, 2, 8, 6, 2, 1],
        status: "Critical shock detected",
        cls: "risk",
        tab: { bg: "#1b73ff", fg: "#ffffff", border: "rgba(27,115,255,.45)" },
        line: "#1b73ff",
      },
      co2: {
        label: "CO₂",
        data: [400, 420, 480, 650, 720, 680],
        status: "CO₂ level rising",
        cls: "warn",
        tab: { bg: "#eaf1ff", fg: "#0b1c33", border: "rgba(27,115,255,.20)" },
        line: "#1b73ff",
      },
    }
    return cfg
  }, [])

  function openPopup() {
    setPopupOpen(true)
    setIframeSrc("")
    setTimeout(() => setIframeSrc(FORM_URL), 40)
  }
  function closePopup() {
    setPopupOpen(false)
  }

  // Create chart once
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
            borderColor: metricConfig.temp.line,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
          },
        ],
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

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [metricConfig])

  // Update chart on metric change
  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    c.data.datasets[0].data = metricConfig[metric].data as any
    ;(c.data.datasets[0] as any).borderColor = metricConfig[metric].line
    c.update()
  }, [metric, metricConfig])

  const alertCls = metricConfig[metric].cls

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --dark: #0b1c33;
          --muted: #6c7a92;
          --bg: #f5f7fb;
          --card: #ffffff;
          --ok: #22c55e;
          --warn: #f59e0b;
          --risk: #ef4444;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            var(--bg);
          color: var(--dark);
        }
        .container {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        header {
          position: sticky;
          top: 0;
          z-index: 20;
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

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo img {
          height: 52px;
          width: auto;
        }
        .logo strong {
          color: var(--dark);
          font-size: 18px;
          line-height: 1;
        }
        .logo span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #4a5d7a;
          font-weight: 700;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        .hero {
          padding: 46px 0 26px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: start;
        }

        h1 {
          font-size: clamp(38px, 4.4vw, 66px);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.02;
        }
        h1 span {
          color: var(--blue);
        }

        .hero-copy {
          margin-top: 14px;
          color: #2b3d5a;
          font-weight: 600;
          max-width: 560px;
          line-height: 1.55;
          font-size: 14px;
        }
        .hero-copy strong {
          color: var(--dark);
        }
        .hero-tagline {
          margin-top: 12px;
          color: var(--blue);
          font-weight: 800;
          font-size: 13px;
        }

        .dashboard {
          background: var(--card);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 22px 60px rgba(6, 19, 37, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #2b3d5a;
          font-weight: 700;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.18);
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin: 10px 0 8px;
        }
        .tab {
          flex: 1;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 8px 10px;
          border-radius: 999px;
          font-size: 12px;
          background: #eef3ff;
          cursor: pointer;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tab.active {
          border-color: transparent;
        }

        .chartWrap {
          height: 150px;
          margin-top: 4px;
        }

        .alertline {
          margin-top: 10px;
          font-weight: 800;
          font-size: 12px;
        }
        .alertline.ok {
          color: var(--ok);
        }
        .alertline.warn {
          color: #b45309;
        }
        .alertline.risk {
          color: var(--risk);
        }

        .chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #0b1c33;
        }
        .chip .cDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .centerTitle {
          text-align: center;
          font-weight: 900;
          font-size: 18px;
          margin: 24px 0 6px;
          letter-spacing: -0.01em;
        }
        .centerSub {
          text-align: center;
          margin: 0 auto 22px;
          max-width: 720px;
          color: var(--muted);
          font-weight: 600;
          font-size: 13px;
        }

        .grid3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .stepCard {
          background: #fff;
          border-radius: 14px;
          padding: 18px 18px 16px;
          box-shadow: 0 14px 40px rgba(6, 19, 37, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          min-height: 96px;
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 12px;
          align-items: start;
        }
        .bar {
          width: 4px;
          border-radius: 999px;
          height: 100%;
        }
        .stepTitle {
          font-weight: 900;
          margin: 0 0 4px;
          font-size: 13px;
        }
        .stepText {
          margin: 0;
          color: #2b3d5a;
          font-weight: 600;
          font-size: 12px;
          line-height: 1.4;
        }

        .industryTitle {
          text-align: center;
          font-weight: 900;
          font-size: 20px;
          margin: 26px 0 14px;
          letter-spacing: -0.01em;
        }
        .industryCard {
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(6, 19, 37, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .industryCard h3 {
          margin: 0 0 6px;
          color: var(--blue);
          font-weight: 900;
          font-size: 14px;
        }
        .industryCard p {
          margin: 0;
          color: #2b3d5a;
          font-weight: 600;
          font-size: 12px;
        }

        .footer {
          text-align: center;
          padding: 26px 0 34px;
          color: #2b3d5a;
          font-weight: 700;
          font-size: 12px;
        }
        .footer .email {
          font-weight: 900;
          color: #0b1c33;
          font-size: 13px;
        }
        .footer .loc {
          margin-top: 6px;
          color: #6c7a92;
          font-weight: 800;
        }

        .popup-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }
        .popup-overlay.active {
          display: flex;
        }
        .popup {
          background: #fff;
          width: 820px;
          max-width: 100%;
          height: 86vh;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
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
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .grid3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" alt="Enthalpy" />
              <div>
                <strong>Enthalpy</strong>
                <span>COLD &amp; CRITICAL MONITORING</span>
              </div>
            </div>

            {/* ✅ GARDÉ : le SEUL bouton */}
            <button className="btn btn-primary" onClick={openPopup}>
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

              <div className="hero-copy">
                Capture, trace and alert on <strong>temperature</strong>,{" "}
                <strong>humidity</strong>, <strong>vibration</strong> and{" "}
                <strong>CO₂</strong> in real time.
                <br />
                Seal incidents into <strong>audit-ready proof</strong> on a{" "}
                <strong>blockchain-secured event ledger</strong>.
                <br />
                Use that proof to support compliance, insurance claims — and{" "}
                <strong> blockchain-triggered payments</strong>.
              </div>

              <div className="hero-tagline">From sensors → proof → payment.</div>

              {/* ❌ SUPPRIMÉ : bouton du hero */}
            </div>

            {/* Dashboard */}
            <div className="dashboard">
              <div className="dashboard-header">
                <strong>Live monitoring</strong>
                <div className="status">
                  <span className="dot" />
                  Sensors online
                </div>
              </div>

              <div className="tabs">
                {(["temp", "hum", "vib", "co2"] as Metric[]).map((m) => {
                  const active = metric === m
                  const tab = metricConfig[m].tab
                  return (
                    <button
                      key={m}
                      className={`tab ${active ? "active" : ""}`}
                      onClick={() => setMetric(m)}
                      style={
                        active
                          ? {
                              background: tab.bg,
                              color: tab.fg,
                              borderColor: tab.border,
                            }
                          : undefined
                      }
                    >
                      {metricConfig[m].label}
                    </button>
                  )
                })}
              </div>

              <div className="chartWrap">
                <canvas ref={canvasRef} />
              </div>

              <div className={`alertline ${alertCls}`}>
                {metricConfig[metric].status}
              </div>

              <div className="chips">
                <span className="chip">
                  <span
                    className="cDot"
                    style={{ background: "var(--warn)" }}
                  />
                  Incident captured
                </span>
                <span className="chip">
                  <span
                    className="cDot"
                    style={{ background: "var(--warn)" }}
                  />
                  Blockchain-sealed
                </span>
                <span className="chip">
                  <span className="cDot" style={{ background: "var(--ok)" }} />
                  Payment ready
                </span>
              </div>
            </div>
          </div>

          {/* From sensors to proof */}
          <div className="centerTitle">From sensors to proof</div>
          <div className="centerSub">
            Enthalpy turns real-world incidents into trusted digital evidence that
            can trigger compliance actions or payments.
          </div>

          <div className="grid3">
            <div className="stepCard">
              <div className="bar" style={{ background: "#1b73ff" }} />
              <div>
                <p className="stepTitle">🔔 Sensor event</p>
                <p className="stepText">
                  Temperature, vibration or CO₂ threshold exceeded.
                </p>
              </div>
            </div>

            <div className="stepCard">
              <div className="bar" style={{ background: "#f59e0b" }} />
              <div>
                <p className="stepTitle">🔒 Blockchain proof</p>
                <p className="stepText">
                  Event is hashed, timestamped and sealed on-chain.
                </p>
              </div>
            </div>

            <div className="stepCard">
              <div className="bar" style={{ background: "#22c55e" }} />
              <div>
                <p className="stepTitle">✅ Compliance / Payment</p>
                <p className="stepText">
                  Audit, penalty or automated payout is triggered.
                </p>
              </div>
            </div>
          </div>

          {/* Industries */}
          <div className="industryTitle">
            Industries where a few degrees cost millions
          </div>

          <div className="grid3">
            <div className="industryCard">
              <h3>Pharma &amp; Biotech</h3>
              <p>Audit-ready traceability.</p>
            </div>
            <div className="industryCard">
              <h3>Food &amp; Frozen</h3>
              <p>Prevent cold-chain failures.</p>
            </div>
            <div className="industryCard">
              <h3>Logistics &amp; 3PL</h3>
              <p>Proof of compliance.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="email">contact@enthalpy.site</div>
            <div className="loc">Tangier, Morocco</div>

            {/* ❌ SUPPRIMÉ : bouton du footer */}
          </div>
        </div>
      </section>

      {/* Popup */}
      <div className={`popup-overlay ${popupOpen ? "active" : ""}`}>
        <div className="popup">
          <button className="popup-close" onClick={closePopup} aria-label="Close">
            ×
          </button>
          <iframe title="Pilot access form" src={iframeSrc} />
        </div>
      </div>
    </>
  )
}
