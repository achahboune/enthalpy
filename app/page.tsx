import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Page() {
  const projects = [
    {
      title: "Enthalpy",
      desc: "Cold & critical monitoring (IoT + audit-ready proof).",
      tag: "IoT • Proof",
      href: "https://enthalpy.site",
    },
    {
      title: "Taxi MediGO",
      desc: "Route sheets + admin platform (drivers, secretaries, dashboard).",
      tag: "SaaS • Ops",
      href: "#",
    },
    {
      title: "TrendDash",
      desc: "Trends → content automation pipeline.",
      tag: "Automation • SEO",
      href: "#",
    },
  ]

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="text-base font-semibold">Alaa Chahboune</div>
              <div className="text-[11px] font-semibold tracking-[.18em] text-muted-foreground">
                BUILDER • AI • IOT
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <a href="#projects" className="text-sm text-muted-foreground hover:text-foreground">Projects</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>

          <a href="#contact">
            <Button className="rounded-full px-5">Contact</Button>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section className="grid items-center gap-8 py-14 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Square UI</Badge>
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="secondary">shadcn</Badge>
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
              Sensors you can trust.<br />
              <span className="text-primary">Evidence you can prove.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              I build products combining <strong>IoT</strong>, <strong>automation</strong> and
              <strong> audit-ready proof</strong> to protect cold chains and critical assets.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#projects">
                <Button className="rounded-full px-6">View projects</Button>
              </a>
              <a href="https://enthalpy.site" target="_blank" rel="noreferrer">
                <Button variant="outline" className="rounded-full px-6">Enthalpy</Button>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>• Dashboards</span>
              <span>• Sensors</span>
              <span>• Event ledger</span>
              <span>• Automation workflows</span>
            </div>
          </div>

          {/* Right card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Live highlights
                <Badge variant="secondary">Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">Cold-chain monitoring</div>
                <div className="mt-1 text-sm">Temp • Humidity • Vibration • CO₂</div>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">Audit-ready proof</div>
                <div className="mt-1 text-sm">Time-stamped incident evidence (not just logs)</div>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <div className="text-sm font-semibold text-foreground">Ops dashboards</div>
                <div className="mt-1 text-sm">Admin / driver / workflow views</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Projects */}
        <section id="projects" className="py-10">
          <h2 className="text-2xl font-bold md:text-3xl">Projects</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A selection of products I’m building (SaaS, IoT, automation).
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-primary">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">{p.desc}</div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{p.tag}</Badge>
                    {p.href !== "#" ? (
                      <a href={p.href} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="rounded-full">Open</Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="rounded-full" disabled>
                        Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* About */}
        <section id="about" className="py-10">
          <h2 className="text-2xl font-bold md:text-3xl">About</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl">
              <CardHeader><CardTitle>Focus</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                IoT sensors, dashboards, automation, reliability, proof & compliance.
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader><CardTitle>Stack</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Next.js, Tailwind, shadcn, APIs, workflows, deployments.
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader><CardTitle>Goal</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Turn raw data into decisions — and incidents into evidence.
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Contact */}
        <section id="contact" className="py-10">
          <h2 className="text-2xl font-bold md:text-3xl">Contact</h2>
          <p className="mt-2 text-muted-foreground">Want to collaborate or test a pilot?</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href="mailto:contact@yourdomain.com">
              <Button className="rounded-full px-6">Email</Button>
            </a>
            <a href="https://github.com/achahboune" target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-full px-6">GitHub</Button>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-full px-6">LinkedIn</Button>
            </a>
          </div>
        </section>

        <footer className="py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} — achahboune.github.io
        </footer>
      </main>
    </div>
  )
}
