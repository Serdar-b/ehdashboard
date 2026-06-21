"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"
import type { GeneratedAction, GeneratedPlan, Patient } from "@/lib/clinic-data"
import { createSendConfirmation } from "@/lib/ai-demo"
import { generateCarePlanWithAi } from "@/lib/supabase/ai"
import { saveGeneratedPlan } from "@/lib/supabase/protocol"
import { cn } from "@/lib/utils"

const example =
  "Patienten ska promenera zon 2 fem gånger i veckan, ta omega-3 dagligen med mat och logga blodtryck tre morgnar per vecka."

const priorityStyle: Record<GeneratedAction["priority"], string> = {
  Hög: "bg-coral-muted text-coral",
  Medel: "bg-amber-muted text-amber-foreground",
  Låg: "bg-secondary text-secondary-foreground",
}

const emptyAction: GeneratedAction = {
  title: "",
  cadence: "",
  priority: "Medel",
  category: "check-in",
  estimatedMinutes: undefined,
  clinicalWeight: undefined,
  patientReason: "",
  verificationMethod: "",
}

const categoryOptions: Array<{
  value: NonNullable<GeneratedAction["category"]>
  label: string
}> = [
  { value: "movement", label: "Rörelse" },
  { value: "nutrition", label: "Kost" },
  { value: "medication", label: "Läkemedel" },
  { value: "measurement", label: "Mätning" },
  { value: "check-in", label: "Avstämning" },
]

type PlanComposerProps = {
  patient: Patient
  onPlanSent: (actions: GeneratedAction[]) => void
}

