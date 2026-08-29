// js/academy/adaptationSignal.js
// Part 55 — Adaptation Signal
// Law AI Academy Developer Bible
//
// PURPOSE: Generate adaptation signals from outcomes
// OWNERSHIP: SIGNAL GENERATION layer — no state mutation
// LEVELS: Contextual → Temporary → Preference → Long-term

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AdaptationSignal) {
        console.log('[AdaptationSignal] Already exists, skipping...');
        return;
    }

    /**
     * AdaptationSignal
     *
     * 职责：从结果生成适应信号
     * 
     * ADAPTATION LEVELS:
     *   LEVEL 1 — CONTEXTUAL (当前会话/上下文)
     *   LEVEL 2 — TEMPORARY (有限期限)
     *   LEVEL 3 — PREFERENCE (明确偏好)
     *   LEVEL 4 — LONG_TERM (长期模式)
     * 
     * 规则：
     *   - 不直接从 Level 1 跳到 Level 4
     *   - 明确偏好 > 推断行为
     *   - 一次选择 ≠ 永久个性
     */
    var AdaptationSignal = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // ADAPTATION LEVELS (Part 55)
        // ============================================================

        LEVELS: {
            CONTEXTUAL: 1,
            TEMPORARY: 2,
            PREFERENCE: 3,
            LONG_TERM: 4
        },

        _signalHistory: [],
        _maxHistory: 100,
        _minEvidenceForLevel3: 3,
        _minEvidenceForLevel4: 10,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AdaptationSignal] Already initialized');
                return this;
            }

            console.log('[AdaptationSignal] 🚀 Initializing...');
            this.initialized = true;
            console.log('[AdaptationSignal] ✅ Initialized');
            return this;
        },

        /**
         * 从结果生成适应信号
         * @param {Object} outcome — 结果
         * @param {Object} context — 上下文
         * @returns {Object|null} 适应信号
         */
        fromOutcome: function(outcome, context) {
            if (!outcome) return null;

            var level = this._determineLevel(outcome, context);
            var signal = {
                id: 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                outcomeId: outcome.id || null,
                target: outcome.target || null,
                type: outcome.type || 'UNKNOWN',
                level: level,
                levelLabel: this._getLevelLabel(level),
                confidence: this._calculateConfidence(outcome, context),
                timestamp: Date.now(),
                evidence: outcome.evidence || [],
                metadata: outcome.metadata || {},
                // 明确偏好标志
                isExplicitPreference: this._isExplicitPreference(outcome, context),
                // 是否应使用
                actionable: level >= this.LEVELS.TEMPORARY,
                // 来源
                source: outcome.source || 'UNKNOWN'
            };

            this._signalHistory.push(signal);
            if (this._signalHistory.length > this._maxHistory) {
                this._signalHistory.shift();
            }

            this._emit('ADAPTATION_SIGNAL_GENERATED', signal);
            console.log('[AdaptationSignal] 📡 Signal generated:', signal.levelLabel, signal.target);

            return signal;

            // ── Part 56: Create AdaptationRecord ──
            try {
                var record = window.LawAIApp?.AdaptationRecord;
                if (record && typeof record.create === 'function') {
                    record.create({
                        trigger: 'LEARNING_OUTCOME',
                        evidence: outcome.evidence || ['Outcome recorded'],
                        previousState: null,
                        newState: { signal: signal },
                        scope: 'signal',
                        reason: 'Adaptation signal generated from outcome',
                        level: signal.level || 1,
                        authority: 'AdaptationSignal',
                        reversible: true,
                        metadata: {
                            outcomeId: outcome.id,
                            target: outcome.target,
                            signalId: signal.id
                        },
                        causationId: outcome.id
                    });
                }
            } catch (e) {
                console.warn('[AdaptationSignal] Could not create record:', e);
            }
        },

        /**
         * 从多个结果生成适应信号
         * @param {Array} outcomes — 结果列表
         * @param {Object} context — 上下文
         * @returns {Array} 适应信号列表
         */
        fromOutcomes: function(outcomes, context) {
            if (!outcomes || outcomes.length === 0) return [];

            var signals = [];

            // 按目标分组
            var grouped = {};
            for (var i = 0; i < outcomes.length; i++) {
                var target = outcomes[i].target || 'unknown';
                if (!grouped[target]) {
                    grouped[target] = [];
                }
                grouped[target].push(outcomes[i]);
            }

            // 为每个目标生成信号
            for (var target in grouped) {
                if (grouped.hasOwnProperty(target)) {
                    var targetOutcomes = grouped[target];
                    // 只对多个结果生成信号
                    if (targetOutcomes.length >= 2) {
                        var signal = this.fromOutcome(targetOutcomes[targetOutcomes.length - 1], context);
                        if (signal) {
                            signal.metadata.count = targetOutcomes.length;
                            signal.metadata.firstSeen = targetOutcomes[0].timestamp;
                            signal.metadata.lastSeen = targetOutcomes[targetOutcomes.length - 1].timestamp;
                            signals.push(signal);
                        }
                    }
                }
            }

            // 按置信度排序
            signals.sort(function(a, b) {
                return b.confidence - a.confidence;
            });

            return signals;
        },

        /**
         * 获取适应信号
         * @param {number} limit — 最大数量
         * @param {string} target — 可选，按目标筛选
         * @returns {Array} 信号列表
         */
        getSignals: function(limit, target) {
            limit = limit || 20;
            var signals = this._signalHistory.slice(-limit).reverse();

            if (target) {
                signals = signals.filter(function(s) { return s.target === target; });
            }

            return signals;
        },

        /**
         * 获取可操作的信号 (Level >= TEMPORARY)
         * @param {number} limit — 最大数量
         * @returns {Array} 可操作信号列表
         */
        getActionableSignals: function(limit) {
            limit = limit || 10;
            return this._signalHistory
                .filter(function(s) { return s.actionable; })
                .slice(-limit)
                .reverse();
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._signalHistory.length,
                byLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
                byType: {},
                actionable: 0,
                explicitPreference: 0
            };

            for (var i = 0; i < this._signalHistory.length; i++) {
                var s = this._signalHistory[i];
                stats.byLevel[s.level] = (stats.byLevel[s.level] || 0) + 1;
                stats.byType[s.type] = (stats.byType[s.type] || 0) + 1;
                if (s.actionable) stats.actionable++;
                if (s.isExplicitPreference) stats.explicitPreference++;
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
                signalCount: this._signalHistory.length
            };
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        /**
         * 确定适应级别
         * @private
         */
        _determineLevel: function(outcome, context) {
            // Level 4: 明确偏好 + 多次证据
            if (this._isExplicitPreference(outcome, context)) {
                var count = this._countSimilarOutcomes(outcome);
                if (count >= this._minEvidenceForLevel4) {
                    return this.LEVELS.LONG_TERM;
                }
                if (count >= this._minEvidenceForLevel3) {
                    return this.LEVELS.PREFERENCE;
                }
            }

            // Level 3: 明确偏好 (即使只有一次)
            if (this._isExplicitPreference(outcome, context)) {
                return this.LEVELS.PREFERENCE;
            }

            // Level 2: 临时 (多次相似结果)
            var count = this._countSimilarOutcomes(outcome);
            if (count >= 2) {
                return this.LEVELS.TEMPORARY;
            }

            // Level 1: 上下文 (默认)
            return this.LEVELS.CONTEXTUAL;
        },

        /**
         * 检查是否为明确偏好
         * @private
         */
        _isExplicitPreference: function(outcome, context) {
            if (!outcome) return false;

            // 来源是学习者反馈
            if (outcome.source === 'LEARNER_FEEDBACK') {
                return true;
            }

            // 类型是反馈接收
            if (outcome.type === 'FEEDBACK_RECEIVED') {
                return true;
            }

            // 元数据中有 explicit 标志
            if (outcome.metadata && outcome.metadata.explicit === true) {
                return true;
            }

            return false;
        },

        /**
         * 计算相似结果数量
         * @private
         */
        _countSimilarOutcomes: function(outcome) {
            if (!outcome || !outcome.target) return 0;

            var count = 0;
            // 检查历史信号
            for (var i = 0; i < this._signalHistory.length; i++) {
                if (this._signalHistory[i].target === outcome.target) {
                    count++;
                }
            }
            // 包括当前结果
            return count + 1;
        },

        /**
         * 计算置信度
         * @private
         */
        _calculateConfidence: function(outcome, context) {
            var baseConfidence = 0.3;

            // 有证据
            if (outcome.evidence && outcome.evidence.length > 0) {
                baseConfidence += 0.2;
            }

            // 来自权威来源
            if (outcome.source && outcome.source !== 'UNKNOWN') {
                baseConfidence += 0.1;
            }

            // 明确偏好
            if (this._isExplicitPreference(outcome, context)) {
                baseConfidence += 0.3;
            }

            // 多次出现
            var count = this._countSimilarOutcomes(outcome);
            if (count >= 3) baseConfidence += 0.1;
            if (count >= 5) baseConfidence += 0.1;

            return Math.min(1, baseConfidence);
        },

        /**
         * 获取级别标签
         * @private
         */
        _getLevelLabel: function(level) {
            var labels = {
                1: 'Contextual',
                2: 'Temporary',
                3: 'Preference',
                4: 'Long-term'
            };
            return labels[level] || 'Unknown';
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('adaptation.' + eventName, data);
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

    window.LawAIApp.AdaptationSignal = AdaptationSignal;

    function autoInit() {
        if (!AdaptationSignal.initialized) {
            AdaptationSignal.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AdaptationSignal] Module loaded (Part 55)');

})();
