// ================================================================
// ENGINE: LearnerModel
// LAYER: Domain Model Layer
// DOMAIN: Learner State Aggregation
// VERSION: 1.0.0 — Part 39 Learner Model Foundation
// ================================================================
//
// PURPOSE
// ================================================================
//   Provide a single, authoritative view of the learner's current
//   learning state. Aggregates from authoritative domain systems
//   without duplicating persistence.
//
// LAYERS
// ================================================================
//   A. IDENTITY        → learnerId (from profile)
//   B. CONTEXT         → current school/course/subject/lesson
//   C. PROGRESS        → derived from ProgressEngine
//   D. KNOWLEDGE       → derived from Memory + Mastery
//   E. ACTIVITY        → derived from event history
//   F. GOALS           → from GoalEngine
//   G. PREFERENCES     → from Profile/Preferences
//   H. CAPACITY        → placeholder for future Calendar
//   I. DERIVED         → computed insights
//
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.LearnerModel) {
        console.log('[LearnerModel] Already exists, skipping...');
        return;
    }

    var LearnerModel = {
        _version: '1.0.0',
        _initialized: false,
        _cache: {
            context: null,
            progress: null,
            activity: null,
            insights: null
        },
        _cacheInvalidated: true,

        // ============================================================
        // 1. INITIALIZATION
        // ============================================================

        init: function() {
            if (this._initialized) {
                console.log('[LearnerModel] Already initialized');
                return this;
            }

            console.log('[LearnerModel] 🚀 Initializing v' + this._version + '...');

            try {
                this._bindEvents();
                this._initialized = true;
                console.log('[LearnerModel] ✅ Initialized');
            } catch (error) {
                console.error('[LearnerModel] ❌ Init failed:', error);
                this._initialized = false;
            }

            return this;
        },

        // ============================================================
        // 2. PUBLIC API — Full Model
        // ============================================================

        /**
         * 获取完整学习者模型
         */
        getLearnerModel: function() {
            if (this._cacheInvalidated) {
                this._rebuildCache();
            }

            return {
                learnerId: this._getLearnerId(),
                context: this._cache.context,
                progress: this._cache.progress,
                knowledge: this._getKnowledgeState(),
                activity: this._cache.activity,
                goals: this._getGoals(),
                preferences: this._getPreferences(),
                capacity: this._getCapacity(),
                derived: this._cache.insights,
                updatedAt: Date.now(),
                schemaVersion: '1.0.0'
            };
        },

        /**
         * 获取学习者上下文快照（用于 AI Mentor 等）
         */
        getLearnerContextSnapshot: function() {
            var context = this.getCurrentLearningContext();
            var progress = this.getLearningProgress();
            var goals = this.getActiveGoals();

            return {
                currentCourse: context.currentCourseId,
                currentSubject: context.currentSubjectId,
                currentLesson: context.currentLessonId,
                progress: progress.completionPercent,
                goals: goals.map(function(g) { return { title: g.title, progress: g.progress }; }),
                recentActivity: this.getRecentActivity(7),
                reviewLoad: this.getReviewLoad(),
                masterySummary: this.getMasterySummary()
            };
        },

        // ============================================================
        // 3. PUBLIC API — Context
        // ============================================================

        getCurrentLearningContext: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                var state = adapter.getState();
                return {
                    currentSchoolId: state.currentSchoolId || null,
                    currentCourseId: state.currentCourseId || null,
                    currentSubjectId: state.currentSubjectId || null,
                    currentLessonId: state.currentLessonId || null,
                    currentMode: state.viewMode || 'learning',
                    updatedAt: state.lastActivity || null
                };
            }

            // Fallback
            return {
                currentSchoolId: null,
                currentCourseId: null,
                currentSubjectId: null,
                currentLessonId: null,
                currentMode: 'learning',
                updatedAt: null
            };
        },

        setCurrentContext: function(context) {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.updateProgress === 'function') {
                adapter.updateProgress({
                    courseId: context.currentCourseId,
                    moduleId: context.currentSubjectId,
                    lessonId: context.currentLessonId
                });
            }
            this._cacheInvalidated = true;
        },

        // ============================================================
        // 4. PUBLIC API — Progress
        // ============================================================

        getLearningProgress: function() {
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine && typeof progressEngine.getProgress === 'function') {
                var prog = progressEngine.getProgress();
                return {
                    totalLessons: prog.totalLessons || 365,
                    completedLessons: (prog.completedLessons || []).length,
                    completionPercent: prog.completionPercent || 0,
                    currentStage: prog.currentStage || 'Foundation',
                    xp: prog.xp || 0,
                    level: prog.level || 1,
                    streak: prog.streak || 0,
                    day: prog.day || 1
                };
            }

            return {
                totalLessons: 365,
                completedLessons: 0,
                completionPercent: 0,
                currentStage: 'Foundation',
                xp: 0,
                level: 1,
                streak: 0,
                day: 1
            };
        },

        // ============================================================
        // 5. PUBLIC API — Knowledge
        // ============================================================

        getKnowledgeState: function(knowledgeId) {
            var memory = window.LawAIApp?.MemoryEngine;
            var mastery = window.LawAIApp?.MasteryEngine;

            var result = {
                knowledgeId: knowledgeId || null,
                memory: null,
                mastery: null,
                review: null
            };

            if (knowledgeId) {
                if (memory && typeof memory.getMemory === 'function') {
                    var mem = memory.getMemory(knowledgeId);
                    if (mem) {
                        result.memory = {
                            strength: mem.strength || 0,
                            state: mem.state || 'UNSEEN',
                            nextReview: mem.nextReview || null,
                            reviewCount: mem.reviewCount || 0
                        };
                    }
                }

                if (mastery && typeof mastery.getMastery === 'function') {
                    var mast = mastery.getMastery(knowledgeId);
                    if (mast) {
                        result.mastery = {
                            level: mast.masteryLevel || 0,
                            state: mast.state || 'UNASSESSED',
                            confidence: mast.confidence || 0,
                            evidenceCount: mast.evidenceCount || 0
                        };
                    }
                }

                var review = window.LawAIApp?.MemoryReview;
                if (review && typeof review.getReview === 'function') {
                    var rev = review.getReview(knowledgeId);
                    if (rev) {
                        result.review = {
                            state: rev.reviewState || 'NOT_READY',
                            dueAt: rev.dueAt || null,
                            reviewCount: rev.reviewCount || 0
                        };
                    }
                }
            }

            return result;
        },

        /**
         * 获取所有知识的聚合状态
         */
        getAllKnowledgeState: function() {
            var mastery = window.LawAIApp?.MasteryEngine;
            if (mastery && typeof mastery.getAllMastery === 'function') {
                var all = mastery.getAllMastery();
                return all.map(function(m) {
                    return {
                        knowledgeId: m.knowledgeId,
                        masteryLevel: m.masteryLevel || 0,
                        masteryState: m.state || 'UNASSESSED',
                        confidence: m.confidence || 0
                    };
                });
            }
            return [];
        },

        /**
         * 获取弱知识（mastery < threshold）
         */
        getWeakKnowledge: function(threshold) {
            threshold = threshold || 0.4;
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryLevel < threshold;
            });
        },

        /**
         * 获取强知识（mastery >= threshold）
         */
        getStrongKnowledge: function(threshold) {
            threshold = threshold || 0.7;
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryLevel >= threshold;
            });
        },

        /**
         * 获取已掌握知识（state === MASTERED）
         */
        getMasteredKnowledge: function() {
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryState === 'MASTERED';
            });
        },

        /**
         * 获取需要复习的知识
         */
        getReviewDueKnowledge: function() {
            var review = window.LawAIApp?.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                return review.getTodayReviews();
            }
            return [];
        },

        /**
         * 获取不稳定知识
         */
        getUnstableKnowledge: function() {
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryState === 'UNSTABLE';
            });
        },

        // ============================================================
        // 6. PUBLIC API — Activity
        // ============================================================

        getRecentActivity: function(days) {
            days = days || 7;
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                var state = adapter.getState();
                var lastActivity = state.lastActivity;
                if (lastActivity) {
                    var now = Date.now();
                    var last = new Date(lastActivity).getTime();
                    var daysSince = (now - last) / (24 * 60 * 60 * 1000);
                    return {
                        hasRecentActivity: daysSince < days,
                        lastActivityAt: lastActivity,
                        daysSinceLastActivity: Math.round(daysSince),
                        isActive: daysSince < 1
                    };
                }
            }

            return {
                hasRecentActivity: false,
                lastActivityAt: null,
                daysSinceLastActivity: null,
                isActive: false
            };
        },

        getActivitySummary: function() {
            var progress = this.getLearningProgress();
            var recent = this.getRecentActivity(7);

            return {
                streak: progress.streak || 0,
                completedLessons: progress.completedLessons || 0,
                hasRecentActivity: recent.hasRecentActivity,
                lastActivityAt: recent.lastActivityAt,
                isActive: recent.isActive
            };
        },

        // ============================================================
        // 7. PUBLIC API — Goals
        // ============================================================

        getActiveGoals: function() {
            var goalEngine = window.LawAIApp?.GoalEngine;
            if (goalEngine && typeof goalEngine.getActiveGoals === 'function') {
                return goalEngine.getActiveGoals();
            }
            return [];
        },

        getGoalSummary: function() {
            var goals = this.getActiveGoals();
            return {
                total: goals.length,
                completed: goals.filter(function(g) { return g.status === 'completed'; }).length,
                inProgress: goals.filter(function(g) { return g.status === 'active' || g.status === 'in_progress'; }).length
            };
        },

        // ============================================================
        // 8. PUBLIC API — Preferences
        // ============================================================

        getLearningPreferences: function() {
            var profile = window.LawAIApp?.ProfileEngine;
            if (profile && typeof profile.getProfile === 'function') {
                var p = profile.getProfile();
                return {
                    preferredSessionLength: p.preferredSessionLength || 30,
                    preferredDifficulty: p.preferredDifficulty || 'intermediate',
                    notificationEnabled: p.notificationEnabled !== false,
                    studyTimePreference: p.studyTimePreference || null
                };
            }

            // 默认偏好
            return {
                preferredSessionLength: 30,
                preferredDifficulty: 'intermediate',
                notificationEnabled: true,
                studyTimePreference: null
            };
        },

        // ============================================================
        // 9. PUBLIC API — Capacity (placeholder)
        // ============================================================

        getLearningCapacity: function() {
            // 未来从 Calendar 获取
            return {
                availableMinutesPerDay: null,
                preferredStudyDays: null,
                capacityUpdatedAt: null
            };
        },

        // ============================================================
        // 10. PUBLIC API — Derived Insights
        // ============================================================

        getDerivedInsights: function() {
            if (this._cacheInvalidated) {
                this._rebuildCache();
            }
            return this._cache.insights;
        },

        /**
         * 获取当前焦点（主课程/主题）
         */
        getCurrentFocus: function() {
            var context = this.getCurrentLearningContext();
            if (context.currentCourseId) {
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.getCourse === 'function') {
                    var course = courseRegistry.getCourse(context.currentCourseId);
                    if (course) {
                        return {
                            type: 'course',
                            id: context.currentCourseId,
                            title: course.title || 'Current Course'
                        };
                    }
                }
                return {
                    type: 'course',
                    id: context.currentCourseId,
                    title: 'Current Course'
                };
            }
            return null;
        },

        /**
         * 获取学习势头
         */
        getLearningMomentum: function() {
            var progress = this.getLearningProgress();
            var recent = this.getRecentActivity(7);

            var score = 0;
            if (progress.streak > 0) score += Math.min(30, progress.streak * 2);
            if (recent.isActive) score += 30;
            if (progress.completedLessons > 0) score += Math.min(20, progress.completedLessons);
            if (progress.level > 0) score += Math.min(20, progress.level * 2);

            return {
                score: Math.min(100, score),
                level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
                description: score > 70 ? 'Strong learning momentum' :
                            score > 40 ? 'Steady learning pace' :
                            'Building momentum'
            };
        },

        /**
         * 获取掌握度覆盖率
         */
        getMasteryCoverage: function() {
            var all = this.getAllKnowledgeState();
            if (all.length === 0) {
                return { total: 0, mastered: 0, percent: 0 };
            }

            var mastered = all.filter(function(k) {
                return k.masteryState === 'MASTERED' || k.masteryState === 'PROFICIENT';
            });

            return {
                total: all.length,
                mastered: mastered.length,
                percent: Math.round((mastered.length / all.length) * 100)
            };
        },

        /**
         * 获取复习负载
         */
        getReviewLoad: function() {
            var due = this.getReviewDueKnowledge();
            return {
                dueCount: due.length,
                isHigh: due.length > 5,
                isMedium: due.length > 2 && due.length <= 5,
                isLow: due.length <= 2
            };
        },

        /**
         * 获取目标对齐度
         */
        getGoalAlignment: function() {
            var goals = this.getActiveGoals();
            var progress = this.getLearningProgress();

            if (goals.length === 0) {
                return { aligned: false, score: 0, description: 'No active goals' };
            }

            var avgProgress = goals.reduce(function(sum, g) {
                return sum + (g.progress || 0);
            }, 0) / goals.length;

            return {
                aligned: avgProgress > 0,
                score: avgProgress,
                description: avgProgress > 50 ? 'Making good progress on goals' :
                            avgProgress > 20 ? 'Working towards goals' :
                            'Goals need attention'
            };
        },

        // ============================================================
        // 11. PUBLIC API — Status
        // ============================================================

        getStatus: function() {
            return {
                version: this._version,
                initialized: this._initialized,
                cacheValid: !this._cacheInvalidated,
                hasLearnerId: !!this._getLearnerId()
            };
        },

        // ============================================================
        // 12. PRIVATE — Helpers
        // ============================================================

        _getLearnerId: function() {
            try {
                var profile = window.LawAIApp?.ProfileEngine;
                if (profile && typeof profile.getUserId === 'function') {
                    return profile.getUserId();
                }
                if (profile && typeof profile.getProfile === 'function') {
                    var p = profile.getProfile();
                    if (p && p.userId) return p.userId;
                }
            } catch (e) {}
            return 'default-learner';
        },

        _getKnowledgeState: function() {
            return {
                total: 0,
                mastered: 0,
                weak: 0,
                unstable: 0,
                reviewDue: 0,
                distribution: {}
            };
        },

        _getGoals: function() {
            return this.getActiveGoals();
        },

        _getPreferences: function() {
            return this.getLearningPreferences();
        },

        _getCapacity: function() {
            return this.getLearningCapacity();
        },

        // ============================================================
        // 13. PRIVATE — Cache
        // ============================================================

        _rebuildCache: function() {
            var context = this.getCurrentLearningContext();
            var progress = this.getLearningProgress();
            var activity = this.getRecentActivity(7);

            this._cache.context = context;
            this._cache.progress = progress;
            this._cache.activity = activity;
            this._cache.insights = {
                currentFocus: this.getCurrentFocus(),
                momentum: this.getLearningMomentum(),
                masteryCoverage: this.getMasteryCoverage(),
                reviewLoad: this.getReviewLoad(),
                goalAlignment: this.getGoalAlignment(),
                activitySummary: this.getActivitySummary()
            };
            this._cacheInvalidated = false;
        },

        // ============================================================
        // 14. PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            var self = this;

            var events = [
                'LESSON_COMPLETED',
                'PRACTICE_COMPLETED',
                'RECALL_COMPLETED',
                'REVIEW_COMPLETED',
                'MASTERY_UPDATED',
                'PROGRESS_UPDATED',
                'GOAL_UPDATED',
                'LEARNING_STATE_UPDATED'
            ];

            var eventBus = window.LawAIApp?.EventBus || window.EventBus;

            events.forEach(function(eventName) {
                var listener = function() {
                    self._cacheInvalidated = true;
                };

                if (eventBus && typeof eventBus.on === 'function') {
                    eventBus.on(eventName, listener);
                } else {
                    document.addEventListener(eventName, listener);
                }
            });

            console.log('[LearnerModel] ✅ Listening to ' + events.length + ' events');
        },

        /**
         * 手动使缓存失效（外部调用）
         */
        invalidateCache: function() {
            this._cacheInvalidated = true;
        }
    };

    // ============================================================
    // 15. EXPORT
    // ============================================================

    window.LawAIApp.LearnerModel = LearnerModel;

    // ============================================================
    // 16. AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            LearnerModel.init();
            console.log('[LearnerModel] ✅ Auto-initialized');
        } catch (err) {
            console.warn('[LearnerModel] ⚠️ Auto-init failed:', err);
        }
    }, 700);

    console.log('[LearnerModel] Module loaded (v1.0.0)');

})();
