// js/academy/decisionPrimacy.js
// Part 54 — Decision Primacy
// Law AI Academy Developer Bible
//
// PURPOSE: Determine primary action, sort options by priority
// OWNERSHIP: SORTING/ORDERING layer — no state, read-only
// RULES: Continue > Goal-related > Scheduled > Review > Recommendation > Discovery

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionPrimacy) {
        console.log('[DecisionPrimacy] Already exists, skipping...');
        return;
    }

    /**
     * DecisionPrimacy
     *
     * 主要操作确定 + 选项排序
     * 
     * 排序规则:
     * 1. Continue current activity
     * 2. Explicit goal-related option
     * 3. Scheduled option
     * 4. Review option
     * 5. Recommendation
     * 6. Discovery
     */
    var DecisionPrimacy = {

        // ============================================================
        // SORT ORDER (Part 54 — Option Order)
        // ============================================================

        ORDER: {
            CONTINUE: 1,
            GOAL_RELATED: 2,
            SCHEDULED: 3,
            REVIEW: 4,
            PRACTICE: 5,
            PROJECT: 6,
            RECOMMENDED: 7,
            EXPLORE: 8,
            DISCOVER: 9
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 确定主要操作 (Primary Action)
         * @param {Array} options — 选项列表
         * @param {Object} context — 上下文
         * @returns {Object|null} 主要操作选项
         */
        getPrimary: function(options, context) {
            if (!options || options.length === 0) return null;

            // 1. 查找 Continue
            var continueOption = this._findByType(options, 'CONTINUE');
            if (continueOption && this._isValidPrimary(continueOption, context)) {
                return continueOption;
            }

            // 2. 查找 Goal-related
            var goalOption = this._findByType(options, 'GOAL_RELATED');
            if (goalOption && this._isValidPrimary(goalOption, context)) {
                return goalOption;
            }

            // 3. 查找 Scheduled
            var scheduledOption = this._findByType(options, 'SCHEDULED');
            if (scheduledOption && this._isValidPrimary(scheduledOption, context)) {
                return scheduledOption;
            }

            // 4. 查找 Review (如果复习紧迫)
            var reviewOption = this._findByType(options, 'REVIEW');
            if (reviewOption && this._isUrgentReview(reviewOption, context)) {
                return reviewOption;
            }

            // 5. 查找 Practice
            var practiceOption = this._findByType(options, 'PRACTICE');
            if (practiceOption && this._isValidPrimary(practiceOption, context)) {
                return practiceOption;
            }

            // 6. 降级: 返回第一个可用的高优先级选项
            var sorted = this.sort(options, context);
            for (var i = 0; i < sorted.length; i++) {
                if (this._isValidPrimary(sorted[i], context)) {
                    return sorted[i];
                }
            }

            // 7. 最后: 返回第一个可用选项
            for (var i = 0; i < options.length; i++) {
                if (options[i].status === 'AVAILABLE' && options[i].optional !== false) {
                    return options[i];
                }
            }

            return null;
        },

        /**
         * 排序选项 (按优先级)
         * @param {Array} options — 选项列表
         * @param {Object} context — 上下文
         * @returns {Array} 排序后的选项列表
         */
        sort: function(options, context) {
            if (!options || options.length === 0) return [];

            var self = this;
            var sorted = options.slice();

            sorted.sort(function(a, b) {
                // 1. 状态: AVAILABLE > 其他
                if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
                if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;

                // 2. 是否可选: optional true > optional false
                if (a.optional && !b.optional) return -1;
                if (b.optional && !a.optional) return 1;

                // 3. 顺序 (ORDER)
                var orderA = self._getOrder(a);
                var orderB = self._getOrder(b);
                if (orderA !== orderB) return orderA - orderB;

                // 4. 优先级 (priority)
                if (a.priority !== b.priority) return a.priority - b.priority;

                // 5. 更新时间 (updatedAt)
                if (a.updatedAt && b.updatedAt) {
                    return b.updatedAt - a.updatedAt;
                }

                return 0;
            });

            return sorted;
        },

        /**
         * 获取选项的排序顺序值
         * @param {Object} option — Option 对象
         * @returns {number} 顺序值
         */
        getOrder: function(option) {
            return this._getOrder(option);
        },

        // ============================================================
        // PRIVATE — Helpers
        // ============================================================

        /**
         * 获取选项的顺序值
         * @private
         */
        _getOrder: function(option) {
            if (!option) return this.ORDER.DISCOVER;

            var typeMap = {
                'CONTINUE': this.ORDER.CONTINUE,
                'GOAL_RELATED': this.ORDER.GOAL_RELATED,
                'SCHEDULED': this.ORDER.SCHEDULED,
                'REVIEW': this.ORDER.REVIEW,
                'PRACTICE': this.ORDER.PRACTICE,
                'PROJECT': this.ORDER.PROJECT,
                'RECOMMENDED': this.ORDER.RECOMMENDED,
                'EXPLORE': this.ORDER.EXPLORE,
                'DISCOVER': this.ORDER.DISCOVER
            };

            return typeMap[option.type] || this.ORDER.DISCOVER;
        },

        /**
         * 按类型查找选项
         * @private
         */
        _findByType: function(options, type) {
            for (var i = 0; i < options.length; i++) {
                if (options[i].type === type && options[i].status === 'AVAILABLE') {
                    return options[i];
                }
            }
            return null;
        },

        /**
         * 检查选项是否可作为主要操作
         * @private
         */
        _isValidPrimary: function(option, context) {
            if (!option) return false;
            if (option.status !== 'AVAILABLE') return false;
            if (option.optional === false) return false; // required 不能是主要 (它是必须的，不是选择)
            return true;
        },

        /**
         * 检查复习是否紧迫
         * @private
         */
        _isUrgentReview: function(option, context) {
            if (!option) return false;

            // 如果有 metadata.urgency
            if (option.metadata && option.metadata.urgency === 'high') {
                return true;
            }

            // 如果有 metadata.dueIn 且在 24 小时内
            if (option.metadata && option.metadata.dueIn && option.metadata.dueIn < 24) {
                return true;
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

    window.LawAIApp.DecisionPrimacy = DecisionPrimacy;

    console.log('[DecisionPrimacy] Module loaded (Part 54)');

})();
