# Engine Signal Constitution

This document defines the Engine Runtime Signal Layer for Law AI Academy Engine Renaissance.

The Signal Layer defines runtime signals produced by engines. It does NOT execute engines, control engines, or replace analytics. It only describes runtime signals.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Observational** | Signals describe runtime events, they do not trigger them. |
| **Metadata Driven** | Signals are defined as metadata, not executable code. |
| **Non‑executing** | Signal definitions never execute engine logic. |
| **Non‑mutating** | Signals never modify engine state. |
| **Descriptive** | Signals only describe what engines might emit. |

---

## What Engine Signals MAY Do

- **Define** – Document runtime signals engines may emit
- **Register** – Record signal definitions
- **List** – Enumerate all defined signals
- **Query** – Find signals by type, severity, or source
- **Validate** – Validate signal integrity and completeness
- **Report** – Generate signal health reports

---

## What Engine Signals MUST NOT Do

- ❌ Execute any signal logic
- ❌ Emit or process actual signals
- ❌ Replace analytics systems
- ❌ Modify engine state
- ❌ Execute business logic
- ❌ Control engine behavior

---

## Signal Schema

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Unique signal identifier | Yes |
| `type` | Signal classification | Yes |
| `severity` | Importance level | Yes |
| `source` | Engine that emits the signal | Yes |
| `description` | Human‑readable description | Yes |
| `version` | Signal version | Yes |

---

## Signal Types

| Type | Description |
|------|-------------|
| `STATUS` | Engine status change signals |
| `HEALTH` | Health and wellness signals |
| `PERFORMANCE` | Performance metric signals |
| `LIFECYCLE` | Lifecycle phase signals |
| `COMMUNICATION` | Communication signals |
| `COORDINATION` | Coordination signals |
| `DISCOVERY` | Discovery signals |
| `EVENT` | General event signals |

---

## Severity Levels

| Level | Description |
|-------|-------------|
| `INFO` | Informational signal |
| `WARNING` | Warning condition |
| `ERROR` | Error condition |
| `CRITICAL` | Critical failure |
| `RECOVERED` | Recovery from error |

---

## Official Signals

| Signal Name | Type | Severity | Source | Description |
|-------------|------|----------|--------|-------------|
| `ENGINE_STARTED` | LIFECYCLE | INFO | Engine | Engine has started |
| `ENGINE_READY` | LIFECYCLE | INFO | Engine | Engine is ready |
| `ENGINE_IDLE` | STATUS | INFO | Engine | Engine is idle |
| `ENGINE_BUSY` | STATUS | INFO | Engine | Engine is busy |
| `ENGINE_WARNING` | HEALTH | WARNING | Engine | Engine issued warning |
| `ENGINE_ERROR` | HEALTH | ERROR | Engine | Engine encountered error |
| `ENGINE_RECOVERED` | HEALTH | RECOVERED | Engine | Engine recovered |
| `ENGINE_UPDATED` | LIFECYCLE | INFO | Engine | Engine updated |
| `ENGINE_DEPRECATED` | LIFECYCLE | WARNING | Engine | Engine deprecated |

---

## Validation

- Duplicate signal names trigger warnings
- Invalid signal type triggers warnings
- Invalid severity triggers warnings
- Missing description triggers warnings
- Unknown source triggers warnings

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The Engine Signal Health module provides:

- Total signals count
- Signal types distribution
- Severity distribution
- Missing metadata count
- Overall coverage

Developer only – not exposed to end users.

---

## Governance

Engine Signals are governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
