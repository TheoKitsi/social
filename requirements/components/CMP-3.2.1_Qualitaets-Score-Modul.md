---
type: component
id: CMP-3.2.1
status: draft
parent: US-3.2
version: 1.0
confidence: 84
confidence_details:
  structural: 100
  semantic: 100
  consistency: 100
  boundary: 20
structural: 100
semantic: 100
consistency: 100
boundary: 20
last_evaluated: 2026-04-03T13:14:09.287Z
---

# CMP-3.2.1: Quality Score Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-3.2.1.1** | The system shall calculate a profile quality score that considers profile completeness (filled mandatory and optional fields), funnel depth (reached levels), and free-text quality. (Same score as SOL-2, FN-2.4.1.2; here the matching impact.) |
| **FN-3.2.1.2** | The system shall give the user specific improvement hints (e.g., "Fill Level 4 for approx. +15% match quality", "Add your hobbies for more accurate proposals"). (Dashboard display see SOL-8, FN-8.3.1.1) |
| **FN-3.2.1.3** | The system shall give preferential treatment to profiles with higher quality scores in the matching algorithm (higher visibility / prioritization with otherwise equal match scores). |

## Function Files

- FN-3.2.1.1: Quality Score Calculation (Matching Impact)
- FN-3.2.1.2: Improvement Hints
- FN-3.2.1.3: Quality-Based Prioritization