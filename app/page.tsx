"use client"

import React, { useEffect, useMemo, useState } from "react"
import { 
  Activity, 
  Thermometer, 
  Wind, 
  Droplets,
  CheckCircle2, 
  AlertTriangle, 
  Menu,
  X,
  Send,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Box,
  Globe,
  Gauge,
  Zap as ZapIcon,
  Factory,
  Car,
  Utensils,
  FlaskConical,
  Truck
} from "lucide-react"

// --- TYPES & DATA ---

type Metric = "temp" | "humidity" | "vibration" | "co2"

const SERIES: Record<Metric, { label: string; unit: string; data: number[]; alert: string; yMin: number; yMax: number; icon: React.ReactNode }> = {
  temp: {
    label: "Temperature",
    unit: "°C",
    data: [4.2, 4.1, 4.3, 4.8, 5.4, 5.9, 6.1, 6.0, 5.7, 5.4, 5.2],
    alert: "Excursion detected",
    yMin: 4,
    yMax: 6.5,
    icon: <Thermometer className="w-5 h-5" />,
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    data: [58, 57, 58, 60, 62, 66, 68, 67, 65, 63, 62],
    alert: "Drift detected",
    yMin: 50,
    yMax: 75,
    icon: <Droplets className="w-5 h-5" />,
  },
  vibration: {
    label: "Vibration",
    unit: "g",
    data: [0.12, 0.11, 0.13, 0.18, 0.22, 0.31, 0.28, 0.24, 0.21, 0.19, 0.17],
    alert: "Abnormal shock",
    yMin: 0.05,
    yMax: 0.35,
    icon: <Activity className="w-5 h-5" />,
  },
  co2: {
    label: "CO₂ Level",
    unit: "ppm",
    data: [410, 415, 420, 435, 460, 520, 610, 690, 720, 710, 680],
    alert: "Rising levels",
    yMin: 380,
    yMax: 760,
    icon: <Wind className="w-5 h-5" />,
  },
}

const STATUS_MAP = {
  temp: "critical",
  humidity: "warning",
  vibration: "warning",
  co2: "normal",
} as const

// --- COMPONENTS ---

