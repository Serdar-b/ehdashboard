import type { GeneratedPlan, Patient } from "@/lib/clinic-data"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type SaveGeneratedPlanInput = {
  patient: Patient
  note: string
  plan: GeneratedPlan
}

export async function saveGeneratedPlan({
  patient,
  note,
  plan,
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

  const richPlanRow = {
    patient_id: patient.id,
    doctor_note_id: doctorNote.id,
    title: plan.title,
    goal: plan.goal,
    risk_area: plan.riskArea,
    duration_weeks: plan.durationWeeks,
    summary: plan.summary,
    status: "active",
    sent_to_app_at: new Date().toISOString(),
  }

  let { data: carePlan, error: planError } = await supabase
    .from("care_plans")
    .insert(richPlanRow)
    .select("id")
    .single()

  if (planError) {
    const message = planError.message.toLowerCase()
    const missingRichPlanColumn =
      message.includes("goal") ||
      message.includes("risk_area") ||
      message.includes("duration_weeks") ||
      message.includes("summary")

    if (!missingRichPlanColumn) throw planError

    const fallbackResult = await supabase
      .from("care_plans")
      .insert({
        patient_id: patient.id,
        doctor_note_id: doctorNote.id,
        title: plan.title,
        status: "active",
        sent_to_app_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    carePlan = fallbackResult.data
    planError = fallbackResult.error
    if (planError) throw planError
  }

  if (!carePlan) throw new Error("The care plan could not be saved.")

  const rows = plan.actions.map((action, index) => ({
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
      const fallbackRows = plan.actions.map((action, index) => ({
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
