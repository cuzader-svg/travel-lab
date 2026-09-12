'use client'

import { useEffect, useRef } from 'react'
import type { DayPlan as DayPlanType, Activity } from '@/types/itinerary'

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const DAY_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#ec4899', // pink
]

function getDayColor(dayIndex: number) {
  return DAY_COLORS[dayIndex % DAY_COLORS.length]
}

function createPinSvg(color: string, opacity = 1) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 8.25 12 24 12 24S24 20.25 24 12C24 5.373 18.627 0 12 0z"
      fill="${color}" fill-opacity="${opacity}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" fill-opacity="${opacity}"/>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/* ------------------------------------------------------------------ */
/* Leaflet CDN loader                                                   */
/* ------------------------------------------------------------------ */

let leafletLoaded = false
let leafletLoading: Promise<any> | null = null

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('SSR')
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletLoading) return leafletLoading

  leafletLoading = new Promise((resolve, reject) => {
    // Inject CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
    // Inject JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.crossOrigin = ''
    script.onload = () => { leafletLoaded = true; resolve((window as any).L) }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return leafletLoading
}

/* ------------------------------------------------------------------ */
/* Props                                                                */
/* ------------------------------------------------------------------ */

interface ItineraryMapProps {
  days: DayPlanType[]
  activeDay: number
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function ItineraryMap({ days, activeDay }: ItineraryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  const hasCoords = days.some((d) =>
    d.activities.some((a: Activity) => a.latitude != null && a.longitude != null),
  )

  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return

    loadLeaflet().then((L) => {
      if (!mapContainerRef.current) return

      // Init map once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
          scrollWheelZoom: false,
          zoomControl: true,
        }).setView([20, 0], 3)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)
      }

      const map = mapInstanceRef.current

      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const activeDayBounds: [number, number][] = []
      const SLOT_EMOJI: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' }

      days.forEach((day, dayIndex) => {
        const isActive = dayIndex === activeDay
        const color = getDayColor(dayIndex)
        const opacity = isActive ? 1 : 0.35

        const icon = L.icon({
          iconUrl: createPinSvg(color, opacity),
          iconSize: [24, 36],
          iconAnchor: [12, 36],
          popupAnchor: [0, -36],
        })

        day.activities.forEach((activity: Activity) => {
          if (activity.latitude == null || activity.longitude == null) return

          const latlng: [number, number] = [activity.latitude, activity.longitude]

          const marker = L.marker(latlng, { icon })
            .addTo(map)
            .bindPopup(
              `<div style="font-size:12px;min-width:160px">
                <div style="font-weight:600;margin-bottom:4px">${SLOT_EMOJI[activity.timeSlot] ?? '📍'} ${activity.title}</div>
                <div style="color:#6b7280;margin-bottom:2px">${activity.location}</div>
                <div style="color:#6b7280">Day ${day.day} · ${activity.category}</div>
              </div>`,
              { maxWidth: 220 },
            )

          markersRef.current.push(marker)
          if (isActive) activeDayBounds.push(latlng)
        })
      })

      // Auto-fit to active day
      if (activeDayBounds.length > 0) {
        if (activeDayBounds.length === 1) {
          map.setView(activeDayBounds[0], 14)
        } else {
          map.fitBounds(L.latLngBounds(activeDayBounds), { padding: [40, 40] })
        }
      }
    }).catch(() => { /* CDN failed, silently ignore */ })
  }, [days, activeDay, hasCoords])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (!hasCoords) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-secondary/50 px-6 py-8 text-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            🗺 Map not available for this trip
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This trip was generated before map support was added. Generate a new trip to see the interactive map.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
      {/* Day legend */}
      <div className="flex flex-wrap gap-2 border-b border-border bg-card px-4 py-2">
        {days.map((day, i) => (
          <span key={day.day} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: getDayColor(i), opacity: i === activeDay ? 1 : 0.4 }}
            />
            <span className={i === activeDay ? 'font-semibold' : 'text-muted-foreground'}>
              Day {day.day}
            </span>
          </span>
        ))}
      </div>
      {/* Map container — Leaflet mounts here */}
      <div
        ref={mapContainerRef}
        style={{ height: 360, width: '100%' }}
        className="bg-secondary"
      />
    </div>
  )
}
