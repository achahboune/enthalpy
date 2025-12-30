import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen text-slate-200 bg-[#020617] overflow-hidden">
      {/* Background ambience (same vibe as home) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 pt-24 pb-16 max-w-3xl relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8"></p>

        {/* Legal entity block */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h2 className="text-lg font-semibold text-white mb-3">Data Controller (Legal Entity)</h2>

          <div className="space-y-2 text-slate-400">
            <p>
              <span className="text-slate-200 font-medium">Legal entity:</span> 01Marketing (Morocco)
            </p>
            <p>
              <span className="text-slate-200 font-medium">Trade name / brand:</span> Enthalpy
            </p>

            <p className="pt-2 text-slate-200 font-medium">Registered address:</p>
            <p>RESIDENCE CHAOUIA AV YOUSSEF IBN TACHAFINE</p>
            <p>RUE RACHID REDA, 4th FLOOR N°21</p>
            <p>Tangier, Morocco</p>

            <p className="pt-2">
              <span className="text-slate-200 font-medium">RC:</span> 132021
            </p>
            <p>
              <span className="text-slate-200 font-medium">ICE:</span> 003134205000041
            </p>

            <p className="pt-2">
              <span className="text-slate-200 font-medium">Contact email:</span> contact@enthalpy.site
            </p>
          </div>
        </div>

        <div className="space-y-8 text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
            <p>
              Enthalpy (“we”, “us”) provides cold &amp; critical monitoring with IoT sensors and blockchain-proof evidence.
              This Policy explains how we collect, use, and protect information when you use our website and request pilot access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-slate-200 font-medium">Pilot access form:</span> company name, work email, message,
                and optional name.
              </li>
              <li>
                <span className="text-slate-200 font-medium">Basic technical data:</span> IP address, device/browser,
                and logs for security and performance (typical web server logs).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">How we use information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To respond to your pilot access request and communicate with you.</li>
              <li>To operate, secure, and improve the website (fraud prevention, debugging, performance).</li>
              <li>To maintain records related to compliance and business operations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Blockchain &amp; sensor data</h2>
            <p>
              Enthalpy’s blockchain proof is designed for sensor events (e.g., temperature excursions). We do not intend to
              store personal data on-chain. If this changes for a specific deployment, we will provide deployment-specific
              terms and data processing details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Sharing</h2>
            <p>
              We may use service providers to run the website and send emails (hosting, email delivery). We share only what
              is necessary to provide the service. We do not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Retention</h2>
            <p>
              We keep form submissions as long as needed to handle requests and maintain operational records, then delete
              or anonymize when no longer necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Your rights</h2>
            <p>You can request access, correction, or deletion of your information by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
            <p>
              Email: <span className="text-slate-200 font-medium">contact@enthalpy.site</span>
              <br />
              Location: Tangier, Morocco
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">Changes</h2>
            <p>We may update this policy from time to time. The latest version will always be available on this page.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
