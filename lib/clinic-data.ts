export type Signal = "Stable" | "Monitor" | "Critical"

export type Patient = {
  id: string
  name: string
  initials: string
  age: number
  program: string
  signal: Signal
  adherence: number
  missedHighValue: string
  lastCheckIn: string
  suggestedAction: string
  /** 7-day adherence series (0-100) */
  weekAdherence: number[]
  friction: string
  missedActions: string[]
  aiRecommendation: string
  behaviorAdaptation?: BehaviorAdaptation
}

export type BehaviorAdaptation = {
  active: boolean
  missedDays: number
  trigger: string
  originalAction: string
  adaptedAction: string
  threshold: string
  reason: string
  coachAction: string
}

export type LiveAdherence = {
  activePlanTitle: string
  sentToAppAt: string | null
  adherence: number
  missedActions: string[]
  missedHighValue: string
  lastCheckIn: string
  signal: Signal
  suggestedAction: string
  friction: string
  aiRecommendation: string
  weekAdherence: number[]
  activeActionCount: number
  completedActionCount: number
  behaviorAdaptation?: BehaviorAdaptation
}

export const patients: Patient[] = [
  {
    id: "oscar-nilsson",
    name: "Oscar Nilsson",
    initials: "ON",
    age: 62,
    program: "Cardiometabolic",
    signal: "Critical",
    adherence: 35,
    missedHighValue: "No check-in for 4 days",
    lastCheckIn: "4 days ago",
    suggestedAction: "Call patient today",
    weekAdherence: [50, 44, 38, 35, 0, 0, 35],
    friction: "No activity recorded in the past few days.",
    missedActions: [
      "All check-ins (4 days)",
      "Blood pressure measurement (3 mornings)",
      "Medication reminder (4 days)",
    ],
    aiRecommendation:
      "High dropout risk. Schedule a phone check-in and simplify the plan to one daily core action until contact is re-established.",
    behaviorAdaptation: {
      active: true,
      missedDays: 4,
      trigger: "No check-in for 4 days",
      originalAction: "30 min zone 2 walk + blood pressure + medication reminder",
      adaptedAction: "A 5 min restart and one confirmed medication routine today",
      threshold: "Threshold lowered from full plan to one core action",
      reason:
        "The system prioritizes resumed continuity over perfect execution when the patient is at risk of dropping out of the plan.",
      coachAction: "Call the patient and restart with one daily core action.",
    },
  },
  {
    id: "alexandra-berg",
    name: "Alexandra Berg",
    initials: "AB",
    age: 54,
    program: "Cardiovascular",
    signal: "Critical",
    adherence: 42,
    missedHighValue: "Missed zone 2 and blood pressure",
    lastCheckIn: "2 days ago",
    suggestedAction: "Simplify exercise plan",
    weekAdherence: [60, 48, 55, 38, 42, 30, 42],
    friction: "Exercise sessions feel too long to fit into the schedule.",
    missedActions: [
      "Zone 2 walk (4 of 5 sessions)",
      "Blood pressure measurement (3 of 3 mornings)",
      "Omega-3 (2 days)",
    ],
    aiRecommendation:
      "Adjust zone 2 walk to 15 minutes daily for 7 days and follow up on blood pressure measurement.",
    behaviorAdaptation: {
      active: true,
      missedDays: 2,
      trigger: "Missed exercise and blood pressure for two days",
      originalAction: "30 min zone 2 walk, 5x/week",
      adaptedAction: "10 min walk today is enough to maintain rhythm",
      threshold: "Threshold lowered after two missed days",
      reason:
        "The plan is simplified to the smallest meaningful action so the patient maintains momentum without guilt or dropout.",
      coachAction: "Send behavioral support and confirm shorter exercise plan.",
    },
  },
  {
    id: "mikael-sandell",
    name: "Mikael Sandell",
    initials: "MS",
    age: 48,
    program: "Metabolic Health",
    signal: "Monitor",
    adherence: 64,
    missedHighValue: "Diet routine broken after travel",
    lastCheckIn: "yesterday",
    suggestedAction: "Re-establish diet routine",
    weekAdherence: [80, 72, 68, 50, 58, 64, 64],
    friction: "Routines were disrupted during a business trip.",
    missedActions: ["Diet logging (3 days)", "Evening walk (2 sessions)"],
    aiRecommendation:
      "Reintroduce diet logging with a reminder at 7 PM and plan meals before the next trip.",
    behaviorAdaptation: {
      active: true,
      missedDays: 3,
      trigger: "Travel disrupted diet routine",
      originalAction: "Full diet logging every evening",
      adaptedAction: "Log one meal at 7 PM and mark the next planned meal",
      threshold: "Travel mode: fewer steps, same clinical signal",
      reason:
        "When routine is broken, the action is simplified to a single reconnection point to rebuild rhythm.",
      coachAction: "Follow up on travel strategy at the next check-in.",
    },
  },
  {
    id: "lina-friberg",
    name: "Lina Friberg",
    initials: "LF",
    age: 57,
    program: "Sleep & Recovery",
    signal: "Monitor",
    adherence: 58,
    missedHighValue: "Recurring low energy",
    lastCheckIn: "yesterday",
    suggestedAction: "Review sleep and energy",
    weekAdherence: [70, 65, 60, 52, 55, 58, 58],
    friction: "Reports low energy in the mornings.",
    missedActions: ["Morning exercise (3 sessions)", "Hydration logging (2 days)"],
    aiRecommendation:
      "Move exercise sessions to the afternoon and map sleep patterns for 7 days.",
    behaviorAdaptation: {
      active: true,
      missedDays: 2,
      trigger: "Low morning energy and missed morning sessions",
      originalAction: "Morning exercise before work",
      adaptedAction: "5 min mobility after lunch and evening energy check",
      threshold: "Timing shifted instead of demanding more discipline",
      reason:
        "The system matches the action to the patient's energy pattern to protect continuity.",
      coachAction: "Monitor energy and sleep for 7 days.",
    },
  },
  {
    id: "johan-ekstrom",
    name: "Johan Ekström",
    initials: "JE",
    age: 51,
    program: "Cardiometabolic",
    signal: "Monitor",
    adherence: 69,
    missedHighValue: "Inconsistent medication routine",
    lastCheckIn: "1 day ago",
    suggestedAction: "Remind about evening dose",
    weekAdherence: [74, 70, 66, 72, 64, 69, 69],
    friction: "Forgets evening dose on workdays.",
    missedActions: ["Evening medication (2 days)", "Step goal (3 days)"],
    aiRecommendation:
      "Set a recurring reminder at 9 PM and link the dose to an existing evening routine.",
    behaviorAdaptation: {
      active: false,
      missedDays: 1,
      trigger: "Single missed evening dose",
      originalAction: "Evening medication at 9 PM",
      adaptedAction: "Keep plan, reinforce with routine anchor",
      threshold: "No threshold reduction yet",
      reason:
        "The pattern is inconsistent but not a dropout pattern. The system monitors before simplifying the plan.",
      coachAction: "Remind about linking to existing evening routine.",
    },
  },
  {
    id: "sara-holmqvist",
    name: "Sara Holmqvist",
    initials: "SH",
    age: 41,
    program: "Prevention",
    signal: "Stable",
    adherence: 91,
    missedHighValue: "Following the plan fully",
    lastCheckIn: "today",
    suggestedAction: "Keep current plan",
    weekAdherence: [88, 90, 92, 89, 94, 90, 91],
    friction: "No reported obstacles.",
    missedActions: ["No missed high-value actions"],
    aiRecommendation:
      "Stable continuity. Consider increasing training intensity at the next follow-up.",
    behaviorAdaptation: {
      active: false,
      missedDays: 0,
      trigger: "Stable continuity",
      originalAction: "Current prevention plan",
      adaptedAction: "No reduction, maintain rhythm",
      threshold: "Adaptation idle",
      reason:
        "The patient maintains continuity and needs reinforcement rather than simplification.",
      coachAction: "Keep plan and consider progression at the next visit.",
    },
  },
  {
    id: "anders-lund",
    name: "Anders Lund",
    initials: "AL",
    age: 59,
    program: "Cardiovascular",
    signal: "Stable",
    adherence: 86,
    missedHighValue: "Stable over time",
    lastCheckIn: "today",
    suggestedAction: "Keep current plan",
    weekAdherence: [82, 84, 88, 85, 87, 86, 86],
    friction: "No reported obstacles.",
    missedActions: ["No missed high-value actions"],
    aiRecommendation:
      "Good and consistent continuity. Maintain plan and schedule routine follow-up in 4 weeks.",
    behaviorAdaptation: {
      active: false,
      missedDays: 0,
      trigger: "Stable over time",
      originalAction: "Current cardiovascular plan",
      adaptedAction: "No adaptation activated",
      threshold: "Adaptation idle",
      reason:
        "Continuity is sufficiently stable for the system to continue at the current level.",
      coachAction: "Schedule routine follow-up in 4 weeks.",
    },
  },
]

