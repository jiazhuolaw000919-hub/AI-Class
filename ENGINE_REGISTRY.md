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
| ENG-006 | MemoryEngine | Core Logic | 🟢 Canon Locked | 2.0.0 |
| ENG-007 | PracticeEngine | Core Logic | 🟢 Canon Locked | 2.0.0 |
| ENG-008 | ReflectionEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |
| ENG-009 | AIMentorEngine | AI Layer | 🟢 Canon Locked | 1.0.0 |
| ENG-010 | ExperienceEngine | UI Layer | 🟢 Canon Locked | 2.0.0 |
| ENG-011 | SchoolEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |
| ENG-012 | AcademicRecordEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |
| ENG-013 | CertificateEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |
| ENG-014 | CareerEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |
| ENG-015 | CommunityEngine | Core Logic | 🟢 Canon Locked | 1.0.0 |

**Total Registered Engines:** 15

**Status Breakdown:**
- 🟢 Canon Locked: 15
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
| **Purpose** | Provides a unified abstraction layer for persistent storage. |
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
| `lawai_*` | JSON | All keys are prefixed with 'lawai_' |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| None | - | Standalone engine |

### Consumers

| Consumer | Layer |
|----------|-------|
| ProgressEngine | Core Logic |
| LessonEngine | Data Layer |
| MemoryEngine | Core Logic |
| PracticeEngine | Core Logic |
| ReflectionEngine | Core Logic |
| SystemComposer | UI Layer |
| SchoolEngine | Core Logic |
| AcademicRecordEngine | Core Logic |
| CertificateEngine | Core Logic |
| CareerEngine | Core Logic |
| CommunityEngine | Core Logic |

### Canonical Events

| Event | Type | Payload | Description |
|-------|------|---------|-------------|
| None | - | - | Passive engine |

---

## ENG-002: EventBus

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-002 |
| **Engine Name** | EventBus |
| **Architecture Layer** | Infrastructure Layer |
| **Purpose** | Provides centralized event communication. |
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
| None | - | In-memory only |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| None | - | Standalone engine |

### Consumers

| Consumer | Layer |
|----------|-------|
| ProgressEngine | Core Logic |
| MemoryEngine | Core Logic |
| PracticeEngine | Core Logic |
| SystemComposer | UI Layer |
| Router | System |
| SchoolEngine | Core Logic |
| AcademicRecordEngine | Core Logic |
| CertificateEngine | Core Logic |
| CareerEngine | Core Logic |
| CommunityEngine | Core Logic |

### Canonical Events

#### Consumed Events

| Event | Source | Payload | Description |
|-------|--------|---------|-------------|
| SYSTEM_READY | Loader/App | `{ boot, timestamp }` | System initialization |
| COMPOSER_MOUNTED | SystemComposer | `{ version, initialized, root }` | UI mounted |
| LessonCompleted | ProgressEngine | `{ lessonId, xpGain }` | Lesson completion |
| ReviewCompleted | MemoryEngine | `{ lessonId, performance }` | Review completion |
| PracticeCompleted | PracticeEngine | `{ practice, feedback, correct }` | Practice completion |
| ReflectionSaved | ReflectionEngine | `{ userId, lessonId }` | Reflection saved |
| SchoolRegistered | SchoolEngine | `{ school }` | School registered |
| SchoolActivated | SchoolEngine | `{ schoolId, school }` | School activated |
| RecordAdded | AcademicRecordEngine | `{ record }` | Record added |
| CertificateGenerated | CertificateEngine | `{ certificate }` | Certificate generated |
| CareerGoalSet | CareerEngine | `{ goal }` | Career goal set |
| MilestoneAdded | CareerEngine | `{ milestone }` | Milestone added |
| GroupCreated | CommunityEngine | `{ group }` | Group created |
| GroupJoined | CommunityEngine | `{ groupId, userId }` | User joined group |
| MessagePosted | CommunityEngine | `{ message }` | Message posted |

---

## ENG-003: ProgressEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-003 |
| **Engine Name** | ProgressEngine |
| **Architecture Layer** | Core Logic Layer |
| **Purpose** | Owns all user learning progress data. |
| **Owner Domain** | Learning Progress Tracking |
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

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| StorageEngine | Required | For persistent storage |
| EventBus | Optional | For emitting events |

### Consumers

| Consumer | Layer |
|----------|-------|
| SystemComposer | UI Layer |
| LessonView | UI Layer |
| AcademyView | UI Layer |
| SchoolEngine | Core Logic |
| AcademicRecordEngine | Core Logic |
| CareerEngine | Core Logic |

