import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const TO_EMAIL = process.env.PILOT_TO_EMAIL || "contact@enthalpy.site"
const FROM_EMAIL = process.env.PILOT_FROM_EMAIL || "Enthalpy <no-reply@enthalpy.site>"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = String(body?.name || "").trim()
    const company = String(body?.company || "").trim()
    const email = String(body?.email || "").trim()
    const message = String(body?.message || "").trim()

    if (!company) return NextResponse.json({ error: "Company is required" }, { status: 400 })
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })

    // 1) Email notification to you
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `New Pilot Access Request — ${company}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>New Pilot Access Request</h2>
          <p><b>Name:</b> ${escapeHtml(name || "-")}</p>
          <p><b>Company:</b> ${escapeHtml(company)}</p>
          <p><b>Email:</b> ${escapeHtml(email)}</p>
          <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
          <hr/>
          <p style="color:#64748b;font-size:12px">Enthalpy — enthalpy.site</p>
        </div>
      `,
    })

    // 2) Short confirmation to visitor
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Enthalpy — Request received",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <p>Hello${name ? " " + escapeHtml(name) : ""},</p>
          <p>Thanks — we received your pilot access request for <b>${escapeHtml(company)}</b>.</p>
          <p>We’ll get back to you shortly.</p>
          <p style="color:#64748b;font-size:12px;margin-top:14px">
            Enthalpy — Cold & Critical Monitoring<br/>
            contact@enthalpy.site • enthalpy.site
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
