"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Footprints,
  HeartPulse,
  Loader2,
  Pill,
  Send,
  Sparkles,
} from "lucide-react"
import type { GeneratedAction, Patient } from "@/lib/clinic-data"
import {
  createSendConfirmation,
  generatePlanFromDoctorNote,
} from "@/lib/ai-demo"
import { cn } from "@/lib/utils"

const example =
  "Patienten ska promenera zon 2 fem gånger i veckan, ta omega-3 dagligen med mat och logga blodtryck tre morgnar per vecka."

const priorityStyle: Record<GeneratedAction["priority"], string> = {
  Hög: "bg-coral-muted text-coral",
  Medel: "bg-amber-muted text-amber-foreground",
  Låg: "bg-secondary text-secondary-foreground",
}

const icons = [Pill, Footprints, HeartPulse]

type PlanComposerProps = {
  patient: Patient
  onPlanSent: (actions: GeneratedAction[]) => void
}

export function PlanComposer({ patient, onPlanSent }: PlanComposerProps) {
  const [note, setNote] = useState(example)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [sent, setSent] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [actions, setActions] = useState<GeneratedAction[]>([])

  function handleGenerate() {
    setLoading(true)
    setGenerated(false)
    setSent(false)
    setConfirmation("")

    setTimeout(() => {
      const result = generatePlanFromDoctorNote(note)
      setActions(result.actions)
      setLoading(false)
      setGenerated(true)
    }, 900)
  }

  function handleSend() {
    onPlanSent(actions)
    setConfirmation(createSendConfirmation(patient, actions))
    setSent(true)
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
        placeholder="Skriv eller klistra in läkaranteckning..."
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
        {loading ? "Genererar..." : "Generera vårdplan"}
      </button>

      <div
        className={cn(
          "mt-4 space-y-2 transition-opacity",
          generated ? "opacity-100" : "opacity-60",
        )}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Genererade strukturerade åtgärder
        </p>
        {(generated ? actions : []).map((action, i) => {
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

        {generated ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#BCE9E2] bg-[#F0FAF8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#078C7A]">
                {sent ? "Plan skickad till patientappen" : "Plan redo att skickas"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#3C6761]">
                {sent
                  ? confirmation
                  : `${actions.length} åtgärder kan nu skickas till ${patient.name}s app.`}
              </p>
            </div>
            <button
              onClick={handleSend}
              disabled={sent}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#078C7A] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:bg-[#DDF4F1] disabled:text-[#078C7A]"
            >
              {sent ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {sent ? "Skickad" : "Skicka till patientapp"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
