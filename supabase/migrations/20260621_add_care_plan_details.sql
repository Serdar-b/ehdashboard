alter table public.care_plans
  add column if not exists goal text,
  add column if not exists risk_area text,
  add column if not exists duration_weeks integer,
  add column if not exists summary text;

alter table public.care_plan_actions
  add column if not exists category text,
  add column if not exists estimated_minutes integer,
  add column if not exists clinical_weight integer,
  add column if not exists patient_reason text,
  add column if not exists verification_method text;
