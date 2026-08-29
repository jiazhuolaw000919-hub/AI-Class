// js/academy/sourceDistinguisher.js
// Part 60 — Source Distinguisher
// Law AI Academy Developer Bible
//
// PURPOSE: Distinguish AI output from authoritative content
// RULES: Source-backed ≠ AI-generated ≠ Inference

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.SourceDistinguisher) {
        console.log('[SourceDistinguisher] Already exists, skipping...');
        return;
    }

    /**
     * SourceDistinguisher
     *
     * 区分 AI 输出和权威内容
     * 
     * 来源类型:
     * - SOURCE_BACKED: 权威课程/课时内容
     * - AI_GENERATED: AI 生成
     * - INFERRED: 推断
     * - UNKNOWN: 未知
     */
    var SourceDistinguisher = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // SOURCE TYPES
        // ============================================================

        SOURCES: {
            COURSE: 'course',
            LESSON: 'lesson',
            CURRICULUM: 'curriculum',
            AI_RECOMMENDATION: 'ai_recommendation',
            AI_EXPLANATION: 'ai_explanation',
            INFERENCE: 'inference',
            UNKNOWN: 'unknown'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[SourceDistinguisher] Already initialized');
                return this;
            }

            console.log('[SourceDistinguisher] 🚀 Initializing...');
            this.initialized = true;
            console.log('[SourceDistinguisher] ✅ Initialized');
            return this;
        },

        /**
         * 区分来源
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {Object} 来源信息
         */
        distinguish: function(content, context) {
            if (!content) {
                return this._createSourceInfo(this.SOURCES.UNKNOWN);
            }

            // 1. 检查课程来源
            if (this._isCourseSource(content, context)) {
                return this._createSourceInfo(this.SOURCES.COURSE, {
                    courseId: content.courseId || context?.course?.id,
                    lessonId: content.lessonId || context?.lesson?.id,
                    title: content.title || 'Course Material'
                });
            }

            // 2. 检查课时来源
            if (this._isLessonSource(content, context)) {
                return this._createSourceInfo(this.SOURCES.LESSON, {
                    lessonId: content.lessonId || context?.lesson?.id,
                    title: content.title || 'Lesson Content'
                });
            }

            // 3. 检查 AI 推荐
            if (this._isAIRecommendation(content, context)) {
                return this._createSourceInfo(this.SOURCES.AI_RECOMMENDATION, {
                    recommendationId: content.recommendationId || content.id,
                    confidence: content.confidence
                });
            }

            // 4. 检查 AI 解释
            if (this._isAIExplanation(content, context)) {
                return this._createSourceInfo(this.SOURCES.AI_EXPLANATION, {
                    model: content.model || 'AI Assistant'
                });
            }

            // 5. 检查推断
            if (this._isInference(content, context)) {
                return this._createSourceInfo(this.SOURCES.INFERENCE, {
                    basis: content.inferenceBasis || 'Derived from available information'
                });
            }

            // 6. 默认: 未知
            return this._createSourceInfo(this.SOURCES.UNKNOWN);
        },

        /**
         * 获取来源标签 (用户友好)
         * @param {string} sourceType — 来源类型
         * @returns {string} 标签
         */
        getLabel: function(sourceType) {
            var labels = {
                'course': '📘 Course Material',
                'lesson': '📖 Lesson Content',
                'curriculum': '📚 Curriculum',
                'ai_recommendation': '🤖 AI Recommendation',
                'ai_explanation': '🤖 AI Explanation',
                'inference': '🔍 Inference',
                'unknown': '❓ Unknown Source'
            };
            return labels[sourceType] || 'Unknown';
        },

        /**
         * 获取来源颜色
         * @param {string} sourceType — 来源类型
         * @returns {string} 颜色
         */
        getColor: function(sourceType) {
            var colors = {
                'course': '#22c55e',
                'lesson': '#22c55e',
                'curriculum': '#22c55e',
                'ai_recommendation': '#8b5cf6',
                'ai_explanation': '#8b5cf6',
                'inference': '#f59e0b',
                'unknown': '#64748b'
            };
            return colors[sourceType] || '#64748b';
        },

        /**
         * 获取验证建议
         * @param {string} sourceType — 来源类型
         * @returns {string} 建议
         */
        getVerificationAdvice: function(sourceType) {
            var advices = {
                'course': 'This is authoritative course material.',
                'lesson': 'This is authoritative lesson content.',
                'curriculum': 'This is authoritative curriculum content.',
                'ai_recommendation': 'This is an AI recommendation. Consider your own context.',
                'ai_explanation': 'This is AI-generated. Verify with authoritative sources.',
                'inference': 'This is inferred. Check the underlying evidence.',
                'unknown': 'Source unknown. Verify before relying on this information.'
            };
            return advices[sourceType] || 'Verify this information.';
        },

        /**
         * 检查内容是否来自权威来源
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isAuthoritative: function(content, context) {
            var info = this.distinguish(content, context);
            return info.type === this.SOURCES.COURSE ||
                   info.type === this.SOURCES.LESSON ||
                   info.type === this.SOURCES.CURRICULUM;
        },

        /**
         * 检查内容是否来自 AI
         * @param {Object} content — 内容对象
         * @param {Object} context — 上下文
         * @returns {boolean}
         */
        isAI: function(content, context) {
            var info = this.distinguish(content, context);
            return info.type === this.SOURCES.AI_RECOMMENDATION ||
                   info.type === this.SOURCES.AI_EXPLANATION;
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
        // PRIVATE — Source Checks
        // ============================================================

        _createSourceInfo: function(type, metadata) {
            return {
                type: type,
                label: this.getLabel(type),
                color: this.getColor(type),
                metadata: metadata || {},
                isAuthoritative: type === 'course' || type === 'lesson' || type === 'curriculum',
                isAI: type === 'ai_recommendation' || type === 'ai_explanation',
                isInference: type === 'inference',
                isUnknown: type === 'unknown',
                verificationAdvice: this.getVerificationAdvice(type),
                timestamp: Date.now()
            };
        },

        _isCourseSource: function(content, context) {
            if (content.source === 'course') return true;
            if (content.courseId && context?.courseRegistry) {
                var registry = context.courseRegistry;
                if (registry.hasCourse && registry.hasCourse(content.courseId)) {
                    return true;
                }
            }
            return false;
        },

        _isLessonSource: function(content, context) {
            if (content.source === 'lesson') return true;
            if (content.lessonId) {
                var lessonEngine = window.LawAIApp?.LessonEngine;
                if (lessonEngine) {
                    var lesson = lessonEngine.getLessonByDay ? lessonEngine.getLessonByDay(parseInt(content.lessonId.split('-').pop())) : null;
                    if (lesson) return true;
                }
            }
            return false;
        },

        _isAIRecommendation: function(content, context) {
            if (content.type === 'recommendation' || content.type === 'RECOMMENDED') {
                return true;
            }
            if (content.recommendationId || content.recId) {
                return true;
            }
            if (content.source === 'recommendation') {
                return true;
            }
            return false;
        },

        _isAIExplanation: function(content, context) {
            if (content.source === 'ai') return true;
            if (content.isAIGenerated === true) return true;
            if (content.model && content.model !== 'unknown') return true;
            return false;
        },

        _isInference: function(content, context) {
            if (content.isInferred === true) return true;
            if (content.type === 'inference') return true;
            if (content.confidence && content.confidence < 0.4 && !content.isVerified) {
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

    window.LawAIApp.SourceDistinguisher = SourceDistinguisher;

    function autoInit() {
        if (!SourceDistinguisher.initialized) {
            SourceDistinguisher.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[SourceDistinguisher] Module loaded (Part 60)');

})();
