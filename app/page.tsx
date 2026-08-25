'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgeIndianRupee,
  Bed,
  Bus,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  FileDown,
  MapPin,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RefreshCw,
  Sparkles,
  Ticket,
  Utensils,
  Wallet,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Types & Mock Data                                                   */
/* ------------------------------------------------------------------ */

type Activity = {
  title: string
  description: string
  location: string
  cost: number
  travel?: string
}

type Slot = {
  id: string
  label: string
  emoji: string
  time: string
  options: Activity[]
}

type Day = {
  title: string
  subtitle: string
  slots: Slot[]
}

const QUICK_CHIPS = [
  'Solo Traveler',
  'Family Friendly',
  'Fast Paced',
  'Foodie Focus',
  'Budget Friendly',
]

const LOADING_STEPS = [
  'Parsing your trip preferences...',
  'Scouting top-rated spots in Thailand...',
  'Optimizing routes...',
  'Calculating transport budget...',
  'Finalizing schedule...',
]

const BUDGET_TARGET = 50500
const BUDGET_SPENT = 47200

const BUDGET_BREAKDOWN = [
  { label: 'Accommodation', amount: 22000, icon: Bed },
  { label: 'Food & Dining', amount: 11500, icon: Utensils },
  { label: 'Activities & Tickets', amount: 8700, icon: Ticket },
  { label: 'Transportation', amount: 5000, icon: Bus },
]

const slot = (
  id: string,
  label: string,
  emoji: string,
  time: string,
  options: Activity[],
): Slot => ({ id, label, emoji, time, options })

