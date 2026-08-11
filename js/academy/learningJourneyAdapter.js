// js/academy/learningJourneyAdapter.js
// Part 58.2 — Learning Module Structure Connection Layer
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearningJourneyAdapter) {
        console.log('[LearningJourneyAdapter] Already exists, skipping...');
        return;
    }

    var LearningJourneyAdapter = {
        version: '1.0.0',
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
            xp: 0
        },

        _userId: 'current-user',

        // ============================================================
        // 1. PUBLIC API
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

        /**
         * 🔥 Part 58.2: 获取 Course 的 Modules (含进度)
         */
        getCourseModules: function(courseId) {
            console.log('[LearningJourneyAdapter] 📋 Getting modules for course:', courseId);

            // 从 CurriculumRegistry 获取 Module 列表
            var curriculumRegistry = window.LawAIApp?.CurriculumRegistry;
            if (!curriculumRegistry) {
                console.warn('[LearningJourneyAdapter] CurriculumRegistry not available');
                return [];
            }

            // 获取 Course 的 Module 列表 (通过 CurriculumRegistry)
            var modules = [];
            if (typeof curriculumRegistry.getCourseModules === 'function') {
                modules = curriculumRegistry.getCourseModules(courseId);
            } else {
                // Fallback: 从 CourseRegistry 获取 Course 结构
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.getCourseStructure === 'function') {
                    var course = courseRegistry.getCourseStructure(courseId);
                    if (course && course.modules) {
                        modules = course.modules;
                    }
                }
            }

            // 为每个 Module 添加进度信息
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

        /**
         * 🔥 Part 58.2: 选择 Module
         */
        selectModule: function(moduleId, courseId) {
            console.log('[LearningJourneyAdapter] 📍 Selecting module:', moduleId);

            // 验证 Module 存在
            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (academyRegistry && typeof academyRegistry.getModule === 'function') {
                var module = academyRegistry.getModule(moduleId);
                if (!module) {
                    console.warn('[LearningJourneyAdapter] Module not found:', moduleId);
                    return null;
                }
            }

            // 更新状态
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

        /**
         * 🔥 Part 58.4: 获取 Module 进度
         * @param {string} moduleId
         * @returns {Object} { progress: number, completed: boolean }
         */
        getModuleProgress: function(moduleId) {
            var state = this._journeyState;
            var progress = state.moduleProgress && state.moduleProgress[moduleId] ? state.moduleProgress[moduleId] : 0;
            var completed = state.completedModules && state.completedModules.indexOf(moduleId) !== -1;

            return {
                progress: completed ? 100 : progress,
                completed: completed
            };
        },

        /**
         * 🔥 Part 58.4: 更新 Module 进度
         * @param {string} moduleId
         * @param {number} progress — 0-100
         * @returns {Object} 更新后的状态
         */
        updateModuleProgress: function(moduleId, progress) {
            console.log('[LearningJourneyAdapter] 📊 Updating module progress:', moduleId, progress);

            var state = this._journeyState;
            var clampedProgress = Math.min(100, Math.max(0, progress));

            // 初始化 moduleProgress
            if (!state.moduleProgress) {
                state.moduleProgress = {};
            }

            // 更新进度
            state.moduleProgress[moduleId] = clampedProgress;
            state.lastActivity = new Date().toISOString();

            // 检查是否完成
            var wasCompleted = state.completedModules && state.completedModules.indexOf(moduleId) !== -1;
            var isNowCompleted = clampedProgress >= 100;

            if (isNowCompleted && !wasCompleted) {
                if (!state.completedModules) {
                    state.completedModules = [];
                }
                state.completedModules.push(moduleId);
                console.log('[LearningJourneyAdapter] 🎉 Module completed:', moduleId);

                // 发射 MODULE_COMPLETED 事件
                this._emit('MODULE_COMPLETED', {
                    moduleId: moduleId,
                    courseId: state.currentCourseId,
                    timestamp: Date.now()
                });
            }

            // 重新计算整体进度
            this._recalculateOverallProgress();

            // 保存状态
            this._saveState();
            this._syncToLearningStateManager();

            // 广播事件
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

        /**
         * 🔥 Part 58.4: 获取 Module 详情 (含进度)
         * @param {string} moduleId
         * @returns {Object|null}
         */
        getModuleDetail: function(moduleId) {
            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            var module = academyRegistry ? academyRegistry.getModule(moduleId) : null;

            if (!module) {
                return null;
            }

            var progressData = this.getModuleProgress(moduleId);

            // 获取 Lessons
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

        /**
         * 🔥 Part 58.5: 获取 Module 的所有 Lessons
         */
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

        /**
         * 🔥 Part 58.5: 获取单个 Lesson 详情
         */
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

        /**
         * 🔥 Part 58.5: 选择 Lesson
         */
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
                xp: 0
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
                lastActivity: this._journeyState.lastActivity
            };
        },

        // ============================================================
        // 2. PRIVATE — Storage
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
        // 3. PRIVATE — Helpers
        // ============================================================

        _getCompletedLessonCount: function(moduleId) {
            var state = this._journeyState;
            if (!state.completedLessons) return 0;

            // 这里假设 lessons 的 ID 格式包含 moduleId
            // 实际实现可能需要从 LessonRegistry 获取
            return state.completedLessons.filter(function(id) {
                return id.startsWith(moduleId + '-') || id.includes(moduleId);
            }).length;
        },

        _recalculateOverallProgress: function() {
            var state = this._journeyState;
            var courseId = state.currentCourseId;

            if (!courseId) return;

            // 获取 Course 的 Modules
            var modules = this.getCourseModules(courseId);
            if (!modules || modules.length === 0) return;

            var totalModules = modules.length;
            var completedModules = (state.completedModules || []).filter(function(id) {
                return modules.some(function(m) { return m.id === id; });
            }).length;

            state.progress = Math.round((completedModules / totalModules) * 100);
        },

        // ============================================================
        // 4. PRIVATE — Events
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
            } catch (error) {}
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {}
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LearningJourneyAdapter = LearningJourneyAdapter;

    console.log('[LearningJourneyAdapter] Module loaded (Part 58.2)');

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
