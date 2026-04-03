---
type: component
id: CMP-7.1.2
status: draft
parent: US-7.1
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
last_evaluated: 2026-04-03T13:14:09.337Z
---

# CMP-7.1.2: Security Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-7.1.2.1** | The system shall provide two-factor authentication (2FA) and enforce it for sensitive actions (profile changes, account deletion, payments). |
| **FN-7.1.2.2** | The system shall implement anomaly detection: suspicious login attempts, brute-force attacks, unusual location changes, and bot behavior are detected and blocked. |
| **FN-7.1.2.3** | The system shall traceably log all security-relevant system actions (audit trail) for internal and external audits. |
| **FN-7.1.2.4** | The system shall provide a reporting system for abuse and fake profiles; reports are forwarded to a moderation team and processed within a defined SLA. (-> User UI for report function see SOL-5, FN-5.1.2.2) |

## Function Files

- FN-7.1.2.1: Two-Factor Authentication
- FN-7.1.2.2: Anomaly Detection
- FN-7.1.2.3: Security Audit Trail
- FN-7.1.2.4: Abuse and Fake Profile Reporting