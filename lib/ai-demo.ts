import type { GeneratedAction, Patient } from "@/lib/clinic-data"

export type GeneratedPlanResult = {
  actions: GeneratedAction[]
  summary: string
}

export function generatePlanFromDoctorNote(note: string): GeneratedPlanResult {
  const normalized = note.toLowerCase()
  const actions: GeneratedAction[] = []

  if (normalized.includes("omega") || normalized.includes("tillskott")) {
    actions.push({
      title: "Ta omega-3-tillskott",
      cadence: "Dagligen",
      priority: "Hög",
    })
  }

  if (normalized.includes("promenera") || normalized.includes("zon 2")) {
    actions.push({
      title: "30 min zon 2-promenad",
      cadence: "5 ggr/vecka",
      priority: "Hög",
    })
  }

  if (normalized.includes("blodtryck")) {
    actions.push({
      title: "Logga blodtryck",
      cadence: "3 ggr/vecka",
      priority: "Medel",
    })
  }

  if (actions.length === 0) {
    actions.push({
      title: "Daglig patientavstämning",
      cadence: "Dagligen",
      priority: "Medel",
    })
  }

  return {
    actions,
    summary:
      "Läkaranteckningen har strukturerats till dagliga patientåtgärder med klinisk prioritet och uppföljningsbar rytm.",
  }
}

export function createSendConfirmation(
  patient: Patient,
  actions: GeneratedAction[],
) {
  return `Plan skickad till ${patient.name}. Patientappen uppdateras med ${actions.length} dagliga åtgärder.`
}
