import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function MentionsLegalesPage() {
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

        <h1 className="text-3xl font-bold text-white mb-6">Mentions légales</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-3 text-slate-400">
            <p>
              <span className="text-slate-200 font-medium">Nom commercial :</span> Enthalpy
            </p>
            <p>
              <span className="text-slate-200 font-medium">Raison sociale (nom légal) :</span> 01Marketing
            </p>

            <div className="pt-2">
              <p className="text-slate-200 font-medium">Siège social :</p>
              <p>RESIDENCE CHAOUIA AV YOUSSEF IBN TACHAFINE</p>
              <p>RUE RACHID REDA, 4ème ÉTAGE N°21</p>
              <p>Tanger, Maroc</p>
            </div>

            <p className="pt-2">
              <span className="text-slate-200 font-medium">RC :</span> 132021
            </p>
            <p>
              <span className="text-slate-200 font-medium">ICE :</span> 003134205000041
            </p>

            <p className="pt-2">
              <span className="text-slate-200 font-medium">Email :</span> contact@enthalpy.site
            </p>
            <p>
              <span className="text-slate-200 font-medium">Site :</span> https://enthalpy.site
            </p>

            <p className="pt-4">
              Le site Enthalpy est édité et exploité par 01Marketing (Maroc).
            </p>

            <p className="pt-2 text-sm text-slate-500">
              Hébergeur : Vercel Inc. (plateforme d’hébergement)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
