'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  CalendarDays,
  Car,
  Check,
  Compass,
  MapPin,
  Minus,
  Plane,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Ticket,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import type { AgencyItinerary } from '@/types/agency-itinerary'

/* ------------------------------------------------------------------ */
/* Re-use the same types from the create page                          */
/* ------------------------------------------------------------------ */

type MealPlan = 'EP (Room Only)' | 'CP (Breakfast Included)' | 'MAP (Breakfast + Dinner)' | 'AP (All Meals Included)'
type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First'
type TransportMode = 'Private AC Sedan' | 'Private SUV/Innova' | 'AC Coach' | 'Self-Drive' | 'Luxury Train'
type EventCategory = 'Show' | 'Concert' | 'Sports' | 'Tour' | 'Experience' | 'Other'
type TimeSlot = 'morning' | 'afternoon' | 'evening'

const AMENITY_OPTIONS = ['Pool', 'WiFi', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Airport Transfer']
const MEAL_PLANS: MealPlan[] = ['EP (Room Only)', 'CP (Breakfast Included)', 'MAP (Breakfast + Dinner)', 'AP (All Meals Included)']
const CABIN_CLASSES: CabinClass[] = ['Economy', 'Premium Economy', 'Business', 'First']
const TRANSPORT_MODES: TransportMode[] = ['Private AC Sedan', 'Private SUV/Innova', 'AC Coach', 'Self-Drive', 'Luxury Train']
const EVENT_CATEGORIES: EventCategory[] = ['Show', 'Concert', 'Sports', 'Tour', 'Experience', 'Other']
const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']
const SLOT_EMOJI: Record<TimeSlot, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' }

/* ------------------------------------------------------------------ */
/* Shared input components (same as create page)                       */
/* ------------------------------------------------------------------ */

function Input({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string | number; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs">
      <div className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`} onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-muted-foreground">{label}</span>
    </label>
  )
}

function SectionCard({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function StarsSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">Star Rating</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)}>
            <Star className={`size-5 transition-colors ${n <= value ? 'fill-amber-400 stroke-amber-400' : 'stroke-muted-foreground'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

const NAV_SECTIONS = [
  { id: 'agency-info', label: 'Agency' }, { id: 'trip-details', label: 'Trip' },
  { id: 'passengers', label: 'Passengers' }, { id: 'outbound-flight', label: 'Outbound Flight' },
  { id: 'return-flight', label: 'Return Flight' }, { id: 'hotels', label: 'Hotels' },
  { id: 'car-rentals', label: 'Car Rentals' }, { id: 'ground-transfer', label: 'Transfer' },
  { id: 'day-plans', label: 'Day Plans' }, { id: 'events', label: 'Events' },
  { id: 'optional-tours', label: 'Add-ons' }, { id: 'insurance', label: 'Insurance' },
  { id: 'pricing', label: 'Pricing' }, { id: 'inclusions', label: 'Inclusions' },
  { id: 'cancellation', label: 'Cancellation' }, { id: 'payment', label: 'Payment' },
]

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AgencyEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── State ──
  const [agencyName, setAgencyName] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentContact, setAgentContact] = useState('')
  const [clientName, setClientName] = useState('')
  const [tripTitle, setTripTitle] = useState('')
  const [destinations, setDestinations] = useState<string[]>([''])
  const [depDate, setDepDate] = useState('')
  const [retDate, setRetDate] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [childAgeRange, setChildAgeRange] = useState('2–11 years')
  const [infantAgeRange, setInfantAgeRange] = useState('0–23 months')
  const [outbound, setOutbound] = useState<any>({})
  const [returnFlight, setReturnFlight] = useState<any>({})
  const [hotels, setHotels] = useState<any[]>([])
  const [carRentals, setCarRentals] = useState<any[]>([])
  const [transferMode, setTransferMode] = useState<TransportMode>('Private SUV/Innova')
  const [transferNotes, setTransferNotes] = useState('')
  const [driverDetails, setDriverDetails] = useState(false)
  const [days, setDays] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [tours, setTours] = useState<any[]>([])
  const [insuranceIncluded, setInsuranceIncluded] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [insuranceCoverage, setInsuranceCoverage] = useState(0)
  const [costPerAdult, setCostPerAdult] = useState(0)
  const [costPerChild, setCostPerChild] = useState(0)
  const [costPerInfant, setCostPerInfant] = useState(0)
  const [baseFare, setBaseFare] = useState(0)
  const [taxes, setTaxes] = useState(0)
  const [inclusions, setInclusions] = useState('')
  const [exclusions, setExclusions] = useState('')
  const [cancellationRows, setCancellationRows] = useState<any[]>([])
  const [paymentTerms, setPaymentTerms] = useState('')
  const [originalData, setOriginalData] = useState<AgencyItinerary | null>(null)

  const totalCost = costPerAdult * adults + costPerChild * children + costPerInfant * infants
  const taxTotal = baseFare + taxes

  /* ── Load existing itinerary ── */
  useEffect(() => {
    fetch(`/api/agency/itineraries/${id}`)
      .then((r) => r.json())
      .then((rec) => {
        if (rec.error) { setFetchError(rec.error); return }
        const d = rec.data as AgencyItinerary
        setOriginalData(d)

        setAgencyName(d.agency.agencyName)
        setAgentName(d.agency.agentName)
        setAgentContact(d.agency.agentContact)
        setClientName(d.trip.clientName)
        setTripTitle(d.trip.tripTitle)
        setDestinations(d.trip.destinations)
        setDepDate(d.trip.travelDates.departure)
        setRetDate(d.trip.travelDates.return)
        setCurrency(d.trip.currency)
        setAdults(d.passengers.adults)
        setChildren(d.passengers.children)
        setInfants(d.passengers.infants)
        setChildAgeRange(d.passengers.childAgeRange)
        setInfantAgeRange(d.passengers.infantAgeRange)

        const ob = d.flights.find((f) => f.journeyType === 'outbound')
        const rb = d.flights.find((f) => f.journeyType === 'return')
        const mapFlight = (f: any) => ({
          airline: f?.airline ?? '', flightNumber: f?.flightNumber ?? '',
          aircraftType: f?.aircraftType ?? '', fromCode: f?.departure?.airportCode ?? '',
          fromCity: f?.departure?.city ?? '', toCode: f?.arrival?.airportCode ?? '',
          toCity: f?.arrival?.city ?? '', depDate: '', depTime: f?.departure?.time ?? '',
          arrTime: f?.arrival?.time ?? '', duration: f?.duration ?? '',
          cabinClass: f?.cabinClass ?? 'Economy', baggage: f?.baggageAllowance ?? '',
          pnr: f?.pnr ?? '', fromTerminal: f?.departure?.terminal ?? '',
          toTerminal: f?.arrival?.terminal ?? '',
        })
        setOutbound(mapFlight(ob))
        setReturnFlight(mapFlight(rb))

        setHotels(d.hotels.map((h) => ({
          city: h.city, hotelName: h.hotelName, stars: h.starRating,
          roomType: h.roomType, checkIn: h.checkIn, checkOut: h.checkOut,
          nights: h.numberOfNights, mealPlan: h.mealPlan, amenities: h.amenities,
        })))

        setCarRentals((d as any).carRentals ?? [])
        setTransferMode(d.groundTransfer.modeOfTransport as TransportMode)
        setTransferNotes(d.groundTransfer.transferNotes)
        setDriverDetails(d.groundTransfer.driverDetailsIncluded)

        setDays(d.days.map((day) => ({
          date: day.date, city: day.city, title: day.title, daySummary: day.daySummary,
          mealBreakfast: day.mealsIncluded.breakfast,
          mealLunch: day.mealsIncluded.lunch,
          mealDinner: day.mealsIncluded.dinner,
          places: day.placesToVisit.map((p) => ({
            name: p.name, timeSlot: p.timeSlot, highlights: p.highlights,
            entryFeeIncluded: p.entryFeeIncluded,
          })),
        })))

        setEvents(((d as any).events ?? []).map((e: any) => ({
          name: e.name, date: e.date, time: e.time, venue: e.venue, city: e.city,
          category: e.category, bookingReference: e.bookingReference ?? '',
          seatDetails: e.seatDetails ?? '', costPerPerson: e.costPerPerson, included: e.included,
        })))

        setTours(d.optionalTours.map((t) => ({
          name: t.name, description: t.description, costPerPerson: t.costPerPerson, recommended: t.recommended,
        })))

        setInsuranceIncluded(d.travelInsurance.included)
        setInsuranceProvider(d.travelInsurance.provider ?? '')
        setInsuranceCoverage(d.travelInsurance.coverageAmountPerPerson ?? 0)
        setCostPerAdult(d.pricing.costPerAdult)
        setCostPerChild(d.pricing.costPerChild)
        setCostPerInfant(d.pricing.costPerInfant)
        setBaseFare(d.pricing.taxBreakdown.baseFare)
        setTaxes(d.pricing.taxBreakdown.taxesAndSurcharges)
        setInclusions(d.inclusions.join('\n'))
        setExclusions(d.exclusions.join('\n'))
        setCancellationRows(d.cancellationPolicy.map((c) => ({ ...c })))
        setPaymentTerms(d.paymentTerms)
      })
      .catch(() => setFetchError('Failed to load itinerary.'))
      .finally(() => setLoading(false))
  }, [id])

  const fmt = (n: number) => {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n) }
    catch { return `${currency} ${n}` }
  }

  /* ── Build payload ── */
  const buildPayload = useCallback(() => {
    const makeAirport = (code: string, city: string, time: string, terminal: string) => ({
      airportCode: code.toUpperCase(), city, time, terminal: terminal || undefined,
    })
    const makeFlightPayload = (f: any, journeyType: 'outbound' | 'return') => ({
      journeyType, pnr: f.pnr || 'TBD',
      airline: f.airline, flightNumber: f.flightNumber, aircraftType: f.aircraftType,
      departure: makeAirport(f.fromCode, f.fromCity, f.depTime, f.fromTerminal),
      arrival: makeAirport(f.toCode, f.toCity, f.arrTime, f.toTerminal),
      duration: f.duration, baggageAllowance: f.baggage, cabinClass: f.cabinClass,
    })

    return {
      agency: {
        agencyName, agentName, agentContact,
        quotationNumber: originalData?.agency.quotationNumber ?? '',
        quotationValidUntil: originalData?.agency.quotationValidUntil ?? '',
        createdAt: originalData?.agency.createdAt ?? '',
      },
      trip: {
        clientName, tripTitle,
        destinations: destinations.filter(Boolean),
        totalDays: days.length,
        totalNights: Math.max(days.length - 1, 1),
        travelDates: { departure: depDate, return: retDate },
        currency,
      },
      passengers: { adults, children, infants, childAgeRange, infantAgeRange },
      flights: [makeFlightPayload(outbound, 'outbound'), makeFlightPayload(returnFlight, 'return')],
      hotels: hotels.map((h) => ({
        city: h.city, hotelName: h.hotelName, starRating: h.stars, roomType: h.roomType,
        checkIn: h.checkIn, checkOut: h.checkOut, numberOfNights: h.nights,
        mealPlan: h.mealPlan, amenities: h.amenities,
      })),
      carRentals: carRentals.map((c) => ({
        city: c.city, vendorName: c.vendorName, vehicleType: c.vehicleType,
        pickupDate: c.pickupDate, dropoffDate: c.dropoffDate,
        pickupLocation: c.pickupLocation, dropoffLocation: c.dropoffLocation,
        numberOfDays: c.numberOfDays, driverIncluded: c.driverIncluded,
        bookingReference: c.bookingReference || undefined,
        costPerDay: c.costPerDay, totalCost: c.totalCost,
      })),
      groundTransfer: { modeOfTransport: transferMode, driverDetailsIncluded: driverDetails, transferNotes },
      days: days.map((d, i) => ({
        dayNumber: i + 1, date: d.date, city: d.city, title: d.title, daySummary: d.daySummary,
        placesToVisit: d.places.map((p: any) => ({ name: p.name, timeSlot: p.timeSlot, highlights: p.highlights, entryFeeIncluded: p.entryFeeIncluded })),
        mealsIncluded: { breakfast: d.mealBreakfast, lunch: d.mealLunch, dinner: d.mealDinner },
      })),
      events: events.map((e) => ({
        name: e.name, date: e.date, time: e.time, venue: e.venue, city: e.city,
        category: e.category, bookingReference: e.bookingReference || undefined,
        seatDetails: e.seatDetails || undefined, costPerPerson: e.costPerPerson, included: e.included,
      })),
      optionalTours: tours.map((t) => ({ name: t.name, description: t.description, costPerPerson: t.costPerPerson, recommended: t.recommended })),
      travelInsurance: { included: insuranceIncluded, provider: insuranceProvider || undefined, coverageAmountPerPerson: insuranceCoverage || undefined },
      pricing: {
        costPerAdult, costPerChild, costPerInfant, totalCost,
        taxBreakdown: { baseFare, taxesAndSurcharges: taxes, totalAmount: taxTotal },
      },
      inclusions: inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
      exclusions: exclusions.split('\n').map((s) => s.trim()).filter(Boolean),
      cancellationPolicy: cancellationRows,
      paymentTerms,
    }
  }, [
    agencyName, agentName, agentContact, clientName, tripTitle, destinations,
    depDate, retDate, currency, adults, children, infants, childAgeRange, infantAgeRange,
    outbound, returnFlight, hotels, carRentals, transferMode, transferNotes, driverDetails,
    days, events, tours, insuranceIncluded, insuranceProvider, insuranceCoverage,
    costPerAdult, costPerChild, costPerInfant, baseFare, taxes, totalCost, taxTotal,
    inclusions, exclusions, cancellationRows, paymentTerms, originalData,
  ])

  const handleSubmit = useCallback(async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/agency/itineraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) { setSubmitError(data?.error ?? `Save failed (HTTP ${res.status}).`); return }
      router.push(`/agency/itinerary/${id}`)
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [buildPayload, id, router])

  /* ── Hotel helpers ── */
  const addHotel = () => setHotels((h) => [...h, { city: '', hotelName: '', stars: 3, roomType: 'Standard Double', checkIn: '', checkOut: '', nights: 1, mealPlan: 'CP (Breakfast Included)', amenities: [] }])
  const removeHotel = (i: number) => setHotels((h) => h.filter((_, idx) => idx !== i))
  const updateHotel = (i: number, patch: any) => setHotels((h) => h.map((hh, idx) => idx === i ? { ...hh, ...patch } : hh))

  /* ── Day helpers ── */
  const addDay = () => setDays((d) => [...d, { date: '', city: '', title: '', daySummary: '', mealBreakfast: true, mealLunch: false, mealDinner: true, places: [{ name: '', timeSlot: 'morning', highlights: '', entryFeeIncluded: false }] }])
  const removeDay = (i: number) => setDays((d) => d.filter((_, idx) => idx !== i))
  const updateDay = (i: number, patch: any) => setDays((d) => d.map((dd, idx) => idx === i ? { ...dd, ...patch } : dd))
  const addPlace = (di: number) => setDays((d) => d.map((dd, idx) => idx === di ? { ...dd, places: [...dd.places, { name: '', timeSlot: 'morning', highlights: '', entryFeeIncluded: false }] } : dd))
  const removePlace = (di: number, pi: number) => setDays((d) => d.map((dd, idx) => idx === di ? { ...dd, places: dd.places.filter((_: any, i: number) => i !== pi) } : dd))
  const updatePlace = (di: number, pi: number, patch: any) => setDays((d) => d.map((dd, idx) => idx === di ? { ...dd, places: dd.places.map((p: any, i: number) => i === pi ? { ...p, ...patch } : p) } : dd))

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-semibold text-destructive">{fetchError}</p>
          <Link href="/agency" className="mt-4 inline-block text-xs text-primary underline">Back to Agency Console</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Edit Itinerary</h1>
              <p className="text-xs text-muted-foreground font-mono text-primary">{originalData?.agency.quotationNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/agency/itinerary/${id}`} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
              Cancel
            </Link>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50">
              {submitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 md:px-6">
        {/* Nav */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-20 space-y-0.5">
            {NAV_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                {s.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 min-w-0 space-y-5">
          {submitError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{submitError}</div>
          )}

          {/* Agency Info */}
          <SectionCard id="agency-info" title="Agency Info" icon={Building2}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Agency Name" value={agencyName} onChange={setAgencyName} required />
              <Input label="Agent Name" value={agentName} onChange={setAgentName} required />
              <Input label="Contact" value={agentContact} onChange={setAgentContact} required />
            </div>
          </SectionCard>

          {/* Trip Details */}
          <SectionCard id="trip-details" title="Trip Details" icon={MapPin}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Client Name" value={clientName} onChange={setClientName} required />
              <Input label="Trip Title" value={tripTitle} onChange={setTripTitle} required />
              <Input label="Currency" value={currency} onChange={setCurrency} />
              <div />
              <Input label="Departure Date" type="date" value={depDate} onChange={setDepDate} />
              <Input label="Return Date" type="date" value={retDate} onChange={setRetDate} />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Destinations</label>
              <div className="space-y-2">
                {destinations.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={d} onChange={(e) => setDestinations((ds) => ds.map((x, idx) => idx === i ? e.target.value : x))}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    {destinations.length > 1 && (
                      <button type="button" onClick={() => setDestinations((ds) => ds.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setDestinations((ds) => [...ds, ''])} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="size-3.5" /> Add destination
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Passengers */}
          <SectionCard id="passengers" title="Passengers" icon={Users}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Adults" type="number" value={adults} onChange={(v) => setAdults(parseInt(v) || 0)} />
              <Input label="Children" type="number" value={children} onChange={(v) => setChildren(parseInt(v) || 0)} />
              <Input label="Infants" type="number" value={infants} onChange={(v) => setInfants(parseInt(v) || 0)} />
              <div />
              <Input label="Child Age Range" value={childAgeRange} onChange={setChildAgeRange} />
              <Input label="Infant Age Range" value={infantAgeRange} onChange={setInfantAgeRange} />
            </div>
          </SectionCard>

          {/* Flights */}
          {(['outbound', 'return'] as const).map((type) => {
            const f = type === 'outbound' ? outbound : returnFlight
            const setF = type === 'outbound' ? setOutbound : setReturnFlight
            const update = (patch: any) => setF((prev: any) => ({ ...prev, ...patch }))
            return (
              <SectionCard key={type} id={`${type}-flight`} title={type === 'outbound' ? '✈️ Outbound Flight' : '🔄 Return Flight'} icon={Plane}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Airline" value={f.airline ?? ''} onChange={(v) => update({ airline: v })} />
                  <Input label="Flight Number" value={f.flightNumber ?? ''} onChange={(v) => update({ flightNumber: v })} />
                  <Input label="Aircraft Type" value={f.aircraftType ?? ''} onChange={(v) => update({ aircraftType: v })} />
                  <Input label="From (IATA)" value={f.fromCode ?? ''} onChange={(v) => update({ fromCode: v.toUpperCase() })} />
                  <Input label="From City" value={f.fromCity ?? ''} onChange={(v) => update({ fromCity: v })} />
                  <Input label="From Terminal" value={f.fromTerminal ?? ''} onChange={(v) => update({ fromTerminal: v })} />
                  <Input label="To (IATA)" value={f.toCode ?? ''} onChange={(v) => update({ toCode: v.toUpperCase() })} />
                  <Input label="To City" value={f.toCity ?? ''} onChange={(v) => update({ toCity: v })} />
                  <Input label="To Terminal" value={f.toTerminal ?? ''} onChange={(v) => update({ toTerminal: v })} />
                  <Input label="Departure Time" value={f.depTime ?? ''} onChange={(v) => update({ depTime: v })} />
                  <Input label="Arrival Time" value={f.arrTime ?? ''} onChange={(v) => update({ arrTime: v })} />
                  <Input label="Duration" value={f.duration ?? ''} onChange={(v) => update({ duration: v })} />
                  <Input label="Baggage" value={f.baggage ?? ''} onChange={(v) => update({ baggage: v })} />
                  <Input label="PNR" value={f.pnr ?? ''} onChange={(v) => update({ pnr: v })} />
                  <Select label="Cabin Class" value={f.cabinClass ?? 'Economy'} options={CABIN_CLASSES} onChange={(v) => update({ cabinClass: v })} />
                </div>
              </SectionCard>
            )
          })}

          {/* Hotels */}
          <SectionCard id="hotels" title="Hotels" icon={Building2}>
            <div className="space-y-4">
              {hotels.map((h, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Hotel {i + 1}</span>
                    {hotels.length > 1 && <button type="button" onClick={() => removeHotel(i)} className="text-destructive hover:opacity-80"><Trash2 className="size-4" /></button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="City" value={h.city} onChange={(v) => updateHotel(i, { city: v })} />
                    <Input label="Hotel Name" value={h.hotelName} onChange={(v) => updateHotel(i, { hotelName: v })} />
                    <Input label="Room Type" value={h.roomType} onChange={(v) => updateHotel(i, { roomType: v })} />
                    <Input label="Check-in" type="date" value={h.checkIn} onChange={(v) => updateHotel(i, { checkIn: v })} />
                    <Input label="Check-out" type="date" value={h.checkOut} onChange={(v) => updateHotel(i, { checkOut: v })} />
                    <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Nights</label><div className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm font-mono">{h.nights}</div></div>
                    <Select label="Meal Plan" value={h.mealPlan} options={MEAL_PLANS} onChange={(v) => updateHotel(i, { mealPlan: v })} />
                    <StarsSelector value={h.stars} onChange={(v) => updateHotel(i, { stars: v })} />
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_OPTIONS.map((a) => (
                        <button key={a} type="button"
                          onClick={() => updateHotel(i, { amenities: h.amenities.includes(a) ? h.amenities.filter((x: string) => x !== a) : [...h.amenities, a] })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${h.amenities.includes(a) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-secondary-foreground'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addHotel} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"><Plus className="size-3.5" /> Add Hotel</button>
            </div>
          </SectionCard>

          {/* Ground Transfer */}
          <SectionCard id="ground-transfer" title="Ground Transfers" icon={Compass}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Mode" value={transferMode} options={TRANSPORT_MODES} onChange={setTransferMode} />
              <div className="flex items-end pb-2"><Toggle label="Driver details included" checked={driverDetails} onChange={setDriverDetails} /></div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes</label>
                <textarea rows={3} value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </SectionCard>

          {/* Day Plans */}
          <SectionCard id="day-plans" title="Day-by-Day Plans" icon={CalendarDays}>
            <div className="space-y-4">
              {days.map((d, di) => (
                <div key={di} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs font-semibold">Day {di + 1}</span>
                    {days.length > 1 && <button type="button" onClick={() => removeDay(di)} className="text-destructive"><Trash2 className="size-4" /></button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input label="Date" type="date" value={d.date} onChange={(v) => updateDay(di, { date: v })} />
                    <Input label="City" value={d.city} onChange={(v) => updateDay(di, { city: v })} />
                    <Input label="Title" value={d.title} onChange={(v) => updateDay(di, { title: v })} />
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Summary</label>
                    <textarea rows={2} value={d.daySummary} onChange={(e) => updateDay(di, { daySummary: e.target.value })} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="mt-3 flex gap-4">
                    <Toggle label="Breakfast" checked={d.mealBreakfast} onChange={(v) => updateDay(di, { mealBreakfast: v })} />
                    <Toggle label="Lunch" checked={d.mealLunch} onChange={(v) => updateDay(di, { mealLunch: v })} />
                    <Toggle label="Dinner" checked={d.mealDinner} onChange={(v) => updateDay(di, { mealDinner: v })} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Places</p>
                    {d.places.map((p: any, pi: number) => (
                      <div key={pi} className="flex gap-2">
                        <input value={p.name} onChange={(e: any) => updatePlace(di, pi, { name: e.target.value })} placeholder="Place name" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                        <select value={p.timeSlot} onChange={(e: any) => updatePlace(di, pi, { timeSlot: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                          {TIME_SLOTS.map((s) => <option key={s} value={s}>{SLOT_EMOJI[s]} {s}</option>)}
                        </select>
                        <input value={p.highlights} onChange={(e: any) => updatePlace(di, pi, { highlights: e.target.value })} placeholder="Highlights" className="flex-[2] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                        {d.places.length > 1 && <button type="button" onClick={() => removePlace(di, pi)} className="text-muted-foreground hover:text-destructive"><Minus className="size-4" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => addPlace(di)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="size-3.5" /> Add place</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDay} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"><Plus className="size-3.5" /> Add Day</button>
            </div>
          </SectionCard>

          {/* Pricing */}
          <SectionCard id="pricing" title="Pricing" icon={Wallet}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Cost per Adult" type="number" value={costPerAdult} onChange={(v) => setCostPerAdult(parseFloat(v) || 0)} />
              <Input label="Cost per Child" type="number" value={costPerChild} onChange={(v) => setCostPerChild(parseFloat(v) || 0)} />
              <Input label="Cost per Infant" type="number" value={costPerInfant} onChange={(v) => setCostPerInfant(parseFloat(v) || 0)} />
            </div>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary">Total (auto-calculated)</p>
              <p className="mt-1 font-mono text-xl font-bold">{fmt(totalCost)}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input label="Base Fare" type="number" value={baseFare} onChange={(v) => setBaseFare(parseFloat(v) || 0)} />
              <Input label="Taxes & Surcharges" type="number" value={taxes} onChange={(v) => setTaxes(parseFloat(v) || 0)} />
            </div>
          </SectionCard>

          {/* Inclusions / Exclusions */}
          <SectionCard id="inclusions" title="Inclusions & Exclusions" icon={Check}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-green-700">✓ Inclusions</label>
                <textarea rows={6} value={inclusions} onChange={(e) => setInclusions(e.target.value)} className="w-full resize-none rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-red-700">✗ Exclusions</label>
                <textarea rows={6} value={exclusions} onChange={(e) => setExclusions(e.target.value)} className="w-full resize-none rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 outline-none" />
              </div>
            </div>
          </SectionCard>

          {/* Cancellation */}
          <SectionCard id="cancellation" title="Cancellation Policy" icon={X}>
            <div className="space-y-2">
              {cancellationRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input value={row.daysBeforeDeparture} onChange={(e) => setCancellationRows((r) => r.map((rr, idx) => idx === i ? { ...rr, daysBeforeDeparture: e.target.value } : rr))} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={row.chargePercent} onChange={(e) => setCancellationRows((r) => r.map((rr, idx) => idx === i ? { ...rr, chargePercent: parseInt(e.target.value) || 0 } : rr))} className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <span className="flex items-center text-xs text-muted-foreground">%</span>
                  <button type="button" onClick={() => setCancellationRows((r) => r.filter((_, idx) => idx !== i))} className="text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setCancellationRows((r) => [...r, { daysBeforeDeparture: '', chargePercent: 0 }])} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="size-3.5" /> Add row</button>
            </div>
          </SectionCard>

          {/* Payment Terms */}
          <SectionCard id="payment" title="Payment Terms" icon={Wallet}>
            <textarea rows={4} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </SectionCard>

          {submitError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{submitError}</div>
          )}
          <div className="flex justify-end gap-3 pb-8">
            <Link href={`/agency/itinerary/${id}`} className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">Cancel</Link>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md disabled:opacity-50">
              {submitting ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
