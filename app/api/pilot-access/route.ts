import { NextResponse } from "next/server"
import { Resend } from "resend"

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

export async function POST(req: Request) {
  const body = await req.json()

  const visitorEmail = String(body.email ?? "").trim()
  const name = String(body.name ?? "").trim()
  const message = String(body.message ?? "").trim()

  const resend = new Resend(process.env.RESEND_API_KEY)

  const FROM = process.env.PILOT_FROM_EMAIL!              // noreply@enthalpy.site
  const ADMIN_TO = process.env.PILOT_TO_EMAIL!            // contact@enthalpy.site

  // 1) Email admin (reçoit les données)
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_TO],
    subject: `New form submission${name ? ` — ${name}` : ""}`,
    reply_to: isEmail(visitorEmail) ? visitorEmail : ADMIN_TO,
    text: `Name: ${name}\nEmail: ${visitorEmail}\n\nMessage:\n${message}\n`,
  })

  // 2) Accusé au visiteur
  if (isEmail(visitorEmail)) {
    await resend.emails.send({
      from: FROM,
      to: [visitorEmail],
      reply_to: ADMIN_TO,
      subject: "We received your request — Enthalpy",
      text: `Hi ${name || ""},\n\nThanks! We received your message and will reply shortly.\n\n— Enthalpy\n`,
    })
  }

  return NextResponse.json({ ok: true })
}
