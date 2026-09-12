'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
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

/* ------------------------------------------------------------------ */
/* Types & defaults                                                    */
/* ------------------------------------------------------------------ */

type MealPlan = 'EP (Room Only)' | 'CP (Breakfast Included)' | 'MAP (Breakfast + Dinner)' | 'AP (All Meals Included)'
type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First'
type TransportMode = 'Private AC Sedan' | 'Private SUV/Innova' | 'AC Coach' | 'Self-Drive' | 'Luxury Train'
type EventCategory = 'Show' | 'Concert' | 'Sports' | 'Tour' | 'Experience' | 'Other'
type TimeSlot = 'morning' | 'afternoon' | 'evening'

interface FlightForm {
  airline: string; flightNumber: string; aircraftType: string
  fromCode: string; fromCity: string; toCode: string; toCity: string
  depDate: string; depTime: string; arrTime: string; duration: string
  cabinClass: CabinClass; baggage: string; pnr: string; fromTerminal: string; toTerminal: string
}

interface HotelForm {
  city: string; hotelName: string; stars: number; roomType: string
  checkIn: string; checkOut: string; nights: number
  mealPlan: MealPlan
  amenities: string[]
}

interface CarRentalForm {
  city: string; vendorName: string; vehicleType: string
  pickupDate: string; dropoffDate: string; pickupLocation: string; dropoffLocation: string
  numberOfDays: number; driverIncluded: boolean; bookingReference: string
  costPerDay: number; totalCost: number
}

interface PlaceForm {
  name: string; timeSlot: TimeSlot; highlights: string; entryFeeIncluded: boolean
}

interface DayForm {
  date: string; city: string; title: string; daySummary: string
  mealBreakfast: boolean; mealLunch: boolean; mealDinner: boolean
  places: PlaceForm[]
}

interface EventForm {
  name: string; date: string; time: string; venue: string; city: string
  category: EventCategory; bookingReference: string; seatDetails: string
  costPerPerson: number; included: boolean
}

interface TourForm {
  name: string; description: string; costPerPerson: number; recommended: boolean
}

interface CancellationRow {
  daysBeforeDeparture: string; chargePercent: number
}

