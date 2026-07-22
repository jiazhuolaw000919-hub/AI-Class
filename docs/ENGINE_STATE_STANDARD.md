# Engine State Constitution

This document defines the Engine State Governance Layer for Law AI Academy Engine Renaissance.

Engine State Governance standardizes the official states that engines can be in throughout their lifecycle.

---

## Official Engine States

| State | Description | Category |
|-------|-------------|----------|
| `UNREGISTERED` | Engine not yet registered with the system | Initial |
| `REGISTERED` | Engine registered but not initialized | Initial |
| `INITIALIZING` | Engine is initializing its components | Transition |
| `READY` | Engine initialized and ready to activate | Ready |
| `ACTIVE` | Engine actively processing | Active |
| `IDLE` | Engine active but not processing | Active |
| `SLEEP` | Engine in low‑power/idle state | Active |
| `PAUSED` | Engine temporarily paused | Active |
| `WAITING` | Engine waiting for resources/dependencies | Active |
| `UPDATING` | Engine is updating configuration | Transition |
| `ERROR` | Engine encountered recoverable error | Error |
| `FAILED` | Engine encountered fatal error | Error |
| `DISABLED` | Engine manually disabled | Terminal |
| `DEPRECATED` | Engine deprecated, pending removal | Terminal |
| `DESTROYED` | Engine destroyed and cleaned up | Terminal |

---

## State Categories

| Category | States |
|----------|--------|
| **Initial** | UNREGISTERED, REGISTERED |
| **Transition** | INITIALIZING, UPDATING |
| **Ready** | READY |
| **Active** | ACTIVE, IDLE, SLEEP, PAUSED, WAITING |
| **Error** | ERROR, FAILED |
| **Terminal** | DISABLED, DEPRECATED, DESTROYED |

---

## State Lifecycle

UNREGISTERED → REGISTERED → INITIALIZING → READY → ACTIVE
↓ ↓ ↓
ERROR ←─────────────── IDLE ←───┘
↓ ↓
FAILED SLEEP
↓ ↓
DESTROYED PAUSED
↓ ↓
DISABLED WAITING
↓ ↓
DEPRECATED UPDATING
↓
READY

---

## State Transition Rules

| From | To | Condition |
|------|-----|-----------|
| UNREGISTERED | REGISTERED | Engine registered |
| REGISTERED | INITIALIZING | Initialization started |
| INITIALIZING | READY | Initialization complete |
| READY | ACTIVE | Activation requested |
| ACTIVE | IDLE | No processing needed |
| IDLE | ACTIVE | New task available |
| ACTIVE | SLEEP | Idle timeout |
| SLEEP | ACTIVE | Wake event |
| ACTIVE | PAUSED | Manual pause |
| PAUSED | ACTIVE | Resume request |
| ACTIVE | WAITING | Resource blocked |
| WAITING | ACTIVE | Resource available |
| READY/ACTIVE | UPDATING | Update requested |
| UPDATING | READY | Update complete |
| Any | ERROR | Recoverable error |
| Any | FAILED | Fatal error |
| Any | DISABLED | Manual disable |
| Any | DEPRECATED | Deprecation policy |
| Any | DESTROYED | Engine destroyed |

---

## Validation Rules

- Unknown states trigger warnings
- Duplicate states trigger warnings
- Illegal transitions trigger warnings
- Reserved states trigger warnings

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The Engine State Health module provides:

- Healthy states distribution
- Inactive states count
- Error states count
- State coverage

Developer only – not exposed to end users.

---

## Governance

Engine State Governance is governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
