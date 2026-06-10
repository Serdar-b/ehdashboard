# MVP Data Model

This is the smallest Supabase shape needed to make the demo real without building the full clinical system.

## Tables

### patients

- `id`
- `name`
- `age`
- `program`
- `risk_level`
- `adherence_percent`
- `last_check_in_at`

### doctor_notes

- `id`
- `patient_id`
- `doctor_id`
- `raw_note`
- `created_at`

### generated_actions

- `id`
- `patient_id`
- `doctor_note_id`
- `title`
- `cadence`
- `priority`
- `status`
- `sent_to_app_at`

### check_ins

- `id`
- `patient_id`
- `action_id`
- `value`
- `completed`
- `created_at`

### clinical_summaries

- `id`
- `patient_id`
- `summary`
- `missed_actions`
- `recommended_action`
- `ehr_export_text`
- `created_at`

## Demo Loop

1. Doctor writes a note in the dashboard.
2. AI creates structured daily actions.
3. Doctor reviews and sends the plan to the patient app.
4. Patient checks off actions in the mobile app.
5. AI summarizes adherence, risk, and the recommended next clinical action.
6. Doctor copies/export the structured summary into the journal system.
