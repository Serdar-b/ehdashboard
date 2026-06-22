"use client"

import type { Patient } from "@/lib/clinic-data"
import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

function adherenceColor(v: number) {
  if (v >= 80) return "bg-teal"
  if (v >= 55) return "bg-amber"
  return "bg-coral"
}

export function PatientQueue({
  patients,
  selectedId,
  onSelect,
}: {
  patients: Patient[]
  selectedId: string
  onSelect: (p: Patient) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#27221F]">
            Riskkontroll för läkare
          </h2>
          <p className="mt-1 text-sm text-[#817771]">
            Sorterad efter klinisk signal och kontinuitetsindex
          </p>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-[28%]" />
            <col className="w-[15%]" />
            <col className="w-[16%]" />
            <col className="w-[17%]" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-y border-[#EEE9E4] bg-[#FBFAF8] text-left text-xs text-[#27221F]">
              <th className="w-10 px-3 py-3 font-semibold">
                <span className="block size-4 rounded border border-[#DED6CF]" />
              </th>
              <th className="px-3 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Signal</th>
              <th className="px-4 py-3 font-semibold">Kontinuitetsindex</th>
              <th className="px-4 py-3 font-semibold">Senaste incheckning</th>
              <th className="px-4 py-3 font-semibold">Föreslagen åtgärd</th>
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
                    "cursor-pointer border-b border-[#EEE9E4] transition-colors last:border-0",
                    selected ? "bg-[#F0FAF8]" : "hover:bg-[#FBFAF8]",
                  )}
                >
                  <td className="px-3 py-3.5">
                    <span
                      className={cn(
                        "block size-4 rounded border",
                        selected
                          ? "border-[#078C7A] bg-[#078C7A]"
                          : "border-[#DED6CF] bg-white",
                      )}
                    />
                  </td>
                  <td className="relative px-3 py-3.5">
                    {selected && (
                      <span
                        className="absolute inset-y-0 left-0 w-0.5 bg-[#078C7A]"
                        aria-hidden
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-[#DDF4F1] text-xs font-semibold text-[#078C7A]">
                        {p.initials}
                      </span>
                      <div className="leading-tight">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-[#27221F]">{p.name}</p>
                        </div>
                        <p className="truncate text-xs text-[#817771]">
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
                  <td className="px-4 py-3.5 text-[#817771]">
                    {p.lastCheckIn}
                  </td>
                  <td className="px-4 py-3.5 font-medium leading-5 text-[#27221F]">
                    {p.suggestedAction}
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
