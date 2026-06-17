"use client"

import { useState } from "react"
import { ChevronDown, Activity } from "lucide-react"

export function Topbar() {
  const [open, setOpen] = useState(false)

  const today = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-5 bg-[#F7F7F8]/95 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4.5" />
        </div>
        <span className="text-sm font-semibold">Executive Health</span>
      </div>

      <div className="hidden min-w-[150px] lg:block">
        <h1 className="text-[28px] font-bold tracking-tight text-[#27221F]">
          Protocol to Adherence
        </h1>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#078C7A]">
          Riskkontroll för patientgapet
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-2xl px-1.5 py-1.5 text-sm transition-colors hover:bg-white"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-[#27221F] text-xs font-semibold text-white shadow-sm">
              EW
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-[#27221F]">
                Dr. Elin Wahl
              </span>
              <span className="block text-[11px] text-[#817771]">
                {today}
              </span>
            </span>
            <ChevronDown className="size-4 text-[#817771]" />
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
                className="absolute right-0 top-14 z-20 w-52 overflow-hidden rounded-xl border border-[#EEE9E4] bg-white p-1.5 shadow-lg"
              >
                {["Min profil", "Notisinställningar", "Teamöversikt", "Logga ut"].map(
                  (item) => (
                    <button
                      key={item}
                      role="menuitem"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#27221F] transition-colors hover:bg-[#F7F7F8]"
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
