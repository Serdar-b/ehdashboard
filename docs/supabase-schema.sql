create table if not exists public.patients (
  id text primary key,
  name text not null,
  initials text,
  age integer,
  program text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null references public.patients(id) on delete cascade,
  doctor_id text,
  raw_note text not null,
  source text not null default 'dashboard_demo',
  created_at timestamptz not null default now()
);

create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null references public.patients(id) on delete cascade,
  doctor_note_id uuid references public.doctor_notes(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  sent_to_app_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.care_plan_actions (
  id uuid primary key default gen_random_uuid(),
  care_plan_id uuid not null references public.care_plans(id) on delete cascade,
  patient_id text not null references public.patients(id) on delete cascade,
  doctor_note_id uuid references public.doctor_notes(id) on delete set null,
  title text not null,
  cadence text not null,
  priority text not null check (priority in ('Hög', 'Medel', 'Låg')),
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null references public.patients(id) on delete cascade,
  action_id uuid not null references public.care_plan_actions(id) on delete cascade,
  completed boolean not null default false,
  value text,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_summaries (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null references public.patients(id) on delete cascade,
  summary text not null,
  missed_actions text[] not null default '{}',
  recommended_action text not null,
  signal text not null check (signal in ('Stabil', 'Bevaka', 'Kritisk')),
  consistency_index integer not null check (
    consistency_index >= 0 and consistency_index <= 100
  ),
  ehr_export_text text,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;
alter table public.doctor_notes enable row level security;
alter table public.care_plans enable row level security;
alter table public.care_plan_actions enable row level security;
alter table public.check_ins enable row level security;
alter table public.clinical_summaries enable row level security;

create policy "demo read patients"
  on public.patients for select
  using (true);

create policy "demo insert patients"
  on public.patients for insert
  with check (true);

create policy "demo update patients"
  on public.patients for update
  using (true)
  with check (true);

create policy "demo read doctor notes"
  on public.doctor_notes for select
  using (true);

create policy "demo insert doctor notes"
  on public.doctor_notes for insert
  with check (true);

create policy "demo read care plans"
  on public.care_plans for select
  using (true);

create policy "demo insert care plans"
  on public.care_plans for insert
  with check (true);

create policy "demo read care plan actions"
  on public.care_plan_actions for select
  using (true);

create policy "demo insert care plan actions"
  on public.care_plan_actions for insert
  with check (true);

create policy "demo read check ins"
  on public.check_ins for select
  using (true);

create policy "demo insert check ins"
  on public.check_ins for insert
  with check (true);

create policy "demo update check ins"
  on public.check_ins for update
  using (true)
  with check (true);

create policy "demo read clinical summaries"
  on public.clinical_summaries for select
  using (true);

create policy "demo insert clinical summaries"
  on public.clinical_summaries for insert
  with check (true);
