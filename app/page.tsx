/* app/page.tsx */
"use client"

import React, { useEffect, useMemo, useState } from "react"

type Metric = "temp" | "humidity" | "vibration" | "co2"

const BG_IMAGE = "/assets/bg-ocean-satellite-1920x1080.jpg" // ou "/assets/bg-ocean.jpg"
const LOGO_IMAGE = "/assets/logo-transparent.png" // ou remplace ton logo.png par ce fichier

const SERIES: Record<
  Metric,
  { label: string; unit: string; data: number[]; alert: string; yMin?: number; yMax?: number }
> = {
  temp: {
    label: "Temp",
    unit: "°C",
    data: [4.2, 4.1, 4.3, 4.8, 5.4, 5.9, 6.1, 6.0, 5.7, 5.4, 5.2],
    alert: "Temperature excursion detected",
    yMin: 4,
    yMax: 6.5,
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    data: [58, 57, 58, 60, 62, 66, 68, 67, 65, 63, 62],
    alert: "Humidity drift detected",
    yMin: 50,
    yMax: 75,
  },
  vibration: {
    label: "Vibration",
    unit: "g",
    data: [0.12, 0.11, 0.13, 0.18, 0.22, 0.31, 0.28, 0.24, 0.21, 0.19, 0.17],
    alert: "Abnormal vibration detected",
    yMin: 0.05,
    yMax: 0.35,
  },
  co2: {
    label: "CO₂",
    unit: "ppm",
    data: [410, 415, 420, 435, 460, 520, 610, 690, 720, 710, 680],
    alert: "CO₂ level rising",
    yMin: 380,
    yMax: 760,
  },
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export default function Page() {
  // POPUP + FORM
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

  // DASHBOARD
  const [metric, setMetric] = useState<Metric>("temp")

  function openPopup() {
    setPopupOpen(true)
    setSubmitted(false)
    setErrorMsg("")
    setForm({ name: "", company: "", email: "", message: "", website: "" })
    document.documentElement.style.overflow = "hidden"
  }

  function closePopup() {
    setPopupOpen(false)
    setErrorMsg("")
    document.documentElement.style.overflow = ""
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (form.website.trim().length > 0) return // honeypot

    if (!form.company.trim()) return setErrorMsg("Company name is required.")
    if (!form.email.trim()) return setErrorMsg("Work email is required.")
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setErrorMsg("Please enter a valid email.")
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

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setErrorMsg(data?.error || `Something went wrong. (${res.status})`)
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
      if (e.key === "Escape") closePopup()
    }
    if (popupOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen])

  const chart = useMemo(() => {
    const s = SERIES[metric]
    // ✅ plus grand, plus “site du monde”
    const W = 760
    const H = 360
    const padX = 22
    const padY = 18

    const min =
      typeof s.yMin === "number" ? s.yMin : Math.min(...s.data) - (Math.max(...s.data) - Math.min(...s.data)) * 0.08
    const max =
      typeof s.yMax === "number" ? s.yMax : Math.max(...s.data) + (Math.max(...s.data) - Math.min(...s.data)) * 0.08

    const points = s.data
      .map((v, i) => {
        const x = padX + (i / (s.data.length - 1)) * (W - padX * 2)
        const t = (v - min) / (max - min || 1)
        const y = padY + (1 - clamp(t, 0, 1)) * (H - padY * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

    return { W, H, padX, padY, min, max, points, s }
  }, [metric])

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --blue2: #00c8ff;
          --dark: #071628;
          --muted: rgba(7, 22, 40, 0.72);

          --glass: rgba(255, 255, 255, 0.55);
          --glassStrong: rgba(255, 255, 255, 0.7);
          --stroke: rgba(255, 255, 255, 0.22);

          --shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
          --shadow2: 0 18px 55px rgba(0, 0, 0, 0.18);

          --ok: #22c55e;
          --warn: #f59e0b;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          height: 100%;
          width: 100%;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: var(--dark);
          overflow-x: hidden; /* ✅ pas de bouge/scroll horizontal */
          background: #081425;
        }

        /* ✅ Background FIXE sans “background-attachment:fixed” (meilleur mobile) */
        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: url("${BG_IMAGE}") center / cover no-repeat;
          transform: translateZ(0);
        }
        .bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(900px 520px at 18% 12%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.08)),
            radial-gradient(1100px 700px at 85% 18%, rgba(27, 115, 255, 0.18), rgba(27, 115, 255, 0.03)),
            linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.25));
          pointer-events: none;
        }

        .wrap {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .container {
          width: min(1560px, calc(100% - 40px));
          margin: 0 auto;
        }

        /* ✅ HEADER plus visible */
        header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 14px 0;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.22);
        }

        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        /* ✅ zone brand plus lisible (comme sur ton image) */
        .brandPill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(12px);
        }

        .brandLogo {
          width: 46px;
          height: 46px;
          object-fit: contain;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.25));
        }

        .brandText strong {
          display: block;
          font-weight: 800;
          font-size: 16px;
          line-height: 1.05;
          color: rgba(7, 22, 40, 0.92);
        }

        .brandText span {
          display: block;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: rgba(7, 22, 40, 0.62);
          font-weight: 750;
          margin-top: 3px;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.34);
          background: rgba(255, 255, 255, 0.18);
          color: #061325;
          font-weight: 750;
          cursor: pointer;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
        }

        .btnPrimary {
          border: none;
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: #fff;
          box-shadow: 0 18px 48px rgba(27, 115, 255, 0.35);
        }

        /* MAIN */
        main {
          flex: 1;
          padding: 28px 0 40px;
        }

        /* ✅ GROS “PANEL” central (comme un vrai site) */
        .shell {
          background: var(--glass);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 28px;
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
          padding: 26px;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.25fr 0.95fr;
          gap: 22px;
          align-items: stretch;
        }

        .card {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 22px;
          backdrop-filter: blur(14px);
          box-shadow: var(--shadow2);
        }

        /* HERO */
        .heroCard {
          position: relative;
          overflow: hidden;
          padding: 28px 28px 22px;
          min-height: 520px; /* ✅ grand */
        }

        .heroCard::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("/assets/hero-iot-proof.png") right center / cover no-repeat;
          opacity: 0.42;
          filter: saturate(1.05) contrast(1.05);
          pointer-events: none;
        }

        .heroCard::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.88) 0%,
            rgba(255, 255, 255, 0.62) 55%,
            rgba(255, 255, 255, 0.16) 100%
          );
          pointer-events: none;
        }

        .heroInner {
          position: relative;
          z-index: 2;
          max-width: 860px;
        }

        h1 {
          margin: 0;
          letter-spacing: -0.03em;
          line-height: 1.04;
          font-size: clamp(40px, 3.4vw, 64px); /* ✅ big & premium */
          font-weight: 900;
        }

        .accent {
          color: var(--blue);
        }

        .lead {
          margin-top: 14px;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(7, 22, 40, 0.8);
          font-weight: 560;
          max-width: 760px;
        }

        .chips {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.34);
          font-size: 12px;
          font-weight: 800;
          color: rgba(7, 22, 40, 0.84);
          backdrop-filter: blur(10px);
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 99px;
          background: var(--blue);
          box-shadow: 0 0 0 6px rgba(27, 115, 255, 0.16);
        }
        .dotOk {
          background: var(--ok);
          box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.16);
        }
        .dotWarn {
          background: var(--warn);
          box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.16);
        }

        /* CHART */
        .chartCard {
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 520px; /* ✅ grand */
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTitle {
          font-weight: 900;
          font-size: 13px;
          color: rgba(7, 22, 40, 0.9);
        }

        .live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.16);
          border: 1px solid rgba(34, 197, 94, 0.2);
          font-size: 12px;
          font-weight: 850;
        }

        .liveDot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.14);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .tab {
          border-radius: 999px;
          padding: 10px 10px;
          font-size: 12px;
          font-weight: 850;
          border: 1px solid rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          color: rgba(7, 22, 40, 0.9);
          backdrop-filter: blur(10px);
        }

        .tabActive {
          background: rgba(27, 115, 255, 0.2);
          border-color: rgba(27, 115, 255, 0.28);
        }

        .chartWrap {
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.26);
          border-radius: 16px;
          padding: 12px 12px 10px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .axisLabel {
          font-size: 11px;
          fill: rgba(7, 22, 40, 0.58);
          font-weight: 850;
        }

        .alert {
          font-size: 12px;
          font-weight: 900;
          color: rgba(122, 77, 0, 0.95);
          background: rgba(245, 158, 11, 0.18);
          border: 1px solid rgba(245, 158, 11, 0.22);
          padding: 11px 12px;
          border-radius: 14px;
        }

        /* ✅ BAS plus vif / plus visible */
        .below {
          margin-top: 18px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(14px);
        }

        .sectionTitle {
          text-align: center;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 12px;
          color: rgba(7, 22, 40, 0.92);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .feat {
          padding: 14px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: var(--shadow2);
        }

        .feat strong {
          display: block;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .feat p {
          margin: 0;
          font-size: 12px;
          line-height: 1.35;
          color: rgba(7, 22, 40, 0.78);
          font-weight: 650;
        }

        .industries {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .ind {
          padding: 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: var(--shadow2);
        }
        .ind strong {
          display: block;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 4px;
        }
        .ind span {
          display: block;
          font-size: 12px;
          font-weight: 650;
          color: rgba(7, 22, 40, 0.75);
        }

        .footer {
          margin-top: 12px;
          text-align: center;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 12px 26px rgba(0, 0, 0, 0.35);
        }
        .footer small {
          display: block;
          margin-top: 6px;
          font-weight: 850;
          color: rgba(255, 255, 255, 0.88);
        }

        /* POPUP */
        .popup-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .popup-overlay.active {
          display: flex;
        }

        .popup {
          background: rgba(255, 255, 255, 0.94);
          width: min(720px, 94vw); /* ✅ pas de zoom auto */
          max-height: 86vh; /* ✅ pas de “grandissement” */
          overflow: auto;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(12px);
        }

        .popupHead {
          padding: 18px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(180deg, rgba(27, 115, 255, 0.12), rgba(255, 255, 255, 0.94));
        }

        .popupTitle {
          margin: 0;
          font-weight: 950;
          letter-spacing: -0.02em;
          font-size: 18px;
        }

        .popupSub {
          margin: 6px 0 0;
          color: rgba(7, 22, 40, 0.78);
          font-weight: 650;
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
          font-weight: 850;
          color: rgba(7, 22, 40, 0.7);
          margin: 0 0 6px;
        }

        /* ✅ IMPORTANT: 16px minimum sinon iPhone zoom */
        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          padding: 12px 12px;
          font-size: 16px; /* ✅ anti-zoom iOS */
          font-weight: 700;
          outline: none;
          background: rgba(255, 255, 255, 0.95);
          color: #061325;
        }

        input:focus,
        textarea:focus {
          border-color: rgba(27, 115, 255, 0.55);
          box-shadow: 0 0 0 4px rgba(27, 115, 255, 0.12);
        }

        textarea {
          min-height: 120px;
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
          font-weight: 900;
          font-size: 12px;
        }

        .successBox {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 14px;
          background: rgba(34, 197, 94, 0.14);
          border: 1px solid rgba(34, 197, 94, 0.22);
          color: #061325;
          font-weight: 800;
          font-size: 13px;
          line-height: 1.45;
        }

        .successIcon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          font-weight: 950;
          color: #15803d;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .popup-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.95);
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

        /* ✅ RESPONSIVE */
        @media (max-width: 980px) {
          .heroGrid {
            grid-template-columns: 1fr;
          }
          .heroCard,
          .chartCard {
            min-height: auto;
          }
          .features,
          .industries {
            grid-template-columns: 1fr;
          }
          .row {
            grid-template-columns: 1fr;
          }
          h1 {
            font-size: clamp(34px, 8vw, 48px);
          }
          .shell {
            padding: 18px;
          }
        }
      `}</style>

      <div className="bg" aria-hidden="true" />

      <div className="wrap">
        {/* HEADER */}
        <header>
          <div className="container">
            <nav>
              <div className="brandPill">
                <img className="brandLogo" src={LOGO_IMAGE} alt="Enthalpy" />
                <div className="brandText">
                  <strong>Enthalpy</strong>
                  <span>COLD &amp; CRITICAL MONITORING</span>
                </div>
              </div>

              <button className="btn btnPrimary" onClick={openPopup}>
                Request pilot access
              </button>
            </nav>
          </div>
        </header>

        {/* MAIN */}
        <main>
          <div className="container">
            <div className="shell">
              <div className="heroGrid">
                {/* LEFT: HERO */}
                <section className="card heroCard">
                  <div className="heroInner">
                    <h1>
                      Smart IoT sensors for critical goods.
                      <br />
                      <span className="accent">Blockchain proof &amp; payment when something goes wrong.</span>
                    </h1>

                    <div className="lead">
                      Enthalpy monitors <b>temperature</b>, <b>humidity</b>, <b>vibration</b> and <b>CO₂</b> in real time across{" "}
                      <b>warehouses</b>, <b>trucks</b> and <b>containers</b>.
                      <br />
                      When an incident happens, the data is <b>timestamped</b> and sealed as <b>proof on blockchain</b> — and the same
                      blockchain record can trigger <b>automatic payment</b> (partners, insurance, claims, SLA).
                    </div>

                    <div className="chips">
                      <span className="chip">
                        <span className="dot" />
                        Temperature • Humidity • CO₂ • Vibration
                      </span>
                      <span className="chip">
                        <span className="dot dotOk" />
                        Proof (blockchain-sealed)
                      </span>
                      <span className="chip">
                        <span className="dot dotWarn" />
                        Payment (blockchain-triggered)
                      </span>
                    </div>
                  </div>
                </section>

                {/* RIGHT: CHART */}
                <section className="card chartCard" aria-label="Analytics">
                  <div className="topRow">
                    <div className="cardTitle">Analytics</div>
                    <div className="live">
                      <span className="liveDot" />
                      Live
                    </div>
                  </div>

                  <div className="tabs">
                    {(["temp", "humidity", "vibration", "co2"] as Metric[]).map((m) => (
                      <button
                        key={m}
                        className={`tab ${metric === m ? "tabActive" : ""}`}
                        onClick={() => setMetric(m)}
                        type="button"
                      >
                        {SERIES[m].label}
                      </button>
                    ))}
                  </div>

                  <div className="chartWrap">
                    <svg width="100%" viewBox={`0 0 ${chart.W} ${chart.H}`} role="img" aria-label="Sensor chart">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const y = chart.padY + (i / 4) * (chart.H - chart.padY * 2)
                        return (
                          <line
                            key={i}
                            x1={chart.padX}
                            y1={y}
                            x2={chart.W - chart.padX}
                            y2={y}
                            stroke="rgba(7, 22, 40, 0.10)"
                            strokeWidth="1"
                          />
                        )
                      })}

                      <text x={chart.padX} y={15} className="axisLabel">
                        {chart.max.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                      </text>
                      <text x={chart.padX} y={chart.H - 5} className="axisLabel">
                        {chart.min.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                      </text>

                      <polyline
                        points={chart.points}
                        fill="none"
                        stroke="rgba(27,115,255,0.95)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="alert">{chart.s.alert}</div>
                </section>
              </div>

              {/* BELOW (plus visible) */}
              <div className="below">
                <h3 className="sectionTitle">From sensors to proof</h3>

                <div className="features">
                  <div className="feat">
                    <strong>Evidence</strong>
                    <p>Incidents captured, timestamped, and stored as proof.</p>
                  </div>
                  <div className="feat">
                    <strong>Instant alerts</strong>
                    <p>Real-time notifications when limits are exceeded.</p>
                  </div>
                  <div className="feat">
                    <strong>Blockchain</strong>
                    <p>Proof + payment flows secured via blockchain records.</p>
                  </div>
                </div>

                <h3 className="sectionTitle" style={{ marginTop: 14 }}>
                  Industries where a few degrees cost millions
                </h3>

                <div className="industries">
                  <div className="ind">
                    <strong>Pharma &amp; Biotech</strong>
                    <span>Audit-ready traceability &amp; compliance proof.</span>
                  </div>
                  <div className="ind">
                    <strong>Food &amp; Frozen</strong>
                    <span>Prevent cold-chain failures &amp; claims.</span>
                  </div>
                  <div className="ind">
                    <strong>Logistics &amp; 3PL</strong>
                    <span>SLA evidence + partner payments automation.</span>
                  </div>
                </div>

                <div className="footer">
                  contact@enthalpy.site
                  <small>Tangier, Morocco</small>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* POPUP */}
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
              <p className="popupSub">Tell us about your company and use case. We’ll reply quickly.</p>
            </div>

            <div className="popupBody">
              {submitted ? (
                <div className="successBox">
                  <div className="successIcon">✓</div>
                  <div>
                    ✅ Request received. A confirmation email has been sent. If you don’t see it, please check Spam or contact{" "}
                    <b>contact@enthalpy.site</b>.
                  </div>
                </div>
              ) : (
                <form onSubmit={submitForm}>
                  {/* Honeypot */}
                  <div className="hp">
                    <label>
                      Website
                      <input name="website" value={form.website} onChange={onChange} autoComplete="off" />
                    </label>
                  </div>

                  <div className="row">
                    <div>
                      <label>Name (optional)</label>
                      <input name="name" placeholder="Your name" value={form.name} onChange={onChange} autoComplete="name" />
                    </div>
                    <div>
                      <label>Company Name *</label>
                      <input name="company" placeholder="Company" value={form.company} onChange={onChange} required />
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
                      placeholder="What do you monitor? (assets, routes, limits, alerts needed...)"
                      value={form.message}
                      onChange={onChange}
                      required
                    />
                  </div>

                  {errorMsg ? <div className="err">{errorMsg}</div> : null}

                  <div className="actions">
                    <button type="button" className="btn" onClick={closePopup} disabled={submitting}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btnPrimary" disabled={submitting}>
                      {submitting ? "Sending..." : "Submit request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
