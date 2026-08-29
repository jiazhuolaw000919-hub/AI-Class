// js/academy/learningPatternModel.js
// Part 59 — Learning Pattern Model
// Law AI Academy Developer Bible
//
// PURPOSE: Define Learning Pattern data structure
// RULES: Pattern = observable behavior, NOT personality label

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearningPatternModel) {
        console.log('[LearningPatternModel] Already exists, skipping...');
        return;
    }

    /**
     * LearningPatternModel
     *
     * 定义学习模式的数据结构
     * 
     * 模式 = 可观察的重复行为
     * 不是个性标签、不是心理标签、不是掌握标签
     */
    var LearningPatternModel = {

        // ============================================================
        // PATTERN CATEGORIES (Part 59)
        // ============================================================

        CATEGORIES: {
            ACTIVITY: 'ACTIVITY',
            TOPIC: 'TOPIC',
            SEQUENCE: 'SEQUENCE',
            REVIEW: 'REVIEW',
            PRACTICE: 'PRACTICE',
            EXPLORATION: 'EXPLORATION',
            SESSION: 'SESSION',
            GOAL_ALIGNMENT: 'GOAL_ALIGNMENT',
            FEEDBACK: 'FEEDBACK',
            SUPPORT_USAGE: 'SUPPORT_USAGE'
        },

        // ============================================================
        // PATTERN STATUS (Part 59 — Pattern Lifecycle)
        // ============================================================

        STATUS: {
            DETECTED: 'DETECTED',
            ACTIVE: 'ACTIVE',
            VIEWED: 'VIEWED',
            CONFIRMED: 'CONFIRMED',
            CORRECTED: 'CORRECTED',
            DISMISSED: 'DISMISSED',
            EXPIRED: 'EXPIRED'
        },

        // ============================================================
        // PATTERN STRENGTH (Part 59 — Pattern Strength)
        // ============================================================

        STRENGTH: {
            WEAK: 'WEAK',
            MODERATE: 'MODERATE',
            STRONG: 'STRONG'
        },

        // ============================================================
        // PATTERN FACTORY
        // ============================================================

        /**
         * 创建学习模式
         * @param {Object} config
         * @param {string} config.category — 模式类别
         * @param {string} config.title — 模式标题
         * @param {string} config.description — 模式描述
         * @param {Array} config.evidence — 证据列表
         * @param {Object} config.metadata — 元数据
         * @param {number} config.confidence — 置信度 (0-1)
         * @param {string} config.strength — 强度 (WEAK/MODERATE/STRONG)
         * @param {number} config.recency — 时效性 (天数)
         * @param {string} config.source — 来源
         * @returns {Object} 学习模式
         */
        create: function(config) {
            if (!config || !config.category || !config.title) {
                console.warn('[LearningPatternModel] Invalid config');
                return null;
            }

            var validCategories = Object.values(this.CATEGORIES);
            if (validCategories.indexOf(config.category) === -1) {
                console.warn('[LearningPatternModel] Unknown category:', config.category);
                return null;
            }

            var validStrengths = Object.values(this.STRENGTH);
            var strength = config.strength || this.STRENGTH.WEAK;
            if (validStrengths.indexOf(strength) === -1) {
                strength = this.STRENGTH.WEAK;
            }

            return {
                id: 'ptn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                category: config.category,
                title: config.title,
                description: config.description || '',
                evidence: config.evidence || [],
                metadata: config.metadata || {},
                confidence: Math.max(0, Math.min(1, config.confidence || 0.3)),
                strength: strength,
                recency: config.recency || 0,
                source: config.source || 'PatternDetector',
                status: this.STATUS.DETECTED,
                timestamp: Date.now(),
                expiresAt: this._calculateExpiry(config.recency || 0),
                learnerFeedback: null,
                savedToNotes: false,
                noteId: null,
                influenceCount: 0
            };
        },

        /**
         * 检查模式是否有效 (未过期)
         * @param {Object} pattern — 学习模式
         * @param {number} maxAge — 最大有效期 (天数)
         * @returns {boolean}
         */
        isValid: function(pattern, maxAge) {
            if (!pattern) return false;
            if (pattern.status === this.STATUS.DISMISSED) return false;
            if (pattern.status === this.STATUS.EXPIRED) return false;

            maxAge = maxAge || 30;
            var age = (Date.now() - pattern.timestamp) / (24 * 60 * 60 * 1000);
            if (age > maxAge) return false;

            return true;
        },

        /**
         * 检查模式是否应更新
         * @param {Object} pattern — 学习模式
         * @param {Array} newEvidence — 新证据
         * @returns {boolean}
         */
        shouldUpdate: function(pattern, newEvidence) {
            if (!pattern || !newEvidence || newEvidence.length === 0) return false;
            if (pattern.status === this.STATUS.DISMISSED) return false;

            // 如果有新证据，更新
            return true;
        },

        /**
         * 获取模式状态标签 (用户友好)
         * @param {Object} pattern — 学习模式
         * @returns {string} 状态标签
         */
        getStatusLabel: function(pattern) {
            if (!pattern) return 'Unknown';

            var labels = {
                'DETECTED': 'Detected',
                'ACTIVE': 'Active',
                'VIEWED': 'Viewed',
                'CONFIRMED': 'Confirmed',
                'CORRECTED': 'Corrected',
                'DISMISSED': 'Dismissed',
                'EXPIRED': 'Expired'
            };

            return labels[pattern.status] || pattern.status || 'Unknown';
        },

        /**
         * 获取模式强度标签 (用户友好)
         * @param {Object} pattern — 学习模式
         * @returns {string} 强度标签
         */
        getStrengthLabel: function(pattern) {
            if (!pattern) return 'Unknown';

            var labels = {
                'WEAK': 'Possible',
                'MODERATE': 'Likely',
                'STRONG': 'Consistent'
            };

            return labels[pattern.strength] || pattern.strength || 'Unknown';
        },

        /**
         * 获取模式类别标签 (用户友好)
         * @param {Object} pattern — 学习模式
         * @returns {string} 类别标签
         */
        getCategoryLabel: function(pattern) {
            if (!pattern) return 'Pattern';

            var labels = {
                'ACTIVITY': 'Activity',
                'TOPIC': 'Topic Interest',
                'SEQUENCE': 'Learning Sequence',
                'REVIEW': 'Review Behavior',
                'PRACTICE': 'Practice Behavior',
                'EXPLORATION': 'Exploration',
                'SESSION': 'Session Pattern',
                'GOAL_ALIGNMENT': 'Goal Alignment',
                'FEEDBACK': 'Feedback Pattern',
                'SUPPORT_USAGE': 'Support Usage'
            };

            return labels[pattern.category] || pattern.category || 'Pattern';
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _calculateExpiry: function(recencyDays) {
            // 默认 30 天后过期，或根据 recency 调整
            var expiryDays = Math.max(7, Math.min(90, recencyDays * 2 + 10));
            return Date.now() + expiryDays * 24 * 60 * 60 * 1000;
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LearningPatternModel = LearningPatternModel;

    console.log('[LearningPatternModel] Module loaded (Part 59)');

})();
