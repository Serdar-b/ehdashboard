import type {
  GeneratedAction,
  GeneratedPlan,
  Patient,
} from "@/lib/clinic-data"

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
}

function parseNumber(value?: string) {
  if (!value) return null
  return Number(value) || numberWords[value.toLowerCase()] || null
}

function weeklyCadence(text: string, fallback = "As prescribed") {
  if (/daily|every day|per day/i.test(text)) return "Daily"

  const match = text.match(
    /(\d+|one|two|three|four|five|six|seven)\s*(?:times|mornings|evenings)\s*(?:a|per)\s*week/i,
  )
  const count = parseNumber(match?.[1])

  return count ? `${count}x/week` : fallback
}

function action(
  values: GeneratedAction,
): GeneratedAction {
  return {
    verificationMethod: "Patient confirmation",
    ...values,
  }
}

function parseClause(clause: string): GeneratedAction | null {
  const text = clause
    .trim()
    .replace(/^the patient\s+(?:should|must)\s+/i, "")
    .replace(/^prescribe\s+/i, "")
  const normalized = text.toLowerCase()

  if (!text || normalized.startsWith("follow-up in")) return null

  const stepMatch = text.match(/(\d[\d\s,.]*)\s*steps/i)
  if (stepMatch) {
    const stepCount = Number(stepMatch[1].replace(/[\s,.]/g, ""))
    const formattedSteps = new Intl.NumberFormat("en-US").format(stepCount)
    return action({
      title: `Walk ${formattedSteps} steps`,
      cadence: weeklyCadence(text, "Daily"),
      priority: "Medium",
      category: "movement",
      estimatedMinutes: 45,
      clinicalWeight: 20,
      patientReason: "Makes daily movement clear and easy to follow.",
    })
  }

  if (normalized.includes("zone 2")) {
    const minuteMatch = text.match(/(\d+)\s*min/i)
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 30
    return action({
      title: minuteMatch ? `${minutes} min zone 2 walk` : "Zone 2 walk",
      cadence: weeklyCadence(text, "5x/week"),
      priority: "High",
      category: "movement",
      estimatedMinutes: minutes,
      clinicalWeight: 30,
      patientReason: "Supports the cardiovascular plan with regular movement.",
    })
  }

  if (normalized.includes("omega") || normalized.includes("supplement")) {
    return action({
      title: normalized.includes("omega") ? "Take omega-3 with food" : text,
      cadence: weeklyCadence(text, "Daily"),
      priority: "High",
      category: "medication",
      estimatedMinutes: 1,
      clinicalWeight: 25,
      patientReason: "Helps you maintain the prescribed routine in daily life.",
    })
  }

  if (normalized.includes("blood pressure")) {
    return action({
      title: "Log blood pressure",
      cadence: weeklyCadence(text, "3x/week"),
      priority: "High",
      category: "measurement",
      estimatedMinutes: 3,
      clinicalWeight: 30,
      patientReason: "Gives the clinic a clear signal between visits.",
    })
  }

  const cleanedTitle = text
    .replace(/\s+(?:daily|every day|per day)$/i, "")
    .replace(
      /\s+(?:\d+|one|two|three|four|five|six|seven)\s*(?:times|mornings|evenings)\s*(?:a|per)\s*week$/i,
      "",
    )
    .trim()

  if (cleanedTitle.length < 3) return null

  return action({
    title: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
    cadence: weeklyCadence(text),
    priority: "Medium",
    category: "check-in",
    estimatedMinutes: 5,
    clinicalWeight: 20,
    patientReason: "Makes the doctor's recommendation concrete and actionable.",
  })
}

function splitInstructions(note: string) {
  return note.split(
    /[.;\n]+|,\s*(?=(?:take|log|measure|walk|drink|eat|sleep|do)\b)|\s+and\s+(?=(?:take|log|measure|walk|drink|eat|sleep|do)\b)/i,
  )
}

export function generateDemoCarePlan(note: string, patient: Patient): GeneratedPlan {
  const actions = splitInstructions(note)
    .map(parseClause)
    .filter((item): item is GeneratedAction => Boolean(item))
    .filter(
      (item, index, all) =>
        all.findIndex(
          (candidate) => candidate.title.toLowerCase() === item.title.toLowerCase(),
        ) === index,
    )

  if (actions.length === 0) {
    actions.push(
      action({
        title: "Daily patient check-in",
        cadence: "Daily",
        priority: "Medium",
        category: "check-in",
        estimatedMinutes: 2,
        clinicalWeight: 20,
        patientReason: "Keeps the plan active with a simple daily check-in.",
      }),
    )
  }

  const durationMatch = note.match(/(\d+)\s*week/i)
  const firstName = patient.name.split(" ")[0]

  return {
    title: `${firstName}'s daily plan`,
    goal: "Make the doctor's recommendations easier to follow every day.",
    riskArea: patient.program,
    durationWeeks: durationMatch ? Number(durationMatch[1]) : 12,
    summary: `The plan contains ${actions.length} concrete actions from the clinical note.`,
    actions,
  }
}

export function createSendConfirmation(
  patient: Patient,
  actions: GeneratedAction[],
) {
  return `Plan sent to ${patient.name}. Patient app updated with ${actions.length} daily actions.`
}
