import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // @ts-ignore – id is added by the jwt/session callbacks
  const userId: string = session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Verify ownership before deleting
  const itinerary = await prisma.itinerary.findUnique({
    where: { id },
    select: { userId: true },
  })

  if (!itinerary) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  if (itinerary.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.itinerary.delete({ where: { id } })

  return NextResponse.json({ success: true }, { status: 200 })
}
