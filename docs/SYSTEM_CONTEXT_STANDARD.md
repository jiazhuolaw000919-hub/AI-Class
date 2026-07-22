# System Context Constitution

This document defines the System Context Layer for Law AI Academy Engine Renaissance.

System Context defines and tracks the various contexts that exist within the operating system. Contexts describe the environment, scope, and boundaries within which engines and components operate.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Observational** | Contexts are observed and tracked, never modified. |
| **Read Only** | Context definitions are read‑only metadata. |
| **Non‑invasive** | Context collection never modifies system state. |
| **Descriptive** | Contexts describe the operating environment. |
| **Read Only** | Contexts are for observation only. |

---

## Official System Contexts

| Context | Description | Ownership |
|---------|-------------|-----------|
| `USER_CONTEXT` | Current user identity and preferences | User |
| `SESSION_CONTEXT` | Active session state and metadata | Session |
| `LEARNING_CONTEXT` | Current learning path and progress | Learning |
| `RUNTIME_CONTEXT` | Runtime environment and configuration | Runtime |
| `PROJECT_CONTEXT` | Active project and workspace | Project |
| `GOAL_CONTEXT` | Current goals and objectives | Goal |
| `DEVICE_CONTEXT` | Device capabilities and constraints | Device |

---

## Context Categories

| Category | Contexts |
|----------|----------|
| **Identity** | USER_CONTEXT, SESSION_CONTEXT |
| **Environment** | RUNTIME_CONTEXT, DEVICE_CONTEXT |
| **Activity** | LEARNING_CONTEXT, PROJECT_CONTEXT |
| **Direction** | GOAL_CONTEXT |

---

## What System Context MAY Do

- **Define** – Define official system contexts
- **Collect** – Collect current context information
- **Observe** – Observe context state and changes
- **Validate** – Validate context definitions
- **Report** – Generate context health reports

---

## What System Context MUST NOT Do

- ❌ Modify context data
- ❌ Execute business logic
- ❌ Control engines based on context
- ❌ Create new registries
- ❌ Replace existing systems

---

## Validation Rules

- Unknown contexts trigger warnings
- Duplicate contexts trigger warnings
- Missing context definitions trigger warnings
- Invalid context owners trigger warnings

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The System Context Health module provides:

- Total contexts
- Healthy contexts
- Unknown contexts
- Coverage percentage

Developer only – not exposed to end users.

---

## Governance

System Context is governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
