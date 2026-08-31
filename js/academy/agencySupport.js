// js/academy/agencySupport.js
// Part 64 — Agency Support
// Law AI Academy Developer Bible
//
// PURPOSE: Ensure learners develop capability to make, act on, and reflect on decisions
// RULES: Choice is not enough — agency requires understanding + action + reflection

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AgencySupport) {
        console.log('[AgencySupport] Already exists, skipping...');
        return;
    }

    /**
     * AgencySupport
     *
     * 自主权支持 — 确保选择 + 能力 + 行动 + 反思
     * 
     * 自主权的四个条件:
     * 1. OPPORTUNITY — 有意义的选择机会
     * 2. CAPABILITY — 理解选项的能力
     * 3. ACTION — 执行选择的能力
     * 4. REFLECTION — 从结果中学习的能力
     * 
     * 规则:
     * - 不创建自主权分数
     * - 不创建个性标签
     * - 决策质量 ≠ 学习者身份
     */
    var AgencySupport = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // AGENCY CONDITIONS (Part 64)
        // ============================================================

        CONDITIONS: {
            OPPORTUNITY: 'OPPORTUNITY',
            CAPABILITY: 'CAPABILITY',
            ACTION: 'ACTION',
            REFLECTION: 'REFLECTION'
        },

        CONDITION_LABELS: {
            OPPORTUNITY: 'Opportunity',
            CAPABILITY: 'Understanding',
            ACTION: 'Action',
            REFLECTION: 'Reflection'
        },

        // ============================================================
        // DECISION QUALITY (Part 64)
        // ============================================================

        QUALITY: {
            WELL_CONSIDERED: 'WELL_CONSIDERED',
            POORLY_CONSIDERED: 'POORLY_CONSIDERED',
            CONTEXTUAL: 'CONTEXTUAL',
            UNKNOWN: 'UNKNOWN'
        },

        QUALITY_LABELS: {
            WELL_CONSIDERED: 'Well-considered',
            POORLY_CONSIDERED: 'Poorly considered',
            CONTEXTUAL: 'Context-dependent',
            UNKNOWN: 'Not enough evidence'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AgencySupport] Already initialized');
                return this;
            }

            console.log('[AgencySupport] 🚀 Initializing...');
            this.initialized = true;
            console.log('[AgencySupport] ✅ Initialized');
            console.log('[AgencySupport] 📋 Agency requires: Opportunity + Capability + Action + Reflection');
            return this;
        },

        /**
         * 评估决策是否具备自主权条件
         * @param {Object} decision — 决策对象
         * @param {Object} context — 上下文
         * @returns {Object} 自主权评估
         */
        assessAgency: function(decision, context) {
            if (!decision) {
                return {
                    conditions: {
                        opportunity: false,
                        capability: false,
                        action: false,
                        reflection: false
                    },
                    hasAgency: false,
                    missing: ['opportunity', 'capability', 'action', 'reflection'],
                    label: 'No decision to assess'
                };
            }

            var conditions = {
                opportunity: this._hasOpportunity(decision, context),
                capability: this._hasCapability(decision, context),
                action: this._hasAction(decision, context),
                reflection: this._hasReflection(decision, context)
            };

            var hasAgency = conditions.opportunity && conditions.capability && conditions.action && conditions.reflection;

            var missing = [];
            for (var key in conditions) {
                if (!conditions[key]) {
                    missing.push(key);
                }
            }

            return {
                conditions: conditions,
                hasAgency: hasAgency,
                missing: missing,
                label: hasAgency ? 'Full agency' : 'Partial agency',
                decisionId: decision.id || 'unknown'
            };
        },

        /**
         * 获取决策质量
         * @param {Object} decision — 决策对象
         * @param {Object} context — 上下文
         * @returns {Object} 决策质量
         */
        getDecisionQuality: function(decision, context) {
            if (!decision) {
                return {
                    quality: this.QUALITY.UNKNOWN,
                    label: this.QUALITY_LABELS.UNKNOWN,
                    reason: 'No decision to evaluate'
                };
            }

            // 检查是否有足够的证据
            var hasEvidence = decision.evidence && decision.evidence.length > 0;
            var hasReasoning = decision.reasoning || decision.reason;
            var hasOutcome = decision.outcome !== undefined;

            if (!hasEvidence && !hasReasoning) {
                return {
                    quality: this.QUALITY.UNKNOWN,
                    label: this.QUALITY_LABELS.UNKNOWN,
                    reason: 'Insufficient evidence to evaluate decision quality'
                };
            }

            // 评估决策过程
            var processQuality = this._evaluateProcess(decision, context);

            // 评估结果
            var outcomeQuality = this._evaluateOutcome(decision, context);

            // 判断整体质量
            if (processQuality === 'well_considered' && outcomeQuality === 'successful') {
                return {
                    quality: this.QUALITY.WELL_CONSIDERED,
                    label: this.QUALITY_LABELS.WELL_CONSIDERED,
                    reason: 'Decision was well-considered and led to a successful outcome',
                    processQuality: processQuality,
                    outcomeQuality: outcomeQuality
                };
            }

            if (processQuality === 'well_considered' && outcomeQuality === 'unsuccessful') {
                return {
                    quality: this.QUALITY.CONTEXTUAL,
                    label: this.QUALITY_LABELS.CONTEXTUAL,
                    reason: 'Decision was well-considered but outcome was not successful — context matters',
                    processQuality: processQuality,
                    outcomeQuality: outcomeQuality
                };
            }

            if (processQuality === 'poorly_considered' && outcomeQuality === 'successful') {
                return {
                    quality: this.QUALITY.CONTEXTUAL,
                    label: this.QUALITY_LABELS.CONTEXTUAL,
                    reason: 'Decision process was weak but outcome was successful — avoid overgeneralization',
                    processQuality: processQuality,
                    outcomeQuality: outcomeQuality
                };
            }

            return {
                quality: this.QUALITY.UNKNOWN,
                label: this.QUALITY_LABELS.UNKNOWN,
                reason: 'Insufficient evidence to determine decision quality',
                processQuality: processQuality,
                outcomeQuality: outcomeQuality
            };
        },

        /**
         * 获取自主权支持建议
         * @param {Object} decision — 决策对象
         * @param {Object} context — 上下文
         * @returns {Array} 建议列表
         */
        getAgencySuggestions: function(decision, context) {
            var suggestions = [];
            var assessment = this.assessAgency(decision, context);

            for (var i = 0; i < assessment.missing.length; i++) {
                var condition = assessment.missing[i];
                switch (condition) {
                    case 'opportunity':
                        suggestions.push({
                            condition: condition,
                            label: 'More choice needed',
                            suggestion: 'Consider offering meaningful alternatives.'
                        });
                        break;
                    case 'capability':
                        suggestions.push({
                            condition: condition,
                            label: 'More understanding needed',
                            suggestion: 'Provide explanation, comparison, or examples.'
                        });
                        break;
                    case 'action':
                        suggestions.push({
                            condition: condition,
                            label: 'Action support needed',
                            suggestion: 'Ensure the learner can actually enact the decision.'
                        });
                        break;
                    case 'reflection':
                        suggestions.push({
                            condition: condition,
                            label: 'Reflection support needed',
                            suggestion: 'Offer optional reflection after the decision.'
                        });
                        break;
                }
            }

            return suggestions;
        },

        /**
         * 检查决策是否有足够的信息
         * @param {Object} decision — 决策对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isInformed: function(decision, context) {
            if (!decision) return false;

            // 检查是否有解释
            if (decision.explanation || decision.reason) {
                return true;
            }

            // 检查是否有比较
            if (decision.alternatives && decision.alternatives.length > 0) {
                return true;
            }

            // 检查是否有证据
            if (decision.evidence && decision.evidence.length > 0) {
                return true;
            }

            return false;
        },

        /**
         * 检查决策是否可执行
         * @param {Object} decision — 决策对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isActionable: function(decision, context) {
            if (!decision) return false;

            // 检查是否有动作
            if (decision.action) {
                return true;
            }

            // 检查是否有目标
            if (decision.target || decision.targetId) {
                return true;
            }

            return false;
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
        // PRIVATE — Condition Checks
        // ============================================================

        /**
         * 检查是否有机会
         * @private
         */
        _hasOpportunity: function(decision, context) {
            if (!decision) return false;

            // 如果有多个选项
            if (decision.options && decision.options.length > 1) {
                return true;
            }

            // 如果有替代方案
            if (decision.alternatives && decision.alternatives.length > 0) {
                return true;
            }

            // 如果只有一个选项，检查是否真正可选
            if (decision.options && decision.options.length === 1) {
                // 如果选项标记为可选，仍有机会
                if (decision.options[0].optional !== false) {
                    return true;
                }
                return false;
            }

            return false;
        },

        /**
         * 检查是否有能力
         * @private
         */
        _hasCapability: function(decision, context) {
            if (!decision) return false;

            // 检查是否有解释
            if (decision.explanation || decision.reason || decision.rationale) {
                return true;
            }

            // 检查是否有比较信息
            if (decision.comparison || decision.tradeoffs) {
                return true;
            }

            // 检查是否有证据
            if (decision.evidence && decision.evidence.length > 0) {
                return true;
            }

            // 检查是否有上下文
            if (decision.context || decision.metadata) {
                return true;
            }

            return false;
        },

        /**
         * 检查是否有行动
         * @private
         */
        _hasAction: function(decision, context) {
            if (!decision) return false;

            // 检查是否有动作
            if (decision.action || decision.actionId) {
                return true;
            }

            // 检查是否已执行
            if (decision.executedAt || decision.timestamp) {
                return true;
            }

            // 检查是否有目标
            if (decision.target || decision.targetId) {
                return true;
            }

            return false;
        },

        /**
         * 检查是否有反思
         * @private
         */
        _hasReflection: function(decision, context) {
            if (!decision) return false;

            // 检查是否有反思
            if (decision.reflection || decision.learned) {
                return true;
            }

            // 检查是否有反馈
            if (decision.feedback || decision.rating) {
                return true;
            }

            // 检查是否有结果比较
            if (decision.outcome && decision.expectedOutcome) {
                return true;
            }

            // 检查是否有后续决策
            if (decision.nextDecision || decision.followUp) {
                return true;
            }

            return false;
        },

        /**
         * 评估决策过程
         * @private
         */
        _evaluateProcess: function(decision, context) {
            var hasEvidence = decision.evidence && decision.evidence.length > 0;
            var hasReasoning = decision.reasoning || decision.reason;
            var hasComparison = decision.alternatives && decision.alternatives.length > 0;

            if (hasEvidence && hasReasoning && hasComparison) {
                return 'well_considered';
            }

            if (hasEvidence || hasReasoning) {
                return 'partially_considered';
            }

            return 'poorly_considered';
        },

        /**
         * 评估结果
         * @private
         */
        _evaluateOutcome: function(decision, context) {
            var outcome = decision.outcome;

            if (outcome === 'success' || outcome === 'completed' || outcome === 'correct') {
                return 'successful';
            }

            if (outcome === 'partial' || outcome === 'progress') {
                return 'partial';
            }

            if (outcome === 'failure' || outcome === 'incorrect' || outcome === 'abandoned') {
                return 'unsuccessful';
            }

            return 'unknown';
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('agency.' + eventName, data);
                }
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

    window.LawAIApp.AgencySupport = AgencySupport;

    function autoInit() {
        if (!AgencySupport.initialized) {
            AgencySupport.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AgencySupport] Module loaded (Part 64)');

})();
