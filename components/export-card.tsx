"use client"

import { useState } from "react"
import { Check, Copy, FileText } from "lucide-react"
import type { Patient } from "@/lib/clinic-data"

function createExportSections(patient: Patient) {
  return [
    {
      label: "Summary",
      body: `${patient.name}, ${patient.age} y/o. Continuity index ${patient.adherence}% (7 days). ${patient.signal} signal. Program: ${patient.program}.`,
    },
    {
      label: "Missed Actions",
      body: patient.missedActions.join(", "),
    },
    {
      label: "Suggested Clinical Action",
      body: patient.aiRecommendation,
    },
    {
      label: "Follow-up",
      body:
        patient.signal === "Critical"
          ? "New check-in within 48 hours. Escalate if continuity index remains low."
          : "New check-in in 7 days or sooner if signal deteriorates.",
    },
  ]
}

export function ExportCard({ patient }: { patient: Patient }) {
  const [copied, setCopied] = useState(false)
  const exportSections = createExportSections(patient)

  function handleCopy() {
    const text = exportSections
      .map((s) => `${s.label.toUpperCase()}\n${s.body}`)
      .join("\n\n")
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
          <FileText className="size-4" />
        </div>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold text-foreground">
            Journal Note Draft
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-[#EEE9E4] bg-[#FBFAF8] p-4 font-mono text-xs leading-relaxed">
        {exportSections.map((s) => (
          <div key={s.label} className="mb-3 last:mb-0">
            <p className="font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-0.5 text-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleCopy}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#EEE9E4] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#27221F] transition-colors hover:bg-[#FBFAF8]"
      >
        {copied ? (
          <>
            <Check className="size-4 text-teal" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copy structured summary
          </>
        )}
      </button>
    </section>
  )
}
