"use client"

import { useState } from "react"
import { patients, type Patient } from "@/lib/clinic-data"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { KpiCards } from "@/components/kpi-cards"
import { PatientQueue } from "@/components/patient-queue"
import { PatientDetail } from "@/components/patient-detail"
import { PlanComposer } from "@/components/plan-composer"
import { MobilePreview } from "@/components/mobile-preview"
import { AiSummary } from "@/components/ai-summary"
import { ExportCard } from "@/components/export-card"

export function Dashboard() {
  const [selected, setSelected] = useState<Patient>(patients[0])

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-foreground">
      <div className="flex min-h-screen overflow-hidden bg-[#F7F7F8]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col bg-[#fbfcff]">
          <Topbar />

          <main className="flex-1 space-y-8 p-5 md:p-8">
            <KpiCards />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
              <AiSummary patient={selected} />
              <MobilePreview />
            </div>

            <section className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-[1.45fr_0.8fr]">
              <PatientQueue selectedId={selected.id} onSelect={setSelected} />
              <div className="2xl:sticky 2xl:top-24">
                <PatientDetail patient={selected} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6">
              <PlanComposer />
            </div>

            <ExportCard patient={selected} />
          </main>
        </div>
      </div>
    </div>
  )
}
