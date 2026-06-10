"use client"

import { useState } from "react"
import { Check, Pill, Footprints, HeartPulse } from "lucide-react"
import { mobileActions } from "@/lib/clinic-data"
import { cn } from "@/lib/utils"

const icons = [Pill, Footprints, HeartPulse]

export function MobilePreview() {
  const [done, setDone] = useState(() => mobileActions.map((a) => a.done))

  const completed = done.filter(Boolean).length
  const total = done.length
  const pct = Math.round((completed / total) * 100)

  // progress ring geometry
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-secondary/40 p-6">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Patientens vy
        </p>
        <h2 className="mt-1 text-sm font-semibold text-foreground">
          Så upplever patienten dagens plan
        </h2>
      </div>

      <div className="mx-auto mt-5 w-full max-w-[268px]">
        <div className="rounded-[2.25rem] border-[7px] border-primary bg-primary p-1.5 shadow-2xl shadow-primary/20">
          <div className="overflow-hidden rounded-[1.65rem] bg-background">
            {/* phone status bar */}
            <div className="flex items-center justify-between bg-sidebar px-5 py-2.5 text-[10px] font-medium text-sidebar-foreground/70">
              <span className="tabular-nums">09:41</span>
              <span className="h-1.5 w-16 rounded-full bg-sidebar-foreground/15" />
              <span>Idag</span>
            </div>

            {/* progress header */}
            <div className="flex items-center gap-3.5 border-b border-border px-5 py-5">
              <div className="relative size-16 shrink-0">
                <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={r}
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-foreground">
                  {pct}%
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  God morgon, Alexandra
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {completed} av {total} åtgärder klara idag
                </p>
              </div>
            </div>

            {/* action cards */}
            <div className="space-y-2 p-3.5">
              {mobileActions.map((action, i) => {
                const Icon = icons[i % icons.length]
                const isDone = done[i]
                return (
                  <button
                    key={action.title}
                    onClick={() =>
                      setDone((prev) =>
                        prev.map((v, idx) => (idx === i ? !v : v)),
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                      isDone
                        ? "border-teal/30 bg-teal-muted/50"
                        : "border-border bg-card hover:border-primary/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isDone
                          ? "bg-teal text-teal-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {isDone ? (
                        <Check className="size-4.5" />
                      ) : (
                        <Icon className="size-4.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[13px] font-medium",
                          isDone
                            ? "text-muted-foreground line-through"
                            : "text-foreground",
                        )}
                      >
                        {action.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {action.time}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isDone
                          ? "border-teal bg-teal text-teal-foreground"
                          : "border-border",
                      )}
                      aria-hidden
                    >
                      {isDone && <Check className="size-3" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-[280px] text-center text-xs leading-relaxed text-muted-foreground text-pretty">
        Varje incheckning blir en klinisk signal — du ser följsamheten utan att
        patienten behöver fylla i formulär.
      </p>
    </section>
  )
}
