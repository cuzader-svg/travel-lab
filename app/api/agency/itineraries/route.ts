import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgencyItinerarySchema } from '@/types/agency-itinerary'
import { z } from 'zod'

function generateQuotationNumber(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TL-${year}-${rand}`
}

function getValidityDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // @ts-ignore
  const userId: string = session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const itineraries = await prisma.agencyItinerary.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      quotationNumber: true,
      clientName: true,
      tripTitle: true,
      destinations: true,
      createdAt: true,
    },
  })

  return NextResponse.json(itineraries)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // @ts-ignore
  const userId: string = session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const parsed = AgencyItinerarySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid itinerary data.', details: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const data = parsed.data
  const quotationNumber = generateQuotationNumber()
  const now = new Date().toISOString()
  const validUntil = getValidityDate()

  // Inject server-side values
  data.agency.quotationNumber = quotationNumber
  data.agency.quotationValidUntil = validUntil
  data.agency.createdAt = now

  // Server-side arithmetic verification
  const { passengers, pricing } = data
  const recalcTotal =
    pricing.costPerAdult * passengers.adults +
    pricing.costPerChild * passengers.children +
    pricing.costPerInfant * passengers.infants
  if (Math.abs(recalcTotal - pricing.totalCost) > 1) {
    data.pricing.totalCost = Math.round(recalcTotal / 100) * 100
  }
  const recalcTax = pricing.taxBreakdown.baseFare + pricing.taxBreakdown.taxesAndSurcharges
  data.pricing.taxBreakdown.totalAmount = recalcTax

  const saved = await prisma.agencyItinerary.create({
    data: {
      userId,
      quotationNumber,
      clientName: data.trip.clientName,
      tripTitle: data.trip.tripTitle,
      destinations: data.trip.destinations,
      prompt: 'Manual entry',
      data: data as object,
      isPublic: true,
    },
    select: { id: true, quotationNumber: true },
  })

  return NextResponse.json({ id: saved.id, quotationNumber: saved.quotationNumber }, { status: 201 })
}
