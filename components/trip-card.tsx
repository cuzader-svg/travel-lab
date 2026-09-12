'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function TripCard({
  id,
  destination,
  totalDays,
  currency,
  prompt,
  createdAt,
  budget,
}: {
  id: string
  destination: string
  totalDays: number
  currency: string
  prompt: string
  createdAt: Date
  budget: number
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete trip to ${destination}?`)) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/itineraries/${id}`, { method: 'DELETE' })

      if (res.ok) {
        // Reload page to show updated list
        window.location.reload()
      } else {
        const data = await res.json().catch(() => ({ error: 'Failed to delete' }))
        alert(data.error || 'Failed to delete trip')
        setIsDeleting(false)
      }
    } catch (error) {
      alert('Failed to delete trip')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <MapPin className="size-5 text-primary" aria-hidden="true" />
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-tight">
        {destination}
      </h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3" aria-hidden="true" />
          {totalDays} {totalDays === 1 ? 'day' : 'days'}
        </span>
        {budget > 0 && (
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-3" aria-hidden="true" />
            {formatMoney(budget, currency)}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {prompt}
      </p>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline underline-offset-4"
        >
          <Plus className="size-3" aria-hidden="true" />
          Plan a similar trip
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:border-destructive disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Delete trip to ${destination}`}
        >
          <Trash2 className="size-3" aria-hidden="true" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
