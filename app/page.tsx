"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Chart from "chart.js/auto"

type Metric = "temp" | "hum" | "vib" | "co2"

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const [metric, setMetric] = useState<Metric>("temp")

  // Popup + form
  const [popupOpen, setPopupOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    website: "", // honeypot
  })

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
    setSubmitted(false)
    setErrorMsg("")
    setForm({ name: "", company: "", email: "", message: "", website: "" })
  }
  function closePopup() {
    setPopupOpen(false)
    setErrorMsg("")
  }

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function submitForm(e: FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (form.website.trim().length > 0) return

    if (!form.company.trim()) return setErrorMsg("Company name is required.")
    if (!form.email.trim()) return setErrorMsg("Work email is required.")
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return setErrorMsg("Please enter a valid email.")
    if (!form.message.trim()) return setErrorMsg("Message is required.")

    setSubmitting(true)
    try {
      const res = await fetch("/api/pilot-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          website: form.website.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(data?.error || "Something went wrong. Try again.")
        return
      }

      setSubmitted(true)
    } catch {
      setErrorMsg("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ESC close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopupOpen(false)
    }
    if (popupOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [popupOpen])

  // Chart create
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

  // Chart update
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
          font-weight: 450; /* ✅ plus fin */
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            var(--bg);
          color: var(--dark);
        }
        strong {
          font-weight: 600; /* ✅ pas “bold” agressif */
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
          font-weight: 650;
        }
        .logo span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #4a5d7a;
          font-weight: 600; /* ✅ plus fin */
          white-space: nowrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 650; /* ✅ */
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.25);
        }
        .btn-ghost {
          background: rgba(0, 0, 0, 0.04);
          color: #0b1c33;
          border: 1px solid rgba(0, 0, 0, 0.08);
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
          font-weight: 700; /* ✅ */
        }
        h1 span {
          color: var(--blue);
        }

        .hero-copy {
          margin-top: 14px;
          color: #2b3d5a;
          font-weight: 480; /* ✅ */
          max-width: 560px;
          line-height: 1.55;
          font-size: 14px;
        }
        .hero-tagline {
          margin-top: 12px;
          color: var(--blue);
          font-weight: 600; /* ✅ */
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
          font-weight: 600;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #2b3d5a;
          font-weight: 520; /* ✅ */
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
          font-weight: 650; /* ✅ */
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
          font-weight: 600; /* ✅ */
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
          font-weight: 600; /* ✅ */
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
          font-weight: 700; /* ✅ */
          font-size: 18px;
          margin: 24px 0 6px;
          letter-spacing: -0.01em;
        }
        .centerSub {
          text-align: center;
          margin: 0 auto 22px;
          max-width: 720px;
          color: var(--muted);
          font-weight: 480; /* ✅ */
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
          font-weight: 650; /* ✅ */
          margin: 0 0 4px;
          font-size: 13px;
        }
        .stepText {
          margin: 0;
          color: #2b3d5a;
          font-weight: 480; /* ✅ */
          font-size: 12px;
          line-height: 1.4;
        }

        .industryTitle {
          text-align: center;
          font-weight: 700; /* ✅ */
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
          font-weight: 650; /* ✅ */
          font-size: 14px;
        }
        .industryCard p {
          margin: 0;
          color: #2b3d5a;
          font-weight: 480; /* ✅ */
          font-size: 12px;
        }

        .footer {
          text-align: center;
          padding: 26px 0 34px;
          color: #2b3d5a;
          font-weight: 480; /* ✅ */
          font-size: 12px;
        }
        .footer .email {
          font-weight: 650; /* ✅ */
          color: #0b1c33;
          font-size: 13px;
        }
        .footer .loc {
          margin-top: 6px;
          color: #6c7a92;
          font-weight: 520; /* ✅ */
        }

        /* Popup form */
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
          width: 720px;
          max-width: 100%;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .popupHead {
          padding: 18px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: linear-gradient(
            180deg,
            rgba(27, 115, 255, 0.06),
            rgba(255, 255, 255, 1)
          );
        }
        .popupTitle {
          margin: 0;
          font-weight: 700; /* ✅ */
          letter-spacing: -0.02em;
          font-size: 18px;
        }
        .popupSub {
          margin: 6px 0 0;
          color: #2b3d5a;
          font-weight: 480; /* ✅ */
          font-size: 12px;
          line-height: 1.4;
        }
        .popupBody {
          padding: 16px 18px 18px;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        label {
          display: block;
          font-size: 12px;
          font-weight: 550; /* ✅ plus fin */
          color: #4a5d7a; /* ✅ couleur étiquettes */
          margin: 0 0 6px;
        }
        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 12px 12px;
          font-size: 13px;
          font-weight: 450; /* ✅ */
          outline: none;
          background: #fff;
        }
        input:focus,
        textarea:focus {
          border-color: rgba(27, 115, 255, 0.55);
          box-shadow: 0 0 0 4px rgba(27, 115, 255, 0.12);
        }
        textarea {
          min-height: 110px;
          resize: vertical;
        }
        .actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 12px;
        }
        .err {
          margin-top: 10px;
          color: #b91c1c;
          font-weight: 600;
          font-size: 12px;
        }
        .okBox {
          padding: 14px;
          border-radius: 14px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #0b1c33;
          font-weight: 520;
          font-size: 13px;
          line-height: 1.4;
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

        .hp {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .grid3 {
            grid-template-columns: 1fr;
          }
          .row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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

            <button className="btn btn-primary" onClick={openPopup}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

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
            </div>

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
                  <span className="cDot" style={{ background: "var(--warn)" }} />
                  Incident captured
                </span>
                <span className="chip">
                  <span className="cDot" style={{ background: "var(--warn)" }} />
                  Blockchain-sealed
                </span>
                <span className="chip">
                  <span className="cDot" style={{ background: "var(--ok)" }} />
                  Payment ready
                </span>
              </div>
            </div>
          </div>

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

          <div className="footer">
            <div className="email">contact@enthalpy.site</div>
            <div className="loc">Tangier, Morocco</div>
          </div>
        </div>
      </section>

      <div
        className={`popup-overlay ${popupOpen ? "active" : ""}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closePopup()
        }}
      >
        <div className="popup" onMouseDown={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={closePopup} aria-label="Close">
            ×
          </button>

          <div className="popupHead">
            <h3 className="popupTitle">Request pilot access</h3>
            <p className="popupSub">
              Tell us about your company and use case. We’ll reply quickly.
            </p>
          </div>

          <div className="popupBody">
            {submitted ? (
              <div className="okBox">
                ✅ Request sent. You’ll receive a short confirmation email.
                <br />
                If you don’t see it: check Spam, or email{" "}
                <b>contact@enthalpy.site</b>.
              </div>
            ) : (
              <form onSubmit={submitForm}>
                <div className="hp">
                  <label>
                    Website
                    <input
                      name="website"
                      value={form.website}
                      onChange={onChange}
                      autoComplete="off"
                    />
                  </label>
                </div>

                <div className="row">
                  <div>
                    <label>Name (optional)</label>
                    <input
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={onChange}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label>Company Name *</label>
                    <input
                      name="company"
                      placeholder="Company"
                      value={form.company}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Work Email *</label>
                  <input
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={onChange}
                    required
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Message *</label>
                  <textarea
                    name="message"
                    placeholder="What do you monitor? (assets, route, temperature limits, alerts needed...)"
                    value={form.message}
                    onChange={onChange}
                    required
                  />
                </div>

                {errorMsg ? <div className="err">{errorMsg}</div> : null}

                <div className="actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={closePopup}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Submit request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
