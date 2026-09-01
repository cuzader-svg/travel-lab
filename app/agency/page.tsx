'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookMarked,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react'

const QUICK_CHIPS = [
  '2 Adults 1 Child',
  'CP Meal Plan',
  'SUV Transfers',
  'Economy Class',
  'Budget Package',
  'Luxury Package',
  '5 Nights',
  'International',
]

type QuotationSummary = {
  id: string
  quotationNumber: string
  clientName: string
  tripTitle: string
  destinations: string[]
  createdAt: string
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default function AgencyPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentContact, setAgentContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quotations, setQuotations] = useState<QuotationSummary[]>([])
  const [loadingQuotations, setLoadingQuotations] = useState(true)

  useEffect(() => {
    fetch('/api/agency/itineraries')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuotations(data)
      })
      .catch(() => {})
      .finally(() => setLoadingQuotations(false))
  }, [])

  const addChip = (chip: string) => {
    setPrompt((p) => (p.trim() ? `${p.trim()}, ${chip.toLowerCase()}` : chip))
  }

  const handleGenerate = useCallback(async () => {
    if (prompt.trim().length < 10) {
      setError('Please describe the trip in at least 10 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/agency/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          agencyName: agencyName.trim() || 'Travel Lab',
          agentName: agentName.trim() || 'Travel Agent',
          agentContact: agentContact.trim() || 'contact@travellab.in',
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? `Generation failed (HTTP ${res.status}).`)
        return
      }
      router.push(`/agency/itinerary/${data.id}`)
    } catch {
      setError('Network error — could not reach the generation service.')
    } finally {
      setLoading(false)
    }
  }, [prompt, agencyName, agentName, agentContact, router])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight md:text-base">
                Agency Console{' '}
                <span className="hidden font-normal text-muted-foreground sm:inline">
                  — B2B Itinerary Engine
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">Generate client-ready travel quotations</p>
            </div>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <Compass className="size-3.5" aria-hidden="true" />
            Trip Builder
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 md:px-6 lg:flex-row flex-col">
        {/* Main builder */}
        <main className="flex-1 min-w-0">
          {/* Agency details */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              Agency Details
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g., Sunrise Travels"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Agent Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Contact (Phone / Email)
                </label>
                <input
                  type="text"
                  value={agentContact}
                  onChange={(e) => setAgentContact(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Prompt box */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Describe the Trip
            </h2>

            <label htmlFor="agency-prompt" className="sr-only">Trip description</label>
            <textarea
              id="agency-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="e.g., 6 nights Bangkok and Phuket for 2 adults 1 child (8 yrs), budget ₹2,50,000 total, CP meal plan, SUV transfers, economy class IndiGo or Air India, depart Mumbai 15 Nov return 21 Nov, client name Sharma Family..."
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="mt-3 flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => addChip(chip)}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {chip}
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || prompt.trim().length < 10}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                    Generating Quotation…
                  </>
                ) : (
                  <>
                    Generate Itinerary
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-card py-12 text-center shadow-sm">
              <div className="relative mb-5 flex size-14 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/15" />
                <div className="relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Sparkles className="size-5 animate-pulse" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-base font-semibold">Building your client itinerary</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="size-3.5 animate-spin text-primary" />
                Planning flights, hotels, transfers and costing with AI…
              </p>
              <p className="mt-4 text-xs text-muted-foreground">Usually takes 20–40 seconds</p>
            </div>
          )}
        </main>

        {/* Quotations sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <BookMarked className="size-4 text-primary" aria-hidden="true" />
                My Quotations
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {quotations.length}
              </span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
              {loadingQuotations ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : quotations.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <FileText className="size-8 text-muted-foreground/40" aria-hidden="true" />
                  <p className="mt-3 text-xs text-muted-foreground">No quotations yet. Generate your first one.</p>
                </div>
              ) : (
                quotations.map((q) => (
                  <Link
                    key={q.id}
                    href={`/agency/itinerary/${q.id}`}
                    className="block px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium text-primary">
                        {q.quotationNumber}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold leading-tight">{q.clientName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{q.tripTitle}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 shrink-0 text-primary" />
                      <span className="truncate">{q.destinations.join(' → ')}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="border-t border-border p-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || prompt.trim().length < 10}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-3.5" />
                New Quotation
              </button>
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Travel Lab Agency Console — itineraries generated by AI. Verify all details before sharing with clients.
      </footer>
    </div>
  )
}
