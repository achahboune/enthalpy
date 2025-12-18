import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Body = {
  name?: string
  company?: string
  email?: string
  message?: string
  website?: string // honeypot
}

function isEmail(v: string) {
  return /^\S+@\S+\.\S+$/.test(v)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body

    // honeypot
    if ((body.website || "").trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const name = (body.name || "").trim()
    const company = (body.company || "").trim()
    const email = (body.email || "").trim()
    const message = (body.message || "").trim()

    if (!company) return NextResponse.json({ error: "Company is required" }, { status: 400 })
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })
    if (!isEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const PILOT_TO_EMAIL = process.env.PILOT_TO_EMAIL
    const PILOT_FROM_EMAIL = process.env.PILOT_FROM_EMAIL

    if (!RESEND_API_KEY || !PILOT_TO_EMAIL || !PILOT_FROM_EMAIL) {
      return NextResponse.json(
        { error: "Server not configured (missing env vars)" },
        { status: 500 }
      )
    }

    const subject = `Pilot access — ${company}`
    const text =
      `New pilot access request\n\n` +
      `Name: ${name || "(not provided)"}\n` +
      `Company: ${company}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message}\n`

    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: PILOT_FROM_EMAIL,
        to: [PILOT_TO_EMAIL],
        reply_to: email,
        subject,
        text,
      }),
    })

    if (!send.ok) {
      const errText = await send.text().catch(() => "")
      return NextResponse.json(
        { error: "Email sending failed", details: errText.slice(0, 500) },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