const AMENITY_OPTIONS = ['Pool', 'WiFi', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Airport Transfer']
const MEAL_PLANS: MealPlan[] = ['EP (Room Only)', 'CP (Breakfast Included)', 'MAP (Breakfast + Dinner)', 'AP (All Meals Included)']
const CABIN_CLASSES: CabinClass[] = ['Economy', 'Premium Economy', 'Business', 'First']
const TRANSPORT_MODES: TransportMode[] = ['Private AC Sedan', 'Private SUV/Innova', 'AC Coach', 'Self-Drive', 'Luxury Train']
const EVENT_CATEGORIES: EventCategory[] = ['Show', 'Concert', 'Sports', 'Tour', 'Experience', 'Other']
const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']
const SLOT_EMOJI: Record<TimeSlot, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' }

const DEFAULT_FLIGHT: FlightForm = {
  airline: '', flightNumber: '', aircraftType: 'Airbus A320',
  fromCode: '', fromCity: '', toCode: '', toCity: '',
  depDate: '', depTime: '', arrTime: '', duration: '',
  cabinClass: 'Economy', baggage: '15 kg', pnr: '', fromTerminal: '', toTerminal: '',
}

const DEFAULT_HOTEL: HotelForm = {
  city: '', hotelName: '', stars: 3, roomType: 'Standard Double',
  checkIn: '', checkOut: '', nights: 1, mealPlan: 'CP (Breakfast Included)', amenities: [],
}

const DEFAULT_CAR: CarRentalForm = {
  city: '', vendorName: '', vehicleType: 'SUV',
  pickupDate: '', dropoffDate: '', pickupLocation: '', dropoffLocation: '',
  numberOfDays: 1, driverIncluded: true, bookingReference: '',
  costPerDay: 0, totalCost: 0,
}

const DEFAULT_PLACE: PlaceForm = { name: '', timeSlot: 'morning', highlights: '', entryFeeIncluded: false }

const DEFAULT_DAY: DayForm = {
  date: '', city: '', title: '', daySummary: '',
  mealBreakfast: true, mealLunch: false, mealDinner: true,
  places: [{ ...DEFAULT_PLACE }],
}

const DEFAULT_EVENT: EventForm = {
  name: '', date: '', time: '', venue: '', city: '',
  category: 'Experience', bookingReference: '', seatDetails: '',
  costPerPerson: 0, included: false,
}

const DEFAULT_TOUR: TourForm = { name: '', description: '', costPerPerson: 0, recommended: false }

const DRAFT_KEY = 'agency-draft'

/* ------------------------------------------------------------------ */
/* Field helpers                                                        */
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
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
        onClick={() => onChange(!checked)}
      >
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

/* ------------------------------------------------------------------ */
/* Stars selector                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Section nav                                                          */
/* ------------------------------------------------------------------ */

const NAV_SECTIONS = [
  { id: 'agency-info', label: 'Agency' },
  { id: 'trip-details', label: 'Trip' },
  { id: 'passengers', label: 'Passengers' },
  { id: 'outbound-flight', label: 'Outbound Flight' },
  { id: 'return-flight', label: 'Return Flight' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'car-rentals', label: 'Car Rentals' },
  { id: 'ground-transfer', label: 'Transfer' },
  { id: 'day-plans', label: 'Day Plans' },
  { id: 'events', label: 'Events' },
  { id: 'optional-tours', label: 'Add-ons' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inclusions', label: 'Inclusions' },
  { id: 'cancellation', label: 'Cancellation' },
  { id: 'payment', label: 'Payment' },
]

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */

export default function AgencyCreatePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Agency Info ──
  const [agencyName, setAgencyName] = useState('Travel Lab')
  const [agentName, setAgentName] = useState('')
  const [agentContact, setAgentContact] = useState('')

  // ── Trip Details ──
  const [clientName, setClientName] = useState('')
  const [tripTitle, setTripTitle] = useState('')
  const [destinations, setDestinations] = useState<string[]>([''])
  const [depDate, setDepDate] = useState('')
  const [retDate, setRetDate] = useState('')
  const [currency, setCurrency] = useState('INR')

  // ── Passengers ──
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [childAgeRange, setChildAgeRange] = useState('2–11 years')
  const [infantAgeRange, setInfantAgeRange] = useState('0–23 months')

  // ── Flights ──
  const [outbound, setOutbound] = useState<FlightForm>({ ...DEFAULT_FLIGHT })
  const [returnFlight, setReturnFlight] = useState<FlightForm>({ ...DEFAULT_FLIGHT })

  // ── Hotels ──
  const [hotels, setHotels] = useState<HotelForm[]>([{ ...DEFAULT_HOTEL }])

  // ── Car Rentals ──
  const [carRentals, setCarRentals] = useState<CarRentalForm[]>([])

  // ── Ground Transfer ──
  const [transferMode, setTransferMode] = useState<TransportMode>('Private SUV/Innova')
  const [transferNotes, setTransferNotes] = useState('')
  const [driverDetails, setDriverDetails] = useState(false)

  // ── Day Plans ──
  const [days, setDays] = useState<DayForm[]>([{ ...DEFAULT_DAY, places: [{ ...DEFAULT_PLACE }] }])

  // ── Events ──
  const [events, setEvents] = useState<EventForm[]>([])

  // ── Optional Tours ──
  const [tours, setTours] = useState<TourForm[]>([])

  // ── Insurance ──
  const [insuranceIncluded, setInsuranceIncluded] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [insuranceCoverage, setInsuranceCoverage] = useState(0)

  // ── Pricing ──
  const [costPerAdult, setCostPerAdult] = useState(0)
  const [costPerChild, setCostPerChild] = useState(0)
  const [costPerInfant, setCostPerInfant] = useState(0)
  const [baseFare, setBaseFare] = useState(0)
  const [taxes, setTaxes] = useState(0)

  // Auto-calculated totals
  const totalCost = costPerAdult * adults + costPerChild * children + costPerInfant * infants
  const taxTotal = baseFare + taxes

  // ── Inclusions / Exclusions ──
  const [inclusions, setInclusions] = useState('Return airfare\nHotel accommodation\nAll transfers\nMeal plan as mentioned')
  const [exclusions, setExclusions] = useState('Visa fees\nTravel insurance\nPersonal expenses\nTips and gratuities')

  // ── Cancellation ──
  const [cancellationRows, setCancellationRows] = useState<CancellationRow[]>([
    { daysBeforeDeparture: '30+ days', chargePercent: 10 },
    { daysBeforeDeparture: '15-29 days', chargePercent: 50 },
    { daysBeforeDeparture: '0-14 days', chargePercent: 100 },
  ])

  // ── Payment Terms ──
  const [paymentTerms, setPaymentTerms] = useState(
    '30% advance at the time of booking. Balance 45 days before departure. Full payment required for bookings within 45 days.'
  )

  /* ── Draft auto-save ── */
  const getAllFormData = useCallback(() => ({
    agencyName, agentName, agentContact, clientName, tripTitle, destinations,
    depDate, retDate, currency, adults, children, infants, childAgeRange, infantAgeRange,
    outbound, returnFlight, hotels, carRentals, transferMode, transferNotes, driverDetails,
    days, events, tours, insuranceIncluded, insuranceProvider, insuranceCoverage,
    costPerAdult, costPerChild, costPerInfant, baseFare, taxes,
    inclusions, exclusions, cancellationRows, paymentTerms,
  }), [
    agencyName, agentName, agentContact, clientName, tripTitle, destinations,
    depDate, retDate, currency, adults, children, infants, childAgeRange, infantAgeRange,
    outbound, returnFlight, hotels, carRentals, transferMode, transferNotes, driverDetails,
    days, events, tours, insuranceIncluded, insuranceProvider, insuranceCoverage,
    costPerAdult, costPerChild, costPerInfant, baseFare, taxes,
    inclusions, exclusions, cancellationRows, paymentTerms,
  ])

  // Debounced draft save
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: getAllFormData(), savedAt: new Date().toISOString() }))
      } catch { /* ignore quota errors */ }
    }, 1000)
  }, [getAllFormData])

  // Check for existing draft on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (stored) {
        const { data, savedAt } = JSON.parse(stored)
        if (data && savedAt) setShowDraftBanner(true)
      }
    } catch { /* ignore */ }
  }, [])

  const restoreDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (!stored) return
      const { data } = JSON.parse(stored)
      if (!data) return
      setAgencyName(data.agencyName ?? 'Travel Lab')
      setAgentName(data.agentName ?? '')
      setAgentContact(data.agentContact ?? '')
      setClientName(data.clientName ?? '')
      setTripTitle(data.tripTitle ?? '')
      setDestinations(data.destinations ?? [''])
      setDepDate(data.depDate ?? '')
      setRetDate(data.retDate ?? '')
      setCurrency(data.currency ?? 'INR')
      setAdults(data.adults ?? 2)
      setChildren(data.children ?? 0)
      setInfants(data.infants ?? 0)
      setChildAgeRange(data.childAgeRange ?? '2–11 years')
      setInfantAgeRange(data.infantAgeRange ?? '0–23 months')
      setOutbound(data.outbound ?? { ...DEFAULT_FLIGHT })
      setReturnFlight(data.returnFlight ?? { ...DEFAULT_FLIGHT })
      setHotels(data.hotels ?? [{ ...DEFAULT_HOTEL }])
      setCarRentals(data.carRentals ?? [])
      setTransferMode(data.transferMode ?? 'Private SUV/Innova')
      setTransferNotes(data.transferNotes ?? '')
      setDriverDetails(data.driverDetails ?? false)
      setDays(data.days ?? [{ ...DEFAULT_DAY }])
      setEvents(data.events ?? [])
      setTours(data.tours ?? [])
      setInsuranceIncluded(data.insuranceIncluded ?? false)
      setInsuranceProvider(data.insuranceProvider ?? '')
      setInsuranceCoverage(data.insuranceCoverage ?? 0)
      setCostPerAdult(data.costPerAdult ?? 0)
      setCostPerChild(data.costPerChild ?? 0)
      setCostPerInfant(data.costPerInfant ?? 0)
      setBaseFare(data.baseFare ?? 0)
      setTaxes(data.taxes ?? 0)
      setInclusions(data.inclusions ?? '')
      setExclusions(data.exclusions ?? '')
      setCancellationRows(data.cancellationRows ?? [])
      setPaymentTerms(data.paymentTerms ?? '')
    } catch { /* ignore */ }
    setShowDraftBanner(false)
  }, [])

  /* ── Build payload ── */
  const buildPayload = useCallback(() => {
    const makeAirport = (code: string, city: string, time: string, terminal: string) => ({
      airportCode: code.toUpperCase(),
      city,
      time,
      terminal: terminal || undefined,
    })

    const makeFlightPayload = (f: FlightForm, journeyType: 'outbound' | 'return') => ({
      journeyType,
      pnr: f.pnr || 'TBD',
      airline: f.airline,
      flightNumber: f.flightNumber,
      aircraftType: f.aircraftType,
      departure: makeAirport(f.fromCode, f.fromCity, f.depTime, f.fromTerminal),
      arrival: makeAirport(f.toCode, f.toCity, f.arrTime, f.toTerminal),
      duration: f.duration,
      baggageAllowance: f.baggage,
      cabinClass: f.cabinClass,
    })

    return {
      agency: {
        agencyName,
        agentName,
        agentContact,
        quotationNumber: '',
        quotationValidUntil: '',
        createdAt: '',
      },
      trip: {
        clientName,
        tripTitle,
        destinations: destinations.filter(Boolean),
        totalDays: days.length,
        totalNights: Math.max(days.length - 1, 1),
        travelDates: { departure: depDate, return: retDate },
        currency,
      },
      passengers: { adults, children, infants, childAgeRange, infantAgeRange },
      flights: [
        makeFlightPayload(outbound, 'outbound'),
        makeFlightPayload(returnFlight, 'return'),
      ],
      hotels: hotels.map((h) => ({
        city: h.city,
        hotelName: h.hotelName,
        starRating: h.stars,
        roomType: h.roomType,
        checkIn: h.checkIn,
        checkOut: h.checkOut,
        numberOfNights: h.nights,
        mealPlan: h.mealPlan,
        amenities: h.amenities,
      })),
      carRentals: carRentals.map((c) => ({
        city: c.city,
        vendorName: c.vendorName,
        vehicleType: c.vehicleType,
        pickupDate: c.pickupDate,
        dropoffDate: c.dropoffDate,
        pickupLocation: c.pickupLocation,
        dropoffLocation: c.dropoffLocation,
        numberOfDays: c.numberOfDays,
        driverIncluded: c.driverIncluded,
        bookingReference: c.bookingReference || undefined,
        costPerDay: c.costPerDay,
        totalCost: c.totalCost,
      })),
      groundTransfer: {
        modeOfTransport: transferMode,
        driverDetailsIncluded: driverDetails,
        transferNotes,
      },
      days: days.map((d, i) => ({
        dayNumber: i + 1,
        date: d.date,
        city: d.city,
        title: d.title,
        daySummary: d.daySummary,
        placesToVisit: d.places.map((p) => ({
          name: p.name,
          timeSlot: p.timeSlot,
          highlights: p.highlights,
          entryFeeIncluded: p.entryFeeIncluded,
        })),
        mealsIncluded: {
          breakfast: d.mealBreakfast,
          lunch: d.mealLunch,
          dinner: d.mealDinner,
        },
      })),
      events: events.map((e) => ({
        name: e.name,
        date: e.date,
        time: e.time,
        venue: e.venue,
        city: e.city,
        category: e.category,
        bookingReference: e.bookingReference || undefined,
        seatDetails: e.seatDetails || undefined,
        costPerPerson: e.costPerPerson,
        included: e.included,
      })),
      optionalTours: tours.map((t) => ({
        name: t.name,
        description: t.description,
        costPerPerson: t.costPerPerson,
        recommended: t.recommended,
      })),
      travelInsurance: {
        included: insuranceIncluded,
        provider: insuranceProvider || undefined,
        coverageAmountPerPerson: insuranceCoverage || undefined,
      },
      pricing: {
        costPerAdult,
        costPerChild,
        costPerInfant,
        totalCost,
        taxBreakdown: {
          baseFare,
          taxesAndSurcharges: taxes,
          totalAmount: taxTotal,
        },
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
    inclusions, exclusions, cancellationRows, paymentTerms,
  ])

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    setError('')
    setSubmitting(true)
    try {
      const payload = buildPayload()
      const res = await fetch('/api/agency/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? `Submit failed (HTTP ${res.status}).`)
        return
      }
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      router.push(`/agency/itinerary/${data.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [buildPayload, router])

  /* ── Hotel helpers ── */
  const addHotel = () => setHotels((h) => [...h, { ...DEFAULT_HOTEL }])
  const removeHotel = (i: number) => setHotels((h) => h.filter((_, idx) => idx !== i))
  const updateHotel = (i: number, patch: Partial<HotelForm>) =>
    setHotels((h) => h.map((hh, idx) => idx === i ? { ...hh, ...patch } : hh))

  /* ── Car rental helpers ── */
  const addCar = () => setCarRentals((c) => [...c, { ...DEFAULT_CAR }])
  const removeCar = (i: number) => setCarRentals((c) => c.filter((_, idx) => idx !== i))
  const updateCar = (i: number, patch: Partial<CarRentalForm>) =>
    setCarRentals((c) => c.map((cc, idx) => idx === i ? { ...cc, ...patch } : cc))

  /* ── Day helpers ── */
  const addDay = () => setDays((d) => [...d, { ...DEFAULT_DAY, places: [{ ...DEFAULT_PLACE }] }])
  const removeDay = (i: number) => setDays((d) => d.filter((_, idx) => idx !== i))
  const updateDay = (i: number, patch: Partial<DayForm>) =>
    setDays((d) => d.map((dd, idx) => idx === i ? { ...dd, ...patch } : dd))
  const addPlace = (dayIndex: number) =>
    setDays((d) => d.map((dd, idx) => idx === dayIndex ? { ...dd, places: [...dd.places, { ...DEFAULT_PLACE }] } : dd))
  const removePlace = (dayIndex: number, placeIndex: number) =>
    setDays((d) => d.map((dd, idx) => idx === dayIndex ? { ...dd, places: dd.places.filter((_, pi) => pi !== placeIndex) } : dd))
  const updatePlace = (dayIndex: number, placeIndex: number, patch: Partial<PlaceForm>) =>
    setDays((d) => d.map((dd, idx) => idx === dayIndex ? {
      ...dd,
      places: dd.places.map((p, pi) => pi === placeIndex ? { ...p, ...patch } : p)
    } : dd))

  /* ── Event helpers ── */
  const addEvent = () => setEvents((e) => [...e, { ...DEFAULT_EVENT }])
  const removeEvent = (i: number) => setEvents((e) => e.filter((_, idx) => idx !== i))
  const updateEvent = (i: number, patch: Partial<EventForm>) =>
    setEvents((e) => e.map((ev, idx) => idx === i ? { ...ev, ...patch } : ev))

  /* ── Tour helpers ── */
  const addTour = () => setTours((t) => [...t, { ...DEFAULT_TOUR }])
  const removeTour = (i: number) => setTours((t) => t.filter((_, idx) => idx !== i))
  const updateTour = (i: number, patch: Partial<TourForm>) =>
    setTours((t) => t.map((tt, idx) => idx === i ? { ...tt, ...patch } : tt))

  /* ── Cancellation helpers ── */
  const addCancellationRow = () => setCancellationRows((r) => [...r, { daysBeforeDeparture: '', chargePercent: 0 }])
  const removeCancellationRow = (i: number) => setCancellationRows((r) => r.filter((_, idx) => idx !== i))

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

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
              <h1 className="text-sm font-semibold">New Itinerary</h1>
              <p className="text-xs text-muted-foreground">Fill in all details manually</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/agency"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {submitting ? 'Saving…' : 'Save Quotation'}
            </button>
          </div>
        </div>
      </header>

      {/* Draft banner */}
      {showDraftBanner && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <p className="text-xs text-amber-800">
              📝 You have an unsaved draft. Restore it to continue where you left off.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreDraft}
                className="rounded-lg bg-amber-700 px-3 py-1 text-xs font-medium text-white hover:bg-amber-800"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={() => { localStorage.removeItem(DRAFT_KEY); setShowDraftBanner(false) }}
                className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8 md:px-6">
        {/* Sticky left rail nav */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-20 space-y-0.5">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Form */}
        <main className="flex-1 min-w-0 space-y-5">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* 1. Agency Info */}
          <SectionCard id="agency-info" title="Agency Info" icon={Building2}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Agency Name" value={agencyName} onChange={setAgencyName} placeholder="Sunrise Travels" required />
              <Input label="Agent Name" value={agentName} onChange={setAgentName} placeholder="Your name" required />
              <Input label="Contact (Phone / Email)" value={agentContact} onChange={setAgentContact} placeholder="+91 98765 43210" required />
            </div>
          </SectionCard>

          {/* 2. Trip Details */}
          <SectionCard id="trip-details" title="Trip Details" icon={MapPin}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Client Name" value={clientName} onChange={setClientName} placeholder="Sharma Family" required />
              <Input label="Trip Title" value={tripTitle} onChange={setTripTitle} placeholder="5N Bangkok & Phuket" required />
              <Input label="Currency" value={currency} onChange={setCurrency} placeholder="INR" required />
              <div />
              <Input label="Departure Date" type="date" value={depDate} onChange={setDepDate} required />
              <Input label="Return Date" type="date" value={retDate} onChange={setRetDate} required />
            </div>
            {/* Destinations */}
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Destinations</label>
              <div className="space-y-2">
                {destinations.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={d}
                      onChange={(e) => setDestinations((ds) => ds.map((x, idx) => idx === i ? e.target.value : x))}
                      placeholder={`Destination ${i + 1}`}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {destinations.length > 1 && (
                      <button type="button" onClick={() => setDestinations((ds) => ds.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDestinations((ds) => [...ds, ''])}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="size-3.5" /> Add destination
                </button>
              </div>
            </div>
          </SectionCard>

          {/* 3. Passengers */}
          <SectionCard id="passengers" title="Passengers" icon={Users}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Adults" type="number" value={adults} onChange={(v) => setAdults(parseInt(v) || 0)} />
              <Input label="Children" type="number" value={children} onChange={(v) => setChildren(parseInt(v) || 0)} />
              <Input label="Infants" type="number" value={infants} onChange={(v) => setInfants(parseInt(v) || 0)} />
              <div />
              <Input label="Child Age Range" value={childAgeRange} onChange={setChildAgeRange} placeholder="2–11 years" />
              <Input label="Infant Age Range" value={infantAgeRange} onChange={setInfantAgeRange} placeholder="0–23 months" />
            </div>
          </SectionCard>

          {/* 4 & 5. Flights */}
          {(['outbound', 'return'] as const).map((type) => {
            const f = type === 'outbound' ? outbound : returnFlight
            const setF = type === 'outbound' ? setOutbound : setReturnFlight
            const update = (patch: Partial<FlightForm>) => setF((prev) => ({ ...prev, ...patch }))
            return (
              <SectionCard key={type} id={`${type}-flight`} title={type === 'outbound' ? '✈️ Outbound Flight' : '🔄 Return Flight'} icon={Plane}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Airline" value={f.airline} onChange={(v) => update({ airline: v })} placeholder="IndiGo" required />
                  <Input label="Flight Number" value={f.flightNumber} onChange={(v) => update({ flightNumber: v })} placeholder="6E 1234" required />
                  <Input label="Aircraft Type" value={f.aircraftType} onChange={(v) => update({ aircraftType: v })} placeholder="Airbus A320" />
                  <Input label="From Airport Code (IATA)" value={f.fromCode} onChange={(v) => update({ fromCode: v.toUpperCase() })} placeholder="BOM" required />
                  <Input label="From City" value={f.fromCity} onChange={(v) => update({ fromCity: v })} placeholder="Mumbai" />
                  <Input label="From Terminal" value={f.fromTerminal} onChange={(v) => update({ fromTerminal: v })} placeholder="T2" />
                  <Input label="To Airport Code (IATA)" value={f.toCode} onChange={(v) => update({ toCode: v.toUpperCase() })} placeholder="BKK" required />
                  <Input label="To City" value={f.toCity} onChange={(v) => update({ toCity: v })} placeholder="Bangkok" />
                  <Input label="To Terminal" value={f.toTerminal} onChange={(v) => update({ toTerminal: v })} placeholder="D" />
                  <Input label="Date" type="date" value={f.depDate} onChange={(v) => update({ depDate: v })} />
                  <Input label="Departure Time" value={f.depTime} onChange={(v) => update({ depTime: v })} placeholder="08:30" />
                  <Input label="Arrival Time" value={f.arrTime} onChange={(v) => update({ arrTime: v })} placeholder="14:45 (+1)" />
                  <Input label="Duration" value={f.duration} onChange={(v) => update({ duration: v })} placeholder="6h 15m" />
                  <Input label="Baggage Allowance" value={f.baggage} onChange={(v) => update({ baggage: v })} placeholder="15 kg" />
                  <Input label="PNR" value={f.pnr} onChange={(v) => update({ pnr: v })} placeholder="ABC123" />
                  <Select label="Cabin Class" value={f.cabinClass} options={CABIN_CLASSES} onChange={(v) => update({ cabinClass: v })} />
                </div>
              </SectionCard>
            )
          })}

          {/* 6. Hotels */}
          <SectionCard id="hotels" title="Hotels" icon={Building2}>
            <div className="space-y-4">
              {hotels.map((h, i) => (
                <div key={i} className="relative rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Hotel {i + 1}</span>
                    {hotels.length > 1 && (
                      <button type="button" onClick={() => removeHotel(i)} className="text-destructive hover:opacity-80">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="City" value={h.city} onChange={(v) => updateHotel(i, { city: v })} placeholder="Bangkok" required />
                    <Input label="Hotel Name" value={h.hotelName} onChange={(v) => updateHotel(i, { hotelName: v })} placeholder="Centara Grand" required />
                    <Input label="Room Type" value={h.roomType} onChange={(v) => updateHotel(i, { roomType: v })} placeholder="Standard Double" />
                    <Input label="Check-in Date" type="date" value={h.checkIn} onChange={(v) => { const nights = v && h.checkOut ? Math.max(1, Math.round((new Date(h.checkOut).getTime() - new Date(v).getTime()) / 86400000)) : h.nights; updateHotel(i, { checkIn: v, nights }) }} />
                    <Input label="Check-out Date" type="date" value={h.checkOut} onChange={(v) => { const nights = v && h.checkIn ? Math.max(1, Math.round((new Date(v).getTime() - new Date(h.checkIn).getTime()) / 86400000)) : h.nights; updateHotel(i, { checkOut: v, nights }) }} />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Nights</label>
                      <div className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm font-mono">{h.nights}</div>
                    </div>
                    <Select label="Meal Plan" value={h.mealPlan} options={MEAL_PLANS} onChange={(v) => updateHotel(i, { mealPlan: v })} />
                    <StarsSelector value={h.stars} onChange={(v) => updateHotel(i, { stars: v })} />
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_OPTIONS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => updateHotel(i, { amenities: h.amenities.includes(a) ? h.amenities.filter((x) => x !== a) : [...h.amenities, a] })}
                          className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${h.amenities.includes(a) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-secondary-foreground hover:border-primary/40'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addHotel} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3.5" /> Add Hotel
              </button>
            </div>
          </SectionCard>

          {/* 7. Car Rentals */}
          <SectionCard id="car-rentals" title="Car Rentals" icon={Car}>
            <div className="space-y-4">
              {carRentals.length === 0 && (
                <p className="text-xs text-muted-foreground">No car rentals added yet.</p>
              )}
              {carRentals.map((c, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Car Rental {i + 1}</span>
                    <button type="button" onClick={() => removeCar(i)} className="text-destructive hover:opacity-80">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="City" value={c.city} onChange={(v) => updateCar(i, { city: v })} placeholder="Phuket" />
                    <Input label="Vendor Name" value={c.vendorName} onChange={(v) => updateCar(i, { vendorName: v })} placeholder="Local Driver / Hertz" />
                    <Input label="Vehicle Type" value={c.vehicleType} onChange={(v) => updateCar(i, { vehicleType: v })} placeholder="SUV / Innova / Coaster" />
                    <Input label="Pickup Date" type="date" value={c.pickupDate} onChange={(v) => updateCar(i, { pickupDate: v })} />
                    <Input label="Dropoff Date" type="date" value={c.dropoffDate} onChange={(v) => { const days2 = v && c.pickupDate ? Math.max(1, Math.round((new Date(v).getTime() - new Date(c.pickupDate).getTime()) / 86400000)) : c.numberOfDays; updateCar(i, { dropoffDate: v, numberOfDays: days2, totalCost: c.costPerDay * days2 }) }} />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Days</label>
                      <div className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm font-mono">{c.numberOfDays}</div>
                    </div>
                    <Input label="Pickup Location" value={c.pickupLocation} onChange={(v) => updateCar(i, { pickupLocation: v })} placeholder="Phuket Airport" />
                    <Input label="Dropoff Location" value={c.dropoffLocation} onChange={(v) => updateCar(i, { dropoffLocation: v })} placeholder="Patong Hotel" />
                    <Input label="Booking Reference" value={c.bookingReference} onChange={(v) => updateCar(i, { bookingReference: v })} placeholder="Optional" />
                    <Input label="Cost Per Day" type="number" value={c.costPerDay} onChange={(v) => { const pd = parseInt(v) || 0; updateCar(i, { costPerDay: pd, totalCost: pd * c.numberOfDays }) }} />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Total Cost</label>
                      <div className="rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm font-mono">{fmt(c.totalCost)}</div>
                    </div>
                    <div className="flex items-end pb-2">
                      <Toggle label="Driver Included" checked={c.driverIncluded} onChange={(v) => updateCar(i, { driverIncluded: v })} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addCar} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3.5" /> Add Car Rental
              </button>
            </div>
          </SectionCard>

          {/* 8. Ground Transfer */}
          <SectionCard id="ground-transfer" title="Ground Transfers" icon={Compass}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Mode of Transport" value={transferMode} options={TRANSPORT_MODES} onChange={setTransferMode} />
              <div className="flex items-end pb-2">
                <Toggle label="Driver details included" checked={driverDetails} onChange={setDriverDetails} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Transfer Notes</label>
                <textarea
                  rows={3}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Airport pickup, inter-city transfers, local sightseeing included..."
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </SectionCard>

          {/* 9. Day Plans */}
          <SectionCard id="day-plans" title="Day-by-Day Plans" icon={CalendarDays}>
            <div className="space-y-4">
              {days.map((d, di) => (
                <div key={di} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold">Day {di + 1}</span>
                    {days.length > 1 && (
                      <button type="button" onClick={() => removeDay(di)} className="text-destructive hover:opacity-80">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input label="Date" type="date" value={d.date} onChange={(v) => updateDay(di, { date: v })} />
                    <Input label="City" value={d.city} onChange={(v) => updateDay(di, { city: v })} placeholder="Bangkok" />
                    <Input label="Day Title" value={d.title} onChange={(v) => updateDay(di, { title: v })} placeholder="City Highlights" />
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Day Summary</label>
                    <textarea rows={2} value={d.daySummary} onChange={(e) => updateDay(di, { daySummary: e.target.value })} placeholder="Brief overview of the day..." className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div className="mt-3 flex gap-4">
                    <Toggle label="Breakfast" checked={d.mealBreakfast} onChange={(v) => updateDay(di, { mealBreakfast: v })} />
                    <Toggle label="Lunch" checked={d.mealLunch} onChange={(v) => updateDay(di, { mealLunch: v })} />
                    <Toggle label="Dinner" checked={d.mealDinner} onChange={(v) => updateDay(di, { mealDinner: v })} />
                  </div>
                  {/* Places */}
                  <div className="mt-4 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Places to Visit</p>
                    {d.places.map((p, pi) => (
                      <div key={pi} className="flex gap-2">
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePlace(di, pi, { name: e.target.value })}
                            placeholder="Place name"
                            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <select
                            value={p.timeSlot}
                            onChange={(e) => updatePlace(di, pi, { timeSlot: e.target.value as TimeSlot })}
                            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                          >
                            {TIME_SLOTS.map((s) => <option key={s} value={s}>{SLOT_EMOJI[s]} {s}</option>)}
                          </select>
                          <input
                            type="text"
                            value={p.highlights}
                            onChange={(e) => updatePlace(di, pi, { highlights: e.target.value })}
                            placeholder="Highlights / description"
                            className="flex-[2] rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <label className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                            <input type="checkbox" checked={p.entryFeeIncluded} onChange={(e) => updatePlace(di, pi, { entryFeeIncluded: e.target.checked })} className="accent-primary" />
                            Entry included
                          </label>
                        </div>
                        {d.places.length > 1 && (
                          <button type="button" onClick={() => removePlace(di, pi)} className="text-muted-foreground hover:text-destructive">
                            <Minus className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addPlace(di)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="size-3.5" /> Add place
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addDay} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3.5" /> Add Day
              </button>
            </div>
          </SectionCard>

          {/* 10. Events */}
          <SectionCard id="events" title="Events" icon={Ticket}>
            <div className="space-y-4">
              {events.length === 0 && <p className="text-xs text-muted-foreground">No events added yet.</p>}
              {events.map((e, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Event {i + 1}</span>
                    <button type="button" onClick={() => removeEvent(i)} className="text-destructive hover:opacity-80"><Trash2 className="size-4" /></button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="Event Name" value={e.name} onChange={(v) => updateEvent(i, { name: v })} placeholder="Burj Khalifa At the Top" />
                    <Input label="Date" type="date" value={e.date} onChange={(v) => updateEvent(i, { date: v })} />
                    <Input label="Time" value={e.time} onChange={(v) => updateEvent(i, { time: v })} placeholder="18:00" />
                    <Input label="Venue" value={e.venue} onChange={(v) => updateEvent(i, { venue: v })} placeholder="Burj Khalifa, Level 124" />
                    <Input label="City" value={e.city} onChange={(v) => updateEvent(i, { city: v })} placeholder="Dubai" />
                    <Select label="Category" value={e.category} options={EVENT_CATEGORIES} onChange={(v) => updateEvent(i, { category: v })} />
                    <Input label="Booking Reference" value={e.bookingReference} onChange={(v) => updateEvent(i, { bookingReference: v })} placeholder="Optional" />
                    <Input label="Seat Details" value={e.seatDetails} onChange={(v) => updateEvent(i, { seatDetails: v })} placeholder="Sec A, Row 3, Seat 12" />
                    <Input label="Cost per Person" type="number" value={e.costPerPerson} onChange={(v) => updateEvent(i, { costPerPerson: parseFloat(v) || 0 })} />
                    <div className="flex items-end pb-2">
                      <Toggle label="Included in package" checked={e.included} onChange={(v) => updateEvent(i, { included: v })} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEvent} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3.5" /> Add Event
              </button>
            </div>
          </SectionCard>

          {/* 11. Optional Tours */}
          <SectionCard id="optional-tours" title="Optional Add-ons" icon={Ticket}>
            <div className="space-y-3">
              {tours.length === 0 && <p className="text-xs text-muted-foreground">No add-ons yet.</p>}
              {tours.map((t, i) => (
                <div key={i} className="flex flex-wrap gap-3 rounded-xl border border-border p-3">
                  <div className="flex flex-1 flex-wrap gap-3">
                    <div className="min-w-[140px] flex-1">
                      <input value={t.name} onChange={(e) => updateTour(i, { name: e.target.value })} placeholder="Tour name" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="min-w-[200px] flex-[2]">
                      <input value={t.description} onChange={(e) => updateTour(i, { description: e.target.value })} placeholder="Description" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="min-w-[100px]">
                      <input type="number" value={t.costPerPerson} onChange={(e) => updateTour(i, { costPerPerson: parseFloat(e.target.value) || 0 })} placeholder="Cost/person" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    </div>
                    <div className="flex items-center">
                      <Toggle label="Recommended" checked={t.recommended} onChange={(v) => updateTour(i, { recommended: v })} />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeTour(i)} className="self-center text-destructive hover:opacity-80"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={addTour} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="size-3.5" /> Add Add-on
              </button>
            </div>
          </SectionCard>

          {/* 12. Insurance */}
          <SectionCard id="insurance" title="Travel Insurance" icon={Shield}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center pt-5">
                <Toggle label="Insurance Included" checked={insuranceIncluded} onChange={setInsuranceIncluded} />
              </div>
              <Input label="Provider" value={insuranceProvider} onChange={setInsuranceProvider} placeholder="Bajaj Allianz" />
              <Input label="Coverage per Person" type="number" value={insuranceCoverage} onChange={(v) => setInsuranceCoverage(parseFloat(v) || 0)} placeholder="500000" />
            </div>
          </SectionCard>

          {/* 13. Pricing */}
          <SectionCard id="pricing" title="Pricing" icon={Wallet}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input label={`Cost per Adult (${adults} adults)`} type="number" value={costPerAdult} onChange={(v) => setCostPerAdult(parseFloat(v) || 0)} placeholder="25000" />
              <Input label={`Cost per Child (${children} children)`} type="number" value={costPerChild} onChange={(v) => setCostPerChild(parseFloat(v) || 0)} placeholder="15000" />
              <Input label={`Cost per Infant (${infants} infants)`} type="number" value={costPerInfant} onChange={(v) => setCostPerInfant(parseFloat(v) || 0)} placeholder="5000" />
            </div>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary">Auto-calculated Total</p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">{fmt(totalCost)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {adults} × {fmt(costPerAdult)}
                {children > 0 ? ` + ${children} × ${fmt(costPerChild)}` : ''}
                {infants > 0 ? ` + ${infants} × ${fmt(costPerInfant)}` : ''}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Base Fare" type="number" value={baseFare} onChange={(v) => setBaseFare(parseFloat(v) || 0)} />
              <Input label="Taxes & Surcharges" type="number" value={taxes} onChange={(v) => setTaxes(parseFloat(v) || 0)} />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tax Total</label>
                <div className="rounded-xl border border-border bg-secondary/50 px-3 py-2 font-mono text-sm">{fmt(taxTotal)}</div>
              </div>
            </div>
          </SectionCard>

          {/* 14. Inclusions / Exclusions */}
          <SectionCard id="inclusions" title="Inclusions & Exclusions" icon={Check}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-green-700">✓ Inclusions (one per line)</label>
                <textarea rows={6} value={inclusions} onChange={(e) => setInclusions(e.target.value)} className="w-full resize-none rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-red-700">✗ Exclusions (one per line)</label>
                <textarea rows={6} value={exclusions} onChange={(e) => setExclusions(e.target.value)} className="w-full resize-none rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200" />
              </div>
            </div>
          </SectionCard>

          {/* 15. Cancellation Policy */}
          <SectionCard id="cancellation" title="Cancellation Policy" icon={X}>
            <div className="space-y-2">
              {cancellationRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={row.daysBeforeDeparture}
                    onChange={(e) => setCancellationRows((r) => r.map((rr, idx) => idx === i ? { ...rr, daysBeforeDeparture: e.target.value } : rr))}
                    placeholder="e.g. 15-29 days"
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={row.chargePercent}
                      onChange={(e) => setCancellationRows((r) => r.map((rr, idx) => idx === i ? { ...rr, chargePercent: parseInt(e.target.value) || 0 } : rr))}
                      placeholder="50"
                      className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <button type="button" onClick={() => removeCancellationRow(i)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addCancellationRow} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="size-3.5" /> Add row
              </button>
            </div>
          </SectionCard>

          {/* 16. Payment Terms */}
          <SectionCard id="payment" title="Payment Terms" icon={Wallet}>
            <textarea
              rows={4}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </SectionCard>

          {/* Final submit */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pb-8">
            <Link href="/agency" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary">
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
              {submitting ? 'Saving…' : 'Save Quotation'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
