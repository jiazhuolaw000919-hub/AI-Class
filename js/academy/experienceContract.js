// js/academy/experienceContract.js
// Part 65 — Learning Journey Experience Contract
// Law AI Academy Developer Bible
//
// PURPOSE: Establish consistent contract between intelligence and experience surfaces
// RULES: Experience layer is translation, not new authority

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ExperienceContract) {
        console.log('[ExperienceContract] Already exists, skipping...');
        return;
    }

    /**
     * ExperienceContract
     *
     * 定义学习智能和体验表面之间的一致契约
     * 
     * 契约元素:
     * 1. STATUS — 状态 (Not Started, In Progress, Completed, Locked, etc.)
     * 2. CONTEXT — 上下文
     * 3. AVAILABLE ACTIONS — 可用操作
     * 4. RECOMMENDATIONS — 可选推荐
     * 5. AUTHORITY — 权威来源
     * 6. EXPLANATION — 解释
     * 7. NEXT VALID OPTIONS — 下一个有效选项
     * 
     * 规则:
     * - 体验层不是新权威
     * - UI 不能成为真相来源
     * - UNKNOWN 保持 UNKNOWN
     */
    var ExperienceContract = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // STATUS TYPES (Part 65)
        // ============================================================

        STATUS: {
            NOT_STARTED: 'NOT_STARTED',
            IN_PROGRESS: 'IN_PROGRESS',
            COMPLETED: 'COMPLETED',
            REVIEW_AVAILABLE: 'REVIEW_AVAILABLE',
            RECOMMENDED: 'RECOMMENDED',
            SCHEDULED: 'SCHEDULED',
            LOCKED: 'LOCKED',
            AVAILABLE: 'AVAILABLE',
            UNKNOWN: 'UNKNOWN'
        },

        STATUS_LABELS: {
            NOT_STARTED: 'Not Started',
            IN_PROGRESS: 'In Progress',
            COMPLETED: 'Completed',
            REVIEW_AVAILABLE: 'Review Available',
            RECOMMENDED: 'Recommended',
            SCHEDULED: 'Scheduled',
            LOCKED: 'Locked',
            AVAILABLE: 'Available',
            UNKNOWN: 'Unknown'
        },

        STATUS_COLORS: {
            NOT_STARTED: '#64748b',
            IN_PROGRESS: '#4a9eff',
            COMPLETED: '#10b981',
            REVIEW_AVAILABLE: '#f59e0b',
            RECOMMENDED: '#8b5cf6',
            SCHEDULED: '#f59e0b',
            LOCKED: '#ef4444',
            AVAILABLE: '#4a9eff',
            UNKNOWN: '#64748b'
        },

        // ============================================================
        // ACTION TYPES (Part 65)
        // ============================================================

        ACTIONS: {
            CONTINUE: 'CONTINUE',
            REVIEW: 'REVIEW',
            EXPLORE: 'EXPLORE',
            PRACTICE: 'PRACTICE',
            REFLECT: 'REFLECT',
            TRANSFER: 'TRANSFER',
            SCHEDULE: 'SCHEDULE',
            VIEW_NOTES: 'VIEW_NOTES',
            START: 'START',
            RESUME: 'RESUME',
            COMPLETE: 'COMPLETE'
        },

        ACTION_LABELS: {
            CONTINUE: 'Continue',
            REVIEW: 'Review',
            EXPLORE: 'Explore',
            PRACTICE: 'Practice',
            REFLECT: 'Reflect',
            TRANSFER: 'Transfer',
            SCHEDULE: 'Schedule',
            VIEW_NOTES: 'View Notes',
            START: 'Start',
            RESUME: 'Resume',
            COMPLETE: 'Complete'
        },

        // ============================================================
        // AUTHORITY TYPES (Part 65)
        // ============================================================

        AUTHORITY: {
            COURSE: 'COURSE',
            MODULE: 'MODULE',
            LESSON: 'LESSON',
            CALENDAR: 'CALENDAR',
            SETTINGS: 'SETTINGS',
            NOTES: 'NOTES',
            KNOWLEDGE_GRAPH: 'KNOWLEDGE_GRAPH',
            RETENTION: 'RETENTION',
            RECOMMENDATION: 'RECOMMENDATION',
            AI: 'AI',
            EXPERIENCE: 'EXPERIENCE',
            LEARNER: 'LEARNER'
        },

        AUTHORITY_LABELS: {
            COURSE: 'Curriculum Authority',
            MODULE: 'Progression Authority',
            LESSON: 'Learning Authority',
            CALENDAR: 'Scheduling Authority',
            SETTINGS: 'Preference Authority',
            NOTES: 'Personal Memory Authority',
            KNOWLEDGE_GRAPH: 'Relationship Authority',
            RETENTION: 'Review Authority',
            RECOMMENDATION: 'Suggestion Authority',
            AI: 'Assistance / Interpretation Authority',
            EXPERIENCE: 'Presentation / Coordination Contract',
            LEARNER: 'Decision Authority'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[ExperienceContract] Already initialized');
                return this;
            }

            console.log('[ExperienceContract] 🚀 Initializing...');
            this.initialized = true;
            console.log('[ExperienceContract] ✅ Initialized');
            console.log('[ExperienceContract] 📋 Contract: Status + Context + Actions + Recommendations + Authority + Explanation');
            return this;
        },

        /**
         * 创建体验状态对象
         * @param {Object} config
         * @param {string} config.status — 状态
         * @param {Object} config.context — 上下文
         * @param {Array} config.availableActions — 可用操作
         * @param {Array} config.recommendations — 推荐
         * @param {string} config.authority — 权威来源
         * @param {string} config.explanation — 解释
         * @param {Array} config.nextOptions — 下一个有效选项
         * @param {Object} config.metadata — 元数据
         * @returns {Object} 体验状态
         */
        createState: function(config) {
            var status = config.status || this.STATUS.UNKNOWN;
            var validStatuses = Object.values(this.STATUS);
            if (validStatuses.indexOf(status) === -1) {
                status = this.STATUS.UNKNOWN;
            }

            return {
                id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                status: status,
                statusLabel: this.STATUS_LABELS[status] || 'Unknown',
                statusColor: this.STATUS_COLORS[status] || '#64748b',
                context: config.context || null,
                availableActions: config.availableActions || [],
                recommendations: config.recommendations || [],
                authority: config.authority || this.AUTHORITY.EXPERIENCE,
                authorityLabel: this.AUTHORITY_LABELS[config.authority] || 'Unknown',
                explanation: config.explanation || '',
                nextOptions: config.nextOptions || [],
                metadata: config.metadata || {},
                timestamp: Date.now(),
                isValid: this.validate(config)
            };
        },

        /**
         * 验证体验状态
         * @param {Object} config — 配置
         * @returns {Object} 验证结果
         */
        validate: function(config) {
            var errors = [];
            var warnings = [];

            // 1. 检查状态是否有效
            var validStatuses = Object.values(this.STATUS);
            if (config.status && validStatuses.indexOf(config.status) === -1) {
                errors.push('Invalid status: ' + config.status);
            }

            // 2. 检查权威是否有效
            var validAuthorities = Object.values(this.AUTHORITY);
            if (config.authority && validAuthorities.indexOf(config.authority) === -1) {
                errors.push('Invalid authority: ' + config.authority);
            }

            // 3. 检查 LOCKED 状态是否有权威约束
            if (config.status === this.STATUS.LOCKED) {
                if (config.authority === this.AUTHORITY.RECOMMENDATION || 
                    config.authority === this.AUTHORITY.AI) {
                    errors.push('LOCKED state cannot be created by Recommendation or AI authority');
                }
                if (!config.explanation || config.explanation.length === 0) {
                    warnings.push('LOCKED state should have an explanation');
                }
            }

            // 4. 检查 RECOMMENDED 状态是否可选
            if (config.status === this.STATUS.RECOMMENDED) {
                if (config.metadata && config.metadata.isRequired === true) {
                    errors.push('RECOMMENDED status cannot be marked as required');
                }
            }

            // 5. 检查 AVAILABLE ACTIONS 是否有效
            if (config.availableActions) {
                var validActions = Object.values(this.ACTIONS);
                for (var i = 0; i < config.availableActions.length; i++) {
                    if (validActions.indexOf(config.availableActions[i]) === -1) {
                        warnings.push('Unknown action: ' + config.availableActions[i]);
                    }
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        },

        /**
         * 获取状态标签
         * @param {string} status — 状态
         * @returns {string} 标签
         */
        getStatusLabel: function(status) {
            return this.STATUS_LABELS[status] || status || 'Unknown';
        },

        /**
         * 获取状态颜色
         * @param {string} status — 状态
         * @returns {string} 颜色
         */
        getStatusColor: function(status) {
            return this.STATUS_COLORS[status] || '#64748b';
        },

        /**
         * 获取权威标签
         * @param {string} authority — 权威
         * @returns {string} 标签
         */
        getAuthorityLabel: function(authority) {
            return this.AUTHORITY_LABELS[authority] || authority || 'Unknown';
        },

        /**
         * 获取动作标签
         * @param {string} action — 动作
         * @returns {string} 标签
         */
        getActionLabel: function(action) {
            return this.ACTION_LABELS[action] || action || 'Action';
        },

        /**
         * 检查状态是否表示进度
         * @param {string} status — 状态
         * @returns {boolean}
         */
        isProgress: function(status) {
            return status === this.STATUS.IN_PROGRESS ||
                   status === this.STATUS.AVAILABLE ||
                   status === this.STATUS.REVIEW_AVAILABLE;
        },

        /**
         * 检查状态是否表示完成
         * @param {string} status — 状态
         * @returns {boolean}
         */
        isComplete: function(status) {
            return status === this.STATUS.COMPLETED;
        },

        /**
         * 检查状态是否表示锁定
         * @param {string} status — 状态
         * @returns {boolean}
         */
        isLocked: function(status) {
            return status === this.STATUS.LOCKED;
        },

        /**
         * 获取权威映射
         * @returns {Object} 权威映射
         */
        getAuthorityMap: function() {
            return {
                'Course': { authority: this.AUTHORITY.COURSE, label: this.AUTHORITY_LABELS.COURSE, canOverride: false },
                'Module': { authority: this.AUTHORITY.MODULE, label: this.AUTHORITY_LABELS.MODULE, canOverride: false },
                'Lesson': { authority: this.AUTHORITY.LESSON, label: this.AUTHORITY_LABELS.LESSON, canOverride: false },
                'Calendar': { authority: this.AUTHORITY.CALENDAR, label: this.AUTHORITY_LABELS.CALENDAR, canOverride: false },
                'Settings': { authority: this.AUTHORITY.SETTINGS, label: this.AUTHORITY_LABELS.SETTINGS, canOverride: false },
                'Notes': { authority: this.AUTHORITY.NOTES, label: this.AUTHORITY_LABELS.NOTES, canOverride: false },
                'KnowledgeGraph': { authority: this.AUTHORITY.KNOWLEDGE_GRAPH, label: this.AUTHORITY_LABELS.KNOWLEDGE_GRAPH, canOverride: false },
                'Retention': { authority: this.AUTHORITY.RETENTION, label: this.AUTHORITY_LABELS.RETENTION, canOverride: false },
                'Recommendation': { authority: this.AUTHORITY.RECOMMENDATION, label: this.AUTHORITY_LABELS.RECOMMENDATION, canOverride: true },
                'AI': { authority: this.AUTHORITY.AI, label: this.AUTHORITY_LABELS.AI, canOverride: true },
                'Experience': { authority: this.AUTHORITY.EXPERIENCE, label: this.AUTHORITY_LABELS.EXPERIENCE, canOverride: false },
                'Learner': { authority: this.AUTHORITY.LEARNER, label: this.AUTHORITY_LABELS.LEARNER, canOverride: true }
            };
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                statusCount: Object.keys(this.STATUS).length,
                authorityCount: Object.keys(this.AUTHORITY).length,
                actionCount: Object.keys(this.ACTIONS).length
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
                    window.LawAIApp.EventBus.emit('contract.' + eventName, data);
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

    window.LawAIApp.ExperienceContract = ExperienceContract;

    function autoInit() {
        if (!ExperienceContract.initialized) {
            ExperienceContract.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 300);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 300);
        });
    }

    console.log('[ExperienceContract] Module loaded (Part 65)');

})();
