// js/academy/learnerControl.js
// Part 58 — Learner Control Integration
// Law AI Academy Developer Bible
//
// PURPOSE: Provide learner control over recommendations and adaptations
// RULES: Reuse existing architecture, no new engines

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearnerControl) {
        console.log('[LearnerControl] Already exists, skipping...');
        return;
    }

    /**
     * LearnerControl
     *
     * 职责：为学习者提供对推荐和适应的控制
     * 
     * 控制能力:
     * 1. 拒绝推荐 (Reject)
     * 2. 覆盖推荐 (Override)
     * 3. 选择替代方案 (Alternative)
     * 4. 独立继续 (Independent)
     * 5. 查看 "Why this?" (Explanation)
     * 6. 查看 "Why not that?" (Counterfactual)
     */
    var LearnerControl = {
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
                console.log('[LearnerControl] Already initialized');
                return this;
            }

            console.log('[LearnerControl] 🚀 Initializing...');
            this.initialized = true;
            console.log('[LearnerControl] ✅ Initialized');
            return this;
        },

        /**
         * 拒绝推荐
         * @param {string} optionId — 选项 ID
         * @param {string} reason — 拒绝原因 (可选)
         * @returns {Object} 结果
         */
        rejectRecommendation: function(optionId, reason) {
            var de = window.LawAIApp?.DecisionExperience;
            if (!de) {
                return { success: false, error: 'DecisionExperience not available' };
            }

            try {
                // 使用 dismissOption (Part 54)
                var result = de.dismissOption(optionId, reason || 'rejected');
                if (result && result.success) {
                    console.log('[LearnerControl] 📝 Recommendation rejected:', optionId, reason);
                    this._emit('RECOMMENDATION_REJECTED', { optionId: optionId, reason: reason });
                }
                return result || { success: false, error: 'Dismiss failed' };
            } catch (e) {
                console.warn('[LearnerControl] Reject failed:', e);
                return { success: false, error: e.message };
            }
        },

        /**
         * 覆盖推荐 (选择替代方案)
         * @param {string} optionId — 选项 ID
         * @param {string} alternativeId — 替代方案 ID
         * @returns {Object} 结果
         */
        overrideRecommendation: function(optionId, alternativeId) {
            var de = window.LawAIApp?.DecisionExperience;
            if (!de) {
                return { success: false, error: 'DecisionExperience not available' };
            }

            try {
                // 先关闭原推荐
                de.dismissOption(optionId, 'overridden');

                // 选择替代方案
                var result = de.selectOption(alternativeId, { override: true, originalOption: optionId });
                if (result && result.success) {
                    console.log('[LearnerControl] 🔄 Recommendation overridden:', optionId, '→', alternativeId);
                    this._emit('RECOMMENDATION_OVERRIDDEN', { optionId: optionId, alternativeId: alternativeId });
                }
                return result || { success: false, error: 'Select failed' };
            } catch (e) {
                console.warn('[LearnerControl] Override failed:', e);
                return { success: false, error: e.message };
            }
        },

        /**
         * 选择替代方案
         * @param {string} optionId — 选项 ID
         * @returns {Object} 结果
         */
        selectAlternative: function(optionId) {
            var de = window.LawAIApp?.DecisionExperience;
            if (!de) {
                return { success: false, error: 'DecisionExperience not available' };
            }

            try {
                var result = de.selectOption(optionId);
                if (result && result.success) {
                    console.log('[LearnerControl] ✅ Alternative selected:', optionId);
                    this._emit('ALTERNATIVE_SELECTED', { optionId: optionId });
                }
                return result || { success: false, error: 'Select failed' };
            } catch (e) {
                console.warn('[LearnerControl] Select alternative failed:', e);
                return { success: false, error: e.message };
            }
        },

        /**
         * 获取 "Why this?" 解释
         * @param {string} optionId — 选项 ID
         * @returns {Object} 解释对象
         */
        getWhyThis: function(optionId) {
            var de = window.LawAIApp?.DecisionExperience;
            var explainer = window.LawAIApp?.AdaptationExplainer;

            if (!de) {
                return { available: false, error: 'DecisionExperience not available' };
            }

            try {
                // 获取选项解释
                var explanation = de.getExplanation(optionId);
                if (!explanation || !explanation.available) {
                    return { available: false, error: 'Explanation not available' };
                }

                // 如果有 AdaptationExplainer，增强解释
                if (explainer) {
                    var record = window.LawAIApp?.AdaptationRecord;
                    if (record) {
                        var records = record.getRecords(5);
                        for (var i = 0; i < records.length; i++) {
                            if (records[i].metadata && records[i].metadata.optionId === optionId) {
                                var enhanced = explainer.explainStandard(records[i]);
                                if (enhanced) {
                                    explanation.enhancedReason = enhanced.text;
                                    break;
                                }
                            }
                        }
                    }
                }

                return {
                    available: true,
                    optionId: optionId,
                    reason: explanation.reason || 'No specific reason provided',
                    evidence: explanation.evidence || [],
                    authority: explanation.authority || { label: 'Option' },
                    source: explanation.source || 'Unknown',
                    optional: explanation.optional !== false
                };
            } catch (e) {
                console.warn('[LearnerControl] Why this failed:', e);
                return { available: false, error: e.message };
            }
        },

        /**
         * 获取 "Why not that?" 解释
         * @param {string} optionId — 被排除的选项 ID
         * @param {string} context — 上下文
         * @returns {Object} 解释对象
         */
        getWhyNotThat: function(optionId, context) {
            var de = window.LawAIApp?.DecisionExperience;
            var primacy = window.LawAIApp?.DecisionPrimacy;

            if (!de) {
                return { available: false, error: 'DecisionExperience not available' };
            }

            try {
                var options = de.getOptions({ includeDismissed: false });
                if (!options || options.length === 0) {
                    return { available: false, error: 'No options available' };
                }

                // 查找目标选项
                var targetOption = null;
                var primaryOption = null;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].id === optionId) {
                        targetOption = options[i];
                    }
                }

                if (!targetOption) {
                    return { available: false, error: 'Option not found' };
                }

                // 获取主要选项
                if (primacy) {
                    primaryOption = primacy.getPrimary(options, context);
                }

                // 构建解释
                var reasons = [];
                if (primaryOption && primaryOption.id !== optionId) {
                    var authority = window.LawAIApp?.DecisionAuthority;
                    if (authority) {
                        var levelA = authority.getAuthorityLevel(primaryOption, context);
                        var levelB = authority.getAuthorityLevel(targetOption, context);
                        if (levelA > levelB) {
                            reasons.push('Higher authority: ' + authority.getAuthorityLabel(primaryOption, context));
                        }
                        if (primaryOption.priority < targetOption.priority) {
                            reasons.push('Higher priority');
                        }
                    }
                    if (primaryOption.reason) {
                        reasons.push(primaryOption.reason);
                    }
                }

                if (reasons.length === 0) {
                    reasons.push('Other options were more relevant to your current learning context.');
                }

                return {
                    available: true,
                    optionId: optionId,
                    primaryOption: primaryOption ? primaryOption.id : null,
                    reasons: reasons,
                    isOptional: targetOption.optional !== false
                };
            } catch (e) {
                console.warn('[LearnerControl] Why not that failed:', e);
                return { available: false, error: e.message };
            }
        },

        /**
         * 获取学习控制状态
         * @returns {Object} 状态
         */
        getStatus: function() {
            var de = window.LawAIApp?.DecisionExperience;
            var options = de ? de.getOptions({ includeDismissed: false }) : [];

            return {
                version: this.version,
                initialized: this.initialized,
                availableOptions: options.length,
                hasDecisionExperience: !!de
            };
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('learner.' + eventName, data);
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

    window.LawAIApp.LearnerControl = LearnerControl;

    function autoInit() {
        if (!LearnerControl.initialized) {
            LearnerControl.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[LearnerControl] Module loaded (Part 58)');

})();
