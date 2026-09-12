'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { useState } from 'react'

export function UserMenu() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  if (status === 'loading') {
    return <div className="size-8 animate-pulse rounded-full bg-secondary" />
  }

  const name = session?.user?.name ?? session?.user?.email ?? 'User'
  const email = session?.user?.email ?? ''
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-10 z-50 min-w-[200px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initial}
                </div>
                <div className="min-w-0">
                  {session?.user?.name && (
                    <p className="truncate text-xs font-semibold">{session.user.name}</p>
                  )}
                  <p className="truncate text-[11px] text-muted-foreground">{email}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                signOut({ callbackUrl: '/login' })
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
