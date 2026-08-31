// js/academy/journeyOrchestrator.js
// Part 63 — Journey Orchestrator (Integration Layer)
// Law AI Academy Developer Bible
//
// PURPOSE: Integrate all Season 4 capabilities into a coherent learning journey
// RULES: Learner remains primary decision authority, AI autonomy is bounded

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.JourneyOrchestrator) {
        console.log('[JourneyOrchestrator] Already exists, skipping...');
        return;
    }

    /**
     * JourneyOrchestrator
     *
     * 集成所有 Season 4 能力的核心编排层
     * 
     * 职责:
     * 1. 协调所有组件
     * 2. 确保权威层级正确
     * 3. 确保 AI 自主权有界
     * 4. 提供连贯的学习旅程体验
     * 
     * 规则:
     * - 学习者保持首要决策权
     * - 推荐 ≠ 要求
     * - 适应是可解释和可逆的
     */
    var JourneyOrchestrator = {
        version: '1.0.0',
        initialized: false,

        _components: {},
        _authorityMap: {},
        _state: {
            currentRecommendation: null,
            currentOptions: [],
            currentSupportLevel: 'NONE',
            activeSignals: [],
            journeyHistory: []
        },

        // ============================================================
        // SUPPORT LEVELS (Part 63)
        // ============================================================

        SUPPORT_LEVELS: {
            FULL: 'FULL',
            GUIDED: 'GUIDED',
            LIGHT: 'LIGHT',
            NONE: 'NONE'
        },

        SUPPORT_LABELS: {
            FULL: 'Full assistance',
            GUIDED: 'Guided',
            LIGHT: 'Light support',
            NONE: 'Independent'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化编排器
         */
        init: function() {
            if (this.initialized) {
                console.log('[JourneyOrchestrator] Already initialized');
                return this;
            }

            console.log('[JourneyOrchestrator] 🚀 Initializing...');

            // 1. 注册所有组件
            this._registerComponents();

            // 2. 构建权威映射
            this._buildAuthorityMap();

            // 3. 加载状态
            this._loadState();

            this.initialized = true;
            console.log('[JourneyOrchestrator] ✅ Initialized');
            console.log('[JourneyOrchestrator] 📋 Components:', Object.keys(this._components).join(', '));
            console.log('[JourneyOrchestrator] 🏛️ Authority map:', Object.keys(this._authorityMap).join(', '));

            return this;
        },

        /**
         * 获取学习旅程状态
         * @param {Object} context — 上下文
         * @returns {Object} 旅程状态
         */
        getJourneyState: function(context) {
            var state = {
                timestamp: Date.now(),
                currentContext: null,
                recommendations: [],
                options: [],
                primaryAction: null,
                supportLevel: this.SUPPORT_LEVELS.NONE,
                supportLabel: this.SUPPORT_LABELS.NONE,
                hasActiveLearning: false,
                hasRecommendation: false,
                hasAlternativeOptions: false,
                authorityConflicts: [],
                signals: this._collectSignals(context),
                components: this._getComponentStatus()
            };

            // 1. 获取学习上下文
            var learningContext = this._getLearningContext();
            if (learningContext) {
                state.currentContext = learningContext;
                state.hasActiveLearning = !!(learningContext.course || learningContext.lesson);
            }

            // 2. 获取推荐
            var recommendations = this._getRecommendations(context);
            if (recommendations && recommendations.length > 0) {
                state.recommendations = recommendations;
                state.hasRecommendation = true;
                state.primaryAction = recommendations[0];
            }

            // 3. 获取选项
            var options = this._getOptions(context);
            if (options && options.length > 1) {
                state.options = options;
                state.hasAlternativeOptions = options.length > 1;
            }

            // 4. 确定支持级别
            state.supportLevel = this._determineSupportLevel(context);
            state.supportLabel = this.SUPPORT_LABELS[state.supportLevel] || 'Unknown';

            // 5. 检查权威冲突
            state.authorityConflicts = this._checkAuthorityConflicts(context);

            return state;
        },

        /**
         * 获取推荐 (集成所有推荐源)
         * @param {Object} context — 上下文
         * @param {Object} options — 选项
         * @returns {Array} 推荐列表
         */
        getRecommendations: function(context, options) {
            options = options || { limit: 5 };
            var allRecommendations = [];

            // 1. 从 DecisionExperience 获取
            var de = window.LawAIApp?.DecisionExperience;
            if (de) {
                try {
                    var deOptions = de.getOptions({ includeDismissed: false });
                    if (deOptions && deOptions.length > 0) {
                        for (var i = 0; i < deOptions.length; i++) {
                            allRecommendations.push({
                                source: 'DecisionExperience',
                                option: deOptions[i],
                                priority: deOptions[i].priority || 5,
                                isOptional: true
                            });
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] DecisionExperience error:', e);
                }
            }

            // 2. 从 TransferRecommender 获取
            var tr = window.LawAIApp?.TransferRecommender;
            if (tr) {
                try {
                    var transferRecs = tr.getRecommendations(context, { limit: 2 });
                    if (transferRecs && transferRecs.length > 0) {
                        for (var i = 0; i < transferRecs.length; i++) {
                            allRecommendations.push({
                                source: 'TransferRecommender',
                                option: transferRecs[i],
                                priority: 4,
                                isOptional: true
                            });
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] TransferRecommender error:', e);
                }
            }

            // 3. 从 CalibrationRecommender 获取
            var cr = window.LawAIApp?.CalibrationRecommender;
            if (cr) {
                try {
                    var calRecs = cr.getRecommendations(context, { limit: 2 });
                    if (calRecs && calRecs.length > 0) {
                        for (var i = 0; i < calRecs.length; i++) {
                            allRecommendations.push({
                                source: 'CalibrationRecommender',
                                option: calRecs[i],
                                priority: 3,
                                isOptional: true
                            });
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] CalibrationRecommender error:', e);
                }
            }

            // 4. 排序 (按优先级)
            allRecommendations.sort(function(a, b) {
                return (a.priority || 5) - (b.priority || 5);
            });

            // 5. 去重
            allRecommendations = this._deduplicateRecommendations(allRecommendations);

            // 6. 限制数量
            if (options.limit) {
                allRecommendations = allRecommendations.slice(0, options.limit);
            }

            return allRecommendations;
        },

        /**
         * 获取支持级别
         * @param {Object} context — 上下文
         * @returns {string} 支持级别
         */
        getSupportLevel: function(context) {
            return this._determineSupportLevel(context);
        },

        /**
         * 请求更多帮助
         * @param {Object} context — 上下文
         * @returns {Object} 结果
         */
        requestMoreHelp: function(context) {
            var current = this._determineSupportLevel(context);
            var levels = [this.SUPPORT_LEVELS.NONE, this.SUPPORT_LEVELS.LIGHT, this.SUPPORT_LEVELS.GUIDED, this.SUPPORT_LEVELS.FULL];
            var currentIndex = levels.indexOf(current);

            if (currentIndex < levels.length - 1) {
                var newLevel = levels[currentIndex + 1];
                this._state.currentSupportLevel = newLevel;
                this._saveState();

                this._emit('SUPPORT_CHANGED', {
                    from: current,
                    to: newLevel,
                    direction: 'more'
                });

                return {
                    success: true,
                    previousLevel: current,
                    newLevel: newLevel,
                    label: this.SUPPORT_LABELS[newLevel]
                };
            }

            return {
                success: false,
                message: 'Already at maximum support level',
                currentLevel: current
            };
        },

        /**
         * 请求更少帮助
         * @param {Object} context — 上下文
         * @returns {Object} 结果
         */
        requestLessHelp: function(context) {
            var current = this._determineSupportLevel(context);
            var levels = [this.SUPPORT_LEVELS.NONE, this.SUPPORT_LEVELS.LIGHT, this.SUPPORT_LEVELS.GUIDED, this.SUPPORT_LEVELS.FULL];
            var currentIndex = levels.indexOf(current);

            if (currentIndex > 0) {
                var newLevel = levels[currentIndex - 1];
                this._state.currentSupportLevel = newLevel;
                this._saveState();

                this._emit('SUPPORT_CHANGED', {
                    from: current,
                    to: newLevel,
                    direction: 'less'
                });

                return {
                    success: true,
                    previousLevel: current,
                    newLevel: newLevel,
                    label: this.SUPPORT_LABELS[newLevel]
                };
            }

            return {
                success: false,
                message: 'Already at minimum support level',
                currentLevel: current
            };
        },

        /**
         * 检查推荐是否应该被接受
         * @param {Object} recommendation — 推荐
         * @param {Object} context — 上下文
         * @returns {Object} { valid: boolean, reason: string }
         */
        validateRecommendation: function(recommendation, context) {
            if (!recommendation) {
                return { valid: false, reason: 'No recommendation provided' };
            }

            // 1. 检查是否可选
            if (recommendation.isOptional === false) {
                // 需要检查是否有权威前提
                var hasPrereq = this._checkHardPrerequisite(recommendation, context);
                if (!hasPrereq) {
                    return {
                        valid: false,
                        reason: 'Recommendation marked as non-optional but no hard prerequisite found'
                    };
                }
            }

            // 2. 检查是否与学习者选择冲突
            var de = window.LawAIApp?.DecisionExperience;
            if (de) {
                try {
                    var history = de.getHistory(5);
                    if (history && history.length > 0) {
                        for (var i = 0; i < history.length; i++) {
                            if (history[i].state === 'SELECTED' && history[i].optionId === recommendation.id) {
                                // 如果已经选择过，仍然有效
                                break;
                            }
                            // 检查是否与最近的选择冲突
                            if (history[i].state === 'DISMISSED' && history[i].optionId === recommendation.id) {
                                // 被关闭过，但仍有效 (可重新选择)
                                // 但如果是永久关闭，则无效
                                if (history[i].metadata && history[i].metadata.permanent === true) {
                                    return { valid: false, reason: 'This recommendation was permanently dismissed' };
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] DecisionHistory error:', e);
                }
            }

            return { valid: true, reason: 'Recommendation is valid' };
        },

        /**
         * 获取权威映射
         * @returns {Object} 权威映射
         */
        getAuthorityMap: function() {
            return { ...this._authorityMap };
        },

        /**
         * 获取组件状态
         * @returns {Object} 组件状态
         */
        getComponentStatus: function() {
            return this._getComponentStatus();
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                componentCount: Object.keys(this._components).length,
                supportLevel: this._state.currentSupportLevel || 'NONE',
                journeyHistory: this._state.journeyHistory.length
            };
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                components: Object.keys(this._components),
                supportLevel: this._state.currentSupportLevel || 'NONE'
            };
        },

        // ============================================================
        // PRIVATE — Component Registration
        // ============================================================

        _registerComponents: function() {
            var de = window.LawAIApp?.DecisionExperience;
            if (de) this._components.DecisionExperience = { instance: de, status: de.initialized ? 'active' : 'inactive' };

            var lc = window.LawAIApp?.LearningContext;
            if (lc) this._components.LearningContext = { instance: lc, status: 'active' };

            var at = window.LawAIApp?.ActionTracker;
            if (at) this._components.ActionTracker = { instance: at, status: at.initialized ? 'active' : 'inactive' };

            var pd = window.LawAIApp?.PatternDetector;
            if (pd) this._components.PatternDetector = { instance: pd, status: pd.initialized ? 'active' : 'inactive' };

            var to = window.LawAIApp?.TransferObserver;
            if (to) this._components.TransferObserver = { instance: to, status: to.initialized ? 'active' : 'inactive' };

            var co = window.LawAIApp?.CalibrationObserver;
            if (co) this._components.CalibrationObserver = { instance: co, status: co.initialized ? 'active' : 'inactive' };

            var le = window.LawAIApp?.LessonEngine;
            if (le) this._components.LessonEngine = { instance: le, status: 'active' };

            var cr = window.LawAIApp?.CourseRegistry;
            if (cr) this._components.CourseRegistry = { instance: cr, status: cr.initialized ? 'active' : 'inactive' };

            console.log('[JourneyOrchestrator] 📋 Registered', Object.keys(this._components).length, 'components');
        },

        // ============================================================
        // PRIVATE — Authority Map
        // ============================================================

        _buildAuthorityMap: function() {
            this._authorityMap = {
                'Course': {
                    authority: 'Curriculum Authority',
                    canOverride: false,
                    owner: 'CourseRegistry'
                },
                'Module': {
                    authority: 'Progression Authority',
                    canOverride: false,
                    owner: 'ProgramRegistry'
                },
                'Lesson': {
                    authority: 'Learning Authority',
                    canOverride: false,
                    owner: 'LessonEngine'
                },
                'Calendar': {
                    authority: 'Scheduling Authority',
                    canOverride: false,
                    owner: 'CalendarEngine'
                },
                'Settings': {
                    authority: 'Preference Authority',
                    canOverride: false,
                    owner: 'Settings'
                },
                'Notes': {
                    authority: 'Personal Memory Authority',
                    canOverride: false,
                    owner: 'Notes'
                },
                'KnowledgeGraph': {
                    authority: 'Relationship Authority',
                    canOverride: false,
                    owner: 'KnowledgeGraph'
                },
                'Retention': {
                    authority: 'Review Authority',
                    canOverride: false,
                    owner: 'Retention'
                },
                'Recommendation': {
                    authority: 'Suggestion Authority',
                    canOverride: true,
                    owner: 'DecisionExperience'
                },
                'AI': {
                    authority: 'Assistance/Interpretation Authority',
                    canOverride: true,
                    owner: 'AIRecommendationEngine'
                }
            };
        },

        // ============================================================
        // PRIVATE — Data Collection
        // ============================================================

        _getLearningContext: function() {
            var lc = window.LawAIApp?.LearningContext;
            if (lc && typeof lc.getContext === 'function') {
                try {
                    return lc.getContext();
                } catch (e) {
                    console.warn('[JourneyOrchestrator] LearningContext error:', e);
                }
            }
            return null;
        },

        _getRecommendations: function(context) {
            return this.getRecommendations(context, { limit: 3 });
        },

        _getOptions: function(context) {
            var de = window.LawAIApp?.DecisionExperience;
            if (de && typeof de.getOptions === 'function') {
                try {
                    return de.getOptions({ includeDismissed: false });
                } catch (e) {
                    console.warn('[JourneyOrchestrator] DecisionExperience options error:', e);
                }
            }
            return [];
        },

        _collectSignals: function(context) {
            var signals = [];

            // 从各个组件收集信号
            var ei = window.LawAIApp?.ExperienceIntelligence;
            if (ei && typeof ei.getSignals === 'function') {
                try {
                    var eiSignals = ei.getSignals();
                    if (eiSignals) signals.push(eiSignals);
                } catch (e) {
                    console.warn('[JourneyOrchestrator] ExperienceIntelligence error:', e);
                }
            }

            var pd = window.LawAIApp?.PatternDetector;
            if (pd) {
                try {
                    var patterns = pd.getActivePatterns(3);
                    if (patterns && patterns.length > 0) {
                        signals.push({ type: 'patterns', count: patterns.length });
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] PatternDetector error:', e);
                }
            }

            return signals;
        },

        _getComponentStatus: function() {
            var status = {};
            for (var key in this._components) {
                if (this._components.hasOwnProperty(key)) {
                    status[key] = this._components[key].status;
                }
            }
            return status;
        },

        // ============================================================
        // PRIVATE — Support Level
        // ============================================================

        _determineSupportLevel: function(context) {
            // 如果有保存的状态，优先使用
            if (this._state.currentSupportLevel && this._state.currentSupportLevel !== 'NONE') {
                return this._state.currentSupportLevel;
            }

            // 默认: 根据学习上下文确定
            var lc = this._getLearningContext();
            if (!lc) return this.SUPPORT_LEVELS.NONE;

            // 如果有活跃会话，提供引导
            if (lc.session && lc.session.status === 'active') {
                // 检查是否有校准证据表明需要更多支持
                var co = window.LawAIApp?.CalibrationObserver;
                if (co) {
                    try {
                        var stats = co.getStats();
                        var overconfident = stats.byCalibrationState?.OVERCONFIDENT || 0;
                        if (overconfident >= 2) {
                            return this.SUPPORT_LEVELS.GUIDED;
                        }
                    } catch (e) {
                        console.warn('[JourneyOrchestrator] CalibrationObserver error:', e);
                    }
                }
                return this.SUPPORT_LEVELS.LIGHT;
            }

            // 如果有课程但无会话
            if (lc.course) {
                return this.SUPPORT_LEVELS.LIGHT;
            }

            return this.SUPPORT_LEVELS.NONE;
        },

        // ============================================================
        // PRIVATE — Validation
        // ============================================================

        _checkHardPrerequisite: function(recommendation, context) {
            var module = window.LawAIApp?.ProgramRegistry || window.LawAIApp?.Module;
            if (module && typeof module.getPrerequisites === 'function') {
                try {
                    var prereqs = module.getPrerequisites(recommendation.id);
                    if (prereqs && prereqs.length > 0) {
                        for (var i = 0; i < prereqs.length; i++) {
                            if (prereqs[i].isHard) {
                                return true;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] Prerequisite check error:', e);
                }
            }
            return false;
        },

        _checkAuthorityConflicts: function(context) {
            var conflicts = [];

            // 检查推荐是否与权威状态冲突
            var de = window.LawAIApp?.DecisionExperience;
            if (de) {
                try {
                    var options = de.getOptions({ includeDismissed: false });
                    if (options && options.length > 0) {
                        var deOptions = window.LawAIApp?.DecisionAuthority;
                        if (deOptions) {
                            for (var i = 0; i < options.length; i++) {
                                var level = deOptions.getAuthorityLevel(options[i], context);
                                if (level >= 6) {
                                    // 高层级的选项可能表示硬性要求
                                    conflicts.push({
                                        optionId: options[i].id,
                                        title: options[i].title || 'Option',
                                        authorityLevel: level,
                                        reason: 'High authority level detected'
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[JourneyOrchestrator] Authority conflict check error:', e);
                }
            }

            return conflicts;
        },

        // ============================================================
        // PRIVATE — Deduplication
        // ============================================================

        _deduplicateRecommendations: function(recommendations) {
            var unique = {};
            var result = [];

            for (var i = 0; i < recommendations.length; i++) {
                var key = recommendations[i].option.id || recommendations[i].option.title;
                if (!unique[key]) {
                    unique[key] = true;
                    result.push(recommendations[i]);
                }
            }

            return result;
        },

        // ============================================================
        // PRIVATE — State Management
        // ============================================================

        _loadState: function() {
            try {
                var saved = localStorage.getItem('journeyOrchestratorState');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.supportLevel) {
                        this._state.currentSupportLevel = data.supportLevel;
                    }
                    if (data.journeyHistory) {
                        this._state.journeyHistory = data.journeyHistory;
                    }
                    console.log('[JourneyOrchestrator] Loaded state, support level:', this._state.currentSupportLevel);
                }
            } catch (e) {
                // ignore
            }
        },

        _saveState: function() {
            try {
                localStorage.setItem('journeyOrchestratorState', JSON.stringify({
                    supportLevel: this._state.currentSupportLevel,
                    journeyHistory: this._state.journeyHistory.slice(-50),
                    updatedAt: Date.now()
                }));
            } catch (e) {
                // ignore
            }
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('journey.' + eventName, data);
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

    window.LawAIApp.JourneyOrchestrator = JourneyOrchestrator;

    function autoInit() {
        if (!JourneyOrchestrator.initialized) {
            JourneyOrchestrator.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 600);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 600);
        });
    }

    console.log('[JourneyOrchestrator] Module loaded (Part 63)');

})();
