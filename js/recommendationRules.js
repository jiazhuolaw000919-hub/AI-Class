// recommendationRules.js
// Part 38: 薄包装层 — 委托给 RecommendationEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.RecommendationRules && window.LawAIApp.RecommendationRules._upgraded) {
        console.log('[RecommendationRules] Already upgraded, skipping...');
        return;
    }

    var RecommendationRules = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 生成推荐
         * 委托给 RecommendationEngine
         */
        generate: function() {
            var engine = window.LawAIApp.RecommendationEngine;
            if (engine && typeof engine.generateRecommendations === 'function') {
                var recs = engine.generateRecommendations();
                // 转换为旧格式兼容
                return recs.map(function(r) {
                    return {
                        recommendationId: r.id,
                        type: r.targetType || 'learning',
                        priority: r.priorityScore >= 80 ? 'critical' : 
                                  r.priorityScore >= 60 ? 'high' :
                                  r.priorityScore >= 40 ? 'normal' : 'low',
                        confidence: Math.round(r.confidence * 100),
                        title: r.reason || 'Recommended',
                        description: r.reason || 'Based on your learning progress.',
                        reason: r.reason || 'Based on your learning progress.',
                        action: { type: 'open_' + (r.targetType || '').toLowerCase(), id: r.targetId },
                        generatedAt: new Date(r.createdAt).toISOString(),
                        expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
                        status: r.status || 'active'
                    };
                });
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

    window.LawAIApp.RecommendationRules = RecommendationRules;
    console.log('[RecommendationRules] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