export function PlanComposer({ patient, onPlanSent }: PlanComposerProps) {
  const [note, setNote] = useState(example)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const [actions, setActions] = useState<GeneratedAction[]>([])
  const [planDetails, setPlanDetails] = useState<Omit<GeneratedPlan, "actions"> | null>(null)

  const hasInvalidActions =
    actions.length === 0 ||
    actions.some((action) => !action.title.trim() || !action.cadence.trim())
  const hasInvalidPlan =
    !planDetails ||
    !planDetails.title.trim() ||
    !planDetails.goal.trim() ||
    !planDetails.riskArea.trim() ||
    planDetails.durationWeeks < 1

  function updatePlanDetails(patch: Partial<Omit<GeneratedPlan, "actions">>) {
    setPlanDetails((current) => current ? { ...current, ...patch } : current)
    setSent(false)
    setConfirmation("")
    setError("")
  }

  function updateAction(index: number, patch: Partial<GeneratedAction>) {
    setActions((current) =>
      current.map((action, actionIndex) =>
        actionIndex === index ? { ...action, ...patch } : action,
      ),
    )
    setSent(false)
    setConfirmation("")
    setError("")
  }

  function removeAction(index: number) {
    setActions((current) => current.filter((_, actionIndex) => actionIndex !== index))
    setSent(false)
    setConfirmation("")
    setError("")
  }

  function addAction() {
    setActions((current) => [...current, { ...emptyAction }])
    setSent(false)
    setConfirmation("")
    setError("")
  }

  async function handleGenerate() {
    setLoading(true)
    setGenerated(false)
    setSent(false)
    setError("")
    setConfirmation("")

    try {
      const plan = await generateCarePlanWithAi({ note, patient })
      const { actions: generatedActions, ...details } = plan
      setPlanDetails(details)
      setActions(generatedActions)
      setLoading(false)
      setGenerated(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Kunde inte generera mikrohandlingar med AI-funktionen."
      setError(message)
      setLoading(false)
    }
  }

  async function handleSend() {
    if (hasInvalidPlan || hasInvalidActions || !planDetails) {
      setError("Planen måste ha titel, mål, riskområde, längd och kompletta åtgärder före utskick.")
      return
    }

    setSending(true)
    setError("")

    try {
      await saveGeneratedPlan({
        patient,
        note,
        plan: { ...planDetails, actions },
      })
      onPlanSent(actions)
      setConfirmation(createSendConfirmation(patient, actions))
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Okänt Supabase-fel."
      setError(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
          <Sparkles className="size-4" />
        </div>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold text-foreground">
            Läkarens AI-input
          </h2>
          <p className="text-xs text-muted-foreground">
            Journalanteckningen omvandlas till strukturerade dagliga mikrohandlingar
          </p>
        </div>
      </div>

      <div
        className={`mb-4 rounded-xl px-3 py-2 text-xs font-medium ${
          patient.id === "oscar-nilsson"
            ? "border border-[#BCE9E2] bg-[#F0FAF8] text-[#078C7A]"
            : "border border-[#F7D982] bg-[#FFF0C7] text-[#9A4B22]"
        }`}
      >
        {patient.id === "oscar-nilsson"
          ? "Ansluten live-demo: Oscar Nilssons mobilapp"
          : "Den anslutna live-demoappen är kopplad till Oscar Nilsson. Välj Oscar för att visa flödet i mobilen."}
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
        {loading ? "Genererar..." : "Generera mikrohandlingar"}
      </button>

      {error && !generated ? (
        <p className="mt-3 rounded-xl bg-coral-muted px-3 py-2 text-xs font-medium leading-relaxed text-coral">
          {error}
        </p>
      ) : null}

      {generated ? (
      <div className="mt-4 space-y-2 transition-opacity">
        {planDetails ? (
          <div className="rounded-xl border border-[#BCE9E2] bg-[#F0FAF8] p-4">
            <div className="mb-3">
              <p className="text-xs font-semibold text-[#078C7A]">12-veckorsplan</p>
              <p className="mt-0.5 text-[11px] text-[#3C6761]">
                AI-förslag – läkaren har full kontroll över planens innehåll.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-[#3C6761] sm:col-span-2">
                Plantitel
                <input
                  value={planDetails.title}
                  onChange={(event) => updatePlanDetails({ title: event.target.value })}
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-lg border border-[#BCE9E2] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-medium text-[#3C6761] sm:col-span-2">
                Mål
                <textarea
                  value={planDetails.goal}
                  onChange={(event) => updatePlanDetails({ goal: event.target.value })}
                  disabled={sent || sending}
                  rows={2}
                  className="mt-1.5 w-full resize-y rounded-lg border border-[#BCE9E2] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-medium text-[#3C6761]">
                Riskområde
                <input
                  value={planDetails.riskArea}
                  onChange={(event) => updatePlanDetails({ riskArea: event.target.value })}
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-lg border border-[#BCE9E2] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-medium text-[#3C6761]">
                Längd (veckor)
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={planDetails.durationWeeks}
                  onChange={(event) =>
                    updatePlanDetails({ durationWeeks: Number(event.target.value) })
                  }
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-lg border border-[#BCE9E2] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-medium text-[#3C6761] sm:col-span-2">
                Sammanfattning till patienten
                <textarea
                  value={planDetails.summary}
                  onChange={(event) => updatePlanDetails({ summary: event.target.value })}
                  disabled={sent || sending}
                  rows={2}
                  className="mt-1.5 w-full resize-y rounded-lg border border-[#BCE9E2] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              AI-utkast – granska och redigera före utskick
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Alla fält nedan sparas som den plan patientappen tar emot.
            </p>
          </div>
          <button
            type="button"
            onClick={addAction}
            disabled={sent || sending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#D8D1CB] bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-[#FBFAF8] disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            Lägg till
          </button>
        </div>
        {actions.map((action, i) => {
          return (
            <div
              key={i}
              className="rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#078C7A]">
                  Mikrohandling {i + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  disabled={sent || sending}
                  aria-label={`Ta bort mikrohandling ${i + 1}`}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-coral-muted hover:text-coral disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                  Titel
                  <input
                    value={action.title}
                    onChange={(event) => updateAction(i, { title: event.target.value })}
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  Frekvens / tidpunkt
                  <input
                    value={action.cadence}
                    onChange={(event) => updateAction(i, { cadence: event.target.value })}
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  Prioritet
                  <select
                    value={action.priority}
                    onChange={(event) =>
                      updateAction(i, {
                        priority: event.target.value as GeneratedAction["priority"],
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  >
                    {Object.keys(priorityStyle).map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  Kategori
                  <select
                    value={action.category ?? "check-in"}
                    onChange={(event) =>
                      updateAction(i, {
                        category: event.target.value as GeneratedAction["category"],
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  Uppskattad tid (minuter)
                  <input
                    type="number"
                    min={0}
                    value={action.estimatedMinutes ?? ""}
                    onChange={(event) =>
                      updateAction(i, {
                        estimatedMinutes: event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground">
                  Klinisk vikt
                  <input
                    type="number"
                    min={0}
                    value={action.clinicalWeight ?? ""}
                    onChange={(event) =>
                      updateAction(i, {
                        clinicalWeight: event.target.value === ""
                          ? undefined
                          : Number(event.target.value),
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                  Förklaring till patienten
                  <textarea
                    value={action.patientReason ?? ""}
                    onChange={(event) => updateAction(i, { patientReason: event.target.value })}
                    disabled={sent || sending}
                    rows={2}
                    className="mt-1.5 w-full resize-y rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
                  Hur åtgärden verifieras
                  <input
                    value={action.verificationMethod ?? ""}
                    onChange={(event) =>
                      updateAction(i, { verificationMethod: event.target.value })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-[#078C7A] focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
              </div>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
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
              {error ? (
                <p className="mt-2 text-xs font-medium leading-relaxed text-coral">
                  {error}
                </p>
              ) : null}
            </div>
            <button
              onClick={handleSend}
              disabled={sent || sending || hasInvalidActions || hasInvalidPlan}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#078C7A] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:bg-[#DDF4F1] disabled:text-[#078C7A]"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : sent ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {sending ? "Skickar..." : sent ? "Skickad" : "Skicka till patientapp"}
            </button>
          </div>
        ) : null}
      </div>
      ) : null}
    </section>
  )
}
