'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  ArrowRight,
  BadgeIndianRupee,
  CalendarDays,
  Compass,
  Globe2,
  MapPin,
  Plane,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Itineraries',
    desc: 'Describe your dream trip in plain language — we turn it into a day-by-day plan.',
  },
  {
    icon: Wallet,
    title: 'Real Budget Control',
    desc: 'Live cost tracking against your target with a per-day spend breakdown.',
  },
  {
    icon: Plane,
    title: 'Swap on the Fly',
    desc: 'Not feeling an activity? Swap it for a smarter alternative in one tap.',
  },
  {
    icon: CalendarDays,
    title: 'Export Anywhere',
    desc: 'Copy your plan as Markdown or export a clean PDF before you fly.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const [previewBudget, setPreviewBudget] = useState(47200)
  const maxBudget = 50500

  function handleHeroTilt(e: React.MouseEvent<HTMLDivElement>) {
    const el = heroRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--rx', `${py * -6}deg`)
    el.style.setProperty('--ry', `${px * 8}deg`)
  }

  function resetHeroTilt() {
    const el = heroRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* 3D gradient scene */}
      <div className="pointer-events-none absolute inset-0 [perspective:1400px]" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-[-8%] h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">Travel Lab</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Features
          </Link>
          <Link
            href="#how"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/agency"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            For Agencies
          </Link>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Log in
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
            Get started
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-6 md:pt-24">
        <div
          ref={heroRef}
          onMouseMove={handleHeroTilt}
          onMouseLeave={resetHeroTilt}
          className="card tilt-card text-center"
          style={{ transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3 text-accent" aria-hidden="true" />
            AI-assisted trip planning
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Your perfect trip,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              planned in seconds.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Tell Travel Lab where you want to go, how much you want to spend, and
            the pace you love. We&apos;ll craft a ready-to-explore itinerary —
            with real budgets and swap-in alternatives.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-xl px-6 text-sm"
              onClick={() => router.push('/login')}
            >
              Start planning <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl px-6 text-sm"
              onClick={() => router.push('/login')}
            >
              Try the demo
            </Button>
          </div>

          {/* 3D floating preview card */}
          <div className="mx-auto mt-10 hidden max-w-md md:block">
            <div className="animate-float-desk rounded-2xl border border-border bg-card/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-medium">
                  <BadgeIndianRupee className="size-3 text-primary" /> Budget
                </span>
                <span className="font-mono text-muted-foreground">
                  ₹{previewBudget.toLocaleString()} / ₹{maxBudget.toLocaleString()}
                </span>
              </div>
              <div className="mt-3">
                <input
                  type="range"
                  min="10000"
                  max={maxBudget}
                  step="500"
                  value={previewBudget}
                  onChange={(e) => setPreviewBudget(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary h-2 bg-secondary rounded-lg appearance-none"
                  aria-label="Adjust budget slider"
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="size-3 text-primary" /> Grand Palace, Bangkok
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Globe2 className="size-3 text-accent" /> Phi Phi Islands boat hop
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Everything you need to travel smarter
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            From first idea to boarding pass — Travel Lab keeps the whole trip in
            one place.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <FeatureCard key={title} index={i} icon={Icon} title={title} desc={desc} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur md:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: '01', t: 'Describe', d: 'Destination, budget, vibe, pace — in plain words.' },
              { n: '02', t: 'Generate', d: 'Our AI lays out a day-by-day plan with costs.' },
              { n: '03', t: 'Refine & go', d: 'Swap activities, watch the budget, export.' },
            ].map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <span className="font-mono text-4xl font-semibold text-accent">
                  {s.n}
                </span>
                <div className="border-l border-border pl-4">
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center text-primary-foreground md:p-16">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <h2 className="relative text-2xl font-semibold tracking-tight md:text-4xl">
            Ready to plan your next adventure?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-primary-foreground/85">
            Sign in and let Travel Lab build the itinerary you&apos;ll actually use.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="relative mt-7 h-12 gap-2 rounded-xl px-6"
            onClick={() => router.push('/login')}
          >
            Create your trip <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        Travel Lab — itineraries generated by AI. Prices are estimates.
      </footer>
    </main>
  )
}

function FeatureCard({
  index,
  icon: Icon,
  title,
  desc,
}: {
  index: number
  icon: typeof Compass
  title: string
  desc: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--rx', `${py * -8}deg`)
    el.style.setProperty('--ry', `${px * 10}deg`)
  }

  function resetTilt() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
      className="card tilt-card group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
      style={{
        transform: 'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))',
        transitionDelay: `${index * 30}ms`,
      }}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  )
}
