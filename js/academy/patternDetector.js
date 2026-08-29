// js/academy/patternDetector.js
// Part 59 — Pattern Detector
// Law AI Academy Developer Bible
//
// PURPOSE: Detect learning patterns from observable behavior
// RULES: Evidence-based, no fabricated statistics, no personality labels

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PatternDetector) {
        console.log('[PatternDetector] Already exists, skipping...');
        return;
    }

    /**
     * PatternDetector
     *
     * 职责：从可观察行为检测学习模式
     * 
     * 检测方式:
     * 1. 从 ActionTracker 分析动作
     * 2. 从 OutcomeNormalizer 分析结果
     * 3. 从 LearningContext 分析上下文
     * 
     * 规则:
     * - 只基于实际数据
     * - 不伪造统计
     * - 不创建个性标签
     */
    var PatternDetector = {
        version: '1.0.0',
        initialized: false,

        _patterns: [],
        _maxPatterns: 50,
        _minEvidenceForPattern: 2,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[PatternDetector] Already initialized');
                return this;
            }

            console.log('[PatternDetector] 🚀 Initializing...');
            this._loadPatterns();
            this.initialized = true;
            console.log('[PatternDetector] ✅ Initialized');
            return this;
        },

        /**
         * 检测所有模式
         * @param {Object} context — 上下文
         * @returns {Array} 检测到的模式
         */
        detectAll: function(context) {
            var patterns = [];

            // 1. 从动作历史检测
            var actionPatterns = this._detectFromActions(context);
            patterns = patterns.concat(actionPatterns);

            // 2. 从结果检测
            var outcomePatterns = this._detectFromOutcomes(context);
            patterns = patterns.concat(outcomePatterns);

            // 3. 从上下文检测
            var contextPatterns = this._detectFromContext(context);
            patterns = patterns.concat(contextPatterns);

            // 4. 去重和合并
            patterns = this._deduplicatePatterns(patterns);

            // 5. 存储
            for (var i = 0; i < patterns.length; i++) {
                this._patterns.push(patterns[i]);
                if (this._patterns.length > this._maxPatterns) {
                    this._patterns.shift();
                }
            }

            this._savePatterns();

            return patterns;
        },

        /**
         * 获取当前模式
         * @param {Object} filters — 过滤条件
         * @param {string} filters.category — 类别
         * @param {string} filters.status — 状态
         * @param {number} filters.limit — 最大数量
         * @returns {Array} 模式列表
         */
        getPatterns: function(filters) {
            filters = filters || {};
            var patterns = this._patterns.slice().reverse();

            if (filters.category) {
                patterns = patterns.filter(function(p) {
                    return p.category === filters.category;
                });
            }

            if (filters.status) {
                patterns = patterns.filter(function(p) {
                    return p.status === filters.status;
                });
            }

            // 只返回有效的模式
            patterns = patterns.filter(function(p) {
                return p.status !== 'DISMISSED' && p.status !== 'EXPIRED';
            });

            if (filters.limit) {
                patterns = patterns.slice(0, filters.limit);
            }

            return patterns;
        },

        /**
         * 获取活跃模式 (ACTIVE 或 VIEWED)
         * @param {number} limit — 最大数量
         * @returns {Array} 活跃模式列表
         */
        getActivePatterns: function(limit) {
            limit = limit || 5;
            return this.getPatterns({ status: 'ACTIVE', limit: limit });
        },

        /**
         * 获取模式统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._patterns.length,
                byCategory: {},
                byStatus: {},
                byStrength: {},
                active: 0,
                dismissed: 0
            };

            for (var i = 0; i < this._patterns.length; i++) {
                var p = this._patterns[i];
                stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
                stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
                stats.byStrength[p.strength] = (stats.byStrength[p.strength] || 0) + 1;
                if (p.status === 'ACTIVE' || p.status === 'VIEWED') stats.active++;
                if (p.status === 'DISMISSED') stats.dismissed++;
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
                patternCount: this._patterns.length
            };
        },

        // ============================================================
        // PRIVATE — Detection Methods
        // ============================================================

        /**
         * 从动作检测模式
         * @private
         */
        _detectFromActions: function(context) {
            var patterns = [];
            var model = window.LawAIApp?.LearningPatternModel;
            if (!model) return patterns;

            var actionTracker = window.LawAIApp?.ActionTracker;
            if (!actionTracker) return patterns;

            try {
                var history = actionTracker.getHistory(50);
                if (!history || history.length < this._minEvidenceForPattern) {
                    return patterns;
                }

                // ── 检测: 复习模式 ──
                var reviewActions = history.filter(function(a) {
                    return a.type === 'REVIEW' || a.type === 'COMPLETE';
                });

                if (reviewActions.length >= this._minEvidenceForPattern) {
                    // 按目标分组
                    var targets = {};
                    for (var i = 0; i < reviewActions.length; i++) {
                        var target = reviewActions[i].target || 'unknown';
                        targets[target] = (targets[target] || 0) + 1;
                    }

                    var mostFrequent = null;
                    var maxCount = 0;
                    for (var target in targets) {
                        if (targets[target] > maxCount) {
                            maxCount = targets[target];
                            mostFrequent = target;
                        }
                    }

                    if (mostFrequent && maxCount >= this._minEvidenceForPattern) {
                        var strength = maxCount >= 4 ? 'STRONG' : (maxCount >= 3 ? 'MODERATE' : 'WEAK');
                        patterns.push(model.create({
                            category: model.CATEGORIES.REVIEW,
                            title: 'Repeated Review',
                            description: 'You have repeatedly revisited ' + mostFrequent,
                            evidence: ['You reviewed ' + mostFrequent + ' ' + maxCount + ' times'],
                            metadata: {
                                target: mostFrequent,
                                count: maxCount
                            },
                            confidence: Math.min(0.9, 0.3 + maxCount * 0.1),
                            strength: strength,
                            recency: 7,
                            source: 'PatternDetector:actions'
                        }));
                    }
                }

                // ── 检测: 实践模式 ──
                var practiceActions = history.filter(function(a) {
                    return a.type === 'PRACTICE' || a.type === 'COMPLETE';
                });

                if (practiceActions.length >= this._minEvidenceForPattern) {
                    patterns.push(model.create({
                        category: model.CATEGORIES.PRACTICE,
                        title: 'Practice After Learning',
                        description: 'You have been using practice activities',
                        evidence: ['You completed ' + practiceActions.length + ' practice activities'],
                        metadata: { count: practiceActions.length },
                        confidence: Math.min(0.8, 0.3 + practiceActions.length * 0.08),
                        strength: practiceActions.length >= 4 ? 'STRONG' : (practiceActions.length >= 3 ? 'MODERATE' : 'WEAK'),
                        recency: 7,
                        source: 'PatternDetector:actions'
                    }));
                }

            } catch (e) {
                console.warn('[PatternDetector] Action detection error:', e);
            }

            return patterns;
        },

        /**
         * 从结果检测模式
         * @private
         */
        _detectFromOutcomes: function(context) {
            var patterns = [];
            var model = window.LawAIApp?.LearningPatternModel;
            if (!model) return patterns;

            var outcomeNormalizer = window.LawAIApp?.OutcomeNormalizer;
            if (!outcomeNormalizer) return patterns;

            try {
                // 从学习状态获取结果
                var learningContext = window.LawAIApp?.LearningContext;
                if (learningContext) {
                    var ctx = learningContext.getContext();
                    if (ctx && ctx.lesson && ctx.lesson.isCompleted) {
                        // 检查是否有完成的课时
                        var completedLessons = ctx.lesson.isCompleted ? 1 : 0;

                        if (completedLessons >= this._minEvidenceForPattern) {
                            patterns.push(model.create({
                                category: model.CATEGORIES.ACTIVITY,
                                title: 'Lesson Completion',
                                description: 'You have been completing lessons',
                                evidence: ['Completed ' + completedLessons + ' lessons'],
                                metadata: { count: completedLessons },
                                confidence: 0.5,
                                strength: completedLessons >= 3 ? 'MODERATE' : 'WEAK',
                                recency: 7,
                                source: 'PatternDetector:outcomes'
                            }));
                        }
                    }
                }
            } catch (e) {
                console.warn('[PatternDetector] Outcome detection error:', e);
            }

            return patterns;
        },

        /**
         * 从上下文检测模式
         * @private
         */
        _detectFromContext: function(context) {
            var patterns = [];
            var model = window.LawAIApp?.LearningPatternModel;
            if (!model) return patterns;

            var learningContext = window.LawAIApp?.LearningContext;
            if (!learningContext) return patterns;

            try {
                var ctx = learningContext.getContext();
                if (!ctx) return patterns;

                // ── 检测: 会话模式 ──
                if (ctx.session && ctx.session.status === 'active') {
                    var duration = ctx.session.duration || 0;
                    if (duration > 0) {
                        var sessionLabel = duration < 15 ? 'short' : (duration < 45 ? 'medium' : 'long');
                        patterns.push(model.create({
                            category: model.CATEGORIES.SESSION,
                            title: sessionLabel.charAt(0).toUpperCase() + sessionLabel.slice(1) + ' Sessions',
                            description: 'Your recent sessions have been ' + sessionLabel + ' in duration',
                            evidence: ['Session duration: ~' + duration + ' minutes'],
                            metadata: { duration: duration, label: sessionLabel },
                            confidence: 0.4,
                            strength: 'WEAK',
                            recency: 1,
                            source: 'PatternDetector:context'
                        }));
                    }
                }

                // ── 检测: 探索模式 ──
                if (ctx.school && ctx.course) {
                    // 跨学校探索
                    var hasMultipleSchools = false;
                    // 简化检测
                    patterns.push(model.create({
                        category: model.CATEGORIES.EXPLORATION,
                        title: 'Active Exploration',
                        description: 'You are currently exploring ' + (ctx.course.title || 'learning'),
                        evidence: ['Current course: ' + (ctx.course.title || 'Unknown')],
                        metadata: { courseId: ctx.course.id },
                        confidence: 0.3,
                        strength: 'WEAK',
                        recency: 1,
                        source: 'PatternDetector:context'
                    }));
                }

            } catch (e) {
                console.warn('[PatternDetector] Context detection error:', e);
            }

            return patterns;
        },

        /**
         * 去重模式
         * @private
         */
        _deduplicatePatterns: function(patterns) {
            if (!patterns || patterns.length === 0) return [];

            var unique = {};
            var result = [];

            for (var i = 0; i < patterns.length; i++) {
                var p = patterns[i];
                var key = p.category + '_' + p.title;

                if (!unique[key]) {
                    unique[key] = true;
                    result.push(p);
                } else {
                    // 合并证据
                    for (var j = 0; j < result.length; j++) {
                        if (result[j].category === p.category && result[j].title === p.title) {
                            result[j].evidence = result[j].evidence.concat(p.evidence);
                            if (p.confidence > result[j].confidence) {
                                result[j].confidence = p.confidence;
                            }
                            break;
                        }
                    }
                }
            }

            return result;
        },

        /**
         * 加载模式
         * @private
         */
        _loadPatterns: function() {
            try {
                var saved = localStorage.getItem('learningPatterns');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.patterns) {
                        this._patterns = data.patterns;
                        console.log('[PatternDetector] Loaded', this._patterns.length, 'patterns');
                    }
                }
            } catch (e) {
                // ignore
            }
        },

        /**
         * 保存模式
         * @private
         */
        _savePatterns: function() {
            try {
                localStorage.setItem('learningPatterns', JSON.stringify({
                    patterns: this._patterns.slice(-this._maxPatterns),
                    updatedAt: Date.now()
                }));
            } catch (e) {
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

    window.LawAIApp.PatternDetector = PatternDetector;

    function autoInit() {
        if (!PatternDetector.initialized) {
            PatternDetector.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 500);
        });
    }

    console.log('[PatternDetector] Module loaded (Part 59)');

})();
