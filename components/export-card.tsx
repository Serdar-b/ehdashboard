"use client"

import { useState } from "react"
import { Check, Copy, FileText } from "lucide-react"
import { exportSections } from "@/lib/clinic-data"

export function ExportCard() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = exportSections
      .map((s) => `${s.label.toUpperCase()}\n${s.body}`)
      .join("\n\n")
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <FileText className="size-4" />
        </div>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold text-foreground">
            Export till journalsystem
          </h2>
          <p className="text-xs text-muted-foreground">
            Strukturerad sammanfattning redo att klistras in
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
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
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {copied ? (
          <>
            <Check className="size-4 text-teal" />
            Kopierad
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Kopiera strukturerad sammanfattning
          </>
        )}
      </button>
    </section>
  )
}
