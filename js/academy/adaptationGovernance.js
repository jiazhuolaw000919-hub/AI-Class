// js/academy/adaptationGovernance.js
// Part 56 — Adaptation Governance
// Law AI Academy Developer Bible
//
// PURPOSE: Validate adaptation against authority hierarchy
// RULES: No adaptation can override explicit learner choice, hard prerequisites, or authoritative state

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AdaptationGovernance) {
        console.log('[AdaptationGovernance] Already exists, skipping...');
        return;
    }

    /**
     * AdaptationGovernance
     *
     * 职责：验证适应是否符合权威层级
     * 
     * 权威层级:
     * 1. 显式学习者选择
     * 2. 权威学习状态
     * 3. 硬前提
     * 4. 显式学习者目标
     * 5. 日程状态
     * 6. 设置偏好
     * 7. 派生上下文
     * 8. 推荐逻辑
     * 9. 推断
     */
    var AdaptationGovernance = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // AUTHORITY LEVELS (Part 56)
        // ============================================================

        AUTHORITY_LEVELS: {
            EXPLICIT_CHOICE: 9,
            AUTHORITATIVE_STATE: 8,
            HARD_PREREQUISITE: 7,
            EXPLICIT_GOAL: 6,
            SCHEDULE: 5,
            SETTINGS: 4,
            DERIVED_CONTEXT: 3,
            RECOMMENDATION: 2,
            INFERENCE: 1
        },

        // ============================================================
        // ADAPTATION SCOPES (Part 56)
        // ============================================================

        SCOPES: {
            PRESENTATION: 'presentation',
            SUPPORT: 'support',
            SUGGESTION: 'suggestion',
            AUTHORITATIVE: 'authoritative'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AdaptationGovernance] Already initialized');
                return this;
            }

            console.log('[AdaptationGovernance] 🚀 Initializing...');
            this.initialized = true;
            console.log('[AdaptationGovernance] ✅ Initialized');
            return this;
        },

        /**
         * 验证适应是否允许
         * @param {Object} adaptation — 适应记录
         * @param {Object} context — 上下文
         * @returns {Object} { allowed: boolean, reason: string, level: number }
         */
        validate: function(adaptation, context) {
            if (!adaptation) {
                return { allowed: false, reason: 'No adaptation data', level: 0 };
            }

            var level = adaptation.level || 0;

            // ── Level 4 (权威) 永远不允许 ──
            if (level === 4) {
                return {
                    allowed: false,
                    reason: 'Level 4 (Authoritative) adaptations are not permitted in Part 56',
                    level: level
                };
            }

            // ── 检查显式学习者选择 ──
            if (this._hasExplicitChoice(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would override explicit learner choice',
                    level: this.AUTHORITY_LEVELS.EXPLICIT_CHOICE
                };
            }

            // ── 检查硬前提 ──
            if (this._hasHardPrerequisite(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would conflict with hard prerequisite',
                    level: this.AUTHORITY_LEVELS.HARD_PREREQUISITE
                };
            }

            // ── 检查权威状态 ──
            if (this._conflictsWithAuthoritativeState(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would conflict with authoritative learning state',
                    level: this.AUTHORITY_LEVELS.AUTHORITATIVE_STATE
                };
            }

            // ── 检查显式目标 ──
            if (this._conflictsWithExplicitGoal(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would conflict with explicit learner goal',
                    level: this.AUTHORITY_LEVELS.EXPLICIT_GOAL
                };
            }

            // ── 检查日程冲突 ──
            if (this._conflictsWithSchedule(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would conflict with scheduled item',
                    level: this.AUTHORITY_LEVELS.SCHEDULE
                };
            }

            // ── 检查设置冲突 ──
            if (this._conflictsWithSettings(adaptation, context)) {
                return {
                    allowed: false,
                    reason: 'Would conflict with Settings preference',
                    level: this.AUTHORITY_LEVELS.SETTINGS
                };
            }

            // ✅ 所有检查通过
            return {
                allowed: true,
                reason: 'Adaptation validated against authority hierarchy',
                level: level,
                scope: this._determineScope(level)
            };
        },

        /**
         * 获取适应允许的级别
         * @param {Object} context — 上下文
         * @returns {number} 最大允许级别
         */
        getMaxAllowedLevel: function(context) {
            // 检查是否有任何阻止因素
            if (this._hasAnyRestriction(context)) {
                return 1; // 只能做呈现适应
            }

            // 如果有明确的偏好，可以到 Level 3
            if (this._hasExplicitPreference(context)) {
                return 3;
            }

            // 默认最大 Level 2
            return 2;
        },

        /**
         * 检查适应是否可逆
         * @param {Object} adaptation — 适应记录
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isReversible: function(adaptation, context) {
            if (!adaptation) return true;

            var level = adaptation.level || 0;

            // Level 1-3 都是可逆的
            if (level >= 1 && level <= 3) {
                return true;
            }

            // 如果显式标记为不可逆
            if (adaptation.reversible === false) {
                return false;
            }

            return true;
        },

        /**
         * 获取适应范围
         * @param {number} level — 适应级别
         * @returns {string} 范围
         */
        getScope: function(level) {
            return this._determineScope(level);
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
        // PRIVATE — Checks
        // ============================================================

        _hasExplicitChoice: function(adaptation, context) {
            if (!context || !context.choiceHistory) return false;

            var history = context.choiceHistory;
            for (var i = 0; i < history.length; i++) {
                if (history[i].state === 'SELECTED' || history[i].state === 'STARTED') {
                    // 如果适应试图改变这个选择，阻止
                    if (adaptation.metadata && adaptation.metadata.target === history[i].optionId) {
                        return true;
                    }
                }
            }
            return false;
        },

        _hasHardPrerequisite: function(adaptation, context) {
            if (!context || !context.prerequisites) return false;

            var prereqs = context.prerequisites;
            for (var i = 0; i < prereqs.length; i++) {
                if (prereqs[i].isHard) {
                    // 如果适应试图绕过硬前提
                    if (adaptation.metadata && adaptation.metadata.target === prereqs[i].target) {
                        return true;
                    }
                }
            }
            return false;
        },

        _conflictsWithAuthoritativeState: function(adaptation, context) {
            if (!context || !context.currentState) return false;

            var state = context.currentState;
            // 如果适应试图标记已完成的内容为未完成
            if (adaptation.metadata && adaptation.metadata.action === 'reset_progress') {
                return true;
            }
            return false;
        },

        _conflictsWithExplicitGoal: function(adaptation, context) {
            if (!context || !context.goals) return false;

            var goals = context.goals;
            // 如果适应试图将学习者从目标移开
            if (adaptation.metadata && adaptation.metadata.direction === 'away_from_goal') {
                // 检查是否有明确目标
                for (var i = 0; i < goals.length; i++) {
                    if (goals[i].explicit === true) {
                        return true;
                    }
                }
            }
            return false;
        },

        _conflictsWithSchedule: function(adaptation, context) {
            if (!context || !context.schedule) return false;

            // 如果适应试图修改日程
            if (adaptation.metadata && adaptation.metadata.modifies_calendar === true) {
                return true;
            }
            return false;
        },

        _conflictsWithSettings: function(adaptation, context) {
            if (!context || !context.settings) return false;

            // 如果适应试图修改设置
            if (adaptation.metadata && adaptation.metadata.modifies_settings === true) {
                return true;
            }
            return false;
        },

        _hasAnyRestriction: function(context) {
            if (!context) return false;

            // 有硬前提
            if (context.prerequisites && context.prerequisites.length > 0) {
                for (var i = 0; i < context.prerequisites.length; i++) {
                    if (context.prerequisites[i].isHard) return true;
                }
            }

            // 有明确选择
            if (context.choiceHistory && context.choiceHistory.length > 0) {
                for (var i = 0; i < context.choiceHistory.length; i++) {
                    if (context.choiceHistory[i].state === 'SELECTED') return true;
                }
            }

            return false;
        },

        _hasExplicitPreference: function(context) {
            if (!context || !context.settings) return false;

            var settings = context.settings;
            return !!(settings.preferences && settings.preferences.explicit);
        },

        _determineScope: function(level) {
            var scopes = {
                0: this.SCOPES.PRESENTATION,
                1: this.SCOPES.PRESENTATION,
                2: this.SCOPES.SUPPORT,
                3: this.SCOPES.SUGGESTION,
                4: this.SCOPES.AUTHORITATIVE
            };
            return scopes[level] || this.SCOPES.PRESENTATION;
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

    window.LawAIApp.AdaptationGovernance = AdaptationGovernance;

    function autoInit() {
        if (!AdaptationGovernance.initialized) {
            AdaptationGovernance.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AdaptationGovernance] Module loaded (Part 56)');

})();
