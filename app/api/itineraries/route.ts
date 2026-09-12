import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ItinerarySchema } from '@/types/itinerary'
import { z } from 'zod'

const SaveRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  itinerary: ItinerarySchema,
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // @ts-ignore – id is added by the jwt/session callbacks
  const userId: string = session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = SaveRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const { prompt, itinerary } = parsed.data

  const saved = await prisma.itinerary.create({
    data: {
      userId,
      destination: itinerary.destination,
      totalDays: itinerary.totalDays,
      currency: itinerary.currency,
      prompt,
      data: itinerary as object,
    },
    select: { id: true, createdAt: true },
  })

  return NextResponse.json(saved, { status: 201 })
}
