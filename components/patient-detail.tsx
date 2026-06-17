import { AlertTriangle, Brain, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react"
import type { Patient } from "@/lib/clinic-data"
import { StatusBadge } from "@/components/status-badge"
import { Sparkline } from "@/components/sparkline"

const signalAccent: Record<Patient["signal"], string> = {
  Stabil: "var(--teal)",
  Bevaka: "var(--amber)",
  Kritisk: "var(--coral)",
}

const alertTone: Record<Patient["signal"], string> = {
  Stabil: "border-teal/25 bg-teal-muted/50 text-teal",
  Bevaka: "border-amber/30 bg-amber-muted/60 text-amber-foreground",
  Kritisk: "border-coral/25 bg-coral-muted/60 text-coral",
}

const dotTone: Record<Patient["signal"], string> = {
  Stabil: "bg-teal",
  Bevaka: "bg-amber",
  Kritisk: "bg-coral",
}

export function PatientDetail({ patient }: { patient: Patient }) {
  const stroke = signalAccent[patient.signal]
  const positive = patient.signal === "Stabil"
  const trendUp = patient.weekAdherence.at(-1)! >= patient.weekAdherence.at(-2)!

  return (
    <aside className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#DDF4F1] text-sm font-semibold text-[#078C7A]">
            {patient.initials}
          </span>
          <div className="leading-tight">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {patient.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {patient.age} år · {patient.program}
            </p>
          </div>
        </div>
        <StatusBadge signal={patient.signal} />
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${alertTone[patient.signal]}`}
      >
        {positive ? (
          <ShieldCheck className="size-4 shrink-0" />
        ) : (
          <AlertTriangle className="size-4 shrink-0" />
        )}
        <p className="text-xs font-medium">{patient.missedHighValue}</p>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            7-dagars kontinuitetsindex
          </p>
          <span className="flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
            {trendUp ? (
              <TrendingUp className="size-3.5 text-teal" />
            ) : (
              <TrendingDown className="size-3.5 text-coral" />
            )}
            {patient.adherence} %
          </span>
        </div>
        <Sparkline data={patient.weekAdherence} stroke={stroke} fill={stroke} />
        <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
          {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Missade åtgärder
        </p>
        <ul className="space-y-1.5">
          {patient.missedActions.map((a) => (
            <li
              key={a}
              className="flex items-center gap-2.5 rounded-lg bg-[#FBFAF8] px-3 py-2 text-xs text-[#27221F]"
            >
              <span
                className={`size-1.5 shrink-0 rounded-full ${dotTone[patient.signal]}`}
                aria-hidden
              />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-[#FBFAF8] px-3.5 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Beteendefriktion
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">
          {"\u201C"}
          {patient.friction}
          {"\u201D"}
        </p>
      </div>

      <div className="rounded-xl border border-[#BCE9E2] bg-[#F0FAF8] p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Brain className="size-4 text-info" />
          <p className="text-xs font-semibold uppercase tracking-wide text-info">
            Klinisk rekommendation
          </p>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {patient.aiRecommendation}
        </p>
      </div>
    </aside>
  )
}
