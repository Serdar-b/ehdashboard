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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 space-y-8 p-5 md:p-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Översikt
            </h1>
            <p className="text-sm text-muted-foreground">
              Filtrerade kliniska signaler och följsamhet i realtid
            </p>
          </div>

          <KpiCards />

          {/* Queue + detail panel */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
            <PatientQueue selectedId={selected.id} onSelect={setSelected} />
            <PatientDetail patient={selected} />
          </div>

          {/* Centerpiece: clinical signal + patient experience */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Från klinisk signal till patientens vardag
              </h2>
              <p className="text-sm text-muted-foreground">
                AI:n tolkar följsamheten åt läkaren — patienten ser bara en
                enkel daglig plan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
              <AiSummary />
              <MobilePreview />
            </div>
          </section>

          {/* Plan composer + export */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <PlanComposer />
            <ExportCard />
          </div>
        </main>
      </div>
    </div>
  )
}
