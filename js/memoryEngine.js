

## 📄 修改后的 `MemoryEngine.js`（含 Canon 元数据）

```javascript
// ================================================================
// ENGINE: MemoryEngine
// LAYER: Core Logic Layer
// DOMAIN: Memory & Review Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Manages long-term memory retention using spaced repetition.
//   Tracks memory strength for each lesson, schedules reviews
//   based on strength, and adapts to learner performance.
//   Implements the "Review" phase of the Learning Loop.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   getAll()                            -> object
//   getMemory(lessonId)                 -> object | null
//   getMemoryStrength(lessonId)         -> number
//   updateMemory(lessonId, strength)    -> object
//   recordReview(lessonId, performance) -> object
//   scheduleReviews()                   -> array
//   getTodayReviews()                   -> array
//   getHeatmap()                        -> object
//   getStatus()                         -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For listening to LessonCompleted
//
// STORAGE
// ================================================================
//   - Key: 'lawai_memory_entries'
//   - Format: JSON object keyed by lessonId
//   - Schema: { lessonId, strength, lastReviewed, nextReview, reviewCount }
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'ReviewCompleted' : When a review session is recorded
//     Payload: { lessonId, performance }
//
//   CONSUMED:
//   - 'LessonCompleted' : From ProgressEngine, initializes memory
//     Payload: { lessonId, xpGain }
//
// FUTURE COMPATIBILITY
// ================================================================
//   - Review scheduling algorithm can be improved
//   - Performance can be tracked per question type
//   - Memory strength can be visualized in UI
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MemoryEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'MemoryEngine';
    var _engineVersion = '2.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Memory & Review Management';

    var _initialized = false;
    var _memories = {};

    // ===========================================
    // 记忆存储
    // ===========================================
    function getAll() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('memory_entries') || {};
            _memories = { ..._memories, ...stored };
            return _memories;
        } catch (e) {
            return _memories;
        }
    }

    function saveAll(memories) {
        _memories = memories;
        try {
            LawAIApp.StorageEngine?.set?.('memory_entries', memories);
        } catch (e) {}
    }

    function getMemory(lessonId) {
        var memories = getAll();
        return memories[lessonId] || null;
    }

    function getMemoryStrength(lessonId) {
        var memory = getMemory(lessonId);
        if (!memory) return 0;
        return memory.strength || 0;
    }

    // ===========================================
    // 复习调度
    // ===========================================
    function scheduleReviews() {
        var memories = getAll();
        var today = new Date().toDateString();
        var due = [];

        for (var key in memories) {
            var m = memories[key];
            if (m.nextReview && new Date(m.nextReview).toDateString() <= today) {
                due.push({
                    lessonId: key,
                    memory: m,
                    strength: m.strength || 50
                });
            }
        }

        return due;
    }

    function getTodayReviews() {
        var due = scheduleReviews();
        return due.map(function(d) { return d.lessonId; });
    }

    // ===========================================
    // 记忆更新
    // ===========================================
    function updateMemory(lessonId, strength) {
        var memories = getAll();
        var now = new Date();
        var nextReview = new Date(now);
        
        // 根据强度计算下次复习时间
        var daysToAdd = Math.max(1, Math.floor((strength || 50) / 10));
        nextReview.setDate(nextReview.getDate() + daysToAdd);

        memories[lessonId] = {
            lessonId: lessonId,
            strength: strength || 50,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            reviewCount: (memories[lessonId]?.reviewCount || 0) + 1
        };

        saveAll(memories);
        return memories[lessonId];
    }

    function recordReview(lessonId, performance) {
        performance = performance || 0.7; // 0-1
        var memory = getMemory(lessonId);
        var currentStrength = memory?.strength || 50;
        
        // 根据表现调整强度
        var adjustment = (performance - 0.5) * 20;
        var newStrength = Math.max(10, Math.min(100, currentStrength + adjustment));
        
        var result = updateMemory(lessonId, newStrength);
        
        // 触发事件
        try {
            LawAIApp.EventBus?.emit?.('ReviewCompleted', { 
                lessonId: lessonId, 
                performance: performance,
                newStrength: newStrength
            });
        } catch (e) {}

        return result;
    }

    // ===========================================
    // 记忆热图
    // ===========================================
    function getHeatmap() {
        var memories = getAll();
        var result = {};
        for (var key in memories) {
            result[key] = {
                strength: memories[key].strength || 0,
                reviewCount: memories[key].reviewCount || 0,
                lastReviewed: memories[key].lastReviewed
            };
        }
        return result;
    }

    // ===========================================
    // ENGINE STATUS
    // ===========================================
    function getStatus() {
        var memories = getAll();
        var totalEntries = Object.keys(memories).length;
        var totalReviews = 0;
        for (var key in memories) {
            totalReviews += memories[key].reviewCount || 0;
        }
        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            totalMemories: totalEntries,
            totalReviews: totalReviews,
            todayReviews: getTodayReviews().length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function'),
            eventBusAvailable: !!(LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function')
        };
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;

        // 监听课程完成
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            if (lessonId) {
                updateMemory(lessonId, 50);
            }
        });

        // 监听复习完成
        LawAIApp.EventBus?.on?.('ReviewCompleted', function(data) {
            if (data.lessonId) {
                recordReview(data.lessonId, data.performance || 0.7);
            }
        });

        console.log('🧠 MemoryEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getAll: getAll,
        getMemory: getMemory,
        getMemoryStrength: getMemoryStrength,
        updateMemory: updateMemory,
        recordReview: recordReview,
        scheduleReviews: scheduleReviews,
        getTodayReviews: getTodayReviews,
        getHeatmap: getHeatmap,
        getStatus: getStatus
    };
})();

console.log('🧠 MemoryEngine V2.0 ready');
