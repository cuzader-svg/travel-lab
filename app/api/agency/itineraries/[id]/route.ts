import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
