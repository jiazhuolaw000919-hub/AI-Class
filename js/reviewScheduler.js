// reviewScheduler.js
// Part 37: 薄包装层 — 委托给 MemoryReview

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.ReviewScheduler && window.LawAIApp.ReviewScheduler._upgraded) {
        console.log('[ReviewScheduler] Already upgraded, skipping...');
        return;
    }

    var ReviewScheduler = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 获取用户应复习的知识卡片
         * 委托给 MemoryReview
         */
        getReviewQueue: function(userId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                var due = review.getTodayReviews();
                // 兼容旧格式，返回 note 风格
                return due.map(function(item) {
                    return {
                        id: item.knowledgeId,
                        title: 'Review: ' + item.knowledgeId,
                        lastReview: item.lastReviewedAt,
                        reviewCount: item.reviewCount || 0,
                        priority: item.priority > 70 ? 'high' : 'medium',
                        _dueAt: item.dueAt
                    };
                });
            }
            return [];
        },

        /**
         * 标记一个条目已复习
         * 委托给 MemoryReview
         */
        markReviewed: function(userId, knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.completeReview === 'function') {
                return review.completeReview(knowledgeId, {
                    result: 'success',
                    performance: 0.8,
                    metadata: { userId: userId }
                });
            }
            return null;
        },

        /**
         * 从弱项技能自动创建高优先级复习卡
         * 委托给 MemoryReview + MasteryEngine
         */
        addWeaknessReview: function(userId, skillName) {
            var masteryEngine = window.LawAIApp.MasteryEngine;
            if (masteryEngine && typeof masteryEngine.getMastery === 'function') {
                var record = masteryEngine.getMastery(skillName);
                if (record && record.masteryLevel < 0.5) {
                    var review = window.LawAIApp.MemoryReview;
                    if (review && typeof review.scheduleReview === 'function') {
                        return review.scheduleReview(skillName, {
                            source: 'weakness',
                            interval: 0.5
                        });
                    }
                }
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

    window.LawAIApp.ReviewScheduler = ReviewScheduler;
    console.log('[ReviewScheduler] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
