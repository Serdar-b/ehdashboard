"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, ClipboardList, RefreshCw } from "lucide-react"
import { patients, type GeneratedAction } from "@/lib/clinic-data"
import type { LiveAdherence } from "@/lib/clinic-data"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCards } from "@/components/kpi-cards"
import { PatientQueue } from "@/components/patient-queue"
import { PatientDetail } from "@/components/patient-detail"
import { PlanComposer } from "@/components/plan-composer"
import { MobilePreview } from "@/components/mobile-preview"
import { AiSummary } from "@/components/ai-summary"
import { ExportCard } from "@/components/export-card"
import { applyLiveAdherence, fetchLiveAdherence } from "@/lib/supabase/adherence"

export function Dashboard() {
  const [selectedId, setSelectedId] = useState(patients[0].id)
  const [liveByPatientId, setLiveByPatientId] = useState<Record<string, LiveAdherence>>({})
  const [liveError, setLiveError] = useState("")
  const [refreshingPatientId, setRefreshingPatientId] = useState<string | null>(null)
  const [sentPlan, setSentPlan] = useState<{
    actions: GeneratedAction[]
    patientName: string
    sentAt: Date
  } | null>(null)
  const visiblePatients = useMemo(
    () => applyLiveAdherence(patients, liveByPatientId),
    [liveByPatientId],
  )
  const selected =
    visiblePatients.find((patient) => patient.id === selectedId) ?? visiblePatients[0]
  const selectedLive = liveByPatientId[selected.id]

  const refreshPatientAdherence = useCallback(async (patientId: string) => {
    setRefreshingPatientId(patientId)
    try {
      const live = await fetchLiveAdherence(patientId)
      setLiveError("")

      if (live) {
        setLiveByPatientId((current) => ({
          ...current,
          [patientId]: live,
        }))
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte hämta liveföljsamhet."
      setLiveError(message)
    } finally {
      setRefreshingPatientId((current) => (current === patientId ? null : current))
    }
  }, [])

  useEffect(() => {
    void refreshPatientAdherence(selectedId)
  }, [refreshPatientAdherence, selectedId])

  function handlePlanSent(actions: GeneratedAction[]) {
    setSentPlan({
      actions,
      patientName: selected.name,
      sentAt: new Date(),
    })
    void refreshPatientAdherence(selected.id)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-foreground">
      <div className="flex min-h-screen overflow-hidden bg-[#F7F7F8]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col bg-[#fbfcff]">
          <Topbar />

          <main className="flex-1 space-y-8 p-5 md:p-8">
            <KpiCards />

            {liveError ? (
              <div className="rounded-xl border border-[#F7D982] bg-[#FFF0C7] px-4 py-3 text-sm font-medium text-[#9A4B22]">
                Liveföljsamhet kunde inte hämtas: {liveError}
              </div>
            ) : null}

            <ActivePlanSummary
              live={selectedLive}
              onRefresh={() => refreshPatientAdherence(selected.id)}
              patientName={selected.name}
              refreshing={refreshingPatientId === selected.id}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
              <AiSummary patient={selected} />
              <MobilePreview sentPlan={sentPlan} />
            </div>

            <section className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[1.45fr_0.8fr]">
              <PatientQueue
                patients={visiblePatients}
                selectedId={selected.id}
                onSelect={(patient) => setSelectedId(patient.id)}
              />
              <div className="2xl:sticky 2xl:top-24">
                <PatientDetail patient={selected} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <PlanComposer patient={selected} onPlanSent={handlePlanSent} />
            </div>

            <ExportCard patient={selected} />
          </main>
        </div>
      </div>
    </div>
  )
}

function formatSentAt(sentToAppAt: string | null) {
  if (!sentToAppAt) return "Skickad tid saknas"

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(sentToAppAt))
}

function ActivePlanSummary({
  live,
  onRefresh,
  patientName,
  refreshing,
}: {
  live?: LiveAdherence
  onRefresh: () => void
  patientName: string
  refreshing: boolean
}) {
  return (
    <section className="rounded-xl border border-[#EEE9E4] bg-white p-5 shadow-[0_16px_38px_rgba(59,42,32,0.035)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#DDF4F1] text-[#078C7A]">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#078C7A]">
              Aktiv patientplan
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#27221F]">
              {live?.activePlanTitle ?? `Ingen aktiv Supabase-plan för ${patientName}`}
            </h2>
            <p className="mt-1 text-sm text-[#817771]">
              {live
                ? `Skickad till appen ${formatSentAt(live.sentToAppAt)}`
                : "Generera och skicka en plan för att koppla dashboarden till mobilappen."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {live ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[#FBFAF8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
                  Klara
                </p>
                <p className="mt-1 text-lg font-bold text-[#27221F]">
                  {live.completedActionCount}/{live.activeActionCount}
                </p>
              </div>
              <div className="rounded-xl bg-[#FBFAF8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
                  Följsamhet
                </p>
                <p className="mt-1 text-lg font-bold text-[#27221F]">
                  {live.adherence} %
                </p>
              </div>
              <div className="rounded-xl bg-[#FBFAF8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#817771]">
                  Senast
                </p>
                <p className="mt-1 text-sm font-bold text-[#27221F]">
                  {live.lastCheckIn}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-[#FFF0C7] px-4 py-3 text-sm font-semibold text-[#9A4B22]">
              <CheckCircle2 className="size-4" />
              Väntar på skickad plan
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#27221F] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Uppdaterar..." : "Uppdatera följsamhet"}
          </button>
        </div>
      </div>
    </section>
  )
}
