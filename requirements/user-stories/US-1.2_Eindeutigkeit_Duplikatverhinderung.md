---
type: user-story
id: US-1.2
status: draft
parent: SOL-1
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
last_evaluated: 2026-04-03T13:14:09.228Z
---

# US-1.2: Uniqueness / Duplicate Prevention

> **As a** platform operator **I want to** ensure that every real person has only one account **so that** fake profiles, multiple accounts, and manipulation are prevented.

## Acceptance Criteria

- [ ] AC-1.2.1: During ID upload, the system checks whether the ID data (hashed comparison) is already associated with an existing account.
- [ ] AC-1.2.2: On duplicate suspicion, registration is blocked and a support ticket is automatically created.
- [ ] AC-1.2.3: The user receives a clear error message when blocked.
- [ ] AC-1.2.4: ID data is stored exclusively as a hash — no plaintext storage of personal ID data.

## Components

- [CMP-1.2.1: Duplicate Detection Module](../components/CMP-1.2.1_Duplikat-Erkennungsmodul.md)