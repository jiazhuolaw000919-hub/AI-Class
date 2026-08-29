// js/academy/adaptationExplainer.js
// Part 56 — Adaptation Explainer
// Law AI Academy Developer Bible
//
// PURPOSE: Generate human-readable explanations for adaptations
// LEVELS: SHORT, STANDARD, DETAILED
// RULES: Grounded in evidence, no fabricated reasons, no raw model output

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AdaptationExplainer) {
        console.log('[AdaptationExplainer] Already exists, skipping...');
        return;
    }

    /**
     * AdaptationExplainer
     *
     * 职责：为适应生成可理解的解释
     * 
     * 解释级别:
     *   SHORT: "Based on your recent activity."
     *   STANDARD: "You've recently revisited authentication, so related review options are shown."
     *   DETAILED: "You completed two authentication lessons and revisited HTTP concepts recently. These options connect those topics."
     */
    var AdaptationExplainer = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // EXPLANATION LEVELS (Part 56)
        // ============================================================

        LEVELS: {
            SHORT: 'SHORT',
            STANDARD: 'STANDARD',
            DETAILED: 'DETAILED'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AdaptationExplainer] Already initialized');
                return this;
            }

            console.log('[AdaptationExplainer] 🚀 Initializing...');
            this.initialized = true;
            console.log('[AdaptationExplainer] ✅ Initialized');
            return this;
        },

        /**
         * 生成适应解释
         * @param {Object} adaptation — 适应记录
         * @param {string} level — 解释级别 (SHORT, STANDARD, DETAILED)
         * @param {Object} context — 上下文
         * @returns {Object} 解释对象
         */
        explain: function(adaptation, level, context) {
            if (!adaptation) {
                return this._fallbackExplanation('No adaptation data available');
            }

            level = level || this.LEVELS.STANDARD;

            // 验证级别
            var validLevels = Object.values(this.LEVELS);
            if (validLevels.indexOf(level) === -1) {
                level = this.LEVELS.STANDARD;
            }

            // 生成解释
            var explanation = this._generateExplanation(adaptation, level, context);

            // 验证解释 (必须有证据支撑)
            if (!this._validateExplanation(explanation, adaptation)) {
                console.warn('[AdaptationExplainer] Explanation validation failed, using fallback');
                return this._fallbackExplanation(adaptation.reason || 'Adaptation applied');
            }

            return explanation;
        },

        /**
         * 生成短解释
         * @param {Object} adaptation — 适应记录
         * @param {Object} context — 上下文
         * @returns {string} 短解释
         */
        explainShort: function(adaptation, context) {
            var result = this.explain(adaptation, this.LEVELS.SHORT, context);
            return result ? result.text : 'Based on your recent activity.';
        },

        /**
         * 生成标准解释
         * @param {Object} adaptation — 适应记录
         * @param {Object} context — 上下文
         * @returns {string} 标准解释
         */
        explainStandard: function(adaptation, context) {
            var result = this.explain(adaptation, this.LEVELS.STANDARD, context);
            return result ? result.text : 'Related to your recent learning.';
        },

        /**
         * 生成详细解释
         * @param {Object} adaptation — 适应记录
         * @param {Object} context — 上下文
         * @returns {string} 详细解释
         */
        explainDetailed: function(adaptation, context) {
            var result = this.explain(adaptation, this.LEVELS.DETAILED, context);
            return result ? result.text : 'Based on your recent learning activity in this area.';
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
        // PRIVATE — Explanation Generation
        // ============================================================

        _generateExplanation: function(adaptation, level, context) {
            var trigger = adaptation.trigger || 'UNKNOWN';
            var evidence = adaptation.evidence || [];
            var reason = adaptation.reason || '';
            var levelLabel = adaptation.levelLabel || 'Adaptation';

            var text = '';
            var evidenceText = '';
            var detailText = '';

            // 构建证据文本
            if (evidence.length > 0) {
                evidenceText = evidence.slice(0, 3).join(', ');
                if (evidence.length > 3) {
                    evidenceText += ' and ' + (evidence.length - 3) + ' more';
                }
            }

            // 根据触发器生成解释
            switch (trigger) {
                case 'LEARNER_ACTION':
                    text = this._explainLearnerAction(adaptation, evidenceText, context);
                    break;
                case 'LEARNING_OUTCOME':
                    text = this._explainLearningOutcome(adaptation, evidenceText, context);
                    break;
                case 'EXPLICIT_PREFERENCE':
                    text = this._explainExplicitPreference(adaptation, evidenceText, context);
                    break;
                case 'GOAL_CHANGE':
                    text = this._explainGoalChange(adaptation, evidenceText, context);
                    break;
                case 'SCHEDULE_CONTEXT':
                    text = this._explainScheduleContext(adaptation, evidenceText, context);
                    break;
                case 'RETENTION_SIGNAL':
                    text = this._explainRetentionSignal(adaptation, evidenceText, context);
                    break;
                case 'RECOMMENDATION_OUTCOME':
                    text = this._explainRecommendationOutcome(adaptation, evidenceText, context);
                    break;
                case 'FEEDBACK':
                    text = this._explainFeedback(adaptation, evidenceText, context);
                    break;
                default:
                    text = reason || 'Adaptation applied based on learning context.';
            }

            // 根据级别调整
            if (level === this.LEVELS.SHORT) {
                text = this._shorten(text);
            } else if (level === this.LEVELS.DETAILED && evidence.length > 0) {
                text = text + ' ' + this._addDetail(adaptation, evidenceText);
            }

            return {
                text: text,
                evidence: evidence,
                level: level,
                levelLabel: this._getLevelLabel(level),
                trigger: trigger,
                timestamp: Date.now()
            };
        },

        /**
         * 解释学习者动作触发器
         * @private
         */
        _explainLearnerAction: function(adaptation, evidenceText, context) {
            var target = adaptation.metadata?.target || 'learning';
            var actionType = adaptation.metadata?.actionType || 'activity';

            if (evidenceText) {
                return 'Based on your recent ' + actionType + ' on ' + target + ' (' + evidenceText + ').';
            }
            return 'Based on your recent ' + actionType + ' on ' + target + '.';
        },

        /**
         * 解释学习结果触发器
         * @private
         */
        _explainLearningOutcome: function(adaptation, evidenceText, context) {
            var outcomeType = adaptation.metadata?.outcomeType || 'completion';
            var target = adaptation.metadata?.target || 'lesson';

            if (evidenceText) {
                return 'You recently ' + outcomeType + ' ' + target + ' (' + evidenceText + '). Related options are shown.';
            }
            return 'You recently ' + outcomeType + ' ' + target + '. Related options are shown.';
        },

        /**
         * 解释明确偏好触发器
         * @private
         */
        _explainExplicitPreference: function(adaptation, evidenceText, context) {
            var preference = adaptation.metadata?.preference || 'this preference';

            if (evidenceText) {
                return 'You indicated a preference for ' + preference + ' (' + evidenceText + '). This is reflected in your options.';
            }
            return 'You indicated a preference for ' + preference + '. This is reflected in your options.';
        },

        /**
         * 解释目标变更触发器
         * @private
         */
        _explainGoalChange: function(adaptation, evidenceText, context) {
            var goal = adaptation.metadata?.goal || 'your goal';

            if (evidenceText) {
                return 'Your goal has been updated to ' + goal + ' (' + evidenceText + '). Options are aligned to this goal.';
            }
            return 'Your goal has been updated to ' + goal + '. Options are aligned to this goal.';
        },

        /**
         * 解释日程上下文触发器
         * @private
         */
        _explainScheduleContext: function(adaptation, evidenceText, context) {
            var scheduleItem = adaptation.metadata?.scheduleItem || 'scheduled item';

            if (evidenceText) {
                return 'You have ' + scheduleItem + ' scheduled (' + evidenceText + '). Related options are surfaced.';
            }
            return 'You have ' + scheduleItem + ' scheduled. Related options are surfaced.';
        },

        /**
         * 解释保留信号触发器
         * @private
         */
        _explainRetentionSignal: function(adaptation, evidenceText, context) {
            var concept = adaptation.metadata?.concept || 'topic';

            if (evidenceText) {
                return 'You recently reviewed ' + concept + ' (' + evidenceText + '). Review options are shown to reinforce it.';
            }
            return 'You recently reviewed ' + concept + '. Review options are shown to reinforce it.';
        },

        /**
         * 解释推荐结果触发器
         * @private
         */
        _explainRecommendationOutcome: function(adaptation, evidenceText, context) {
            var recOutcome = adaptation.metadata?.recOutcome || 'recommendation selected';

            if (evidenceText) {
                return 'You ' + recOutcome + ' (' + evidenceText + '). Similar options are now available.';
            }
            return 'You ' + recOutcome + '. Similar options are now available.';
        },

        /**
         * 解释反馈触发器
         * @private
         */
        _explainFeedback: function(adaptation, evidenceText, context) {
            var feedbackValue = adaptation.metadata?.feedbackValue || 'feedback';

            if (evidenceText) {
                return 'Your feedback (' + feedbackValue + ') was noted (' + evidenceText + '). This helps refine suggestions.';
            }
            return 'Your feedback (' + feedbackValue + ') was noted. This helps refine suggestions.';
        },

        /**
         * 缩短解释
         * @private
         */
        _shorten: function(text) {
            // 移除括号内容，缩短
            var shortened = text.replace(/\([^)]*\)/g, '');
            shortened = shortened.replace(/,\s*and\s+\d+\s+more/g, '');
            shortened = shortened.replace(/\.\s*/g, '. ');
            if (shortened.length > 60) {
                shortened = shortened.substring(0, 60) + '...';
            }
            return shortened || 'Based on your recent activity.';
        },

        /**
         * 添加细节
         * @private
         */
        _addDetail: function(adaptation, evidenceText) {
            var detail = '';
            var metadata = adaptation.metadata || {};

            if (metadata.courseTitle) {
                detail += 'Course: ' + metadata.courseTitle + '. ';
            }
            if (metadata.lessonTitle) {
                detail += 'Lesson: ' + metadata.lessonTitle + '. ';
            }
            if (evidenceText && !detail.includes(evidenceText)) {
                detail += 'Evidence: ' + evidenceText + '. ';
            }

            return detail || '';
        },

        /**
         * 验证解释
         * @private
         */
        _validateExplanation: function(explanation, adaptation) {
            if (!explanation || !explanation.text) return false;

            var text = explanation.text;

            // 禁止包含未被证据支撑的措辞
            var unsupportedPatterns = [
                /always/i,
                /never/i,
                /obviously/i,
                /clearly/i,
                /definitely/i,
                /must/i,
                /should always/i,
                /you are/i
            ];

            for (var i = 0; i < unsupportedPatterns.length; i++) {
                if (unsupportedPatterns[i].test(text)) {
                    // 如果证据中没有明确支持，拒绝
                    var evidence = adaptation.evidence || [];
                    var hasSupport = false;
                    for (var j = 0; j < evidence.length; j++) {
                        if (evidence[j].toLowerCase().indexOf('explicit') !== -1 ||
                            evidence[j].toLowerCase().indexOf('preference') !== -1) {
                            hasSupport = true;
                            break;
                        }
                    }
                    if (!hasSupport) {
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * 降级解释
         * @private
         */
        _fallbackExplanation: function(reason) {
            return {
                text: reason || 'Adaptation applied based on learning context.',
                evidence: [],
                level: 'STANDARD',
                levelLabel: 'Standard',
                trigger: 'UNKNOWN',
                timestamp: Date.now(),
                fallback: true
            };
        },

        _getLevelLabel: function(level) {
            var labels = {
                'SHORT': 'Short',
                'STANDARD': 'Standard',
                'DETAILED': 'Detailed'
            };
            return labels[level] || 'Standard';
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
            } catch (err) {
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

    window.LawAIApp.AdaptationExplainer = AdaptationExplainer;

    function autoInit() {
        if (!AdaptationExplainer.initialized) {
            AdaptationExplainer.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AdaptationExplainer] Module loaded (Part 56)');

})();
