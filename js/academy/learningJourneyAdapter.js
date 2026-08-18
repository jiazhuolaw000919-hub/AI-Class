// js/academy/learningJourneyAdapter.js
// Part 58.7 — Learning Motivation Connection Layer (Structural Repair)
// Law AI Academy Developer Bible
//
// PURPOSE: Learning Journey state management, session tracking, motivation aggregation
// OWNERSHIP: CONNECTION / STATE layer — DOES NOT render UI, DOES NOT navigate UI
// ARCHITECTURE: AcademyView → AcademyExperienceManager → LearningJourneyAdapter → Registries

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearningJourneyAdapter) {
        console.log('[LearningJourneyAdapter] Already exists, skipping...');
        return;
    }

    var LearningJourneyAdapter = {

        // ============================================================
        // 1. STATE
        // ============================================================

        version: '1.1.0',
        initialized: false,

        _journeyState: {
            currentCourseId: null,
            currentModuleId: null,
            currentLessonId: null,

            completedLessons: [],
            completedModules: [],
            completedCourses: [],

            moduleProgress: {},

            progress: 0,
            lastActivity: null,

            xp: 0,

            currentSessionId: null,
            sessionStatus: null,
            sessionStartedAt: null,
            sessionEndedAt: null
        },

        _userId: 'current-user',

        // ============================================================
        // 2. PUBLIC API — Init
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[LearningJourneyAdapter] Already initialized');
                return this;
            }

            console.log('[LearningJourneyAdapter] 🚀 Initializing...');

            this._loadState();
            this._bindEvents();

            this.initialized = true;

            console.log('[LearningJourneyAdapter] ✅ Initialized');

            return this;
        },

        // ============================================================
        // 3. PUBLIC API — State
        // ============================================================

        getState: function() {
            return { ...this._journeyState };
        },

        getCourseState: function(courseId) {
            var state = this._journeyState;

            if (state.currentCourseId === courseId) {
                return {
                    courseId: courseId,
                    progress: state.progress,
                    completedLessons: state.completedLessons,
                    completedModules: state.completedModules || [],
                    currentModuleId: state.currentModuleId,
                    currentLessonId: state.currentLessonId,
                    lastActivity: state.lastActivity,
                    isActive: true
                };
            }

            var isCompleted = state.completedCourses && state.completedCourses.indexOf(courseId) !== -1;

            return {
                courseId: courseId,
                progress: isCompleted ? 100 : 0,
                completedLessons: [],
                completedModules: [],
                currentModuleId: null,
                currentLessonId: null,
                lastActivity: null,
                isActive: false,
                isCompleted: isCompleted
            };
        },

        // ============================================================
        // 4. PUBLIC API — Course / Module
        // ============================================================

        getCourseModules: function(courseId) {
            console.log('[LearningJourneyAdapter] 📋 Getting modules for course:', courseId);

            var curriculumRegistry = window.LawAIApp?.CurriculumRegistry;
            if (!curriculumRegistry) {
                console.warn('[LearningJourneyAdapter] CurriculumRegistry not available');
                return [];
            }

            var modules = [];
            if (typeof curriculumRegistry.getCourseModules === 'function') {
                modules = curriculumRegistry.getCourseModules(courseId);
            } else {
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.getCourseStructure === 'function') {
                    var course = courseRegistry.getCourseStructure(courseId);
                    if (course && course.modules) {
                        modules = course.modules;
                    }
                }
            }

            var state = this._journeyState;
            var moduleProgress = state.moduleProgress || {};

            return modules.map(function(module) {
                var progress = moduleProgress[module.id] || 0;
                var isCompleted = state.completedModules && state.completedModules.indexOf(module.id) !== -1;

                return {
                    ...module,
                    progress: isCompleted ? 100 : progress,
                    isCompleted: isCompleted,
                    isActive: state.currentModuleId === module.id,
                    lessonCount: module.lessons ? module.lessons.length : 0,
                    completedLessonCount: this._getCompletedLessonCount(module.id)
                };
            }.bind(this));
        },

        selectModule: function(moduleId, courseId) {
            console.log('[LearningJourneyAdapter] 📍 Selecting module:', moduleId);

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (academyRegistry && typeof academyRegistry.getModule === 'function') {
                var module = academyRegistry.getModule(moduleId);
                if (!module) {
                    console.warn('[LearningJourneyAdapter] Module not found:', moduleId);
                    return null;
                }
            }

            this._journeyState.currentModuleId = moduleId;
            if (courseId) {
                this._journeyState.currentCourseId = courseId;
            }
            this._journeyState.lastActivity = new Date().toISOString();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('LEARNING_STATE_UPDATED', {
                moduleId: moduleId,
                courseId: courseId || this._journeyState.currentCourseId,
                action: 'module_selected',
                state: this._journeyState
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                moduleId: moduleId,
                action: 'module_selected',
                state: this._journeyState
            });

            console.log('[LearningJourneyAdapter] ✅ Module selected:', moduleId);
            return this.getState();
        },

        getModuleProgress: function(moduleId) {
            var state = this._journeyState;
            var progress = state.moduleProgress && state.moduleProgress[moduleId] ? state.moduleProgress[moduleId] : 0;
            var completed = state.completedModules && state.completedModules.indexOf(moduleId) !== -1;

            return {
                progress: completed ? 100 : progress,
                completed: completed
            };
        },

        updateModuleProgress: function(moduleId, progress) {
            console.log('[LearningJourneyAdapter] 📊 Updating module progress:', moduleId, progress);

            var state = this._journeyState;
            var clampedProgress = Math.min(100, Math.max(0, progress));

            if (!state.moduleProgress) {
                state.moduleProgress = {};
            }

            state.moduleProgress[moduleId] = clampedProgress;
            state.lastActivity = new Date().toISOString();

            var wasCompleted = state.completedModules && state.completedModules.indexOf(moduleId) !== -1;
            var isNowCompleted = clampedProgress >= 100;

            if (isNowCompleted && !wasCompleted) {
                if (!state.completedModules) {
                    state.completedModules = [];
                }
                state.completedModules.push(moduleId);
                console.log('[LearningJourneyAdapter] 🎉 Module completed:', moduleId);

                this._emit('MODULE_COMPLETED', {
                    moduleId: moduleId,
                    courseId: state.currentCourseId,
                    timestamp: Date.now()
                });
            }

            this._recalculateOverallProgress();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('LEARNING_PROGRESS_UPDATED', {
                moduleId: moduleId,
                progress: clampedProgress,
                completed: isNowCompleted,
                state: this._journeyState
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                moduleId: moduleId,
                progress: clampedProgress,
                action: 'module_progress_updated',
                state: this._journeyState
            });

            return {
                progress: clampedProgress,
                completed: isNowCompleted
            };
        },

        getModuleDetail: function(moduleId) {
            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            var module = academyRegistry ? academyRegistry.getModule(moduleId) : null;

            if (!module) {
                return null;
            }

            var progressData = this.getModuleProgress(moduleId);

            var lessons = [];
            if (academyRegistry && typeof academyRegistry.getLessonsByModule === 'function') {
                lessons = academyRegistry.getLessonsByModule(moduleId);
            }

            var completedLessons = 0;
            if (this._journeyState.completedLessons && lessons.length > 0) {
                completedLessons = lessons.filter(function(lesson) {
                    return this._journeyState.completedLessons.indexOf(lesson.id) !== -1;
                }.bind(this)).length;
            }

            return {
                ...module,
                lessons: lessons,
                progress: progressData.progress,
                completed: progressData.completed,
                totalLessons: lessons.length,
                completedLessons: completedLessons
            };
        },

        // ============================================================
        // 5. PUBLIC API — Lesson
        // ============================================================

        getModuleLessons: function(moduleId) {
            console.log('[LearningJourneyAdapter] 📖 Getting lessons for module:', moduleId);

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[LearningJourneyAdapter] AcademyRegistry not available');
                return [];
            }

            var lessons = [];
            if (typeof academyRegistry.getLessonsByModule === 'function') {
                lessons = academyRegistry.getLessonsByModule(moduleId);
            } else {
                console.warn('[LearningJourneyAdapter] getLessonsByModule not available');
                return [];
            }

            var state = this._journeyState;
            var completedLessons = state.completedLessons || [];

            return lessons.map(function(lesson, index) {
                var isCompleted = completedLessons.indexOf(lesson.id) !== -1;
                var isActive = state.currentLessonId === lesson.id;

                return {
                    id: lesson.id,
                    moduleId: lesson.moduleId || moduleId,
                    name: lesson.title || lesson.name || 'Untitled Lesson',
                    description: lesson.description || '',
                    order: lesson.order !== undefined ? lesson.order : index + 1,
                    duration: lesson.duration || 0,
                    status: lesson.status || 'draft',
                    isCompleted: isCompleted,
                    isActive: isActive,
                    _raw: lesson
                };
            });
        },

        getLessonDetail: function(lessonId) {
            console.log('[LearningJourneyAdapter] 📖 Getting lesson detail:', lessonId);

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[LearningJourneyAdapter] AcademyRegistry not available');
                return null;
            }

            var lesson = null;
            if (typeof academyRegistry.getLesson === 'function') {
                lesson = academyRegistry.getLesson(lessonId);
            }

            if (!lesson) {
                console.warn('[LearningJourneyAdapter] Lesson not found:', lessonId);
                return null;
            }

            var state = this._journeyState;
            var isCompleted = state.completedLessons && state.completedLessons.indexOf(lessonId) !== -1;
            var isActive = state.currentLessonId === lessonId;

            return {
                id: lesson.id,
                moduleId: lesson.moduleId || '',
                name: lesson.title || lesson.name || 'Untitled Lesson',
                description: lesson.description || '',
                duration: lesson.duration || 0,
                status: lesson.status || 'draft',
                content: lesson.content || '',
                isCompleted: isCompleted,
                isActive: isActive,
                _raw: lesson
            };
        },

        selectLesson: function(lessonId) {
            console.log('[LearningJourneyAdapter] 📍 Selecting lesson:', lessonId);

            var lesson = this.getLessonDetail(lessonId);
            if (!lesson) {
                console.warn('[LearningJourneyAdapter] Lesson not found:', lessonId);
                return null;
            }

            this._journeyState.currentLessonId = lessonId;
            if (lesson.moduleId) {
                this._journeyState.currentModuleId = lesson.moduleId;
            }
            this._journeyState.lastActivity = new Date().toISOString();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('LEARNING_STATE_UPDATED', {
                lessonId: lessonId,
                moduleId: lesson.moduleId,
                action: 'lesson_selected',
                state: this._journeyState
            });

            this._emit('ACADEMY_LESSON_SELECTED', {
                lessonId: lessonId,
                moduleId: lesson.moduleId,
                courseId: this._journeyState.currentCourseId
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                lessonId: lessonId,
                action: 'lesson_selected',
                state: this._journeyState
            });

            console.log('[LearningJourneyAdapter] ✅ Lesson selected:', lessonId);
            return this.getState();
        },

        // ============================================================
        // 6. PUBLIC API — Course Initialization
        // ============================================================

        initializeCourse: function(courseId, programId) {
            console.log('[LearningJourneyAdapter] 📖 Initializing course:', courseId);

            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[LearningJourneyAdapter] CourseRegistry not available');
                return null;
            }

            var course = courseRegistry.getCourse(courseId);
            if (!course) {
                console.warn('[LearningJourneyAdapter] Course not found:', courseId);
                return null;
            }

            this._journeyState.currentCourseId = courseId;
            this._journeyState.lastActivity = new Date().toISOString();

            if (!this._journeyState.progress) {
                this._journeyState.progress = 0;
            }

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('ACADEMY_LEARNING_UPDATED', {
                courseId: courseId,
                action: 'initialize',
                state: this._journeyState
            });

            console.log('[LearningJourneyAdapter] ✅ Course initialized:', courseId);
            return this.getCourseState(courseId);
        },

        // ============================================================
        // 7. PUBLIC API — Progress
        // ============================================================

        updateProgress: function(updates) {
            console.log('[LearningJourneyAdapter] 📊 Updating progress:', updates);

            var state = this._journeyState;

            if (updates.courseId) state.currentCourseId = updates.courseId;
            if (updates.moduleId) state.currentModuleId = updates.moduleId;
            if (updates.lessonId) state.currentLessonId = updates.lessonId;

            if (typeof updates.progress === 'number') {
                state.progress = Math.min(100, Math.max(0, updates.progress));
            }

            if (updates.completedLessonId) {
                if (!state.completedLessons.includes(updates.completedLessonId)) {
                    state.completedLessons.push(updates.completedLessonId);
                }
            }

            if (updates.completedModuleId) {
                if (!state.completedModules) state.completedModules = [];
                if (!state.completedModules.includes(updates.completedModuleId)) {
                    state.completedModules.push(updates.completedModuleId);
                }
            }

            if (state.progress >= 100) {
                if (state.currentCourseId && !state.completedCourses.includes(state.currentCourseId)) {
                    state.completedCourses.push(state.currentCourseId);
                }
            }

            state.lastActivity = new Date().toISOString();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('ACADEMY_LEARNING_UPDATED', {
                courseId: state.currentCourseId,
                action: 'update',
                state: this._journeyState
            });

            return this.getState();
        },

        // ============================================================
        // 8. PUBLIC API — Continue Learning
        // ============================================================

        getContinueLearning: function() {
            var state = this._journeyState;

            if (!state.currentCourseId) {
                if (state.completedCourses && state.completedCourses.length > 0) {
                    var lastCourse = state.completedCourses[state.completedCourses.length - 1];
                    return {
                        courseId: lastCourse,
                        title: 'Completed Course',
                        progress: 100,
                        isCompleted: true,
                        lastActivity: state.lastActivity
                    };
                }
                return null;
            }

            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = courseRegistry ? courseRegistry.getCourse(state.currentCourseId) : null;

            return {
                courseId: state.currentCourseId,
                title: course ? course.title : 'Current Course',
                progress: state.progress || 0,
                isCompleted: state.progress >= 100,
                lastActivity: state.lastActivity,
                lessonId: state.currentLessonId,
                moduleId: state.currentModuleId
            };
        },

        // ============================================================
        // 9. PUBLIC API — Reset & Status
        // ============================================================

        reset: function() {
            console.log('[LearningJourneyAdapter] 🔄 Resetting state...');

            this._journeyState = {
                currentCourseId: null,
                currentModuleId: null,
                currentLessonId: null,
                completedLessons: [],
                completedModules: [],
                completedCourses: [],
                moduleProgress: {},
                progress: 0,
                lastActivity: null,
                xp: 0,
                currentSessionId: null,
                sessionStatus: null,
                sessionStartedAt: null,
                sessionEndedAt: null
            };

            this._saveState();
            this._emit('ACADEMY_LEARNING_UPDATED', {
                action: 'reset',
                state: this._journeyState
            });

            return this;
        },

        getStatus: function() {
            var continueData = this.getContinueLearning();

            return {
                version: this.version,
                initialized: this.initialized,
                userId: this._userId,
                hasActiveCourse: !!this._journeyState.currentCourseId,
                hasActiveModule: !!this._journeyState.currentModuleId,
                progress: this._journeyState.progress,
                completedLessons: this._journeyState.completedLessons.length,
                completedModules: (this._journeyState.completedModules || []).length,
                completedCourses: this._journeyState.completedCourses.length,
                continueLearning: continueData,
                lastActivity: this._journeyState.lastActivity,
                hasActiveSession: this.hasActiveSession()
            };
        },

        // ============================================================
        // 10. PUBLIC API — Lesson Session
        // ============================================================

        startLessonSession: function(lessonId) {
            console.log('[LearningJourneyAdapter] 🎯 Starting lesson session:', lessonId);

            var lesson = this.getLessonDetail(lessonId);
            if (!lesson) {
                console.warn('[LearningJourneyAdapter] Lesson not found:', lessonId);
                return null;
            }

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[LearningJourneyAdapter] AcademyRegistry not available');
                return null;
            }

            var module = academyRegistry.getModule(lesson.moduleId);
            if (!module) {
                console.warn('[LearningJourneyAdapter] Module not found for lesson:', lessonId);
                return null;
            }

            var courseId = this._journeyState.currentCourseId || module.courseId || lesson.courseId;
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && courseId) {
                var course = courseRegistry.getCourse(courseId);
                if (!course) {
                    console.warn('[LearningJourneyAdapter] Course not found for lesson:', lessonId);
                }
            }

            var sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

            var session = {
                id: sessionId,
                lessonId: lessonId,
                moduleId: lesson.moduleId,
                courseId: courseId || module.courseId || '',
                status: 'active',
                startedAt: new Date().toISOString()
            };

            this._journeyState.currentLessonId = lessonId;
            this._journeyState.currentModuleId = lesson.moduleId;
            if (courseId) {
                this._journeyState.currentCourseId = courseId;
            }
            this._journeyState.currentSessionId = sessionId;
            this._journeyState.sessionStatus = 'active';
            this._journeyState.sessionStartedAt = session.startedAt;
            this._journeyState.lastActivity = new Date().toISOString();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('LEARNING_SESSION_STARTED', {
                sessionId: sessionId,
                lessonId: lessonId,
                moduleId: lesson.moduleId,
                courseId: courseId || module.courseId || '',
                startedAt: session.startedAt
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                sessionId: sessionId,
                lessonId: lessonId,
                action: 'session_started',
                state: this._journeyState
            });

            console.log('[LearningJourneyAdapter] ✅ Session started:', sessionId);
            return session;
        },

        endLessonSession: function() {
            console.log('[LearningJourneyAdapter] 🏁 Ending lesson session...');

            var state = this._journeyState;

            if (state.sessionStatus !== 'active' || !state.currentSessionId) {
                console.warn('[LearningJourneyAdapter] No active session to end');
                return null;
            }

            var sessionId = state.currentSessionId;
            var lessonId = state.currentLessonId;
            var moduleId = state.currentModuleId;
            var courseId = state.currentCourseId;

            state.sessionStatus = 'completed';
            state.sessionEndedAt = new Date().toISOString();
            state.lastActivity = new Date().toISOString();

            this._saveState();
            this._syncToLearningStateManager();

            this._emit('LEARNING_SESSION_ENDED', {
                sessionId: sessionId,
                lessonId: lessonId,
                moduleId: moduleId,
                courseId: courseId,
                endedAt: state.sessionEndedAt
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                sessionId: sessionId,
                lessonId: lessonId,
                action: 'session_ended',
                state: this._journeyState
            });

            console.log('[LearningJourneyAdapter] ✅ Session ended:', sessionId);
            return {
                sessionId: sessionId,
                status: state.sessionStatus,
                endedAt: state.sessionEndedAt
            };
        },

        getActiveSession: function() {
            var state = this._journeyState;

            if (state.sessionStatus !== 'active' || !state.currentSessionId) {
                return null;
            }

            return {
                sessionId: state.currentSessionId,
                lessonId: state.currentLessonId,
                moduleId: state.currentModuleId,
                courseId: state.currentCourseId,
                status: state.sessionStatus,
                startedAt: state.sessionStartedAt
            };
        },

        hasActiveSession: function() {
            var state = this._journeyState;
            return state.sessionStatus === 'active' && !!state.currentSessionId;
        },
        
        // ============================================================
        // 11. PUBLIC API — Motivation
        // ============================================================

        getLearningMotivation: function() {
            console.log('[LearningJourneyAdapter] 🎯 Getting learning motivation...');

            var motivation = {
                xp: 0,
                level: 1,
                streak: 0,
                achievements: [],
                achievementCount: 0,
                nextLevelXp: 100,
                xpProgress: 0
            };

            // XP / Experience Engine
            try {
                var xpEngine = window.LawAIApp?.ExperienceEngine || window.LawAIApp?.XpEngine;
                if (xpEngine) {
                    if (typeof xpEngine.getXP === 'function') {
                        motivation.xp = xpEngine.getXP() || 0;
                    }
                    if (typeof xpEngine.getLevel === 'function') {
                        motivation.level = xpEngine.getLevel() || 1;
                    }
                }
            } catch (error) {
                console.warn('[LearningJourneyAdapter] XP Engine unavailable:', error);
            }

            // Profile Engine
            try {
                var profileEngine = window.LawAIApp?.ProfileEngine;
                if (profileEngine && typeof profileEngine.getProfile === 'function') {
                    var profile = profileEngine.getProfile();
                    if (profile) {
                        if (profile.xp !== undefined) motivation.xp = profile.xp || 0;
                        if (profile.level !== undefined) motivation.level = profile.level || 1;
                        if (profile.streak !== undefined) motivation.streak = profile.streak || 0;
                    }
                }
            } catch (error) {
                console.warn('[LearningJourneyAdapter] ProfileEngine unavailable:', error);
            }

            // Achievement Engine
            try {
                var achievementEngine = window.LawAIApp?.AchievementEngine;
                if (achievementEngine) {
                    if (typeof achievementEngine.getAchievements === 'function') {
                        motivation.achievements = achievementEngine.getAchievements() || [];
                    } else if (typeof achievementEngine.getAll === 'function') {
                        motivation.achievements = achievementEngine.getAll() || [];
                    }
                }
                motivation.achievementCount = motivation.achievements.length;
            } catch (error) {
                console.warn('[LearningJourneyAdapter] AchievementEngine unavailable:', error);
            }

            // Progress Engine (Streak)
            try {
                var progressEngine = window.LawAIApp?.ProgressEngine;
                if (progressEngine && typeof progressEngine.getStreak === 'function') {
                    motivation.streak = progressEngine.getStreak() || 0;
                }
            } catch (error) {
                console.warn('[LearningJourneyAdapter] ProgressEngine unavailable:', error);
            }

            motivation.nextLevelXp = this._calculateNextLevelXp(motivation.level);
            var xpNeeded = motivation.nextLevelXp;
            motivation.xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((motivation.xp / xpNeeded) * 100)) : 0;

            console.log('[LearningJourneyAdapter] ✅ Motivation data:', motivation);
            return motivation;
        },

        _calculateNextLevelXp: function(level) {
            var baseXp = 100;
            return baseXp * (level || 1);
        },

        updateLearningMotivation: function(action, data) {
            console.log('[LearningJourneyAdapter] 🔄 Updating learning motivation:', action);

            data = data || {};

            if (action === 'lesson_completed' || action === 'module_completed') {
                var xpEngine = window.LawAIApp?.ExperienceEngine || window.LawAIApp?.XpEngine;
                if (xpEngine && typeof xpEngine.addXP === 'function') {
                    xpEngine.addXP(data.xpAmount || 10);
                }
            }

            var motivation = this.getLearningMotivation();

            this._emit('MOTIVATION_UPDATED', {
                action: action,
                data: data,
                motivation: motivation
            });

            this._emit('ACADEMY_LEARNING_UPDATED', {
                action: 'motivation_updated',
                motivation: motivation
            });

            return motivation;
        },

                /**
         * 🔥 Part 59.3: 获取下一个学习动作
         * @returns {Object} 标准化的下一个动作对象
         */
        getNextLearningAction: function() {
            console.log('[LearningJourneyAdapter] 🎯 Getting next learning action...');

            var state = this._journeyState;
            var registry = window.LawAIApp?.AcademyRegistry;
            var courseRegistry = window.LawAIApp?.CourseRegistry;

            // ============================================================
            // Priority A: Active Lesson
            // ============================================================
            if (state.currentLessonId) {
                var lesson = registry ? registry.getLesson(state.currentLessonId) : null;
                return {
                    type: 'lesson',
                    action: 'continue',
                    courseId: state.currentCourseId || null,
                    moduleId: state.currentModuleId || null,
                    lessonId: state.currentLessonId,
                    title: lesson ? (lesson.title || lesson.name || 'Current Lesson') : 'Current Lesson',
                    reason: 'active_lesson'
                };
            }

            // ============================================================
            // Priority B: Active Module
            // ============================================================
            if (state.currentModuleId) {
                var module = registry ? registry.getModule(state.currentModuleId) : null;
                return {
                    type: 'module',
                    action: 'continue',
                    courseId: state.currentCourseId || null,
                    moduleId: state.currentModuleId,
                    lessonId: null,
                    title: module ? (module.name || 'Current Module') : 'Current Module',
                    reason: 'active_module'
                };
            }

            // ============================================================
            // Priority C: Active Course
            // ============================================================
            if (state.currentCourseId) {
                var course = courseRegistry ? courseRegistry.getCourse(state.currentCourseId) : null;
                return {
                    type: 'course',
                    action: 'continue',
                    courseId: state.currentCourseId,
                    moduleId: null,
                    lessonId: null,
                    title: course ? (course.title || course.name || 'Current Course') : 'Current Course',
                    reason: 'active_course'
                };
            }

            // ============================================================
            // Priority D: Continue Learning
            // ============================================================
            var continueData = this.getContinueLearning();
            if (continueData && continueData.courseId) {
                return {
                    type: continueData.isCompleted ? 'course' : 'lesson',
                    action: continueData.isCompleted ? 'review' : 'continue',
                    courseId: continueData.courseId || null,
                    moduleId: continueData.moduleId || null,
                    lessonId: continueData.lessonId || null,
                    title: continueData.title || 'Continue Learning',
                    reason: 'continue_learning'
                };
            }

            // ============================================================
            // Priority E: First Incomplete Lesson
            // ============================================================
            var firstIncomplete = this._findFirstIncompleteLesson();
            if (firstIncomplete) {
                return {
                    type: 'lesson',
                    action: 'start',
                    courseId: firstIncomplete.courseId || null,
                    moduleId: firstIncomplete.moduleId || null,
                    lessonId: firstIncomplete.lessonId,
                    title: firstIncomplete.title || 'Start Lesson',
                    reason: 'next_incomplete_lesson'
                };
            }

            // ============================================================
            // Priority F: First Incomplete Module
            // ============================================================
            var firstModule = this._findFirstIncompleteModule();
            if (firstModule) {
                return {
                    type: 'module',
                    action: 'start',
                    courseId: firstModule.courseId || null,
                    moduleId: firstModule.moduleId,
                    lessonId: null,
                    title: firstModule.title || 'Start Module',
                    reason: 'next_incomplete_module'
                };
            }

            // ============================================================
            // Priority G: No Learning State
            // ============================================================
            return {
                type: 'none',
                action: 'none',
                courseId: null,
                moduleId: null,
                lessonId: null,
                title: null,
                reason: 'no_learning_state'
            };
        },

        // ============================================================
        // 🔥 Part 59.3: Private Helpers for Next Action
        // ============================================================

        /**
         * 查找第一个未完成的 Lesson
         * @private
         */
        _findFirstIncompleteLesson: function() {
            var state = this._journeyState;
            var courseId = state.currentCourseId;

            if (!courseId) {
                return null;
            }

            try {
                var modules = this.getCourseModules(courseId);
                if (!modules || modules.length === 0) {
                    return null;
                }

                var registry = window.LawAIApp?.AcademyRegistry;
                if (!registry) {
                    return null;
                }

                // 遍历 modules 找第一个未完成的 lesson
                for (var i = 0; i < modules.length; i++) {
                    var module = modules[i];
                    if (module.isCompleted) continue;

                    var lessons = registry.getLessonsByModule ? registry.getLessonsByModule(module.id) : [];
                    if (!lessons || lessons.length === 0) continue;

                    var completedLessons = state.completedLessons || [];
                    for (var j = 0; j < lessons.length; j++) {
                        var lesson = lessons[j];
                        if (completedLessons.indexOf(lesson.id) === -1) {
                            return {
                                courseId: courseId,
                                moduleId: module.id,
                                lessonId: lesson.id,
                                title: lesson.title || lesson.name || 'Untitled Lesson'
                            };
                        }
                    }
                }

                return null;

            } catch (error) {
                console.warn('[LearningJourneyAdapter] Error finding incomplete lesson:', error);
                return null;
            }
        },

        /**
         * 查找第一个未完成的 Module
         * @private
         */
        _findFirstIncompleteModule: function() {
            var state = this._journeyState;
            var courseId = state.currentCourseId;

            if (!courseId) {
                return null;
            }

            try {
                var modules = this.getCourseModules(courseId);
                if (!modules || modules.length === 0) {
                    return null;
                }

                for (var i = 0; i < modules.length; i++) {
                    var module = modules[i];
                    if (!module.isCompleted) {
                        return {
                            courseId: courseId,
                            moduleId: module.id,
                            title: module.name || 'Untitled Module'
                        };
                    }
                }

                return null;

            } catch (error) {
                console.warn('[LearningJourneyAdapter] Error finding incomplete module:', error);
                return null;
            }
        },

        // ============================================================
        // 12. PRIVATE — Storage
        // ============================================================

        _loadState: function() {
            try {
                var storageKey = 'lawai_learning_journey_' + this._userId;
                var saved = localStorage.getItem(storageKey);

                if (saved) {
                    var parsed = JSON.parse(saved);
                    this._journeyState = {
                        ...this._journeyState,
                        ...parsed
                    };
                    console.log('[LearningJourneyAdapter] ✅ State loaded from storage');
                }
            } catch (error) {
                console.warn('[LearningJourneyAdapter] Failed to load state:', error);
            }
        },

        _saveState: function() {
            try {
                var storageKey = 'lawai_learning_journey_' + this._userId;
                localStorage.setItem(storageKey, JSON.stringify(this._journeyState));
            } catch (error) {
                console.warn('[LearningJourneyAdapter] Failed to save state:', error);
            }
        },

        // ============================================================
        // 13. PRIVATE — Helpers
        // ============================================================

        _getCompletedLessonCount: function(moduleId) {
            var state = this._journeyState;
            if (!state.completedLessons) return 0;

            return state.completedLessons.filter(function(id) {
                return id.startsWith(moduleId + '-') || id.includes(moduleId);
            }).length;
        },

        _recalculateOverallProgress: function() {
            var state = this._journeyState;
            var courseId = state.currentCourseId;

            if (!courseId) return;

            var modules = this.getCourseModules(courseId);
            if (!modules || modules.length === 0) return;

            var totalModules = modules.length;
            var completedModules = (state.completedModules || []).filter(function(id) {
                return modules.some(function(m) { return m.id === id; });
            }).length;

            state.progress = Math.round((completedModules / totalModules) * 100);
        },

        // ============================================================
        // 14. PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            console.log('[LearningJourneyAdapter] Binding events...');

            var self = this;

            document.addEventListener('LEARNING_STATE_UPDATED', function(e) {
                var data = e.detail || {};
                console.log('[LearningJourneyAdapter] 📡 LEARNING_STATE_UPDATED received:', data);

                if (data.courseId) self._journeyState.currentCourseId = data.courseId;
                if (data.moduleId) self._journeyState.currentModuleId = data.moduleId;
                if (data.progress !== undefined) self._journeyState.progress = data.progress;

                if (data.completedLessonId) {
                    if (!self._journeyState.completedLessons.includes(data.completedLessonId)) {
                        self._journeyState.completedLessons.push(data.completedLessonId);
                    }
                }

                if (data.completedModuleId) {
                    if (!self._journeyState.completedModules) self._journeyState.completedModules = [];
                    if (!self._journeyState.completedModules.includes(data.completedModuleId)) {
                        self._journeyState.completedModules.push(data.completedModuleId);
                    }
                }

                self._saveState();
                self._emit('ACADEMY_LEARNING_UPDATED', {
                    action: 'external_update',
                    state: self._journeyState
                });
            });

            document.addEventListener('ACADEMY_VIEW_CHANGED', function(e) {
                var data = e.detail || {};
                if (data.viewMode === 'course' && data.currentCourseId) {
                    console.log('[LearningJourneyAdapter] 📡 Course opened:', data.currentCourseId);
                    self.initializeCourse(data.currentCourseId);
                }
                if (data.viewMode === 'module' && data.currentModuleId) {
                    console.log('[LearningJourneyAdapter] 📡 Module selected:', data.currentModuleId);
                    self.selectModule(data.currentModuleId, data.currentCourseId);
                }
            });

            console.log('[LearningJourneyAdapter] ✅ Events bound');
        },

        _syncToLearningStateManager: function() {
            try {
                var stateManager = window.LawAIApp?.LearningStateManager;
                if (stateManager && typeof stateManager.setState === 'function') {
                    stateManager.setState({
                        courseId: this._journeyState.currentCourseId,
                        moduleId: this._journeyState.currentModuleId,
                        lessonId: this._journeyState.currentLessonId,
                        progress: this._journeyState.progress,
                        completedLessons: this._journeyState.completedLessons,
                        completedModules: this._journeyState.completedModules || [],
                        lastActivity: this._journeyState.lastActivity
                    });
                }
            } catch (error) {
                // 忽略
            }
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {
                // 忽略
            }
        }

    };  // ← LearningJourneyAdapter 对象结束

    // ============================================================
    // 15. EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LearningJourneyAdapter = LearningJourneyAdapter;

    console.log('[LearningJourneyAdapter] Module loaded (Part 58.7)');

    // ============================================================
    // 16. AUTO INIT
    // ============================================================

    function autoInit() {
        if (!LearningJourneyAdapter.initialized) {
            LearningJourneyAdapter.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 300);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 300);
        });
    }

})();