export default function Page() {
  const [metric, setMetric] = useState<Metric>("temp")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  // Form State
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "", website: "" })
  const [errorMsg, setErrorMsg] = useState("")

  // Handlers
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const openPopup = () => { setPopupOpen(true); setSubmitted(false); }
  const closePopup = () => setPopupOpen(false)
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.website) return 
    setSubmitting(true)
    try {
      const res = await fetch("/api/pilot-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) setSubmitted(true)
      else setErrorMsg("Something went wrong. Please try again.")
    } catch {
      setErrorMsg("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  // --- RENDER HELPERS ---

  const currentSeries = SERIES[metric]
  const currentStatus = STATUS_MAP[metric]
  
  // Status Styles
  const statusColors = {
    normal: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    warning: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    critical: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  }

  // Chart Logic
  const Chart = () => {
    const W = 500, H = 200
    const points = currentSeries.data.map((val, i) => {
      const x = (i / (currentSeries.data.length - 1)) * W
      const norm = (val - currentSeries.yMin) / (currentSeries.yMax - currentSeries.yMin)
      const y = H - (norm * H) // invert Y
      return `${x},${Math.max(10, Math.min(H-10, y))}`
    }).join(" ")

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={currentStatus === 'critical' ? '#f43f5e' : currentStatus === 'warning' ? '#fbbf24' : '#34d399'} stopOpacity="0.8"/>
            <stop offset="100%" stopColor={currentStatus === 'critical' ? '#f43f5e' : currentStatus === 'warning' ? '#fbbf24' : '#34d399'} stopOpacity="1"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        
        <line x1="0" y1={H} x2={W} y2={H} stroke="white" strokeOpacity="0.1" />
        <line x1="0" y1={0} x2={W} y2={0} stroke="white" strokeOpacity="0.1" />
        <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="white" strokeOpacity="0.1" strokeDasharray="5,5" />

        <polyline 
          points={points} 
          fill="none" 
          stroke="url(#lineGrad)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {(() => {
           const arr = points.split(' ')
           const [lx, ly] = arr[arr.length-1].split(',')
           return <circle cx={lx} cy={ly} r="6" fill="white" className="animate-pulse" />
        })()}
      </svg>
    )
  }

  return (
    <div className="relative min-h-screen text-slate-200 selection:bg-blue-500/30">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Enthalpy" className="w-8 h-8 opacity-90" />
            <span className="text-xl font-bold tracking-tight text-white">Enthalpy</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            {/* Features: No dropdown, scroll to live feed */}
            <a href="#live-feed" className="hover:text-white transition-colors">
              Features
            </a>

            {/* Industries: No dropdown, scroll to industries section */}
            <a href="#industries-section" className="hover:text-white transition-colors">
              Industries
            </a>

            <button 
              onClick={openPopup}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
            >
              Get Pilot Access
            </button>
          </div>

          <button className="md:hidden text-white" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#020617] pt-24 px-6 md:hidden overflow-y-auto">
          <div className="flex flex-col gap-6 text-lg font-medium pb-10">
            <a href="#live-feed" className="text-slate-300" onClick={toggleMenu}>Features</a>
            <a href="#industries-section" className="text-slate-300" onClick={toggleMenu}>Industries</a>
            <button onClick={openPopup} className="text-blue-400 text-left">Request Pilot Access</button>
          </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                Live Blockchain Monitoring
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                Cold chain intelligence, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  secured by space.
                </span>
              </h1>
              
              <div className="space-y-4 mb-10 text-lg text-slate-400 leading-relaxed">
                 <p>
                    <strong>Real-time IoT monitoring &amp; traceability:</strong> Track temperature, humidity, vibration, and CO₂ across the entire supply chain (warehouses, trucks, containers).
                 </p>
                 <p>
                    <strong>Immediate alerts:</strong> Automatic detection of excursions/deviations with instant notifications to prevent loss.
                 </p>
                 <p>
                    <strong>Blockchain-proof data:</strong> Timestamped, sealed, tamper-proof records ready for audits and disputes.
                 </p>
                 <p>
                    <strong>Automated payments:</strong> Smart contracts trigger insurance claims and SLA penalties automatically based on sensor evidence.
                 </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={openPopup}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 group"
                >
                  Start Pilot
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('live-feed')?.scrollIntoView({behavior: 'smooth'})}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all"
                >
                  View Live Feed
                </button>
              </div>
            </div>

            {/* Right Visual (HERO VISUALIZATION) */}
            <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center w-full">
              <div className="relative z-10 w-full max-w-[800px]">
                 <img 
                   src="/assets/hero-visualization.svg" 
                   alt="Cold Chain Intelligence secured by space" 
                   className="w-full h-auto drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]"
                 />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- LIVE SENSOR FEED --- */}
      <section id="live-feed" className="py-20 relative scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="glass-panel rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold text-white">Live Sensor Feed</h2>
                <p className="text-slate-400 mt-1">Container #8821-X • Trans-Atlantic Route</p>
              </div>
              
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                {(Object.keys(SERIES) as Metric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2
                      ${metric === m ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                  >
                    {SERIES[m].icon}
                    {SERIES[m].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl bg-black/20">
                  <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Current Value</span>
                  <div className={`text-5xl font-bold mt-2 ${statusColors[currentStatus].split(' ')[0]}`}>
                    {currentSeries.data[currentSeries.data.length-1]}
                    <span className="text-2xl ml-1 text-slate-500">{currentSeries.unit}</span>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border flex items-start gap-4 ${statusColors[currentStatus]}`}>
                   {currentStatus === 'normal' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                   <div>
                     <h4 className="font-bold text-lg uppercase">{currentStatus}</h4>
                     <p className="opacity-80 text-sm mt-1">{currentSeries.alert}</p>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-2 h-[300px] bg-gradient-to-t from-blue-500/5 to-transparent rounded-2xl border border-white/5 p-6 relative">
                 <Chart />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-white/[0.02] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-white mb-4">Core Monitoring Features</h2>
             <p className="text-slate-400">Everything you need to secure your supply chain.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
             <div id="temp" className="glass-panel p-6 rounded-2xl">
               <Thermometer className="w-8 h-8 text-blue-400 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Temperature</h3>
               <p className="text-slate-400 text-sm">Precise cold chain tracking from -80°C to +50°C.</p>
             </div>
             <div id="humidity" className="glass-panel p-6 rounded-2xl">
               <Droplets className="w-8 h-8 text-cyan-400 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Humidity</h3>
               <p className="text-slate-400 text-sm">Prevent moisture damage and mold growth.</p>
             </div>
             <div id="vibration" className="glass-panel p-6 rounded-2xl">
               <Activity className="w-8 h-8 text-amber-400 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Vibration</h3>
               <p className="text-slate-400 text-sm">Detect shock and mishandling in real-time.</p>
             </div>
             <div id="pressure" className="glass-panel p-6 rounded-2xl">
               <Gauge className="w-8 h-8 text-purple-400 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Pressure</h3>
               <p className="text-slate-400 text-sm">Monitor tank pressure and vacuum seal integrity.</p>
             </div>
             <div id="energy" className="glass-panel p-6 rounded-2xl">
               <ZapIcon className="w-8 h-8 text-yellow-400 mb-4" />
               <h3 className="text-lg font-bold text-white mb-2">Energy</h3>
               <p className="text-slate-400 text-sm">Optimize reefer unit power consumption.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- INDUSTRIES SECTION --- */}
      <section id="industries-section" className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Industries</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Where precision is not optional.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div id="auto" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 transition-transform">
                <Car className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automotive</h3>
              <p className="text-slate-400 leading-relaxed">
                Just-in-time delivery tracking and sensitive component monitoring.
              </p>
            </div>
            <div id="pharma" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors">
              <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pharmaceuticals</h3>
              <p className="text-slate-400 leading-relaxed">
                GDP compliance and audit-ready reports. Ensure vaccine integrity.
              </p>
            </div>
            <div id="food" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors">
              <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Food &amp; Beverage</h3>
              <p className="text-slate-400 leading-relaxed">
                Prevent spoilage and reduce waste. Real-time alerts for temperature abuse.
              </p>
            </div>
            <div id="mfg" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors">
              <div className="w-14 h-14 bg-slate-500/20 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                <Factory className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Manufacturing</h3>
              <p className="text-slate-400 leading-relaxed">
                Raw material quality control and supply chain visibility.
              </p>
            </div>
            <div id="logistics" className="glass-panel p-8 rounded-3xl group hover:bg-white/5 transition-colors">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Logistics</h3>
              <p className="text-slate-400 leading-relaxed">
                End-to-end visibility and SLA automation for 3PL providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 bg-[#010409]">
        <div className="container mx-auto px-6 flex flex-col justify-center items-center gap-6 text-center">
          <div className="flex items-center gap-2 mb-4">
            <img src="/assets/logo.png" alt="Enthalpy" className="w-6 h-6 opacity-50" />
            <span className="text-slate-500 font-semibold">Enthalpy</span>
          </div>
          
          <div className="flex flex-col gap-1 text-sm text-slate-400">
            <div>Tangier, Morocco</div>
            <div>contact@enthalpy.site</div>
          </div>

          <div className="text-slate-600 text-xs mt-4">
            &copy; 2025 Enthalpy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* --- POPUP MODAL --- */}
      {popupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={closePopup} />
          
          <div className="relative w-full max-w-lg glass-panel bg-[#0a1120] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-white/10">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Request Pilot Access</h3>
              <button onClick={closePopup} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Request Sent</h4>
                  <p className="text-slate-400">We'll be in touch shortly.</p>
                  <button onClick={closePopup} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white">Close</button>
                </div>
              ) : (
                <form onSubmit={submitForm} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Company Name</label>
                    <input 
                      name="company" 
                      required
                      value={form.company} 
                      onChange={handleFormChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="SpaceX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Work Email</label>
                    <input 
                      name="email" 
                      type="email"
                      required
                      value={form.email} 
                      onChange={handleFormChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="elon@spacex.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Use Case</label>
                    <textarea 
                      name="message" 
                      required
                      value={form.message} 
                      onChange={handleFormChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors min-h-[100px]"
                      placeholder="We need to monitor Cryo-tanks..."
                    />
                  </div>

                  {errorMsg && <p className="text-rose-400 text-sm">{errorMsg}</p>}

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? "Sending..." : "Submit Request"}
                    {!submitting && <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