export const kpis = [
  {
    label: "Active Patients",
    value: "184",
    delta: "+6 this week",
    trend: "up" as const,
    accent: "info" as const,
  },
  {
    label: "Needs Clinical Review",
    value: "12",
    delta: "+3 since yesterday",
    trend: "up" as const,
    accent: "coral" as const,
  },
  {
    label: "Average Continuity Index",
    value: "78 %",
    delta: "+4 % vs last week",
    trend: "up" as const,
    accent: "teal" as const,
  },
]

export type GeneratedAction = {
  title: string
  cadence: string
  priority: "High" | "Medium" | "Low"
  category?: "movement" | "nutrition" | "medication" | "measurement" | "check-in"
  estimatedMinutes?: number
  clinicalWeight?: number
  patientReason?: string
  verificationMethod?: string
}

export type GeneratedPlan = {
  title: string
  goal: string
  riskArea: string
  durationWeeks: number
  summary: string
  actions: GeneratedAction[]
}

export const generatedPlan: GeneratedAction[] = [
  { title: "Take omega-3 supplement", cadence: "Daily", priority: "High" },
  { title: "30 min zone 2 walk", cadence: "5x/week", priority: "High" },
  { title: "Log blood pressure", cadence: "3x/week", priority: "Medium" },
]

export const mobileActions = [
  { title: "Take omega-3 supplement", time: "With breakfast", done: true },
  { title: "30 min zone 2 walk", time: "Morning", done: false },
  { title: "Log blood pressure", time: "Before lunch", done: false },
]

export const aiSummaryText =
  "The patient has a 42% continuity index over the past 7 days and is mainly missing exercise and blood pressure measurement. The pattern suggests time friction rather than unwillingness. Recommended action is to simplify the exercise plan to shorter daily sessions."

export const aiSummaryTags = ["Time friction", "Exercise", "Blood pressure"]

export const exportSections = [
  {
    label: "Summary",
    body: "Alexandra Berg, 54 years. Continuity index 42% (7 days). Critical signal. Downward trend.",
  },
  {
    label: "Missed Actions",
    body: "Zone 2 walk 4/5 sessions, blood pressure measurement 3/3 mornings, omega-3 2 days.",
  },
  {
    label: "Suggested Clinical Action",
    body: "Simplify exercise plan to 15 min daily zone 2 walk for 7 days. Ensure blood pressure measurement.",
  },
  {
    label: "Follow-up",
    body: "New check-in in 7 days. Escalate if continuity index remains below 50%.",
  },
]
