import { Brain, ShieldCheck } from "lucide-react"
import type { Patient } from "@/lib/clinic-data"

function createSummary(patient: Patient) {
  return `${patient.name} has a ${patient.adherence}% continuity index over the past 7 days. Current clinical signal is ${patient.signal.toLowerCase()}. Main pattern: ${patient.missedHighValue.toLowerCase()}. Behavioral friction: ${patient.friction.toLowerCase()} Recommended action: ${patient.aiRecommendation}`
}

function createTags(patient: Patient) {
  return [patient.signal, patient.program, patient.missedActions[0]?.split(" (")[0]].filter(Boolean)
}

export function AiSummary({ patient }: { patient: Patient }) {
  const summary = createSummary(patient)
  const tags = createTags(patient)

  return (
    <section className="flex h-full flex-col rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
            <Brain className="size-4.5" />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold text-foreground">
              AI Summary
            </h2>
            <p className="text-xs text-muted-foreground">
              {patient.name} · filtered from patient's daily data
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-[#BCE9E2] bg-[#F0FAF8] px-2.5 py-1 text-[11px] font-medium text-[#078C7A]">
          <ShieldCheck className="size-3" />
          Reviewed by clinician
        </span>
      </div>

      <p className="mt-5 text-lg font-medium leading-relaxed tracking-tight text-[#27221F] text-pretty">
        {summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[#FBFAF8] px-2.5 py-1 text-[11px] font-medium text-[#817771]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto border-t border-[#EEE9E4] pt-5">
        <div className="flex-1 rounded-xl bg-[#F0FAF8] px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Next Clinical Action
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.suggestedAction}
          </p>
        </div>
      </div>
    </section>
  )
}
