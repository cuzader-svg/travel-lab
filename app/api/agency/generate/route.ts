import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { AgencyItinerarySchema } from '@/types/agency-itinerary'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const RequestSchema = z.object({
  prompt: z.string().trim().min(10).max(3000),
  agencyName: z.string().trim().min(1).default('Travel Lab'),
  agentName: z.string().trim().min(1).default('Travel Agent'),
  agentContact: z.string().trim().min(1).default('contact@travellab.in'),
})

const SYSTEM_INSTRUCTION = `You are an expert B2B travel planner generating professional client itineraries for travel agencies.

Given a free-form trip description, generate a COMPLETE, REALISTIC, and DETAILED travel itinerary in strict JSON format.

Rules:
- Output MUST be a single valid JSON object. No markdown fences, no commentary.
- Use real IATA airport codes (e.g., DEL, BOM, BKK, DXB, SIN).
- Use real airline names and plausible flight numbers (e.g., "AI 315", "EK 571", "6E 1234").
- Use real aircraft types appropriate to the route (e.g., short-haul: Airbus A320/A321, long-haul: Boeing 787-9, Airbus A380).
- Use real, well-known hotels appropriate to the destination and budget.
- Meal plan codes: EP (Room Only), CP (Breakfast Included), MAP (Breakfast + Dinner), AP (All Meals Included).
- Generate day-by-day plans for ALL days of the trip with real places to visit.
- Pricing must be plausible for the Indian travel market in INR unless stated otherwise.
- totalCost MUST equal (costPerAdult × adults) + (costPerChild × children) + (costPerInfant × infants) rounded to nearest hundred.
- taxBreakdown.totalAmount MUST equal baseFare + taxesAndSurcharges.
- Include at least 3 inclusions and 3 exclusions.
- Include at least 2 cancellation slabs.
- Include at least 1 optional tour.
- Quotation number, validity date, and createdAt will be filled by the server — set them to empty strings in the agency object.
- agencyLogoUrl should be omitted (leave it undefined).`

export const maxDuration = 60

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

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Generation service is not configured.' }, { status: 500 })
  }

  const { prompt, agencyName, agentName, agentContact } = parsed.data
  const quotationNumber = generateQuotationNumber()
  const now = new Date().toISOString()
  const validUntil = getValidityDate()

  const enrichedPrompt =
    `Agency: ${agencyName} | Agent: ${agentName} | Contact: ${agentContact}\n` +
    `Quotation: ${quotationNumber} | Valid until: ${validUntil} | Created: ${now}\n\n` +
    `Trip request: ${prompt}`

  try {
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: enrichedPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(AgencyItinerarySchema),
        temperature: 0.7,
      },
    })

    const rawText = response.text?.trim()
    if (!rawText) {
      return NextResponse.json({ error: 'Model returned an empty response.' }, { status: 422 })
    }

    let json: unknown
    try {
      json = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'Model response was not valid JSON.' }, { status: 422 })
    }

    // Inject server-side values
    if (json && typeof json === 'object' && 'agency' in json) {
      const j = json as Record<string, unknown>
      const agency = (j.agency ?? {}) as Record<string, unknown>
      agency.agencyName = agencyName
      agency.agentName = agentName
      agency.agentContact = agentContact
      agency.quotationNumber = quotationNumber
      agency.quotationValidUntil = validUntil
      agency.createdAt = now
      j.agency = agency
    }

    const parsedItinerary = AgencyItinerarySchema.safeParse(json)
    if (!parsedItinerary.success) {
      console.error('Agency itinerary validation failed:', JSON.stringify(z.treeifyError(parsedItinerary.error)))
      return NextResponse.json(
        { error: 'Generated itinerary did not match the required schema.', details: z.treeifyError(parsedItinerary.error) },
        { status: 422 },
      )
    }

    const data = parsedItinerary.data

    const saved = await prisma.agencyItinerary.create({
      data: {
        userId,
        quotationNumber,
        clientName: data.trip.clientName,
        tripTitle: data.trip.tripTitle,
        destinations: data.trip.destinations,
        prompt,
        data: data as object,
        isPublic: true,
      },
      select: { id: true, quotationNumber: true, createdAt: true },
    })

    return NextResponse.json({ id: saved.id, quotationNumber: saved.quotationNumber, itinerary: data }, { status: 201 })
  } catch (error) {
    console.error('Agency itinerary generation error:', error)
    return NextResponse.json({ error: 'Failed to generate itinerary. Please try again.' }, { status: 500 })
  }
}
