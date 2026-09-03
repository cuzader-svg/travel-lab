import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { ActivitySchema, TimeSlotSchema } from '@/types/itinerary'
import { authOptions } from '@/lib/auth'

const SwapRequestSchema = z.object({
  destination: z.string().min(1),
  currency: z.string().min(1),
  dayTitle: z.string().min(1),
  timeSlot: TimeSlotSchema,
  currentActivity: ActivitySchema,
})

const SYSTEM_INSTRUCTION = `You are an expert travel planner. Suggest ONE alternative activity to replace the given one.

Rules:
- Output MUST be a single valid JSON object conforming exactly to the provided JSON schema. No markdown fences, no commentary.
- The alternative MUST be for the same timeSlot as the current activity.
- The alternative MUST be at the same destination.
- Do NOT suggest the same activity or a trivially similar one — offer a meaningfully different experience.
- Cost should be plausible and in the same currency. Keep it close to the original cost unless a much better option exists.
- Keep description concise (max 2 sentences), specific, and useful.`

export const maxDuration = 30

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  const parsed = SwapRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: z.treeifyError(parsed.error) },
      { status: 400 },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Generation service is not configured.' },
      { status: 500 },
    )
  }

  const { destination, currency, dayTitle, timeSlot, currentActivity } = parsed.data

  const userPrompt =
    `Destination: ${destination}. Day: "${dayTitle}". Time slot: ${timeSlot}. Currency: ${currency}.\n` +
    `Current activity to replace: "${currentActivity.title}" at ${currentActivity.location} (${currentActivity.category}, ~${currentActivity.estimatedCost} ${currency}).\n` +
    `Suggest one different ${timeSlot} activity for ${destination}.`

  try {
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: z.toJSONSchema(ActivitySchema),
        temperature: 0.9,
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

    const parsedActivity = ActivitySchema.safeParse(json)
    if (!parsedActivity.success) {
      return NextResponse.json(
        { error: 'Generated activity did not match the required schema.' },
        { status: 422 },
      )
    }

    return NextResponse.json(parsedActivity.data, { status: 200 })
  } catch (error) {
    console.error('Swap generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate alternative activity. Please try again.' },
      { status: 500 },
    )
  }
}
