---
type: component
id: CMP-11.1.1
status: draft
parent: US-11.1
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
last_evaluated: 2026-04-03T13:14:09.167Z
---

# CMP-11.1.1: Proposal Quota Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-11.1.1.1** | The system shall limit the number of new match proposals per time period (configurable at system level, e.g. 3-5 per day); proposals are released at defined time points. |
| **FN-11.1.1.2** | The system shall present match proposals individually — no swipe mode, no endless scrolling, no gallery; each proposal receives full attention. |
| **FN-11.1.1.3** | The system shall provide premium users with an extended quota of match proposals per time period (configurable, e.g. 2x the basic quota). |
| **FN-11.1.1.4** | The system shall display a waiting time indicator when the quota is exhausted, transparently communicating the time of the next proposal cycle. |

## Function Files

- FN-11.1.1.1: Daily Proposal Limit
- FN-11.1.1.2: Individual Proposal Presentation
- FN-11.1.1.3: Premium Extended Quota
- FN-11.1.1.4: Quota Exhaustion Indicator