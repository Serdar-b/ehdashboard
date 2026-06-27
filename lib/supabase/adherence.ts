import type {
  BehaviorAdaptation,
  LiveAdherence,
  Patient,
  Signal,
} from "@/lib/clinic-data"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type CarePlanActionRow = {
  id: string
  title: string
  priority: string
  sort_order: number
  clinical_weight?: number | null
}

type CarePlanRow = {
  id: string
  title: string
  sent_to_app_at: string | null
}

type CheckInRow = {
  action_id: string
  completed: boolean
  created_at: string
}

function startOfTodayIso() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function priorityWeight(priority: string, clinicalWeight?: number | null) {
  if (typeof clinicalWeight === "number" && clinicalWeight > 0) return clinicalWeight
  const normalized = priority.toLowerCase()
  if (normalized === "high" || normalized === "hög") return 30
  if (normalized === "low" || normalized === "låg") return 10
  return 20
}

function signalFromScore(score: number): Signal {
  if (score >= 80) return "Stable"
  if (score >= 55) return "Monitor"
  return "Critical"
}

function relativeCheckInLabel(checkIns: CheckInRow[]) {
  const latest = checkIns[0]?.created_at
  if (!latest) return "none today"

  const diffMs = Date.now() - new Date(latest).getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000))

  if (diffMinutes < 2) return "just now"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  return diffHours <= 1 ? "1 hour ago" : `${diffHours} hours ago`
}

function createRecommendation(signal: Signal, missedActions: string[]) {
  if (signal === "Stable") {
    return "Keep current plan"
  }

  if (
    missedActions.some((action) => {
      const normalized = action.toLowerCase()
      return (
        normalized.includes("walk") ||
        normalized.includes("zone 2") ||
        normalized.includes("step") ||
        normalized.includes("exercise")
      )
    })
  ) {
    return "Simplify exercise plan"
  }

  if (signal === "Critical") {
    return "Contact patient today"
  }

  return "Send continuity support"
}

function createAiRecommendation(signal: Signal, adherence: number, missedActions: string[]) {
  if (signal === "Stable") {
    return "The patient is maintaining today's continuity. Continue with automated reinforcement and keep the current level."
  }

  const missed = missedActions.length > 0 ? missedActions.join(", ") : "today's actions"

  if (signal === "Critical") {
    return `Today's continuity index is ${adherence}%. Prioritize follow-up and simplify the plan around: ${missed}.`
  }

  return `Today's continuity index is ${adherence}%. Send behavioral support and focus next steps on: ${missed}.`
}

function createBehaviorAdaptation(
  signal: Signal,
  missedActions: string[],
): BehaviorAdaptation {
  const movementAction =
    missedActions.find((action) => {
      const normalized = action.toLowerCase()
      return (
        normalized.includes("walk") ||
        normalized.includes("zone 2") ||
        normalized.includes("step") ||
        normalized.includes("exercise")
      )
    }) ?? missedActions[0]

  if (!movementAction || signal === "Stable") {
    return {
      active: false,
      missedDays: 0,
      trigger: "Continuity is holding today",
      originalAction: "Current patient plan",
      adaptedAction: "No reduction, maintain rhythm",
      threshold: "Adaptation idle",
      reason:
        "The patient has sufficient continuity for the system to continue at the current level.",
      coachAction: "Keep plan and continue monitoring the signal.",
    }
  }

  const isMovement = movementAction !== missedActions[0] || /walk|zone 2|step|exercise/i.test(movementAction)

  return {
    active: true,
    missedDays: signal === "Critical" ? 2 : 1,
    trigger:
      signal === "Critical"
        ? "Missed high-value actions today"
        : "Continuity risk detected",
    originalAction: movementAction,
    adaptedAction: isMovement
      ? "5 min restart is enough for today"
      : "One core action is enough to restart the rhythm",
    threshold: isMovement
      ? "Threshold lowered from full exercise plan to restart"
      : "Threshold lowered to smallest meaningful action",
    reason:
      "The system prioritizes resumed continuity over perfect execution when the patient is at risk of dropping out of the plan.",
    coachAction:
      signal === "Critical"
        ? "Contact the patient and confirm the lowered threshold."
        : "Send behavioral support and follow up on next check-in.",
  }
}

