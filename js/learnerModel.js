// ================================================================
// ENGINE: LearnerModel
// LAYER: Domain Model Layer
// DOMAIN: Learner State Aggregation
// VERSION: 1.0.0 — Part 39 Learner Model Foundation
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
        // 🔥 Part 47: Learner State & Context Intelligence
        // ============================================================

        buildLearnerSnapshot: function(options) {
            options = options || {};
    
            var snapshot = {
                learnerId: this._getLearnerId(),
                stateVersion: Date.now(),
                timestamp: Date.now(),
                quality: 'FULL',
                components: {},
                warnings: [],
                errors: []
            };

            // 1. Mastery
            try {
                var mastery = window.LawAIApp.MasteryEngine;
                if (mastery) {
                    snapshot.components.mastery = {
                        available: true,
                        summary: mastery.getAllMastery ? mastery.getAllMastery() : [],
                        overall: mastery.calculateOverallMastery ? mastery.calculateOverallMastery() : null
                    };
                } else {
                    snapshot.components.mastery = { available: false, reason: 'MasteryEngine not found' };
                    snapshot.quality = 'DEGRADED';
                    snapshot.warnings.push('Mastery unavailable');
                }
            } catch (e) {
                snapshot.components.mastery = { available: false, error: e.message };
                snapshot.quality = 'DEGRADED';
                snapshot.errors.push('Mastery error: ' + e.message);
            }

            // 2. Memory
            try {
                var memory = window.LawAIApp.MemoryEngine;
                if (memory) {
                    snapshot.components.memory = {
                        available: true,
                        stats: memory.getStats ? memory.getStats() : null,
                        todayReviews: memory.getTodayReviews ? memory.getTodayReviews() : []
                    };
                } else {
                    snapshot.components.memory = { available: false, reason: 'MemoryEngine not found' };
                    snapshot.quality = 'DEGRADED';
                    snapshot.warnings.push('Memory unavailable');
                }
            } catch (e) {
                snapshot.components.memory = { available: false, error: e.message };
                snapshot.quality = 'DEGRADED';
                snapshot.errors.push('Memory error: ' + e.message);
            }

            // 3. Review
            try {
                var review = window.LawAIApp.MemoryReview;
                if (review) {
                    var todayReviews = review.getTodayReviews ? review.getTodayReviews() : [];
                    snapshot.components.review = {
                        available: true,
                        todayReviews: todayReviews,
                        status: review.getStatus ? review.getStatus() : null
                    };
                } else {
                    snapshot.components.review = { available: false, reason: 'MemoryReview not found' };
                    snapshot.warnings.push('Review unavailable');
                }
            } catch (e) {
                snapshot.components.review = { available: false, error: e.message };
                snapshot.errors.push('Review error: ' + e.message);
            }

            // 4. Progress
            try {
                var progress = window.LawAIApp.ProgressEngine;
                if (progress) {
                    var progData = progress.getProgress ? progress.getProgress() : null;
                    snapshot.components.progress = {
                        available: true,
                        data: progData,
                        state: progress.getState ? progress.getState() : null
                    };
                } else {
                    snapshot.components.progress = { available: false, reason: 'ProgressEngine not found' };
                    snapshot.warnings.push('Progress unavailable');
                }
            } catch (e) {
                snapshot.components.progress = { available: false, error: e.message };
                snapshot.errors.push('Progress error: ' + e.message);
            }

            // 5. Goals
            try {
                var goals = window.LawAIApp.GoalEngine;
                if (goals) {
                    snapshot.components.goals = {
                        available: true,
                        active: goals.getActiveGoals ? goals.getActiveGoals() : [],
                        all: goals.getAllGoals ? goals.getAllGoals() : []
                    };
                } else {
                    snapshot.components.goals = { available: false, reason: 'GoalEngine not found' };
                    snapshot.warnings.push('Goals unavailable');
                }
            } catch (e) {
                snapshot.components.goals = { available: false, error: e.message };
                snapshot.errors.push('Goals error: ' + e.message);
            }

            // 6. Activity
            try {
                var activity = this.getRecentActivity ? this.getRecentActivity(7) : { hasRecentActivity: false };
                var momentum = this.getLearningMomentum ? this.getLearningMomentum() : { score: 0 };
                snapshot.components.activity = {
                    available: true,
                    recent: activity,
                    momentum: momentum
                };
            } catch (e) {
                snapshot.components.activity = { available: false, error: e.message };
                snapshot.quality = 'DEGRADED';
                snapshot.errors.push('Activity error: ' + e.message);
            }

            // 7. Path Context
            try {
                var ape = window.LawAIApp.AdaptivePathEngine;
                if (ape) {
                    var pathStatus = ape.getPathStatus ? ape.getPathStatus(null) : null;
                    snapshot.components.path = {
                        available: true,
                        status: pathStatus,
                        activePath: ape.getActivePath ? ape.getActivePath() : null
                    };
                } else {
                    snapshot.components.path = { available: false, reason: 'AdaptivePathEngine not found' };
                }
            } catch (e) {
                snapshot.components.path = { available: false, error: e.message };
            }

            // 8. Agency Context
            try {
                var ape2 = window.LawAIApp.AdaptivePathEngine;
                if (ape2 && ape2.getLearnerChoices) {
                    var choices = ape2.getLearnerChoices ? ape2.getLearnerChoices(null) : [];
                    snapshot.components.agency = {
                        available: true,
                        choices: choices,
                        choiceCount: choices.length
                    };
                } else {
                    snapshot.components.agency = { available: false, reason: 'Agency info not available' };
                }
            } catch (e) {
                snapshot.components.agency = { available: false, error: e.message };
            }    

            // 9. Evidence
            try {
                var loop = window.LawAIApp.AdaptiveLoop;
                if (loop && loop.getLoopStatus) {
                    var status = loop.getLoopStatus();
                    snapshot.components.evidence = {
                        available: true,
                        lastEvidence: status.lastEvidence || null,
                        loopState: status
                    };
                } else {
                    snapshot.components.evidence = { available: false, reason: 'AdaptiveLoop not available' };
                }
            } catch (e) {
                snapshot.components.evidence = { available: false, error: e.message };
            }

            // 10. Calculate overall quality
            var availableComponents = 0;
            var totalComponents = 0;
            for (var key in snapshot.components) {
                totalComponents++;
                if (snapshot.components[key].available) {
                    availableComponents++;
                }
            }

            var ratio = totalComponents > 0 ? availableComponents / totalComponents : 0;
            if (ratio >= 0.8) snapshot.quality = 'FULL';
            else if (ratio >= 0.5) snapshot.quality = 'PARTIAL';
            else if (ratio >= 0.2) snapshot.quality = 'DEGRADED';
            else snapshot.quality = 'UNAVAILABLE';

            snapshot.completeness = {
                ratio: ratio,
                available: availableComponents,
                total: totalComponents,
                quality: snapshot.quality
            };

            return snapshot;
        },

        buildAdaptiveContext: function(options) {
            options = options || {};
    
            var snapshot = this.buildLearnerSnapshot(options);
    
            var context = {
                contextVersion: Date.now(),
                snapshotVersion: snapshot.stateVersion,
                learnerId: snapshot.learnerId,
                quality: snapshot.quality,
                timestamp: Date.now(),
        
                target: options.targetId || this._getCurrentTarget(),
                goal: this._getCurrentGoal(),
        
                knowledge: {
                    mastered: this.getMasteredKnowledge ? this.getMasteredKnowledge() : [],
                    weak: this.getWeakKnowledge ? this.getWeakKnowledge() : [],
                    reviewDue: this.getReviewDueKnowledge ? this.getReviewDueKnowledge() : [],
                    unstable: this.getUnstableKnowledge ? this.getUnstableKnowledge() : []
                },
        
                summary: {
                    masteryCoverage: this.getMasteryCoverage ? this.getMasteryCoverage() : { total: 0, mastered: 0, percent: 0 },
                    reviewLoad: this.getReviewLoad ? this.getReviewLoad() : { dueCount: 0 },
                    goalAlignment: this.getGoalAlignment ? this.getGoalAlignment() : { aligned: false, score: 0 },
                    momentum: this.getLearningMomentum ? this.getLearningMomentum() : { score: 0 },
                    activity: this.getRecentActivity ? this.getRecentActivity(7) : { hasRecentActivity: false }
                },
        
                signals: this._extractSignals(snapshot),
        
                warnings: snapshot.warnings || [],
                errors: snapshot.errors || [],
        
                diagnostics: {
                    components: snapshot.components,
                    completeness: snapshot.completeness
                }
            };
    
            return context;
        },

        _getCurrentTarget: function() {
            try {
                var loop = window.LawAIApp.AdaptiveLoop;
                if (loop && loop.getLoopStatus) {
                    var status = loop.getLoopStatus();
                    if (status && status.lastDecision && status.lastDecision.targetId) {
                        return status.lastDecision.targetId;
                    }        
                }
            } catch (e) {}
    
            try {
                var ape = window.LawAIApp.AdaptivePathEngine;
                if (ape && ape.getActivePath) {
                    var path = ape.getActivePath();
                    if (path && path.targetId) {
                        return path.targetId;
                    }
                }
            } catch (e) {}
    
            return null;
        },

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

        _extractSignals: function(snapshot) {
            var signals = {};
    
            if (snapshot.components.mastery && snapshot.components.mastery.available) {
                signals.masteryAvailable = true;
                var overall = snapshot.components.mastery.overall;
                if (overall) {
                    signals.overallMastery = overall.overall || 0;
                    signals.overallLevel = overall.level || 'Beginner';
                }
            } else {
                signals.masteryAvailable = false;
            }
    
            if (snapshot.components.review && snapshot.components.review.available) {
                var todayReviews = snapshot.components.review.todayReviews || [];
                signals.reviewDue = todayReviews.length;
                signals.hasReviewsDue = todayReviews.length > 0;
            } else {
                signals.reviewAvailable = false;
            }
    
            if (snapshot.components.activity && snapshot.components.activity.available) {
                var momentum = snapshot.components.activity.momentum || {};
                signals.momentum = momentum.score || 0;
                signals.hasRecentActivity = snapshot.components.activity.recent?.hasRecentActivity || false;
            }
    
            if (snapshot.components.goals && snapshot.components.goals.available) {
                signals.activeGoalCount = (snapshot.components.goals.active || []).length;
                signals.hasActiveGoal = signals.activeGoalCount > 0;
            }
    
            if (snapshot.components.agency && snapshot.components.agency.available) {
                signals.agencyChoices = snapshot.components.agency.choiceCount || 0;
                signals.hasAgencyChoices = signals.agencyChoices > 0;
            }
    
            if (snapshot.components.path && snapshot.components.path.available) {
                signals.pathStatus = snapshot.components.path.status || 'UNKNOWN';
                signals.hasActivePath = signals.pathStatus === 'ACTIVE' || signals.pathStatus === 'VALID';
            }
    
            signals.contextQuality = snapshot.quality || 'UNKNOWN';
            signals.completeness = snapshot.completeness?.ratio || 0;
    
            return signals;
        },

        invalidateContext: function(reason) {
            this._cacheInvalidated = true;
            console.log('[LearnerModel] Context invalidated:', reason || 'manual');
        },

        getContextStatus: function() {
            return {
                cacheValid: !this._cacheInvalidated,
                lastContextBuild: this._lastContextBuild || null,
                quality: this._lastContextQuality || 'UNKNOWN'
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

        getWeakKnowledge: function(threshold) {
            threshold = threshold || 0.4;
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryLevel < threshold;
            });
        },

        getStrongKnowledge: function(threshold) {
            threshold = threshold || 0.7;
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryLevel >= threshold;
            });
        },

        getMasteredKnowledge: function() {
            var all = this.getAllKnowledgeState();
            return all.filter(function(k) {
                return k.masteryState === 'MASTERED';
            });
        },

        getReviewDueKnowledge: function() {
            var review = window.LawAIApp?.MemoryReview;
            if (review && typeof review.getTodayReviews === 'function') {
                return review.getTodayReviews();
            }
            return [];
        },

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

        getReviewLoad: function() {
            var due = this.getReviewDueKnowledge();
            return {
                dueCount: due.length,
                isHigh: due.length > 5,
                isMedium: due.length > 2 && due.length <= 5,
                isLow: due.length <= 2
            };
        },

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

        invalidateCache: function() {
            this._cacheInvalidated = true;
        },

        // ============================================================
        // 🔥 Part 136: Skill Interpretation
        // ============================================================

        /**
         * 获取 Skill Interpretation
         * @param {string} skillId - Skill ID
         * @param {Object} options - 选项
         * @returns {Object} Skill 状态
         */
        getSkillState: function(skillId, options) {
            options = options || {};
    
            // 1. 获取相关知识点的 Mastery
            var relatedKnowledge = this._getRelatedKnowledge(skillId);
            var masteries = [];
            for (var i = 0; i < relatedKnowledge.length; i++) {
                var mastery = window.LawAIApp?.MasteryEngine?.getMastery(relatedKnowledge[i]);
                if (mastery) masteries.push(mastery);
            }
    
            // 2. 获取相关记忆状态
            var memories = [];
            for (var i = 0; i < relatedKnowledge.length; i++) {
                var memory = window.LawAIApp?.MemoryEngine?.getMemory(relatedKnowledge[i]);
                if (memory) memories.push(memory);
            }
    
            // 3. 计算 Skill 状态
            var skillState = this._interpretSkillState(masteries, memories, options);
    
            return {
                skillId: skillId,
                state: skillState.state,
                confidence: skillState.confidence,
                evidenceStrength: skillState.evidenceStrength,
                evidenceRefs: skillState.evidenceRefs,
                masteries: masteries,
                memories: memories,
                interpretedAt: new Date().toISOString(),
                interpretationVersion: '1.0.0'
            };        
        },

        /**
         * 解释 Skill 状态
         * @private
         */
        _interpretSkillState: function(masteries, memories, options) {
            if (!masteries || masteries.length === 0) {
                return {
                    state: 'unknown',
                    confidence: 'low',
                    evidenceStrength: 'none',
                    evidenceRefs: [],
                    reason: 'insufficient_evidence'
                };
            }
    
            // 计算平均 mastery level
            var totalLevel = 0;
            var totalConfidence = 0;
            var evidenceCount = 0;
            var masteredCount = 0;
            var proficientCount = 0;
            var developingCount = 0;
    
            for (var i = 0; i < masteries.length; i++) {
                var m = masteries[i];
                if (!m) continue;
                totalLevel += (m.masteryLevel || 0);
                totalConfidence += (m.confidence || 0);
                evidenceCount += (m.evidenceCount || 0);
                if (m.state === 'MASTERED') masteredCount++;
                if (m.state === 'PROFICIENT') proficientCount++;
                if (m.state === 'DEVELOPING') developingCount++;
            }
    
            var avgLevel = masteries.length > 0 ? totalLevel / masteries.length : 0;
            var avgConfidence = masteries.length > 0 ? totalConfidence / masteries.length : 0;
        
            // 判断 Skill 状态
            var state = 'unknown';
            var confidence = 'low';
            var evidenceStrength = 'low';
            var evidenceRefs = [];
    
            if (evidenceCount === 0) {
                state = 'unknown';
                confidence = 'low';
                evidenceStrength = 'none';
            } else if (masteredCount > 0 && avgLevel >= 0.8 && avgConfidence >= 0.7) {
                state = 'strong';
                confidence = 'medium';
                evidenceStrength = 'moderate';
            } else if (proficientCount > 0 && avgLevel >= 0.6 && avgConfidence >= 0.5) {
                state = 'proficient';
                confidence = 'medium';
                evidenceStrength = 'moderate';
            } else if (developingCount > 0 || avgLevel >= 0.3) {
                state = 'developing';
                confidence = 'low';
                evidenceStrength = 'low';
            } else if (avgLevel > 0) {
                state = 'emerging';
                confidence = 'low';
                evidenceStrength = 'low';
            } else {
                state = 'unknown';
                confidence = 'low';
                evidenceStrength = 'none';
            }
    
            return {
                state: state,
                confidence: confidence,
                evidenceStrength: evidenceStrength,
                evidenceRefs: evidenceRefs,
                reason: 'based_on_' + masteries.length + '_knowledge_targets'
            };
        },

        /**
         * 获取 Skill 定义
         * @param {string} skillId - Skill ID
         * @returns {Object} Skill 定义
         */
        getSkillDefinition: function(skillId) {
            // 从 Knowledge Graph 或 Registry 获取
            // 如果不存在，返回默认定义
            var definitions = this._skillDefinitions || {};
            return definitions[skillId] || {
                skillId: skillId,
                name: skillId,
                description: 'Skill: ' + skillId,
                relatedKnowledge: [],
                version: '1.0.0'
            };
        },

        /**
         * 注册 Skill 定义
         * @param {Object} definition - Skill 定义
         */
        registerSkillDefinition: function(definition) {
            if (!this._skillDefinitions) {
                this._skillDefinitions = {};
            }        
            this._skillDefinitions[definition.skillId] = definition;
        },

        /**
         * 获取所有 Skill 状态
         */
        getAllSkillStates: function() {
            var definitions = this._skillDefinitions || {};
            var result = [];
            for (var skillId in definitions) {
                result.push(this.getSkillState(skillId));
            }
            return result;
        },

        /**
         * 获取 Skill 总结 (用于 Dashboard/Recommendation)
         */
        getSkillSummary: function() {
            var all = this.getAllSkillStates();
            if (all.length === 0) {
                return {
                    total: 0,
                    strong: 0,
                    proficient: 0,
                    developing: 0,
                    emerging: 0,
                    unknown: 0
                };
            }
    
            var summary = {
                total: all.length,
                strong: 0,
                proficient: 0,
                developing: 0,
                emerging: 0,
                unknown: 0
            };    
    
            for (var i = 0; i < all.length; i++) {
                var state = all[i].state || 'unknown';
                if (summary[state] !== undefined) {
                    summary[state]++;
                } else {
                    summary.unknown++;
                }
            }
    
            return summary;
        },

        // ============================================================
        // 🔥 Part 137: Progress Interpretation
        // ============================================================

        /**
         * 获取 Progress Interpretation
         * @param {string} scopeId - Scope ID (courseId, subjectId, skillId)
         * @param {string} scopeType - 'course' | 'subject' | 'skill'
         * @param {Object} options - 选项
         * @returns {Object} Progress 状态
         */
        getProgressState: function(scopeId, scopeType, options) {
            options = options || {};
    
            // 1. 获取 Scope 的当前状态
            var state = this._getScopeState(scopeId, scopeType);
    
            // 2. 获取历史状态 (如果有)
            var history = this._getScopeHistory(scopeId, scopeType);
    
            // 3. 解释 Progress
            var progress = this._interpretProgress(state, history, options);
    
            return {
                scopeId: scopeId,
                scopeType: scopeType,
                state: progress.state,
                trend: progress.trend || 'unknown',
                confidence: progress.confidence || 'low',
                evidenceStrength: progress.evidenceStrength || 'low',
                supportingEvidence: progress.supportingEvidence || [],
                previousState: progress.previousState || null,
                interpretedAt: new Date().toISOString(),
                interpretationVersion: '1.0.0',
                reason: progress.reason || 'insufficient_evidence'
            };    
        },

        /**
         * 获取 Scope 的当前状态
         * @private
         */
        _getScopeState: function(scopeId, scopeType) {
            var result = {
                coverage: 0,        // 完成百分比
                mastery: null,      // 平均掌握度
                retention: null,    // 记忆状态
                skill: null,        // Skill 状态
                lastActivity: null,
                hasEvidence: false
            };
    
            // 从 ProgressEngine 获取 coverage
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine) {
                var prog = progressEngine.getProgress();
                if (scopeType === 'course') {
                    // 计算 course 的覆盖率
                    var totalLessons = prog.totalLessons || 365;
                    var completed = (prog.completedLessons || []).length;
                    result.coverage = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
                    result.hasEvidence = completed > 0;
                } else if (scopeType === 'skill') {
                    // Skill 的 coverage 基于相关知识点
                    var skillDef = this._skillDefinitions ? this._skillDefinitions[scopeId] : null;
                    if (skillDef && skillDef.relatedKnowledge) {
                        var related = skillDef.relatedKnowledge;
                        var completedCount = 0;
                        var completedLessons = prog.completedLessons || [];
                        for (var i = 0; i < related.length; i++) {
                            if (completedLessons.indexOf(related[i]) !== -1) {
                                completedCount++;
                            }
                        }
                        result.coverage = related.length > 0 ? Math.round((completedCount / related.length) * 100) : 0;
                        result.hasEvidence = completedCount > 0;
                    }
                }
            }
    
            // 从 MasteryEngine 获取 mastery
            var masteryEngine = window.LawAIApp?.MasteryEngine;
            if (masteryEngine) {
                var masteryRecord = masteryEngine.getMastery(scopeId);
                if (masteryRecord) {
                    result.mastery = {
                        level: masteryRecord.masteryLevel || 0,
                        state: masteryRecord.state || 'UNASSESSED',
                        confidence: masteryRecord.confidence || 0
                    };
                    result.hasEvidence = result.hasEvidence || (masteryRecord.evidenceCount || 0) > 0;
                }
            }
    
            // 从 MemoryEngine 获取 retention
            var memoryEngine = window.LawAIApp?.MemoryEngine;
            if (memoryEngine) {
                var memoryRecord = memoryEngine.getMemory(scopeId);
                if (memoryRecord) {
                    result.retention = {
                        strength: memoryRecord.strength || 0,
                        state: memoryRecord.state || 'UNSEEN',
                        nextReview: memoryRecord.nextReview || null
                    };    
                    result.hasEvidence = result.hasEvidence || (memoryRecord.reviewCount || 0) > 0;
                }
            }
    
            // 从 LearnerModel 获取 skill (如果 scopeType 是 skill)
            if (scopeType === 'skill') {
                var skillState = this.getSkillState ? this.getSkillState(scopeId) : null;
                if (skillState) {
                    result.skill = {
                        state: skillState.state || 'unknown',
                        confidence: skillState.confidence || 'low'
                    };
                    result.hasEvidence = result.hasEvidence || (skillState.evidenceStrength !== 'none');
                }
            }
    
            // 获取最后活动时间
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter) {
                var journeyState = adapter.getState ? adapter.getState() : null;
                if (journeyState) {
                    result.lastActivity = journeyState.lastActivity || null;
                }
            }        
    
            return result;
        },

        /**
         * 获取 Scope 的历史状态
         * @private
         */
        _getScopeHistory: function(scopeId, scopeType) {
            // 从 localStorage 获取历史进度状态
            try {
                var stored = localStorage.getItem('progressHistory_' + scopeType + '_' + scopeId);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {}
            return [];
        },

        /**
         * 保存 Scope 的历史状态
         * @private
         */
        _saveScopeHistory: function(scopeId, scopeType, state) {
            try {
                var key = 'progressHistory_' + scopeType + '_' + scopeId;
                var history = this._getScopeHistory(scopeId, scopeType);
                history.push({
                    state: state,
                    timestamp: new Date().toISOString()
                });
                // 只保留最近 20 条
                if (history.length > 20) {
                    history = history.slice(-20);
                }
                localStorage.setItem(key, JSON.stringify(history));
            } catch (e) {}
        },

        /**
         * 解释 Progress
         * @private
         */
        _interpretProgress: function(state, history, options) {
            var result = {
                state: 'unknown',
                trend: 'unknown',
                confidence: 'low',
                evidenceStrength: 'low',
                supportingEvidence: [],
                previousState: null,
                reason: 'insufficient_evidence'
            };
    
            // 1. 检查是否有证据
            if (!state.hasEvidence) {
                result.reason = 'insufficient_evidence';
                return result;
            }
    
            // 2. 收集信号
            var signals = [];
            var hasRecentActivity = false;
            var coverage = state.coverage || 0;
            var masteryLevel = state.mastery?.level || 0;
            var masteryState = state.mastery?.state || 'UNASSESSED';
            var retentionState = state.retention?.state || 'UNSEEN';
            var skillState = state.skill?.state || 'unknown';
            var lastActivity = state.lastActivity;
        
            // 检查最近活动 (30天内)
            if (lastActivity) {
                var now = Date.now();
                var last = new Date(lastActivity).getTime();
                var daysSince = (now - last) / (24 * 60 * 60 * 1000);
                hasRecentActivity = daysSince < 30;
            }
    
            // 3. 判断 Progress State
    
            // 如果有 mastery 且正在提升，且最近有活动
            if (masteryLevel > 0.3 && hasRecentActivity) {
                if (masteryLevel >= 0.7) {
                    result.state = 'advanced';
                    result.confidence = 'medium';
                    result.evidenceStrength = 'moderate';
                    result.reason = 'strong_mastery_with_recent_activity';
                    result.supportingEvidence.push('mastery_level_' + Math.round(masteryLevel * 100) + '%');
                } else if (masteryLevel >= 0.4) {
                    result.state = 'progressing';
                    result.confidence = 'medium';
                    result.evidenceStrength = 'moderate';
                    result.reason = 'developing_mastery_with_recent_activity';
                    result.supportingEvidence.push('mastery_level_' + Math.round(masteryLevel * 100) + '%');
                } else {
                    result.state = 'started';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'early_mastery_with_recent_activity';
                }
            } else if (coverage > 0 && hasRecentActivity) {
                // 有 coverage 但 mastery 低
                if (coverage >= 50) {
                    result.state = 'progressing';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'coverage_progress_but_mastery_limited';
                    result.supportingEvidence.push('coverage_' + coverage + '%');
                } else {
                    result.state = 'started';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'started_learning';
                }
            } else if (coverage > 0 && !hasRecentActivity) {
                // 有 coverage 但没有最近活动
                if (coverage >= 80) {
                    result.state = 'stalled';
                    result.confidence = 'medium';
                    result.evidenceStrength = 'moderate';
                    result.reason = 'high_coverage_no_recent_activity';
                    result.supportingEvidence.push('coverage_' + coverage + '%');
                } else if (coverage >= 50) {
                    result.state = 'stalled';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'moderate_coverage_no_recent_activity';
                } else {
                    result.state = 'started';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'low_coverage_no_recent_activity';
                }
            } else if (masteryLevel > 0 && !hasRecentActivity) {
                // 有 mastery 但没有最近活动
                if (masteryLevel >= 0.7) {
                    result.state = 'stable';
                    result.confidence = 'medium';
                    result.evidenceStrength = 'moderate';
                    result.reason = 'strong_mastery_no_recent_activity_but_retention_unknown';
                } else {
                    result.state = 'started';
                    result.confidence = 'low';
                    result.evidenceStrength = 'low';
                    result.reason = 'mastery_without_recent_activity';
                }
            } else {
                result.state = 'unknown';
                result.reason = 'insufficient_evidence';
            }    
    
            // 4. 检查趋势 (如果有历史)
            if (history && history.length > 1) {
                var recent = history.slice(-3);
                var states = recent.map(function(h) { return h.state; });
                var uniqueStates = {};
                for (var i = 0; i < states.length; i++) {
                    uniqueStates[states[i]] = (uniqueStates[states[i]] || 0) + 1;
                }
        
                // 简单趋势判断
                var stateOrder = {
                    'unknown': 0,
                    'started': 1,
                    'progressing': 2,
                    'stable': 3,
                    'advanced': 4,
                    'completed': 5,
                    'stalled': 2,
                    'regressing': 1
                };
        
                var firstState = states[0];
                var lastState = states[states.length - 1];
                var firstOrder = stateOrder[firstState] || 0;
                var lastOrder = stateOrder[lastState] || 0;
                
                if (lastOrder > firstOrder + 1) {
                    result.trend = 'improving';
                } else if (lastOrder < firstOrder - 1) {
                    result.trend = 'declining';
                } else if (lastOrder === firstOrder) {
                    result.trend = 'stable';
                } else {
                    result.trend = 'unknown';
                }
            } else {
                result.trend = 'unknown';
            }
    
            // 5. 保存历史
            this._saveScopeHistory(scopeId, scopeType, result.state);
    
            return result;
        },

        /**
         * 获取所有 Progress 状态 (按 scope)
         */
        getAllProgressStates: function(scopeType) {
            scopeType = scopeType || 'course';
            var scopes = this._getScopes(scopeType);
            var result = [];
            for (var i = 0; i < scopes.length; i++) {
                result.push(this.getProgressState(scopes[i], scopeType));
            }
            return result;
        },

        /**
         * 获取 Scope 列表
         * @private
         */
        _getScopes: function(scopeType) {
            var scopes = [];
            if (scopeType === 'course') {
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.getAllCourses === 'function') {
                    var courses = courseRegistry.getAllCourses();
                    for (var i = 0; i < courses.length; i++) {
                        if (courses[i] && courses[i].id) {
                            scopes.push(courses[i].id);
                        }
                    }
                }
            } else if (scopeType === 'skill') {
                var definitions = this._skillDefinitions || {};
                for (var key in definitions) {
                    scopes.push(key);
                }
            }
            return scopes;
        },

        /**
         * 获取 Progress 摘要
         */
        getProgressSummary: function() {
            var courseStates = this.getAllProgressStates('course');
            var summary = {
                totalCourses: courseStates.length,
                byState: {
                    unknown: 0,
                    started: 0,
                    progressing: 0,
                    stable: 0,
                    stalled: 0,
                    regressing: 0,
                    advanced: 0,
                    completed: 0
                },
                confidenceDistribution: {
                    low: 0,
                    medium: 0,
                    high: 0
                },
                averageCoverage: 0
            };
    
            var totalCoverage = 0;
            var coverageCount = 0;
    
            for (var i = 0; i < courseStates.length; i++) {
                var state = courseStates[i];
                if (summary.byState[state.state] !== undefined) {
                    summary.byState[state.state]++;
                }
                if (summary.confidenceDistribution[state.confidence] !== undefined) {
                    summary.confidenceDistribution[state.confidence]++;
                }
                // 从 _getScopeState 获取 coverage (这里简化)
                var scopeState = this._getScopeState(state.scopeId, 'course');
                if (scopeState.coverage > 0) {
                    totalCoverage += scopeState.coverage;
                    coverageCount++;
                }
            }
    
            summary.averageCoverage = coverageCount > 0 ? Math.round(totalCoverage / coverageCount) : 0;
    
            return summary;
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
