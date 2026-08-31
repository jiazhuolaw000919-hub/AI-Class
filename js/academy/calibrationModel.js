// js/academy/calibrationModel.js
// Part 62 — Calibration Model
// Law AI Academy Developer Bible
//
// PURPOSE: Represent self-assessment vs performance calibration
// RULES: Self-assessment is a hypothesis, performance provides evidence

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CalibrationModel) {
        console.log('[CalibrationModel] Already exists, skipping...');
        return;
    }

    /**
     * CalibrationModel
     *
     * 校准模型 — 自我评估与表现的比较
     * 
     * 置信度级别:
     * - LOW: 低置信度
     * - MEDIUM: 中等置信度
     * - HIGH: 高置信度
     * 
     * 校准状态:
     * - CALIBRATED: 置信度与表现匹配
     * - OVERCONFIDENT: 置信度高于表现
     * - UNDERCONFIDENT: 置信度低于表现
     * - UNKNOWN: 无足够证据
     */
    var CalibrationModel = {

        // ============================================================
        // CONFIDENCE LEVELS (Part 62)
        // ============================================================

        CONFIDENCE: {
            LOW: 'LOW',
            MEDIUM: 'MEDIUM',
            HIGH: 'HIGH'
        },

        CONFIDENCE_LABELS: {
            LOW: 'Low',
            MEDIUM: 'Medium',
            HIGH: 'High'
        },

        CONFIDENCE_VALUES: {
            LOW: 0.3,
            MEDIUM: 0.6,
            HIGH: 0.9
        },

        // ============================================================
        // CALIBRATION STATES (Part 62)
        // ============================================================

        STATES: {
            CALIBRATED: 'CALIBRATED',
            OVERCONFIDENT: 'OVERCONFIDENT',
            UNDERCONFIDENT: 'UNDERCONFIDENT',
            UNKNOWN: 'UNKNOWN'
        },

        STATE_LABELS: {
            CALIBRATED: 'Aligned',
            OVERCONFIDENT: 'Confidence higher than performance',
            UNDERCONFIDENT: 'Confidence lower than performance',
            UNKNOWN: 'Not enough evidence'
        },

        STATE_DESCRIPTIONS: {
            CALIBRATED: 'Your confidence matched your performance.',
            OVERCONFIDENT: 'You were confident, but the result was different.',
            UNDERCONFIDENT: 'You were uncertain, but you performed well.',
            UNKNOWN: 'Insufficient evidence to determine calibration.'
        },

        // ============================================================
        // PERFORMANCE OUTCOMES (Part 62)
        // ============================================================

        OUTCOMES: {
            CORRECT: 'CORRECT',
            INCORRECT: 'INCORRECT',
            PARTIAL: 'PARTIAL',
            INDEPENDENT: 'INDEPENDENT',
            ASSISTED: 'ASSISTED'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 获取校准状态
         * @param {string} confidence — 置信度 (LOW/MEDIUM/HIGH)
         * @param {string} outcome — 表现结果 (CORRECT/INCORRECT/PARTIAL)
         * @param {Object} context — 上下文
         * @returns {Object} 校准状态
         */
        getCalibration: function(confidence, outcome, context) {
            if (!confidence || !outcome) {
                return this._createState(this.STATES.UNKNOWN);
            }

            // 获取置信度数值
            var confidenceValue = this.CONFIDENCE_VALUES[confidence] || 0.5;
            var outcomeValue = this._getOutcomeValue(outcome);

            if (confidenceValue === null || outcomeValue === null) {
                return this._createState(this.STATES.UNKNOWN);
            }

            // 计算差距
            var gap = confidenceValue - outcomeValue;

            // 判断校准状态
            if (Math.abs(gap) < 0.25) {
                return this._createState(this.STATES.CALIBRATED, {
                    gap: gap,
                    confidence: confidence,
                    outcome: outcome,
                    description: 'Your confidence matched your performance.'
                });
            } else if (gap > 0.25) {
                return this._createState(this.STATES.OVERCONFIDENT, {
                    gap: gap,
                    confidence: confidence,
                    outcome: outcome,
                    description: 'You were confident, but the result was different.'
                });
            } else if (gap < -0.25) {
                return this._createState(this.STATES.UNDERCONFIDENT, {
                    gap: gap,
                    confidence: confidence,
                    outcome: outcome,
                    description: 'You were uncertain, but you performed well.'
                });
            }

            return this._createState(this.STATES.UNKNOWN);
        },

        /**
         * 获取校准状态标签
         * @param {string} state — 校准状态
         * @returns {string} 标签
         */
        getStateLabel: function(state) {
            return this.STATE_LABELS[state] || 'Unknown';
        },

        /**
         * 获取校准状态描述
         * @param {string} state — 校准状态
         * @returns {string} 描述
         */
        getStateDescription: function(state) {
            return this.STATE_DESCRIPTIONS[state] || 'State unknown.';
        },

        /**
         * 获取置信度标签
         * @param {string} confidence — 置信度级别
         * @returns {string} 标签
         */
        getConfidenceLabel: function(confidence) {
            return this.CONFIDENCE_LABELS[confidence] || confidence || 'Unknown';
        },

        /**
         * 创建校准观察
         * @param {Object} config
         * @param {string} config.learnerId — 学习者 ID
         * @param {string} config.conceptId — 概念 ID
         * @param {string} config.confidence — 置信度
         * @param {string} config.outcome — 表现结果
         * @param {string} config.taskId — 任务 ID
         * @param {number} config.taskDifficulty — 任务难度
         * @param {boolean} config.isNovel — 是否新颖
         * @param {string} config.assistanceLevel — 辅助级别
         * @param {boolean} config.isTransfer — 是否迁移
         * @param {Object} config.metadata — 元数据
         * @returns {Object} 校准观察
         */
        createObservation: function(config) {
            var calibration = this.getCalibration(
                config.confidence,
                config.outcome,
                { difficulty: config.taskDifficulty, novel: config.isNovel }
            );

            return {
                id: 'cal_obs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                learnerId: config.learnerId || 'default',
                conceptId: config.conceptId || 'unknown',
                taskId: config.taskId || 'unknown',
                confidence: config.confidence,
                confidenceLabel: this.getConfidenceLabel(config.confidence),
                outcome: config.outcome,
                outcomeLabel: this._getOutcomeLabel(config.outcome),
                calibrationState: calibration.type,
                calibrationLabel: this.getStateLabel(calibration.type),
                gap: calibration.metadata?.gap || 0,
                taskDifficulty: config.taskDifficulty || null,
                isNovel: config.isNovel || false,
                isTransfer: config.isTransfer || false,
                assistanceLevel: config.assistanceLevel || 'NONE',
                timestamp: Date.now(),
                metadata: config.metadata || {},
                status: 'OBSERVED',
                reflection: null,
                feedback: null
            };
        },

        /**
         * 检查是否过度自信
         * @param {Object} observation — 校准观察
         * @returns {boolean}
         */
        isOverconfident: function(observation) {
            return observation && observation.calibrationState === this.STATES.OVERCONFIDENT;
        },

        /**
         * 检查是否自信不足
         * @param {Object} observation — 校准观察
         * @returns {boolean}
         */
        isUnderconfident: function(observation) {
            return observation && observation.calibrationState === this.STATES.UNDERCONFIDENT;
        },

        /**
         * 检查是否校准良好
         * @param {Object} observation — 校准观察
         * @returns {boolean}
         */
        isCalibrated: function(observation) {
            return observation && observation.calibrationState === this.STATES.CALIBRATED;
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _createState: function(type, metadata) {
            return {
                type: type,
                label: this.STATE_LABELS[type] || 'Unknown',
                description: this.STATE_DESCRIPTIONS[type] || 'State unknown.',
                metadata: metadata || {},
                timestamp: Date.now()
            };
        },

        _getOutcomeValue: function(outcome) {
            var values = {
                'CORRECT': 0.9,
                'PARTIAL': 0.6,
                'INCORRECT': 0.2,
                'INDEPENDENT': 0.9,
                'ASSISTED': 0.5
            };
            return values[outcome] !== undefined ? values[outcome] : null;
        },

        _getOutcomeLabel: function(outcome) {
            var labels = {
                'CORRECT': 'Correct',
                'INCORRECT': 'Incorrect',
                'PARTIAL': 'Partial',
                'INDEPENDENT': 'Independent',
                'ASSISTED': 'Assisted'
            };
            return labels[outcome] || outcome || 'Unknown';
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CalibrationModel = CalibrationModel;

    console.log('[CalibrationModel] Module loaded (Part 62)');

})();
