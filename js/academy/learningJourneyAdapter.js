// js/academy/learningJourneyAdapter.js
// Part 58.0 — Learning Journey Foundation Layer
// Law AI Academy Developer Bible
//
// PURPOSE: Bridge CourseRegistry ↔ LearningStateManager ↔ Academy UI
// RESPONSIBILITY: User learning state management

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LearningJourneyAdapter) {
        console.log('[LearningJourneyAdapter] Already exists, skipping...');
        return;
    }

    /**
     * LearningJourneyAdapter
     * 
     * 职责：
     * 1. 管理用户学习状态
     * 2. 连接 CourseRegistry 和 LearningStateManager
     * 3. 提供 Academy UI 所需的学习数据
     * 4. 监听学习状态变化事件
     */
    var LearningJourneyAdapter = {
        version: '1.0.0',
        initialized: false,

        // 用户学习状态缓存
        _journeyState: {
            currentCourseId: null,
            currentModuleId: null,
            currentLessonId: null,
            completedLessons: [],
            completedCourses: [],
            progress: 0,
            lastActivity: null,
            xp: 0
        },

        // 当前用户 ID (默认: current-user)
        _userId: 'current-user',

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Learning Journey Adapter
         */
        init: function() {
            if (this.initialized) {
                console.log('[LearningJourneyAdapter] Already initialized');
                return this;
            }

            console.log('[LearningJourneyAdapter] 🚀 Initializing...');

            // 1. 从 Storage 恢复状态
            this._loadState();

            // 2. 绑定事件
            this._bindEvents();

            this.initialized = true;

            console.log('[LearningJourneyAdapter] ✅ Initialized');
            console.log('[LearningJourneyAdapter] 📊 State:', this._journeyState);

            return this;
        },

        /**
         * 获取学习状态
         * @returns {Object}
         */
        getState: function() {
            return { ...this._journeyState };
        },

        /**
         * 获取当前 Course 的学习状态
         * @param {string} courseId
         * @returns {Object}
         */
        getCourseState: function(courseId) {
            var state = this._journeyState;

            // 如果当前课程匹配，返回完整状态
            if (state.currentCourseId === courseId) {
                return {
                    courseId: courseId,
                    progress: state.progress,
                    completedLessons: state.completedLessons,
                    currentModuleId: state.currentModuleId,
                    currentLessonId: state.currentLessonId,
                    lastActivity: state.lastActivity,
                    isActive: true
                };
            }

            // 检查是否已完成该课程
            var isCompleted = state.completedCourses && state.completedCourses.indexOf(courseId) !== -1;

            return {
                courseId: courseId,
                progress: isCompleted ? 100 : 0,
                completedLessons: [],
                currentModuleId: null,
                currentLessonId: null,
                lastActivity: null,
                isActive: false,
                isCompleted: isCompleted
            };
        },

        /**
         * 初始化 Course 学习状态
         * @param {string} courseId
         * @param {string} programId (可选)
         * @returns {Object}
         */
        initializeCourse: function(courseId, programId) {
            console.log('[LearningJourneyAdapter] 📖 Initializing course:', courseId);

            // 验证 Course 存在
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

            // 更新状态
            this._journeyState.currentCourseId = courseId;
            this._journeyState.lastActivity = new Date().toISOString();

            // 如果进度为 0，默认设置为 0
            if (!this._journeyState.progress) {
                this._journeyState.progress = 0;
            }

            // 保存状态
            this._saveState();

            // 广播事件
            this._emit('ACADEMY_LEARNING_UPDATED', {
                courseId: courseId,
                action: 'initialize',
                state: this._journeyState
            });

            // 同步到 LearningStateManager
            this._syncToLearningStateManager();

            console.log('[LearningJourneyAdapter] ✅ Course initialized:', courseId);
            return this.getCourseState(courseId);
        },

        /**
         * 更新学习进度
         * @param {Object} updates — { courseId, moduleId, lessonId, progress }
         * @returns {Object}
         */
        updateProgress: function(updates) {
            console.log('[LearningJourneyAdapter] 📊 Updating progress:', updates);

            var state = this._journeyState;

            // 更新字段
            if (updates.courseId) state.currentCourseId = updates.courseId;
            if (updates.moduleId) state.currentModuleId = updates.moduleId;
            if (updates.lessonId) state.currentLessonId = updates.lessonId;

            // 更新进度 (0-100)
            if (typeof updates.progress === 'number') {
                state.progress = Math.min(100, Math.max(0, updates.progress));
            }

            // 记录完成 lessons
            if (updates.completedLessonId) {
                if (!state.completedLessons.includes(updates.completedLessonId)) {
                    state.completedLessons.push(updates.completedLessonId);
                    console.log('[LearningJourneyAdapter] ✅ Lesson completed:', updates.completedLessonId);
                }
            }

            // 检查课程是否完成
            if (state.progress >= 100) {
                if (state.currentCourseId && !state.completedCourses.includes(state.currentCourseId)) {
                    state.completedCourses.push(state.currentCourseId);
                    console.log('[LearningJourneyAdapter] 🎉 Course completed:', state.currentCourseId);
                }
            }

            state.lastActivity = new Date().toISOString();

            // 保存状态
            this._saveState();

            // 广播事件
            this._emit('ACADEMY_LEARNING_UPDATED', {
                courseId: state.currentCourseId,
                action: 'update',
                state: this._journeyState
            });

            // 同步到 LearningStateManager
            this._syncToLearningStateManager();

            return this.getState();
        },

        /**
         * 获取 Continue Learning 数据
         * @returns {Object|null}
         */
        getContinueLearning: function() {
            var state = this._journeyState;

            // 如果没有当前课程，检查是否有已完成课程
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

            // 获取课程信息
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

        /**
         * 重置学习状态
         */
        reset: function() {
            console.log('[LearningJourneyAdapter] 🔄 Resetting state...');

            this._journeyState = {
                currentCourseId: null,
                currentModuleId: null,
                currentLessonId: null,
                completedLessons: [],
                completedCourses: [],
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

        /**
         * 获取状态摘要
         */
        getStatus: function() {
            var continueData = this.getContinueLearning();

            return {
                version: this.version,
                initialized: this.initialized,
                userId: this._userId,
                hasActiveCourse: !!this._journeyState.currentCourseId,
                progress: this._journeyState.progress,
                completedLessons: this._journeyState.completedLessons.length,
                completedCourses: this._journeyState.completedCourses.length,
                continueLearning: continueData,
                lastActivity: this._journeyState.lastActivity
            };
        },

        // ============================================================
        // 2. PRIVATE — Storage
        // ============================================================

        /**
         * 从 Storage 加载状态
         */
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
                } else {
                    console.log('[LearningJourneyAdapter] No saved state found, using defaults');
                }
            } catch (error) {
                console.warn('[LearningJourneyAdapter] Failed to load state:', error);
            }
        },

        /**
         * 保存状态到 Storage
         */
        _saveState: function() {
            try {
                var storageKey = 'lawai_learning_journey_' + this._userId;
                localStorage.setItem(storageKey, JSON.stringify(this._journeyState));
            } catch (error) {
                console.warn('[LearningJourneyAdapter] Failed to save state:', error);
            }
        },

        // ============================================================
        // 3. PRIVATE — Events
        // ============================================================

        /**
         * 绑定事件
         */
        _bindEvents: function() {
            console.log('[LearningJourneyAdapter] Binding events...');

            var self = this;

            // 监听 LEARNING_STATE_UPDATED
            document.addEventListener('LEARNING_STATE_UPDATED', function(e) {
                var data = e.detail || {};
                console.log('[LearningJourneyAdapter] 📡 LEARNING_STATE_UPDATED received:', data);

                // 更新本地状态
                if (data.courseId) {
                    self._journeyState.currentCourseId = data.courseId;
                }
                if (data.progress !== undefined) {
                    self._journeyState.progress = data.progress;
                }
                if (data.completedLessonId) {
                    if (!self._journeyState.completedLessons.includes(data.completedLessonId)) {
                        self._journeyState.completedLessons.push(data.completedLessonId);
                    }
                }

                self._saveState();
                self._emit('ACADEMY_LEARNING_UPDATED', {
                    action: 'external_update',
                    state: self._journeyState
                });
            });

            // 监听 ACADEMY_VIEW_CHANGED
            document.addEventListener('ACADEMY_VIEW_CHANGED', function(e) {
                var data = e.detail || {};
                if (data.viewMode === 'course' && data.currentCourseId) {
                    console.log('[LearningJourneyAdapter] 📡 Course opened, initializing:', data.currentCourseId);
                    self.initializeCourse(data.currentCourseId);
                }
            });

            console.log('[LearningJourneyAdapter] ✅ Events bound');
        },

        /**
         * 同步到 LearningStateManager
         */
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
                        lastActivity: this._journeyState.lastActivity
                    });
                    console.log('[LearningJourneyAdapter] ✅ Synced to LearningStateManager');
                }
            } catch (error) {
                // 忽略，LearningStateManager 可能不存在
            }
        },

        /**
         * 广播事件
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
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LearningJourneyAdapter = LearningJourneyAdapter;

    console.log('[LearningJourneyAdapter] Module loaded (Part 58.0)');

    // 自动初始化
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
