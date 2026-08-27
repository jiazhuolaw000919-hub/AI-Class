// memoryScheduler.js
// Part 37: 薄包装层 — 委托给 MemoryReview

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.MemoryScheduler && window.LawAIApp.MemoryScheduler._upgraded) {
        console.log('[MemoryScheduler] Already upgraded, skipping...');
        return;
    }

    var MemoryScheduler = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 获取今日应复习的知识点列表
         * 委托给 MemoryReview
         */
        getTodayReviewList: function() {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                var items = review.getTodayReviews();
                return items.map(function(item) {
                    return item.knowledgeId;
                });
            }
            return [];
        },

        /**
         * 获取未来 N 天的复习计划
         * 委托给 MemoryReview
         */
        getUpcomingReviews: function(daysAhead) {
            daysAhead = daysAhead || 7;
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getUpcomingReviews === 'function') {
                return review.getUpcomingReviews(daysAhead);
            }
            return [];
        },

        /**
         * 计算记忆健康分数
         * 委托给 MemoryReview
         */
        calculateMemoryHealth: function() {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                var due = review.getTodayReviews();
                var memoryEngine = window.LawAIApp.MemoryEngine;
                if (memoryEngine && typeof memoryEngine.getStats === 'function') {
                    var stats = memoryEngine.getStats();
                    var avgStrength = stats.averageStrength || 50;
                    return Math.max(0, Math.round(avgStrength - due.length * 2));
                }
            }
            return 100;
        },

        /**
         * 找出高风险主题（强度低于 40）
         * 委托给 MemoryEngine
         */
        getAtRiskTopics: function() {
            var memoryEngine = window.LawAIApp.MemoryEngine;
            if (memoryEngine && typeof memoryEngine.getAtRiskTopics === 'function') {
                return memoryEngine.getAtRiskTopics();
            }
            return [];
        },

        /**
         * 生成每日复习计划（文本）
         * 委托给 MemoryReview
         */
        generateDailyPlan: function() {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                var due = review.getTodayReviews();
                if (due.length === 0) return 'No reviews scheduled today.';
                return 'You have ' + due.length + ' item(s) to review today.';
            }
            return 'No reviews scheduled today.';
        },

        /**
         * 完成一次复习后更新进度
         * 委托给 MemoryReview
         */
        completeReview: function(lessonId, quality) {
            quality = quality || 'good';
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.completeReview === 'function') {
                var isSuccess = quality === 'good' || quality === 'excellent';
                return review.completeReview(lessonId, {
                    result: isSuccess ? 'success' : 'failure',
                    performance: isSuccess ? 0.8 : 0.4
                });
            }
            return null;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getStatus === 'function') {
                return review.getStatus();
            }
            return {
                version: this._version,
                upgraded: true,
                available: false
            };
        }
    };

    window.LawAIApp.MemoryScheduler = MemoryScheduler;
    console.log('[MemoryScheduler] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
