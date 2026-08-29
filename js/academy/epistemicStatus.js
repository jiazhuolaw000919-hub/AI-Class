// js/academy/epistemicStatus.js
// Part 60 — Epistemic Status Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define epistemic status for AI-generated content
// RULES: AI output is an input, not automatically truth

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.EpistemicStatus) {
        console.log('[EpistemicStatus] Already exists, skipping...');
        return;
    }

    /**
     * EpistemicStatus
     *
     * 定义 AI 生成内容的认知状态
     * 
     * 状态:
     * - SOURCE_BACKED: 有权威来源支持
     * - AI_GENERATED: AI 生成
     * - INFERRED: 推断 (超出明确证据)
     * - UNCERTAIN: 不确定 (证据不足)
     * - CONFLICTING: 冲突 (来源不一致)
     * - UNKNOWN: 未知 (信息不足)
     * 
     * 规则:
     * - 不将 AI 置信度视为真理
     * - 不伪造验证状态
     * - UNKNOWN 保持 UNKNOWN
     */
    var EpistemicStatus = {

        // ============================================================
        // EPISTEMIC STATUS TYPES (Part 60)
        // ============================================================

        TYPES: {
            SOURCE_BACKED: 'SOURCE_BACKED',
            AI_GENERATED: 'AI_GENERATED',
            INFERRED: 'INFERRED',
            UNCERTAIN: 'UNCERTAIN',
            CONFLICTING: 'CONFLICTING',
            UNKNOWN: 'UNKNOWN'
        },

        // ============================================================
        // STATUS LABELS (用户友好)
        // ============================================================

        LABELS: {
            SOURCE_BACKED: 'Source-backed',
            AI_GENERATED: 'AI-generated',
            INFERRED: 'Inferred',
            UNCERTAIN: 'Uncertain',
            CONFLICTING: 'Conflicting sources',
            UNKNOWN: 'Unknown'
        },

        // ============================================================
        // STATUS COLORS (UI 友好)
        // ============================================================

        COLORS: {
            SOURCE_BACKED: '#22c55e',
            AI_GENERATED: '#8b5cf6',
            INFERRED: '#f59e0b',
            UNCERTAIN: '#f59e0b',
            CONFLICTING: '#ef4444',
            UNKNOWN: '#64748b'
        },

        // ============================================================
        // STATUS ICONS (UI 友好)
        // ============================================================

        ICONS: {
            SOURCE_BACKED: '✅',
            AI_GENERATED: '🤖',
            INFERRED: '🔍',
            UNCERTAIN: '❓',
            CONFLICTING: '⚠️',
            UNKNOWN: '❓'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 获取认知状态
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {Object} 认知状态
         */
        getStatus: function(content, context) {
            if (!content) {
                return this._createStatus(this.TYPES.UNKNOWN);
            }

            // 1. 检查是否是权威来源
            if (this._isSourceBacked(content, context)) {
                return this._createStatus(this.TYPES.SOURCE_BACKED, {
                    source: content.source || 'Course Material',
                    verified: true
                });
            }

            // 2. 检查是否有冲突
            if (this._hasConflict(content, context)) {
                return this._createStatus(this.TYPES.CONFLICTING, {
                    conflicts: content.conflicts || ['Sources disagree']
                });
            }

            // 3. 检查是否不确定
            if (this._isUncertain(content, context)) {
                return this._createStatus(this.TYPES.UNCERTAIN, {
                    reason: content.uncertaintyReason || 'Insufficient evidence'
                });
            }

            // 4. 检查是否是推断
            if (this._isInferred(content, context)) {
                return this._createStatus(this.TYPES.INFERRED, {
                    basis: content.inferenceBasis || 'Derived from available information'
                });
            }

            // 5. 检查是否是 AI 生成
            if (this._isAIGenerated(content, context)) {
                return this._createStatus(this.TYPES.AI_GENERATED, {
                    model: content.model || 'AI Assistant'
                });
            }

            // 6. 默认: 未知
            return this._createStatus(this.TYPES.UNKNOWN);
        },

        /**
         * 获取状态标签
         * @param {string} type — 状态类型
         * @returns {string} 标签
         */
        getLabel: function(type) {
            return this.LABELS[type] || 'Unknown';
        },

        /**
         * 获取状态颜色
         * @param {string} type — 状态类型
         * @returns {string} 颜色
         */
        getColor: function(type) {
            return this.COLORS[type] || '#64748b';
        },

        /**
         * 获取状态图标
         * @param {string} type — 状态类型
         * @returns {string} 图标
         */
        getIcon: function(type) {
            return this.ICONS[type] || '❓';
        },

        /**
         * 检查是否应验证
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        shouldVerify: function(content, context) {
            var status = this.getStatus(content, context);
            // AI 生成和推断的内容建议验证
            return status.type === this.TYPES.AI_GENERATED ||
                   status.type === this.TYPES.INFERRED ||
                   status.type === this.TYPES.UNCERTAIN;
        },

        /**
         * 获取验证建议
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {string} 验证建议
         */
        getVerificationSuggestion: function(content, context) {
            var status = this.getStatus(content, context);

            switch (status.type) {
                case this.TYPES.AI_GENERATED:
                    return 'Consider checking this against authoritative course material.';
                case this.TYPES.INFERRED:
                    return 'This is an inference. You may want to verify with primary sources.';
                case this.TYPES.UNCERTAIN:
                    return 'The evidence is incomplete. Consider seeking additional information.';
                case this.TYPES.CONFLICTING:
                    return 'Sources disagree. Consider which source is more authoritative for your context.';
                case this.TYPES.SOURCE_BACKED:
                    return 'This is backed by authoritative sources.';
                default:
                    return 'Verify this information against available sources.';
            }
        },

        /**
         * 获取状态描述 (用户友好)
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {string} 描述
         */
        getDescription: function(content, context) {
            var status = this.getStatus(content, context);

            var descriptions = {
                SOURCE_BACKED: 'This information is backed by authoritative course material.',
                AI_GENERATED: 'This is generated by AI. Consider verifying with authoritative sources.',
                INFERRED: 'This is inferred from available information. It may not be complete.',
                UNCERTAIN: 'The available evidence is insufficient for strong confidence.',
                CONFLICTING: 'Sources provide conflicting information on this topic.',
                UNKNOWN: 'The system does not have enough information to determine status.'
            };

            return descriptions[status.type] || 'Status unknown.';
        },

        // ============================================================
        // PRIVATE — Status Checks
        // ============================================================

        _createStatus: function(type, metadata) {
            return {
                type: type,
                label: this.LABELS[type] || 'Unknown',
                color: this.COLORS[type] || '#64748b',
                icon: this.ICONS[type] || '❓',
                metadata: metadata || {},
                timestamp: Date.now()
            };
        },

        _isSourceBacked: function(content, context) {
            // 检查是否有权威来源
            if (content.source === 'course' || content.source === 'lesson' || content.source === 'curriculum') {
                return true;
            }
            if (content.isVerified === true) {
                return true;
            }
            // 检查是否来自课程注册表
            if (context && context.courseRegistry) {
                var courseId = content.courseId || (context.course && context.course.id);
                if (courseId && context.courseRegistry.hasCourse && context.courseRegistry.hasCourse(courseId)) {
                    return true;
                }
            }
            return false;
        },

        _hasConflict: function(content, context) {
            if (content.conflicts && content.conflicts.length > 0) {
                return true;
            }
            if (content.hasConflict === true) {
                return true;
            }
            return false;
        },

        _isUncertain: function(content, context) {
            if (content.confidence && content.confidence < 0.5) {
                return true;
            }
            if (content.isUncertain === true) {
                return true;
            }
            if (content.evidence && content.evidence.length < 2) {
                return true;
            }
            return false;
        },

        _isInferred: function(content, context) {
            if (content.isInferred === true) {
                return true;
            }
            if (content.type === 'inference' || content.type === 'suggestion') {
                return true;
            }
            return false;
        },

        _isAIGenerated: function(content, context) {
            if (content.source === 'ai' || content.source === 'recommendation') {
                return true;
            }
            if (content.isAIGenerated === true) {
                return true;
            }
            // 检查是否来自推荐引擎
            if (content.recommendationId || content.recId) {
                return true;
            }
            return false;
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.EpistemicStatus = EpistemicStatus;

    console.log('[EpistemicStatus] Module loaded (Part 60)');

})();