const DAYS: Day[] = [
  {
    title: 'Arrival & Old Bangkok',
    subtitle: 'Temples by day, Khao San by night',
    slots: [
      slot('d1-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Grand Palace & Wat Phra Kaew',
          description:
            'Start with Bangkok\u2019s most iconic royal complex and the Emerald Buddha.',
          location: 'Phra Nakhon, Bangkok',
          cost: 1225,
          travel: '20 min taxi from hotel',
        },
        {
          title: 'Wat Pho Reclining Buddha',
          description:
            'Marvel at the 46m gold-leaf Buddha and the birthplace of Thai massage.',
          location: 'Phra Nakhon, Bangkok',
          cost: 490,
          travel: '15 min taxi from hotel',
        },
        {
          title: 'Bangkok National Museum',
          description:
            'A calm intro to Thai art and history inside a former palace.',
          location: 'Na Phra That Rd, Bangkok',
          cost: 500,
          travel: '18 min taxi from hotel',
        },
      ]),
      slot('d1-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Chao Phraya Longtail Boat Ride',
          description:
            'Cruise the canals of Thonburi past stilt houses and riverside temples.',
          location: 'Tha Chang Pier',
          cost: 900,
          travel: '10 min walk from palace',
        },
        {
          title: 'Wat Arun at Golden Hour',
          description:
            'Cross the river to climb the porcelain-studded Temple of Dawn.',
          location: 'Thonburi, Bangkok',
          cost: 245,
          travel: '5 min ferry crossing',
        },
        {
          title: 'Museum Siam Interactive Exhibits',
          description:
            'Playful, air-conditioned deep dive into what makes Thailand Thai.',
          location: 'Sanam Chai Rd, Bangkok',
          cost: 245,
          travel: '12 min walk from Wat Pho',
        },
      ]),
      slot('d1-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Khao San Road Night Crawl',
          description:
            'Street pad thai, live bands, and bucket cocktails on the backpacker mile.',
          location: 'Khao San Rd, Bangkok',
          cost: 1100,
          travel: '15 min tuk-tuk ride',
        },
        {
          title: 'Rambuttri Alley Food Stalls',
          description:
            'The mellower, lantern-lit sibling of Khao San with better grilled seafood.',
          location: 'Rambuttri Alley, Bangkok',
          cost: 850,
          travel: '12 min tuk-tuk ride',
        },
        {
          title: 'Riverside Rooftop Sundowners',
          description:
            'Cocktails above the Chao Phraya with a view of lit-up Wat Arun.',
          location: 'Maharaj Pier, Bangkok',
          cost: 1400,
          travel: '10 min taxi ride',
        },
      ]),
    ],
  },
  {
    title: 'Markets & Chinatown',
    subtitle: 'Shop hard, eat harder',
    slots: [
      slot('d2-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Chatuchak Weekend Market',
          description:
            '15,000 stalls of clothes, crafts, and coconut ice cream \u2014 pace yourself.',
          location: 'Chatuchak, Bangkok',
          cost: 800,
          travel: '25 min BTS Skytrain',
        },
        {
          title: 'Or Tor Kor Fresh Market',
          description:
            'Thailand\u2019s premium produce market \u2014 mango sticky rice at the source.',
          location: 'Kamphaeng Phet Rd, Bangkok',
          cost: 600,
          travel: '25 min MRT ride',
        },
        {
          title: 'Jim Thompson House Museum',
          description:
            'Teak-house museum of the American who revived Thai silk, set in lush gardens.',
          location: 'Rama I Rd, Bangkok',
          cost: 490,
          travel: '20 min BTS Skytrain',
        },
      ]),
      slot('d2-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Thai Cooking Class',
          description:
            'Hands-on class: green curry, tom yum, and a market tour included.',
          location: 'Silom, Bangkok',
          cost: 2450,
          travel: '30 min BTS from Chatuchak',
        },
        {
          title: 'ICONSIAM & River Views',
          description:
            'Splashy riverside mall with an indoor floating market on the ground floor.',
          location: 'Charoen Nakhon, Bangkok',
          cost: 700,
          travel: '35 min BTS + shuttle boat',
        },
        {
          title: 'Lumphini Park Paddle Boats',
          description:
            'Swan boats, monitor lizards, and shade \u2014 Bangkok\u2019s green lung.',
          location: 'Lumphini, Bangkok',
          cost: 300,
          travel: '25 min MRT ride',
        },
      ]),
      slot('d2-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Yaowarat Chinatown Street Feast',
          description:
            'Neon signs and Michelin-listed woks \u2014 hit the oyster omelet stall first.',
          location: 'Yaowarat Rd, Bangkok',
          cost: 950,
          travel: '15 min MRT to Wat Mangkon',
        },
        {
          title: 'Talad Neon Night Market',
          description:
            'Downtown night market with live music, vintage stalls, and seafood boats.',
          location: 'Pratunam, Bangkok',
          cost: 800,
          travel: '20 min taxi ride',
        },
        {
          title: 'Sky Bar Sundown Session',
          description:
            'Golden-hour skyline views from one of the world\u2019s highest rooftop bars.',
          location: 'Silom, Bangkok',
          cost: 1800,
          travel: '18 min BTS Skytrain',
        },
      ]),
    ],
  },
  {
    title: 'Ayutthaya Day Trip',
    subtitle: 'Ancient capital by rail',
    slots: [
      slot('d3-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Train to Ayutthaya + Wat Mahathat',
          description:
            'Ride the rails north to see the famous Buddha head wrapped in tree roots.',
          location: 'Ayutthaya Historical Park',
          cost: 650,
          travel: '90 min train from Hua Lamphong',
        },
        {
          title: 'Wat Phra Si Sanphet',
          description:
            'Three iconic bell-shaped chedis \u2014 the postcard shot of old Siam.',
          location: 'Ayutthaya Historical Park',
          cost: 245,
          travel: '90 min train + 10 min tuk-tuk',
        },
        {
          title: 'Bang Pa-In Summer Palace',
          description:
            'Eclectic royal retreat mixing Thai, Chinese, and European styles.',
          location: 'Bang Pa-In, Ayutthaya',
          cost: 490,
          travel: '75 min train ride',
        },
      ]),
      slot('d3-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Bicycle Ruins Loop',
          description:
            'Pedal between crumbling prangs and lotus ponds at your own pace.',
          location: 'Ayutthaya Old City',
          cost: 350,
          travel: '5 min walk to rental shop',
        },
        {
          title: 'Boat Ride Around the Island',
          description:
            'Circle the old capital by water, passing three riverside temples.',
          location: 'Chao Phrom Pier, Ayutthaya',
          cost: 600,
          travel: '10 min tuk-tuk to pier',
        },
        {
          title: 'Wat Chaiwatthanaram',
          description:
            'Khmer-style riverside ruin \u2014 best preserved and least crowded.',
          location: 'West bank, Ayutthaya',
          cost: 245,
          travel: '15 min tuk-tuk ride',
        },
      ]),
      slot('d3-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Boat Noodles + Night Train Back',
          description:
            'Slurp famous Ayutthaya boat noodles, then ride back to Bangkok.',
          location: 'Hua Ro Market, Ayutthaya',
          cost: 550,
          travel: '90 min train to Bangkok',
        },
        {
          title: 'Ayutthaya Night Market',
          description:
            'Riverside stalls of grilled river prawns and roti sai mai candy floss.',
          location: 'Bang Ian Rd, Ayutthaya',
          cost: 700,
          travel: '8 min tuk-tuk ride',
        },
        {
          title: 'Illuminated Ruins Walk',
          description:
            'The historical park glows after dark \u2014 quiet, cool, and photogenic.',
          location: 'Ayutthaya Historical Park',
          cost: 245,
          travel: '10 min walk from market',
        },
      ]),
    ],
  },
  {
    title: 'Fly South to Phuket',
    subtitle: 'Transit day, beach evening',
    slots: [
      slot('d4-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Flight BKK \u2192 Phuket',
          description:
            'Short 1h20m hop south \u2014 grab a window seat for Phang Nga Bay views.',
          location: 'Suvarnabhumi Airport',
          cost: 2100,
          travel: '45 min Airport Rail Link',
        },
        {
          title: 'Overnight Sleeper Bus (budget swap)',
          description:
            'Save the flight fare with a VIP sleeper coach \u2014 arrive rested-ish.',
          location: 'Southern Bus Terminal',
          cost: 950,
          travel: '30 min taxi to terminal',
        },
        {
          title: 'Morning at Suvarnabhumi Spa',
          description:
            'Pre-flight Thai massage and lounge time before boarding.',
          location: 'Suvarnabhumi Airport',
          cost: 800,
          travel: '45 min Airport Rail Link',
        },
      ]),
      slot('d4-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Check-in + Karon Beach Swim',
          description:
            'Drop bags at the beachfront guesthouse and dive straight into the Andaman.',
          location: 'Karon Beach, Phuket',
          cost: 300,
          travel: '45 min shuttle from airport',
        },
        {
          title: 'Big Buddha Viewpoint',
          description:
            '45m white-marble Buddha with a 360\u00B0 panorama over the island.',
          location: 'Nakkerd Hill, Phuket',
          cost: 400,
          travel: '30 min taxi from hotel',
        },
        {
          title: 'Old Phuket Town Stroll',
          description:
            'Sino-Portuguese shophouses, street art, and third-wave coffee.',
          location: 'Thalang Rd, Phuket Town',
          cost: 350,
          travel: '25 min taxi from hotel',
        },
      ]),
      slot('d4-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Bangla Road Night Scene',
          description:
            'Phuket\u2019s neon nightlife strip \u2014 live bands, bars, and people-watching.',
          location: 'Patong, Phuket',
          cost: 1300,
          travel: '20 min taxi ride',
        },
        {
          title: 'Karon Beach BBQ Dinner',
          description:
            'Toes-in-sand grilled snapper and cold Singha at a beach shack.',
          location: 'Karon Beach, Phuket',
          cost: 900,
          travel: '5 min walk from hotel',
        },
        {
          title: 'Phuket Weekend Night Market',
          description:
            'Locals\u2019 favorite naka market \u2014 crispy pork, souvenirs, sugarcane juice.',
          location: 'Naka Market, Phuket',
          cost: 750,
          travel: '25 min taxi ride',
        },
      ]),
    ],
  },
  {
    title: 'Phi Phi Islands',
    subtitle: 'Boats, snorkels, lagoons',
    slots: [
      slot('d5-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Speedboat to Maya Bay',
          description:
            'Early departure beats the crowds to the famous limestone-ringed bay.',
          location: 'Rassada Pier, Phuket',
          cost: 2200,
          travel: '30 min transfer to pier',
        },
        {
          title: 'James Bond Island Tour',
          description:
            'Longtail through Phang Nga Bay\u2019s karst needles and sea caves.',
          location: 'Ao Po Pier, Phuket',
          cost: 1900,
          travel: '40 min transfer to pier',
        },
        {
          title: 'Coral Island Snorkel Trip',
          description:
            'Closer, cheaper reef trip with banana-boat add-ons for the brave.',
          location: 'Chalong Pier, Phuket',
          cost: 1400,
          travel: '20 min transfer to pier',
        },
      ]),
      slot('d5-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Pileh Lagoon Snorkeling',
          description:
            'Swim in a glassy emerald lagoon walled by 100m limestone cliffs.',
          location: 'Phi Phi Leh',
          cost: 500,
          travel: '15 min boat hop',
        },
        {
          title: 'Monkey Beach & Viewpoint Hike',
          description:
            'Cheeky macaques, then a sweaty-but-worth-it climb over Tonsai Bay.',
          location: 'Phi Phi Don',
          cost: 350,
          travel: '20 min boat hop',
        },
        {
          title: 'Bamboo Island Beach Time',
          description:
            'Powder-white sandbar with the clearest water of the trip.',
          location: 'Bamboo Island',
          cost: 450,
          travel: '25 min boat hop',
        },
      ]),
      slot('d5-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Patong Seafood Night Market',
          description:
            'Pick your lobster from the ice, watch it hit the grill.',
          location: 'Banzaan Market, Patong',
          cost: 1200,
          travel: '45 min boat + taxi back',
        },
        {
          title: 'Fire Show on Karon Beach',
          description:
            'Free beachfront fire-spinning shows \u2014 budget for a coconut or two.',
          location: 'Karon Beach, Phuket',
          cost: 400,
          travel: '5 min walk from hotel',
        },
        {
          title: 'Sunset Cruise with Dinner',
          description:
            'Catamaran buffet as the sun drops behind Promthep Cape.',
          location: 'Chalong Bay, Phuket',
          cost: 2100,
          travel: '25 min transfer to pier',
        },
      ]),
    ],
  },
  {
    title: 'Slow Morning & Departure',
    subtitle: 'One last mango sticky rice',
    slots: [
      slot('d6-m', 'Morning', '\u{1F305}', '9:00 AM - 12:00 PM', [
        {
          title: 'Sunrise Walk at Promthep Cape',
          description:
            'The island\u2019s southern tip \u2014 lighthouse views and calm before packing.',
          location: 'Promthep Cape, Phuket',
          cost: 300,
          travel: '25 min taxi from hotel',
        },
        {
          title: 'Beachfront Yoga Session',
          description: 'Drop-in vinyasa class with the Andaman as your backdrop.',
          location: 'Kata Beach, Phuket',
          cost: 450,
          travel: '10 min taxi from hotel',
        },
        {
          title: 'Last Swim at Freedom Beach',
          description:
            'Longtail-access-only cove \u2014 the quietest sand on the island.',
          location: 'Freedom Beach, Phuket',
          cost: 700,
          travel: '15 min longtail boat',
        },
      ]),
      slot('d6-a', 'Afternoon', '\u2600\uFE0F', '1:00 PM - 5:00 PM', [
        {
          title: 'Souvenirs + Mango Sticky Rice',
          description:
            'Old Town shophouse gifts and one final plate of the good stuff.',
          location: 'Phuket Town',
          cost: 800,
          travel: '25 min taxi from hotel',
        },
        {
          title: 'Thai Massage Farewell',
          description: '90-minute full-body massage before the long journey home.',
          location: 'Karon, Phuket',
          cost: 600,
          travel: '5 min walk from hotel',
        },
        {
          title: 'Cashew Factory & Coffee Stop',
          description:
            'Free tastings at the island\u2019s famous cashew workshop.',
          location: 'Chalong, Phuket',
          cost: 400,
          travel: '20 min taxi from hotel',
        },
      ]),
      slot('d6-e', 'Evening', '\u{1F319}', '6:00 PM - 10:00 PM', [
        {
          title: 'Flight Home from Phuket',
          description:
            'Airport transfer, one last Chang at the gate, and wheels up.',
          location: 'Phuket International Airport',
          cost: 2300,
          travel: '50 min shuttle to airport',
        },
        {
          title: 'Late Dinner at Airport',
          description:
            'Khao soi at the food court beats anything airside \u2014 eat before security.',
          location: 'Phuket International Airport',
          cost: 500,
          travel: '50 min shuttle to airport',
        },
        {
          title: 'Overnight Bus to Bangkok (budget swap)',
          description:
            'Sleeper coach back to the capital for an onward morning flight.',
          location: 'Phuket Bus Terminal 2',
          cost: 1000,
          travel: '30 min taxi to terminal',
        },
      ]),
    ],
  },
]

