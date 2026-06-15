# `generate-care-plan`

Supabase Edge Function that turns a doctor's clinical note into structured patient actions for the Executive Health adherence MVP.

It uses GitHub Models through an OpenAI-compatible client:

- `baseURL`: `https://models.github.ai/inference`
- secret: `GITHUB_TOKEN`
- optional secret: `AI_MODEL`
- default model: `openai/gpt-4.1`

## Request

```json
{
  "note": "Patienten ska promenera zon 2 fem gånger i veckan...",
  "patient": {
    "name": "Oscar Nilsson",
    "program": "Kardiometabol",
    "goal": "Sänka ApoB och förbättra metabol hälsa",
    "riskArea": "Hjärt-kärlprevention"
  }
}
```

## Secrets

Local development can use `supabase/functions/.env`:

```bash
GITHUB_TOKEN=github_pat_...
AI_MODEL=openai/gpt-4.1
```

For hosted Supabase:

```bash
supabase secrets set GITHUB_TOKEN=github_pat_...
supabase secrets set AI_MODEL=openai/gpt-4.1
```

## Local Serve

```bash
supabase functions serve generate-care-plan --env-file supabase/functions/.env
```

## Deploy

```bash
supabase functions deploy generate-care-plan
```
