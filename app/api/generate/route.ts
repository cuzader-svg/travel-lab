import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { ItinerarySchema as ItineraryResponseSchema } from '@/types/itinerary'

const GenerateRequestSchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
})

const SYSTEM_INSTRUCTION = `You are an expert travel itinerary planner.

Given the user's free-form trip description, generate a complete day-by-day itinerary.

Rules:
- Output MUST be a single valid JSON object conforming exactly to the provided JSON schema. No markdown fences, no commentary.
- "totalDays" MUST equal the number of entries in "days", and each day's "day" field MUST be its 1-based index.
- Every day MUST have exactly three activities: one "morning", one "afternoon", and one "evening" timeSlot, in that order.
- Use realistic, well-known places matching the requested destination; "location" must include the neighborhood or city.
- Costs are per person, in the currency implied by the user's prompt (default INR), and must be plausible for the destination.
- "budget" itemizes the WHOLE trip: accommodation, food, activities, transport, and total. "total" MUST equal the sum of the other four.
- Respect any stated budget, pace, interests, and traveler type from the prompt. If the budget is tight, prefer cheaper options rather than ignoring it.
- Keep descriptions concise (max 2 sentences), specific, and useful.`

export const maxDuration = 60

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const parsedRequest = GenerateRequestSchema.safeParse(body)
  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: 'Missing or invalid "prompt" (3-2000 characters required).',
        details: z.treeifyError(parsedRequest.error),
      },
      { status: 400 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured.')
    return NextResponse.json(
      { error: 'Generation service is not configured.' },
      { status: 500 },
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: parsedRequest.data.prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(ItineraryResponseSchema),
        temperature: 0.7,
      },
    })

    const rawText = response.text?.trim()
    if (!rawText) {
      return NextResponse.json(
        { error: 'Model returned an empty response.' },
        { status: 422 },
      )
    }

    let json: unknown
    try {
      json = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'Model response was not valid JSON.' },
        { status: 422 },
      )
    }

    const parsedItinerary = ItineraryResponseSchema.safeParse(json)
    if (!parsedItinerary.success) {
      console.error(
        'Itinerary validation failed:',
        JSON.stringify(z.treeifyError(parsedItinerary.error)),
      )
      return NextResponse.json(
        {
          error: 'Generated itinerary did not match the required schema.',
          details: z.treeifyError(parsedItinerary.error),
        },
        { status: 422 },
      )
    }

    return NextResponse.json(parsedItinerary.data, { status: 200 })
  } catch (error) {
    console.error('Itinerary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary. Please try again.' },
      { status: 500 },
    )
  }
}
