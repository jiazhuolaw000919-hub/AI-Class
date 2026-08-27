// intelligenceRecommendations.js
// Part 38: 薄包装层 — 委托给 RecommendationEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.IntelligenceRecommendations && window.LawAIApp.IntelligenceRecommendations._upgraded) {
        console.log('[IntelligenceRecommendations] Already upgraded, skipping...');
        return;
    }

    var IntelligenceRecommendations = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 生成智能推荐
         * 委托给 RecommendationEngine
         */
        generate: function() {
            var engine = window.LawAIApp.RecommendationEngine;
            var recs = [];

            if (engine && typeof engine.getActiveRecommendations === 'function') {
                var active = engine.getActiveRecommendations();
                recs = active.map(function(r) {
                    return {
                        type: r.targetType || 'knowledge',
                        priority: r.priorityScore >= 70 ? 'high' : 'normal',
                        title: r.reason || 'Recommendation',
                        description: r.reason || 'Based on your learning progress.',
                        action: 'open_' + (r.targetType || '').toLowerCase()
                    };
                });
            }

            return recs;
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

    window.LawAIApp.IntelligenceRecommendations = IntelligenceRecommendations;
    console.log('[IntelligenceRecommendations] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
