import { NextResponse } from "next/server"
import { Resend } from "resend"


// ⚠️ Si ton front et ton API sont sur le même domaine, CORS n’est pas obligatoire.
// Mais comme tu as vu du 405, je le laisse pour éviter les préflights cross-domain.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
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

    const apiKey = process.env.RESEND_API_KEY
    const to = process.env.PILOT_TO_EMAIL
    const from = process.env.PILOT_FROM_EMAIL || "Enthalpy <no-reply@enthalpy.site>"

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

    // Email vers toi (admin)
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Pilot request — ${company}`,
      text:
        `Name: ${name || "-"}\n` +
        `Company: ${company}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}\n`,
    })

    // Confirmation au client (optionnel)
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Enthalpy — pilot request received",
        text: `Thanks${name ? " " + name : ""}! We received your request and will reply shortly.\n\n— Enthalpy`,
      })
    } catch (e) {
      // si ça rate, on ne bloque pas la requête principale
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