const formatINR = (n: number) => `\u20B9${n.toLocaleString('en-IN')}`

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({
  onNewTrip,
  onCopyMarkdown,
  onExportPDF,
  copied,
  hasItinerary,
}: {
  onNewTrip: () => void
  onCopyMarkdown: () => void
  onExportPDF: () => void
  copied: boolean
  hasItinerary: boolean
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight md:text-base">
              Travel Lab{' '}
              <span className="hidden text-muted-foreground font-normal sm:inline">
                — Smart Itinerary Builder
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Personalized trip planning powered by AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasItinerary && (
            <>
              <button
                type="button"
                onClick={onExportPDF}
                className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary md:inline-flex"
              >
                <FileDown className="size-3.5" aria-hidden="true" />
                Export PDF
              </button>
              <button
                type="button"
                onClick={onCopyMarkdown}
                className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary md:inline-flex"
              >
                {copied ? (
                  <Check className="size-3.5 text-primary" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onNewTrip}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            New Trip
          </button>
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero (Step 1)                                                       */
/* ------------------------------------------------------------------ */

function Hero({
  input,
  setInput,
  onGenerate,
}: {
  input: string
  setInput: (v: string) => void
  onGenerate: () => void
}) {
  const addChip = (chip: string) => {
    setInput(input.trim() ? `${input.trim()}, ${chip.toLowerCase()}` : chip)
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-14 md:pt-24">
      <div className="mb-8 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="size-3 text-accent" aria-hidden="true" />
          AI-assisted trip planning
        </span>
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          Describe your dream trip.
          <br />
          <span className="text-primary">We&apos;ll build the itinerary.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          Destination, budget, vibe, and pace — in plain language. Travel Lab
          turns it into a day-by-day plan.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5">
        <label htmlFor="trip-prompt" className="sr-only">
          Describe your trip
        </label>
        <textarea
          id="trip-prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault()
              onGenerate()
            }
          }}
          rows={3}
          placeholder="e.g., 6 days in Thailand, 50,500 INR budget, focus on Thai night life & street food, Beach, moderate pace..."
          className="w-full resize-none rounded-xl bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
        />
        <div className="flex flex-col gap-3 px-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addChip(chip)}
                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {chip}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/40"
          >
            Generate Itinerary {'\u2728'}
            <ChevronRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Loading state                                                       */
/* ------------------------------------------------------------------ */

function AILoading({ step }: { step: number }) {
  return (
    <section
      className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-24 text-center"
      aria-live="polite"
    >
      <div className="relative mb-8 flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/15" />
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="size-6 animate-pulse" aria-hidden="true" />
        </div>
      </div>
      <h2 className="text-lg font-semibold">Building your itinerary</h2>
      <ul className="mt-6 w-full space-y-2.5 text-left">
        {LOADING_STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-all duration-500 ${
              i < step
                ? 'border-border bg-card text-muted-foreground'
                : i === step
                  ? 'border-primary/30 bg-primary/5 font-medium text-foreground'
                  : 'border-transparent text-muted-foreground/40'
            }`}
          >
            {i < step ? (
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : i === step ? (
              <RefreshCw
                className="size-4 shrink-0 animate-spin text-primary"
                aria-hidden="true"
              />
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Stats bar                                                           */
/* ------------------------------------------------------------------ */

function StatsBar() {
  const pct = Math.round((BUDGET_SPENT / BUDGET_TARGET) * 100)
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Destination &amp; Duration
        </div>
        <p className="mt-2 text-lg font-semibold">Thailand • 6 Days</p>
        <p className="text-xs text-muted-foreground">
          Bangkok → Ayutthaya → Phuket → Phi Phi
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Wallet className="size-3.5" aria-hidden="true" />
          Estimated vs. Target Budget
        </div>
        <p className="mt-2 text-lg font-semibold">
          {formatINR(BUDGET_SPENT)}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            spent / {formatINR(BUDGET_TARGET)} budget
          </span>
        </p>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Budget used"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {pct}% of budget • {formatINR(BUDGET_TARGET - BUDGET_SPENT)} buffer left
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          Activity Breakdown
        </div>
        <p className="mt-2 text-lg font-semibold">18 Places</p>
        <p className="text-xs text-muted-foreground">
          6 Food Stops • 3 Transit Days
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Day tabs                                                            */
/* ------------------------------------------------------------------ */

function DayTabs({
  activeDay,
  setActiveDay,
}: {
  activeDay: number
  setActiveDay: (i: number) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip days"
      className="flex gap-1.5 overflow-x-auto pb-1"
    >
      {DAYS.map((day, i) => (
        <button
          key={day.title}
          role="tab"
          aria-selected={i === activeDay}
          type="button"
          onClick={() => setActiveDay(i)}
          className={`shrink-0 rounded-lg px-3.5 py-2 text-left transition-colors ${
            i === activeDay
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border border-border bg-card text-secondary-foreground hover:bg-secondary'
          }`}
        >
          <span className="block text-xs font-semibold">Day {i + 1}</span>
          <span
            className={`hidden text-[11px] leading-tight lg:block ${
              i === activeDay
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            }`}
          >
            {day.title}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Activity card                                                       */
/* ------------------------------------------------------------------ */

function ActivityCard({
  activity,
  time,
  swapping,
  onSwap,
}: {
  activity: Activity
  time: string
  swapping: boolean
  onSwap: () => void
}) {
  return (
    <div
      className={`group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md ${
        swapping ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {time}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
          <BadgeIndianRupee className="size-3" aria-hidden="true" />
          {formatINR(activity.cost)} / person
        </span>
      </div>
      <h4 className="mt-2.5 text-sm font-semibold">{activity.title}</h4>
      <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
        {activity.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3 text-primary" aria-hidden="true" />
          {activity.location}
        </span>
        {activity.travel && (
          <span className="inline-flex items-center gap-1">
            {'\u23F1\uFE0F'} {activity.travel}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onSwap}
        className="absolute right-3 top-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-secondary-foreground opacity-0 shadow-sm transition-all hover:border-primary/40 hover:text-primary focus-visible:opacity-100 group-hover:opacity-100 print:hidden"
        aria-label={`Swap ${activity.title} for an alternative`}
      >
        <RefreshCw
          className={`size-3 ${swapping ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        {'\u{1F504}'} Swap Activity
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Budget sidebar                                                      */
/* ------------------------------------------------------------------ */

function BudgetSidebar({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (v: boolean) => void
}) {
  return (
    <aside
      className={`shrink-0 transition-all duration-300 lg:sticky lg:top-20 lg:self-start ${
        open ? 'w-full lg:w-72' : 'w-full lg:w-12'
      }`}
    >
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold"
          aria-expanded={open}
        >
          {open ? (
            <>
              <span className="inline-flex items-center gap-2">
                <Wallet className="size-4 text-primary" aria-hidden="true" />
                Budget Breakdown
              </span>
              <PanelRightClose
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </>
          ) : (
            <PanelRightOpen
              className="mx-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          {!open && <span className="sr-only">Open budget breakdown</span>}
        </button>
        {open && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <ul className="space-y-3">
              {BUDGET_BREAKDOWN.map(({ label, amount, icon: Icon }) => {
                const pct = Math.round((amount / BUDGET_SPENT) * 100)
                return (
                  <li key={label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {label}
                      </span>
                      <span className="font-mono font-medium">
                        ~ {formatINR(amount)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="font-medium text-secondary-foreground">
                Total estimated
              </span>
              <span className="font-mono font-semibold">
                {formatINR(BUDGET_SPENT)}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {formatINR(BUDGET_TARGET - BUDGET_SPENT)} under your{' '}
              {formatINR(BUDGET_TARGET)} target — nice buffer for street-food
              impulse buys.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Workspace (Step 2)                                                  */
/* ------------------------------------------------------------------ */

function Workspace({
  selections,
  onSwap,
  swappingSlot,
}: {
  selections: Record<string, number>
  onSwap: (slotId: string, optionCount: number) => void
  swappingSlot: string | null
}) {
  const [activeDay, setActiveDay] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const day = DAYS[activeDay]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-6">
      <StatsBar />
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DayTabs activeDay={activeDay} setActiveDay={setActiveDay} />
          <div className="mt-5">
            <h3 className="text-lg font-semibold">
              Day {activeDay + 1}: {day.title}
            </h3>
            <p className="text-sm text-muted-foreground">{day.subtitle}</p>
          </div>

          {/* Timeline */}
          <div className="relative mt-6 space-y-8 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border md:before:left-[19px]">
            {day.slots.map((s) => {
              const idx = (selections[s.id] ?? 0) % s.options.length
              const activity = s.options[idx]
              return (
                <div key={s.id} className="relative flex gap-4 md:gap-5">
                  <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-base shadow-sm md:size-10">
                    <span aria-hidden="true">{s.emoji}</span>
                    <span className="sr-only">{s.label}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                      <h4 className="text-sm font-semibold">
                        {s.emoji} {s.label}
                      </h4>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {s.time}
                      </span>
                    </div>
                    <ActivityCard
                      activity={activity}
                      time={s.time.split(' - ')[0]}
                      swapping={swappingSlot === s.id}
                      onSwap={() => onSwap(s.id, s.options.length)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <BudgetSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Stage = 'hero' | 'loading' | 'workspace'

export default function Page() {
  const [stage, setStage] = useState<Stage>('workspace')
  const [input, setInput] = useState(
    '6 days in Thailand, 50,500 INR budget, focus on Thai night life & street food, Beach, moderate pace',
  )
  const [loadingStep, setLoadingStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, number>>({})
  const [swappingSlot, setSwappingSlot] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  const handleGenerate = useCallback(() => {
    setStage('loading')
    setLoadingStep(0)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = LOADING_STEPS.map((_, i) =>
      setTimeout(() => {
        if (i === LOADING_STEPS.length - 1) {
          setLoadingStep(LOADING_STEPS.length)
          timersRef.current.push(
            setTimeout(() => setStage('workspace'), 450),
          )
        } else {
          setLoadingStep(i + 1)
        }
      }, (i + 1) * 700),
    )
  }, [])

  const handleNewTrip = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    setSelections({})
    setInput('')
    setStage('hero')
  }, [])

  const handleSwap = useCallback((slotId: string, optionCount: number) => {
    setSwappingSlot(slotId)
    setTimeout(() => {
      setSelections((prev) => ({
        ...prev,
        [slotId]: ((prev[slotId] ?? 0) + 1) % optionCount,
      }))
      setSwappingSlot(null)
    }, 300)
  }, [])

  const markdown = useMemo(() => {
    const lines: string[] = [
      '# Thailand • 6 Days — Travel Lab Itinerary',
      '',
      `**Budget:** ${formatINR(BUDGET_SPENT)} estimated / ${formatINR(BUDGET_TARGET)} target`,
      '',
    ]
    DAYS.forEach((day, i) => {
      lines.push(`## Day ${i + 1}: ${day.title}`, '')
      day.slots.forEach((s) => {
        const a = s.options[(selections[s.id] ?? 0) % s.options.length]
        lines.push(
          `### ${s.label} (${s.time})`,
          `- **${a.title}** — ${a.description}`,
          `  - Location: ${a.location}`,
          `  - Cost: ${formatINR(a.cost)} / person`,
          ...(a.travel ? [`  - Travel: ${a.travel}`] : []),
          '',
        )
      })
    })
    lines.push('## Budget Breakdown', '')
    BUDGET_BREAKDOWN.forEach((b) =>
      lines.push(`- ${b.label}: ~ ${formatINR(b.amount)}`),
    )
    lines.push('', `**Total:** ${formatINR(BUDGET_SPENT)}`)
    return lines.join('\n')
  }, [selections])

  const handleCopyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.log('[v0] Clipboard write failed')
    }
  }, [markdown])

  const handleExportPDF = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        onNewTrip={handleNewTrip}
        onCopyMarkdown={handleCopyMarkdown}
        onExportPDF={handleExportPDF}
        copied={copied}
        hasItinerary={stage === 'workspace'}
      />
      <main className="flex-1">
        {stage === 'hero' && (
          <Hero input={input} setInput={setInput} onGenerate={handleGenerate} />
        )}
        {stage === 'loading' && <AILoading step={loadingStep} />}
        {stage === 'workspace' && (
          <Workspace
            selections={selections}
            onSwap={handleSwap}
            swappingSlot={swappingSlot}
          />
        )}
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground print:hidden">
        Travel Lab — mock itinerary for demo purposes. All prices in INR.
      </footer>
    </div>
  )
}
