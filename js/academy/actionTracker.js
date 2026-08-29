// js/academy/actionTracker.js
// Part 55 — Action Tracker
// Law AI Academy Developer Bible
//
// PURPOSE: Track learner actions, distinguish from outcomes
// OWNERSHIP: ACTION RECORDING layer — no state mutation, read-only

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ActionTracker) {
        console.log('[ActionTracker] Already exists, skipping...');
        return;
    }

    /**
     * ActionTracker
     *
     * 职责：记录学习者动作，区分 ACTION ≠ OUTCOME
     * 
     * ACTION TYPES:
     *   OPEN, START, RESUME, CONTINUE, REVIEW, PRACTICE,
     *   EXPLORE, SAVE, DISMISS, SKIP, COMPLETE, RETURN
     * 
     * 规则：
     *   - OPEN ≠ START ≠ COMPLETE
     *   - 不推断完成状态
     *   - 只记录权威来源的事件
     */
    var ActionTracker = {
        version: '1.0.0',
        initialized: false,

        _actionHistory: [],
        _maxHistory: 200,

        // ============================================================
        // ACTION TYPES (Part 55)
        // ============================================================

        TYPES: {
            OPEN: 'OPEN',
            START: 'START',
            RESUME: 'RESUME',
            CONTINUE: 'CONTINUE',
            REVIEW: 'REVIEW',
            PRACTICE: 'PRACTICE',
            EXPLORE: 'EXPLORE',
            SAVE: 'SAVE',
            DISMISS: 'DISMISS',
            SKIP: 'SKIP',
            COMPLETE: 'COMPLETE',
            RETURN: 'RETURN'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化 ActionTracker
         */
        init: function() {
            if (this.initialized) {
                console.log('[ActionTracker] Already initialized');
                return this;
            }

            console.log('[ActionTracker] 🚀 Initializing...');
            this._bindEvents();
            this.initialized = true;
            console.log('[ActionTracker] ✅ Initialized');
            return this;
        },

        /**
         * 记录动作
         * @param {Object} actionData
         * @param {string} actionData.type — 动作类型 (TYPES)
         * @param {string} actionData.target — 目标 ID (lessonId, courseId, etc.)
         * @param {string} actionData.source — 来源 (decisionId, recommendationId, etc.)
         * @param {Object} actionData.metadata — 额外元数据
         * @returns {Object} 记录的动作
         */
        record: function(actionData) {
            if (!actionData || !actionData.type) {
                console.warn('[ActionTracker] Invalid action data');
                return null;
            }

            // 验证动作类型
            var validTypes = Object.values(this.TYPES);
            if (validTypes.indexOf(actionData.type) === -1) {
                console.warn('[ActionTracker] Unknown action type:', actionData.type);
                return null;
            }

            var action = {
                id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: actionData.type,
                target: actionData.target || null,
                source: actionData.source || null,
                timestamp: Date.now(),
                metadata: actionData.metadata || {},
                // 关联信息
                decisionId: actionData.decisionId || null,
                optionId: actionData.optionId || null,
                recommendationId: actionData.recommendationId || null,
                // 状态
                validated: false,
                outcomeId: null
            };

            // 存储历史
            this._actionHistory.push(action);
            if (this._actionHistory.length > this._maxHistory) {
                this._actionHistory.shift();
            }

            // 发射事件
            this._emit('ACTION_RECORDED', action);

            // 尝试链接到决策
            if (actionData.decisionId) {
                this._linkToDecision(action);
            }

            console.log('[ActionTracker] 📝 Action recorded:', action.type, action.target);

            return action;
        },

        /**
         * 获取动作历史
         * @param {number} limit — 最大数量
         * @param {string} type — 可选，按类型筛选
         * @returns {Array} 动作列表
         */
        getHistory: function(limit, type) {
            limit = limit || 20;
            var history = this._actionHistory.slice(-limit).reverse();

            if (type) {
                history = history.filter(function(a) { return a.type === type; });
            }

            return history;
        },

        /**
         * 获取最近动作
         * @param {string} target — 目标 ID
         * @returns {Object|null} 最近的动作
         */
        getLastAction: function(target) {
            var history = this._actionHistory.slice().reverse();

            for (var i = 0; i < history.length; i++) {
                if (history[i].target === target) {
                    return history[i];
                }
            }
            return null;
        },

        /**
         * 检查是否有进行中的动作 (STARTED 但没有 COMPLETE)
         * @param {string} target — 目标 ID
         * @returns {boolean}
         */
        hasActiveAction: function(target) {
            var history = this._actionHistory.slice().reverse();

            for (var i = 0; i < history.length; i++) {
                var a = history[i];
                if (a.target === target) {
                    if (a.type === this.TYPES.START || a.type === this.TYPES.RESUME || a.type === this.TYPES.CONTINUE) {
                        // 检查是否有后续的 COMPLETE
                        var hasComplete = false;
                        for (var j = 0; j < history.length; j++) {
                            if (history[j].target === target && history[j].type === this.TYPES.COMPLETE) {
                                hasComplete = true;
                                break;
                            }
                        }
                        if (!hasComplete) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        /**
         * 获取动作统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._actionHistory.length,
                byType: {},
                recent: this._actionHistory.slice(-10).reverse()
            };

            for (var i = 0; i < this._actionHistory.length; i++) {
                var type = this._actionHistory[i].type;
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            }

            return stats;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                historySize: this._actionHistory.length
            };
        },

        // ============================================================
        // PRIVATE — Event Binding
        // ============================================================

        _bindEvents: function() {
            var self = this;

            // 监听学习事件
            document.addEventListener('LESSON_STARTED', function(e) {
                var detail = e.detail || {};
                self.record({
                    type: self.TYPES.START,
                    target: detail.lessonId || detail.target,
                    source: 'LESSON_STARTED',
                    metadata: detail
                });
            });

            document.addEventListener('LESSON_COMPLETED', function(e) {
                var detail = e.detail || {};
                self.record({
                    type: self.TYPES.COMPLETE,
                    target: detail.lessonId || detail.target,
                    source: 'LESSON_COMPLETED',
                    metadata: detail
                });
            });

            document.addEventListener('LESSON_RESUMED', function(e) {
                var detail = e.detail || {};
                self.record({
                    type: self.TYPES.RESUME,
                    target: detail.lessonId || detail.target,
                    source: 'LESSON_RESUMED',
                    metadata: detail
                });
            });

            // 监听决策事件
            document.addEventListener('OPTION_SELECTED', function(e) {
                var detail = e.detail || {};
                var option = detail.option || {};
                self.record({
                    type: self.TYPES.CONTINUE,
                    target: option.metadata?.courseId || option.id,
                    source: 'OPTION_SELECTED',
                    decisionId: detail.decisionId || detail.optionId,
                    optionId: detail.optionId,
                    recommendationId: option.metadata?.recommendationId,
                    metadata: detail
                });
            });

            // 监听用户动作
            document.addEventListener('USER_ACTION', function(e) {
                var detail = e.detail || {};
                if (detail.type) {
                    self.record({
                        type: detail.type,
                        target: detail.target,
                        source: 'USER_ACTION',
                        metadata: detail
                    });
                }
            });

            console.log('[ActionTracker] 📡 Events bound');
        },

        /**
         * 链接到决策
         * @private
         */
        _linkToDecision: function(action) {
            try {
                var de = window.LawAIApp?.DecisionExperience;
                if (de && typeof de.getHistory === 'function') {
                    var history = de.getHistory(10);
                    for (var i = 0; i < history.length; i++) {
                        if (history[i].optionId === action.optionId) {
                            action.decisionRecord = history[i];
                            break;
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }
        },

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
                    window.LawAIApp.EventBus.emit('action.' + eventName, data);
                }
            } catch (err) {
                // 忽略
            }
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ActionTracker = ActionTracker;

    function autoInit() {
        if (!ActionTracker.initialized) {
            ActionTracker.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[ActionTracker] Module loaded (Part 55)');

})();
