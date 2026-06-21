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
  if (normalized === "hög" || normalized === "high") return 30
  if (normalized === "låg" || normalized === "low") return 10
  return 20
}

function signalFromScore(score: number): Signal {
  if (score >= 80) return "Stabil"
  if (score >= 55) return "Bevaka"
  return "Kritisk"
}

function relativeCheckInLabel(checkIns: CheckInRow[]) {
  const latest = checkIns[0]?.created_at
  if (!latest) return "ingen idag"

  const diffMs = Date.now() - new Date(latest).getTime()
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000))

  if (diffMinutes < 2) return "nyss"
  if (diffMinutes < 60) return `för ${diffMinutes} min sedan`

  const diffHours = Math.round(diffMinutes / 60)
  return diffHours <= 1 ? "för 1 timme sedan" : `för ${diffHours} timmar sedan`
}

function createRecommendation(signal: Signal, missedActions: string[]) {
  if (signal === "Stabil") {
    return "Behåll nuvarande plan"
  }

  if (
    missedActions.some((action) => {
      const normalized = action.toLowerCase()
      return (
        normalized.includes("promenad") ||
        normalized.includes("zon 2") ||
        normalized.includes("steg") ||
        normalized.includes("rörelse")
      )
    })
  ) {
    return "Förenkla rörelseplan"
  }

  if (signal === "Kritisk") {
    return "Kontakta patienten idag"
  }

  return "Skicka kontinuitetsstöd"
}

function createAiRecommendation(signal: Signal, adherence: number, missedActions: string[]) {
  if (signal === "Stabil") {
    return "Patienten håller dagens kontinuitet. Fortsätt med automatiserad förstärkning och behåll nuvarande nivå."
  }

  const missed = missedActions.length > 0 ? missedActions.join(", ") : "dagens åtgärder"

  if (signal === "Kritisk") {
    return `Dagens kontinuitetsindex är ${adherence} %. Prioritera uppföljning och förenkla planen runt: ${missed}.`
  }

  return `Dagens kontinuitetsindex är ${adherence} %. Skicka beteendestöd och fokusera nästa steg på: ${missed}.`
}

function createBehaviorAdaptation(
  signal: Signal,
  missedActions: string[],
): BehaviorAdaptation {
  const movementAction =
    missedActions.find((action) => {
      const normalized = action.toLowerCase()
      return (
        normalized.includes("promenad") ||
        normalized.includes("zon 2") ||
        normalized.includes("steg") ||
        normalized.includes("rörelse")
      )
    }) ?? missedActions[0]

  if (!movementAction || signal === "Stabil") {
    return {
      active: false,
      missedDays: 0,
      trigger: "Kontinuiteten håller idag",
      originalAction: "Nuvarande patientplan",
      adaptedAction: "Ingen sänkning, behåll rytm",
      threshold: "Adaptation vilande",
      reason:
        "Patienten håller tillräcklig kontinuitet för att systemet ska fortsätta med nuvarande nivå.",
      coachAction: "Behåll plan och fortsätt bevaka signalen.",
    }
  }

  const isMovement = movementAction !== missedActions[0] || /promenad|zon 2|steg|rörelse/i.test(movementAction)

  return {
    active: true,
    missedDays: signal === "Kritisk" ? 2 : 1,
    trigger:
      signal === "Kritisk"
        ? "Missade högvärdesåtgärder idag"
        : "Kontinuitetsrisk upptäckt",
    originalAction: movementAction,
    adaptedAction: isMovement
      ? "5 min återstart räcker idag"
      : "En kärnåtgärd räcker för att starta om rytmen",
    threshold: isMovement
      ? "Tröskel sänkt från full rörelseplan till återstart"
      : "Tröskel sänkt till minsta meningsfulla handling",
    reason:
      "Systemet prioriterar återupptagen kontinuitet före perfekt genomförande när patienten riskerar att falla ur planen.",
    coachAction:
      signal === "Kritisk"
        ? "Kontakta patienten och bekräfta den sänkta tröskeln."
        : "Skicka beteendestöd och följ upp nästa incheckning.",
  }
}

function mergeLivePatient(patient: Patient, live: LiveAdherence): Patient {
  return {
    ...patient,
    adherence: live.adherence,
    missedActions: live.missedActions.length > 0 ? live.missedActions : ["Inga missade högvärdesåtgärder"],
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
        ? `Missat ${missedActions.slice(0, 2).join(" och ")}`
        : "Följer dagens plan",
    lastCheckIn: relativeCheckInLabel(checkInRows),
    signal,
    suggestedAction,
    friction:
      missedActions.length > 0
        ? `Dagens friktion verkar ligga kring ${missedActions[0].toLowerCase()}.`
        : "Inga rapporterade hinder idag.",
    aiRecommendation: createAiRecommendation(signal, adherence, missedActions),
    weekAdherence: [50, 60, 55, 70, 65, adherence, adherence],
    activeActionCount: actionRows.length,
    completedActionCount: actionRows.length - missedActions.length,
    behaviorAdaptation: createBehaviorAdaptation(signal, missedActions),
  }
}
