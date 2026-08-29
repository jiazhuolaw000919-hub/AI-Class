// js/academy/transferModel.js
// Part 61 — Transfer Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define learning transfer conceptual states
// RULES: Completion ≠ Understanding ≠ Transfer ≠ Independence

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.TransferModel) {
        console.log('[TransferModel] Already exists, skipping...');
        return;
    }

    /**
     * TransferModel
     *
     * 定义学习迁移的概念状态
     * 
     * 状态层级:
     * 1. EXPOSURE — 接触概念
     * 2. PRACTICE — 练习概念
     * 3. UNDERSTANDING — 理解概念 (可解释/推理)
     * 4. RETENTION — 保留概念 (随时间)
     * 5. NEAR_TRANSFER — 近迁移 (相似情境)
     * 6. FAR_TRANSFER — 远迁移 (不同情境)
     * 7. INDEPENDENT — 独立表现 (无需 AI 辅助)
     * 
     * 规则:
     * - 不自动升级状态
     * - 不基于单一信号推断迁移
     * - UNKNOWN 保持 UNKNOWN
     */
    var TransferModel = {

        // ============================================================
        // TRANSFER STATES (Part 61)
        // ============================================================

        STATES: {
            EXPOSURE: 'EXPOSURE',
            PRACTICE: 'PRACTICE',
            UNDERSTANDING: 'UNDERSTANDING',
            RETENTION: 'RETENTION',
            NEAR_TRANSFER: 'NEAR_TRANSFER',
            FAR_TRANSFER: 'FAR_TRANSFER',
            INDEPENDENT: 'INDEPENDENT',
            UNKNOWN: 'UNKNOWN'
        },

        // ============================================================
        // STATE LABELS (用户友好)
        // ============================================================

        LABELS: {
            EXPOSURE: 'Introduced',
            PRACTICE: 'Practiced',
            UNDERSTANDING: 'Understanding',
            RETENTION: 'Retained',
            NEAR_TRANSFER: 'Near Transfer',
            FAR_TRANSFER: 'Far Transfer',
            INDEPENDENT: 'Independent',
            UNKNOWN: 'Not enough evidence'
        },

        // ============================================================
        // STATE DESCRIPTIONS (用户友好)
        // ============================================================

        DESCRIPTIONS: {
            EXPOSURE: 'You have encountered this concept.',
            PRACTICE: 'You have practiced this concept.',
            UNDERSTANDING: 'Evidence suggests understanding of this concept.',
            RETENTION: 'You have retained this concept over time.',
            NEAR_TRANSFER: 'You have applied this concept in a similar context.',
            FAR_TRANSFER: 'You have applied this concept in a different context.',
            INDEPENDENT: 'You can apply this concept without assistance.',
            UNKNOWN: 'Not enough evidence to determine state.'
        },

        // ============================================================
        // TRANSFER TYPES (Part 61)
        // ============================================================

        TRANSFER_TYPES: {
            NEAR: 'NEAR',
            FAR: 'FAR',
            STRATEGY: 'STRATEGY',
            AI_LITERACY: 'AI_LITERACY',
            CROSS_COURSE: 'CROSS_COURSE',
            CROSS_SCHOOL: 'CROSS_SCHOOL'
        },

        TRANSFER_TYPE_LABELS: {
            NEAR: 'Near Transfer',
            FAR: 'Far Transfer',
            STRATEGY: 'Strategy Transfer',
            AI_LITERACY: 'AI Literacy Transfer',
            CROSS_COURSE: 'Cross-Course Transfer',
            CROSS_SCHOOL: 'Cross-School Transfer'
        },

        // ============================================================
        // ASSISTANCE LEVELS (Part 61)
        // ============================================================

        ASSISTANCE: {
            FULL: 'FULL',
            HINT: 'HINT',
            MINIMAL: 'MINIMAL',
            NONE: 'NONE'
        },

        ASSISTANCE_LABELS: {
            FULL: 'Full assistance',
            HINT: 'Hint only',
            MINIMAL: 'Minimal guidance',
            NONE: 'Independent'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 获取概念状态
         * @param {Object} concept — 概念对象
         * @param {Object} context — 上下文
         * @returns {Object} 状态信息
         */
        getState: function(concept, context) {
            if (!concept || !concept.id) {
                return this._createState(this.STATES.UNKNOWN);
            }

            // 检查是否有迁移证据
            if (concept.evidence && concept.evidence.length > 0) {
                // 检查独立表现
                if (concept.evidence.some(function(e) { return e.type === 'INDEPENDENT'; })) {
                    return this._createState(this.STATES.INDEPENDENT, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'INDEPENDENT'; })
                    });
                }

                // 检查远迁移
                if (concept.evidence.some(function(e) { return e.type === 'FAR_TRANSFER' || e.type === 'CROSS_SCHOOL'; })) {
                    return this._createState(this.STATES.FAR_TRANSFER, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'FAR_TRANSFER' || e.type === 'CROSS_SCHOOL'; })
                    });
                }

                // 检查近迁移
                if (concept.evidence.some(function(e) { return e.type === 'NEAR_TRANSFER' || e.type === 'CROSS_COURSE'; })) {
                    return this._createState(this.STATES.NEAR_TRANSFER, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'NEAR_TRANSFER' || e.type === 'CROSS_COURSE'; })
                    });
                }

                // 检查理解
                if (concept.evidence.some(function(e) { return e.type === 'UNDERSTANDING'; })) {
                    return this._createState(this.STATES.UNDERSTANDING, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'UNDERSTANDING'; })
                    });
                }

                // 检查实践
                if (concept.evidence.some(function(e) { return e.type === 'PRACTICE'; })) {
                    return this._createState(this.STATES.PRACTICE, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'PRACTICE'; })
                    });
                }

                // 检查接触
                if (concept.evidence.some(function(e) { return e.type === 'EXPOSURE'; })) {
                    return this._createState(this.STATES.EXPOSURE, {
                        evidence: concept.evidence.filter(function(e) { return e.type === 'EXPOSURE'; })
                    });
                }
            }

            // 检查保留 (使用 Retention Authority)
            var retention = window.LawAIApp?.Retention || window.LawAIApp?.MemoryEngine;
            if (retention && typeof retention.getState === 'function') {
                try {
                    var retentionState = retention.getState(concept.id);
                    if (retentionState && retentionState.level > 0.5) {
                        return this._createState(this.STATES.RETENTION, {
                            evidence: ['Retained over time'],
                            retentionLevel: retentionState.level
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }

            return this._createState(this.STATES.UNKNOWN);
        },

        /**
         * 获取状态标签
         * @param {string} state — 状态类型
         * @returns {string} 标签
         */
        getLabel: function(state) {
            return this.LABELS[state] || 'Unknown';
        },

        /**
         * 获取状态描述
         * @param {string} state — 状态类型
         * @returns {string} 描述
         */
        getDescription: function(state) {
            return this.DESCRIPTIONS[state] || 'State unknown.';
        },

        /**
         * 获取迁移类型标签
         * @param {string} type — 迁移类型
         * @returns {string} 标签
         */
        getTransferTypeLabel: function(type) {
            return this.TRANSFER_TYPE_LABELS[type] || type || 'Transfer';
        },

        /**
         * 获取辅助级别标签
         * @param {string} level — 辅助级别
         * @returns {string} 标签
         */
        getAssistanceLabel: function(level) {
            return this.ASSISTANCE_LABELS[level] || level || 'Unknown';
        },

        /**
         * 检查概念是否已达到迁移
         * @param {Object} concept — 概念对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        hasTransfer: function(concept, context) {
            var state = this.getState(concept, context);
            return state.type === this.STATES.NEAR_TRANSFER ||
                   state.type === this.STATES.FAR_TRANSFER ||
                   state.type === this.STATES.INDEPENDENT;
        },

        /**
         * 检查概念是否已独立
         * @param {Object} concept — 概念对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isIndependent: function(concept, context) {
            var state = this.getState(concept, context);
            return state.type === this.STATES.INDEPENDENT;
        },

        /**
         * 创建迁移观察对象
         * @param {Object} config
         * @param {string} config.conceptId — 概念 ID
         * @param {string} config.originalContext — 原始情境
         * @param {string} config.newContext — 新情境
         * @param {string} config.transferType — 迁移类型
         * @param {string} config.assistanceLevel — 辅助级别
         * @param {Array} config.evidence — 证据
         * @param {number} config.confidence — 置信度 (0-1)
         * @returns {Object} 迁移观察
         */
        createObservation: function(config) {
            return {
                id: 'tr_obs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                conceptId: config.conceptId || 'unknown',
                originalContext: config.originalContext || 'unknown',
                newContext: config.newContext || 'unknown',
                transferType: config.transferType || this.TRANSFER_TYPES.NEAR,
                assistanceLevel: config.assistanceLevel || this.ASSISTANCE.UNKNOWN,
                evidence: config.evidence || [],
                confidence: Math.max(0, Math.min(1, config.confidence || 0.3)),
                timestamp: Date.now(),
                metadata: config.metadata || {},
                status: 'OBSERVED'
            };
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _createState: function(type, metadata) {
            return {
                type: type,
                label: this.LABELS[type] || 'Unknown',
                description: this.DESCRIPTIONS[type] || 'State unknown.',
                metadata: metadata || {},
                timestamp: Date.now()
            };
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.TransferModel = TransferModel;

    console.log('[TransferModel] Module loaded (Part 61)');

})();
