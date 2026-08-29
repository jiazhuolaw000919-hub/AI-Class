// js/academy/decisionAuthority.js
// Part 54 — Decision Authority
// Law AI Academy Developer Bible
//
// PURPOSE: Determine option authority levels, primary/secondary/recommended/required
// OWNERSHIP: AUTHORITY MAPPING layer — no state, read-only
// RULES: Explicit learner choice > authoritative state > hard prerequisites > derived

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionAuthority) {
        console.log('[DecisionAuthority] Already exists, skipping...');
        return;
    }

    /**
     * DecisionAuthority
     *
     * 权威映射 — 确定选项的权威层级
     * 
     * 权威层级 (从高到低):
     * 1. Explicit learner choice
     * 2. Authoritative learning state
     * 3. Authoritative hard prerequisite
     * 4. Explicit learner goal
     * 5. Authoritative schedule
     * 6. Derived learner context
     * 7. Recommendation
     * 8. Inference
     */
    var DecisionAuthority = {

        // ============================================================
        // AUTHORITY LEVELS (Part 54 — Authority Hierarchy)
        // ============================================================

        LEVELS: {
            EXPLICIT_CHOICE: 8,
            AUTHORITATIVE_STATE: 7,
            HARD_PREREQUISITE: 6,
            EXPLICIT_GOAL: 5,
            AUTHORITATIVE_SCHEDULE: 4,
            DERIVED_CONTEXT: 3,
            RECOMMENDATION: 2,
            INFERENCE: 1
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 获取选项的权威层级
         * @param {Object} option — Option 对象
         * @param {Object} context — 上下文 (包含 learnerState, goals, schedule, etc.)
         * @returns {number} 权威层级 (1-8)
         */
        getAuthorityLevel: function(option, context) {
            if (!option) return this.LEVELS.INFERENCE;

            var source = option.source;
            var type = option.type;

            // 1. Explicit learner choice (由选择历史决定)
            if (this._isExplicitChoice(option, context)) {
                return this.LEVELS.EXPLICIT_CHOICE;
            }

            // 2. Authoritative state (当前学习状态)
            if (source === 'CURRENT_CONTEXT' || type === 'CONTINUE') {
                return this.LEVELS.AUTHORITATIVE_STATE;
            }

            // 3. Hard prerequisite (硬前提)
            if (this._hasHardPrerequisite(option, context)) {
                return this.LEVELS.HARD_PREREQUISITE;
            }

            // 4. Explicit learner goal
            if (source === 'LEARNER_GOAL' || type === 'GOAL_RELATED') {
                return this.LEVELS.EXPLICIT_GOAL;
            }

            // 5. Authoritative schedule
            if (source === 'CALENDAR' || type === 'SCHEDULED') {
                return this.LEVELS.AUTHORITATIVE_SCHEDULE;
            }

            // 6. Derived learner context
            if (this._isDerivedContext(option, context)) {
                return this.LEVELS.DERIVED_CONTEXT;
            }

            // 7. Recommendation
            if (type === 'RECOMMENDED' || source === 'RECOMMENDATION') {
                return this.LEVELS.RECOMMENDATION;
            }

            // 8. Inference (默认)
            return this.LEVELS.INFERENCE;
        },

        /**
         * 确定选项是否为主要操作
         * @param {Object} option — Option 对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isPrimary: function(option, context) {
            if (!option) return false;

            // Continue 总是主要 (除非被显式覆盖)
            if (option.type === 'CONTINUE') {
                return true;
            }

            // 如果选项有明确的优先级 1 或 2
            if (option.priority <= 2) {
                return true;
            }

            // 如果选项是当前学习状态
            if (this._isCurrentLearning(option, context)) {
                return true;
            }

            return false;
        },

        /**
         * 确定选项是否为推荐 (可选的)
         * @param {Object} option — Option 对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isRecommended: function(option, context) {
            if (!option) return false;

            // 标记为 RECOMMENDED 类型
            if (option.type === 'RECOMMENDED') {
                return true;
            }

            // 来源为推荐
            if (option.source === 'RECOMMENDATION') {
                return true;
            }

            // 权威层级在推荐级别
            var level = this.getAuthorityLevel(option, context);
            return level === this.LEVELS.RECOMMENDATION;
        },

        /**
         * 确定选项是否为必需 (硬前提)
         * @param {Object} option — Option 对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isRequired: function(option, context) {
            if (!option) return false;

            // 如果状态为 LOCKED
            if (option.status === 'LOCKED') {
                return true;
            }

            // 如果有硬前提
            if (this._hasHardPrerequisite(option, context)) {
                return true;
            }

            // 如果权威层级为硬前提
            var level = this.getAuthorityLevel(option, context);
            return level === this.LEVELS.HARD_PREREQUISITE;
        },

        /**
         * 获取选项的权威标签 (用户友好)
         * @param {Object} option — Option 对象
         * @param {Object} context — 上下文
         * @returns {string} 权威标签
         */
        getAuthorityLabel: function(option, context) {
            var level = this.getAuthorityLevel(option, context);

            var labels = {
                8: 'Your Choice',
                7: 'Current Learning',
                6: 'Required',
                5: 'Goal Aligned',
                4: 'Scheduled',
                3: 'Recommended',
                2: 'Recommended',
                1: 'Discovery'
            };

            return labels[level] || 'Option';
        },

        // ============================================================
        // PRIVATE — Helpers
        // ============================================================

        /**
         * 检查是否为显式选择
         * @private
         */
        _isExplicitChoice: function(option, context) {
            if (!context || !context.choiceHistory) return false;

            var history = context.choiceHistory;
            for (var i = 0; i < history.length; i++) {
                if (history[i].optionId === option.id && history[i].state === 'SELECTED') {
                    return true;
                }
            }
            return false;
        },

        /**
         * 检查是否有硬前提
         * @private
         */
        _hasHardPrerequisite: function(option, context) {
            if (!context || !context.prerequisites) return false;

            var prereqs = context.prerequisites;
            for (var i = 0; i < prereqs.length; i++) {
                if (prereqs[i].optionId === option.id && prereqs[i].isHard) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 检查是否为派生上下文
         * @private
         */
        _isDerivedContext: function(option, context) {
            if (!context) return false;

            // 基于用户活动派生的选项
            if (option.source === 'RETENTION' || option.source === 'KNOWLEDGE_GRAPH') {
                return true;
            }

            // 基于笔记派生的选项
            if (option.source === 'NOTES') {
                return true;
            }

            return false;
        },

        /**
         * 检查是否为当前学习
         * @private
         */
        _isCurrentLearning: function(option, context) {
            if (!context || !context.currentState) return false;

            var state = context.currentState;
            if (option.source === 'CURRENT_CONTEXT') {
                return true;
            }

            // 如果选项引用了当前 lesson
            if (option.metadata && option.metadata.lessonId) {
                if (state.lessonId === option.metadata.lessonId) {
                    return true;
                }
            }

            return false;
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionAuthority = DecisionAuthority;

    console.log('[DecisionAuthority] Module loaded (Part 54)');

})();
