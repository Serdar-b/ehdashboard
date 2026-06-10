"use client"

import { useState } from "react"
import { Sparkles, Loader2, Pill, Footprints, HeartPulse } from "lucide-react"
import { generatedPlan, type GeneratedAction } from "@/lib/clinic-data"
import { cn } from "@/lib/utils"

const example =
  "Patienten ska promenera zon 2 fem gånger i veckan, ta omega-3 dagligen med mat och logga blodtryck tre morgnar per vecka."

const priorityStyle: Record<GeneratedAction["priority"], string> = {
  Hög: "bg-coral-muted text-coral",
  Medel: "bg-amber-muted text-amber-foreground",
  Låg: "bg-secondary text-secondary-foreground",
}

const icons = [Pill, Footprints, HeartPulse]

export function PlanComposer() {
  const [note, setNote] = useState(example)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  function handleGenerate() {
    setLoading(true)
    setGenerated(false)
    setTimeout(() => {
      setLoading(false)
      setGenerated(true)
    }, 900)
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
          <Sparkles className="size-4" />
        </div>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold text-foreground">
            Skapa plan från läkaranteckning
          </h2>
          <p className="text-xs text-muted-foreground">
            AI:n omvandlar fritext till strukturerade dagliga åtgärder
          </p>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] p-4 text-sm leading-relaxed text-[#27221F] outline-none placeholder:text-[#A59D97] focus-visible:border-[#078C7A] focus-visible:ring-4 focus-visible:ring-[#078C7A]/10"
        placeholder="Skriv eller klistra in läkaranteckning…"
        aria-label="Läkaranteckning"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#27221F] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {loading ? "Genererar…" : "Generera vårdplan"}
      </button>

      <div
        className={cn(
          "mt-4 space-y-2 transition-opacity",
          generated ? "opacity-100" : "opacity-100",
        )}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Genererade strukturerade åtgärder
        </p>
        {generatedPlan.map((action, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div
              key={action.title}
              className="flex items-center gap-3 rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] px-3 py-2.5"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#DDF4F1] text-[#078C7A]">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.cadence}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  priorityStyle[action.priority],
                )}
              >
                {action.priority} prioritet
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
