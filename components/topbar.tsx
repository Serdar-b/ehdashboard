"use client"

import { useState } from "react"
import { Search, ChevronDown, Calendar, Activity } from "lucide-react"

export function Topbar() {
  const [open, setOpen] = useState(false)

  const today = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4.5" />
        </div>
        <span className="text-sm font-semibold">Executive Health</span>
      </div>

      <div className="relative ml-auto hidden flex-1 md:block md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Sök patient, vårdplan eller signal…"
          className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          aria-label="Sök"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground sm:flex">
          <Calendar className="size-4" />
          <span className="capitalize">{today}</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2.5 text-sm transition-colors hover:bg-muted"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-info-muted text-xs font-semibold text-info">
              EW
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-semibold text-foreground">
                Dr. Elin Wahl
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Internmedicin
              </span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div
                role="menu"
                className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg"
              >
                {["Min profil", "Notisinställningar", "Teamöversikt", "Logga ut"].map(
                  (item) => (
                    <button
                      key={item}
                      role="menuitem"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
