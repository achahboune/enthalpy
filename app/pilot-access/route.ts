import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, company, email, message } = body

    if (!company || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS,
      },
    })

    // 📩 Email interne (toi)
    await transporter.sendMail({
      from: process.env.PILOT_FROM_EMAIL,
      to: process.env.PILOT_TO_EMAIL,
      subject: "🚀 New Enthalpy Pilot Access Request",
      html: `
        <h2>New Pilot Access Request</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Name:</strong> ${name || "-"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    })

    // 📬 Confirmation client (optionnel mais PRO)
    await transporter.sendMail({
      from: process.env.PILOT_FROM_EMAIL,
      to: email,
      subject: "Enthalpy – Pilot access request received",
      html: `
        <p>Hello${name ? " " + name : ""},</p>
        <p>Thank you for contacting <strong>Enthalpy</strong>.</p>
        <p>Your pilot access request has been received.  
        Our team will review it and get back to you shortly.</p>
        <p>— Enthalpy Team<br/>
        <a href="https://enthalpy.site">enthalpy.site</a></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Pilot access error:", error)
    return NextResponse.json(
      { error: "Email sending failed" },
      { status: 500 }
    )
  }
}
