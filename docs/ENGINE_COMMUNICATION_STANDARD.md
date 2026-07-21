# Engine Communication Constitution

This document defines the Engine Communication Layer for Law AI Academy Engine Renaissance.

Engine Communication is a **contract‑based metadata layer** that defines how engines communicate safely. It does NOT execute communication or replace EventBus.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Contract Based** | Communication is defined by explicit contracts between engines. |
| **Metadata Driven** | Communication definitions are read‑only metadata. |
| **Read Only** | Communication metadata is never modified at runtime. |
| **Non‑executing** | Communication layer never executes messages or controls engines. |
| **Non‑replacing** | Communication layer complements, never replaces, EventBus. |

---

## Communication Concepts

| Concept | Description |
|---------|-------------|
| **Request** | An engine requests data or action from another engine. |
| **Response** | An engine responds to a request. |
| **Message** | A communication packet between engines. |
| **Channel** | A logical communication path between engines. |
| **Permission** | Authorization to communicate. |
| **Dependency** | Communication implies dependency. |

---

## What Engine Communication MAY Do

- **Define** – Document communication contracts between engines
- **Register** – Record communication contracts
- **List** – Enumerate all defined contracts
- **Query** – Find contracts by source, target, or type
- **Validate** – Validate contract integrity and permissions
- **Report** – Generate communication health reports

---

## What Engine Communication MUST NOT Do

- ❌ Execute any communication logic
- ❌ Send or receive messages
- ❌ Replace or bypass EventBus
- ❌ Modify engine state
- ❌ Execute business logic
- ❌ Change runtime configuration

---

## Message Types

| Type | Description |
|------|-------------|
| `REQUEST` | Request for data or action |
| `RESPONSE` | Reply to a request |
| `NOTIFICATION` | One‑way event notification |
| `EVENT` | System event broadcast |
| `COMMAND` | Instruction to execute (metadata only) |
| `QUERY` | Data query (metadata only) |

---

## Communication Contract Schema

| Field | Description | Required |
|-------|-------------|----------|
| `sourceEngine` | Source engine identifier | Yes |
| `targetEngine` | Target engine identifier | Yes |
| `communicationType` | Type of communication | Yes |
| `messageType` | Type of message | Yes |
| `permission` | Required permission level | Recommended |
| `version` | Contract version | Yes |
| `status` | Active, Deprecated, Experimental | Yes |

---

## Permission Levels

| Level | Description |
|-------|-------------|
| `PUBLIC` | Open to all engines |
| `INTERNAL` | Limited to specific engines |
| `RESTRICTED` | Requires explicit permission |
| `PRIVATE` | Only for specific use cases |

---

## Validation

- Unknown source engine triggers warning
- Unknown target engine triggers warning
- Duplicate communication contract triggers warning
- Missing permission triggers warning
- Invalid message type triggers warning

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The Engine Communication Health module provides:

- Total contracts count
- Active vs. missing contracts
- Invalid contracts
- Coverage percentage
- Overall communication health

Developer only – not exposed to end users.

---

## Governance

Engine Communication is governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