### Canonical Events

#### Emitted Events

| Event | Payload | Description |
|-------|---------|-------------|
| `LessonCompleted` | `{ lessonId, xpGain }` | Lesson completed |
| `ProgressUpdated` | `{ lessonId, progress }` | Progress updated |
| `LevelUp` | `{ level }` | Level up |

---

## ENG-004: LessonEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-004 |
| **Engine Name** | LessonEngine |
| **Architecture Layer** | Data Layer |
| **Purpose** | Owns lesson data generation and retrieval. |
| **Owner Domain** | Lesson Data Management |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 1.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `getLessonByDay(day)` | Get a lesson by day number | Lesson object |
| `getAllLessons()` | Get all 365 lessons | Array |
| `createLesson(day)` | Create a single lesson | Lesson object |
| `generateAllLessons(force)` | Generate all lessons | Array |
| `getStatus()` | Get engine status | Status object |

### Canonical Storage

| Key | Format | Schema Version | Description |
|-----|--------|----------------|-------------|
| `lawai_allLessons` | JSON | 1.0.0 | Array of 365 lesson objects |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| StorageEngine | Optional | For persistent storage |

### Consumers

| Consumer | Layer |
|----------|-------|
| SystemComposer | UI Layer |
| LessonView | UI Layer |
| PracticeEngine | Core Logic |
| SchoolEngine | Core Logic |

---

## ENG-005: SystemComposer

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-005 |
| **Engine Name** | SystemComposer |
| **Architecture Layer** | UI Layer |
| **Purpose** | Owns the composition and rendering of the entire UI. |
| **Owner Domain** | System Composition & UI Rendering |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 5.0.1 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `init(boot)` | Initialize the composer | void |
| `refresh()` | Refresh all panels | void |
| `refreshPanel(name)` | Refresh a specific panel | void |
| `destroy()` | Destroy the composer | void |
| `registerPanel(name, renderer)` | Register a panel | void |
| `resolvePanel(name)` | Get a panel renderer | function |
| `scheduleRender(panelName)` | Schedule a panel render | void |
| `recover()` | Attempt recovery | void |
| `getDOM(key)` | Get cached DOM element | HTMLElement |
| `getStatus()` | Get engine status | Status object |
| `isReady()` | Check if ready | boolean |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| StorageEngine | Optional | For reading stored data |
| EventBus | Optional | For event communication |
| ProgressEngine | Optional | For progress data |
| LessonEngine | Optional | For lesson data |

### Canonical Events

#### Emitted Events

| Event | Payload | Description |
|-------|---------|-------------|
| `COMPOSER_MOUNTED` | `{ version, initialized, root }` | Composer mounted |

#### Consumed Events

| Event | Source | Payload | Description |
|-------|--------|---------|-------------|
| `SYSTEM_READY` | Loader/App | `{ boot, timestamp }` | Triggers initialization |
| `PROFILE_UPDATED` | ProfileEngine | `{ profile }` | Refreshes learning panel |

---

## ENG-006: MemoryEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-006 |
| **Engine Name** | MemoryEngine |
| **Architecture Layer** | Core Logic Layer |
| **Purpose** | Manages long-term memory retention using spaced repetition. Tracks memory strength, schedules reviews, and adapts to learner performance. |
| **Owner Domain** | Memory & Review Management |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize the engine | void |
| `getAll()` | Get all memory entries | object |
| `getMemory(lessonId)` | Get memory for a lesson | object |
| `getMemoryStrength(lessonId)` | Get memory strength score | number |
| `updateMemory(lessonId, strength)` | Update memory strength | object |
| `recordReview(lessonId, performance)` | Record a review session | object |
| `scheduleReviews()` | Get all overdue reviews | array |
| `getTodayReviews()` | Get today's review list | array |
| `getHeatmap()` | Get memory heatmap data | object |
| `getStatus()` | Get engine status | Status object |

### Canonical Storage

| Key | Format | Schema Version | Description |
|-----|--------|----------------|-------------|
| `lawai_memory_entries` | JSON | 1.0.0 | Memory entries by lessonId |

**Memory Entry Schema:**
```javascript
{
  lessonId: 'day-1',
  strength: 50,          // 0-100
  lastReviewed: '2026-01-01T00:00:00.000Z',
  nextReview: '2026-01-08T00:00:00.000Z',
  reviewCount: 0
}
