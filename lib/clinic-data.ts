export type Signal = "Stabil" | "Bevaka" | "Kritisk"

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
}

export const patients: Patient[] = [
  {
    id: "oscar-nilsson",
    name: "Oscar Nilsson",
    initials: "ON",
    age: 62,
    program: "Kardiometabol",
    signal: "Kritisk",
    adherence: 35,
    missedHighValue: "Ingen incheckning på 4 dygn",
    lastCheckIn: "för 4 dagar sedan",
    suggestedAction: "Ring patienten idag",
    weekAdherence: [50, 44, 38, 35, 0, 0, 35],
    friction: "Ingen aktivitet registrerad de senaste dygnen.",
    missedActions: [
      "Samtliga incheckningar (4 dygn)",
      "Blodtrycksmätning (3 morgnar)",
      "Medicinpåminnelse (4 dygn)",
    ],
    aiRecommendation:
      "Hög risk för avhopp. Boka telefonavstämning och förenkla planen till en daglig kärnåtgärd tills kontakt återupprättats.",
  },
  {
    id: "alexandra-berg",
    name: "Alexandra Berg",
    initials: "AB",
    age: 54,
    program: "Hjärt-kärl",
    signal: "Kritisk",
    adherence: 42,
    missedHighValue: "Missat zon 2 och blodtryck",
    lastCheckIn: "för 2 dagar sedan",
    suggestedAction: "Förenkla rörelseplan",
    weekAdherence: [60, 48, 55, 38, 42, 30, 42],
    friction: "Rörelsepassen upplevs för långa för att hinnas med.",
    missedActions: [
      "Zon 2-promenad (4 av 5 pass)",
      "Blodtrycksmätning (3 av 3 morgnar)",
      "Omega-3 (2 dygn)",
    ],
    aiRecommendation:
      "Justera zon 2-promenad till 15 minuter dagligen i 7 dagar och följ upp blodtrycksmätningen.",
  },
  {
    id: "mikael-sandell",
    name: "Mikael Sandell",
    initials: "MS",
    age: 48,
    program: "Metabol hälsa",
    signal: "Bevaka",
    adherence: 64,
    missedHighValue: "Kostrutin bröts efter resa",
    lastCheckIn: "igår",
    suggestedAction: "Återupprätta kostrutin",
    weekAdherence: [80, 72, 68, 50, 58, 64, 64],
    friction: "Rutiner bröts under en tjänsteresa.",
    missedActions: ["Kostloggning (3 dygn)", "Kvällspromenad (2 pass)"],
    aiRecommendation:
      "Återinför kostloggning med påminnelse kl 19 och planera måltider inför nästa resa.",
  },
  {
    id: "lina-friberg",
    name: "Lina Friberg",
    initials: "LF",
    age: 57,
    program: "Sömn & återhämtning",
    signal: "Bevaka",
    adherence: 58,
    missedHighValue: "Återkommande låg energi",
    lastCheckIn: "igår",
    suggestedAction: "Granska sömn och energi",
    weekAdherence: [70, 65, 60, 52, 55, 58, 58],
    friction: "Rapporterar låg energi på morgnarna.",
    missedActions: ["Morgonrörelse (3 pass)", "Vätskeloggning (2 dygn)"],
    aiRecommendation:
      "Flytta rörelsepasset till eftermiddagen och kartlägg sömnmönstret i 7 dagar.",
  },
  {
    id: "johan-ekstrom",
    name: "Johan Ekström",
    initials: "JE",
    age: 51,
    program: "Kardiometabol",
    signal: "Bevaka",
    adherence: 69,
    missedHighValue: "Ojämn medicinföljsamhet",
    lastCheckIn: "för 1 dag sedan",
    suggestedAction: "Påminn om kvällsdos",
    weekAdherence: [74, 70, 66, 72, 64, 69, 69],
    friction: "Glömmer kvällsdosen på arbetsdagar.",
    missedActions: ["Kvällsmedicin (2 dygn)", "Stegmål (3 dygn)"],
    aiRecommendation:
      "Lägg en återkommande påminnelse kl 21 och koppla dosen till en befintlig kvällsrutin.",
  },
  {
    id: "sara-holmqvist",
    name: "Sara Holmqvist",
    initials: "SH",
    age: 41,
    program: "Prevention",
    signal: "Stabil",
    adherence: 91,
    missedHighValue: "Följer planen fullt ut",
    lastCheckIn: "idag",
    suggestedAction: "Behåll nuvarande plan",
    weekAdherence: [88, 90, 92, 89, 94, 90, 91],
    friction: "Inga rapporterade hinder.",
    missedActions: ["Inga missade högvärdesåtgärder"],
    aiRecommendation:
      "Stabil följsamhet. Överväg att höja träningsintensiteten vid nästa uppföljning.",
  },
  {
    id: "anders-lund",
    name: "Anders Lund",
    initials: "AL",
    age: 59,
    program: "Hjärt-kärl",
    signal: "Stabil",
    adherence: 86,
    missedHighValue: "Stabil över tid",
    lastCheckIn: "idag",
    suggestedAction: "Behåll nuvarande plan",
    weekAdherence: [82, 84, 88, 85, 87, 86, 86],
    friction: "Inga rapporterade hinder.",
    missedActions: ["Inga missade högvärdesåtgärder"],
    aiRecommendation:
      "God och jämn följsamhet. Bibehåll plan och boka rutinuppföljning om 4 veckor.",
  },
]

