# =================================================================================================
# LAW AI ACADEMY
# OFFICIAL ENGINE REGISTRY
# VOLUME IV
# VERSION 1.0
# STATUS: CANONICAL
# PRIORITY: ABSOLUTE
# =================================================================================================

====================================================
PURPOSE
====================================================

The Official Engine Registry is the master inventory of LAW AI Academy.

Every engine must appear in this registry.

If an engine is not registered,

it is not considered part of the official architecture.

The registry is the single source of truth for all engines.

====================================================
REGISTRY SUMMARY
====================================================

| Engine ID | Engine Name | Layer | Status | Version |
|-----------|-------------|-------|--------|---------|
| ENG-001 | StorageEngine | Infrastructure | 🟢 Canon Locked | 1.0.0 |
| ENG-002 | EventBus | Infrastructure | 🟢 Canon Locked | 2.0.0 |
| ENG-003 | ProgressEngine | Core Logic | 🟢 Canon Locked | 2.0.0 |
| ENG-004 | LessonEngine | Data Layer | 🟢 Canon Locked | 1.0.0 |
| ENG-005 | SystemComposer | UI Layer | 🟢 Canon Locked | 5.0.1 |

**Total Registered Engines:** 5

**Status Breakdown:**
- 🟢 Canon Locked: 5
- 🟡 Verification Required: 0
- 🔴 Missing: 0
- ⚫ Deprecated: 0

====================================================
ENGINE REGISTRATION DETAILS
====================================================

---

## ENG-001: StorageEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-001 |
| **Engine Name** | StorageEngine |
| **Architecture Layer** | Infrastructure Layer |
| **Purpose** | Provides a unified abstraction layer for persistent storage. Currently uses localStorage, designed for future migration to Supabase, IndexedDB, or cloud storage. |
| **Owner Domain** | Persistent Storage Abstraction |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 1.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `get(key, defaultValue)` | Retrieve a value from storage | any |
| `set(key, value)` | Store a value in storage | boolean |
| `remove(key)` | Remove a value from storage | void |
| `getAllKeys()` | Get all keys with prefix | array |
| `getStatus()` | Get engine status | Status object |

### Canonical Storage

| Key Pattern | Format | Description |
|-------------|--------|-------------|
| `lawai_*` | JSON | All keys are prefixed with 'lawai_' to avoid collisions |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| None | - | Standalone engine, no dependencies |

### Consumers

| Consumer | Layer | Description |
|----------|-------|-------------|
| ProgressEngine | Core Logic | Reads/writes progress data |
| LessonEngine | Data Layer | Reads/writes lesson data |
| SystemComposer | UI Layer | Reads UI state |
| Future Engines | All | Any engine needing persistence |

### Canonical Events

| Event | Type | Payload | Description |
|-------|------|---------|-------------|
| None | - | - | Passive engine, no events emitted |

### Future Extension

- Support for IndexedDB adapter
- Support for Supabase adapter
- Cloud sync capabilities
- Offline-first architecture

### Notes

- Migration path: implement adapters for different backends
- API signature must remain stable across adapters

---

## ENG-002: EventBus

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-002 |
| **Engine Name** | EventBus |
| **Architecture Layer** | Infrastructure Layer |
| **Purpose** | Provides centralized event communication. Decouples engines by enabling publish/subscribe pattern with priority-based ordering and wildcard listeners. |
| **Owner Domain** | Event Communication & Pub/Sub |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `on(event, callback, priority)` | Register a listener | void |
| `once(event, callback, priority)` | Register a one-time listener | void |
| `off(event, callback)` | Remove a listener | void |
| `emit(event, data)` | Emit an event | void |
| `onWildcard(callback)` | Register a wildcard listener | void |
| `offWildcard(callback)` | Remove a wildcard listener | void |
| `getHistory()` | Get event history | array |
| `clearHistory()` | Clear event history | void |
| `setDebugMode(enabled)` | Enable/disable debug mode | void |
| `getAllEvents()` | Get all registered events | array |
| `getListenerCount(event)` | Get listener count for event | number |
| `clearAll()` | Clear all listeners and history | void |
| `getStatus()` | Get engine status | Status object |

