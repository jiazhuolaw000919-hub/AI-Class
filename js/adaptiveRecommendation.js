// adaptiveRecommendation.js
// Part 38: 薄包装层 — 委托给 RecommendationEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.AdaptiveRecommendation && window.LawAIApp.AdaptiveRecommendation._upgraded) {
        console.log('[AdaptiveRecommendation] Already upgraded, skipping...');
        return;
    }

    var AdaptiveRecommendation = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 生成智能推荐 (带解释)
         * 委托给 RecommendationEngine
         */
        generate: function(limit) {
            limit = limit || 3;
            var engine = window.LawAIApp.RecommendationEngine;
            var recs = [];

            if (engine && typeof engine.generateRecommendations === 'function') {
                var results = engine.generateRecommendations();
                var top = results.slice(0, limit);

                recs = top.map(function(r) {
                    var reason = r.reason || 'Based on your learning progress.';
                    return {
                        type: r.targetType || 'knowledge',
                        priority: r.priorityScore >= 70 ? 'high' : 'normal',
                        title: 'Recommendation',
                        description: reason,
                        reason: reason,
                        expectedBenefit: 'Improve your learning outcomes',
                        estimatedTime: '15 min',
                        goalImpact: r.priorityScore >= 70 ? 'High' : 'Medium',
                        _raw: r
                    };
                });
            }

            return recs;
        },

        /**
         * 获取推荐解释
         */
        explain: function(recommendation) {
            if (recommendation && recommendation.reason) {
                return recommendation.reason + ' Expected benefit: ' + (recommendation.expectedBenefit || 'Improved learning outcomes') + '.';
            }
            return 'Recommended based on your learning progress.';
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

    window.LawAIApp.AdaptiveRecommendation = AdaptiveRecommendation;
    console.log('[AdaptiveRecommendation] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
