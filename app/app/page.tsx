'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import {
  Bed,
  BookMarked,
  Building2,
  Bus,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  FileDown,
  MapPin,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RefreshCw,
  Sparkles,
  Ticket,
  Utensils,
  Wallet,
} from 'lucide-react'
import type { Activity, Budget, Itinerary } from '@/types/itinerary'

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const QUICK_CHIPS = [
  'Solo Traveler',
  'Family Friendly',
  'Fast Paced',
  'Foodie Focus',
  'Budget Friendly',
]

const SLOT_STYLES: Record<
  string,
  { label: string; emoji: string; time: string }
> = {
  morning: { label: 'Morning', emoji: '🌅', time: '9:00 AM - 12:00 PM' },
  afternoon: { label: 'Afternoon', emoji: '☀️', time: '1:00 PM - 5:00 PM' },
  evening: { label: 'Evening', emoji: '🌙', time: '6:00 PM - 10:00 PM' },
}

const BUDGET_ICONS: Record<string, typeof Bed> = {
  accommodation: Bed,
  food: Utensils,
  activities: Ticket,
  transport: Bus,
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({
  onNewTrip,
  onCopyMarkdown,
  onExportPDF,
  copied,
  hasItinerary,
  saveState,
}: {
  onNewTrip: () => void
  onCopyMarkdown: () => void
  onExportPDF: () => void
  copied: boolean
  hasItinerary: boolean
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight md:text-base">
              Travel Lab{' '}
              <span className="hidden text-muted-foreground font-normal sm:inline">
                — Smart Itinerary Builder
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Personalized trip planning powered by AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasItinerary && (
            <>
              {saveState === 'saving' && (
                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                  <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
                  Saving…
                </span>
              )}
              {saveState === 'saved' && (
                <span className="hidden items-center gap-1.5 text-xs text-primary sm:inline-flex">
                  <Check className="size-3" aria-hidden="true" />
                  Saved
                </span>
              )}
              {saveState === 'error' && (
                <span className="hidden text-xs text-destructive sm:inline">
                  Save failed
                </span>
              )}
              <button
                type="button"
                onClick={onExportPDF}
                className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary md:inline-flex"
              >
                <FileDown className="size-3.5" aria-hidden="true" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={onCopyMarkdown}
                className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary md:inline-flex"
              >
                {copied ? (
                  <Check className="size-3.5 text-primary" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </>
          )}
          <Link
            href="/agency"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <Building2 className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Agency</span>
          </Link>
          <Link
            href="/app/trips"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <BookMarked className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">My Trips</span>
          </Link>
          <button
            type="button"
            onClick={onNewTrip}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            New Trip
          </button>
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero (Step 1)                                                       */
/* ------------------------------------------------------------------ */

function Hero({
  input,
  setInput,
  onGenerate,
}: {
  input: string
  setInput: (v: string) => void
  onGenerate: () => void
}) {
  const addChip = (chip: string) => {
    setInput(input.trim() ? `${input.trim()}, ${chip.toLowerCase()}` : chip)
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-14 md:pt-24">
      <div className="mb-8 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="size-3 text-accent" aria-hidden="true" />
          AI-assisted trip planning
        </span>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          Describe your dream trip.
          <br />
          <span className="text-primary">We&apos;ll build the itinerary.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Destination, budget, vibe, and pace — in plain language. Travel Lab
          turns it into a day-by-day plan.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5">
        <label htmlFor="trip-prompt" className="sr-only">
          Describe your trip
        </label>
        <textarea
          id="trip-prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault()
              onGenerate()
            }
          }}
          rows={3}
          placeholder="e.g., 4 days in Sri Lanka on a budget, beaches and tea country, moderate pace..."
          className="w-full resize-none rounded-xl bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
        />
        <div className="flex flex-col gap-3 px-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
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
          <button
            type="button"
            onClick={onGenerate}
            disabled={input.trim().length < 3}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate Itinerary {'\u2728'}
            <ChevronRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Loading & error states                                              */
/* ------------------------------------------------------------------ */

function AILoading() {
  return (
    <section
      className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-24 text-center"
      aria-live="polite"
    >
      <div className="relative mb-8 flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/15" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="size-6 animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <h2 className="text-lg font-semibold">Building your itinerary</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="size-4 animate-spin text-primary" aria-hidden="true" />
        Planning days, routes, and budget with AI…
      </p>
      <p className="mt-6 text-xs text-muted-foreground">
        This usually takes 10–30 seconds.
      </p>
    </section>
  )
}

function AIError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-24 text-center">
      <div className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Couldn&apos;t build your itinerary
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-opacity hover:opacity-90"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Stats bar                                                           */
/* ------------------------------------------------------------------ */

function StatsBar({ itinerary }: { itinerary: Itinerary }) {
  const { destination, totalDays, currency, budget, days } = itinerary
  const placeCount = days.reduce((n, d) => n + d.activities.length, 0)
  const locations = new Set(
    days.flatMap((d) => d.activities.map((a) => a.location)),
  )

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Destination &amp; Duration
        </div>
        <p className="mt-2 text-lg font-semibold">
          {destination} • {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {locations.size} distinct locations
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Wallet className="size-3.5" aria-hidden="true" />
          Estimated Budget
        </div>
        <p className="mt-2 text-lg font-semibold">
          {formatMoney(budget.total, currency)}
          <span className="text-sm font-normal text-muted-foreground">
            {' '}
            / {totalDays} {totalDays === 1 ? 'day' : 'days'}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          ~{formatMoney(Math.round(budget.total / totalDays), currency)} per day
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          Activity Breakdown
        </div>
        <p className="mt-2 text-lg font-semibold">{placeCount} Places</p>
        <p className="text-xs text-muted-foreground">
          {days.length} days • {placeCount > 0 ? Math.round((placeCount / days.length) * 10) / 10 : 0} per day avg
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Day tabs                                                            */
/* ------------------------------------------------------------------ */

function DayTabs({
  days,
  activeDay,
  setActiveDay,
}: {
  days: Itinerary['days']
  activeDay: number
  setActiveDay: (i: number) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip days"
      className="flex gap-1.5 overflow-x-auto pb-1"
    >
      {days.map((day, i) => (
        <button
          key={day.day}
          role="tab"
          aria-selected={i === activeDay}
          type="button"
          onClick={() => setActiveDay(i)}
          className={`shrink-0 rounded-lg px-3.5 py-2 text-left transition-colors ${
            i === activeDay
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border bg-card text-secondary-foreground hover:bg-secondary'
          }`}
        >
          <span className="block text-xs font-semibold">Day {day.day}</span>
          <span
            className={`hidden text-[11px] leading-tight lg:block ${
              i === activeDay
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            }`}
          >
            {day.title}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Activity card                                                       */
/* ------------------------------------------------------------------ */

function ActivityCard({
  activity,
  currency,
  onSwap,
  isSwapping,
}: {
  activity: Activity
  currency: string
  onSwap?: () => void
  isSwapping?: boolean
}) {
  const style = SLOT_STYLES[activity.timeSlot] ?? SLOT_STYLES.morning
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {style.time.split(' - ')[0]}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
          {formatMoney(activity.estimatedCost, currency)} / person
        </span>
      </div>
      <h4 className="mt-2.5 text-sm font-semibold">{activity.title}</h4>
      <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
        {activity.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3 text-primary" aria-hidden="true" />
            {activity.location}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
            {activity.category}
          </span>
        </div>
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            disabled={isSwapping}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Suggest an alternative activity"
          >
            <RefreshCw
              className={`size-3 ${isSwapping ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isSwapping ? 'Finding alternative…' : 'Swap'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Budget sidebar                                                      */
/* ------------------------------------------------------------------ */

function BudgetSidebar({
  budget,
  currency,
  open,
  setOpen,
}: {
  budget: Budget
  currency: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  return (
    <aside
      className={`shrink-0 transition-all duration-300 lg:sticky lg:top-20 lg:self-start ${
        open ? 'w-full lg:w-72' : 'w-full lg:w-12'
      }`}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold"
          aria-expanded={open}
        >
          {open ? (
            <>
              <span className="inline-flex items-center gap-2">
                <Wallet className="size-4 text-primary" aria-hidden="true" />
                Budget Breakdown
              </span>
              <PanelRightClose
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </>
          ) : (
            <PanelRightOpen
              className="mx-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          {!open && <span className="sr-only">Open budget breakdown</span>}
        </button>
        {open && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <ul className="space-y-3">
              {Object.entries(BUDGET_ICONS).map(([key, Icon]) => {
                const amount =
                  budget[key as keyof Omit<Budget, 'total'>] ?? 0
                const pct = budget.total > 0 ? Math.round((amount / budget.total) * 100) : 0
                return (
                  <li key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 capitalize text-muted-foreground">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {key}
                      </span>
                      <span className="font-mono font-medium">
                        ~ {formatMoney(amount, currency)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="font-medium text-secondary-foreground">
                Total estimated
              </span>
              <span className="font-mono font-semibold">
                {formatMoney(budget.total, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Workspace (Step 2)                                                  */
/* ------------------------------------------------------------------ */

function Workspace({
  itinerary: initialItinerary,
  onItineraryChange,
}: {
  itinerary: Itinerary
  onItineraryChange: (updated: Itinerary) => void
}) {
  const [itinerary, setItinerary] = useState(initialItinerary)
  const [activeDay, setActiveDay] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [swappingKey, setSwappingKey] = useState<string | null>(null)
  const day = itinerary.days[Math.min(activeDay, itinerary.days.length - 1)]

  const handleSwap = useCallback(
    async (dayIndex: number, activityIndex: number) => {
      const targetDay = itinerary.days[dayIndex]
      const activity = targetDay?.activities[activityIndex]
      if (!activity) return

      const key = `${dayIndex}-${activityIndex}`
      setSwappingKey(key)

      try {
        const res = await fetch('/api/generate/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: itinerary.destination,
            currency: itinerary.currency,
            dayTitle: targetDay.title,
            timeSlot: activity.timeSlot,
            currentActivity: activity,
          }),
        })

        if (!res.ok) return

        const swapped = await res.json().catch(() => null)
        if (!swapped) return

        const updated: Itinerary = {
          ...itinerary,
          days: itinerary.days.map((d, di) =>
            di === dayIndex
              ? {
                  ...d,
                  activities: d.activities.map((a, ai) =>
                    ai === activityIndex ? swapped : a,
                  ),
                }
              : d,
          ),
        }
        setItinerary(updated)
        onItineraryChange(updated)
      } finally {
        setSwappingKey(null)
      }
    },
    [itinerary, onItineraryChange],
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <StatsBar itinerary={itinerary} />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DayTabs
            days={itinerary.days}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />
          <div className="mt-5">
            <h3 className="text-lg font-semibold">
              Day {day.day}: {day.title}
            </h3>
            <p className="text-sm text-muted-foreground">{day.summary}</p>
          </div>

          {/* Timeline */}
          <div className="relative mt-6 space-y-8 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border md:before:left-[19px]">
            {day.activities.map((activity, i) => {
              const style =
                SLOT_STYLES[activity.timeSlot] ?? SLOT_STYLES.morning
              const swapKey = `${activeDay}-${i}`
              return (
                <div key={`${activity.timeSlot}-${i}`} className="relative flex gap-4 md:gap-5">
                  <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-base shadow-sm md:size-10">
                    <span aria-hidden="true">{style.emoji}</span>
                    <span className="sr-only">{style.label}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                      <h4 className="text-sm font-semibold">
                        {style.emoji} {style.label}
                      </h4>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {style.time}
                      </span>
                    </div>
                    <ActivityCard
                      activity={activity}
                      currency={itinerary.currency}
                      onSwap={() => void handleSwap(activeDay, i)}
                      isSwapping={swappingKey === swapKey}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <BudgetSidebar
          budget={itinerary.budget}
          currency={itinerary.currency}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Stage = 'hero' | 'loading' | 'workspace' | 'error'

export default function Page() {
  const [stage, setStage] = useState<Stage>('hero')
  const [input, setInput] = useState('')
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const saveItinerary = useCallback(async (prompt: string, data: Itinerary) => {
    setSaveState('saving')
    try {
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, itinerary: data }),
      })
      if (res.ok) {
        setSaveState('saved')
      } else {
        setSaveState('error')
      }
    } catch {
      setSaveState('error')
    }
  }, [])

  const generate = useCallback(async (prompt: string) => {
    setStage('loading')
    setError('')
    setSaveState('idle')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error ?? `Generation failed (HTTP ${res.status}).`)
        setStage('error')
        return
      }

      setItinerary(data as Itinerary)
      setStage('workspace')
      void saveItinerary(prompt, data as Itinerary)
    } catch {
      setError('Network error — could not reach the generation service.')
      setStage('error')
    }
  }, [saveItinerary])

  const handleGenerate = useCallback(() => {
    if (input.trim().length >= 3) {
      void generate(input.trim())
    }
  }, [input, generate])

  const handleNewTrip = useCallback(() => {
    setInput('')
    setItinerary(null)
    setError('')
    setSaveState('idle')
    setStage('hero')
  }, [])

  const markdown = useCallback((): string => {
    if (!itinerary) return ''
    const m = formatMoney
    const lines: string[] = [
      `# ${itinerary.destination} • ${itinerary.totalDays} Days — Travel Lab Itinerary`,
      '',
      `**Budget:** ${m(itinerary.budget.total, itinerary.currency)}`,
      '',
    ]
    itinerary.days.forEach((day) => {
      lines.push(`## Day ${day.day}: ${day.title}`, day.summary, '')
      day.activities.forEach((a) => {
        lines.push(
          `### ${a.timeSlot.toUpperCase()} — ${a.title}`,
          a.description,
          `  - Location: ${a.location}`,
          `  - Cost: ${m(a.estimatedCost, itinerary.currency)} / person`,
          '',
        )
      })
    })
    lines.push('## Budget Breakdown', '')
    Object.entries(BUDGET_ICONS).forEach(([key]) => {
      lines.push(
        `- ${key}: ~ ${m(itinerary.budget[key as keyof Omit<Budget, 'total'>], itinerary.currency)}`,
      )
    })
    lines.push('', `**Total:** ${m(itinerary.budget.total, itinerary.currency)}`)
    return lines.join('\n')
  }, [itinerary])

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.log('Clipboard write failed')
    }
  }, [markdown])

  const handleExportPDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        onNewTrip={handleNewTrip}
        onCopyMarkdown={handleCopyMarkdown}
        onExportPDF={handleExportPDF}
        copied={copied}
        hasItinerary={stage === 'workspace'}
        saveState={saveState}
      />
      <main className="flex-1">
        {stage === 'hero' && (
          <Hero input={input} setInput={setInput} onGenerate={handleGenerate} />
        )}
        {stage === 'loading' && <AILoading />}
        {stage === 'error' && (
          <AIError message={error} onRetry={handleGenerate} />
        )}
        {stage === 'workspace' && itinerary && (
          <Workspace itinerary={itinerary} onItineraryChange={setItinerary} />
        )}
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground print:hidden">
        Travel Lab — itineraries generated by AI. Prices are estimates.
      </footer>
    </div>
  )
}
