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
