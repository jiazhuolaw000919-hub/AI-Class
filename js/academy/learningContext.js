// js/academy/learningContext.js
// Part 59.1 — Learning Context Foundation
// Law AI Academy Developer Bible
//
// PURPOSE: Lightweight read-only context layer for Academy Experience Intelligence
// RESPONSIBILITY: Aggregate existing learning information into coherent context
// OWNERSHIP: OBSERVES only — does NOT own authoritative state

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearningContext) {
        console.log('[LearningContext] Already exists, skipping...');
        return;
    }

    /**
     * LearningContext
     *
     * 轻量级只读上下文层
     * 聚合现有的 Academy 学习信息
     * 
     * 回答："学习者当前在 Academy 中发生了什么？"
     * 
     * 不拥有权威状态，仅聚合/解释
     */
    var LearningContext = {
        version: '1.0.0',
        initialized: false,

        _context: {
            school: null,
            program: null,
            course: null,
            module: null,
            lesson: null,

            progress: {
                course: 0,
                module: 0
            },

            session: null,

            motivation: {
                xp: 0,
                level: 1,
                streak: 0,
                achievementCount: 0
            },

            status: {
                hasActiveCourse: false,
                hasActiveModule: false,
                hasActiveLesson: false,
                hasActiveSession: false
            },

            lastActivity: null,
            timestamp: null
        },

        _initialized: false,
        _refreshPending: false,

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Learning Context
         */
        init: function() {
            if (this._initialized) {
                console.log('[LearningContext] Already initialized');
                return this;
            }

            console.log('[LearningContext] 🚀 Initializing...');

            try {
                // 1. 构建初始上下文
                this._buildContext();

                // 2. 绑定事件
                this._bindEvents();

                this._initialized = true;

                console.log('[LearningContext] ✅ Initialized');

                // 3. 发射初始化事件
                this._emit('LEARNING_CONTEXT_INITIALIZED', {
                    version: this.version,
                    context: this.getContext()
                });

            } catch (error) {
                console.warn('[LearningContext] Initialization error:', error);
                // 即使出错，也标记为已初始化（降级）
                this._initialized = true;
            }

            return this;
        },

        /**
         * 获取完整上下文
         */
        getContext: function() {
            // 如果 pending，先刷新
            if (this._refreshPending) {
                this._buildContext();
            }
            return { ...this._context };
        },

        /**
         * 刷新上下文
         */
        refresh: function() {
            console.log('[LearningContext] 🔄 Refreshing...');
            this._buildContext();

            this._emit('LEARNING_CONTEXT_UPDATED', {
                context: this.getContext(),
                timestamp: Date.now()
            });

            return this;
        },

        /**
         * 获取当前 Course
         */
        getCurrentCourse: function() {
            return this._context.course;
        },

        /**
         * 获取当前 Module
         */
        getCurrentModule: function() {
            return this._context.module;
        },

        /**
         * 获取当前 Lesson
         */
        getCurrentLesson: function() {
            return this._context.lesson;
        },

        /**
         * 获取进度
         */
        getProgress: function() {
            return { ...this._context.progress };
        },

        /**
         * 获取 Session
         */
        getSession: function() {
            return this._context.session ? { ...this._context.session } : null;
        },

        /**
         * 获取 Motivation
         */
        getMotivation: function() {
            return { ...this._context.motivation };
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this._initialized,
                hasContext: !!this._context.course || !!this._context.lesson,
                hasActiveCourse: this._context.status.hasActiveCourse,
                hasActiveModule: this._context.status.hasActiveModule,
                hasActiveLesson: this._context.status.hasActiveLesson,
                hasActiveSession: this._context.status.hasActiveSession
            };
        },

        // ============================================================
        // 2. PRIVATE — Context Building
        // ============================================================

        /**
         * 构建上下文
         */
        _buildContext: function() {
            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;

                if (!adapter) {
                    console.warn('[LearningContext] LearningJourneyAdapter not available');
                    this._context = this._getEmptyContext();
                    return;
                }

                // 1. 获取学习状态
                var state = adapter.getState ? adapter.getState() : null;
                var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;

                // 2. 获取 Session
                var session = adapter.getActiveSession ? adapter.getActiveSession() : null;

                // 3. 获取 Motivation
                var motivation = adapter.getLearningMotivation ? adapter.getLearningMotivation() : null;

                // 4. 获取 Course/Module/Lesson 元数据
                var course = this._getCourseMetadata(state);
                var module = this._getModuleMetadata(state);
                var lesson = this._getLessonMetadata(state);

                // 5. 构建上下文
                this._context = {
                    school: null, // 暂不实现 School 元数据
                    program: null, // 暂不实现 Program 元数据
                    course: course,
                    module: module,
                    lesson: lesson,

                    progress: {
                        course: state ? state.progress || 0 : 0,
                        module: this._getModuleProgress(state)
                    },

                    session: session,

                    motivation: motivation || {
                        xp: 0,
                        level: 1,
                        streak: 0,
                        achievementCount: 0
                    },

                    status: {
                        hasActiveCourse: !!state?.currentCourseId,
                        hasActiveModule: !!state?.currentModuleId,
                        hasActiveLesson: !!state?.currentLessonId,
                        hasActiveSession: !!(session && session.status === 'active')
                    },

                    lastActivity: state?.lastActivity || null,
                    timestamp: Date.now()
                };

                this._refreshPending = false;

                console.log('[LearningContext] ✅ Context built');

            } catch (error) {
                console.warn('[LearningContext] Build context error:', error);
                this._context = this._getEmptyContext();
            }
        },

        /**
         * 获取 Course 元数据
         */
        _getCourseMetadata: function(state) {
            if (!state || !state.currentCourseId) {
                return null;
            }

            try {
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (!courseRegistry) {
                    return { id: state.currentCourseId };
                }

                var course = courseRegistry.getCourse(state.currentCourseId);
                if (course) {
                    return {
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        programId: course.programId
                    };
                }

                return { id: state.currentCourseId };

            } catch (error) {
                return { id: state.currentCourseId };
            }
        },

        /**
         * 获取 Module 元数据
         */
        _getModuleMetadata: function(state) {
            if (!state || !state.currentModuleId) {
                return null;
            }

            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (!adapter) {
                    return { id: state.currentModuleId };
                }

                var module = adapter.getModuleDetail ? adapter.getModuleDetail(state.currentModuleId) : null;
                if (module) {
                    return {
                        id: module.id,
                        name: module.name,
                        description: module.description,
                        progress: module.progress || 0,
                        completed: module.completed || false
                    };
                }

                return { id: state.currentModuleId };

            } catch (error) {
                return { id: state.currentModuleId };
            }
        },

        /**
         * 获取 Lesson 元数据
         */
        _getLessonMetadata: function(state) {
            if (!state || !state.currentLessonId) {
                return null;
            }

            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (!adapter) {
                    return { id: state.currentLessonId };
                }

                var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(state.currentLessonId) : null;
                if (lesson) {
                    return {
                        id: lesson.id,
                        name: lesson.name,
                        description: lesson.description,
                        duration: lesson.duration,
                        isCompleted: lesson.isCompleted || false
                    };
                }

                return { id: state.currentLessonId };

            } catch (error) {
                return { id: state.currentLessonId };
            }
        },

        /**
         * 获取 Module 进度
         */
        _getModuleProgress: function(state) {
            if (!state || !state.currentModuleId) {
                return 0;
            }

            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (!adapter) {
                    return 0;
                }

                var progress = adapter.getModuleProgress ? adapter.getModuleProgress(state.currentModuleId) : null;
                return progress ? progress.progress || 0 : 0;

            } catch (error) {
                return 0;
            }
        },

        /**
         * 获取空上下文
         */
        _getEmptyContext: function() {
            return {
                school: null,
                program: null,
                course: null,
                module: null,
                lesson: null,

                progress: {
                    course: 0,
                    module: 0
                },

                session: null,

                motivation: {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    achievementCount: 0
                },

                status: {
                    hasActiveCourse: false,
                    hasActiveModule: false,
                    hasActiveLesson: false,
                    hasActiveSession: false
                },

                lastActivity: null,
                timestamp: Date.now()
            };
        },

        // ============================================================
        // 3. PRIVATE — Events
        // ============================================================

        /**
         * 绑定事件
         */
        _bindEvents: function() {
            console.log('[LearningContext] Binding events...');

            var self = this;

            // 监听学习状态更新
            document.addEventListener('ACADEMY_LEARNING_UPDATED', function() {
                console.log('[LearningContext] 📡 ACADEMY_LEARNING_UPDATED received');
                self.refresh();
            });

            document.addEventListener('LEARNING_STATE_UPDATED', function() {
                console.log('[LearningContext] 📡 LEARNING_STATE_UPDATED received');
                self.refresh();
            });

            document.addEventListener('LEARNING_PROGRESS_UPDATED', function() {
                console.log('[LearningContext] 📡 LEARNING_PROGRESS_UPDATED received');
                self.refresh();
            });

            document.addEventListener('LEARNING_SESSION_STARTED', function() {
                console.log('[LearningContext] 📡 LEARNING_SESSION_STARTED received');
                self.refresh();
            });

            document.addEventListener('LEARNING_SESSION_ENDED', function() {
                console.log('[LearningContext] 📡 LEARNING_SESSION_ENDED received');
                self.refresh();
            });

            document.addEventListener('MOTIVATION_UPDATED', function() {
                console.log('[LearningContext] 📡 MOTIVATION_UPDATED received');
                self.refresh();
            });

            document.addEventListener('ACADEMY_VIEW_CHANGED', function(e) {
                var data = e.detail || {};
                // 只在 Course/Module/Lesson 视图变化时刷新
                if (data.viewMode === 'course' || data.viewMode === 'module' || data.viewMode === 'lesson') {
                    console.log('[LearningContext] 📡 ACADEMY_VIEW_CHANGED received');
                    self.refresh();
                }
            });

            console.log('[LearningContext] ✅ Events bound');
        },

        /**
         * 发射事件
         */
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

    };  // ← LearningContext 对象结束

    // ============================================================
    // 4. EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LearningContext = LearningContext;

    console.log('[LearningContext] Module loaded (Part 59.1)');

    // ============================================================
    // 5. AUTO INIT
    // ============================================================

    function autoInit() {
        if (!LearningContext._initialized) {
            LearningContext.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

})();
