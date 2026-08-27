// recallEngine.js
// Part 37: 薄包装层 — 委托给 MemoryReview

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.RecallEngine && window.LawAIApp.RecallEngine._upgraded) {
        console.log('[RecallEngine] Already upgraded, skipping...');
        return;
    }

    var RecallEngine = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 生成主动回忆提示
         * 委托给 MemoryReview
         */
        generateRecallPrompt: function(knowledgeId) {
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.generateRecallPrompt === 'function') {
                return review.generateRecallPrompt(knowledgeId);
            }
            // Fallback
            return 'Review: ' + knowledgeId;
        },

        /**
         * 记录一次主动回忆（更新记忆强度）
         * 委托给 MemoryReview
         */
        recordRecall: function(knowledgeId, quality) {
            quality = quality || 'good';
            var review = window.LawAIApp.MemoryReview;
            if (review && typeof review.completeReview === 'function') {
                var isSuccess = quality === 'good' || quality === 'excellent';
                return review.completeReview(knowledgeId, {
                    result: isSuccess ? 'success' : 'failure',
                    performance: isSuccess ? 0.8 : 0.4,
                    metadata: { recallQuality: quality }
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

    window.LawAIApp.RecallEngine = RecallEngine;
    console.log('[RecallEngine] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
