// js/academy/outcomeNormalizer.js
// Part 55 — Outcome Normalizer
// Law AI Academy Developer Bible
//
// PURPOSE: Normalize outcomes from authoritative sources
// OWNERSHIP: NORMALIZATION layer — no state, read-only
// RULES: ACTION ≠ OUTCOME, OUTCOME ≠ MASTERY

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OutcomeNormalizer) {
        console.log('[OutcomeNormalizer] Already exists, skipping...');
        return;
    }

    /**
     * OutcomeNormalizer
     *
     * 职责：从权威来源标准化结果
     * 
     * OUTCOME TYPES:
     *   STARTED, RESUMED, COMPLETED, ABANDONED,
     *   DISMISSED, SKIPPED, RETURNED, ALTERNATIVE_SELECTED,
     *   FEEDBACK_RECEIVED
     * 
     * 规则：
     *   - 不从 UI 渲染推断结果
     *   - COMPLETED ≠ MASTERED
     *   - 必须来自权威来源
     */
    var OutcomeNormalizer = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // OUTCOME TYPES (Part 55)
        // ============================================================

        TYPES: {
            STARTED: 'STARTED',
            RESUMED: 'RESUMED',
            COMPLETED: 'COMPLETED',
            ABANDONED: 'ABANDONED',
            DISMISSED: 'DISMISSED',
            SKIPPED: 'SKIPPED',
            RETURNED: 'RETURNED',
            ALTERNATIVE_SELECTED: 'ALTERNATIVE_SELECTED',
            FEEDBACK_RECEIVED: 'FEEDBACK_RECEIVED'
        },

        // ============================================================
        // OUTCOME SOURCES (Part 55)
        // ============================================================

        SOURCES: {
            LESSON_PROGRESS: 'LESSON_PROGRESS',
            COURSE_PROGRESS: 'COURSE_PROGRESS',
            MODULE_PROGRESS: 'MODULE_PROGRESS',
            ACTIVITY_STATE: 'ACTIVITY_STATE',
            CALENDAR_STATE: 'CALENDAR_STATE',
            NOTES_STATE: 'NOTES_STATE',
            LEARNER_FEEDBACK: 'LEARNER_FEEDBACK',
            DECISION_SELECTION: 'DECISION_SELECTION',
            PRACTICE_STATE: 'PRACTICE_STATE',
            REVIEW_STATE: 'REVIEW_STATE'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[OutcomeNormalizer] Already initialized');
                return this;
            }

            console.log('[OutcomeNormalizer] 🚀 Initializing...');
            this.initialized = true;
            console.log('[OutcomeNormalizer] ✅ Initialized');
            return this;
        },

        /**
         * 从学习状态标准化结果
         * @param {Object} state — 学习状态 (来自 LearningJourneyAdapter)
         * @param {Object} context — 上下文
         * @returns {Array} 标准化结果列表
         */
        fromLearningState: function(state, context) {
            if (!state) return [];

            var outcomes = [];
            var now = Date.now();

            // ── 检查当前 Lesson ──
            if (state.currentLessonId) {
                var isCompleted = state.completedLessons && state.completedLessons.indexOf(state.currentLessonId) !== -1;
                var isActive = state.sessionStatus === 'active';

                if (isCompleted) {
                    outcomes.push(this._createOutcome({
                        type: this.TYPES.COMPLETED,
                        target: state.currentLessonId,
                        source: this.SOURCES.LESSON_PROGRESS,
                        evidence: ['Lesson marked completed in authoritative state'],
                        metadata: { progress: state.progress || 0 }
                    }));
                } else if (isActive) {
                    outcomes.push(this._createOutcome({
                        type: this.TYPES.STARTED,
                        target: state.currentLessonId,
                        source: this.SOURCES.ACTIVITY_STATE,
                        evidence: ['Active session detected'],
                        metadata: { sessionStatus: 'active' }
                    }));
                }
            }

            // ── 检查完成列表 ──
            if (state.completedLessons && state.completedLessons.length > 0) {
                var recentCompleted = state.completedLessons.slice(-5);
                for (var i = 0; i < recentCompleted.length; i++) {
                    // 避免重复
                    var exists = false;
                    for (var j = 0; j < outcomes.length; j++) {
                        if (outcomes[j].target === recentCompleted[i] && outcomes[j].type === this.TYPES.COMPLETED) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        outcomes.push(this._createOutcome({
                            type: this.TYPES.COMPLETED,
                            target: recentCompleted[i],
                            source: this.SOURCES.LESSON_PROGRESS,
                            evidence: ['Found in completed lessons list'],
                            metadata: { completedAt: state.lastActivity || null }
                        }));
                    }
                }
            }

            return outcomes;
        },

        /**
         * 从动作标准化结果
         * @param {Object} action — 动作 (来自 ActionTracker)
         * @param {Object} context — 上下文
         * @returns {Object|null} 标准化结果
         */
        fromAction: function(action, context) {
            if (!action) return null;

            var typeMap = {
                'START': this.TYPES.STARTED,
                'RESUME': this.TYPES.RESUMED,
                'COMPLETE': this.TYPES.COMPLETED,
                'DISMISS': this.TYPES.DISMISSED,
                'SKIP': this.TYPES.SKIPPED,
                'RETURN': this.TYPES.RETURNED
            };

            var outcomeType = typeMap[action.type] || null;
            if (!outcomeType) return null;

            // 检查是否已有权威结果
            if (action.type === 'COMPLETE') {
                // 验证是否真的完成
                var progress = context?.learningState;
                if (progress && progress.completedLessons) {
                    var isCompleted = progress.completedLessons.indexOf(action.target) !== -1;
                    if (!isCompleted) {
                        // 动作说完成，但权威状态说没完成 → 不创建虚假结果
                        console.warn('[OutcomeNormalizer] Action COMPLETE but authoritative state says not completed:', action.target);
                        return null;
                    }
                }
            }

            return this._createOutcome({
                type: outcomeType,
                target: action.target,
                source: this.SOURCES.ACTIVITY_STATE,
                evidence: ['Action recorded: ' + action.type],
                actionId: action.id,
                decisionId: action.decisionId,
                optionId: action.optionId,
                recommendationId: action.recommendationId,
                metadata: action.metadata || {}
            });
        },

        /**
         * 从决策标准化结果
         * @param {Object} decision — 决策记录
         * @param {Object} context — 上下文
         * @returns {Object|null} 标准化结果
         */
        fromDecision: function(decision, context) {
            if (!decision) return null;

            var option = decision.option || {};
            var typeMap = {
                'SELECTED': this.TYPES.ALTERNATIVE_SELECTED,
                'DISMISSED': this.TYPES.DISMISSED,
                'SKIPPED': this.TYPES.SKIPPED
            };

            var outcomeType = typeMap[decision.state] || null;
            if (!outcomeType) return null;

            return this._createOutcome({
                type: outcomeType,
                target: option.id || decision.optionId,
                source: this.SOURCES.DECISION_SELECTION,
                evidence: ['Decision recorded: ' + decision.state],
                decisionId: decision.optionId || null,
                optionId: decision.optionId || null,
                metadata: {
                    decisionState: decision.state,
                    optionTitle: option.title || null,
                    optionType: option.type || null
                }
            });
        },

        /**
         * 从反馈标准化结果
         * @param {Object} feedback — 反馈
         * @param {Object} context — 上下文
         * @returns {Object|null} 标准化结果
         */
        fromFeedback: function(feedback, context) {
            if (!feedback) return null;

            return this._createOutcome({
                type: this.TYPES.FEEDBACK_RECEIVED,
                target: feedback.target || feedback.optionId || 'feedback',
                source: this.SOURCES.LEARNER_FEEDBACK,
                evidence: ['Feedback submitted: ' + (feedback.value || '')],
                metadata: {
                    feedbackValue: feedback.value,
                    feedbackType: feedback.type,
                    rating: feedback.rating
                }
            });
        },

        /**
         * 从多个来源整合结果
         * @param {Object} sources — 多个来源的数据
         * @returns {Array} 标准化结果列表
         */
        normalize: function(sources) {
            var outcomes = [];

            // 1. 从学习状态
            if (sources.learningState) {
                var stateOutcomes = this.fromLearningState(sources.learningState, sources.context);
                outcomes = outcomes.concat(stateOutcomes);
            }

            // 2. 从动作
            if (sources.action) {
                var actionOutcome = this.fromAction(sources.action, sources.context);
                if (actionOutcome) {
                    outcomes.push(actionOutcome);
                }
            }

            // 3. 从决策
            if (sources.decision) {
                var decisionOutcome = this.fromDecision(sources.decision, sources.context);
                if (decisionOutcome) {
                    outcomes.push(decisionOutcome);
                }
            }

            // 4. 从反馈
            if (sources.feedback) {
                var feedbackOutcome = this.fromFeedback(sources.feedback, sources.context);
                if (feedbackOutcome) {
                    outcomes.push(feedbackOutcome);
                }
            }

            // 去重
            return this._deduplicate(outcomes);
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
        // PRIVATE
        // ============================================================

        /**
         * 创建结果对象
         * @private
         */
        _createOutcome: function(config) {
            return {
                id: 'out_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: config.type,
                target: config.target || null,
                source: config.source || 'UNKNOWN',
                evidence: config.evidence || [],
                timestamp: Date.now(),
                actionId: config.actionId || null,
                decisionId: config.decisionId || null,
                optionId: config.optionId || null,
                recommendationId: config.recommendationId || null,
                metadata: config.metadata || {},
                // 关联
                linkedOutcomes: []
            };
        },

        /**
         * 去重结果
         * @private
         */
        _deduplicate: function(outcomes) {
            var unique = {};
            var result = [];

            for (var i = 0; i < outcomes.length; i++) {
                var key = outcomes[i].type + '_' + outcomes[i].target + '_' + outcomes[i].source;
                if (!unique[key]) {
                    unique[key] = true;
                    result.push(outcomes[i]);
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

    window.LawAIApp.OutcomeNormalizer = OutcomeNormalizer;

    function autoInit() {
        if (!OutcomeNormalizer.initialized) {
            OutcomeNormalizer.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[OutcomeNormalizer] Module loaded (Part 55)');

})();
