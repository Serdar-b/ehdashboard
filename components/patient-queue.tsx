"use client"

import { ChevronRight } from "lucide-react"
import { patients, type Patient } from "@/lib/clinic-data"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

function adherenceColor(v: number) {
  if (v >= 80) return "bg-teal"
  if (v >= 55) return "bg-amber"
  return "bg-coral"
}

export function PatientQueue({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (p: Patient) => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Prioriterad patientkö
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sorterad efter klinisk signal och följsamhet
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-coral-muted px-3 py-1 text-xs font-medium text-coral">
          12 att granska
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-border bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Patient</th>
              <th className="px-4 py-2.5 font-medium">Signal</th>
              <th className="px-4 py-2.5 font-medium">Följsamhet</th>
              <th className="px-4 py-2.5 font-medium">Senaste incheckning</th>
              <th className="px-4 py-2.5 font-medium">Föreslagen åtgärd</th>
              <th className="px-5 py-2.5 font-medium text-right">
                <span className="sr-only">Granska</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const selected = p.id === selectedId
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className={cn(
                    "cursor-pointer border-b border-border transition-colors last:border-0",
                    selected
                      ? "bg-info-muted/40"
                      : "hover:bg-muted/50",
                  )}
                >
                  <td className="relative px-5 py-3.5">
                    {selected && (
                      <span
                        className="absolute inset-y-0 left-0 w-0.5 bg-info"
                        aria-hidden
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                        {p.initials}
                      </span>
                      <div className="leading-tight">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.age} år · {p.program}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge signal={p.signal} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            adherenceColor(p.adherence),
                          )}
                          style={{ width: `${p.adherence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-foreground">
                        {p.adherence} %
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {p.lastCheckIn}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">
                    {p.suggestedAction}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg p-1.5 transition-colors",
                        selected
                          ? "text-info"
                          : "text-muted-foreground",
                      )}
                      aria-hidden
                    >
                      <ChevronRight className="size-4" />
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
