'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'
import {
  ArrowRight,
  Compass,
  Globe2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Plane,
  Sparkles,
  User,
} from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

const FLOATING_ICONS = [
  { Icon: Plane, className: 'left-[8%] top-[18%]', delay: '0s' },
  { Icon: MapPin, className: 'right-[10%] top-[22%]', delay: '1.2s' },
  { Icon: Globe2, className: 'left-[14%] bottom-[20%]', delay: '2.1s' },
  { Icon: Compass, className: 'right-[12%] bottom-[16%]', delay: '0.6s' },
]

export default function LoginPage() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--rx', `${py * -10}deg`)
    card.style.setProperty('--ry', `${px * 12}deg`)
  }

  function resetTilt() {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email to continue.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      name: name.trim(),
      email: email.trim(),
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/app')
    } else {
      setLoading(false)
      setError('Sign in failed. Please check your details and try again.')
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      {/* 3D scene background */}
      <div className="pointer-events-none absolute inset-0 [perspective:1200px]">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl" />
        <div
          className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60"
          style={{ transform: 'translate(-50%,-50%) rotateX(62deg)', transformStyle: 'preserve-3d' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
          style={{ transform: 'translate(-50%,-50%) rotateX(62deg)', transformStyle: 'preserve-3d' }}
        />
        {FLOATING_ICONS.map(({ Icon, className, delay }, i) => (
          <div
            key={i}
            className={`absolute ${className} animate-float text-primary/30`}
            style={{ animationDelay: delay }} aria-hidden="true"
          >
            <Icon className="size-10" strokeWidth={1.5} />
          </div>
        ))}
      </div>

      {/* Brand */}
      <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 text-sm font-semibold md:left-8 md:translate-x-0">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Compass className="size-5" aria-hidden="true" />
        </div>
        <span>Travel Lab</span>
      </div>

      {/* 3D login card */}
      <div
        ref={cardRef}
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        className="card tilt-card w-full max-w-md"
        style={{
          transform:
            'rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateY(-10px)',
        }}
      >
        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-2 text-accent">
            <Sparkles className="size-4" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Welcome back
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your trip
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Pick up where you left off planning your perfect journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label
                htmlFor="login-name"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Name
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="login-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full h-11 gap-2 rounded-xl text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Signing you in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo login — any name, email &amp; a 4+ character password will work.
          </p>
        </div>
      </div>
    </main>
  )
}
