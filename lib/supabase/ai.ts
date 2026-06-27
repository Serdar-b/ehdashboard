import type { GeneratedPlan, Patient } from "@/lib/clinic-data"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type GenerateCarePlanResponse = {
  plan: GeneratedPlan
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback =
    error instanceof Error
      ? error.message
      : "The AI function returned an unknown error."
  const context = (error as { context?: Response } | null)?.context

  if (!context) {
    return fallback
  }

  const text = await context.text().catch(() => "")

  if (!text) {
    return fallback
  }

  try {
    const parsed = JSON.parse(text) as {
      error?: string
      raw?: string
      message?: string
    }
    return parsed.error ?? parsed.message ?? parsed.raw ?? text
  } catch {
    return text
  }
}

export async function generateCarePlanWithAi({
  note,
  patient,
}: {
  note: string
  patient: Patient
}) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.functions.invoke<GenerateCarePlanResponse>(
    "generate-care-plan",
    {
      body: {
        note,
        patient: {
          name: patient.name,
          program: patient.program,
          riskArea: patient.program,
        },
      },
    },
  )

  if (error) {
    throw new Error(await getFunctionErrorMessage(error))
  }

  if (!data?.plan?.actions?.length) {
    throw new Error("The AI function returned no actions.")
  }

  return data.plan
}
