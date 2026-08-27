// forgettingCurve.js
// Part 37: 薄包装层 — 委托给 MemoryReview

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.ForgettingCurve && window.LawAIApp.ForgettingCurve._upgraded) {
        console.log('[ForgettingCurve] Already upgraded, skipping...');
        return;
    }

    var ForgettingCurve = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 根据时间衰减计算当前强度
         * 委托给 MemoryEngine
         */
        calculateCurrentStrength: function(knowledgeId) {
            var memoryEngine = window.LawAIApp.MemoryEngine;
            if (memoryEngine && typeof memoryEngine.getMemory === 'function') {
                var record = memoryEngine.getMemory(knowledgeId);
                if (record) {
                    // 获取 strength 并应用衰减
                    var strength = record.strength || 0;
                    var lastReviewed = record.lastReviewed || record.updatedAt || Date.now();
                    var daysSince = (Date.now() - lastReviewed) / 86400000;
                    
                    // 简单衰减
                    if (daysSince > 1) {
                        var decay = Math.min(30, (daysSince - 1) * 2);
                        return Math.max(0, strength - decay);
                    }
                    return strength;
                }
            }
            return 50;
        },

        /**
         * 计算下一次建议复习时间
         * 委托给 MemoryReview
         */
        getNextReviewDate: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getReview === 'function') {
                var record = review.getReview(knowledgeId);
                if (record && record.dueAt) {
                    return new Date(record.dueAt);
                }
                // 如果没有 dueAt，安排一个
                if (review && typeof review.scheduleReview === 'function') {
                    review.scheduleReview(knowledgeId);
                    var newRecord = review.getReview(knowledgeId);
                    if (newRecord && newRecord.dueAt) {
                        return new Date(newRecord.dueAt);
                    }
                }
            }
            // Fallback: 3 天后
            return new Date(Date.now() + 3 * 86400000);
        },

        /**
         * 检查是否到了复习时间
         * 委托给 MemoryReview
         */
        isReviewDue: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getReview === 'function') {
                var record = review.getReview(knowledgeId);
                if (record) {
                    var state = record.reviewState;
                    return state === 'DUE' || state === 'OVERDUE';
                }
            }
            // Fallback: 检查 dueAt
            var memoryEngine = window.LawAIApp.MemoryEngine;
            if (memoryEngine && typeof memoryEngine.getMemory === 'function') {
                var mem = memoryEngine.getMemory(knowledgeId);
                if (mem && mem.nextReview) {
                    return Date.now() >= mem.nextReview;
                }
            }
            return false;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this._version,
                upgraded: true
            };
        }
    };

    window.LawAIApp.ForgettingCurve = ForgettingCurve;
    console.log('[ForgettingCurve] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
