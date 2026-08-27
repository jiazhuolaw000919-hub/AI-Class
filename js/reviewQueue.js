// reviewQueue.js
// Part 37: 薄包装层 — 委托给 MemoryReview

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.ReviewQueue && window.LawAIApp.ReviewQueue._upgraded) {
        console.log('[ReviewQueue] Already upgraded, skipping...');
        return;
    }

    var ReviewQueue = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 生成复习时间点（基于策略）
         * 直接使用 MemoryReview 的调度
         */
        generateSchedule: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.scheduleReview === 'function') {
                var result = review.scheduleReview(knowledgeId);
                if (result && result.dueAt) {
                    var intervals = [1, 3, 7, 30];
                    return intervals.map(function(d) {
                        var date = new Date(Date.now() + d * 86400000);
                        return {
                            knowledgeId: knowledgeId,
                            date: date.toISOString(),
                            interval: d,
                            done: false
                        };
                    });
                }
            }
            return [];
        },

        /**
         * 获取某个知识点的所有复习任务
         * 直接查询 MemoryReview
         */
        getLessonReviews: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.getReview === 'function') {
                var record = review.getReview(knowledgeId);
                if (record) {
                    return [{
                        knowledgeId: knowledgeId,
                        dueAt: record.dueAt,
                        reviewState: record.reviewState,
                        reviewCount: record.reviewCount,
                        done: record.reviewState === 'COMPLETED'
                    }];
                }
            }
            return [];
        },

        /**
         * 完成课程后自动创建复习任务
         * 委托给 MemoryReview
         */
        addLessonToReview: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.scheduleReview === 'function') {
                return review.scheduleReview(knowledgeId, { source: 'lesson_completion' });
            }
            return null;
        },

        /**
         * 标记某个复习任务为完成
         * 委托给 MemoryReview
         */
        completeReviewTask: function(knowledgeId, date) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.completeReview === 'function') {
                return review.completeReview(knowledgeId, {
                    result: 'success',
                    performance: 0.8,
                    metadata: { completedAt: date }
                });
            }
            return null;
        },

        /**
         * 获取今日需要复习的知识点 ID
         * 委托给 MemoryReview
         */
        getTodayReviews: function() {
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

    window.LawAIApp.ReviewQueue = ReviewQueue;
    console.log('[ReviewQueue] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
