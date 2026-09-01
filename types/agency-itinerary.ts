import { z } from 'zod'

/* ------------------------------------------------------------------ */
/* Enums & shared primitives                                           */
/* ------------------------------------------------------------------ */

export const MealPlanSchema = z.enum([
  'EP (Room Only)',
  'CP (Breakfast Included)',
  'MAP (Breakfast + Dinner)',
  'AP (All Meals Included)',
])

export const JourneyTypeSchema = z.enum(['outbound', 'return'])

export const CabinClassSchema = z.enum([
  'Economy',
  'Premium Economy',
  'Business',
  'First',
])

export const TimeSlotSchema = z.enum(['morning', 'afternoon', 'evening'])

export const TransportModeSchema = z.enum([
  'Private AC Sedan',
  'Private SUV/Innova',
  'AC Coach',
  'Self-Drive',
  'Luxury Train',
])

/* ------------------------------------------------------------------ */
/* Agency & Quotation Metadata                                         */
/* ------------------------------------------------------------------ */

export const AgencyMetaSchema = z.object({
  agencyName: z.string().min(1),
  agencyLogoUrl: z.string().url().optional(),
  agentName: z.string().min(1),
  agentContact: z.string().min(1),
  quotationNumber: z.string().min(1),
  quotationValidUntil: z.string().min(1),
  createdAt: z.string().min(1),
})

/* ------------------------------------------------------------------ */
/* Client & Trip Metadata                                              */
/* ------------------------------------------------------------------ */

export const TripMetaSchema = z.object({
  clientName: z.string().min(1),
  tripTitle: z.string().min(1),
  destinations: z.array(z.string().min(1)).min(1),
  totalDays: z.number().int().positive(),
  totalNights: z.number().int().positive(),
  travelDates: z.object({
    departure: z.string().min(1),
    return: z.string().min(1),
  }),
  currency: z.string().min(1).default('INR'),
})

/* ------------------------------------------------------------------ */
/* Passengers                                                          */
/* ------------------------------------------------------------------ */

export const PassengersSchema = z.object({
  adults: z.number().int().nonnegative(),
  children: z.number().int().nonnegative(),
  infants: z.number().int().nonnegative(),
  childAgeRange: z.string().default('2–11 years'),
  infantAgeRange: z.string().default('0–23 months'),
})

/* ------------------------------------------------------------------ */
/* Flights                                                             */
/* ------------------------------------------------------------------ */

export const AirportSchema = z.object({
  airportCode: z.string().min(3).max(3),
  city: z.string().min(1),
  time: z.string().min(1),
  terminal: z.string().optional(),
})

export const FlightSchema = z.object({
  journeyType: JourneyTypeSchema,
  pnr: z.string().min(1),
  airline: z.string().min(1),
  flightNumber: z.string().min(1),
  aircraftType: z.string().min(1),
  departure: AirportSchema,
  arrival: AirportSchema,
  duration: z.string().min(1),
  baggageAllowance: z.string().min(1),
  cabinClass: CabinClassSchema,
})

/* ------------------------------------------------------------------ */
/* Accommodation                                                       */
/* ------------------------------------------------------------------ */

export const HotelSchema = z.object({
  city: z.string().min(1),
  hotelName: z.string().min(1),
  starRating: z.number().int().min(1).max(5),
  roomType: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  numberOfNights: z.number().int().positive(),
  mealPlan: MealPlanSchema,
  amenities: z.array(z.string()),
})

/* ------------------------------------------------------------------ */
/* Ground Transportation                                               */
/* ------------------------------------------------------------------ */

export const GroundTransferSchema = z.object({
  modeOfTransport: TransportModeSchema,
  driverDetailsIncluded: z.boolean(),
  transferNotes: z.string().min(1),
})

/* ------------------------------------------------------------------ */
/* Daily Itinerary                                                     */
/* ------------------------------------------------------------------ */

export const PlaceSchema = z.object({
  name: z.string().min(1),
  timeSlot: TimeSlotSchema,
  highlights: z.string().min(1),
  entryFeeIncluded: z.boolean(),
})

export const DayPlanSchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string().min(1),
  city: z.string().min(1),
  title: z.string().min(1),
  daySummary: z.string().min(1),
  placesToVisit: z.array(PlaceSchema).min(1),
  mealsIncluded: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
  }),
})

/* ------------------------------------------------------------------ */
/* Optional Add-ons                                                    */
/* ------------------------------------------------------------------ */

export const OptionalTourSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  costPerPerson: z.number().nonnegative(),
  recommended: z.boolean(),
})

/* ------------------------------------------------------------------ */
/* Travel Insurance                                                    */
/* ------------------------------------------------------------------ */

export const TravelInsuranceSchema = z.object({
  included: z.boolean(),
  provider: z.string().optional(),
  coverageAmountPerPerson: z.number().nonnegative().optional(),
})

/* ------------------------------------------------------------------ */
/* Pricing & Terms                                                     */
/* ------------------------------------------------------------------ */

export const CancellationSlabSchema = z.object({
  daysBeforeDeparture: z.string().min(1),
  chargePercent: z.number().nonnegative().max(100),
})

export const PricingSchema = z.object({
  costPerAdult: z.number().nonnegative(),
  costPerChild: z.number().nonnegative(),
  costPerInfant: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
  taxBreakdown: z.object({
    baseFare: z.number().nonnegative(),
    taxesAndSurcharges: z.number().nonnegative(),
    totalAmount: z.number().nonnegative(),
  }),
})

/* ------------------------------------------------------------------ */
/* Root Schema                                                         */
/* ------------------------------------------------------------------ */

export const AgencyItinerarySchema = z.object({
  agency: AgencyMetaSchema,
  trip: TripMetaSchema,
  passengers: PassengersSchema,
  flights: z.array(FlightSchema).min(2),
  hotels: z.array(HotelSchema).min(1),
  groundTransfer: GroundTransferSchema,
  days: z.array(DayPlanSchema).min(1),
  optionalTours: z.array(OptionalTourSchema),
  travelInsurance: TravelInsuranceSchema,
  pricing: PricingSchema,
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  cancellationPolicy: z.array(CancellationSlabSchema),
  paymentTerms: z.string().min(1),
})

/* ------------------------------------------------------------------ */
/* Inferred TypeScript types                                           */
/* ------------------------------------------------------------------ */

export type MealPlan = z.infer<typeof MealPlanSchema>
export type JourneyType = z.infer<typeof JourneyTypeSchema>
export type CabinClass = z.infer<typeof CabinClassSchema>
export type TransportMode = z.infer<typeof TransportModeSchema>
export type AgencyMeta = z.infer<typeof AgencyMetaSchema>
export type TripMeta = z.infer<typeof TripMetaSchema>
export type Passengers = z.infer<typeof PassengersSchema>
export type Airport = z.infer<typeof AirportSchema>
export type Flight = z.infer<typeof FlightSchema>
export type Hotel = z.infer<typeof HotelSchema>
export type GroundTransfer = z.infer<typeof GroundTransferSchema>
export type Place = z.infer<typeof PlaceSchema>
export type DayPlan = z.infer<typeof DayPlanSchema>
export type OptionalTour = z.infer<typeof OptionalTourSchema>
export type TravelInsurance = z.infer<typeof TravelInsuranceSchema>
export type CancellationSlab = z.infer<typeof CancellationSlabSchema>
export type Pricing = z.infer<typeof PricingSchema>
export type AgencyItinerary = z.infer<typeof AgencyItinerarySchema>
