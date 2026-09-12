import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AgencyItinerarySchema } from '@/types/agency-itinerary'
import { z } from 'zod'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const record = await prisma.agencyItinerary.findUnique({
    where: { id },
    select: {
      id: true,
      quotationNumber: true,
      clientName: true,
      tripTitle: true,
      destinations: true,
      prompt: true,
      data: true,
      isPublic: true,
      createdAt: true,
    },
  })

  if (!record) {
    return NextResponse.json({ error: 'Itinerary not found.' }, { status: 404 })
  }

  if (!record.isPublic) {
    return NextResponse.json({ error: 'This itinerary is not publicly accessible.' }, { status: 403 })
  }

  return NextResponse.json(record)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // @ts-ignore
  const userId: string = session.user.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.agencyItinerary.findUnique({ where: { id }, select: { userId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  if (existing.userId !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const parsed = AgencyItinerarySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid itinerary data.', details: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Server-side arithmetic verification
  const { passengers, pricing } = data
  const recalcTotal =
    pricing.costPerAdult * passengers.adults +
    pricing.costPerChild * passengers.children +
    pricing.costPerInfant * passengers.infants
  if (Math.abs(recalcTotal - pricing.totalCost) > 1) {
    data.pricing.totalCost = Math.round(recalcTotal / 100) * 100
  }
  data.pricing.taxBreakdown.totalAmount =
    pricing.taxBreakdown.baseFare + pricing.taxBreakdown.taxesAndSurcharges

  await prisma.agencyItinerary.update({
    where: { id },
    data: {
      clientName: data.trip.clientName,
      tripTitle: data.trip.tripTitle,
      destinations: data.trip.destinations,
      data: data as object,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // @ts-ignore
  const userId: string = session.user.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await prisma.agencyItinerary.findUnique({ where: { id }, select: { userId: true } })
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  if (existing.userId !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

  await prisma.agencyItinerary.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
