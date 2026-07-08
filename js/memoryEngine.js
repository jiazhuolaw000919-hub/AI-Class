// ===========================================
// memoryEngine.js
// 记忆引擎 - 长期记忆保留（Phase 24 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MemoryEngine = (function() {
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
        
        return updateMemory(lessonId, newStrength);
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
        getHeatmap: getHeatmap
    };
})();

console.log('🧠 MemoryEngine V2.0 ready');
