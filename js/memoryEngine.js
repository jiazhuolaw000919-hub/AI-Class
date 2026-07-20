// ================================================================
// ENGINE: MemoryEngine
// LAYER: Core Logic Layer
// DOMAIN: Memory & Review Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.1.0
// ================================================================
//
// DATA CANON COMPLIANCE
// ================================================================
//   - Schema Version: 1.0.0
//   - Migration Support: Yes
//   - Export/Import: Via StorageEngine
//
// ... (其余元数据注释保持不变)
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MemoryEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'MemoryEngine';
    var _engineVersion = '2.1.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Memory & Review Management';
    var _schemaVersion = '1.0.0';
    var _storageKey = 'memory_entries';

    var _initialized = false;
    var _memories = {};

    // ===========================================
    // 记忆存储
    // ===========================================
    function getAll() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            // 检查 schema 版本
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('⚠️ MemoryEngine: Schema version mismatch. Expected ' + _schemaVersion + ', got ' + stored._schemaVersion);
            }
            _memories = { ..._memories, ...stored };
            // 移除 schema 版本字段（它是元数据，不是记忆条目）
            if (_memories._schemaVersion) {
                delete _memories._schemaVersion;
            }
            return _memories;
        } catch (e) {
            return _memories;
        }
    }

    function saveAll(memories) {
        _memories = memories;
        try {
            // 添加 schema 版本元数据
            var toSave = { ...memories };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    // ... 其余代码保持不变 ...

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
            schemaVersion: _schemaVersion,
            totalMemories: totalEntries,
            totalReviews: totalReviews,
            todayReviews: getTodayReviews().length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;

        // 检查是否需要迁移
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            if (stored && !stored._schemaVersion) {
                console.log('🔄 MemoryEngine: Migrating memory data to schema v' + _schemaVersion);
                stored._schemaVersion = _schemaVersion;
                LawAIApp.StorageEngine?.set?.(_storageKey, stored);
                console.log('✅ MemoryEngine: Migration complete');
            }
        } catch (e) {}

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

        console.log('🧠 MemoryEngine v' + _engineVersion + ' initialized');
    }

    // ... 其余代码保持不变（getMemory, getMemoryStrength, updateMemory, recordReview, scheduleReviews, getTodayReviews, getHeatmap）...

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

console.log('🧠 MemoryEngine V2.1 ready');
