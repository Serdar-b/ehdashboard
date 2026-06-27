"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"
import type { GeneratedAction, GeneratedPlan, Patient } from "@/lib/clinic-data"
import { createSendConfirmation, generateDemoCarePlan } from "@/lib/ai-demo"
import { generateCarePlanWithAi } from "@/lib/supabase/ai"
import { saveGeneratedPlan } from "@/lib/supabase/protocol"
import { cn } from "@/lib/utils"

const example =
  "The patient should do zone 2 walks five times a week, take omega-3 daily with food, and log blood pressure three mornings per week."

const priorityStyle: Record<GeneratedAction["priority"], string> = {
  High: "bg-coral-muted text-coral",
  Medium: "bg-amber-muted text-amber-foreground",
  Low: "bg-secondary text-secondary-foreground",
}

const emptyAction: GeneratedAction = {
  title: "",
  cadence: "",
  priority: "Medium",
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
  { value: "movement", label: "Movement" },
  { value: "nutrition", label: "Nutrition" },
  { value: "medication", label: "Medication" },
  { value: "measurement", label: "Measurement" },
  { value: "check-in", label: "Check-in" },
]

type PlanComposerProps = {
  patient: Patient
  onPlanSent: (actions: GeneratedAction[]) => void
}

export function PlanComposer({ patient, onPlanSent }: PlanComposerProps) {
  const [note, setNote] = useState(example)
  const [loading, setLoading] = useState(false)
  const [editingPlan, setEditingPlan] = useState(false)
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null)
  const [generated, setGenerated] = useState(false)
  const [generatedWithAi, setGeneratedWithAi] = useState(false)
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
    setEditingActionIndex(actions.length)
    setEditingPlan(false)
    setActions((current) => [...current, { ...emptyAction }])
    setSent(false)
    setConfirmation("")
    setError("")
  }

  async function handleGenerate() {
    setLoading(true)
    setGenerated(false)
    setGeneratedWithAi(false)
    setSent(false)
    setEditingPlan(false)
    setEditingActionIndex(null)
    setError("")
    setConfirmation("")

    try {
      let plan: GeneratedPlan
      let usedAi = false

      try {
        plan = await generateCarePlanWithAi({ note, patient })
        usedAi = true
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 900))
        plan = generateDemoCarePlan(note, patient)
      }

      const { actions: generatedActions, ...details } = plan
      setPlanDetails(details)
      setActions(generatedActions)
      setGeneratedWithAi(usedAi)
      setLoading(false)
      setGenerated(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not generate micro-actions with the AI function."
      setError(message)
      setLoading(false)
    }
  }

  async function handleSend() {
    if (hasInvalidPlan || hasInvalidActions || !planDetails) {
      setError("The plan must have a title, goal, risk area, duration, and complete actions before sending.")
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
      const message = err instanceof Error ? err.message : "Unknown Supabase error."
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
            Doctor's AI Input
          </h2>
          <p className="text-md text-muted-foreground">
            Clinical notes are transformed into structured daily micro-actions
          </p>
        </div>
      </div>


      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] p-4 text-sm leading-relaxed text-[#27221F] outline-none placeholder:text-[#A59D97] focus-visible:border-[#078C7A] focus-visible:ring-4 focus-visible:ring-[#078C7A]/10"
        placeholder="Type or paste a clinical note..."
        aria-label="Clinical note"
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
        {loading ? "Generating..." : "Generate micro-actions"}
      </button>

      {error && !generated ? (
        <p className="mt-3 rounded-xl bg-coral-muted px-3 py-2 text-xs font-medium leading-relaxed text-coral">
          {error}
        </p>
      ) : null}

      {generated ? (
      <div className="mt-4 space-y-3 transition-opacity">
        <div
          className={cn(
            "flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between",
            editingPlan
              ? "border-[#E7E2DE] bg-white"
              : "border-[#BCE9E2] bg-[#F0FAF8]",
          )}
        >
          <div>
            {generatedWithAi ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#078C7A]">
                AI Suggestion
              </p>
            ) : null}
            <h3
              className={cn(
                "text-lg font-bold text-[#27221F]",
                generatedWithAi && "mt-1",
              )}
            >
              {planDetails?.title ?? `${patient.name}'s daily plan`}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPlan((current) => !current)
              setEditingActionIndex(null)
            }}
            disabled={sent || sending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#BCE9E2] bg-white px-4 py-2.5 text-sm font-semibold text-[#078C7A] transition-colors hover:bg-[#F7F7F8] disabled:opacity-50"
          >
            <Pencil className="size-4" />
            {editingPlan ? "Close plan info" : "Edit plan info"}
          </button>
        </div>

        {editingPlan && planDetails ? (
          <div className="rounded-2xl border border-[#E7E2DE] bg-white p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#27221F]">Plan Information</p>
                <p className="mt-1 text-xs text-[#817771]">
                  Basic details shown alongside the patient's plan.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-[#635C57]">
                {planDetails.durationWeeks} weeks
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                Plan Title
                <input
                  value={planDetails.title}
                  onChange={(event) => updatePlanDetails({ title: event.target.value })}
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                Goal
                <textarea
                  value={planDetails.goal}
                  onChange={(event) => updatePlanDetails({ goal: event.target.value })}
                  disabled={sent || sending}
                  rows={2}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-semibold text-[#635C57]">
                Risk Area
                <input
                  value={planDetails.riskArea}
                  onChange={(event) => updatePlanDetails({ riskArea: event.target.value })}
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-semibold text-[#635C57]">
                Duration (weeks)
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={planDetails.durationWeeks}
                  onChange={(event) =>
                    updatePlanDetails({ durationWeeks: Number(event.target.value) })
                  }
                  disabled={sent || sending}
                  className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
              <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                Patient Summary
                <textarea
                  value={planDetails.summary}
                  onChange={(event) => updatePlanDetails({ summary: event.target.value })}
                  disabled={sent || sending}
                  rows={2}
                  className="mt-1.5 w-full resize-y rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                />
              </label>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-bold text-[#27221F]">
              Micro-actions
            </p>

          </div>
          <button
            type="button"
            onClick={addAction}
            disabled={sent || sending}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#D8D1CB] bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-[#FBFAF8] disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            Add action
          </button>
        </div>
        {actions.map((action, i) => {
          if (editingActionIndex !== i) {
            return (
              <div
                key={`${action.title}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-[#E7E2DE] bg-white px-4 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#DDF4F1] text-sm font-bold text-[#078C7A]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-5 text-[#27221F]">
                    {action.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#817771]">
                    <span>{action.cadence}</span>
                    <span aria-hidden>·</span>
                    <span>{action.priority} priority</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingActionIndex(i)
                    setEditingPlan(false)
                  }}
                  disabled={sent || sending}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#E7E2DE] bg-[#FBFAF8] px-3 py-2 text-xs font-semibold text-[#635C57] hover:border-[#BCE9E2] hover:text-[#078C7A] disabled:opacity-50"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
              </div>
            )
          }

          return (
            <div
              key={i}
              className="rounded-2xl border border-[#E7E2DE] bg-white p-5 shadow-[0_10px_24px_rgba(59,42,32,0.025)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#DDF4F1] text-sm font-bold text-[#078C7A]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
                      Micro-action
                    </p>
                    <p className="truncate text-sm font-semibold text-[#27221F]">
                      {action.title || `Action ${i + 1}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingActionIndex(null)}
                    className="rounded-lg border border-[#E7E2DE] bg-[#FBFAF8] px-3 py-2 text-xs font-semibold text-[#635C57] hover:text-[#078C7A]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeAction(i)
                      setEditingActionIndex(null)
                    }}
                    disabled={sent || sending}
                    aria-label={`Remove micro-action ${i + 1}`}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-coral-muted hover:text-coral disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                  Title
                  <input
                    value={action.title}
                    onChange={(event) => updateAction(i, { title: event.target.value })}
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-semibold text-[#635C57]">
                  Frequency / timing
                  <input
                    value={action.cadence}
                    onChange={(event) => updateAction(i, { cadence: event.target.value })}
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-semibold text-[#635C57]">
                  Priority
                  <select
                    value={action.priority}
                    onChange={(event) =>
                      updateAction(i, {
                        priority: event.target.value as GeneratedAction["priority"],
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  >
                    {Object.keys(priorityStyle).map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
                <div className="border-t border-[#EEE9E4] pt-4 sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
                    More settings
                  </p>
                </div>
                <label className="text-xs font-semibold text-[#635C57]">
                  Category
                  <select
                    value={action.category ?? "check-in"}
                    onChange={(event) =>
                      updateAction(i, {
                        category: event.target.value as GeneratedAction["category"],
                      })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-[#635C57]">
                  Estimated time (minutes)
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
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-semibold text-[#635C57]">
                  Clinical weight
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
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                  Patient explanation
                  <textarea
                    value={action.patientReason ?? ""}
                    onChange={(event) => updateAction(i, { patientReason: event.target.value })}
                    disabled={sent || sending}
                    rows={2}
                    className="mt-1.5 w-full resize-y rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
                <label className="text-xs font-semibold text-[#635C57] sm:col-span-2">
                  How the action is verified
                  <input
                    value={action.verificationMethod ?? ""}
                    onChange={(event) =>
                      updateAction(i, { verificationMethod: event.target.value })
                    }
                    disabled={sent || sending}
                    className="mt-1.5 w-full rounded-xl border border-[#DED6CF] bg-[#FBFAF8] px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#078C7A] focus:bg-white focus:ring-3 focus:ring-[#078C7A]/10 disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
          )
        })}

        {generated ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#BCE9E2] bg-[#F0FAF8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#078C7A]">
                {sent ? "Plan sent to patient app" : "Plan ready to send"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#3C6761]">
                {sent
                  ? confirmation
                  : `${actions.length} actions can now be sent to ${patient.name}'s app.`}
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
              {sending ? "Sending..." : sent ? "Sent" : "Send to patient app"}
            </button>
          </div>
        ) : null}
      </div>
      ) : null}
    </section>
  )
}
