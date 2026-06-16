import type { GeneratedAction, Patient } from "@/lib/clinic-data"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type SaveGeneratedPlanInput = {
  patient: Patient
  note: string
  actions: GeneratedAction[]
}

export async function saveGeneratedPlan({
  patient,
  note,
  actions,
}: SaveGeneratedPlanInput) {
  const supabase = getSupabaseBrowserClient()

  const { error: patientError } = await supabase.from("patients").upsert({
    id: patient.id,
    name: patient.name,
    initials: patient.initials,
    age: patient.age,
    program: patient.program,
  })

  if (patientError) throw patientError

  const { data: doctorNote, error: noteError } = await supabase
    .from("doctor_notes")
    .insert({
      patient_id: patient.id,
      raw_note: note,
      source: "dashboard_demo",
    })
    .select("id")
    .single()

  if (noteError) throw noteError

  const { data: carePlan, error: planError } = await supabase
    .from("care_plans")
    .insert({
      patient_id: patient.id,
      doctor_note_id: doctorNote.id,
      title: `${patient.program} - daglig plan`,
      status: "active",
      sent_to_app_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (planError) throw planError

  const rows = actions.map((action, index) => ({
    care_plan_id: carePlan.id,
    patient_id: patient.id,
    doctor_note_id: doctorNote.id,
    title: action.title,
    cadence: action.cadence,
    priority: action.priority,
    category: action.category,
    estimated_minutes: action.estimatedMinutes,
    clinical_weight: action.clinicalWeight,
    patient_reason: action.patientReason,
    verification_method: action.verificationMethod,
    status: "active",
    sort_order: index,
  }))

  const { error: actionsError } = await supabase
    .from("care_plan_actions")
    .insert(rows)

  if (actionsError) {
    const message = actionsError.message.toLowerCase()

    if (
      message.includes("category") ||
      message.includes("estimated_minutes") ||
      message.includes("clinical_weight") ||
      message.includes("patient_reason") ||
      message.includes("verification_method")
    ) {
      const fallbackRows = actions.map((action, index) => ({
        care_plan_id: carePlan.id,
        patient_id: patient.id,
        doctor_note_id: doctorNote.id,
        title: action.title,
        cadence: action.cadence,
        priority: action.priority,
        status: "active",
        sort_order: index,
      }))
      const { error: fallbackError } = await supabase
        .from("care_plan_actions")
        .insert(fallbackRows)

      if (fallbackError) throw fallbackError
    } else {
      throw actionsError
    }
  }

  return {
    carePlanId: carePlan.id as string,
    doctorNoteId: doctorNote.id as string,
  }
}