function mergeLivePatient(patient: Patient, live: LiveAdherence): Patient {
  return {
    ...patient,
    adherence: live.adherence,
    missedActions: live.missedActions.length > 0 ? live.missedActions : ["No missed high-value actions"],
    missedHighValue: live.missedHighValue,
    lastCheckIn: live.lastCheckIn,
    signal: live.signal,
    suggestedAction: live.suggestedAction,
    friction: live.friction,
    aiRecommendation: live.aiRecommendation,
    weekAdherence: live.weekAdherence,
    behaviorAdaptation: live.behaviorAdaptation ?? patient.behaviorAdaptation,
  }
}

export function applyLiveAdherence(patients: Patient[], liveByPatientId: Record<string, LiveAdherence>) {
  return patients.map((patient) => {
    const live = liveByPatientId[patient.id]
    return live ? mergeLivePatient(patient, live) : patient
  })
}

export async function fetchLiveAdherence(patientId: string): Promise<LiveAdherence | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: carePlan, error: carePlanError } = await supabase
    .from("care_plans")
    .select("id,title,sent_to_app_at")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .order("sent_to_app_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  if (carePlanError) throw carePlanError
  if (!carePlan) return null
  const activePlan = carePlan as CarePlanRow

  let { data: actions, error: actionsError } = await supabase
    .from("care_plan_actions")
    .select("id,title,priority,sort_order,clinical_weight")
    .eq("care_plan_id", activePlan.id)
    .eq("status", "active")
    .order("sort_order", { ascending: true })

  if (actionsError && actionsError.message.toLowerCase().includes("clinical_weight")) {
    const fallbackResult = await supabase
      .from("care_plan_actions")
      .select("id,title,priority,sort_order")
      .eq("care_plan_id", activePlan.id)
      .eq("status", "active")
      .order("sort_order", { ascending: true })
    actions = fallbackResult.data?.map((action) => ({
      ...action,
      clinical_weight: null,
    })) ?? null
    actionsError = fallbackResult.error
  }

  if (actionsError) throw actionsError
  if (!actions?.length) return null

  const actionRows = actions as CarePlanActionRow[]
  const actionIds = actionRows.map((action) => action.id)
  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("action_id,completed,created_at")
    .eq("patient_id", patientId)
    .in("action_id", actionIds)
    .gte("created_at", startOfTodayIso())
    .order("created_at", { ascending: false })

  if (checkInsError) throw checkInsError

  const checkInRows = (checkIns ?? []) as CheckInRow[]
  const latestCompletedByAction = new Map<string, boolean>()
  for (const checkIn of checkInRows) {
    if (!latestCompletedByAction.has(checkIn.action_id)) {
      latestCompletedByAction.set(checkIn.action_id, checkIn.completed)
    }
  }

  const totalWeight = actionRows.reduce(
    (sum, action) => sum + priorityWeight(action.priority, action.clinical_weight),
    0,
  )
  const completedWeight = actionRows.reduce((sum, action) => {
    return latestCompletedByAction.get(action.id)
      ? sum + priorityWeight(action.priority, action.clinical_weight)
      : sum
  }, 0)
  const adherence = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
  const missedActions = actionRows
    .filter((action) => !latestCompletedByAction.get(action.id))
    .map((action) => action.title)
  const signal = signalFromScore(adherence)
  const suggestedAction = createRecommendation(signal, missedActions)

  return {
    activePlanTitle: activePlan.title,
    sentToAppAt: activePlan.sent_to_app_at,
    adherence,
    missedActions,
    missedHighValue:
      missedActions.length > 0
        ? `Missed ${missedActions.slice(0, 2).join(" and ")}`
        : "Following today's plan",
    lastCheckIn: relativeCheckInLabel(checkInRows),
    signal,
    suggestedAction,
    friction:
      missedActions.length > 0
        ? `Today's friction appears to be around ${missedActions[0].toLowerCase()}.`
        : "No reported obstacles today.",
    aiRecommendation: createAiRecommendation(signal, adherence, missedActions),
    weekAdherence: [50, 60, 55, 70, 65, adherence, adherence],
    activeActionCount: actionRows.length,
    completedActionCount: actionRows.length - missedActions.length,
    behaviorAdaptation: createBehaviorAdaptation(signal, missedActions),
  }
}
