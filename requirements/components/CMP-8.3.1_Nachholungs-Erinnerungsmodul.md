---
type: component
id: CMP-8.3.1
status: draft
parent: US-8.3
version: 1.0
confidence: 90
confidence_details:
  structural: 100
  semantic: 100
  consistency: 100
  boundary: 50
structural: 100
semantic: 100
consistency: 100
boundary: 50
last_evaluated: 2026-04-03T13:14:09.358Z
---

# CMP-8.3.1: Completion Reminder Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-8.3.1.1** | The system shall display an "Improvement Potential" overview in the dashboard listing all unfilled optional fields — with estimated impact on match quality (e.g. "+8% match accuracy"). (-> Improvement suggestions based on SOL-3, FN-3.2.1.2; score calculation from SOL-2, FN-2.4.1.2) |
| **FN-8.3.1.2** | The system shall send periodic reminders (push notification / email) pointing to specific open fields — maximum once per week, can be turned off by the user. |
| **FN-8.3.1.3** | The system shall provide a quick-fill mode in which individual open fields can be filled directly — without restarting the entire onboarding assistant. |

## Function Files

- FN-8.3.1.1: Improvement Potential Dashboard
- FN-8.3.1.2: Periodic Field Reminders
- FN-8.3.1.3: Quick-Fill Mode