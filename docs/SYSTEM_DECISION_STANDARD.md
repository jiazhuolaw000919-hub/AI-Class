# System Decision Constitution

This document defines the System Decision Layer for Law AI Academy Engine Renaissance.

System Decision generates rule-based decisions from existing system observations. Decisions are derived from validated observations. No prediction, no autonomous actions, no self-repair.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Rule-Based** | Decisions are generated from predefined rules. |
| **Observation-Derived** | Decisions use existing system observations only. |
| **Read Only** | Decisions are for observation and reporting only. |
| **Non-predictive** | Decisions do not predict future states. |
| **Non-autonomous** | Decisions do not execute actions automatically. |
| **Non-repairing** | Decisions do not attempt self-repair. |

---

## What System Decision MAY Do

- **Generate** – Generate rule-based decisions from observations
- **Recommend** – Provide recommendations for system actions
- **Report** – Generate decision reports
- **Validate** – Validate decision integrity
- **Aggregate** – Aggregate decisions from multiple sources

---

## What System Decision MUST NOT Do

- ❌ Predict future states
- ❌ Execute autonomous actions
- ❌ Perform self-repair
- ❌ Modify system state
- ❌ Execute business logic
- ❌ Control runtime behavior
- ❌ Create new data stores

---

## Decision Categories

| Category | Description |
|----------|-------------|
| **Runtime** | Decisions about runtime state |
| **Architecture** | Decisions about architecture |
| **Governance** | Decisions about governance |
| **Recovery** | Recovery recommendations |
| **Health** | Health-related decisions |
| **Memory** | Memory management decisions |
| **Reflection** | Reflection-based decisions |
| **Version** | Version-related decisions |

---

## Decision Types

| Type | Description |
|------|-------------|
| `RECOMMEND_RECOVERY` | Recommend recovery action |
| `RECOMMEND_CLEANUP` | Recommend system cleanup |
| `RECOMMEND_HEALTH_SCAN` | Recommend health scan |
| `RECOMMEND_REGISTRY_REVIEW` | Recommend registry review |
| `RECOMMEND_DEPENDENCY_REVIEW` | Recommend dependency review |
| `RECOMMEND_RUNTIME_REFRESH` | Recommend runtime refresh |
| `RECOMMEND_ARCHITECTURE_REVIEW` | Recommend architecture review |
| `RECOMMEND_GOVERNANCE_REVIEW` | Recommend governance review |

---

## Decision Rules

| Rule | Condition | Decision |
|------|-----------|----------|
| `HEALTH_LOW` | Health score < 60 | Recommend health scan |
| `RECOVERY_NEEDED` | Recovery score < 50 | Recommend recovery |
| `MEMORY_HIGH` | Memory entries > 800 | Recommend cleanup |
| `REGISTRY_DEPRECATED` | Deprecated engines > 10% | Recommend registry review |
| `DEPENDENCY_CIRCULAR` | Circular dependencies > 3 | Recommend dependency review |
| `RUNTIME_ERROR` | Runtime errors > 5 | Recommend runtime refresh |
| `ARCHITECTURE_VIOLATION` | Architecture violations > 5 | Recommend architecture review |
| `GOVERNANCE_WARNING` | Governance warnings > 10 | Recommend governance review |

---

## Validation Rules

- Unknown decision types trigger warnings
- Duplicate decisions trigger warnings
- Invalid rules trigger warnings
- Conflicting recommendations trigger warnings

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The System Decision Health module provides:

- Decision coverage
- Decision consistency
- Rule availability
- Recommendation quality

Developer only – not exposed to end users.

---

## Governance

System Decision is governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
