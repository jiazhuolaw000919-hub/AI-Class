// js/academy/calibrationRecommender.js
// Part 62 — Calibration Recommender
// Law AI Academy Developer Bible
//
// PURPOSE: Recommend calibration-improving activities
// RULES: Optional, explainable, no forced remediation

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CalibrationRecommender) {
        console.log('[CalibrationRecommender] Already exists, skipping...');
        return;
    }

    /**
     * CalibrationRecommender
     *
     * 推荐校准改进活动
     * 
     * 推荐类型:
     * 1. 预测练习
     * 2. 反思提示
     * 3. 校准检查
     * 4. 策略调整
     */
    var CalibrationRecommender = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[CalibrationRecommender] Already initialized');
                return this;
            }

            console.log('[CalibrationRecommender] 🚀 Initializing...');
            this.initialized = true;
            console.log('[CalibrationRecommender] ✅ Initialized');
            return this;
        },

        /**
         * 获取校准推荐
         * @param {Object} context — 上下文
         * @param {Object} options — 选项
         * @returns {Array} 推荐列表
         */
        getRecommendations: function(context, options) {
            options = options || { limit: 2 };
            var recommendations = [];

            var observer = window.LawAIApp?.CalibrationObserver;
            if (!observer) return recommendations;

            try {
                // 1. 获取最近洞察
                var insights = observer.getRecentInsights(context, 3);
                for (var i = 0; i < insights.length; i++) {
                    var rec = this._createFromInsight(insights[i], context);
                    if (rec) recommendations.push(rec);
                }

                // 2. 检查校准模式
                var stats = observer.getStats();
                if (stats.total >= 3) {
                    var overconfidentCount = stats.byCalibrationState?.OVERCONFIDENT || 0;
                    var underconfidentCount = stats.byCalibrationState?.UNDERCONFIDENT || 0;

                    if (overconfidentCount >= 3 && underconfidentCount < overconfidentCount) {
                        recommendations.push(this._createOverconfidentRecommendation(context));
                    } else if (underconfidentCount >= 3 && overconfidentCount < underconfidentCount) {
                        recommendations.push(this._createUnderconfidentRecommendation(context));
                    }
                }

                // 3. 默认推荐
                if (recommendations.length === 0) {
                    recommendations.push(this._createDefaultRecommendation(context));
                }
            } catch (e) {
                console.warn('[CalibrationRecommender] Error:', e);
                recommendations.push(this._createDefaultRecommendation(context));
            }

            // 去重和排序
            recommendations = this._deduplicate(recommendations);

            if (options.limit) {
                recommendations = recommendations.slice(0, options.limit);
            }

            return recommendations;
        },

        /**
         * 获取推荐解释
         * @param {Object} recommendation — 推荐对象
         * @param {Object} context — 上下文
         * @returns {string} 解释
         */
        getExplanation: function(recommendation, context) {
            if (!recommendation) return 'No recommendation.';

            var parts = [];

            if (recommendation.reason) {
                parts.push(recommendation.reason);
            }

            if (recommendation.evidence && recommendation.evidence.length > 0) {
                parts.push('Based on: ' + recommendation.evidence[0]);
            }

            return parts.join(' ') || 'Optional calibration activity.';
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized
            };
        },

        // ============================================================
        // PRIVATE — Recommendation Creators
        // ============================================================

        _createFromInsight: function(insight, context) {
            if (!insight) return null;

            var actions = {
                'OVERCONFIDENT_PATTERN': {
                    title: 'Check Your Confidence',
                    description: 'Consider checking your confidence against the evidence.',
                    action: 'reflect_confidence'
                },
                'UNDERCONFIDENT_PATTERN': {
                    title: 'Acknowledge Your Progress',
                    description: 'You performed well even when uncertain. Notice this pattern.',
                    action: 'acknowledge_progress'
                },
                'IMPROVING_CALIBRATION': {
                    title: 'Your Calibration is Improving',
                    description: 'Your predictions are getting closer to your results. Keep going!',
                    action: 'continue_practice'
                }
            };

            var action = actions[insight.type] || actions['IMPROVING_CALIBRATION'];

            return {
                id: 'cal_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'CALIBRATION',
                title: action.title,
                description: action.description,
                action: action.action,
                reason: insight.description || 'Based on your recent learning patterns.',
                evidence: [insight.evidence || 'Recent learning activity'],
                isOptional: true,
                timestamp: Date.now(),
                source: 'CalibrationRecommender'
            };
        },

        _createOverconfidentRecommendation: function(context) {
            return {
                id: 'cal_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'CALIBRATION',
                title: 'Reflect on Confidence',
                description: 'You have been confident on tasks that turned out differently. Try making a prediction before the next task.',
                action: 'reflect_confidence',
                reason: 'Based on recent calibration patterns.',
                evidence: ['Your confidence was higher than your performance on recent tasks'],
                isOptional: true,
                timestamp: Date.now(),
                source: 'CalibrationRecommender'
            };
        },

        _createUnderconfidentRecommendation: function(context) {
            return {
                id: 'cal_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'CALIBRATION',
                title: 'Acknowledge Your Skills',
                description: 'You performed well even when uncertain. Notice this pattern in your learning.',
                action: 'acknowledge_progress',
                reason: 'Based on recent calibration patterns.',
                evidence: ['Your performance was better than your confidence on recent tasks'],
                isOptional: true,
                timestamp: Date.now(),
                source: 'CalibrationRecommender'
            };
        },

        _createDefaultRecommendation: function(context) {
            return {
                id: 'cal_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'CALIBRATION',
                title: 'Practice Self-Assessment',
                description: 'Try predicting how you will perform before the next task.',
                action: 'practice_prediction',
                reason: 'Building self-assessment skill helps learning.',
                evidence: ['Based on your current learning context'],
                isOptional: true,
                timestamp: Date.now(),
                source: 'CalibrationRecommender'
            };
        },

        _deduplicate: function(recommendations) {
            var unique = {};
            var result = [];

            for (var i = 0; i < recommendations.length; i++) {
                var key = recommendations[i].title;
                if (!unique[key]) {
                    unique[key] = true;
                    result.push(recommendations[i]);
                }
            }

            return result;
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CalibrationRecommender = CalibrationRecommender;

    function autoInit() {
        if (!CalibrationRecommender.initialized) {
            CalibrationRecommender.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[CalibrationRecommender] Module loaded (Part 62)');

})();
