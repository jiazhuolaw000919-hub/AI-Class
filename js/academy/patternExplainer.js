// js/academy/patternExplainer.js
// Part 59 — Pattern Explainer
// Law AI Academy Developer Bible
//
// PURPOSE: Generate human-readable explanations for learning patterns
// RULES: Evidence-based, no fabricated statistics, no psychological labels

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PatternExplainer) {
        console.log('[PatternExplainer] Already exists, skipping...');
        return;
    }

    /**
     * PatternExplainer
     *
     * 职责：为学习模式生成可理解的解释
     * 
     * 解释格式:
     * - OBSERVATION: 观察到什么
     * - EVIDENCE: 基于什么证据
     * - MEANING: 可能意味着什么 (可选)
     * - ACTION: 可以做什么 (可选)
     * 
     * 规则:
     * - 只基于实际证据
     * - 不使用 "你是..." 语言
     * - 不使用心理学标签
     */
    var PatternExplainer = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[PatternExplainer] Already initialized');
                return this;
            }

            console.log('[PatternExplainer] 🚀 Initializing...');
            this.initialized = true;
            console.log('[PatternExplainer] ✅ Initialized');
            return this;
        },

        /**
         * 解释模式
         * @param {Object} pattern — 学习模式
         * @param {Object} context — 上下文
         * @returns {Object} 解释对象
         */
        explain: function(pattern, context) {
            if (!pattern) {
                return this._fallbackExplanation('No pattern data available');
            }

            var observation = this._generateObservation(pattern, context);
            var evidenceText = this._generateEvidenceText(pattern);
            var meaning = this._generateMeaning(pattern, context);
            var action = this._generateAction(pattern, context);

            return {
                observation: observation,
                evidence: evidenceText,
                meaning: meaning,
                action: action,
                confidence: pattern.confidence || 0.3,
                strength: pattern.strength || 'WEAK',
                category: pattern.category || 'unknown',
                fullText: this._buildFullText(observation, evidenceText, meaning, action),
                shortText: observation
            };
        },

        /**
         * 获取简短解释
         * @param {Object} pattern — 学习模式
         * @param {Object} context — 上下文
         * @returns {string} 简短解释
         */
        explainShort: function(pattern, context) {
            var result = this.explain(pattern, context);
            return result.shortText;
        },

        /**
         * 获取完整解释
         * @param {Object} pattern — 学习模式
         * @param {Object} context — 上下文
         * @returns {string} 完整解释
         */
        explainFull: function(pattern, context) {
            var result = this.explain(pattern, context);
            return result.fullText;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized
            };
        },

        // ============================================================
        // PRIVATE — Explanation Generation
        // ============================================================

        _generateObservation: function(pattern, context) {
            var category = pattern.category || 'unknown';
            var title = pattern.title || 'Learning Pattern';
            var description = pattern.description || '';

            // 不同类别的观察措辞
            var templates = {
                'REVIEW': 'You have been reviewing %s repeatedly.',
                'PRACTICE': 'You have been using practice activities recently.',
                'EXPLORATION': 'You have been exploring topics across different areas.',
                'SESSION': 'Your recent sessions have been %s.',
                'ACTIVITY': 'You have been actively completing lessons.',
                'TOPIC': 'You have recently focused on %s.',
                'SEQUENCE': 'You often %s before moving on.',
                'GOAL_ALIGNMENT': 'Your recent activity aligns with your current goal.',
                'FEEDBACK': 'You have been providing feedback on recommendations.',
                'SUPPORT_USAGE': 'You have been using support resources.'
            };

            var template = templates[category] || 'You have been %s.';
            var fill = description || title.toLowerCase();

            if (category === 'REVIEW' && pattern.metadata && pattern.metadata.target) {
                fill = pattern.metadata.target;
            }

            if (category === 'SESSION' && pattern.metadata && pattern.metadata.label) {
                fill = pattern.metadata.label + ' sessions';
            }

            if (category === 'TOPIC' && pattern.metadata && pattern.metadata.topic) {
                fill = pattern.metadata.topic;
            }

            var observation = template.replace('%s', fill);
            return observation;
        },

        _generateEvidenceText: function(pattern) {
            var evidence = pattern.evidence || [];

            if (evidence.length === 0) {
                return 'Based on your recent learning activity.';
            }

            if (evidence.length === 1) {
                return 'Based on: ' + evidence[0];
            }

            return 'Based on: ' + evidence.slice(0, 2).join('; ') +
                   (evidence.length > 2 ? ' and ' + (evidence.length - 2) + ' more' : '');
        },

        _generateMeaning: function(pattern, context) {
            // 如果置信度低，不提供意义解释
            if (pattern.confidence < 0.4) {
                return 'This is a tentative observation.';
            }

            var category = pattern.category || 'unknown';

            var meanings = {
                'REVIEW': 'This may reflect review, project relevance, or continued interest.',
                'PRACTICE': 'Practice can help reinforce concepts before moving forward.',
                'EXPLORATION': 'Exploring across topics can help build broader understanding.',
                'SESSION': 'Your session length may vary based on available time and focus.',
                'ACTIVITY': 'Completing lessons shows consistent engagement.',
                'GOAL_ALIGNMENT': 'Your current activities support your stated learning goal.',
                'FEEDBACK': 'Your feedback helps the system improve recommendations.'
            };

            return meanings[category] || 'This observation may help you understand your learning patterns.';
        },

        _generateAction: function(pattern, context) {
            var category = pattern.category || 'unknown';

            var actions = {
                'REVIEW': 'Would you like to review this topic again?',
                'PRACTICE': 'Would you like to add more practice?',
                'EXPLORATION': 'What topic would you like to explore next?',
                'SESSION': 'You can adjust your session length based on your schedule.',
                'ACTIVITY': 'Continue with your current lesson.',
                'GOAL_ALIGNMENT': 'Your learning is on track with your goal.',
                'FEEDBACK': 'Continue providing feedback to improve recommendations.'
            };

            return actions[category] || 'Continue your learning journey.';
        },

        _buildFullText: function(observation, evidence, meaning, action) {
            var parts = [];

            if (observation) parts.push(observation);
            if (evidence) parts.push(evidence);
            if (meaning) parts.push(meaning);
            if (action) parts.push(action);

            return parts.join(' ');
        },

        _fallbackExplanation: function(message) {
            return {
                observation: 'Learning pattern detected.',
                evidence: 'Based on your recent activity.',
                meaning: 'This observation may help you understand your learning.',
                action: 'Continue exploring.',
                fullText: message || 'Learning pattern detected.',
                shortText: 'Learning pattern detected.'
            };
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.PatternExplainer = PatternExplainer;

    function autoInit() {
        if (!PatternExplainer.initialized) {
            PatternExplainer.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[PatternExplainer] Module loaded (Part 59)');

})();