export const kpis = [
  {
    label: "Aktiva patienter",
    value: "184",
    delta: "+6 denna vecka",
    trend: "up" as const,
    accent: "info" as const,
  },
  {
    label: "Behöver klinisk granskning",
    value: "12",
    delta: "+3 sedan igår",
    trend: "up" as const,
    accent: "coral" as const,
  },
  {
    label: "Genomsnittlig följsamhet",
    value: "78 %",
    delta: "+4 % mot förra veckan",
    trend: "up" as const,
    accent: "teal" as const,
  },
  {
    label: "Sparad läkartid",
    value: "14,5 h",
    delta: "denna vecka",
    trend: "flat" as const,
    accent: "amber" as const,
  },
]

export type GeneratedAction = {
  title: string
  cadence: string
  priority: "Hög" | "Medel" | "Låg"
}

export const generatedPlan: GeneratedAction[] = [
  { title: "Ta omega-3-tillskott", cadence: "Dagligen", priority: "Hög" },
  { title: "30 min zon 2-promenad", cadence: "5 ggr/vecka", priority: "Hög" },
  { title: "Logga blodtryck", cadence: "3 ggr/vecka", priority: "Medel" },
]

export const mobileActions = [
  { title: "Ta omega-3-tillskott", time: "Med frukosten", done: true },
  { title: "30 minuters zon 2-promenad", time: "Förmiddag", done: false },
  { title: "Logga blodtryck", time: "Före lunch", done: false },
]

export const aiSummaryText =
  "Patienten ligger på 42 % följsamhet de senaste 7 dagarna och missar framför allt rörelse och blodtrycksmätning. Mönstret tyder på tidsfriktion snarare än ovilja. Rekommenderad åtgärd är att förenkla rörelseplanen till kortare dagliga pass."

export const aiSummaryTags = ["Tidsfriktion", "Rörelse", "Blodtryck"]

export const exportSections = [
  {
    label: "Sammanfattning",
    body: "Alexandra Berg, 54 år. Följsamhet 42 % (7 dagar). Kritisk signal. Nedåtgående trend.",
  },
  {
    label: "Missade åtgärder",
    body: "Zon 2-promenad 4/5 pass, blodtrycksmätning 3/3 morgnar, omega-3 2 dygn.",
  },
  {
    label: "Föreslagen klinisk åtgärd",
    body: "Förenkla rörelseplanen till 15 min daglig zon 2-promenad i 7 dagar. Säkerställ blodtrycksmätning.",
  },
  {
    label: "Uppföljning",
    body: "Ny avstämning om 7 dagar. Eskalera vid fortsatt följsamhet under 50 %.",
  },
]