**Priority Constants:**
- `Priority.LOW` = 10
- `Priority.NORMAL` = 50 (default)
- `Priority.HIGH` = 80
- `Priority.CRITICAL` = 100

### Canonical Storage

| Key Pattern | Format | Description |
|-------------|--------|-------------|
| None | - | In-memory only. Event history limited to 100 entries. |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| None | - | Standalone engine, no dependencies |

### Consumers

| Consumer | Layer | Description |
|----------|-------|-------------|
| ProgressEngine | Core Logic | Emits LessonCompleted, ProgressUpdated |
| SystemComposer | UI Layer | Listens for SYSTEM_READY, PROFILE_UPDATED |
| Router | System | Emits RouteChanged |
| Future Engines | All | Any engine needing event communication |

### Canonical Events

#### Emitted Events

| Event | Payload | Description |
|-------|---------|-------------|
| None | - | EventBus is passive, does not emit events |

#### Consumed Events

| Event | Source | Payload | Description |
|-------|--------|---------|-------------|
| SYSTEM_READY | Loader/App | `{ boot, timestamp }` | System initialization signal |
| COMPOSER_MOUNTED | SystemComposer | `{ version, initialized, root }` | UI mounted signal |
| LessonCompleted | ProgressEngine | `{ lessonId, xpGain }` | Lesson completion signal |
| ProgressUpdated | ProgressEngine | `{ lessonId, progress }` | Progress update signal |
| RouteChanged | Router | `{ page, params }` | Navigation signal |
| PROFILE_UPDATED | ProfileEngine | `{ profile }` | Profile update signal |
| LEARNING_UI_REFRESH | SystemComposer | `{}` | UI refresh signal |
| RUNTIME_READY | SystemComposer | `{}` | Runtime ready signal |
| WORKSPACE_UPDATED | WorkspaceEngine | `{}` | Workspace update signal |

### Future Extension

- Priority-based event filtering
- Event replay capability
- Persistent event history
- Cross-tab event synchronization

### Notes

- Event names are canonical and must not change
- New events must be registered here before implementation
- Debug mode helpful for development

---

## ENG-003: ProgressEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-003 |
| **Engine Name** | ProgressEngine |
| **Architecture Layer** | Core Logic Layer |
| **Purpose** | Owns all user learning progress data. Tracks completed lessons, XP, levels, streaks, and stages. Single source of truth for learner progress. |
| **Owner Domain** | Learning Progress Tracking & Management |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize the engine | this |
| `getProgress()` | Get full progress object | Progress object |
| `saveProgress(progress)` | Save progress object | boolean |
| `getState()` | Get progress state summary | State object |
| `getXP()` | Get current XP | number |
| `getLevel()` | Get current level | number |
| `getDay()` | Get current day | number |
| `getStreak()` | Get current streak | number |
| `getCompletionPercent()` | Get completion percentage | number |
| `getCurrentStage()` | Get current stage | string |
| `getCompletedLessons()` | Get completed lesson IDs | array |
| `getRemainingLessons()` | Get remaining lesson count | number |
| `isLessonCompleted(lessonId)` | Check if lesson is completed | boolean |
| `setXP(totalXP)` | Set XP | boolean |
| `completeLesson(lessonId)` | Complete a lesson | Progress object |
| `resetProgress()` | Reset all progress | Progress object |
| `getStatus()` | Get engine status | Status object |

### Canonical Storage

| Key | Format | Schema Version | Description |
|-----|--------|----------------|-------------|
| `lawai_progress` | JSON | 2.0.0 | Full user progress object |

**Progress Object Schema:**
```javascript
{
  completedLessons: [],      // Array of lesson IDs
  currentLesson: 1,          // Current lesson number
  completionPercent: 0,      // 0-100
  currentStage: 'Foundation', // Stage name
  xp: 0,                     // Total XP
  totalLessons: 365,         // Total lessons available
  day: 1,                    // Current day
  level: 1,                  // Current level
  streak: 0,                 // Day streak
  lastActive: null,          // Last active date
  createdAt: '2026-01-01T00:00:00.000Z' // Creation date
}
