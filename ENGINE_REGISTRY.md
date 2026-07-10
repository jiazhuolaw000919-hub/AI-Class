# ENGINE REGISTRY
# LAW AI ACADEMY OFFICIAL CANON
# VERSION 1.0
# STATUS: CANONICAL

---

## OVERVIEW

This document is the official registry of all engines in LAW AI Academy.

Every engine must be listed here.

No engine may exist outside this registry.

---

## ENGINE LIST

| # | Engine Name | Layer | Domain | Status | Version |
|---|-------------|-------|--------|--------|---------|
| 1 | `StorageEngine` | Infrastructure | Persistent Storage | 🟢 Canon Locked | 1.0.0 |
| 2 | `EventBus` | Infrastructure | Event Communication | 🟢 Canon Locked | 2.0.0 |
| 3 | `ProgressEngine` | Core Logic | Learning Progress | 🟢 Canon Locked | 2.0.0 |
| 4 | `LessonEngine` | Data Layer | Lesson Data Management | 🟢 Canon Locked | 1.0.0 |
| 5 | `SystemComposer` | UI Layer | System Composition | 🟡 Needs Verification | 5.0.0 |
| 6 | `Router` | System | Navigation | ⚫ Not an Engine | N/A |

---

## ENGINE DETAILS

### 1. StorageEngine

| Property | Value |
|----------|-------|
| **Layer** | Infrastructure |
| **Domain** | Persistent Storage Abstraction |
| **Status** | 🟢 Canon Locked |
| **Version** | 1.0.0 |
| **Dependencies** | None |
| **Storage** | localStorage (prefix: 'lawai_') |
| **Events Emitted** | None |
| **Events Consumed** | None |

---

### 2. EventBus

| Property | Value |
|----------|-------|
| **Layer** | Infrastructure |
| **Domain** | Event Communication & Pub/Sub |
| **Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |
| **Dependencies** | None |
| **Storage** | None (in-memory) |
| **Events Emitted** | None (passive) |
| **Events Consumed** | All (via on/onWildcard) |

---

### 3. ProgressEngine

| Property | Value |
|----------|-------|
| **Layer** | Core Logic |
| **Domain** | Learning Progress Tracking |
| **Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |
| **Dependencies** | StorageEngine, EventBus |
| **Storage** | Key: 'progress' |
| **Events Emitted** | `LessonCompleted`, `ProgressUpdated` |
| **Events Consumed** | None |

---

### 4. LessonEngine

| Property | Value |
|----------|-------|
| **Layer** | Data Layer |
| **Domain** | Lesson Data Management |
| **Status** | 🟢 Canon Locked |
| **Version** | 1.0.0 |
| **Dependencies** | StorageEngine (optional) |
| **Storage** | Key: 'allLessons' |
| **Events Emitted** | None |
| **Events Consumed** | None |

---

### 5. SystemComposer

| Property | Value |
|----------|-------|
| **Layer** | UI Layer |
| **Domain** | System Composition |
| **Status** | 🟡 Needs Verification |
| **Version** | 5.0.0 |
| **Dependencies** | StorageEngine, EventBus, ProgressEngine |
| **Storage** | None (renders UI) |
| **Events Emitted** | `COMPOSER_MOUNTED` |
| **Events Consumed** | `SYSTEM_READY`, `PROFILE_UPDATED` |

---

### 6. Router (Non-Engine)

| Property | Value |
|----------|-------|
| **Type** | System Component |
| **Layer** | System |
| **Domain** | Navigation |
| **Status** | ⚫ Not an Engine |
| **Version** | 4.6.0 |
| **Dependencies** | None |
| **Storage** | None |
| **Events Emitted** | `RouteChanged` |
| **Events Consumed** | None |

---

## EVENT REGISTRY

| Event Name | Emitter | Consumers | Payload |
|------------|---------|-----------|---------|
| `SYSTEM_READY` | Loader / App | SystemComposer | `{ boot, timestamp }` |
| `COMPOSER_MOUNTED` | SystemComposer | App | `{ version, initialized, root }` |
| `LessonCompleted` | ProgressEngine | UI | `{ lessonId, xpGain }` |
| `ProgressUpdated` | ProgressEngine | UI | `{ lessonId, progress }` |
| `RouteChanged` | Router | UI | `{ page, params }` |
| `PROFILE_UPDATED` | ProfileEngine | SystemComposer | `{ profile }` |
| `LEARNING_UI_REFRESH` | SystemComposer | Learning Panel | `{}` |
| `RUNTIME_READY` | SystemComposer | Panels | `{}` |
| `WORKSPACE_UPDATED` | WorkspaceEngine | SystemComposer | `{}` |

---

## STORAGE REGISTRY

| Key | Owner | Format | Description |
|-----|-------|--------|-------------|
| `lawai_progress` | ProgressEngine | JSON | User progress data |
| `lawai_allLessons` | LessonEngine | JSON | 365 lesson objects |
| `lawai_*` | StorageEngine | JSON | Generic prefixed keys |

---

## RECOVERY STATUS LEGEND

| Icon | Meaning |
|------|---------|
| 🟢 | **Canon Locked** — Fully verified, no structural changes allowed |
| 🟡 | **Needs Verification** — Exists, requires comparison with Canon |
| 🔴 | **Missing** — Engine absent, requires reconstruction |
| ⚫ | **Deprecated** — Historical, no longer active |
| ⚪ | **Not an Engine** — System component, not an engine |

---

## CHANGE LOG

| Date | Version | Changes |
|------|---------|---------|
| 2026-07-10 | 1.0 | Initial registry created during Phase 2 Recovery |

---

## OFFICIAL STATUS

This registry is canonical.

All future engines must be registered here.

All engine modifications must update this registry.

The registry is the source of truth for engine architecture.

---

*End of ENGINE REGISTRY*
