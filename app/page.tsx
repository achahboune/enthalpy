/* app/page.tsx */
"use client"

import React, { useEffect, useMemo, useState } from "react"

type Metric = "temp" | "humidity" | "vibration" | "co2"

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

const STATUS: Record<Metric, "ok" | "warn" | "risk"> = {
  temp: "risk",
  humidity: "warn",
  vibration: "warn",
  co2: "ok",
}

const STATUS_LABEL: Record<"ok" | "warn" | "risk", string> = {
  ok: "Normal range",
  warn: "Drift detected",
  risk: "Excursion detected",
}

const STATUS_STROKE: Record<"ok" | "warn" | "risk", string> = {
  ok: "rgba(34,197,94,0.95)",
  warn: "rgba(245,158,11,0.95)",
  risk: "rgba(239,68,68,0.95)",
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
  const status = STATUS[metric]

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
      if (e.key === "Escape") setPopupOpen(false)
    }
    if (popupOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [popupOpen])

  const chart = useMemo(() => {
    const s = SERIES[metric]
    const W = 620
    const H = 300
    const padX = 18
    const padY = 16

    const min =
      typeof s.yMin === "number"
        ? s.yMin
        : Math.min(...s.data) - (Math.max(...s.data) - Math.min(...s.data)) * 0.08
    const max =
      typeof s.yMax === "number"
        ? s.yMax
        : Math.max(...s.data) + (Math.max(...s.data) - Math.min(...s.data)) * 0.08

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
          --dark: #061325;
          --muted: rgba(6, 19, 37, 0.74);

          --glass: rgba(255, 255, 255, 0.72);
          --glassStrong: rgba(255, 255, 255, 0.58);
          --stroke: rgba(255, 255, 255, 0.20);

          --ok: #22c55e;
          --warn: #f59e0b;
          --risk: #ef4444;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          height: 100%;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: var(--dark);
          overflow-x: hidden;

          /* background */
          background: url("/assets/bg-ocean.jpg") center / cover no-repeat fixed;
          position: relative;
        }

        /* voile global léger (pour lisibilité, mais on voit bien l’arrière-plan) */
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          background: radial-gradient(900px 520px at 18% 12%, rgba(255, 255, 255, 0.30), rgba(255, 255, 255, 0.08)),
            radial-gradient(1000px 650px at 82% 16%, rgba(27, 115, 255, 0.12), rgba(27, 115, 255, 0.02)),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.22));
          pointer-events: none;
          z-index: 0;
        }

        /* ✅ Satellite BIEN VISIBLE à gauche */
        body::after {
          content: "";
          position: fixed;
          inset: 0;
          background: url("/assets/satellite.png") left 6% top 12% / 520px auto no-repeat;
          opacity: 0.96;
          filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.22));
          pointer-events: none;
          z-index: 0;
        }

        .wrap {
          position: relative;
          z-index: 1;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }

        .container {
          width: min(1240px, calc(100% - 40px));
          margin: 0 auto;
        }

        header {
          position: sticky;
          top: 0;
          z-index: 20;
          padding: 14px 0;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ✅ logo fond plus clean (minimal) */
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
        }

        .brand img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        .brand strong {
          display: block;
          font-weight: 560;
          font-size: 14px;
          line-height: 1.1;
        }

        .brand span {
          display: block;
          font-size: 10px;
          letter-spacing: 0.18em;
          color: rgba(6, 19, 37, 0.56);
          font-weight: 520;
          margin-top: 3px;
          white-space: nowrap;
        }

        .btn {
          padding: 11px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.30);
          background: rgba(255, 255, 255, 0.10);
          color: #061325;
          font-weight: 560;
          cursor: pointer;
          backdrop-filter: blur(12px);
        }

        .btnPrimary {
          border: none;
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.26);
        }

        main {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .stage {
          width: 100%;
          padding: 22px 0 28px;
        }

        .layout {
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          gap: 18px;
          align-items: stretch;
        }

        .glass {
          background: var(--glass);
          border: 1px solid rgba(255, 255, 255, 0.20);
          border-radius: 18px;
          backdrop-filter: blur(14px);
        }

        .heroCard {
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* ✅ terminal/pc derrière plus visible */
        .heroCard::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("/assets/hero-iot-proof.png") right center / cover no-repeat;
          opacity: 0.62;
          filter: saturate(1.05) contrast(1.05);
          pointer-events: none;
        }

        /* ✅ voile beaucoup plus fin (on voit ce qui est derrière) */
        .heroCard::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.46) 0%,
            rgba(255, 255, 255, 0.24) 56%,
            rgba(255, 255, 255, 0.10) 100%
          );
          pointer-events: none;
        }

        .heroInner {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        /* ✅ typo fine / minimal */
        h1 {
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.06;
          font-size: clamp(30px, 3.1vw, 48px);
          font-weight: 560;
        }

        .accent {
          color: var(--blue);
          font-weight: 560;
        }

        /* ✅ TRANSPARENT + lisible (frosted glass) */
        .lead {
          position: relative;
          margin-top: 12px;
          max-width: 720px;
          padding: 14px 16px;
          border-radius: 14px;

          /* ultra-transparent, mais lisible */
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(18px) saturate(160%);
          -webkit-backdrop-filter: blur(18px) saturate(160%);

          color: rgba(6, 12, 24, 0.95);
          font-weight: 650;
          font-size: 18px;
          line-height: 1.7;

          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.10);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55), 0 10px 22px rgba(0, 0, 0, 0.22);
        }

        /* micro "scrim" interne pour stabiliser le contraste sans rendre opaque */
        .lead::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.06)
          );
        }

        /* pas de bold agressif */
        b,
        strong {
          font-weight: 560;
        }

        .chips {
          margin-top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.48);
          border: 1px solid rgba(255, 255, 255, 0.24);
          font-size: 12px;
          font-weight: 520;
          color: rgba(6, 19, 37, 0.78);
          backdrop-filter: blur(10px);
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 99px;
          background: var(--blue);
          box-shadow: 0 0 0 5px rgba(27, 115, 255, 0.12);
        }

        .dot-ok {
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.12);
        }
        .dot-warn {
          background: var(--warn);
          box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.12);
        }
        .dot-risk {
          background: var(--risk);
          box-shadow: 0 0 0 5px rgba(239, 68, 68, 0.12);
        }

        .chartCard {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.42);
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTitle {
          font-weight: 560;
          font-size: 13px;
          color: rgba(6, 19, 37, 0.78);
        }

        .live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.18);
          font-size: 12px;
          font-weight: 520;
          color: rgba(6, 19, 37, 0.70);
        }

        .liveDot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: var(--ok);
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .tab {
          border-radius: 999px;
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 520;
          border: 1px solid rgba(255, 255, 255, 0.20);
          background: rgba(255, 255, 255, 0.18);
          cursor: pointer;
          color: rgba(6, 19, 37, 0.78);
          backdrop-filter: blur(10px);
        }

        .tabActive {
          background: rgba(27, 115, 255, 0.14);
          border-color: rgba(27, 115, 255, 0.20);
          color: rgba(6, 19, 37, 0.86);
        }

        .chartWrap {
          background: rgba(255, 255, 255, 0.60);
          border: 1px solid rgba(255, 255, 255, 0.20);
          border-radius: 16px;
          padding: 10px 10px 8px;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .axisLabel {
          font-size: 11px;
          fill: rgba(6, 19, 37, 0.52);
          font-weight: 520;
        }

        /* ✅ alert couleurs vert/orange/rouge */
        .alert {
          font-size: 12px;
          font-weight: 520;
          padding: 10px 12px;
          border-radius: 14px;
        }
        .alert-ok {
          color: rgba(17, 94, 45, 0.95);
          background: rgba(34, 197, 94, 0.14);
          border: 1px solid rgba(34, 197, 94, 0.22);
        }
        .alert-warn {
          color: rgba(122, 77, 0, 0.95);
          background: rgba(245, 158, 11, 0.16);
          border: 1px solid rgba(245, 158, 11, 0.22);
        }
        .alert-risk {
          color: rgba(127, 29, 29, 0.95);
          background: rgba(239, 68, 68, 0.14);
          border: 1px solid rgba(239, 68, 68, 0.22);
        }

        /* ✅ bas plus lisible, plus bleu, moins “noir” */
        .lower {
          margin-top: 14px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.40);
        }

        .lowerHead {
          text-align: center;
          font-weight: 560;
          font-size: 13px;
          color: rgba(6, 19, 37, 0.72);
          margin: 0 0 10px;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .feat {
          padding: 12px 12px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.24);
          backdrop-filter: blur(10px);
        }

        .feat strong {
          display: block;
          font-size: 13px;
          font-weight: 560;
          color: var(--blue);
          margin-bottom: 4px;
        }

        .feat p {
          margin: 0;
          font-size: 13px;
          line-height: 1.38;
          color: rgba(6, 19, 37, 0.72);
          font-weight: 460;
        }

        .industriesTitle {
          margin: 12px 0 10px;
          text-align: center;
          font-weight: 560;
          color: rgba(6, 19, 37, 0.72);
          font-size: 13px;
        }

        .industries {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .industry {
          padding: 12px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.24);
        }

        .industry h4 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 560;
          color: var(--blue);
        }

        .industry p {
          margin: 0;
          font-size: 13px;
          font-weight: 460;
          color: rgba(6, 19, 37, 0.72);
          line-height: 1.35;
        }

        /* ✅ footer bien visible */
        .footer {
          margin-top: 12px;
          display: flex;
          justify-content: center;
        }

        .footerPill {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.30);
          color: rgba(6, 19, 37, 0.90);
          font-weight: 520;
          backdrop-filter: blur(10px);
        }

        .footerPill strong {
          font-weight: 560;
          color: var(--blue);
        }

        .footerPill small {
          font-weight: 460;
          color: rgba(6, 19, 37, 0.72);
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
          padding: 18px;
        }

        .popup-overlay.active {
          display: flex;
        }

        .popup {
          background: rgba(255, 255, 255, 0.94);
          width: 720px;
          max-width: 100%;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(12px);
        }

        .popupHead {
          padding: 18px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(180deg, rgba(27, 115, 255, 0.10), rgba(255, 255, 255, 0.94));
        }

        .popupTitle {
          margin: 0;
          font-weight: 600;
          letter-spacing: -0.02em;
          font-size: 18px;
        }

        .popupSub {
          margin: 6px 0 0;
          color: rgba(6, 19, 37, 0.72);
          font-weight: 460;
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
          font-weight: 520;
          color: rgba(6, 19, 37, 0.70);
          margin: 0 0 6px;
        }

        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          padding: 12px 12px;
          font-size: 14px;
          font-weight: 520;
          outline: none;
          background: rgba(255, 255, 255, 0.92);
          color: #061325;
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
          font-weight: 560;
          font-size: 12px;
        }

        .successBox {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 14px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.18);
          color: #061325;
          font-weight: 520;
          font-size: 13px;
          line-height: 1.45;
        }

        .successIcon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(34, 197, 94, 0.16);
          border: 1px solid rgba(34, 197, 94, 0.24);
          font-weight: 700;
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
          background: rgba(255, 255, 255, 0.94);
          font-size: 22px;
          cursor: pointer;
        }

        .hp {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        /* ✅ responsive mobile + pas de zoom iPhone */
        @media (max-width: 1040px) {
          body {
            background-attachment: scroll;
          }

          main {
            align-items: flex-start;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .features,
          .industries {
            grid-template-columns: 1fr;
          }

          .row {
            grid-template-columns: 1fr;
          }

          input,
          textarea {
            font-size: 16px;
          }

          /* satellite plus petit mais toujours visible */
          body::after {
            background-position: left 5% top 8%;
            background-size: 320px auto;
            opacity: 0.98;
          }
        }
      `}</style>

      <div className="wrap">
        <header>
          <div className="container">
            <nav>
              <div className="brand">
                <img src="/assets/logo.png" alt="Enthalpy" />
                <div>
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

        <main>
          <div className="container">
            <div className="stage">
              <div className="layout">
                <section className="glass heroCard">
                  <div className="heroInner">
                    <h1>
                      Smart IoT sensors for critical goods.
                      <br />
                      <span className="accent">Blockchain proof &amp; payment when something goes wrong.</span>
                    </h1>

                    <div className="lead">
                      Enthalpy monitors temperature, humidity, vibration and CO₂
                      in real time across warehouses, trucks and containers.
                      <br />
                      When an incident happens, the data is timestamped and sealed
                      as proof on blockchain — and the same blockchain record can
                      trigger automatic payment (partners, insurance, claims, SLA).
                    </div>

                    <div className="chips">
                      <span className="chip">
                        <span className={`dot dot-${STATUS.temp}`} />
                        Temp
                      </span>
                      <span className="chip">
                        <span className={`dot dot-${STATUS.humidity}`} />
                        Humidity
                      </span>
                      <span className="chip">
                        <span className={`dot dot-${STATUS.vibration}`} />
                        Vibration
                      </span>
                      <span className="chip">
                        <span className={`dot dot-${STATUS.co2}`} />
                        CO₂
                      </span>

                      <span className="chip">
                        <span className="dot dot-ok" />
                        Proof (blockchain-sealed)
                      </span>
                      <span className="chip">
                        <span className="dot dot-warn" />
                        Payment (blockchain-triggered)
                      </span>
                    </div>
                  </div>
                </section>

                <section className="glass chartCard" aria-label="Analytics">
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
                            stroke="rgba(6, 19, 37, 0.10)"
                            strokeWidth="1"
                          />
                        )
                      })}

                      <text x={chart.padX} y={14} className="axisLabel">
                        {chart.max.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                      </text>
                      <text x={chart.padX} y={chart.H - 4} className="axisLabel">
                        {chart.min.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                      </text>

                      <polyline
                        points={chart.points}
                        fill="none"
                        stroke={STATUS_STROKE[status]}
                        strokeWidth="3.2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className={`alert alert-${status}`}>
                    {chart.s.alert} — {STATUS_LABEL[status]}
                  </div>
                </section>
              </div>

              <section className="glass lower">
                <p className="lowerHead">From sensors to proof</p>

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

                <div className="industriesTitle">Industries where a few degrees cost millions</div>

                <div className="industries">
                  <div className="industry">
                    <h4>Pharma &amp; Biotech</h4>
                    <p>Audit-ready traceability &amp; compliance proof.</p>
                  </div>
                  <div className="industry">
                    <h4>Food &amp; Frozen</h4>
                    <p>Prevent cold-chain failures &amp; claims.</p>
                  </div>
                  <div className="industry">
                    <h4>Logistics &amp; 3PL</h4>
                    <p>SLA evidence + partner payments automation.</p>
                  </div>
                </div>

                <div className="footer">
                  <div className="footerPill">
                    <strong>contact@enthalpy.site</strong>
                    <small>Tangier, Morocco</small>
                  </div>
                </div>
              </section>
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
                    Request received. A confirmation email has been sent. If you don’t see it, please check Spam or contact{" "}
                    <b>contact@enthalpy.site</b>.
                  </div>
                </div>
              ) : (
                <form onSubmit={submitForm}>
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
