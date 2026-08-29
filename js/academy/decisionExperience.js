// js/academy/decisionExperience.js
// Part 54 — Decision Experience (Core)
// Law AI Academy Developer Bible
//
// PURPOSE: Coherent Learner Decision Experience
// INTEGRATION: Context → Options → Explanations → Comparison → Choice
// RULES: Learner agency, explainability, transparency, reversibility

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionExperience) {
        console.log('[DecisionExperience] Already exists, skipping...');
        return;
    }

    /**
     * DecisionExperience
     *
     * 核心决策体验协调器
     * 
     * 职责:
     * - 整合 Context + Options + Explanations
     * - 提供 getDecisionContext()
     * - 提供 getOptions()
     * - 提供 selectOption()
     * - 提供 dismissOption()
     * - 事件集成
     */
    var DecisionExperience = {
        version: '1.0.0',
        initialized: false,

        _context: null,
        _options: [],
        _selectedHistory: [],
        _dismissed: [],
        _listeners: {},

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Decision Experience
         */
        init: function() {
            if (this.initialized) {
                console.log('[DecisionExperience] Already initialized');
                return this;
            }

            console.log('[DecisionExperience] 🚀 Initializing...');

            // 验证依赖
            var deps = this._checkDependencies();
            if (!deps.allAvailable) {
                console.warn('[DecisionExperience] Some dependencies missing:', deps.missing);
            }

            this.initialized = true;
            console.log('[DecisionExperience] ✅ Initialized');

            // 加载历史选择
            this._loadHistory();

            return this;
        },

        /**
         * 获取完整决策上下文
         * @param {Object} options — 可选参数 { includeOptions, includeHistory }
         * @returns {Object} 决策上下文
         */
        getDecisionContext: function(options) {
            options = options || { includeOptions: true, includeHistory: true };

            // 1. 获取学习上下文
            var learningContext = this._getLearningContext();

            // 2. 获取推荐
            var recommendations = this._getRecommendations();

            // 3. 获取继续学习
            var continueData = this._getContinueLearning();

            // 4. 获取日程
            var schedule = this._getSchedule();

            // 5. 获取目标
            var goals = this._getGoals();

            // 6. 构建上下文
            var context = {
                timestamp: Date.now(),
                learnerState: {
                    hasActiveCourse: !!(learningContext && learningContext.course),
                    hasActiveLesson: !!(learningContext && learningContext.lesson),
                    hasActiveSession: !!(learningContext && learningContext.session && learningContext.session.status === 'active'),
                    progress: learningContext ? learningContext.progress : { course: 0 },
                    motivation: learningContext ? learningContext.motivation : null
                },
                current: {
                    course: learningContext ? learningContext.course : null,
                    module: learningContext ? learningContext.module : null,
                    lesson: learningContext ? learningContext.lesson : null,
                    session: learningContext ? learningContext.session : null
                },
                continueLearning: continueData || null,
                recommendations: recommendations || [],
                schedule: schedule || null,
                goals: goals || [],
                choiceHistory: this._selectedHistory || [],
                dismissed: this._dismissed || []
            };

            this._context = context;

            // 7. 生成选项 (如果需要)
            if (options.includeOptions) {
                this._options = this._generateOptions(context);
            }

            // 8. 发射事件
            this._emit('DECISION_CONTEXT_READY', {
                context: context,
                optionCount: this._options.length
            });

            return context;
        },

        /**
         * 获取所有选项 (已排序)
         * @param {Object} filters — 过滤条件 { includeDismissed, maxCount }
         * @returns {Array} 选项列表
         */
        getOptions: function(filters) {
            filters = filters || { includeDismissed: false, maxCount: 10 };

            // 确保上下文已构建
            if (!this._context) {
                this.getDecisionContext();
            }

            var options = this._options || [];

            // 过滤已关闭的
            if (!filters.includeDismissed) {
                var dismissedIds = {};
                for (var i = 0; i < this._dismissed.length; i++) {
                    dismissedIds[this._dismissed[i]] = true;
                }
                options = options.filter(function(opt) {
                    return !dismissedIds[opt.id];
                });
            }

            // 限制数量
            if (filters.maxCount && options.length > filters.maxCount) {
                options = options.slice(0, filters.maxCount);
            }

            return options;
        },

        /**
         * 获取主要操作
         * @returns {Object|null} 主要操作选项
         */
        getPrimaryOption: function() {
            var options = this.getOptions({ includeDismissed: false });
            var primacy = window.LawAIApp?.DecisionPrimacy;
            if (!primacy) return options.length > 0 ? options[0] : null;

            return primacy.getPrimary(options, this._context);
        },

        /**
         * 选择选项
         * @param {string} optionId — 选项 ID
         * @param {Object} metadata — 元数据
         * @returns {Object} 选择结果
         */
        selectOption: function(optionId, metadata) {
            // 查找选项
            var option = this._findOption(optionId);
            if (!option) {
                return { success: false, error: 'Option not found' };
            }

            // 检查是否可用
            if (option.status !== 'AVAILABLE') {
                return { success: false, error: 'Option is not available', status: option.status };
            }

            // 检查是否已关闭
            if (this._isDismissed(optionId)) {
                return { success: false, error: 'Option has been dismissed' };
            }

            // 记录选择
            var record = {
                optionId: optionId,
                option: option,
                state: 'SELECTED',
                timestamp: Date.now(),
                metadata: metadata || {}
            };

            this._selectedHistory.push(record);

            // 保存历史
            this._saveHistory();

            // 发射事件
            this._emit('OPTION_SELECTED', record);

            // 执行动作 (如果有)
            if (option.action) {
                this._executeAction(option.action);
            }

            return {
                success: true,
                record: record,
                option: option
            };
        },

        /**
         * 关闭选项 (Dismiss)
         * @param {string} optionId — 选项 ID
         * @param {string} reason — 关闭原因
         * @returns {Object} 结果
         */
        dismissOption: function(optionId, reason) {
            var option = this._findOption(optionId);
            if (!option) {
                return { success: false, error: 'Option not found' };
            }

            if (this._isDismissed(optionId)) {
                return { success: false, error: 'Already dismissed' };
            }

            this._dismissed.push(optionId);

            // 记录
            var record = {
                optionId: optionId,
                reason: reason || 'dismissed',
                timestamp: Date.now()
            };

            // 保存
            this._saveHistory();

            this._emit('OPTION_DISMISSED', record);

            return {
                success: true,
                record: record
            };
        },

        /**
         * 跳过选项
         * @param {string} optionId — 选项 ID
         * @returns {Object} 结果
         */
        skipOption: function(optionId) {
            var option = this._findOption(optionId);
            if (!option) {
                return { success: false, error: 'Option not found' };
            }

            var record = {
                optionId: optionId,
                state: 'SKIPPED',
                timestamp: Date.now()
            };

            this._selectedHistory.push(record);
            this._saveHistory();

            this._emit('OPTION_SKIPPED', record);

            return {
                success: true,
                record: record
            };
        },

        /**
         * 获取选项的详细解释
         * @param {string} optionId — 选项 ID
         * @returns {Object} 解释对象
         */
        getExplanation: function(optionId) {
            var option = this._findOption(optionId);
            if (!option) {
                return { available: false, error: 'Option not found' };
            }

            var authority = window.LawAIApp?.DecisionAuthority;
            var authorityLevel = authority ? authority.getAuthorityLevel(option, this._context) : 2;
            var authorityLabel = authority ? authority.getAuthorityLabel(option, this._context) : 'Option';

            return {
                available: true,
                id: option.id,
                title: option.title,
                reason: option.reason || 'No specific reason provided',
                evidence: option.evidence || [],
                authority: {
                    level: authorityLevel,
                    label: authorityLabel
                },
                source: option.source,
                optional: option.optional !== false,
                status: option.status
            };
        },

        /**
         * 比较两个选项
         * @param {string} optionIdA — 选项 A
         * @param {string} optionIdB — 选项 B
         * @returns {Object} 比较结果
         */
        compareOptions: function(optionIdA, optionIdB) {
            var optA = this._findOption(optionIdA);
            var optB = this._findOption(optionIdB);

            if (!optA || !optB) {
                return { available: false, error: 'One or both options not found' };
            }

            var primacy = window.LawAIApp?.DecisionPrimacy;
            var orderA = primacy ? primacy.getOrder(optA) : 5;
            var orderB = primacy ? primacy.getOrder(optB) : 5;

            return {
                available: true,
                optionA: {
                    id: optA.id,
                    title: optA.title,
                    type: optA.type,
                    priority: optA.priority,
                    order: orderA,
                    reason: optA.reason
                },
                optionB: {
                    id: optB.id,
                    title: optB.title,
                    type: optB.type,
                    priority: optB.priority,
                    order: orderB,
                    reason: optB.reason
                },
                comparison: {
                    primary: orderA < orderB ? 'A' : (orderB < orderA ? 'B' : 'equal'),
                    difference: Math.abs(orderA - orderB)
                }
            };
        },

        /**
         * 获取决策历史
         * @param {number} limit — 最大数量
         * @returns {Array} 历史记录
         */
        getHistory: function(limit) {
            limit = limit || 20;
            return this._selectedHistory.slice(-limit).reverse();
        },

        /**
         * 检查选项是否已关闭
         * @param {string} optionId — 选项 ID
         * @returns {boolean}
         */
        isDismissed: function(optionId) {
            return this._isDismissed(optionId);
        },

        /**
         * 重置决策状态 (不删除历史)
         */
        reset: function() {
            this._context = null;
            this._options = [];
            this._dismissed = [];

            // 不清除历史

            this._emit('DECISION_RESET', { timestamp: Date.now() });

            return this;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                optionCount: this._options.length,
                historyCount: this._selectedHistory.length,
                dismissedCount: this._dismissed.length,
                hasContext: !!this._context
            };
        },

        // ============================================================
        // 2. PRIVATE — Data Sources
        // ============================================================

        /**
         * 获取学习上下文
         * @private
         */
        _getLearningContext: function() {
            var lc = window.LawAIApp?.LearningContext;
            if (lc && typeof lc.getContext === 'function') {
                return lc.getContext();
            }
            return null;
        },

        /**
         * 获取继续学习数据
         * @private
         */
        _getContinueLearning: function() {
            var cl = window.LawAIApp?.ContinueLearning;
            if (cl && typeof cl.getProgress === 'function') {
                return cl.getProgress();
            }
            return null;
        },

        /**
         * 获取推荐
         * @private
         */
        _getRecommendations: function() {
            var rec = window.LawAIApp?.AIRecommendationEngine;
            if (rec && typeof rec.getTopRecommendations === 'function') {
                try {
                    return rec.getTopRecommendations(5, 'medium');
                } catch (e) {
                    return [];
                }
            }
            return [];
        },

        /**
         * 获取日程
         * @private
         */
        _getSchedule: function() {
            var cal = window.LawAIApp?.CalendarEngine;
            if (!cal) return null;

            // 获取今日日程
            var today = new Date();
            var month = today.getMonth();
            var year = today.getFullYear();

            try {
                var monthData = cal.getMonthData ? cal.getMonthData(year, month) : null;
                if (monthData) {
                    return {
                        day: today.getDate(),
                        month: month,
                        year: year,
                        entries: [] // 简化
                    };
                }
            } catch (e) {
                // ignore
            }
            return null;
        },

        /**
         * 获取目标
         * @private
         */
        _getGoals: function() {
            // 尝试从 GoalEngine 获取
            var goals = window.LawAIApp?.GoalEngine;
            if (goals && typeof goals.getActiveGoals === 'function') {
                try {
                    return goals.getActiveGoals();
                } catch (e) {
                    return [];
                }
            }
            return [];
        },

        // ============================================================
        // 3. PRIVATE — Option Generation
        // ============================================================

        /**
         * 生成选项
         * @private
         */
        _generateOptions: function(context) {
            var normalizer = window.LawAIApp?.OptionNormalizer;
            if (!normalizer) {
                return this._generateFallbackOptions(context);
            }

            var options = [];

            // 1. Continue 选项
            var continueData = context.continueLearning;
            if (continueData && continueData.courseId) {
                var continueOpt = normalizer.fromContinue(context, continueData);
                if (continueOpt) options.push(continueOpt);
            }

            // 2. 推荐选项
            var recommendations = context.recommendations || [];
            if (recommendations.length > 0) {
                var recOpts = normalizer.fromRecommendations(recommendations, 3);
                for (var i = 0; i < recOpts.length; i++) {
                    options.push(recOpts[i]);
                }
            }

            // 3. 目标选项
            var goals = context.goals || [];
            for (var i = 0; i < goals.length && i < 2; i++) {
                var goalOpt = normalizer.fromGoal(goals[i]);
                if (goalOpt) options.push(goalOpt);
            }

            // 4. 排序
            var primacy = window.LawAIApp?.DecisionPrimacy;
            if (primacy && typeof primacy.sort === 'function') {
                options = primacy.sort(options, context);
            }

            return options;
        },

        /**
         * 降级方案: 没有 Normalizer 时
         * @private
         */
        _generateFallbackOptions: function(context) {
            var model = window.LawAIApp?.DecisionOptionModel;
            if (!model) return [];

            var options = [];

            // 简单的 Continue
            if (context.continueLearning && context.continueLearning.courseId) {
                var cl = context.continueLearning;
                options.push({
                    id: 'continue_' + cl.courseId,
                    type: 'CONTINUE',
                    title: cl.title || 'Continue Learning',
                    summary: 'Resume your learning',
                    reason: 'You have an active learning session',
                    evidence: ['Active session detected'],
                    action: { type: 'resume', target: cl.courseId },
                    source: 'CURRENT_CONTEXT',
                    status: 'AVAILABLE',
                    optional: true,
                    priority: 1,
                    metadata: {},
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }

            // 简单的探索
            options.push({
                id: 'explore_' + Date.now(),
                type: 'EXPLORE',
                title: 'Explore Courses',
                summary: 'Discover new learning paths',
                reason: 'Ready to learn something new',
                evidence: ['You have no active course'],
                action: { type: 'explore' },
                source: 'EXPLORER',
                status: 'AVAILABLE',
                optional: true,
                priority: 9,
                metadata: {},
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            return options;
        },

        /**
         * 查找选项
         * @private
         */
        _findOption: function(optionId) {
            // 在当前选项中查找
            for (var i = 0; i < this._options.length; i++) {
                if (this._options[i].id === optionId) {
                    return this._options[i];
                }
            }
            return null;
        },

        /**
         * 检查选项是否已关闭
         * @private
         */
        _isDismissed: function(optionId) {
            for (var i = 0; i < this._dismissed.length; i++) {
                if (this._dismissed[i] === optionId) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 执行动作
         * @private
         */
        _executeAction: function(action) {
            if (!action) return;

            console.log('[DecisionExperience] Executing action:', action);

            // 根据动作类型执行
            switch (action.type) {
                case 'resume':
                    if (action.target && window.LawAIApp?.AcademyExperienceManager) {
                        window.LawAIApp.AcademyExperienceManager.startCourse(action.target);
                    }
                    break;
                case 'recommend':
                    // 打开推荐详情
                    this._emit('RECOMMENDATION_ACTION', { target: action.target });
                    break;
                case 'review':
                    if (action.target && window.LawAIApp?.AcademyExperienceManager) {
                        // 跳转到复习
                        this._emit('REVIEW_ACTION', { target: action.target });
                    }
                    break;
                case 'explore':
                    if (window.LawAIApp?.AcademyExperienceManager) {
                        window.LawAIApp.AcademyExperienceManager.goHome();
                    }
                    break;
                case 'schedule':
                    this._emit('SCHEDULE_ACTION', { target: action.target });
                    break;
                case 'goal':
                    this._emit('GOAL_ACTION', { target: action.target });
                    break;
                case 'note':
                    this._emit('NOTE_ACTION', { target: action.target });
                    break;
                default:
                    console.warn('[DecisionExperience] Unknown action type:', action.type);
            }
        },

        // ============================================================
        // 4. PRIVATE — History
        // ============================================================

        /**
         * 加载历史选择
         * @private
         */
        _loadHistory: function() {
            try {
                var saved = localStorage.getItem('decisionExperienceHistory');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.selectedHistory) {
                        this._selectedHistory = data.selectedHistory;
                    }
                    if (data.dismissed) {
                        this._dismissed = data.dismissed;
                    }
                    console.log('[DecisionExperience] Loaded history:', this._selectedHistory.length);
                }
            } catch (e) {
                // ignore
            }
        },

        /**
         * 保存历史选择
         * @private
         */
        _saveHistory: function() {
            try {
                var data = {
                    selectedHistory: this._selectedHistory.slice(-100),
                    dismissed: this._dismissed,
                    updatedAt: Date.now()
                };
                localStorage.setItem('decisionExperienceHistory', JSON.stringify(data));
            } catch (e) {
                // ignore
            }
        },

        // ============================================================
        // 5. PRIVATE — Dependencies
        // ============================================================

        /**
         * 检查依赖
         * @private
         */
        _checkDependencies: function() {
            var missing = [];
            var available = {};

            var deps = [
                'LearningContext',
                'ExperienceIntelligence',
                'DecisionOptionModel',
                'DecisionAuthority',
                'DecisionPrimacy',
                'OptionNormalizer'
            ];

            for (var i = 0; i < deps.length; i++) {
                var dep = deps[i];
                var exists = !!(window.LawAIApp && window.LawAIApp[dep]);
                available[dep] = exists;
                if (!exists) missing.push(dep);
            }

            return {
                allAvailable: missing.length === 0,
                available: available,
                missing: missing
            };
        },

        // ============================================================
        // 6. PRIVATE — Events
        // ============================================================

        /**
         * 发射事件
         * @private
         */
        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('decision.' + eventName, data);
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

    window.LawAIApp.DecisionExperience = DecisionExperience;

    function autoInit() {
        if (!DecisionExperience.initialized) {
            DecisionExperience.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 600);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 600);
        });
    }

    console.log('[DecisionExperience] Module loaded (Part 54)');
    console.log('   🎯 Core: getDecisionContext() | getOptions() | selectOption() | dismissOption()');
    console.log('   🔍 Explanation: getExplanation() | compareOptions()');
    console.log('   📋 History: getHistory() | isDismissed()');

})();
