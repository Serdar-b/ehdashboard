-- Drop the old Swedish constraint first
alter table public.care_plan_actions
  drop constraint care_plan_actions_priority_check;

-- Update existing priority values from Swedish to English
update public.care_plan_actions set priority = 'High' where priority = 'Hög';
update public.care_plan_actions set priority = 'Medium' where priority = 'Medel';
update public.care_plan_actions set priority = 'Low' where priority = 'Låg';

-- Re-add constraint with English values
alter table public.care_plan_actions
  add constraint care_plan_actions_priority_check
  check (priority = any (array['High'::text, 'Medium'::text, 'Low'::text]));
