// memoryTracker.js
// Part 35: 薄包装层 — 委托给 MemoryEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.MemoryTracker) {
        console.log('[MemoryTracker] Already exists, skipping...');
        return;
    }

    var MemoryTracker = {
        /**
         * 获取或初始化某个知识点的记忆数据
         * 委托给 MemoryEngine
         */
        getOrCreate: function(lessonId) {
            return LawAIApp.MemoryEngine.getMemory(lessonId);
        },

        /**
         * 更新记忆强度
         * 委托给 MemoryEngine
         */
        updateStrength: function(lessonId, newStrength, newState) {
            var memory = LawAIApp.MemoryEngine.getMemory(lessonId);
            if (!memory) return;

            var options = {
                score: newStrength,
                action: 'learn'
            };
            LawAIApp.MemoryEngine.updateMemory(lessonId, options);
        },

        /**
         * 记录复习完成
         * 委托给 MemoryEngine
         */
        recordReview: function(lessonId) {
            LawAIApp.MemoryEngine.recordReview(lessonId, 0.7);
        },

        /**
         * 获取所有记忆数据
         * 委托给 MemoryEngine
         */
        getAll: function() {
            return LawAIApp.MemoryEngine.getAll();
        }
    };

    window.LawAIApp.MemoryTracker = MemoryTracker;
    console.log('[MemoryTracker] ✅ Loaded as thin wrapper (Part 35)');
})();
