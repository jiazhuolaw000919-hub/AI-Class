// js/academy/outcomeLinker.js
// Part 55 — Outcome Linker
// Law AI Academy Developer Bible
//
// PURPOSE: Link Recommendation → Action → Outcome
// OWNERSHIP: LINKING layer — no state, read-only
// RULES: Recommendation ID → Option ID → Action ID → Outcome ID

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OutcomeLinker) {
        console.log('[OutcomeLinker] Already exists, skipping...');
        return;
    }

    /**
     * OutcomeLinker
     *
     * 职责：链接推荐 → 动作 → 结果
     * 
     * 链接链:
     *   Recommendation R-001
     *       ↓
     *   Option O-001
     *       ↓
     *   Action A-001
     *       ↓
     *   Outcome OUT-001
     * 
     * 规则：
     *   - 不创建虚假链接
     *   - 只链接存在的记录
     *   - 支持追溯
     */
    var OutcomeLinker = {
        version: '1.0.0',
        initialized: false,

        _linkHistory: [],
        _maxHistory: 100,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[OutcomeLinker] Already initialized');
                return this;
            }

            console.log('[OutcomeLinker] 🚀 Initializing...');
            this.initialized = true;
            console.log('[OutcomeLinker] ✅ Initialized');
            return this;
        },

        /**
         * 链接推荐到动作
         * @param {string} recommendationId — 推荐 ID
         * @param {string} actionId — 动作 ID
         * @param {Object} metadata — 元数据
         * @returns {Object} 链接记录
         */
        linkRecommendationToAction: function(recommendationId, actionId, metadata) {
            if (!recommendationId || !actionId) {
                console.warn('[OutcomeLinker] Missing recommendationId or actionId');
                return null;
            }

            var link = {
                id: 'lnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'RECOMMENDATION_TO_ACTION',
                recommendationId: recommendationId,
                actionId: actionId,
                timestamp: Date.now(),
                metadata: metadata || {},
                outcomeId: null,
                completed: false
            };

            this._linkHistory.push(link);
            if (this._linkHistory.length > this._maxHistory) {
                this._linkHistory.shift();
            }

            this._emit('LINK_CREATED', link);
            console.log('[OutcomeLinker] 🔗 Linked recommendation to action:', recommendationId, '→', actionId);

            return link;
        },

        /**
         * 链接动作到结果
         * @param {string} actionId — 动作 ID
         * @param {string} outcomeId — 结果 ID
         * @param {Object} metadata — 元数据
         * @returns {Object} 链接记录
         */
        linkActionToOutcome: function(actionId, outcomeId, metadata) {
            if (!actionId || !outcomeId) {
                console.warn('[OutcomeLinker] Missing actionId or outcomeId');
                return null;
            }

            // 查找是否有现有的推荐链接
            var existingLink = null;
            for (var i = 0; i < this._linkHistory.length; i++) {
                if (this._linkHistory[i].actionId === actionId && this._linkHistory[i].type === 'RECOMMENDATION_TO_ACTION') {
                    existingLink = this._linkHistory[i];
                    break;
                }
            }

            var link = {
                id: 'lnk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'ACTION_TO_OUTCOME',
                actionId: actionId,
                outcomeId: outcomeId,
                timestamp: Date.now(),
                metadata: metadata || {},
                recommendationId: existingLink ? existingLink.recommendationId : null,
                completed: true
            };

            // 更新原有链接
            if (existingLink) {
                existingLink.outcomeId = outcomeId;
                existingLink.completed = true;
            }

            this._linkHistory.push(link);
            if (this._linkHistory.length > this._maxHistory) {
                this._linkHistory.shift();
            }

            this._emit('LINK_COMPLETED', link);
            console.log('[OutcomeLinker] 🔗 Linked action to outcome:', actionId, '→', outcomeId);

            return link;
        },

        /**
         * 获取完整链接链
         * @param {string} recommendationId — 推荐 ID
         * @returns {Object|null} 完整链接链
         */
        getChain: function(recommendationId) {
            if (!recommendationId) return null;

            var chain = {
                recommendationId: recommendationId,
                option: null,
                action: null,
                outcome: null,
                links: []
            };

            // 查找推荐 → 动作链接
            var recToAction = null;
            for (var i = 0; i < this._linkHistory.length; i++) {
                if (this._linkHistory[i].recommendationId === recommendationId && 
                    this._linkHistory[i].type === 'RECOMMENDATION_TO_ACTION') {
                    recToAction = this._linkHistory[i];
                    break;
                }
            }

            if (!recToAction) {
                // 尝试从 ActionTracker 查找
                var actionTracker = window.LawAIApp?.ActionTracker;
                if (actionTracker && typeof actionTracker.getHistory === 'function') {
                    var actions = actionTracker.getHistory(50);
                    for (var j = 0; j < actions.length; j++) {
                        if (actions[j].recommendationId === recommendationId) {
                            chain.action = actions[j];
                            chain.links.push({ type: 'ACTION', data: actions[j] });
                            break;
                        }
                    }
                }
                return chain;
            }

            chain.links.push(recToAction);

            // 获取动作详情
            var actionTracker = window.LawAIApp?.ActionTracker;
            if (actionTracker && typeof actionTracker.getHistory === 'function') {
                var actions = actionTracker.getHistory(50);
                for (var j = 0; j < actions.length; j++) {
                    if (actions[j].id === recToAction.actionId) {
                        chain.action = actions[j];
                        chain.links.push({ type: 'ACTION', data: actions[j] });
                        break;
                    }
                }
            }

            // 如果有结果 ID，获取结果
            if (recToAction.outcomeId) {
                // 尝试从 OutcomeNormalizer 获取
                chain.outcome = { id: recToAction.outcomeId, linked: true };
                chain.links.push({ type: 'OUTCOME', data: { id: recToAction.outcomeId } });
            }

            return chain;
        },

        /**
         * 获取所有链接
         * @param {number} limit — 最大数量
         * @returns {Array} 链接列表
         */
        getLinks: function(limit) {
            limit = limit || 20;
            return this._linkHistory.slice(-limit).reverse();
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                totalLinks: this._linkHistory.length,
                byType: {},
                completed: 0,
                pending: 0
            };

            for (var i = 0; i < this._linkHistory.length; i++) {
                var link = this._linkHistory[i];
                stats.byType[link.type] = (stats.byType[link.type] || 0) + 1;
                if (link.completed) {
                    stats.completed++;
                } else {
                    stats.pending++;
                }
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
                linkCount: this._linkHistory.length
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
                    window.LawAIApp.EventBus.emit('linker.' + eventName, data);
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

    window.LawAIApp.OutcomeLinker = OutcomeLinker;

    function autoInit() {
        if (!OutcomeLinker.initialized) {
            OutcomeLinker.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[OutcomeLinker] Module loaded (Part 55)');

})();
