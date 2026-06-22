import type {
  GeneratedAction,
  GeneratedPlan,
  Patient,
} from "@/lib/clinic-data"

const numberWords: Record<string, number> = {
  en: 1,
  ett: 1,
  två: 2,
  tre: 3,
  fyra: 4,
  fem: 5,
  sex: 6,
  sju: 7,
}

function parseNumber(value?: string) {
  if (!value) return null
  return Number(value) || numberWords[value.toLowerCase()] || null
}

function weeklyCadence(text: string, fallback = "Enligt plan") {
  if (/dagligen|varje dag|om dagen/i.test(text)) return "Dagligen"

  const match = text.match(
    /(\d+|en|ett|två|tre|fyra|fem|sex|sju)\s*(?:gånger|ggr|morgnar|kvällar)\s*(?:i|per)\s*veck(?:a|an)/i,
  )
  const count = parseNumber(match?.[1])

  return count ? `${count} ggr/vecka` : fallback
}

function action(
  values: GeneratedAction,
): GeneratedAction {
  return {
    verificationMethod: "Patientbekräftelse",
    ...values,
  }
}

function parseClause(clause: string): GeneratedAction | null {
  const text = clause
    .trim()
    .replace(/^patienten\s+(?:ska|bör)\s+/i, "")
    .replace(/^ordinera\s+/i, "")
  const normalized = text.toLowerCase()

  if (!text || normalized.startsWith("uppföljning om")) return null

  const stepMatch = text.match(/(\d[\d\s.]*)\s*steg/i)
  if (stepMatch) {
    const stepCount = Number(stepMatch[1].replace(/[\s.]/g, ""))
    const formattedSteps = new Intl.NumberFormat("sv-SE").format(stepCount)
    return action({
      title: `Gå ${formattedSteps} steg`,
      cadence: weeklyCadence(text, "Dagligen"),
      priority: "Medel",
      category: "movement",
      estimatedMinutes: 45,
      clinicalWeight: 20,
      patientReason: "Gör den dagliga rörelsen tydlig och enkel att följa.",
    })
  }

  if (normalized.includes("zon 2")) {
    const minuteMatch = text.match(/(\d+)\s*min/i)
    const minutes = minuteMatch ? Number(minuteMatch[1]) : 30
    return action({
      title: minuteMatch ? `${minutes} min zon 2-promenad` : "Promenera i zon 2",
      cadence: weeklyCadence(text, "5 ggr/vecka"),
      priority: "Hög",
      category: "movement",
      estimatedMinutes: minutes,
      clinicalWeight: 30,
      patientReason: "Stödjer hjärt-kärlplanen med regelbunden rörelse.",
    })
  }

  if (normalized.includes("omega") || normalized.includes("tillskott")) {
    return action({
      title: normalized.includes("omega") ? "Ta omega-3 med mat" : text,
      cadence: weeklyCadence(text, "Dagligen"),
      priority: "Hög",
      category: "medication",
      estimatedMinutes: 1,
      clinicalWeight: 25,
      patientReason: "Hjälper dig att hålla den ordinerade rutinen i vardagen.",
    })
  }

  if (normalized.includes("blodtryck")) {
    return action({
      title: "Logga blodtryck",
      cadence: weeklyCadence(text, "3 ggr/vecka"),
      priority: "Hög",
      category: "measurement",
      estimatedMinutes: 3,
      clinicalWeight: 30,
      patientReason: "Ger kliniken en tydlig signal mellan besöken.",
    })
  }

  const cleanedTitle = text
    .replace(/\s+(?:dagligen|varje dag|om dagen)$/i, "")
    .replace(
      /\s+(?:\d+|en|ett|två|tre|fyra|fem|sex|sju)\s*(?:gånger|ggr|morgnar|kvällar)\s*(?:i|per)\s*veck(?:a|an)$/i,
      "",
    )
    .trim()

  if (cleanedTitle.length < 3) return null

  return action({
    title: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
    cadence: weeklyCadence(text),
    priority: "Medel",
    category: "check-in",
    estimatedMinutes: 5,
    clinicalWeight: 20,
    patientReason: "Gör läkarens rekommendation konkret och möjlig att följa upp.",
  })
}

function splitInstructions(note: string) {
  return note.split(
    /[.;\n]+|,\s*(?=(?:ta|logga|mäta|mät|gå|promenera|drick|ät|sov|gör)\b)|\s+och\s+(?=(?:ta|logga|mäta|mät|gå|promenera|drick|ät|sov|gör)\b)/i,
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
        title: "Daglig patientavstämning",
        cadence: "Dagligen",
        priority: "Medel",
        category: "check-in",
        estimatedMinutes: 2,
        clinicalWeight: 20,
        patientReason: "Håller planen aktiv med en enkel daglig avstämning.",
      }),
    )
  }

  const durationMatch = note.match(/(\d+)\s*veck/i)
  const firstName = patient.name.split(" ")[0]

  return {
    title: `${firstName}s dagliga plan`,
    goal: "Göra läkarens rekommendationer enklare att följa varje dag.",
    riskArea: patient.program,
    durationWeeks: durationMatch ? Number(durationMatch[1]) : 12,
    summary: `Planen innehåller ${actions.length} konkreta handlingar från läkarens anteckning.`,
    actions,
  }
}

export function createSendConfirmation(
  patient: Patient,
  actions: GeneratedAction[],
) {
  return `Plan skickad till ${patient.name}. Patientappen uppdateras med ${actions.length} dagliga åtgärder.`
}
