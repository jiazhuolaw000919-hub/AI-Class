// ================================================================
// ENGINE: RecommendationEngine
// LAYER: Core Logic Layer
// DOMAIN: Recommendation & Decision Support
// VERSION: 2.0.0 — Part 38 Recommendation Foundation
// ================================================================
//
// PURPOSE
// ================================================================
//   Generate explainable, deterministic recommendations for
//   learners based on their state, goals, and content.
//
// RECOMMENDATION STATES (Part 38)
// ================================================================
//   PENDING    → Available but not yet acted upon
//   ACCEPTED   → Learner chose this recommendation
//   COMPLETED  → Learner completed the recommended action
//   DISMISSED  → Learner explicitly rejected it
//   EXPIRED    → No longer relevant
//   SKIPPED    → Passed without explicit rejection
//
// CORE PRINCIPLE
// ================================================================
//   Recommendation is a suggestion, not a command.
//   Learner retains agency.
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.RecommendationEngine && window.LawAIApp.RecommendationEngine._upgraded) {
        console.log('[RecommendationEngine] Already upgraded, skipping...');
        return;
    }

    // ============================================================
    // RECOMMENDATION STATE CONSTANTS
    // ============================================================
    var STATES = {
        PENDING: 'PENDING',
        ACCEPTED: 'ACCEPTED',
        COMPLETED: 'COMPLETED',
        DISMISSED: 'DISMISSED',
        EXPIRED: 'EXPIRED',
        SKIPPED: 'SKIPPED'
    };

    var STATE_LABELS = {
        PENDING: 'Pending',
        ACCEPTED: 'Accepted',
        COMPLETED: 'Completed',
        DISMISSED: 'Dismissed',
        EXPIRED: 'Expired',
        SKIPPED: 'Skipped'
    };

    // ============================================================
    // RECOMMENDATION TARGET TYPES
    // ============================================================
    var TARGET_TYPES = {
        KNOWLEDGE: 'KNOWLEDGE',
        LESSON: 'LESSON',
        PRACTICE: 'PRACTICE',
        REVIEW: 'REVIEW',
        COURSE: 'COURSE',
        RESOURCE: 'RESOURCE'
    };

    // ============================================================
    // RECOMMENDATION POLICY (中央配置)
    // ============================================================
    var POLICY = {
        // 最大推荐数量
        maxRecommendations: 5,
        // 推荐过期时间（天）
        expirationDays: 7,
        // 各信号权重
        signalWeights: {
            PREREQUISITE_BLOCKED: 100,
            OVERDUE_CRITICAL: 90,
            LOW_MASTERY: 80,
            GOAL_ALIGNED: 70,
            CURRENT_COURSE: 60,
            NEXT_LESSON: 50,
            REVIEW_DUE: 40,
            ENRICHMENT: 20
        },
        // 信号阈值
        thresholds: {
            masteryLow: 0.4,
            reviewOverdue: 2, // 天
            confidenceRequired: 0.3
        }
    };

    // ============================================================
    // STORAGE
    // ============================================================
    var _storageKey = 'recommendations';
    var _schemaVersion = '2.0.0';
    var _recommendations = {};

    function _getStore() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('[RecommendationEngine] Schema version mismatch, migrating...');
                stored = _migrate(stored);
            }
            _recommendations = { ..._recommendations, ...stored };
            if (_recommendations._schemaVersion) {
                delete _recommendations._schemaVersion;
            }
            return _recommendations;
        } catch (e) {
            return _recommendations;
        }
    }

    function _saveStore(store) {
        _recommendations = store;
        try {
            var toSave = { ...store };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    function _migrate(stored) {
        console.log('[RecommendationEngine] 🔄 Migrating recommendation data...');
        var migrated = {};
        for (var key in stored) {
            if (key === '_schemaVersion') continue;
            var entry = stored[key];
            // 如果旧数据没有 targetId，使用 key
            if (!entry.targetId) {
                entry.targetId = key;
            }
            // 如果旧数据没有 targetType，推断
            if (!entry.targetType) {
                entry.targetType = TARGET_TYPES.KNOWLEDGE;
            }
            // 如果旧数据没有 status，推断
            if (!entry.status) {
                entry.status = STATES.PENDING;
            }
            // 如果旧数据没有 reason，生成默认
            if (!entry.reason) {
                entry.reason = 'Recommended based on your learning progress.';
            }
            migrated[key] = entry;
        }
        migrated._schemaVersion = _schemaVersion;
        LawAIApp.StorageEngine?.set?.(_storageKey, migrated);
        console.log('[RecommendationEngine] ✅ Migration complete, entries:', Object.keys(migrated).length - 1);
        return migrated;
    }

    // ============================================================
    // CORE: Get/Create Recommendation
    // ============================================================

    function getRecommendation(id) {
        if (!id) return null;
        var store = _getStore();
        var rec = store[id];
        if (!rec) return null;

        // 检查是否过期
        if (rec.status === STATES.PENDING && rec.expiresAt && Date.now() > rec.expiresAt) {
            rec.status = STATES.EXPIRED;
            rec.updatedAt = Date.now();
            store[id] = rec;
            _saveStore(store);
        }

        return rec;
    }

    function getRecommendations(filter) {
        filter = filter || {};
        var store = _getStore();
        var result = [];

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];

            // 状态过滤
            if (filter.status && rec.status !== filter.status) continue;
            // 类型过滤
            if (filter.targetType && rec.targetType !== filter.targetType) continue;
            // 目标 ID 过滤
            if (filter.targetId && rec.targetId !== filter.targetId) continue;

            result.push(rec);
        }

        // 按优先级排序
        if (filter.sortBy !== 'createdAt') {
            result.sort(function(a, b) {
                return (b.priorityScore || 0) - (a.priorityScore || 0);
            });
        } else {
            result.sort(function(a, b) {
                return (b.createdAt || 0) - (a.createdAt || 0);
            });
        }

        return result;
    }

    function getPendingRecommendations() {
        return getRecommendations({ status: STATES.PENDING });
    }

    function getActiveRecommendations() {
        return getRecommendations({
            status: STATES.PENDING,
            sortBy: 'priority'
        });
    }

    // ============================================================
    // CORE: Generate Recommendations
    // ============================================================

    function generateRecommendations(context) {
        context = context || {};
        console.log('[RecommendationEngine] 🎯 Generating recommendations...');

        var candidates = [];
        var seenIds = new Set();

        // ============================================================
        // 1. 从 Review 系统获取候选
        // ============================================================
        var review = window.LawAIApp.MemoryReview;
        if (review && typeof review.getTodayReviews === 'function') {
            var dueReviews = review.getTodayReviews();
            for (var i = 0; i < dueReviews.length; i++) {
                var item = dueReviews[i];
                if (!seenIds.has(item.knowledgeId)) {
                    seenIds.add(item.knowledgeId);
                    candidates.push({
                        targetId: item.knowledgeId,
                        targetType: TARGET_TYPES.REVIEW,
                        priority: 60 + (item.priority || 0) * 0.4,
                        signals: ['REVIEW_DUE'],
                        source: 'review'
                    });
                }
            }
        }

        // ============================================================
        // 2. 从 Mastery 系统获取候选 (低掌握度)
        // ============================================================
        var mastery = window.LawAIApp.MasteryEngine;
        if (mastery && typeof mastery.getAllMastery === 'function') {
            var allMastery = mastery.getAllMastery();
            for (var j = 0; j < allMastery.length; j++) {
                var record = allMastery[j];
                if (!record || !record.knowledgeId) continue;
                if (seenIds.has(record.knowledgeId)) continue;

                var level = record.masteryLevel || 0;
                if (level < POLICY.thresholds.masteryLow) {
                    seenIds.add(record.knowledgeId);
                    var priority = 50 + (1 - level) * 50;
                    candidates.push({
                        targetId: record.knowledgeId,
                        targetType: TARGET_TYPES.KNOWLEDGE,
                        priority: priority,
                        signals: ['LOW_MASTERY'],
                        source: 'mastery',
                        masteryLevel: level
                    });
                }
            }
        }

        // ============================================================
        // 3. 从当前课程获取候选
        // ============================================================
        var currentCourseId = context.currentCourseId || _getCurrentCourseId();
        if (currentCourseId) {
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && typeof courseRegistry.getCourse === 'function') {
                var course = courseRegistry.getCourse(currentCourseId);
                if (course) {
                    // 获取下一个未完成的 Lesson
                    var nextLesson = _findNextLesson(currentCourseId);
                    if (nextLesson && !seenIds.has(nextLesson)) {
                        seenIds.add(nextLesson);
                        candidates.push({
                            targetId: nextLesson,
                            targetType: TARGET_TYPES.LESSON,
                            priority: 70,
                            signals: ['CURRENT_COURSE'],
                            source: 'course'
                        });
                    }
                }
            }
        }

        // ============================================================
        // 4. 从目标获取候选 (Goal-aligned)
        // ============================================================
        var goals = _getActiveGoals();
        if (goals && goals.length > 0) {
            var goalTopics = _extractGoalTopics(goals);
            for (var k = 0; k < goalTopics.length; k++) {
                var topic = goalTopics[k];
                if (!seenIds.has(topic)) {
                    seenIds.add(topic);
                    candidates.push({
                        targetId: topic,
                        targetType: TARGET_TYPES.KNOWLEDGE,
                        priority: 65,
                        signals: ['GOAL_ALIGNED'],
                        source: 'goal'
                    });
                }
            }
        }

        // ============================================================
        // 5. Fallback: 当前 School 的第一个 Course
        // ============================================================
        if (candidates.length === 0) {
            var fallback = _getFallbackRecommendation();
            if (fallback && !seenIds.has(fallback.targetId)) {
                candidates.push({
                    targetId: fallback.targetId,
                    targetType: fallback.targetType || TARGET_TYPES.COURSE,
                    priority: 30,
                    signals: ['FALLBACK'],
                    source: 'fallback'
                });
            }
        }

        // ============================================================
        // 6. 排序和裁剪
        // ============================================================
        candidates.sort(function(a, b) {
            return (b.priority || 0) - (a.priority || 0);
        });

        var topCandidates = candidates.slice(0, POLICY.maxRecommendations);

        // ============================================================
        // 7. 转换为 Recommendation 记录
        // ============================================================
        var created = [];
        for (var l = 0; l < topCandidates.length; l++) {
            var cand = topCandidates[l];
            var rec = _createRecommendation(cand, context);
            if (rec) {
                created.push(rec);
            }
        }

        // 触发事件
        _emit('RECOMMENDATIONS_GENERATED', {
            count: created.length,
            recommendations: created
        });

        console.log('[RecommendationEngine] ✅ Generated ' + created.length + ' recommendations');
        return created;
    }

    function _createRecommendation(candidate, context) {
        var store = _getStore();
        var id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // 检查是否已存在相同的推荐
        var existing = _findExisting(candidate.targetId, candidate.targetType);
        if (existing) {
            // 如果已存在且仍然有效，不重复创建
            if (existing.status === STATES.PENDING || existing.status === STATES.ACCEPTED) {
                return null;
            }
            // 如果已过期或已完成，创建新的
        }

        var reason = _generateReason(candidate, context);
        var expiresAt = Date.now() + (POLICY.expirationDays * 24 * 60 * 60 * 1000);

        var rec = {
            id: id,
            targetId: candidate.targetId,
            targetType: candidate.targetType || TARGET_TYPES.KNOWLEDGE,
            reason: reason,
            priorityScore: Math.min(100, Math.max(0, candidate.priority || 50)),
            confidence: 0.7,
            sourceSignals: candidate.signals || ['UNKNOWN'],
            source: candidate.source || 'unknown',
            metadata: {
                masteryLevel: candidate.masteryLevel || null,
                context: context
            },
            status: STATES.PENDING,
            expiresAt: expiresAt,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            _schemaVersion: _schemaVersion
        };

        store[id] = rec;
        _saveStore(store);

        _emit('RECOMMENDATION_CREATED', {
            id: id,
            targetId: rec.targetId,
            priority: rec.priorityScore
        });

        return rec;
    }

    function _findExisting(targetId, targetType) {
        var store = _getStore();
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];
            if (rec.targetId === targetId && rec.targetType === targetType) {
                return rec;
            }
        }
        return null;
    }

    // ============================================================
    // 🔥 Part 48: Adaptive Recommendation Engine
    // 添加到 LawAIApp.RecommendationEngine 中
    // ============================================================

    /**
     * 使用自适应上下文生成推荐
     * @param {Object} context - 自适应上下文 (来自 LearnerModel.buildAdaptiveContext)
     * @param {Object} options - 配置选项
     * @returns {Object} 推荐结果
     */
    getAdaptiveRecommendations: function(context, options) {
        options = options || {};
        context = context || this._getAdaptiveContext();
    
        var result = {
            recommendations: [],
            alternatives: [],
            contextVersion: context.contextVersion || Date.now(),
            pathVersion: context.pathVersion || null,
            generatedAt: Date.now(),
            summary: {
                total: 0,
                primary: null,
                alternatives: 0
            }
        };
    
        // 1. 发现候选
        var candidates = this._discoverCandidates(context, options);
    
        // 2. 过滤候选
        var filtered = this._filterCandidates(candidates, context, options);
    
        // 3. 排名候选
        var ranked = this._rankCandidates(filtered, context, options);
    
        // 4. 构建推荐
        if (ranked.length > 0) {
            var primary = this._buildRecommendation(ranked[0], context, options);
            result.recommendations.push(primary);
            result.summary.primary = primary;
        
            // 5. 构建替代方案 (最多 3 个)
            for (var i = 1; i < Math.min(ranked.length, 4); i++) {
                var alt = this._buildRecommendation(ranked[i], context, { ...options, isAlternative: true });
                result.alternatives.push(alt);
            }
            result.summary.alternatives = result.alternatives.length;
        }
    
        result.summary.total = result.recommendations.length + result.alternatives.length;
    
        return result;
    },

    /**
     * 发现候选 (私有)
     */
    _discoverCandidates: function(context, options) {
        var candidates = [];
        var seen = {};
    
        // 1. 从当前路径发现
        var ape = window.LawAIApp.AdaptivePathEngine;
        if (ape) {
            // 获取当前路径
            var path = this._getActivePath();
            if (path && path.nodes) {
                for (var i = 0; i < path.nodes.length; i++) {
                    var node = path.nodes[i];
                    if (!node || node.state === 'COMPLETED' || node.state === 'MASTERED') continue;
                    if (seen[node.knowledgeId]) continue;
                    seen[node.knowledgeId] = true;
                    candidates.push({
                        targetId: node.knowledgeId,
                        targetType: 'KNOWLEDGE',
                        source: 'CURRENT_PATH',
                        priority: 80 - i * 5,
                        signals: ['PATH_CONTINUITY'],
                        position: i
                    });
                }
            }
        }
    
        // 2. 从复习发现
        var review = window.LawAIApp.MemoryReview;
        if (review) {
            var dueReviews = review.getTodayReviews ? review.getTodayReviews() : [];
            for (var i = 0; i < dueReviews.length; i++) {
                var item = dueReviews[i];
                if (!item || !item.knowledgeId) continue;
                if (seen[item.knowledgeId]) continue;
                seen[item.knowledgeId] = true;
                candidates.push({
                    targetId: item.knowledgeId,
                    targetType: 'REVIEW',
                    source: 'REVIEW',
                    priority: 70 - i * 3,
                    signals: ['REVIEW_DUE'],
                    reviewData: item
                });
            }
        }
    
        // 3. 从掌握度缺口发现
        var mastery = window.LawAIApp.MasteryEngine;
        if (mastery) {
            var allMastery = mastery.getAllMastery ? mastery.getAllMastery() : [];
            for (var i = 0; i < allMastery.length; i++) {
                var record = allMastery[i];
                if (!record || !record.knowledgeId) continue;
                if (seen[record.knowledgeId]) continue;
                if (record.masteryLevel >= 0.6) continue; // 只推荐低掌握度
                seen[record.knowledgeId] = true;
                candidates.push({
                    targetId: record.knowledgeId,
                    targetType: 'KNOWLEDGE',
                    source: 'MASTERY_GAP',
                    priority: 60 - record.masteryLevel * 50,
                    signals: ['KNOWLEDGE_GAP'],
                    masteryLevel: record.masteryLevel
                });
            }
        }
    
        // 4. 从目标发现
        var goal = context.goal || this._getCurrentGoal();
        if (goal && goal.targetId) {
            if (!seen[goal.targetId]) {
                seen[goal.targetId] = true;
                candidates.push({
                    targetId: goal.targetId,
                    targetType: 'GOAL',
                    source: 'GOAL_ALIGNMENT',
                    priority: 90,
                    signals: ['GOAL_ALIGNED']
                });
            }
        }
    
        return candidates;
    },

    /**
     * 过滤候选 (私有)
     */
    _filterCandidates: function(candidates, context, options) {
        var filtered = [];
    
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            
            // 1. 检查目标是否存在
            var kg = window.LawAIApp.KnowledgeGraph;
            if (kg) {
                var node = kg.getNode(candidate.targetId);
                if (!node) continue;
                if (node.status === 'deprecated') continue;
            }
        
            // 2. 检查是否已掌握 (排除)
            var lm = window.LawAIApp.LearnerModel;
            if (lm && candidate.source !== 'GOAL_ALIGNMENT') {
                var state = lm.getKnowledgeState ? lm.getKnowledgeState(candidate.targetId) : null;
                if (state && state.mastery && state.mastery.level >= 0.85) {
                    continue; // 已掌握，不推荐
                }
            }
        
            // 3. 检查是否已在当前路径中
            // 如果已经在路径中且不是复习，可能重复
            if (candidate.source === 'REVIEW' || candidate.source === 'MASTERY_GAP') {
                // 保留
            }
        
            filtered.push(candidate);
        }
    
        return filtered;
    },

    /**
     * 排名候选 (私有)
     */
    _rankCandidates: function(candidates, context, options) {
        // 按优先级排序
        var ranked = candidates.slice();
        ranked.sort(function(a, b) {
            // 主优先级
            var diff = (b.priority || 0) - (a.priority || 0);
            if (diff !== 0) return diff;
            // 稳定 ID
            return (a.targetId || '').localeCompare(b.targetId || '');
        });
        return ranked;
    },

    /**
     * 构建推荐 (私有)
     */
    _buildRecommendation: function(candidate, context, options) {
        var isAlternative = options.isAlternative || false;
        var action = this._determineAction(candidate);
    
        var recommendation = {
            recommendationId: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            targetId: candidate.targetId,
            targetType: candidate.targetType || 'KNOWLEDGE',
            action: action,
            reasonCodes: candidate.signals || ['UNKNOWN'],
            supportingSignals: candidate,
            priority: candidate.priority >= 70 ? 'HIGH' : 
                      candidate.priority >= 50 ? 'MEDIUM' : 'LOW',
            confidence: 0.7,
            isAlternative: isAlternative,
            explanation: this._generateExplanation(candidate, context),
            contextVersion: context.contextVersion || Date.now(),
            pathVersion: context.pathVersion || null,
            generatedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 小时
        };
    
        if (candidate.reviewData) {
            recommendation.reviewData = candidate.reviewData;
        }    
        if (candidate.masteryLevel !== undefined) {
            recommendation.masteryLevel = candidate.masteryLevel;
        }
    
        return recommendation;
    },

    /**
     * 确定动作 (私有)
     */
    _determineAction: function(candidate) {
        switch (candidate.source) {
            case 'CURRENT_PATH':
                return 'CONTINUE';
            case 'REVIEW':
                return 'REVIEW';
            case 'MASTERY_GAP':
                return 'PRACTICE';
            case 'GOAL_ALIGNMENT':
                return 'ADVANCE';
            default:
                return 'CONTINUE';
        }
    },

    /**
     * 生成解释 (私有)
     */
    _generateExplanation: function(candidate, context) {
        switch (candidate.source) {
            case 'CURRENT_PATH':
                return 'Continue your current learning path.';
            case 'REVIEW':
                return 'Review this concept to reinforce your understanding.';
            case 'MASTERY_GAP':
                var level = candidate.masteryLevel || 0;
                if (level < 0.3) {
                    return 'This concept needs foundational practice.';
                }
                return 'Practice this concept to strengthen your understanding.';
            case 'GOAL_ALIGNMENT':
                return 'This is aligned with your current learning goal.';
            default:
                return 'Recommended based on your learning progress.';
        }
    },

    /**
     * 获取自适应上下文 (私有)
     */
    _getAdaptiveContext: function() {
        try {
            var lm = window.LawAIApp.LearnerModel;
            if (lm && typeof lm.buildAdaptiveContext === 'function') {
                return lm.buildAdaptiveContext();
            }
        } catch (e) {}
        return { contextVersion: Date.now(), quality: 'UNKNOWN' };
    },

    /**
     * 获取当前路径 (私有)
     */
    _getActivePath: function() {
        try {
            var ape = window.LawAIApp.AdaptivePathEngine;
            if (ape && ape.getActivePath) {
                return ape.getActivePath();
            }
            // 尝试从 Loop 获取
            var loop = window.LawAIApp.AdaptiveLoop;
            if (loop && loop.getLoopStatus) {
                var status = loop.getLoopStatus();
                if (status && status.lastDecision) {
                    // 返回一个虚拟路径
                    return {
                        targetId: status.lastDecision.targetId,
                        nodes: [{ knowledgeId: status.lastDecision.targetId, state: 'ELIGIBLE' }]
                    };
                }
            }
        } catch (e) {}
        return null;
    },

    /**
     * 获取当前目标 (私有)
     */
    _getCurrentGoal: function() {
        try {
            var goals = window.LawAIApp.GoalEngine;
            if (goals && goals.getActiveGoals) {
                var active = goals.getActiveGoals();
                if (active && active.length > 0) {
                    return active[0];
                }
            }
        } catch (e) {}
        return null;
    },

    /**
     * 接受推荐
     */
    acceptAdaptiveRecommendation: function(recommendationId) {
        console.log('[RecommendationEngine] Accepted:', recommendationId);
        // 触发事件
        this._emit('RECOMMENDATION_ACCEPTED', {
            recommendationId: recommendationId,
            timestamp: Date.now()
        });
        return true;
    },

    /**
     * 忽略推荐
     */
    dismissAdaptiveRecommendation: function(recommendationId, reason) {
        console.log('[RecommendationEngine] Dismissed:', recommendationId, reason || '');
        this._emit('RECOMMENDATION_DISMISSED', {
            recommendationId: recommendationId,
            reason: reason || 'LEARNER_CHOICE',
            timestamp: Date.now()
        });
        return true;
    },

    /**
     * 跳过推荐
     */
    skipAdaptiveRecommendation: function(recommendationId) {
        console.log('[RecommendationEngine] Skipped:', recommendationId);
        this._emit('RECOMMENDATION_SKIPPED', {
            recommendationId: recommendationId,
            timestamp: Date.now()
        });
        return true;
    },

    /**
     * 选择替代方案
     */
    selectAdaptiveAlternative: function(recommendationId, alternativeId) {
        console.log('[RecommendationEngine] Alternative selected:', recommendationId, '->', alternativeId);
        this._emit('RECOMMENDATION_ALTERNATIVE_SELECTED', {
            recommendationId: recommendationId,
            alternativeId: alternativeId,
            timestamp: Date.now()
        });
        return true;
    },

    /**
     * 检查推荐是否过期
     */
    isRecommendationStale: function(recommendation, currentContext) {
        if (!recommendation) return true;
        if (!currentContext) return true;
    
        if (recommendation.contextVersion !== currentContext.contextVersion) {
            return true;
        }
    
        if (recommendation.expiresAt && Date.now() > recommendation.expiresAt) {
            return true;
        }
    
        return false;
    }

    // ============================================================
    // 🔥 Part 49: Recommendation Explainability & Decision Transparency
    // ============================================================

    /**
     * 生成推荐解释
     * @param {string|Object} recommendation - 推荐 ID 或推荐对象
     * @param {string} level - 'summary' | 'detail' | 'audit'
     * @param {Object} context - 自适应上下文
     * @returns {Object} 解释对象
     */
    function explainRecommendation(recommendation, level, context) {
        level = level || 'summary';
        context = context || _getAdaptiveContext();

        // 如果传入的是 ID，获取推荐
        if (typeof recommendation === 'string') {
            recommendation = getRecommendation(recommendation);
            if (!recommendation) {
                return {
                    error: 'Recommendation not found',
                    recommendationId: recommendation
                };
            }
        }

        if (!recommendation) {
            return { error: 'Invalid recommendation' };
        }

        var explanation = {
            recommendationId: recommendation.id || recommendation.recommendationId,
            level: level,
            summary: '',
            reasons: [],
            supportingSignals: [],
            evidence: [],
            alternatives: [],
            tradeoffs: [],
            uncertainty: 'UNKNOWN',
            constraints: [],
            learnerControls: ['ACCEPT', 'SKIP', 'DISMISS', 'EXPLORE', 'CHOOSE_ALTERNATIVE'],
            sourceVersions: {
                contextVersion: context.contextVersion || null,
                pathVersion: context.pathVersion || null,
                policyVersion: '1.0.0'
            },
            generatedAt: Date.now(),
            stale: false
        };

        // 1. 构建 Reasons
        var reasonCodes = recommendation.reasonCodes || recommendation.reasons || [];
        for (var i = 0; i < reasonCodes.length; i++) {
            var code = reasonCodes[i];
            var reason = _mapReason(code, recommendation, context);
            if (reason) {
                explanation.reasons.push(reason);
            }
        }

        // 如果 reasonCodes 为空，添加默认
        if (explanation.reasons.length === 0) {
            explanation.reasons.push({
                code: 'UNKNOWN',
                primary: true,
                description: 'Recommended based on available learning signals.'
            });
        }

        // 标记 Primary Reason (第一个)
        if (explanation.reasons.length > 0) {
            explanation.reasons[0].primary = true;
        }    

        // 2. 构建 Supporting Signals
        var signals = recommendation.supportingSignals || {};
        for (var key in signals) {
            if (signals.hasOwnProperty(key)) {
                explanation.supportingSignals.push({
                    signalId: key,
                    type: typeof signals[key],
                    source: 'recommendation_engine',
                    value: signals[key],
                    timestamp: Date.now(),
                    relevance: 'supporting'
                });
            }
        }

        // 3. 构建 Evidence (从 signals 提取)
        if (signals.masteryLevel !== undefined) {
            explanation.evidence.push({
                evidenceId: 'ev_mastery_' + Date.now(),
                source: 'MasteryEngine',
                type: 'MASTERY_LEVEL',
                timestamp: Date.now(),
                targetId: recommendation.targetId,
                summary: 'Mastery level: ' + Math.round(signals.masteryLevel * 100) + '%'
            });
        }
        if (signals.reviewData) {
            explanation.evidence.push({
                evidenceId: 'ev_review_' + Date.now(),
                source: 'MemoryReview',
                type: 'REVIEW_DUE',
                timestamp: Date.now(),
                targetId: recommendation.targetId,
                summary: 'Review due'
            });
        }

        // 4. 构建 Alternatives
        if (recommendation.alternatives && recommendation.alternatives.length > 0) {
            explanation.alternatives = recommendation.alternatives.map(function(alt) {
                return {
                    targetId: alt.targetId || alt,
                    targetType: alt.targetType || 'UNKNOWN',
                    action: alt.action || 'CONTINUE',
                    reason: alt.reason || 'Alternative option'
                };
            });
        }

        // 5. 构建 Tradeoffs
        var tradeoff = _deriveTradeoff(recommendation, context);
        if (tradeoff) {
            explanation.tradeoffs.push(tradeoff);
        }

        // 6. 构建 Uncertainty
        if (recommendation.confidence !== undefined) {
            explanation.uncertainty = recommendation.confidence >= 0.8 ? 'LOW' :
                                       recommendation.confidence >= 0.5 ? 'MEDIUM' : 'HIGH';
        } else {
            explanation.uncertainty = 'UNKNOWN';
        }

        // 7. 构建 Summary (根据 level)
        explanation.summary = _buildExplanationSummary(explanation, level);

        // 8. 构建 Constraints
        var constraint = _deriveConstraint(recommendation, context);
        if (constraint) {
            explanation.constraints.push(constraint);
        }

        // 9. 检查是否过期
        explanation.stale = isRecommendationStale ? isRecommendationStale(recommendation, context) : false;

        return explanation;
    }

    /**
     * 映射 Reason Code 到人类可读描述
     */
    function _mapReason(code, recommendation, context) {
        var descriptions = {
            'GOAL_ALIGNED': 'Aligned with your current learning goal',
            'GOAL_ALIGNMENT': 'Aligned with your current learning goal',
            'PATH_CONTINUITY': 'Continues your current learning path',
            'PATH_CONTINUITY': 'Continues your current learning path',
            'MASTERY_GAP': 'Addresses a knowledge gap',
            'KNOWLEDGE_GAP': 'Addresses a knowledge gap',
            'LOW_MASTERY': 'This area needs more practice',
            'REVIEW_DUE': 'Due for review',
            'CURRENT_COURSE': 'Part of your current course',
            'PREREQUISITE_BLOCKED': 'Required before continuing',
            'PREREQUISITE_SIGNAL': 'Builds on prerequisite knowledge',
            'ASSESSMENT_UNCERTAINTY': 'Assessment showed uncertainty',
            'RECENT_DIFFICULTY': 'Recent practice was difficult',
            'RECENT_SUCCESS': 'Recent practice was successful',
            'LEARNER_REQUEST': 'You requested this',
            'LEARNER_EXPLORATION': 'You are exploring this topic',
            'PATH_STALE': 'Path has changed',
            'FALLBACK': 'Starting point for learning',
            'UNKNOWN': 'Based on available learning signals'
        };

        var description = descriptions[code] || descriptions['UNKNOWN'];
        return {
            code: code,
            primary: false,
            description: description
        };
    }

    /**
     * 推导 Tradeoff
     */
    function _deriveTradeoff(recommendation, context) {
        if (!recommendation || !context) return null;
    
        var tradeoff = {
            benefit: 'Progress toward learning goal',
            risk: 'May require additional time',
            description: 'Standard learning path'
        };

        if (recommendation.action === 'REVIEW') {
            tradeoff.benefit = 'Strengthens retention and understanding';
            tradeoff.risk = 'Slows progress on new content';
            tradeoff.description = 'Reviewing strengthens long-term retention';
        } else if (recommendation.action === 'PRACTICE') {
            tradeoff.benefit = 'Builds confidence and mastery';
            tradeoff.risk = 'Requires focused effort';
            tradeoff.description = 'Practice helps solidify skills';
        } else if (recommendation.action === 'ADVANCE') {
            tradeoff.benefit = 'Progresses toward your goals';
            tradeoff.risk = 'May encounter unfamiliar concepts';
            tradeoff.description = 'Advancing keeps momentum';
        }

        return tradeoff;
    }

    /**
     * 推导约束
     */
    function _deriveConstraint(recommendation, context) {
        if (!recommendation) return null;

        // 检查是否有硬约束
        if (recommendation.targetType === 'REQUIRED' || recommendation.priority === 'CRITICAL') {
            return {
                type: 'REQUIRED',
                description: 'This recommendation follows an authoritative rule',
                source: 'system_policy'
            };
        }

        return null;
    }

    /**
     * 构建解释摘要
     */
    function _buildExplanationSummary(explanation, level) {
        var summary = '';

        var primaryReason = null;
        for (var i = 0; i < explanation.reasons.length; i++) {
            if (explanation.reasons[i].primary) {
                primaryReason = explanation.reasons[i];
                break;
            }
        }

        if (primaryReason) {
            summary = primaryReason.description;
        } else if (explanation.reasons.length > 0) {
            summary = explanation.reasons[0].description;
        } else {
            summary = 'Recommended based on your learning progress.';
        }

        // Detail level: 添加更多信息
        if (level === 'detail' || level === 'audit') {
            if (explanation.evidence.length > 0) {
                summary += ' Based on ' + explanation.evidence.length + ' evidence item(s).';
            }
            if (explanation.alternatives.length > 0) {
                summary += ' ' + explanation.alternatives.length + ' alternative(s) available.';
            }
            if (explanation.uncertainty !== 'UNKNOWN') {
                summary += ' Uncertainty: ' + explanation.uncertainty.toLowerCase() + '.';
            }
        }

        // Audit level: 添加版本信息
        if (level === 'audit') {
            summary += ' [Context: ' + (explanation.sourceVersions.contextVersion || 'N/A') + ']';
            summary += ' [Path: ' + (explanation.sourceVersions.pathVersion || 'N/A') + ']';
        }

        return summary;
    }

    /**
     * 获取解释层级列表
     */
    function getExplanationLevels() {
        return ['summary', 'detail', 'audit'];
    }    

    /**
     * 比较两个推荐
     */
    function compareRecommendations(rec1, rec2, context) {
        context = context || _getAdaptiveContext();

        var comparison = {
            recommendations: [],
            differences: [],
            recommendation: null
        };

        // 获取两个推荐的解释
        var exp1 = explainRecommendation(rec1, 'detail', context);
        var exp2 = explainRecommendation(rec2, 'detail', context);

        comparison.recommendations = [exp1, exp2];

        // 比较差异
        if (exp1.reasons.length > 0 && exp2.reasons.length > 0) {
            var r1 = exp1.reasons[0].code || 'UNKNOWN';
            var r2 = exp2.reasons[0].code || 'UNKNOWN';
            if (r1 !== r2) {
                comparison.differences.push({
                    aspect: 'primaryReason',
                    value1: r1,
                    value2: r2
                });
            }
        }

        if (exp1.uncertainty !== exp2.uncertainty) {
            comparison.differences.push({
                aspect: 'uncertainty',
                value1: exp1.uncertainty,
                value2: exp2.uncertainty
            });
        }

        if (exp1.alternatives.length !== exp2.alternatives.length) {
            comparison.differences.push({
                aspect: 'alternativeCount',
                value1: exp1.alternatives.length,
                value2: exp2.alternatives.length
            });
        }

        return comparison;
    }

    /**
     * 获取决策追踪
     */
    function getDecisionTrace(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { error: 'Recommendation not found', recommendationId: recommendationId };
        }

        var trace = {
            recommendationId: recommendationId,
            targetId: rec.targetId,
            targetType: rec.targetType,
            status: rec.status,
            priorityScore: rec.priorityScore,
            confidence: rec.confidence,
            source: rec.source,
            sourceSignals: rec.sourceSignals,
            createdAt: rec.createdAt,
            updatedAt: rec.updatedAt,
            expiresAt: rec.expiresAt,
            contextVersion: rec.metadata?.context?.contextVersion || null,
            path: rec.metadata?.context?.path || null,
            events: []
        };

        // 从事件系统获取相关事件
        try {
            var eventBus = window.LawAIApp?.EventBus || window.EventBus;
            if (eventBus && typeof eventBus.getEvents === 'function') {
                var events = eventBus.getEvents({
                    filter: function(e) {
                        return e.detail && e.detail.recommendationId === recommendationId;
                    }
                });
                trace.events = events || [];
            }
        } catch (e) {
            // 忽略
        }    

        return trace;
    }

    /**
     * 获取推荐反馈
     */
    function getRecommendationFeedback(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { error: 'Recommendation not found' };
        }

        var feedback = {
            recommendationId: recommendationId,
            status: rec.status,
            accepted: rec.status === STATES.ACCEPTED,
            completed: rec.status === STATES.COMPLETED,
            dismissed: rec.status === STATES.DISMISSED,
            skipped: rec.status === STATES.SKIPPED,
            expired: rec.status === STATES.EXPIRED,
            pending: rec.status === STATES.PENDING,
            timestamp: rec.updatedAt || rec.createdAt
        };

        return feedback;
    }

    /**
     * 记录推荐反馈
     */
    function recordRecommendationFeedback(recommendationId, feedbackType, comment) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { success: false, message: 'Recommendation not found' };
        }

        var feedbackEvent = {
            recommendationId: recommendationId,
            feedbackType: feedbackType, // HELPFUL | NOT_HELPFUL | UNCLEAR | WRONG | NOT_RELEVANT
            comment: comment || null,
            timestamp: Date.now()
        };

        _emit('RECOMMENDATION_FEEDBACK_RECORDED', feedbackEvent);

        return {
            success: true,
            feedback: feedbackEvent
        };
    }

    // ============================================================
    // REASON GENERATION
    // ============================================================

    function _generateReason(candidate, context) {
        var signals = candidate.signals || [];
        var targetId = candidate.targetId;

        if (signals.indexOf('REVIEW_DUE') !== -1) {
            return 'Review this concept because it is due for reinforcement.';
        }
        if (signals.indexOf('LOW_MASTERY') !== -1) {
            var level = candidate.masteryLevel || 0;
            if (level < 0.2) {
                return 'This skill needs attention. Practice the fundamentals to build a stronger foundation.';
            }
            return 'Practice this skill because recent performance shows developing understanding.';
        }
        if (signals.indexOf('PREREQUISITE_BLOCKED') !== -1) {
            return 'Learn this first — it is required before you can continue.';
        }
        if (signals.indexOf('GOAL_ALIGNED') !== -1) {
            return 'This content is aligned with your current learning goals.';
        }
        if (signals.indexOf('CURRENT_COURSE') !== -1) {
            return 'Continue your current course. This is the next logical step.';
        }
        if (signals.indexOf('FALLBACK') !== -1) {
            return 'Explore this course to begin your learning journey.';
        }

        return 'Recommended based on your learning progress.';
    }

    // ============================================================
    // RECOMMENDATION ACTIONS
    // ============================================================

    function acceptRecommendation(id) {
        return _updateStatus(id, STATES.ACCEPTED);
    }

    function completeRecommendation(id) {
        return _updateStatus(id, STATES.COMPLETED);
    }

    function dismissRecommendation(id) {
        return _updateStatus(id, STATES.DISMISSED);
    }

    function skipRecommendation(id) {
        return _updateStatus(id, STATES.SKIPPED);
    }

    function expireRecommendation(id) {
        return _updateStatus(id, STATES.EXPIRED);
    }

    function _updateStatus(id, status) {
        if (!id) return null;
        var store = _getStore();
        var rec = store[id];
        if (!rec) return null;

        rec.status = status;
        rec.updatedAt = Date.now();
        store[id] = rec;
        _saveStore(store);

        _emit('RECOMMENDATION_' + status, {
            id: id,
            targetId: rec.targetId,
            status: status
        });

        return rec;
    }

    // ============================================================
    // REFRESH
    // ============================================================

    function refreshRecommendations(context) {
        // 清理过期推荐
        _cleanupExpired();

        // 生成新推荐
        return generateRecommendations(context);
    }

    function _cleanupExpired() {
        var store = _getStore();
        var now = Date.now();
        var count = 0;

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];
            if (rec.status === STATES.PENDING && rec.expiresAt && rec.expiresAt < now) {
                rec.status = STATES.EXPIRED;
                rec.updatedAt = now;
                store[key] = rec;
                count++;
            }
        }

        if (count > 0) {
            _saveStore(store);
            console.log('[RecommendationEngine] 🧹 Expired ' + count + ' recommendations');
        }
    }

    // ============================================================
    // HELPERS: Context
    // ============================================================

    function _getCurrentCourseId() {
        var adapter = window.LawAIApp?.LearningJourneyAdapter;
        if (adapter && typeof adapter.getState === 'function') {
            var state = adapter.getState();
            return state.currentCourseId || null;
        }
        return null;
    }

    function _findNextLesson(courseId) {
        var adapter = window.LawAIApp?.LearningJourneyAdapter;
        if (adapter && typeof adapter.getContinueLearning === 'function') {
            var continueData = adapter.getContinueLearning();
            if (continueData && continueData.lessonId) {
                return continueData.lessonId;
            }
        }
        return null;
    }

    function _getActiveGoals() {
        var goalEngine = window.LawAIApp?.GoalEngine;
        if (goalEngine && typeof goalEngine.getActiveGoals === 'function') {
            return goalEngine.getActiveGoals();
        }
        return [];
    }

    function _extractGoalTopics(goals) {
        var topics = [];
        for (var i = 0; i < goals.length; i++) {
            var goal = goals[i];
            if (goal.topics) {
                topics = topics.concat(goal.topics);
            }
            if (goal.title) {
                topics.push(goal.title);
            }
            if (goal.targetId) {
                topics.push(goal.targetId);
            }
        }
        return topics.slice(0, 10);
    }

    function _getFallbackRecommendation() {
        var schoolRegistry = window.LawAIApp?.SchoolRegistry;
        if (schoolRegistry && typeof schoolRegistry.getAll === 'function') {
            var schools = schoolRegistry.getAll();
            if (schools && schools.length > 0) {
                return {
                    targetId: schools[0].id,
                    targetType: TARGET_TYPES.COURSE
                };
            }
        }
        return {
            targetId: 'school-science',
            targetType: TARGET_TYPES.COURSE
        };
    }

    // ============================================================
    // PUBLIC: Status
    // ============================================================

    function getStatus() {
        var store = _getStore();
        var records = [];
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            records.push(store[key]);
        }

        var pending = records.filter(function(r) { return r.status === STATES.PENDING; });
        var active = records.filter(function(r) {
            return r.status === STATES.PENDING || r.status === STATES.ACCEPTED;
        });

        return {
            version: '2.0.0',
            initialized: true,
            schemaVersion: _schemaVersion,
            totalRecords: records.length,
            pendingCount: pending.length,
            activeCount: active.length,
            states: {
                pending: pending.length,
                accepted: records.filter(function(r) { return r.status === STATES.ACCEPTED; }).length,
                completed: records.filter(function(r) { return r.status === STATES.COMPLETED; }).length,
                dismissed: records.filter(function(r) { return r.status === STATES.DISMISSED; }).length,
                expired: records.filter(function(r) { return r.status === STATES.EXPIRED; }).length,
                skipped: records.filter(function(r) { return r.status === STATES.SKIPPED; }).length
            },
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ============================================================
    // PUBLIC: Reset / Export / Import
    // ============================================================

    function reset() {
        _recommendations = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('[RecommendationEngine] Reset complete');
        } catch (e) {}
    }

    function exportData() {
        return _getStore();
    }

    function importData(data) {
        if (data && typeof data === 'object') {
            _saveStore(data);
            console.log('[RecommendationEngine] Import complete');
            return true;
        }
        return false;
    }

    // ============================================================
    // PRIVATE: Event Helpers
    // ============================================================

    function _emit(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            document.dispatchEvent(event);
            window.dispatchEvent(event);

            if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                window.LawAIApp.EventBus.emit(eventName, data);
            }
        } catch (err) {}
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (window.LawAIApp.RecommendationEngine && window.LawAIApp.RecommendationEngine._initialized) {
            console.log('[RecommendationEngine] Already initialized');
            return;
        }

        console.log('[RecommendationEngine] 🚀 Initializing v2.0.0...');

        try {
            // 加载数据
            _getStore();

            // 清理过期推荐
            _cleanupExpired();

            // 注册事件监听（可选）
            var eventBus = window.LawAIApp.EventBus || window.EventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                // 当学习状态更新时，自动刷新推荐
                eventBus.on('LEARNING_STATE_UPDATED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                eventBus.on('MASTERY_UPDATED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                eventBus.on('REVIEW_COMPLETED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                console.log('[RecommendationEngine] ✅ Listening to learning events');
            }

            window.LawAIApp.RecommendationEngine = {
                _initialized: true,
                _upgraded: true,
                _version: '2.0.0',

                // Core
                getRecommendation: getRecommendation,
                getRecommendations: getRecommendations,
                getPendingRecommendations: getPendingRecommendations,
                getActiveRecommendations: getActiveRecommendations,

                // Generation
                generateRecommendations: generateRecommendations,
                refreshRecommendations: refreshRecommendations,

                // Actions
                acceptRecommendation: acceptRecommendation,
                completeRecommendation: completeRecommendation,
                dismissRecommendation: dismissRecommendation,
                skipRecommendation: skipRecommendation,
                expireRecommendation: expireRecommendation,

                refresh: refresh,

                // 🔥 Part 48: Adaptive Recommendation Engine
                getAdaptiveRecommendations: getAdaptiveRecommendations,
                acceptAdaptiveRecommendation: acceptAdaptiveRecommendation,
                dismissAdaptiveRecommendation: dismissAdaptiveRecommendation,
                skipAdaptiveRecommendation: skipAdaptiveRecommendation,
                selectAdaptiveAlternative: selectAdaptiveAlternative,
                isRecommendationStale: isRecommendationStale,

                // 在 return 对象的 Part 48 方法后面添加
                // 🔥 Part 49: Recommendation Explainability & Decision Transparency
                explainRecommendation: explainRecommendation,
                getExplanationLevels: getExplanationLevels,
                compareRecommendations: compareRecommendations,
                getDecisionTrace: getDecisionTrace,
                getRecommendationFeedback: getRecommendationFeedback,
                recordRecommendationFeedback: recordRecommendationFeedback,

                // Status
                getStatus: getStatus,

                // Reset / Export / Import
                reset: reset,
                exportData: exportData,
                importData: importData,

                // Constants
                STATES: STATES,
                TARGET_TYPES: TARGET_TYPES,
                POLICY: POLICY
            };

            console.log('[RecommendationEngine] ✅ Initialized successfully');

        } catch (error) {
            console.error('[RecommendationEngine] ❌ Init failed:', error);
            // 即使失败，也暴露一个安全的空对象
            window.LawAIApp.RecommendationEngine = {
                _initialized: false,
                _upgraded: true,
                _version: '2.0.0',
                getRecommendations: function() { return []; },
                getActiveRecommendations: function() { return []; },
                generateRecommendations: function() { return []; },
                getStatus: function() {
                    return { version: '2.0.0', initialized: false, error: 'Initialization failed' };
                }
            };
        }
    }

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            init();
        } catch (err) {
            console.warn('[RecommendationEngine] ⚠️ Auto-init failed:', err);
        }
    }, 600);

})();
