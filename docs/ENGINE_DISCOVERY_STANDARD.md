# Engine Discovery Constitution

This document defines the Engine Discovery Layer for Law AI Academy Engine Renaissance.

Engine Discovery is a **read‑only metadata layer** that helps developers understand what engines exist and what they provide. It never executes or modifies engines.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Read Only** | Discovery only reads metadata, never writes or modifies. |
| **Metadata Driven** | Discovery operates entirely on engine metadata, not runtime state. |
| **Non‑executing** | Discovery never instantiates or executes any engine. |
| **Non‑modifying** | Discovery never changes runtime or engine state. |
| **Descriptive** | Discovery only describes engines, never controls them. |

---

## What Engine Discovery MAY Do

- **List** – Enumerate all registered engines
- **Find** – Locate engines by name
- **Query by Domain** – Find engines in a specific domain
- **Query by Category** – Find engines in a specific category
- **Query by Capability** – Find engines that provide a specific capability
- **Search** – Full‑text search across engine metadata
- **Count** – Provide engine statistics

---

## What Engine Discovery MUST NOT Do

- ❌ Instantiate any engine
- ❌ Execute any engine logic
- ❌ Modify engine state
- ❌ Change runtime configuration
- ❌ Replace Registry functionality
- ❌ Execute business logic
- ❌ Modify metadata

---

## Engine Metadata Schema

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Unique engine identifier | Yes |
| `domain` | Primary domain (Core, Business, Support, Experimental) | Yes |
| `category` | Functional category | Yes |
| `version` | Semantic version string | Yes |
| `description` | Human‑readable description | Yes |
| `owner` | Responsible team or individual | Recommended |
| `status` | Active, Deprecated, Experimental | Yes |
| `capabilities` | Array of provided capabilities | Recommended |
| `dependencies` | Array of engine dependencies | Recommended |

---

## Domain Values

| Domain | Description |
|--------|-------------|
| `Core` | Essential system engines |
| `Business` | Domain‑specific business logic |
| `Support` | Auxiliary and helper engines |
| `Experimental` | Development and prototype engines |

---

## Category Values

| Category | Description |
|----------|-------------|
| `Learning` | Learning and education engines |
| `Memory` | Memory and knowledge storage |
| `Practice` | Practice and exercise engines |
| `Goal` | Goal tracking and planning |
| `Analytics` | Data analysis and reporting |
| `Governance` | Governance and compliance |
| `UI` | User interface components |
| `Integration` | External system integration |
| `Utility` | Helper and utility engines |

---

## Validation

- Duplicate engine names trigger warnings
- Missing descriptions trigger warnings
- Unknown domain values trigger warnings
- Unknown category values trigger warnings
- Missing capabilities trigger warnings

All validation is **warnings only**. Boot sequence is never blocked.

---

## Health Reporting

The Engine Discovery Health module provides:

- Discovery coverage percentage
- Missing metadata count
- Engine category distribution
- Domain distribution
- Capability coverage

Developer only – not exposed to end users.

---

## Governance

Engine Discovery is governed by the same constitutional principles as the broader Engine Renaissance:

- All modules in `js/core/` are read‑only
- No business engine modification
- No new registries or event buses
- No ES Module migration
- No duplication of existing systems

This document is read‑only and should never be modified at runtime.
