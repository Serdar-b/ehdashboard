import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"
import type { BehaviorAdaptation, Patient } from "@/lib/clinic-data"

const fallbackAdaptation: BehaviorAdaptation = {
  active: false,
  missedDays: 0,
  trigger: "No deviation detected",
  originalAction: "Current patient plan",
  adaptedAction: "Keep current threshold",
  threshold: "Adaptation idle",
  reason:
    "The patient has sufficient continuity to maintain the plan at its current level.",
  coachAction: "Continue monitoring the signal.",
}

export function BehaviorAdaptation({ patient }: { patient: Patient }) {
  const adaptation = patient.behaviorAdaptation ?? fallbackAdaptation
  const active = adaptation.active

  return (
    <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className={
              active
                ? "flex size-10 items-center justify-center rounded-full bg-[#FFF0C7] text-[#B86D00]"
                : "flex size-10 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]"
            }
          >
            {active ? (
              <RotateCcw className="size-4.5" />
            ) : (
              <CheckCircle2 className="size-4.5" />
            )}
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold text-foreground">
              Plan Adaptation
            </h2>
            <p className="text-xs text-muted-foreground">
              Continuity over perfection
            </p>
          </div>
        </div>

        <span
          className={
            active
              ? "rounded-full border border-[#F7D982] bg-[#FFF0C7] px-2.5 py-1 text-[11px] font-semibold text-[#9A4B22]"
              : "rounded-full border border-[#BCE9E2] bg-[#F0FAF8] px-2.5 py-1 text-[11px] font-semibold text-[#078C7A]"
          }
        >
          {active ? "Active" : "Idle"}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#817771]">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
              Trigger
            </p>
            <p className="mt-1 text-sm font-semibold text-[#27221F]">
              {adaptation.trigger}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#817771]">
              {adaptation.missedDays > 0
                ? `${adaptation.missedDays} missed days in a row`
                : "No consecutive missed days"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="rounded-xl bg-[#F8F0EB] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
            Original Action
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[#27221F]">
            {adaptation.originalAction}
          </p>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#27221F] text-white">
            <ArrowRight className="size-4" />
          </div>
        </div>

        <div className="rounded-xl bg-[#F0FAF8] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#078C7A]">
            Adapted Threshold
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-[#27221F]">
            {adaptation.adaptedAction}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#BCE9E2] bg-[#F0FAF8] p-4">
        <div className="mb-2 flex items-center gap-2">
          <BrainCircuit className="size-4 text-[#078C7A]" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#078C7A]">
            {adaptation.threshold}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-[#3C6761]">
          {adaptation.reason}
        </p>
      </div>

      <div className="mt-auto pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
          Next Coach Action
        </p>
        <p className="mt-1 text-sm font-semibold text-[#27221F]">
          {adaptation.coachAction}
        </p>
      </div>
    </section>
  )
}
