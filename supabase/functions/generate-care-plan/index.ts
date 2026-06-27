import OpenAI from "https://esm.sh/openai@4.26.0";

type ActionCategory = "movement" | "nutrition" | "medication" | "measurement" | "check-in";
type Priority = "High" | "Medium" | "Low";

type GeneratedAction = {
  title: string;
  cadence: string;
  priority: Priority;
  category: ActionCategory;
  estimatedMinutes: number;
  clinicalWeight: number;
  patientReason: string;
  verificationMethod: string;
};

type GenerateCarePlanRequest = {
  note: string;
  patient?: {
    name?: string;
    program?: string;
    goal?: string;
    riskArea?: string;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const categories = new Set<ActionCategory>([
  "movement",
  "nutrition",
  "medication",
  "measurement",
  "check-in",
]);
const priorities = new Set<Priority>(["High", "Medium", "Low"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.round(numeric), min), max);
}

function safeString(value: unknown, fallback: string, maxLength = 180) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : fallback;
}

function normalizeAction(value: unknown): GeneratedAction | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const title = safeString(row.title, "", 70);
  if (!title) return null;

  const category = typeof row.category === "string" && categories.has(row.category as ActionCategory)
    ? (row.category as ActionCategory)
    : "check-in";
  const priority = typeof row.priority === "string" && priorities.has(row.priority as Priority)
    ? (row.priority as Priority)
    : "Medium";

  return {
    title,
    cadence: safeString(row.cadence, "Daily", 40),
    priority,
    category,
    estimatedMinutes: clampNumber(row.estimatedMinutes, 3, 1, 180),
    clinicalWeight: clampNumber(row.clinicalWeight, 20, 1, 100),
    patientReason: safeString(
      row.patientReason,
      "Links the doctor's recommendation to a concrete daily action.",
      220,
    ),
    verificationMethod: safeString(row.verificationMethod, "Patient confirmation", 80),
  };
}

function stripJsonFences(raw: string) {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function normalizeAiResponse(value: unknown, request: GenerateCarePlanRequest) {
  if (!value || typeof value !== "object") {
    throw new Error("AI response was not a JSON object.");
  }

  const parsed = value as Record<string, unknown>;
  const actions = Array.isArray(parsed.actions)
    ? parsed.actions.map(normalizeAction).filter((action): action is GeneratedAction => Boolean(action))
    : [];

  if (actions.length === 0) {
    throw new Error("AI response did not include any usable actions.");
  }

  return {
    plan: {
      title: safeString(parsed.title, `${request.patient?.program ?? "Clinical"} - daily plan`, 90),
      goal: safeString(parsed.goal, request.patient?.goal ?? "Increase continuity with the doctor's plan.", 180),
      riskArea: safeString(parsed.riskArea, request.patient?.riskArea ?? "Preventive follow-up", 90),
      durationWeeks: clampNumber(parsed.durationWeeks, 12, 1, 52),
      summary: safeString(
        parsed.summary,
        "The clinical note has been structured into daily patient actions.",
        300,
      ),
      actions,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as Partial<GenerateCarePlanRequest>;
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length < 12) return jsonResponse({ error: "Missing or too short field: note" }, 400);

    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) return jsonResponse({ error: "Missing GITHUB_TOKEN secret for GitHub Models." }, 500);

    const openai = new OpenAI({
      baseURL: "https://models.github.ai/inference",
      apiKey: token,
    });
    const model = Deno.env.get("AI_MODEL") ?? "openai/gpt-4.1";

    const systemPrompt = `
You are the Protocol to Adherence Engine.
Return strict JSON only. No markdown, no comments, no extra text.

Transform a clinical note into practical patient actions for a premium preventive-health app.
Rules:
- Write patient-facing text in English.
- Keep actions concrete and doable today.
- Prefer continuity over perfection.
- Do not give diagnosis or emergency advice.
- Create the actions needed to represent the clinician's note accurately.
- priority must be one of: "High", "Medium", "Low".
- category must be one of: "movement", "nutrition", "medication", "measurement", "check-in".
- estimatedMinutes must be a positive integer.
- clinicalWeight must be 1-100, where high-value clinical actions are 25-40.

Return exactly this JSON shape. The example values show allowed formats:
{
  "title": "Cardiometabolic - daily plan",
  "goal": "Lower ApoB and improve metabolic health",
  "riskArea": "Cardiovascular prevention",
  "durationWeeks": 12,
  "summary": "The plan focuses on movement, supplements, and blood pressure follow-up.",
  "actions": [
    {
      "title": "30 min zone 2 walk",
      "cadence": "5x/week",
      "priority": "High",
      "category": "movement",
      "estimatedMinutes": 30,
      "clinicalWeight": 30,
      "patientReason": "Supports the cardiovascular plan with low recovery cost.",
      "verificationMethod": "Patient confirmation"
    }
  ]
}`;

    const userPrompt = `
Patient: ${body.patient?.name ?? "the patient"}
Program: ${body.patient?.program ?? "Preventive health"}
Known goal: ${body.patient?.goal ?? "not provided"}
Known risk area: ${body.patient?.riskArea ?? "not provided"}

Clinical note:
${note}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 900,
    });

    const raw = stripJsonFences(completion.choices[0]?.message?.content ?? "");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("generate-care-plan JSON parse failed:", raw);
      return jsonResponse({ error: "Failed to parse AI response as JSON", raw }, 502);
    }

    return jsonResponse(normalizeAiResponse(parsed, { note, patient: body.patient }));
  } catch (error) {
    console.error("generate-care-plan error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown generate-care-plan error" }, 500);
  }
});
