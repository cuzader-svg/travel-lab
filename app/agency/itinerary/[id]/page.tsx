'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bed,
  Building2,
  Bus,
  CalendarDays,
  Check,
  Clock,
  Copy,
  FileDown,
  Luggage,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Users,
  Wallet,
} from 'lucide-react'
import type {
  AgencyItinerary,
  Flight,
  Hotel,
  DayPlan,
  OptionalTour,
  CancellationSlab,
} from '@/types/agency-itinerary'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(n: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString('en-IN')}`
  }
}

function mealBadge(plan: string) {
  const map: Record<string, string> = {
    'EP (Room Only)': 'bg-secondary text-secondary-foreground',
    'CP (Breakfast Included)': 'bg-blue-100 text-blue-700',
    'MAP (Breakfast + Dinner)': 'bg-amber-100 text-amber-700',
    'AP (All Meals Included)': 'bg-green-100 text-green-700',
  }
  return map[plan] ?? 'bg-secondary text-secondary-foreground'
}

const SLOT_EMOJI: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' }

/* ------------------------------------------------------------------ */
/* Flight Card                                                         */
/* ------------------------------------------------------------------ */

function FlightCard({ flight }: { flight: Flight }) {
  const label = flight.journeyType === 'outbound' ? 'Outbound Flight' : 'Return Flight'
  const icon = flight.journeyType === 'outbound' ? '✈️' : '🔄'
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span>{icon}</span> {label}
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          {flight.cabinClass}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-xl font-bold">{flight.departure.airportCode}</p>
          <p className="text-xs text-muted-foreground">{flight.departure.city}</p>
          <p className="mt-1 font-mono text-sm font-semibold">{flight.departure.time}</p>
          {flight.departure.terminal && (
            <p className="text-[11px] text-muted-foreground">T{flight.departure.terminal}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1">
          <p className="text-[11px] text-muted-foreground">{flight.duration}</p>
          <div className="flex w-full items-center gap-1">
            <div className="h-px flex-1 bg-border" />
            <Plane className="size-3.5 text-primary" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <p className="text-[11px] font-medium text-primary">
            {flight.airline} {flight.flightNumber}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{flight.arrival.airportCode}</p>
          <p className="text-xs text-muted-foreground">{flight.arrival.city}</p>
          <p className="mt-1 font-mono text-sm font-semibold">{flight.arrival.time}</p>
          {flight.arrival.terminal && (
            <p className="text-[11px] text-muted-foreground">T{flight.arrival.terminal}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Plane className="size-3" /> {flight.aircraftType}
        </span>
        <span className="inline-flex items-center gap-1">
          <Luggage className="size-3" /> {flight.baggageAllowance}
        </span>
        <span className="inline-flex items-center gap-1 font-mono">
          PNR: <span className="font-semibold text-foreground">{flight.pnr}</span>
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hotel Card                                                          */
/* ------------------------------------------------------------------ */

function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Bed className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{hotel.hotelName}</p>
            <p className="flex items-center gap-0.5 text-[11px] text-amber-500">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="size-3 fill-amber-400 stroke-amber-400" />
              ))}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${mealBadge(hotel.mealPlan)}`}>
          {hotel.mealPlan.split(' ')[0]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">City</p>
          <p className="font-medium">{hotel.city}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Room</p>
          <p className="font-medium">{hotel.roomType}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Check-in</p>
          <p className="font-medium">{hotel.checkIn}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Check-out</p>
          <p className="font-medium">{hotel.checkOut} ({hotel.numberOfNights}N)</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium text-muted-foreground">{hotel.mealPlan}</p>

      {hotel.amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hotel.amenities.map((a) => (
            <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{a}</span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Day Plan Card                                                       */
/* ------------------------------------------------------------------ */

function DayCard({ day, currency }: { day: DayPlan; currency: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-mono text-muted-foreground">Day {day.dayNumber} · {day.date} · {day.city}</p>
          <h4 className="mt-0.5 text-sm font-semibold">{day.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{day.daySummary}</p>
        </div>
        <div className="flex shrink-0 gap-1 text-[11px]">
          {day.mealsIncluded.breakfast && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">B</span>}
          {day.mealsIncluded.lunch && <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">L</span>}
          {day.mealsIncluded.dinner && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">D</span>}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {day.placesToVisit.map((place, i) => (
          <div key={i} className="flex gap-3">
            <span className="mt-0.5 text-base leading-none">{SLOT_EMOJI[place.timeSlot] ?? '📍'}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold">{place.name}</p>
                {place.entryFeeIncluded && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Entry included
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{place.highlights}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AgencyItineraryPage() {
  const { id } = useParams<{ id: string }>()
  const [itinerary, setItinerary] = useState<AgencyItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDay, setActiveDay] = useState(0)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/agency/itineraries/${id}`)
      .then((r) => r.json())
      .then((rec) => {
        if (rec.error) { setError(rec.error); return }
        setItinerary(rec.data as AgencyItinerary)
      })
      .catch(() => setError('Failed to load itinerary.'))
      .finally(() => setLoading(false))
  }, [id])

  const buildWhatsApp = useCallback((): string => {
    if (!itinerary) return ''
    const { agency, trip, passengers, flights, hotels, pricing } = itinerary
    const outbound = flights.find((f) => f.journeyType === 'outbound')
    const ret = flights.find((f) => f.journeyType === 'return')
    const curr = trip.currency

    const lines = [
      `✈️ *${trip.tripTitle}* — Quotation No: ${agency.quotationNumber}`,
      `👤 Client: ${trip.clientName}`,
      `🗓️ ${trip.travelDates.departure} → ${trip.travelDates.return} (${trip.totalNights} Nights)`,
      `📍 ${trip.destinations.join(' → ')}`,
      `👥 ${passengers.adults} Adults, ${passengers.children} Children, ${passengers.infants} Infants`,
      ``,
      `✈️ *FLIGHTS*`,
    ]
    if (outbound) lines.push(`Outbound: ${outbound.airline} ${outbound.flightNumber} | ${outbound.departure.city} ${outbound.departure.time} → ${outbound.arrival.city} ${outbound.arrival.time}`)
    if (ret) lines.push(`Return: ${ret.airline} ${ret.flightNumber} | ${ret.departure.city} ${ret.departure.time} → ${ret.arrival.city} ${ret.arrival.time}`)
    lines.push(``, `🏨 *HOTELS*`)
    hotels.forEach((h) => {
      lines.push(`${h.city} — ${h.hotelName} (${h.starRating}⭐) | ${h.roomType} | ${h.mealPlan.split(' ')[0]} | ${h.numberOfNights} Nights`)
    })
    lines.push(
      ``, `🚗 *TRANSFERS*`,
      `${itinerary.groundTransfer.modeOfTransport} — ${itinerary.groundTransfer.transferNotes}`,
      ``, `💰 *COSTING*`,
      `Per Adult: ${fmt(pricing.costPerAdult, curr)}`,
    )
    if (passengers.children > 0) lines.push(`Per Child: ${fmt(pricing.costPerChild, curr)}`)
    if (passengers.infants > 0) lines.push(`Per Infant: ${fmt(pricing.costPerInfant, curr)}`)
    lines.push(
      `Total: ${fmt(pricing.totalCost, curr)} (incl. all taxes)`,
      ``, `✅ Valid until ${agency.quotationValidUntil}`,
      `📞 ${agency.agentName} | ${agency.agentContact}`,
    )
    return lines.join('\n')
  }, [itinerary])

  const handleCopyWhatsApp = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildWhatsApp())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* ignore */ }
  }, [buildWhatsApp])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    } catch { /* ignore */ }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative flex size-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/15" />
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="size-5 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Loading itinerary…</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-semibold text-destructive">{error || 'Itinerary not found.'}</p>
          <Link href="/agency" className="mt-4 inline-block text-xs text-primary underline underline-offset-4">
            Back to Agency Console
          </Link>
        </div>
      </div>
    )
  }

  const { agency, trip, passengers, flights, hotels, groundTransfer, days, optionalTours, travelInsurance, pricing, inclusions, exclusions, cancellationPolicy, paymentTerms } = itinerary
  const outboundFlight = flights.find((f) => f.journeyType === 'outbound')
  const returnFlight = flights.find((f) => f.journeyType === 'return')
  const day = days[Math.min(activeDay, days.length - 1)]

  return (
    <div className="min-h-dvh bg-background">
      {/* Agency header */}
      <header className="border-b border-border bg-card print:border-0">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">{agency.agencyName}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3" /> {agency.agentContact}
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-mono font-semibold text-primary">{agency.quotationNumber}</p>
            <p className="text-muted-foreground">Agent: {agency.agentName}</p>
            <p className="text-muted-foreground">Valid until: {agency.quotationValidUntil}</p>
          </div>
        </div>
      </header>

      {/* Trip summary bar */}
      <div className="border-b border-border bg-primary/5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <span className="text-sm font-semibold">{trip.clientName}</span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 text-primary" />
            {trip.destinations.join(' → ')}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3 text-primary" />
            {trip.travelDates.departure} → {trip.travelDates.return}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3 text-primary" />
            {trip.totalDays}D / {trip.totalNights}N
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3 text-primary" />
            {passengers.adults}A{passengers.children > 0 ? ` ${passengers.children}C` : ''}{passengers.infants > 0 ? ` ${passengers.infants}I` : ''}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          {/* Outbound flight */}
          {outboundFlight && <FlightCard flight={outboundFlight} />}

          {/* Accommodation */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Bed className="size-4" /> Accommodation
            </h2>
            <div className="space-y-4">
              {hotels.map((h, i) => <HotelCard key={i} hotel={h} />)}
            </div>
          </section>

          {/* Ground transfers */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Bus className="size-4 text-primary" /> Ground Transfers
            </h2>
            <p className="text-sm font-medium">{groundTransfer.modeOfTransport}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{groundTransfer.transferNotes}</p>
            {groundTransfer.driverDetailsIncluded && (
              <span className="mt-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">Driver details included</span>
            )}
          </div>

          {/* Day-by-day */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <CalendarDays className="size-4" /> Day-by-Day Itinerary
            </h2>
            {/* Day tabs */}
            <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
              {days.map((d, i) => (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setActiveDay(i)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left transition-colors ${i === activeDay ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-secondary-foreground hover:bg-secondary'}`}
                >
                  <span className="block text-xs font-semibold">Day {d.dayNumber}</span>
                  <span className={`hidden text-[11px] lg:block ${i === activeDay ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{d.city}</span>
                </button>
              ))}
            </div>
            {day && <DayCard day={day} currency={trip.currency} />}
          </section>

          {/* Optional tours */}
          {optionalTours.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                <Ticket className="size-4" /> Optional Add-ons
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Activity</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Cost/Person</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {optionalTours.map((t: OptionalTour, i: number) => (
                      <tr key={i} className="bg-card">
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <div>
                              <p className="font-semibold">{t.name}</p>
                              <p className="mt-0.5 text-muted-foreground">{t.description}</p>
                            </div>
                            {t.recommended && (
                              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Recommended</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          {fmt(t.costPerPerson, trip.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Travel insurance */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Shield className={`size-5 shrink-0 ${travelInsurance.included ? 'text-green-600' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-sm font-semibold">
                Travel Insurance — {travelInsurance.included ? 'Included' : 'Not Included'}
              </p>
              {travelInsurance.provider && (
                <p className="text-xs text-muted-foreground">Provider: {travelInsurance.provider}</p>
              )}
              {travelInsurance.coverageAmountPerPerson && (
                <p className="text-xs text-muted-foreground">Coverage: {fmt(travelInsurance.coverageAmountPerPerson, trip.currency)} per person</p>
              )}
            </div>
          </div>

          {/* Return flight */}
          {returnFlight && <FlightCard flight={returnFlight} />}

          {/* Cost summary */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Wallet className="size-4" /> Cost Summary
            </h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                <div className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-muted-foreground">Cost per Adult</span>
                  <span className="font-mono font-semibold">{fmt(pricing.costPerAdult, trip.currency)}</span>
                </div>
                {passengers.children > 0 && (
                  <div className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-muted-foreground">Cost per Child ({passengers.childAgeRange})</span>
                    <span className="font-mono font-semibold">{fmt(pricing.costPerChild, trip.currency)}</span>
                  </div>
                )}
                {passengers.infants > 0 && (
                  <div className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-muted-foreground">Cost per Infant ({passengers.infantAgeRange})</span>
                    <span className="font-mono font-semibold">{fmt(pricing.costPerInfant, trip.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between px-5 py-3 text-xs text-muted-foreground">
                  <span>Base Fare</span>
                  <span className="font-mono">{fmt(pricing.taxBreakdown.baseFare, trip.currency)}</span>
                </div>
                <div className="flex justify-between px-5 py-3 text-xs text-muted-foreground">
                  <span>Taxes & Surcharges</span>
                  <span className="font-mono">{fmt(pricing.taxBreakdown.taxesAndSurcharges, trip.currency)}</span>
                </div>
                <div className="flex justify-between bg-primary/5 px-5 py-4 text-sm font-bold">
                  <span>Total Cost</span>
                  <span className="font-mono text-primary">{fmt(pricing.totalCost, trip.currency)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Inclusions & Exclusions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-800">
                <Check className="size-4" /> Inclusions
              </h3>
              <ul className="space-y-1.5">
                {inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                    <Check className="mt-0.5 size-3 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-red-800">✗ Exclusions</h3>
              <ul className="space-y-1.5">
                {exclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <span className="mt-0.5 shrink-0">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="border-b border-border bg-secondary px-5 py-3">
              <h3 className="text-sm font-semibold">Cancellation Policy</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left font-medium text-muted-foreground">Days Before Departure</th>
                  <th className="px-5 py-2.5 text-right font-medium text-muted-foreground">Cancellation Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cancellationPolicy.map((slab: CancellationSlab, i: number) => (
                  <tr key={i}>
                    <td className="px-5 py-3">{slab.daysBeforeDeparture}</td>
                    <td className="px-5 py-3 text-right font-semibold">{slab.chargePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Terms */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Payment Terms</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{paymentTerms}</p>
          </div>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            href="/agency"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Agency Console
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
            >
              {linkCopied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
              {linkCopied ? 'Link Copied!' : 'Share Link'}
            </button>
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              {copied ? <Check className="size-3.5" /> : <MessageCircle className="size-3.5" />}
              {copied ? 'Copied!' : 'Copy WhatsApp Summary'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <FileDown className="size-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
