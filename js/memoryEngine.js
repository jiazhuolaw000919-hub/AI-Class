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
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('⚠️ MemoryEngine: Schema version mismatch. Expected ' + _schemaVersion + ', got ' + stored._schemaVersion);
            }
            _memories = { ..._memories, ...stored };
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
            var toSave = { ...memories };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    // ===========================================
    // 🔥 核心记忆函数
    // ===========================================

    /**
     * 获取记忆条目
     * @param {string} lessonId - 课程 ID
     * @returns {Object} 记忆条目
     */
    function getMemory(lessonId) {
        var memories = getAll();
        if (!memories[lessonId]) {
            memories[lessonId] = {
                lessonId: lessonId,
                strength: 0,
                lastReviewed: null,
                reviewCount: 0,
                nextReview: null,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            saveAll(memories);
        }
        return memories[lessonId];
    }

    /**
     * 获取记忆强度
     * @param {string} lessonId - 课程 ID
     * @returns {number} 记忆强度 (0-100)
     */
    function getMemoryStrength(lessonId) {
        var memory = getMemory(lessonId);
        return memory ? memory.strength || 0 : 0;
    }

    /**
     * 更新记忆
     * @param {string} lessonId - 课程 ID
     * @param {number} score - 分数 (0-100)
     */
    function updateMemory(lessonId, score) {
        var memories = getAll();
        if (!memories[lessonId]) {
            memories[lessonId] = {
                lessonId: lessonId,
                strength: 0,
                lastReviewed: null,
                reviewCount: 0,
                nextReview: null,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }

        var currentStrength = memories[lessonId].strength || 0;
        var newStrength = Math.round((currentStrength * 0.6) + (score * 0.4));
        memories[lessonId].strength = Math.min(100, Math.max(0, newStrength));
        memories[lessonId].updatedAt = Date.now();

        saveAll(memories);
        return memories[lessonId];
    }

    /**
     * 记录复习
     * @param {string} lessonId - 课程 ID
     * @param {number} performance - 表现 (0-1)
     */
    function recordReview(lessonId, performance) {
        var memories = getAll();
        if (!memories[lessonId]) {
            memories[lessonId] = {
                lessonId: lessonId,
                strength: 0,
                lastReviewed: null,
                reviewCount: 0,
                nextReview: null,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        }

        memories[lessonId].lastReviewed = Date.now();
        memories[lessonId].reviewCount = (memories[lessonId].reviewCount || 0) + 1;

        var score = Math.round(performance * 100);
        updateMemory(lessonId, score);

        var days = 1;
        if (performance >= 0.9) days = 7;
        else if (performance >= 0.7) days = 3;
        else if (performance >= 0.5) days = 1;
        else days = 0.5;

        memories[lessonId].nextReview = Date.now() + (days * 24 * 60 * 60 * 1000);
        saveAll(memories);

        console.log('🧠 MemoryEngine: Review recorded for ' + lessonId + ' (performance: ' + Math.round(performance * 100) + '%)');
        return memories[lessonId];
    }

    /**
     * 安排复习
     * @param {number} days - 天数范围
     * @returns {Array} 需要复习的课程列表
     */
    function scheduleReviews(days) {
        days = days || 7;
        var now = Date.now();
        var memories = getAll();
        var due = [];
        var limit = now + (days * 24 * 60 * 60 * 1000);

        for (var key in memories) {
            var memory = memories[key];
            if (memory.nextReview && memory.nextReview <= limit) {
                due.push({
                    lessonId: key,
                    strength: memory.strength || 0,
                    reviewCount: memory.reviewCount || 0,
                    daysOverdue: Math.round((now - memory.nextReview) / (24 * 60 * 60 * 1000))
                });
            }
        }

        due.sort(function(a, b) {
            return a.strength - b.strength;
        });

        return due;
    }

    /**
     * 获取今日复习
     * @returns {Array} 今日复习列表
     */
    function getTodayReviews() {
        return scheduleReviews(1);
    }

    /**
     * 获取热图数据
     * @param {number} days - 天数范围
     * @returns {Array} 热图数据
     */
    function getHeatmap(days) {
        days = days || 90;
        var memories = getAll();
        var heatmap = [];
        var now = Date.now();
        var dayMs = 24 * 60 * 60 * 1000;

        for (var i = days - 1; i >= 0; i--) {
            var date = new Date(now - (i * dayMs));
            var dateStr = date.toISOString().split('T')[0];
            var count = 0;

            for (var key in memories) {
                var memory = memories[key];
                if (memory.lastReviewed) {
                    var reviewDate = new Date(memory.lastReviewed).toISOString().split('T')[0];
                    if (reviewDate === dateStr) {
                        count++;
                    }
                }
            }

            heatmap.push({
                date: dateStr,
                count: count
            });
        }

        return heatmap;
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

        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            if (stored && !stored._schemaVersion) {
                console.log('🔄 MemoryEngine: Migrating memory data to schema v' + _schemaVersion);
                stored._schemaVersion = _schemaVersion;
                LawAIApp.StorageEngine?.set?.(_storageKey, stored);
                console.log('✅ MemoryEngine: Migration complete');
            }
        } catch (e) {}

        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (eventBus && typeof eventBus.on === 'function') {
            eventBus.on('LessonCompleted', function(data) {
                var lessonId = data && data.lessonId;
                if (lessonId) {
                    updateMemory(lessonId, 50);
                }
            });

            eventBus.on('ReviewCompleted', function(data) {
                if (data && data.lessonId) {
                    recordReview(data.lessonId, data.performance || 0.7);
                }
            });
        }

        console.log('🧠 MemoryEngine v' + _engineVersion + ' initialized');
    }

    // ===========================================
    // 额外辅助函数
    // ===========================================
    function getAllMemories() {
        return getAll();
    }

    function reset() {
        _memories = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('🧠 MemoryEngine: Reset complete');
        } catch (e) {}
    }

    function exportData() {
        return getAll();
    }

    function importData(data) {
        if (data && typeof data === 'object') {
            saveAll(data);
            console.log('🧠 MemoryEngine: Import complete');
            return true;
        }
        return false;
    }

    // ===========================================
    // PUBLIC API
    // ===========================================
    return {
        init: init,
        getAll: getAll,
        getAllMemories: getAllMemories,
        getMemory: getMemory,
        getMemoryStrength: getMemoryStrength,
        updateMemory: updateMemory,
        recordReview: recordReview,
        scheduleReviews: scheduleReviews,
        getTodayReviews: getTodayReviews,
        getHeatmap: getHeatmap,
        getStatus: getStatus,
        reset: reset,
        exportData: exportData,
        importData: importData
    };
})();

console.log('🧠 MemoryEngine V2.1 ready');
