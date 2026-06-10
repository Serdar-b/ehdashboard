"use client"

import { useState } from "react"
import { Search, ChevronDown, Activity } from "lucide-react"

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
          Översikt
        </h1>
      </div>

      <div className="relative hidden flex-1 md:block md:max-w-[340px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#635C57]" />
        <input
          type="search"
          placeholder="Sök patient eller signal..."
          className="h-11 w-full rounded-xl border border-[#EEE9E4] bg-white pl-11 pr-4 text-sm text-[#27221F] outline-none shadow-[0_10px_28px_rgba(59,42,32,0.04)] placeholder:text-[#A59D97] focus-visible:border-[#078C7A] focus-visible:ring-4 focus-visible:ring-[#078C7A]/10"
          aria-label="Sök"
        />
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
