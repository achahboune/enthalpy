import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Body = {
  name?: string
  company?: string
  email?: string
  message?: string
  website?: string // honeypot
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body

    // honeypot => bot
    if ((body.website || "").trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const name = (body.name || "").trim()
    const company = (body.company || "").trim()
    const email = (body.email || "").trim()
    const message = (body.message || "").trim()

    if (!company || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.PILOT_TO_EMAIL
    const fromEmail = process.env.PILOT_FROM_EMAIL

    if (!apiKey || !toEmail || !fromEmail) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 })
    }

    const subject = `Pilot access request — ${company}`
    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5">
        <h2 style="margin:0 0 12px">New pilot access request</h2>
        <p style="margin:0 0 6px"><b>Company:</b> ${escapeHtml(company)}</p>
        <p style="margin:0 0 6px"><b>Name:</b> ${escapeHtml(name || "-")}</p>
        <p style="margin:0 0 6px"><b>Email:</b> ${escapeHtml(email)}</p>
        <p style="margin:12px 0 6px"><b>Message:</b></p>
        <pre style="white-space:pre-wrap;background:#f5f7fb;border:1px solid #e6eaf2;padding:12px;border-radius:10px">${escapeHtml(
          message
        )}</pre>
      </div>
    `

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
        reply_to: email,
      }),
    })

    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      return NextResponse.json(
        { error: data?.message || "Email send failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
