import { z } from 'zod'

export const TimeSlotSchema = z.enum(['morning', 'afternoon', 'evening'])

export const ActivitySchema = z.object({
  timeSlot: TimeSlotSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  estimatedCost: z.number().nonnegative(),
  category: z.string().min(1),
})

export const DayPlanSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),
  activities: z.array(ActivitySchema).min(1),
})

export const BudgetSchema = z.object({
  accommodation: z.number().nonnegative(),
  food: z.number().nonnegative(),
  activities: z.number().nonnegative(),
  transport: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export const ItinerarySchema = z.object({
  destination: z.string().min(1),
  totalDays: z.number().int().positive(),
  currency: z.string().min(1),
  days: z.array(DayPlanSchema).min(1),
  budget: BudgetSchema,
})

export type TimeSlot = z.infer<typeof TimeSlotSchema>
export type Activity = z.infer<typeof ActivitySchema>
export type DayPlan = z.infer<typeof DayPlanSchema>
export type Budget = z.infer<typeof BudgetSchema>
export type Itinerary = z.infer<typeof ItinerarySchema>
