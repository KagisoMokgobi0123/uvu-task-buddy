import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Mail,
  FileText,
  Calendar,
  Bot,
  CheckCircle2,
  Sparkles,
  Clock,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UVU AI Workplace Assistant — Work Smarter. Automate More." },
      {
        name: "description",
        content:
          "Automate emails, summarise meetings, plan your day and chat with an AI co-worker built for UVU teams.",
      },
      { property: "og:image", content: hero },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Mail,
    emoji: "📧",
    title: "Smart Email Generator",
    desc: "Draft polished, on-brand emails for clients, managers, HR and suppliers in seconds.",
    tint: "from-primary/15 to-primary/0",
  },
  {
    icon: FileText,
    emoji: "📝",
    title: "Meeting Notes Summariser",
    desc: "Turn long notes into executive summaries, decisions, action items and owners.",
    tint: "from-secondary/20 to-secondary/0",
  },
  {
    icon: Calendar,
    emoji: "📅",
    title: "AI Task Planner",
    desc: "Convert messy to-dos into a prioritised, time-blocked daily and weekly plan.",
    tint: "from-accent/20 to-accent/0",
  },
  {
    icon: Bot,
    emoji: "🤖",
    title: "AI Workplace Assistant",
    desc: "Your always-on co-worker for questions, research, writing and quick automations.",
    tint: "from-primary/15 to-secondary/10",
  },
];

const benefits = [
  { icon: Clock, t: "Save hours every week", d: "Automate the repetitive writing, summarising and planning work." },
  { icon: TrendingUp, t: "Boost productivity", d: "Spend more time on the work that actually moves UVU forward." },
  { icon: MessageSquare, t: "Better communication", d: "Clearer emails, sharper meeting notes, fewer misunderstandings." },
  { icon: ShieldCheck, t: "Enterprise-ready", d: "Designed for the modern workplace with privacy and clarity in mind." },
];

const steps = [
  { n: "01", t: "Choose a tool", d: "Pick from Email, Summariser, Planner or Chat." },
  { n: "02", t: "Enter your info", d: "Add a short prompt, upload notes or describe your tasks." },
  { n: "03", t: "AI does the work", d: "UVU AI thinks, drafts and structures the output for you." },
  { n: "04", t: "Get pro results", d: "Edit, copy, export to PDF / Word or save to history." },
];

const testimonials = [
  { q: "I drafted ten client emails in the time it used to take me to write two.", a: "Thandi M.", r: "Account Manager" },
  { q: "Meeting notes used to pile up. Now they summarise themselves before I'm back at my desk.", a: "Sipho K.", r: "Team Lead" },
  { q: "The planner finally turned my chaos into a calm, realistic day.", a: "Megan B.", r: "Operations" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <BrandLockup />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#benefits" className="hover:text-foreground transition">Benefits</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth" search={{ mode: "signin" }}>Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow">
              <Link to="/auth" search={{ mode: "signup" }}>Get Started</Link>
            </Button>

          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI-powered productivity for UVU teams
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Work Smarter.{" "}
              <span className="bg-gradient-brand bg-clip-text text-transparent">Automate More.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              UVU AI Workplace Assistant drafts your emails, summarises your meetings, plans your day and answers
              your questions — so your team can focus on what matters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow">
                <Link to="/auth">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Learn More</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["No setup", "Built for teams", "Privacy first", "Made in PE"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-brand opacity-20 blur-3xl" />
            <img
              src={hero}
              alt="AI workplace dashboard"
              width={1280}
              height={1024}
              className="relative rounded-3xl border border-border/60 shadow-glow"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Four AI tools, one workplace
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built to remove the repetitive parts of your day — without taking away your voice.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className={`group relative overflow-hidden border-border/60 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.tint} opacity-60 pointer-events-none`}
              />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xl" aria-hidden>{f.emoji}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                The benefits your team will feel
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                We built UVU AI to take the friction out of daily work, so you can focus on the
                things only humans can do.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {benefits.map((b) => (
                <div key={b.t} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15 text-accent">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{b.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Four steps from idea to polished result.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">{s.n}</div>
              <h3 className="mt-3 font-semibold text-foreground">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by busy teams
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.a} className="border-border/60 p-6 shadow-soft">
                <p className="text-foreground">"{t.q}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
                    {t.a.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.a}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-brand p-10 text-center text-primary-foreground shadow-glow sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to work smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            Sign in and meet your new AI co-worker — built for the way UVU teams actually work.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
          <div>
            <BrandLockup />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              UVU · Port Elizabeth, Eastern Cape, South Africa
            </p>
          </div>
          <FooterCol title="Product" links={["Features", "How it works", "Pricing"]} />
          <FooterCol title="Company" links={["About", "Contact", "Privacy Policy", "Terms"]} />
          <FooterCol title="Connect" links={["Twitter", "LinkedIn", "GitHub"]} />
        </div>
        <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} UVU. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-foreground transition">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
