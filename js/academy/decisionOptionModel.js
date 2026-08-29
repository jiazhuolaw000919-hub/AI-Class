// js/academy/decisionOptionModel.js
// Part 54 — Decision Option Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define Option data structure, types, statuses, sources
// OWNERSHIP: DATA CONTRACT layer — shared across all decision components
// REUSABILITY: No state, no dependencies

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionOptionModel) {
        console.log('[DecisionOptionModel] Already exists, skipping...');
        return;
    }

    /**
     * DecisionOptionModel
     *
     * 定义选项的数据结构、类型、状态、来源
     * 纯数据契约，无状态，无依赖
     */
    var DecisionOptionModel = {

        // ============================================================
        // OPTION TYPES (Part 54 — Option Types)
        // ============================================================

        TYPES: {
            CONTINUE: 'CONTINUE',
            REVIEW: 'REVIEW',
            PRACTICE: 'PRACTICE',
            EXPLORE: 'EXPLORE',
            DISCOVER: 'DISCOVER',
            PROJECT: 'PROJECT',
            GOAL_RELATED: 'GOAL_RELATED',
            SCHEDULED: 'SCHEDULED',
            RECOMMENDED: 'RECOMMENDED'
        },

        // ============================================================
        // OPTION STATUS (Part 54 — Option Invalidation)
        // ============================================================

        STATUS: {
            AVAILABLE: 'AVAILABLE',
            UNAVAILABLE: 'UNAVAILABLE',
            LOCKED: 'LOCKED',
            COMPLETED: 'COMPLETED',
            EXPIRED: 'EXPIRED'
        },

        // ============================================================
        // OPTION SOURCES (Part 54 — Option Source)
        // ============================================================

        SOURCES: {
            CURRENT_CONTEXT: 'CURRENT_CONTEXT',
            LEARNER_GOAL: 'LEARNER_GOAL',
            CALENDAR: 'CALENDAR',
            COURSE: 'COURSE',
            MODULE: 'MODULE',
            LESSON: 'LESSON',
            RETENTION: 'RETENTION',
            RECOMMENDATION: 'RECOMMENDATION',
            KNOWLEDGE_GRAPH: 'KNOWLEDGE_GRAPH',
            NOTES: 'NOTES',
            PRACTICE: 'PRACTICE',
            EXPLORER: 'EXPLORER'
        },

        // ============================================================
        // OPTION STATES (Part 54 — Choice State)
        // ============================================================

        CHOICE_STATES: {
            VIEWED: 'VIEWED',
            SELECTED: 'SELECTED',
            STARTED: 'STARTED',
            RESUMED: 'RESUMED',
            COMPLETED: 'COMPLETED',
            DISMISSED: 'DISMISSED',
            SKIPPED: 'SKIPPED',
            ABANDONED: 'ABANDONED',
            ALTERNATIVE_SELECTED: 'ALTERNATIVE_SELECTED'
        },

        // ============================================================
        // OPTION FACTORY
        // ============================================================

        /**
         * 创建标准化 Option 对象
         * @param {Object} config
         * @param {string} config.type — Option 类型 (TYPES)
         * @param {string} config.id — 唯一标识
         * @param {string} config.title — 显示标题
         * @param {string} config.summary — 简短摘要
         * @param {string} config.reason — 为什么显示这个选项
         * @param {Array} config.evidence — 证据列表
         * @param {Function|string} config.action — 执行动作
         * @param {string} config.status — 状态 (STATUS)
         * @param {boolean} config.optional — 是否可选
         * @param {string} config.source — 来源 (SOURCES)
         * @param {number} config.priority — 优先级 (1-10)
         * @param {Object} config.metadata — 额外元数据
         * @returns {Object} 标准化的 Option
         */
        create: function(config) {
            var id = config.id || 'opt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

            return {
                id: id,
                type: config.type || this.TYPES.DISCOVER,
                title: config.title || 'Untitled Option',
                summary: config.summary || '',
                reason: config.reason || '',
                evidence: config.evidence || [],
                action: config.action || null,
                status: config.status || this.STATUS.AVAILABLE,
                optional: config.optional !== undefined ? config.optional : true,
                source: config.source || this.SOURCES.EXPLORER,
                priority: config.priority || 5,
                metadata: config.metadata || {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        },

        /**
         * 判断选项是否为推荐
         * @param {Object} option — Option 对象
         * @returns {boolean}
         */
        isRecommended: function(option) {
            return option.type === this.TYPES.RECOMMENDED;
        },

        /**
         * 判断选项是否为继续
         * @param {Object} option — Option 对象
         * @returns {boolean}
         */
        isContinue: function(option) {
            return option.type === this.TYPES.CONTINUE;
        },

        /**
         * 判断选项是否可用
         * @param {Object} option — Option 对象
         * @returns {boolean}
         */
        isAvailable: function(option) {
            return option.status === this.STATUS.AVAILABLE;
        },

        /**
         * 判断选项是否锁定
         * @param {Object} option — Option 对象
         * @returns {boolean}
         */
        isLocked: function(option) {
            return option.status === this.STATUS.LOCKED;
        },

        /**
         * 获取选项的源标签 (用户友好)
         * @param {Object} option — Option 对象
         * @returns {string} 用户友好的源标签
         */
        getSourceLabel: function(option) {
            var labels = {
                'CURRENT_CONTEXT': 'Current Learning',
                'LEARNER_GOAL': 'Your Goal',
                'CALENDAR': 'Your Schedule',
                'COURSE': 'Course',
                'MODULE': 'Module',
                'LESSON': 'Lesson',
                'RETENTION': 'Review Needed',
                'RECOMMENDATION': 'AI Recommendation',
                'KNOWLEDGE_GRAPH': 'Knowledge Connection',
                'NOTES': 'Your Notes',
                'PRACTICE': 'Practice',
                'EXPLORER': 'Discovery'
            };
            return labels[option.source] || option.source || 'Unknown';
        },

        /**
         * 获取选项的类型标签 (用户友好)
         * @param {Object} option — Option 对象
         * @returns {string} 用户友好的类型标签
         */
        getTypeLabel: function(option) {
            var labels = {
                'CONTINUE': 'Continue Learning',
                'REVIEW': 'Review',
                'PRACTICE': 'Practice',
                'EXPLORE': 'Explore',
                'DISCOVER': 'Discover',
                'PROJECT': 'Project',
                'GOAL_RELATED': 'Goal Related',
                'SCHEDULED': 'Scheduled',
                'RECOMMENDED': 'Recommended'
            };
            return labels[option.type] || option.type || 'Option';
        },

        /**
         * 获取选项的类型颜色
         * @param {Object} option — Option 对象
         * @returns {string} 颜色值
         */
        getTypeColor: function(option) {
            var colors = {
                'CONTINUE': '#4a9eff',
                'REVIEW': '#f59e0b',
                'PRACTICE': '#10b981',
                'EXPLORE': '#8b5cf6',
                'DISCOVER': '#06b6d4',
                'PROJECT': '#ec4899',
                'GOAL_RELATED': '#f472b6',
                'SCHEDULED': '#f59e0b',
                'RECOMMENDED': '#8b5cf6'
            };
            return colors[option.type] || '#64748b';
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionOptionModel = DecisionOptionModel;

    console.log('[DecisionOptionModel] Module loaded (Part 54)');
    console.log('   📋 Types: ' + Object.keys(DecisionOptionModel.TYPES).join(', '));
    console.log('   📋 Sources: ' + Object.keys(DecisionOptionModel.SOURCES).join(', '));

})();
