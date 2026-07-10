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
| ENG-010 | ExperienceEngine | UI Layer | 🟢 Canon Locked | 1.0.0 |

**Total Registered Engines:** 10

**Status Breakdown:**
- 🟢 Canon Locked: 10
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

### Canonical Events

#### Emitted Events

| Event | Payload | Description |
|-------|---------|-------------|
| `LessonCompleted` | `{ lessonId, xpGain }` | Lesson completed |
| `ProgressUpdated` | `{ lessonId, progress }` | Progress updated |

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

---

## ENG-010: ExperienceEngine

| Property | Value |
|----------|-------|
| **Engine ID** | ENG-010 |
| **Engine Name** | ExperienceEngine |
| **Architecture Layer** | UI Layer |
| **Purpose** | Owns the user experience layer of the platform. Manages micro-interactions, celebrations, themes, and focus mode. Creates emotional engagement and makes learning feel rewarding. |
| **Owner Domain** | User Experience & Engagement |
| **Recovery Status** | 🟢 Canon Locked |
| **Version** | 2.0.0 |

### Canonical API

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize the engine | void |
| `getExperienceLevel()` | Get current XP total | number |
| `getExperienceProgress()` | Get XP progress toward next milestone | { level, nextMilestone, progress } |
| `addXP(amount)` | Add XP and return new total | number |
| `getXP()` | Get current XP (alias) | number |
| `renderCelebration(message)` | Render full-page celebration | void |
| `getStatus()` | Get engine status | Status object |

### Canonical Storage

| Key | Format | Schema Version | Description |
|-----|--------|----------------|-------------|
| `lawai_experience_level` | JSON number | 1.0.0 | Cumulative experience points (0-1000) |

### Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| StorageEngine | Optional | For persistent storage |
| EventBus | Optional | For listening to events and emitting milestones |
| Router | Optional | For navigation in celebration view |

### Consumers

| Consumer | Layer |
|----------|-------|
| SystemComposer | UI Layer |
| LessonView | UI Layer |

### Canonical Events

#### Emitted Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ExperienceMilestone` | `{ level, milestone, oldLevel }` | Emitted when a milestone is reached |

#### Consumed Events

| Event | Source | Payload | Description |
|-------|--------|---------|-------------|
| `LessonCompleted` | ProgressEngine | `{ lessonId, xpGain }` | Adds +5 XP |
| `PracticeCompleted` | PracticeEngine | `{ practice, feedback, correct }` | Adds +3 XP (correct) or +1 XP |
| `ProjectFinished` | ProjectEngine | `{}` | Adds +15 XP |
| `LevelUp` | ProgressEngine | `{ level }` | Adds +10 XP |

### XP Milestones

| Milestone | Reward |
|-----------|--------|
| 100 XP | 🎯 First milestone |
| 250 XP | ⭐ Dedicated learner |
| 500 XP | 🔥 Halfway to master |
| 750 XP | 🏆 Advanced learner |
| 1000 XP | 👑 XP Champion |

### Future Extension

- More milestones beyond 1000 XP
- XP multipliers for streaks
- Achievement system integration
- Celebration effects (confetti, animations)
- Theme integration for celebrations
- Sound effects for milestones

### Notes

- XP is cumulative and never resets
- Milestones are checked on every XP addition
- Celebration view uses Router for navigation
