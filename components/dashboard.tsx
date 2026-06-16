"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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

  const refreshPatientAdherence = useCallback(async (patientId: string) => {
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
