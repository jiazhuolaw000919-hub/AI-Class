// js/academy/adaptationRecord.js
// Part 56 — Adaptation Record
// Law AI Academy Developer Bible
//
// PURPOSE: Traceable adaptation records
// RULES: Every adaptation must be inspectable, reversible, auditable

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AdaptationRecord) {
        console.log('[AdaptationRecord] Already exists, skipping...');
        return;
    }

    /**
     * AdaptationRecord
     *
     * 职责：创建和存储可追溯的适应记录
     * 
     * 记录包含:
     *   - adaptationId
     *   - trigger
     *   - evidence
     *   - previousState
     *   - newState
     *   - scope
     *   - reason
     *   - authority
     *   - timestamp
     *   - reversible
     *   - outcome
     *   - feedback
     */
    var AdaptationRecord = {
        version: '1.0.0',
        initialized: false,

        _records: [],
        _maxRecords: 200,

        // ============================================================
        // TRIGGER TYPES (Part 56)
        // ============================================================

        TRIGGERS: {
            LEARNER_ACTION: 'LEARNER_ACTION',
            LEARNING_OUTCOME: 'LEARNING_OUTCOME',
            EXPLICIT_PREFERENCE: 'EXPLICIT_PREFERENCE',
            GOAL_CHANGE: 'GOAL_CHANGE',
            SCHEDULE_CONTEXT: 'SCHEDULE_CONTEXT',
            COURSE_CONTEXT: 'COURSE_CONTEXT',
            MODULE_CONTEXT: 'MODULE_CONTEXT',
            RETENTION_SIGNAL: 'RETENTION_SIGNAL',
            RECOMMENDATION_OUTCOME: 'RECOMMENDATION_OUTCOME',
            FEEDBACK: 'FEEDBACK'
        },

        // ============================================================
        // ADAPTATION LEVELS (Part 56)
        // ============================================================

        LEVELS: {
            NONE: 0,
            PRESENTATION: 1,
            SUPPORT: 2,
            PATHWAY_SUGGESTION: 3,
            AUTHORITATIVE: 4
        },

        // ============================================================
        // ADAPTATION STATUS (Part 56)
        // ============================================================

        STATUS: {
            APPLIED: 'APPLIED',
            VIEWED: 'VIEWED',
            EXPLAINED: 'EXPLAINED',
            OVERRIDDEN: 'OVERRIDDEN',
            DISMISSED: 'DISMISSED',
            EXPIRED: 'EXPIRED'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[AdaptationRecord] Already initialized');
                return this;
            }

            console.log('[AdaptationRecord] 🚀 Initializing...');
            this._loadRecords();
            this.initialized = true;
            console.log('[AdaptationRecord] ✅ Initialized');
            return this;
        },

        /**
         * 创建适应记录
         * @param {Object} config
         * @param {string} config.trigger — 触发类型
         * @param {Array} config.evidence — 证据列表
         * @param {Object} config.previousState — 之前状态
         * @param {Object} config.newState — 新状态
         * @param {string} config.scope — 范围
         * @param {string} config.reason — 原因
         * @param {number} config.level — 适应级别 (0-4)
         * @param {string} config.authority — 权威来源
         * @param {boolean} config.reversible — 是否可逆
         * @param {Object} config.metadata — 元数据
         * @returns {Object} 适应记录
         */
        create: function(config) {
            if (!config || !config.trigger) {
                console.warn('[AdaptationRecord] Invalid config: missing trigger');
                return null;
            }

            // 验证 trigger
            var validTriggers = Object.values(this.TRIGGERS);
            if (validTriggers.indexOf(config.trigger) === -1) {
                console.warn('[AdaptationRecord] Unknown trigger:', config.trigger);
                return null;
            }

            var record = {
                adaptationId: 'adp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                trigger: config.trigger,
                evidence: config.evidence || [],
                previousState: config.previousState || null,
                newState: config.newState || null,
                scope: config.scope || 'unknown',
                reason: config.reason || '',
                level: config.level || this.LEVELS.PRESENTATION,
                levelLabel: this._getLevelLabel(config.level || this.LEVELS.PRESENTATION),
                authority: config.authority || 'AdaptationRecord',
                timestamp: Date.now(),
                reversible: config.reversible !== undefined ? config.reversible : true,
                metadata: config.metadata || {},
                status: this.STATUS.APPLIED,
                outcomeId: null,
                feedbackId: null,
                override: false,
                dismissed: false,
                causationId: config.causationId || null
            };

            // 关联到现有信号
            if (config.signalId) {
                record.metadata.signalId = config.signalId;
            }

            this._records.push(record);
            if (this._records.length > this._maxRecords) {
                this._records.shift();
            }

            this._saveRecords();

            this._emit('ADAPTATION_RECORDED', record);
            console.log('[AdaptationRecord] 📝 Recorded:', record.adaptationId, record.trigger);

            return record;
        },

        /**
         * 更新适应记录状态
         * @param {string} adaptationId — 适应 ID
         * @param {string} status — 新状态
         * @param {Object} metadata — 元数据
         * @returns {Object|null} 更新后的记录
         */
        updateStatus: function(adaptationId, status, metadata) {
            var record = this.getRecord(adaptationId);
            if (!record) {
                console.warn('[AdaptationRecord] Record not found:', adaptationId);
                return null;
            }

            var validStatuses = Object.values(this.STATUS);
            if (validStatuses.indexOf(status) === -1) {
                console.warn('[AdaptationRecord] Invalid status:', status);
                return null;
            }

            record.status = status;
            if (metadata) {
                record.metadata = { ...record.metadata, ...metadata };
            }
            record.updatedAt = Date.now();

            if (status === this.STATUS.OVERRIDDEN) {
                record.override = true;
            }
            if (status === this.STATUS.DISMISSED) {
                record.dismissed = true;
            }

            this._saveRecords();
            this._emit('ADAPTATION_UPDATED', record);

            return record;
        },

        /**
         * 连接适应到结果
         * @param {string} adaptationId — 适应 ID
         * @param {string} outcomeId — 结果 ID
         * @returns {Object|null} 更新后的记录
         */
        linkOutcome: function(adaptationId, outcomeId) {
            var record = this.getRecord(adaptationId);
            if (!record) {
                console.warn('[AdaptationRecord] Record not found:', adaptationId);
                return null;
            }

            record.outcomeId = outcomeId;
            this._saveRecords();
            this._emit('ADAPTATION_LINKED', { adaptationId, outcomeId });

            return record;
        },

        /**
         * 连接适应到反馈
         * @param {string} adaptationId — 适应 ID
         * @param {string} feedbackId — 反馈 ID
         * @returns {Object|null} 更新后的记录
         */
        linkFeedback: function(adaptationId, feedbackId) {
            var record = this.getRecord(adaptationId);
            if (!record) {
                console.warn('[AdaptationRecord] Record not found:', adaptationId);
                return null;
            }

            record.feedbackId = feedbackId;
            this._saveRecords();
            this._emit('ADAPTATION_FEEDBACK', { adaptationId, feedbackId });

            return record;
        },

        /**
         * 获取适应记录
         * @param {string} adaptationId — 适应 ID
         * @returns {Object|null} 适应记录
         */
        getRecord: function(adaptationId) {
            for (var i = 0; i < this._records.length; i++) {
                if (this._records[i].adaptationId === adaptationId) {
                    return this._records[i];
                }
            }
            return null;
        },

        /**
         * 获取所有适应记录
         * @param {number} limit — 最大数量
         * @param {string} trigger — 可选，按触发类型筛选
         * @returns {Array} 记录列表
         */
        getRecords: function(limit, trigger) {
            limit = limit || 20;
            var records = this._records.slice(-limit).reverse();

            if (trigger) {
                records = records.filter(function(r) { return r.trigger === trigger; });
            }

            return records;
        },

        /**
         * 获取适应历史 (学习者可读)
         * @param {number} limit — 最大数量
         * @returns {Array} 适应历史
         */
        getLearnerHistory: function(limit) {
            limit = limit || 10;
            var history = [];
            var records = this._records.slice(-limit).reverse();

            for (var i = 0; i < records.length; i++) {
                var r = records[i];
                history.push({
                    adaptationId: r.adaptationId,
                    reason: r.reason,
                    levelLabel: r.levelLabel,
                    timestamp: r.timestamp,
                    status: r.status,
                    override: r.override,
                    dismissed: r.dismissed
                });
            }

            return history;
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._records.length,
                byTrigger: {},
                byLevel: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
                byStatus: {},
                overridden: 0,
                dismissed: 0,
                withOutcome: 0,
                withFeedback: 0
            };

            for (var i = 0; i < this._records.length; i++) {
                var r = this._records[i];
                stats.byTrigger[r.trigger] = (stats.byTrigger[r.trigger] || 0) + 1;
                stats.byLevel[r.level] = (stats.byLevel[r.level] || 0) + 1;
                stats.byStatus[r.status] = (stats.byStatus[r.status] || 0) + 1;
                if (r.override) stats.overridden++;
                if (r.dismissed) stats.dismissed++;
                if (r.outcomeId) stats.withOutcome++;
                if (r.feedbackId) stats.withFeedback++;
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
                recordCount: this._records.length
            };
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _getLevelLabel: function(level) {
            var labels = {
                0: 'No Adaptation',
                1: 'Presentation',
                2: 'Support',
                3: 'Pathway Suggestion',
                4: 'Authoritative'
            };
            return labels[level] || 'Unknown';
        },

        _loadRecords: function() {
            try {
                var saved = localStorage.getItem('adaptationRecords');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.records) {
                        this._records = data.records;
                        console.log('[AdaptationRecord] Loaded', this._records.length, 'records');
                    }
                }
            } catch (e) {
                // ignore
            }
        },

        _saveRecords: function() {
            try {
                localStorage.setItem('adaptationRecords', JSON.stringify({
                    records: this._records,
                    updatedAt: Date.now()
                }));
            } catch (e) {
                // ignore
            }
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

    window.LawAIApp.AdaptationRecord = AdaptationRecord;

    function autoInit() {
        if (!AdaptationRecord.initialized) {
            AdaptationRecord.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[AdaptationRecord] Module loaded (Part 56)');

})();
