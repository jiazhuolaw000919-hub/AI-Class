// recommendationHistory.js
// Part 38: 薄包装层 — 委托给 RecommendationEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.RecommendationHistory && window.LawAIApp.RecommendationHistory._upgraded) {
        console.log('[RecommendationHistory] Already upgraded, skipping...');
        return;
    }

    var RecommendationHistory = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 添加推荐
         * 委托给 RecommendationEngine
         */
        add: function(rec) {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.generateRecommendations === 'function') {
                // 推荐由 RecommendationEngine 统一生成
                engine.generateRecommendations();
            }
        },

        /**
         * 接受推荐
         * 委托给 RecommendationEngine
         */
        accept: function(id) {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.acceptRecommendation === 'function') {
                return engine.acceptRecommendation(id);
            }
        },

        /**
         * 忽略推荐
         * 委托给 RecommendationEngine
         */
        dismiss: function(id) {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.dismissRecommendation === 'function') {
                return engine.dismissRecommendation(id);
            }
        },

        /**
         * 获取活跃推荐
         * 委托给 RecommendationEngine
         */
        getActive: function() {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.getActiveRecommendations === 'function') {
                var active = engine.getActiveRecommendations();
                return active.map(function(r) {
                    return {
                        recommendationId: r.id,
                        type: r.targetType || 'knowledge',
                        priority: r.priorityScore >= 70 ? 'high' : 'normal',
                        title: r.reason || 'Recommendation',
                        description: r.reason || '',
                        reason: r.reason || '',
                        status: r.status || 'active',
                        expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
                        addedAt: new Date(r.createdAt).toISOString()
                    };
                });
            }
            return [];
        },

        /**
         * 获取历史
         * 委托给 RecommendationEngine
         */
        getHistory: function() {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.getRecommendations === 'function') {
                return engine.getRecommendations({});
            }
            return [];
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.getStatus === 'function') {
                return engine.getStatus();
            }
            return { version: this._version, upgraded: true };
        }
    };

    window.LawAIApp.RecommendationHistory = RecommendationHistory;
    console.log('[RecommendationHistory] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
