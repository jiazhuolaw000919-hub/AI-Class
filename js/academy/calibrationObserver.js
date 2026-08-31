// js/academy/calibrationObserver.js
// Part 62 — Calibration Observer
// Law AI Academy Developer Bible
//
// PURPOSE: Observe calibration patterns from learner behavior
// RULES: No single-task conclusions, no personality labels

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CalibrationObserver) {
        console.log('[CalibrationObserver] Already exists, skipping...');
        return;
    }

    /**
     * CalibrationObserver
     *
     * 观察学习者行为中的校准模式
     * 
     * 证据来源:
     * 1. 自我评估 (来自 MetacognitiveExperience)
     * 2. 表现结果 (来自 OutcomeNormalizer)
     * 3. 预测 vs 实际 (来自 ActionTracker)
     */
    var CalibrationObserver = {
        version: '1.0.0',
        initialized: false,

        _observations: [],
        _maxObservations: 200,
        _minEvidenceForPattern: 3,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[CalibrationObserver] Already initialized');
                return this;
            }

            console.log('[CalibrationObserver] 🚀 Initializing...');
            this._loadObservations();
            this.initialized = true;
            console.log('[CalibrationObserver] ✅ Initialized');
            return this;
        },

        /**
         * 观察校准
         * @param {Object} context — 上下文
         * @returns {Array} 校准观察
         */
        observe: function(context) {
            var observations = [];

            // 1. 从自我评估观察
            var selfAssessments = this._observeFromSelfAssessment(context);
            observations = observations.concat(selfAssessments);

            // 2. 从表现结果观察
            var outcomeObservations = this._observeFromOutcomes(context);
            observations = observations.concat(outcomeObservations);

            // 3. 从预测观察
            var predictionObservations = this._observeFromPredictions(context);
            observations = observations.concat(predictionObservations);

            // 4. 存储观察
            for (var i = 0; i < observations.length; i++) {
                this._observations.push(observations[i]);
                if (this._observations.length > this._maxObservations) {
                    this._observations.shift();
                }
            }

            this._saveObservations();

            return observations;
        },

        /**
         * 获取校准观察
         * @param {Object} filters — 过滤条件
         * @param {string} filters.conceptId — 概念 ID
         * @param {string} filters.calibrationState — 校准状态
         * @param {number} filters.limit — 最大数量
         * @returns {Array} 观察列表
         */
        getObservations: function(filters) {
            filters = filters || {};
            var observations = this._observations.slice().reverse();

            if (filters.conceptId) {
                observations = observations.filter(function(o) {
                    return o.conceptId === filters.conceptId;
                });
            }

            if (filters.calibrationState) {
                observations = observations.filter(function(o) {
                    return o.calibrationState === filters.calibrationState;
                });
            }

            if (filters.limit) {
                observations = observations.slice(0, filters.limit);
            }

            return observations;
        },

        /**
         * 获取校准模式
         * @param {string} conceptId — 概念 ID
         * @param {Object} context — 上下文
         * @returns {Object} 校准模式
         */
        getCalibrationPattern: function(conceptId, context) {
            var observations = this.getObservations({ conceptId: conceptId });
            if (observations.length < this._minEvidenceForPattern) {
                return {
                    state: 'UNKNOWN',
                    label: 'Not enough evidence',
                    confidenceCount: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                    outcomeCount: { CORRECT: 0, INCORRECT: 0, PARTIAL: 0 },
                    calibrationCount: { CALIBRATED: 0, OVERCONFIDENT: 0, UNDERCONFIDENT: 0 },
                    recentTrend: null,
                    total: observations.length
                };
            }

            var stats = {
                state: 'UNKNOWN',
                label: 'Not enough evidence',
                confidenceCount: { LOW: 0, MEDIUM: 0, HIGH: 0 },
                outcomeCount: { CORRECT: 0, INCORRECT: 0, PARTIAL: 0 },
                calibrationCount: { CALIBRATED: 0, OVERCONFIDENT: 0, UNDERCONFIDENT: 0 },
                recentTrend: null,
                total: observations.length
            };

            for (var i = 0; i < observations.length; i++) {
                var o = observations[i];
                stats.confidenceCount[o.confidence] = (stats.confidenceCount[o.confidence] || 0) + 1;
                stats.outcomeCount[o.outcome] = (stats.outcomeCount[o.outcome] || 0) + 1;
                stats.calibrationCount[o.calibrationState] = (stats.calibrationCount[o.calibrationState] || 0) + 1;
            }

            // 确定主要校准状态
            var maxState = null;
            var maxCount = 0;
            for (var state in stats.calibrationCount) {
                if (stats.calibrationCount[state] > maxCount) {
                    maxCount = stats.calibrationCount[state];
                    maxState = state;
                }
            }

            if (maxState && maxCount >= this._minEvidenceForPattern) {
                stats.state = maxState;
                stats.label = this._getStateLabel(maxState);
            }

            // 检测近期趋势 (最近 5 次)
            var recent = observations.slice(0, 5);
            if (recent.length >= 3) {
                var overconfidentRecent = recent.filter(function(o) {
                    return o.calibrationState === 'OVERCONFIDENT';
                }).length;
                var underconfidentRecent = recent.filter(function(o) {
                    return o.calibrationState === 'UNDERCONFIDENT';
                }).length;

                if (overconfidentRecent > underconfidentRecent && overconfidentRecent >= 2) {
                    stats.recentTrend = 'overconfident';
                } else if (underconfidentRecent > overconfidentRecent && underconfidentRecent >= 2) {
                    stats.recentTrend = 'underconfident';
                } else {
                    stats.recentTrend = 'mixed';
                }
            }

            return stats;
        },

        /**
         * 获取最近的校准洞察
         * @param {Object} context — 上下文
         * @param {number} limit — 最大数量
         * @returns {Array} 洞察列表
         */
        getRecentInsights: function(context, limit) {
            limit = limit || 3;
            var insights = [];
            var observations = this._observations.slice(-10).reverse();

            if (observations.length < 2) return insights;

            // 检查是否有校准差距模式
            var overconfident = observations.filter(function(o) {
                return o.calibrationState === 'OVERCONFIDENT';
            });
            var underconfident = observations.filter(function(o) {
                return o.calibrationState === 'UNDERCONFIDENT';
            });

            if (overconfident.length >= 2) {
                insights.push({
                    type: 'OVERCONFIDENT_PATTERN',
                    label: 'Confidence vs Performance',
                    description: 'You have recently been confident on tasks that turned out differently than expected.',
                    evidence: overconfident.length + ' recent tasks showed this pattern',
                    isOptional: true
                });
            }

            if (underconfident.length >= 2) {
                insights.push({
                    type: 'UNDERCONFIDENT_PATTERN',
                    label: 'Confidence vs Performance',
                    description: 'You have recently been uncertain but performed well.',
                    evidence: underconfident.length + ' recent tasks showed this pattern',
                    isOptional: true
                });
            }

            // 检查是否有改进趋势
            var recent = observations.slice(0, 3);
            var calibrated = recent.filter(function(o) {
                return o.calibrationState === 'CALIBRATED';
            });
            if (calibrated.length >= 2) {
                insights.push({
                    type: 'IMPROVING_CALIBRATION',
                    label: 'Calibration Improving',
                    description: 'Your recent predictions have been closer to your actual results.',
                    evidence: calibrated.length + ' of the last 3 tasks were well-calibrated',
                    isOptional: true
                });
            }

            return insights.slice(0, limit);
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._observations.length,
                byCalibrationState: {},
                byConfidence: {},
                byOutcome: {},
                recent: this._observations.slice(-5).reverse()
            };

            for (var i = 0; i < this._observations.length; i++) {
                var o = this._observations[i];
                stats.byCalibrationState[o.calibrationState] = (stats.byCalibrationState[o.calibrationState] || 0) + 1;
                stats.byConfidence[o.confidence] = (stats.byConfidence[o.confidence] || 0) + 1;
                stats.byOutcome[o.outcome] = (stats.byOutcome[o.outcome] || 0) + 1;
            }

            return stats;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                observationCount: this._observations.length
            };
        },

        // ============================================================
        // PRIVATE — Observation Methods
        // ============================================================

        _observeFromSelfAssessment: function(context) {
            var observations = [];
            var model = window.LawAIApp?.CalibrationModel;
            if (!model) return observations;

            var metacognitive = window.LawAIApp?.MetacognitiveExperience;
            if (!metacognitive) return observations;

            try {
                var assessments = metacognitive.getSelfAssessments();
                if (!assessments || assessments.length === 0) return observations;

                for (var i = 0; i < assessments.length; i++) {
                    var a = assessments[i];
                    var confidence = this._mapConfidence(a.confidence);
                    var outcome = a.metadata?.outcome || 'PARTIAL';

                    var observation = model.createObservation({
                        learnerId: 'default',
                        conceptId: a.topic || 'unknown',
                        confidence: confidence,
                        outcome: outcome,
                        taskId: a.lessonId || 'unknown',
                        taskDifficulty: a.metadata?.difficulty || null,
                        isNovel: a.metadata?.isNovel || false,
                        assistanceLevel: a.metadata?.assistance || 'NONE',
                        metadata: { source: 'self_assessment', assessmentId: a.id }
                    });

                    observations.push(observation);
                }
            } catch (e) {
                console.warn('[CalibrationObserver] Self-assessment error:', e);
            }

            return observations;
        },

        _observeFromOutcomes: function(context) {
            var observations = [];
            var model = window.LawAIApp?.CalibrationModel;
            if (!model) return observations;

            var outcomeNormalizer = window.LawAIApp?.OutcomeNormalizer;
            if (!outcomeNormalizer) return observations;

            try {
                // 从学习状态获取结果
                var learningContext = window.LawAIApp?.LearningContext;
                if (learningContext) {
                    var ctx = learningContext.getContext();
                    if (ctx && ctx.lesson) {
                        var confidence = 'MEDIUM'; // 默认
                        var outcome = ctx.lesson.isCompleted ? 'CORRECT' : 'PARTIAL';

                        var observation = model.createObservation({
                            learnerId: 'default',
                            conceptId: ctx.lesson.id || 'unknown',
                            confidence: confidence,
                            outcome: outcome,
                            taskId: ctx.lesson.id || 'unknown',
                            taskDifficulty: ctx.lesson.difficulty || null,
                            isNovel: false,
                            assistanceLevel: 'NONE',
                            metadata: { source: 'outcome', lessonId: ctx.lesson.id }
                        });

                        observations.push(observation);
                    }
                }
            } catch (e) {
                console.warn('[CalibrationObserver] Outcome observation error:', e);
            }

            return observations;
        },

        _observeFromPredictions: function(context) {
            var observations = [];
            var model = window.LawAIApp?.CalibrationModel;
            if (!model) return observations;

            // 从 MetacognitiveExperience 获取预测
            var metacognitive = window.LawAIApp?.MetacognitiveExperience;
            if (!metacognitive) return observations;

            try {
                var history = metacognitive.getHistory(20, 'SELF_ASSESSMENT');
                if (!history || history.length === 0) return observations;

                for (var i = 0; i < history.length; i++) {
                    var h = history[i];
                    if (h.confidence && h.metadata?.outcome) {
                        var confidence = this._mapConfidence(h.confidence);
                        var outcome = h.metadata.outcome;

                        var observation = model.createObservation({
                            learnerId: 'default',
                            conceptId: h.topic || 'unknown',
                            confidence: confidence,
                            outcome: outcome,
                            taskId: h.lessonId || 'unknown',
                            taskDifficulty: h.metadata?.difficulty || null,
                            isNovel: h.metadata?.isNovel || false,
                            assistanceLevel: h.metadata?.assistance || 'NONE',
                            metadata: { source: 'prediction', historyId: h.id }
                        });

                        observations.push(observation);
                    }
                }
            } catch (e) {
                console.warn('[CalibrationObserver] Prediction observation error:', e);
            }

            return observations;
        },

        _mapConfidence: function(value) {
            var model = window.LawAIApp?.CalibrationModel;
            if (!model) return 'MEDIUM';

            if (typeof value === 'number') {
                if (value >= 4) return model.CONFIDENCE.HIGH;
                if (value >= 2) return model.CONFIDENCE.MEDIUM;
                return model.CONFIDENCE.LOW;
            }

            if (typeof value === 'string') {
                var lower = value.toLowerCase();
                if (lower.indexOf('high') !== -1 || lower.indexOf('very') !== -1) {
                    return model.CONFIDENCE.HIGH;
                }
                if (lower.indexOf('low') !== -1 || lower.indexOf('not') !== -1) {
                    return model.CONFIDENCE.LOW;
                }
                return model.CONFIDENCE.MEDIUM;
            }

            return model.CONFIDENCE.MEDIUM;
        },

        _getStateLabel: function(state) {
            var model = window.LawAIApp?.CalibrationModel;
            return model ? model.getStateLabel(state) : state || 'Unknown';
        },

        _loadObservations: function() {
            try {
                var saved = localStorage.getItem('calibrationObservations');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.observations) {
                        this._observations = data.observations;
                        console.log('[CalibrationObserver] Loaded', this._observations.length, 'observations');
                    }
                }
            } catch (e) {
                // ignore
            }
        },

        _saveObservations: function() {
            try {
                localStorage.setItem('calibrationObservations', JSON.stringify({
                    observations: this._observations.slice(-this._maxObservations),
                    updatedAt: Date.now()
                }));
            } catch (e) {
                // ignore
            }
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CalibrationObserver = CalibrationObserver;

    function autoInit() {
        if (!CalibrationObserver.initialized) {
            CalibrationObserver.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 500);
        });
    }

    console.log('[CalibrationObserver] Module loaded (Part 62)');

})();
