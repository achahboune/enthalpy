import { NextResponse } from "next/server"
import { Resend } from "resend"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

function isValidEmail(v: string) {
  return /^\S+@\S+\.\S+$/.test(v)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // Honeypot anti-bot
    if (body?.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
    }

    const name = String(body?.name ?? "").trim()
    const company = String(body?.company ?? "").trim()
    const email = String(body?.email ?? "").trim()
    const message = String(body?.message ?? "").trim()

    if (!company || !email || !message) {
      return NextResponse.json(
        { error: "Missing fields: company, email, message" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400, headers: corsHeaders })
    }

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.PILOT_TO_EMAIL
    // ✅ Fallback safe tant que ton domaine n'est pas vérifié sur Resend
    const from = process.env.PILOT_FROM_EMAIL || "Enthalpy <onboarding@resend.dev>"

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfig: RESEND_API_KEY missing" },
        { status: 500, headers: corsHeaders }
      )
    }
    if (!to) {
      return NextResponse.json(
        { error: "Server misconfig: PILOT_TO_EMAIL missing" },
        { status: 500, headers: corsHeaders }
      )
    }

    const resend = new Resend(apiKey)

    // 1) Email admin (toi)
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Pilot request — ${company}`,
      text:
        `Pilot request\n\n` +
        `Company: ${company}\n` +
        `Name: ${name || "-"}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}\n`,
      html: `
        <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#0b1c33">
          <div style="font-weight:600;font-size:16px;margin-bottom:10px">Pilot request</div>
          <div style="margin:0 0 6px"><b>Company:</b> ${escapeHtml(company)}</div>
          <div style="margin:0 0 6px"><b>Name:</b> ${escapeHtml(name || "-")}</div>
          <div style="margin:0 0 12px"><b>Email:</b> ${escapeHtml(email)}</div>
          <div style="padding:12px;border:1px solid rgba(0,0,0,.08);border-radius:12px;background:#f7f9ff;white-space:pre-wrap">
            ${escapeHtml(message)}
          </div>
        </div>
      `,
    })

    // 2) Confirmation client (courte + premium)
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Enthalpy — request received",
        text:
          `Thanks${name ? " " + name : ""} — we received your request.\n` +
          `We’ll reply shortly.\n\n` +
          `— Enthalpy`,
        html: `
          <div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#0b1c33">
            <div style="font-weight:600;margin-bottom:8px">Request received</div>
            <div style="margin-bottom:10px">
              Thanks${name ? " " + escapeHtml(name) : ""} — we received your request. We’ll reply shortly.
            </div>
            <div style="color:#6c7a92;font-size:12px">— Enthalpy</div>
          </div>
        `,
      })
    } catch (e) {
      // ne bloque pas si l’email de confirmation rate
      console.warn("CONFIRMATION_EMAIL_FAILED", e)
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders })
  } catch (err: any) {
    console.error("PILOT_ACCESS_ERROR", err)
    return NextResponse.json(
      { error: err?.message || "Email sending failed" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// petite sécurité pour HTML
function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
