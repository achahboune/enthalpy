"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Chart from "chart.js/auto"

type Metric = "temp" | "hum" | "vib" | "co2"

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const [metric, setMetric] = useState<Metric>("temp")

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

  const metricConfig = useMemo(() => ({
    temp: {
      label: "Temp",
      data: [4.2, 4.3, 5.9, 6.2, 5.3, 4.7],
      status: "Temperature excursion detected",
      cls: "warn",
      line: "#f59e0b",
    },
    hum: {
      label: "Humidity",
      data: [45, 46, 44, 43, 42, 41],
      status: "Humidity stable",
      cls: "ok",
      line: "#1b73ff",
    },
    vib: {
      label: "Vibration",
      data: [1, 2, 8, 6, 2, 1],
      status: "Critical shock detected",
      cls: "risk",
      line: "#ef4444",
    },
    co2: {
      label: "CO₂",
      data: [400, 420, 480, 650, 720, 680],
      status: "CO₂ level rising",
      cls: "warn",
      line: "#1b73ff",
    },
  }), [])

  function openPopup() {
    setPopupOpen(true)
    setSubmitted(false)
    setErrorMsg("")
    setForm({ name: "", company: "", email: "", message: "", website: "" })
  }

  function closePopup() {
    setPopupOpen(false)
  }

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (form.website.trim()) return // honeypot

    if (!form.company.trim()) return setErrorMsg("Company is required")
    if (!form.email.trim()) return setErrorMsg("Email is required")
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return setErrorMsg("Invalid email")
    if (!form.message.trim()) return setErrorMsg("Message is required")

    setSubmitting(true)
    try {
      const res = await fetch("/api/pilot-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setErrorMsg("Error sending request")
    } finally {
      setSubmitting(false)
    }
  }

  // CHART
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
          borderColor: metricConfig.temp.line,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [metricConfig])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data =
      metricConfig[metric].data as any
    ;(chartRef.current.data.datasets[0] as any).borderColor =
      metricConfig[metric].line
    chartRef.current.update()
  }, [metric, metricConfig])

  return (
    <>
      <header style={{ padding: 20, display: "flex", justifyContent: "space-between" }}>
        <strong>Enthalpy</strong>
        <button onClick={openPopup}>Request pilot access</button>
      </header>

      <main style={{ padding: 40 }}>
        <h1>
          Sensors you can trust.<br />
          <span>Evidence you can prove.</span>
        </h1>

        <div style={{ height: 200 }}>
          <canvas ref={canvasRef} />
        </div>
      </main>

      {/* POPUP */}
      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closePopup}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              width: 500,
              borderRadius: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Request pilot access</h3>

            {submitted ? (
              <p>✅ Request sent. We’ll contact you.</p>
            ) : (
              <form onSubmit={submitForm}>
                <input name="website" value={form.website} onChange={onChange} style={{ display: "none" }} />

                <input name="name" placeholder="Name" value={form.name} onChange={onChange} />
                <input name="company" placeholder="Company *" value={form.company} onChange={onChange} />
                <input name="email" placeholder="Email *" value={form.email} onChange={onChange} />
                <textarea name="message" placeholder="Message *" value={form.message} onChange={onChange} />

                {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

                <button type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
