// js/academy/academyExperienceManager.js
// Part 58.1 — Course Learning Entry Layer
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
        console.log('[AcademyExperienceManager] Already exists, skipping...');
        return;
    }

    // ============================================================
    // 🔥 FALLBACK DATA
    // ============================================================
    var FALLBACK_SCHOOLS = [
        {
            id: 'school-science',
            name: 'School of Science',
            icon: '🔬',
            description: 'Explore the fundamentals of science and technology',
            programs: []
        },
        {
            id: 'school-business',
            name: 'School of Business',
            icon: '💼',
            description: 'Master business strategies and leadership',
            programs: []
        },
        {
            id: 'school-art',
            name: 'School of Art',
            icon: '🎨',
            description: 'Unleash your creativity and artistic expression',
            programs: []
        }
    ];

    var AcademyExperienceManager = {
        version: '6.2.1',
        initialized: false,
        mounted: false,
        status: 'pending',

        _state: {
            currentSchoolId: null,
            currentProgramId: null,
            currentCourseId: null,
            currentModuleId: null,
            currentSubjectId: null,
            currentLessonId: null,
            viewMode: 'dashboard',
            sessionStatus: null,
            currentSessionId: null
        },

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        init: function(options) {
            if (this.initialized) {
                console.log('[AcademyExperienceManager] Already initialized');
                return this;
            }

            console.log('[AcademyExperienceManager] 🚀 Initializing...');

            try {
              
                this._initLayers();
                this._bindEvents();
                this.mount();

                this.initialized = true;
                this.status = 'ready';

                this._emit('ACADEMY_EXPERIENCE_READY', {
                    version: this.version,
                    timestamp: Date.now()
                });

                console.log('[AcademyExperienceManager] ✅ Initialized, viewMode:', this._state.viewMode);

            } catch (error) {
                console.error('[AcademyExperienceManager] Init failed:', error);
                this.status = 'failed';
            }

            return this;
        },
       
        mount: function() {
            if (this.mounted) {
                console.log('[AcademyExperienceManager] Already mounted');
                return this;
            }

            console.log('[AcademyExperienceManager] 📍 Mounting...');

            var container = document.getElementById('academy-root');
            if (!container) {
                container = this._createContainer();
            }

            this.render();
            this.mounted = true;

            console.log('[AcademyExperienceManager] ✅ Mounted');
            return this;
        },

        render: function() {
            console.log('[AcademyExperienceManager] 🎨 Rendering viewMode:', this._state.viewMode);

            var container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[AcademyExperienceManager] #academy-root not found');
                return this;
            }

            var data = this._getRenderData();

            if (window.LawAIApp && window.LawAIApp.AcademyView && typeof window.LawAIApp.AcademyView.render === 'function') {
                window.LawAIApp.AcademyView.render(data);
            } else {
                this._renderFallback(container, data);
            }

            return this;
        },

        refresh: function() {
            console.log('[AcademyExperienceManager] 🔄 Refreshing...');
            this.render();
            this._emit('ACADEMY_REFRESH', { timestamp: Date.now() });
            return this;
        },

        navigateToSchool: function(schoolId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to school:', schoolId);

            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (!schoolRegistry) {
                console.warn('[AcademyExperienceManager] SchoolRegistry not available, using fallback');
                // 从 fallback 中查找
                var fallbackSchool = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
                if (fallbackSchool) {
                    this._state.currentSchoolId = schoolId;
                    this._state.currentProgramId = null;
                    this._state.currentCourseId = null;
                    this._state.currentModuleId = null;
                    this._state.currentSubjectId = null;
                    this._state.currentLessonId = null;
                    this._state.viewMode = 'school';
                    this.render();
                    this._emit('ACADEMY_VIEW_CHANGED', {
                        viewMode: 'school',
                        currentSchoolId: schoolId
                    });
                }
                return this;
            }

            var school = schoolRegistry.getSchool ? schoolRegistry.getSchool(schoolId) : null;
            if (!school) {
                // 尝试从 fallback 中查找
                var fallbackSchool = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
                if (fallbackSchool) {
                    this._state.currentSchoolId = schoolId;
                    this._state.currentProgramId = null;
                    this._state.currentCourseId = null;
                    this._state.currentModuleId = null;
                    this._state.currentSubjectId = null;
                    this._state.currentLessonId = null;
                    this._state.viewMode = 'school';
                    this.render();
                    this._emit('ACADEMY_VIEW_CHANGED', {
                        viewMode: 'school',
                        currentSchoolId: schoolId
                    });
                } else {
                    console.warn('[AcademyExperienceManager] School not found:', schoolId);
                }
                return this;
            }

            this._state.currentSchoolId = schoolId;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'school';

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'school',
                currentSchoolId: schoolId
            });

            return this;
        },

        navigateToProgram: function(programId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);

            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (!programRegistry) {
                console.warn('[AcademyExperienceManager] ProgramRegistry not available');
                return this;
            }

            var program = programRegistry.getProgram ? programRegistry.getProgram(programId) : null;
            if (!program) {
                console.warn('[AcademyExperienceManager] Program not found:', programId);
                return this;
            }

            this._state.currentProgramId = programId;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'program';

            if (!this._state.currentSchoolId && program.schoolId) {
                this._state.currentSchoolId = program.schoolId;
            }

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'program',
                currentProgramId: programId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        navigateToCourse: function(courseId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to course:', courseId);

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            this._state.currentCourseId = courseId;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'course';

            if (!this._state.currentProgramId && course.programId) {
                this._state.currentProgramId = course.programId;
            }

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'course',
                currentCourseId: courseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        startCourse: function(courseId) {
            console.log('[AcademyExperienceManager] 🚀 Starting course:', courseId);

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            this._state.currentCourseId = courseId;
            this._state.currentSubjectId = null;
            this._state.viewMode = 'course-learning';

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.initializeCourse === 'function') {
                adapter.initializeCourse(courseId);
                console.log('[AcademyExperienceManager] ✅ Learning journey initialized');
            }

            this._emit('COURSE_STARTED', {
                courseId: courseId,
                title: course.title
            });

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'course-learning',
                currentCourseId: courseId
            });

            console.log('[AcademyExperienceManager] ✅ Course started:', courseId);
            return this;
        },

        selectModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Selecting module:', moduleId);

            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                console.warn('[AcademyExperienceManager] Module not found:', moduleId);
                return this;
            }

            this._state.currentModuleId = moduleId;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'module';

            if (!this._state.currentCourseId && module.courseId) {
                this._state.currentCourseId = module.courseId;
            }

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.selectModule === 'function') {
                adapter.selectModule(moduleId, this._state.currentCourseId);
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'module',
                currentModuleId: moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Module selected:', moduleId);
            return this;
        },

        selectLesson: function(lessonId) {
            console.log('[AcademyExperienceManager] 📍 Selecting lesson:', lessonId);

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                console.warn('[AcademyExperienceManager] Lesson not found:', lessonId);
                return this;
            }

            this._state.currentLessonId = lessonId;
            this._state.currentModuleId = lesson.moduleId || this._state.currentModuleId;
            this._state.currentSubjectId = null;
            this._state.viewMode = 'lesson';

            if (!this._state.currentCourseId && lesson.courseId) {
                this._state.currentCourseId = lesson.courseId;
            }

            if (adapter && typeof adapter.selectLesson === 'function') {
                adapter.selectLesson(lessonId);
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: lessonId,
                currentModuleId: lesson.moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Lesson selected:', lessonId);
            return this;
        },

        startLesson: function(lessonId) {
            console.log('[AcademyExperienceManager] 🚀 Starting lesson:', lessonId);

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                console.warn('[AcademyExperienceManager] Lesson not found:', lessonId);
                return this;
            }

            var session = adapter.startLessonSession ? adapter.startLessonSession(lessonId) : null;
            if (!session) {
                console.warn('[AcademyExperienceManager] Failed to start session');
                return this;
            }

            this._state.currentLessonId = lessonId;
            this._state.currentModuleId = lesson.moduleId || this._state.currentModuleId;
            this._state.viewMode = 'lesson';
            this._state.sessionStatus = 'active';
            this._state.currentSessionId = session.id;

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: lessonId,
                currentModuleId: lesson.moduleId,
                currentCourseId: this._state.currentCourseId,
                sessionStatus: 'active',
                currentSessionId: session.id
            });

            console.log('[AcademyExperienceManager] ✅ Lesson started:', lessonId);
            return this;
        },

        endLessonSession: function() {
            console.log('[AcademyExperienceManager] 🏁 Ending lesson session...');

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var result = adapter.endLessonSession ? adapter.endLessonSession() : null;
            if (!result) {
                console.warn('[AcademyExperienceManager] No active session to end');
                return this;
            }

            this._state.sessionStatus = 'completed';
            this._state.currentSessionId = null;

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: this._state.currentLessonId,
                sessionStatus: 'completed'
            });

            console.log('[AcademyExperienceManager] ✅ Session ended');
            return this;
        },

        navigateToModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to module:', moduleId);

            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                console.warn('[AcademyExperienceManager] Module not found:', moduleId);
                return this;
            }

            this._state.currentModuleId = moduleId;
            this._state.currentLessonId = null;
            this._state.viewMode = 'module';

            if (!this._state.currentCourseId && module.courseId) {
                this._state.currentCourseId = module.courseId;
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'module',
                currentModuleId: moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Navigated to module:', moduleId);
            return this;
        },

        navigateToSubject: function(subjectId) {
            if (!subjectId) {
                console.warn('[AcademyExperienceManager] navigateToSubject: subjectId required');
                return this;
            }

            var subjectRegistry = window.LawAIApp && window.LawAIApp.SubjectRegistry;
            var subject = subjectRegistry && subjectRegistry.getSubject ? subjectRegistry.getSubject(subjectId) : null;

            if (!subject) {
                console.warn('[AcademyExperienceManager] Subject not found:', subjectId);
                return this;
            }

            this._state.currentSubjectId = subjectId;
            this._state.currentCourseId = subject.courseId || this._state.currentCourseId;
            this._state.currentModuleId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'subject';

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'subject',
                currentSubjectId: subjectId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        continueLearning: function() {
            console.log('[AcademyExperienceManager] 📖 Continuing learning...');

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var continueData = adapter && adapter.getContinueLearning ? adapter.getContinueLearning() : null;

            if (continueData && continueData.courseId) {
                this.startCourse(continueData.courseId);
            } else {
                var schools = this._getSchools();
                if (schools && schools.length > 0) {
                    this.navigateToSchool(schools[0].id);
                }
            }

            return this;
        },

        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                mounted: this.mounted,
                status: this.status,
                state: this._state
            };
        },

        getCurrentLearningContext: function() {
            return {
                schoolId: this._state.currentSchoolId,
                programId: this._state.currentProgramId,
                courseId: this._state.currentCourseId,
                moduleId: this._state.currentModuleId,
                lessonId: this._state.currentLessonId,
                viewMode: this._state.viewMode,
                lastActivity: new Date().toISOString()
            };
        },

        goHome: function() {
            console.log('[AcademyExperienceManager] 🏠 Going home...');

            this._state.currentSchoolId = null;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'dashboard';

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'dashboard'
            });

            return this;
        },

        navigateToNotes: function() {
            console.log('[AcademyExperienceManager] 📝 Navigating to Notes');
            this._state.viewMode = 'notes';
            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'notes'
            });
            return this;
        },

        // ============================================================
        // 🔥 Part 51: Learning Experience Intelligence Bridge
        // ============================================================

        /**
         * 构建学习者体验视图模型
         * @param {Object} options - 配置选项
         * @returns {Object} 体验视图模型
         */
        buildExperienceViewModel: function(options) {
            options = options || {};
    
            var vm = {
                learner: this._getLearnerIdentity(),
                currentLearning: this._getCurrentLearning(),
                progress: this._getProgressExperience(),
                recommendations: this._getRecommendationExperience(),
                insights: this._getInsightExperience(),
                recentActivity: this._getRecentActivityExperience(),
                upcoming: this._getUpcomingExperience(),
                notes: this._getNotesExperience(),
                achievements: this._getAchievementsExperience(),
                schools: this._getSchoolsExperience(),
                context: this._getExperienceContext(),
                _meta: {
                    generatedAt: Date.now(),
                    version: '1.0.0',
                    quality: 'FULL'
                }
            };
    
            // 计算质量
            var qualityScore = 0;
            var totalComponents = 0;
            for (var key in vm) {
                if (key === '_meta') continue;
                totalComponents++;
                if (vm[key] && (typeof vm[key] !== 'object' || Object.keys(vm[key]).length > 0)) {
                    qualityScore++;
                }
            }
            var ratio = totalComponents > 0 ? qualityScore / totalComponents : 0;
            vm._meta.quality = ratio >= 0.7 ? 'FULL' : ratio >= 0.4 ? 'PARTIAL' : 'DEGRADED';
    
            return vm;
        },

        /**
         * 获取体验上下文
         * @returns {Object} 体验上下文
         */
        _getExperienceContext: function() {
            var context = {
                currentSchoolId: this._state.currentSchoolId,
                currentCourseId: this._state.currentCourseId,
                currentSubjectId: this._state.currentSubjectId,
                currentLessonId: this._state.currentLessonId,
                viewMode: this._state.viewMode,
                hasActiveSession: !!this._state.currentSessionId
            };    
    
            // 从 LearningJourneyAdapter 补充
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                var state = adapter.getState();
                context.currentSchoolId = context.currentSchoolId || state.currentSchoolId;
                context.currentCourseId = context.currentCourseId || state.currentCourseId;
                context.currentSubjectId = context.currentSubjectId || state.currentSubjectId;
                context.currentLessonId = context.currentLessonId || state.currentLessonId;
                context.progress = state.progress || 0;
                context.lastActivity = state.lastActivity || null;
            }
    
            return context;
        },

        /**
         * 获取学习者身份
         * @returns {Object} 学习者身份信息
         */
        _getLearnerIdentity: function() {
            var identity = {
                id: 'default-learner',
                name: 'Learner',
                avatar: null
            };
    
            try {
                var profile = window.LawAIApp?.ProfileEngine;
                if (profile && typeof profile.get === 'function') {
                    var p = profile.get();
                    if (p) {
                        identity.id = p.userId || 'default-learner';
                        identity.name = p.name || 'Learner';
                        identity.avatar = p.avatar || null;
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return identity;
        },

        /**
         * 获取当前学习内容
         * @returns {Object} 当前学习信息
         */
        _getCurrentLearning: function() {
            var result = {
                hasCurrentLearning: false,
                type: null,
                id: null,
                title: null,
                description: null,
                progress: 0
            };
    
                // 1. 检查当前 Lesson
            var lessonId = this._state.currentLessonId;
            if (lessonId) {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getLessonDetail === 'function') {
                    var lesson = adapter.getLessonDetail(lessonId);
                    if (lesson) {
                        result.hasCurrentLearning = true;
                        result.type = 'lesson';
                        result.id = lessonId;
                        result.title = lesson.name || 'Current Lesson';
                        result.description = lesson.description || '';
                        result.progress = lesson.isCompleted ? 100 : 50;
                        return result;
                    }
                }
            }
    
            // 2. 检查 Continue Learning
            var continueData = this._getContinueLearning();
            if (continueData && continueData.courseId) {
                result.hasCurrentLearning = true;
                result.type = continueData.isCompleted ? 'course' : 'course';
                result.id = continueData.courseId;
                result.title = continueData.title || 'Current Course';
                result.description = continueData.isCompleted ? 'Completed' : 'In progress';
                result.progress = continueData.progress || 0;
                return result;
            }
    
            return result;
        },

        /**
         * 获取推荐体验数据
         * @param {number} limit - 推荐数量限制
         * @returns {Array} 推荐体验列表
         */
        _getRecommendationExperience: function(limit) {
            limit = limit || 3;
            var recs = [];
    
            try {
                var engine = window.LawAIApp?.RecommendationEngine;
                if (engine && typeof engine.getActiveRecommendations === 'function') {
                    var active = engine.getActiveRecommendations();
                    if (active && active.length > 0) {
                        var top = active.slice(0, limit);
                        for (var i = 0; i < top.length; i++) {
                            var r = top[i];
                            recs.push({
                                id: r.id || r.recommendationId,
                                title: r.reason || 'Recommended',
                                description: r.reason || 'Based on your learning progress',
                                targetId: r.targetId,
                                targetType: r.targetType || 'KNOWLEDGE',
                                priority: r.priorityScore >= 70 ? 'HIGH' : 
                                          r.priorityScore >= 40 ? 'MEDIUM' : 'LOW',
                                explanation: this._getRecommendationExplanation(r)
                            });
                        }
                        return recs;
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            // Fallback: 从 AdaptiveLearning 获取
            try {
                var al = window.LawAIApp?.AdaptiveLearning;
                if (al && typeof al.getRecommendations === 'function') {
                    var fallbackRecs = al.getRecommendations(limit);
                    if (fallbackRecs && fallbackRecs.length > 0) {
                        for (var i = 0; i < fallbackRecs.length; i++) {
                            var r = fallbackRecs[i];
                            recs.push({
                                id: r.id || 'rec_fallback_' + i,
                                title: r.title || 'Continue Learning',
                                description: r.description || 'Continue your learning journey',
                                targetId: r.id || null,
                                targetType: r.type || 'LESSON',
                                priority: r.priority === 'high' ? 'HIGH' : 'MEDIUM',
                                explanation: 'Recommended based on your current progress'
                            });
                        }
                        return recs;
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return recs;
        },

        /**
         * 获取推荐解释
         * @param {Object} recommendation - 推荐对象
         * @returns {string} 解释文本
         */
        _getRecommendationExplanation: function(recommendation) {
            if (!recommendation) return null;
    
            // 如果推荐本身有解释
            if (recommendation.explanation) {
                return recommendation.explanation;
            }
    
            // 尝试从 Reason 生成
            if (recommendation.reason) {
                return recommendation.reason;
            }
    
            // 使用 Part 49 的解释引擎
            try {
                var engine = window.LawAIApp?.RecommendationEngine;
                if (engine && typeof engine.explainRecommendation === 'function') {
                    var explanation = engine.explainRecommendation(recommendation.id || recommendation.recommendationId);
                    if (explanation && explanation.summary) {
                        return explanation.summary;
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return 'Recommended based on your learning progress';
        },

        /**
         * 获取进度体验数据
         * @returns {Object} 进度体验数据
         */
        _getProgressExperience: function() {
            var result = {
                courses: [],
                totalLessons: 0,
                completedLessons: 0,
                completionPercent: 0,
                currentStage: 'Foundation',
                xp: 0,
                level: 1,
                streak: 0
            };
    
            try {
                var progress = window.LawAIApp?.ProgressEngine;
                if (progress && typeof progress.getProgress === 'function') {
                    var p = progress.getProgress();
                    if (p) {
                        result.totalLessons = p.totalLessons || 365;
                        result.completedLessons = (p.completedLessons || []).length;
                        result.completionPercent = p.completionPercent || 0;
                        result.currentStage = p.currentStage || 'Foundation';
                        result.xp = p.xp || 0;
                        result.level = p.level || 1;
                        result.streak = p.streak || 0;
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return result;
        },

        /**
         * 获取洞察体验数据
         * @returns {Array} 洞察列表
         */
        _getInsightExperience: function() {
            var insights = [];
        
            // 1. 复习洞察
            try {
                var review = window.LawAIApp?.MemoryReview;
                if (review && typeof review.getTodayReviews === 'function') {
                    var due = review.getTodayReviews();
                    if (due && due.length > 0) {
                        insights.push({
                            type: 'REVIEW',
                            title: due.length + ' review(s) due today',
                            description: 'Review helps reinforce your learning',
                            priority: due.length > 3 ? 'HIGH' : 'MEDIUM'
                        });        
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            // 2. 掌握度洞察
            try {
                var mastery = window.LawAIApp?.MasteryEngine;
                if (mastery && typeof mastery.getStatus === 'function') {
                    var status = mastery.getStatus();
                    if (status) {
                        var distribution = status.distribution || {};
                        if (distribution.MASTERED && distribution.MASTERED > 0) {
                            insights.push({
                                type: 'MASTERY',
                                title: distribution.MASTERED + ' concept(s) mastered',
                                description: 'You\'ve demonstrated strong understanding',
                                priority: 'LOW'
                            });        
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            // 3. 学习势头洞察
            try {
                var lm = window.LawAIApp?.LearnerModel;
                if (lm && typeof lm.getLearningMomentum === 'function') {
                    var momentum = lm.getLearningMomentum();
                    if (momentum) {
                        var level = momentum.level || 'medium';
                        if (level === 'high') {
                            insights.push({
                                type: 'MOMENTUM',
                                title: 'Great momentum!',
                                description: momentum.description || 'Keep going',
                                priority: 'LOW'
                            });
                        } else if (level === 'low') {
                            insights.push({
                                type: 'MOMENTUM',
                                title: 'Building momentum',
                                description: momentum.description || 'Every step counts',
                                priority: 'MEDIUM'
                            });
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }        
    
            return insights;
        },

        /**
         * 获取最近活动体验
         * @param {number} days - 天数范围
         * @returns {Object} 最近活动数据
         */
        _getRecentActivityExperience: function(days) {
            days = days || 7;
            var result = {
                hasActivity: false,
                lastActivityAt: null,
                daysSinceLastActivity: null,
                recentItems: []
            };    
    
            try {
                var lm = window.LawAIApp?.LearnerModel;
                if (lm && typeof lm.getRecentActivity === 'function') {
                    var activity = lm.getRecentActivity(days);
                    if (activity) {
                        result.hasActivity = activity.hasRecentActivity || false;
                        result.lastActivityAt = activity.lastActivityAt || null;
                        result.daysSinceLastActivity = activity.daysSinceLastActivity || null;
                    }
                }
        
                // 从 LearningJourneyAdapter 获取更详细的活动
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getState === 'function') {
                    var state = adapter.getState();
                    if (state && state.lastActivity) {
                        result.lastActivityAt = state.lastActivity;
                        var daysSince = (Date.now() - new Date(state.lastActivity).getTime()) / (24 * 60 * 60 * 1000);
                        result.daysSinceLastActivity = Math.round(daysSince);
                        result.hasActivity = daysSince < days;
                    }        
                }
            } catch (e) {
                // 忽略
            }
    
            return result;
        },

        /**
         * 获取即将到来的事件
         * @returns {Object} 即将到来的事件
         */
        _getUpcomingExperience: function() {
            var upcoming = {
                reviews: [],
                lessons: [],
                courses: []
            };
    
            // 获取即将到来的复习
            try {
                var review = window.LawAIApp?.MemoryReview;
                if (review && typeof review.getUpcomingReviews === 'function') {
                    var upcomingReviews = review.getUpcomingReviews(7);
                    if (upcomingReviews && upcomingReviews.length > 0) {
                        for (var i = 0; i < upcomingReviews.length; i++) {
                            var r = upcomingReviews[i];
                            upcoming.reviews.push({
                                id: r.knowledgeId || r.lessonId,
                                date: r.date || r.dueAt,
                                title: 'Review: ' + (r.knowledgeId || r.lessonId)
                            });
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return upcoming;
        },

        /**
         * 获取 Notes 体验
         * @param {number} limit - 笔记数量限制
         * @returns {Array} Notes 体验列表
         */
        _getNotesExperience: function(limit) {
            limit = limit || 5;
            var notes = [];
    
            try {
                var notesView = window.LawAIApp?.NotesView;
                if (notesView && typeof notesView._getNotesData === 'function') {
                    var allNotes = notesView._getNotesData();
                    if (allNotes && allNotes.length > 0) {
                        var top = allNotes.slice(0, limit);
                        for (var i = 0; i < top.length; i++) {
                            var n = top[i];
                            notes.push({
                                id: n.id || n.lessonId,
                                title: n.title || 'Note',
                                content: n.content || '',
                                lessonId: n.lessonId,
                                createdAt: n.createdAt || n.created || Date.now()
                            });
                        }
                        return notes;
                    }
                }
        
                // Fallback: 从 StorageEngine 获取
                var storage = window.LawAIApp?.StorageEngine;
                if (storage && typeof storage.get === 'function') {
                    var storedNotes = storage.get('user_notes', []);
                    if (storedNotes && storedNotes.length > 0) {
                        var top = storedNotes.slice(0, limit);
                        for (var i = 0; i < top.length; i++) {
                            var n = top[i];
                            notes.push({
                                id: n.id || n.lessonId,
                                title: n.title || 'Note',
                                content: n.content || '',
                                lessonId: n.lessonId,
                                createdAt: n.createdAt || n.created || Date.now()
                            });    
                        }
                    }
                }    
            } catch (e) {
                // 忽略
            }
    
            return notes;
        },

        /**
         * 获取成就体验
         * @param {number} limit - 成就数量限制
         * @returns {Array} 成就体验列表
         */
        _getAchievementsExperience: function(limit) {
            limit = limit || 5;
            var achievements = [];
    
            try {
                var ae = window.LawAIApp?.AchievementEngine;
                if (ae) {
                    if (typeof ae.getAchievements === 'function') {
                        var all = ae.getAchievements();
                        if (all && all.length > 0) {
                            var top = all.slice(0, limit);
                            for (var i = 0; i < top.length; i++) {
                                var a = top[i];
                                achievements.push({
                                    id: a.id || 'achievement_' + i,
                                    title: a.name || a.title || 'Achievement',
                                    description: a.description || '',
                                    icon: a.icon || '🏆',
                                    earnedAt: a.earnedAt || a.createdAt || Date.now()
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }
    
            return achievements;
        },

        /**
         * 获取 Schools 体验
         * @returns {Array} Schools 体验列表
         */
        _getSchoolsExperience: function() {
            var schools = [];
    
            try {
                var sr = window.LawAIApp?.SchoolRegistry;
                if (sr && typeof sr.getAll === 'function') {
                    var all = sr.getAll();
                    if (all && all.length > 0) {
                        for (var i = 0; i < all.length; i++) {
                            var s = all[i];
                            schools.push({
                                id: s.id,
                                name: s.name || s.displayName || s.title,
                                icon: s.icon || '🏛️',
                                description: s.description || '',
                                isCurrent: s.id === this._state.currentSchoolId
                            });        
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }        
    
            return schools;
        },

        // ============================================================
        // 🔥 Part 52: Learner Experience Context & Continuation
        // ============================================================

        /**
         * 获取当前体验上下文
         * @param {Object} options - 配置选项
         * @returns {Object} 当前学习上下文
         */
        getCurrentExperienceContext: function(options) {
            options = options || {};
            var result = {
                hasCurrent: false,
                type: null,
                id: null,
                title: null,
                description: null,
                progress: 0,
                status: 'unknown',
                startedAt: null,
                updatedAt: null,
                source: null,
                actions: []
            };

            // 1. 优先：显式的当前 Lesson
            var lessonId = this._state.currentLessonId;
            if (lessonId) {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getLessonDetail === 'function') {
                    var lesson = adapter.getLessonDetail(lessonId);
                    if (lesson) {
                        result.hasCurrent = true;
                        result.type = 'lesson';
                        result.id = lessonId;
                        result.title = lesson.name || 'Current Lesson';
                        result.description = lesson.description || '';
                        result.progress = lesson.isCompleted ? 100 : 50;
                        result.status = lesson.isCompleted ? 'completed' : 'in_progress';
                        result.source = 'explicit';
                        result.actions = ['continue', 'view_course'];
                        return result;
                    }
                }
            }

            // 2. 显式的当前 Course (无 Lesson)
            var courseId = this._state.currentCourseId;
            if (courseId) {
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.getCourse === 'function') {
                    var course = courseRegistry.getCourse(courseId);
                    if (course) {
                        result.hasCurrent = true;
                        result.type = 'course';
                        result.id = courseId;
                        result.title = course.title || 'Current Course';
                        result.description = course.description || '';
                        result.progress = this._state.progress || 0;
                        result.status = result.progress >= 100 ? 'completed' : 'in_progress';
                        result.source = 'explicit';
                        result.actions = ['view_course', 'continue'];
                        return result;
                    }
                }
            }

            // 3. Continue Learning (从 Journey Adapter)
            var continueData = this._getContinueLearning();
            if (continueData && continueData.courseId) {
                result.hasCurrent = true;
                result.type = continueData.isCompleted ? 'completed_course' : 'course';
                result.id = continueData.courseId;
                result.title = continueData.title || 'Continue Learning';
                result.description = continueData.isCompleted ? 'Course completed' : 'In progress';
                result.progress = continueData.progress || 0;
                result.status = continueData.isCompleted ? 'completed' : 'in_progress';
                result.source = 'continuation';
                result.actions = continueData.isCompleted ? ['review'] : ['continue'];
                if (continueData.lessonId) {
                    result.currentLessonId = continueData.lessonId;
                }
                return result;
            }

            // 4. 无活动
            return result;
        },

        /**
         * 获取续学上下文
         * @param {Object} options - 配置选项
         * @returns {Object} 续学上下文
         */
        getContinuationContext: function(options) {
            options = options || {};
            var result = {
                hasContinuation: false,
                items: [],
                primary: null
            };

            var candidates = [];

            // 1. 当前活动 (如果有)
            var current = this.getCurrentExperienceContext();
            if (current.hasCurrent && current.status !== 'completed') {
                candidates.push({
                    type: 'current',
                    priority: 100,
                    data: current,
                    reason: 'Current learning activity'
                });
            }

            // 2. Continue Learning
            var continueData = this._getContinueLearning();
            if (continueData && continueData.courseId) {
                var exists = candidates.some(function(c) {
                    return c.data && c.data.id === continueData.courseId;
                });
                if (!exists) {
                    candidates.push({
                        type: 'continuation',
                        priority: 80,
                        data: {
                            hasCurrent: true,
                            type: 'course',
                            id: continueData.courseId,
                            title: continueData.title || 'Continue Learning',
                            progress: continueData.progress || 0,
                            status: continueData.isCompleted ? 'completed' : 'in_progress',
                            source: 'continuation',
                            actions: continueData.isCompleted ? ['review'] : ['continue']
                        },
                        reason: 'Previously active course'
                    });    
                }
            }

            // 3. 最近完成的课程 (如果有)
            try {
                var progress = window.LawAIApp?.ProgressEngine;
                if (progress && typeof progress.getProgress === 'function') {
                    var p = progress.getProgress();
                    var completed = p.completedLessons || [];
                    if (completed.length > 0) {
                        var lastLesson = completed[completed.length - 1];
                        candidates.push({
                            type: 'recent',
                            priority: 60,
                            data: {
                                hasCurrent: true,
                                type: 'lesson',
                                id: lastLesson,
                                title: 'Recent Lesson',
                                progress: 100,
                                status: 'completed',
                                source: 'history',
                                actions: ['review']
                            },
                            reason: 'Recently completed'
                        });
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 4. 推荐 (如果有)
            try {
                var engine = window.LawAIApp?.RecommendationEngine;
                if (engine && typeof engine.getActiveRecommendations === 'function') {
                    var recs = engine.getActiveRecommendations();
                    if (recs && recs.length > 0) {
                        for (var i = 0; i < Math.min(recs.length, 2); i++) {
                            var rec = recs[i];
                            candidates.push({
                                type: 'recommendation',
                                priority: 50 - i * 10,
                                data: {
                                    hasCurrent: true,
                                    type: rec.targetType || 'recommendation',
                                    id: rec.targetId || rec.id,
                                    title: rec.reason || 'Recommended',
                                    description: rec.reason || 'Based on your learning progress',
                                    progress: 0,
                                    status: 'recommended',
                                    source: 'recommendation',
                                    actions: ['explore'],
                                    recommendationId: rec.id || rec.recommendationId
                                },
                                reason: 'Recommended based on your progress'
                            });
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 排序
            candidates.sort(function(a, b) {
                return b.priority - a.priority;
            });    

            result.items = candidates;
            result.hasContinuation = candidates.length > 0;
            if (candidates.length > 0) {
                result.primary = candidates[0].data;
            }

            return result;
        },

        /**
         * 获取最近活动上下文
         * @param {Object} options - 配置选项
         * @returns {Object} 最近活动
         */
        getRecentActivityContext: function(options) {
            options = options || {};
            var limit = options.limit || 5;

            var result = {
                hasActivity: false,
                items: [],
                lastActivityAt: null
            };    

            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getState === 'function') {
                    var state = adapter.getState();
                    var lastActivity = state.lastActivity;
                    if (lastActivity) {
                        result.lastActivityAt = lastActivity;
                        result.hasActivity = true;
                    }
                }
            } catch (e) {
                // 忽略
            }    

            // 如果有 Continue Learning，作为活动项
            var continueData = this._getContinueLearning();
            if (continueData && continueData.courseId) {
                result.items.push({
                    type: 'course',
                    id: continueData.courseId,
                    title: continueData.title || 'Current Course',
                    timestamp: continueData.lastActivity || Date.now(),
                    status: continueData.isCompleted ? 'completed' : 'in_progress'
                });
            }

            // 如果当前有 Lesson，作为活动项
            var current = this.getCurrentExperienceContext();
            if (current.hasCurrent) {
                result.items.push({
                    type: current.type,
                    id: current.id,
                    title: current.title,
                    timestamp: Date.now(),
                    status: current.status
                });
            }

            // 限制数量
            if (result.items.length > limit) {
                result.items = result.items.slice(0, limit);
            }

            result.hasActivity = result.items.length > 0 || !!result.lastActivityAt;

            return result;
        },

        /**
         * 获取恢复状态
         * @param {string} lessonId - 可选的 Lesson ID
         * @returns {Object} 恢复状态
         */
        getResumeState: function(lessonId) {
            var result = {
                canResume: false,
                resumeType: null,
                position: null,
                lessonId: null,
                action: 'start'
            };    

            // 如果指定了 lessonId
            if (lessonId) {
                // 检查是否有该 lesson 的进度
                try {
                    var adapter = window.LawAIApp?.LearningJourneyAdapter;
                    if (adapter && typeof adapter.getLessonDetail === 'function') {
                        var lesson = adapter.getLessonDetail(lessonId);
                        if (lesson) {
                            result.lessonId = lessonId;
                            if (lesson.isCompleted) {
                                result.canResume = false;
                                result.action = 'review';
                                return result;
                            }
                            // 如果有进度 > 0 且 < 100，可以继续
                            if (lesson.progress && lesson.progress > 0 && lesson.progress < 100) {
                                result.canResume = true;
                                result.resumeType = 'lesson';
                                result.position = lesson.progress;
                                result.action = 'continue';
                                return result;
                            }
                            result.canResume = true;
                            result.resumeType = 'lesson';
                            result.action = 'start';
                            return result;
                        }
                    }
                } catch (e) {
                    // 忽略
                }
                return result;
            }

            // 否则从当前上下文获取
            var current = this.getCurrentExperienceContext();
            if (current.hasCurrent && current.type === 'lesson' && current.progress > 0 && current.progress < 100) {
                result.canResume = true;
                result.resumeType = 'lesson';
                result.lessonId = current.id;
                result.position = current.progress;
                result.action = 'continue';
            } else if (current.hasCurrent && current.type === 'lesson') {
                result.lessonId = current.id;
                result.action = 'start';
                result.canResume = true;
                result.resumeType = 'lesson';
            }

            return result;
        },

        /**
         * 构建完整体验视图模型 (Part 51 + 52 整合)
         * @param {Object} options - 配置选项
         * @returns {Object} 完整体验视图模型
         */
        buildExperienceViewModel: function(options) {
            options = options || {};

            var current = this.getCurrentExperienceContext(options);
            var continuation = this.getContinuationContext(options);
            var recent = this.getRecentActivityContext(options);
            var resumeState = this.getResumeState(options.lessonId);

            // 获取 Learner 身份
            var learner = this._getLearnerIdentity ? this._getLearnerIdentity() : { id: 'default-learner', name: 'Learner' };

            // 获取进度
            var progress = this._getProgressExperience ? this._getProgressExperience() : { completedLessons: 0, completionPercent: 0 };

            // 获取推荐
            var recommendations = this._getRecommendationExperience ? this._getRecommendationExperience(3) : [];

            // 获取洞察
            var insights = this._getInsightExperience ? this._getInsightExperience() : [];

            // 获取 Notes
            var notes = this._getNotesExperience ? this._getNotesExperience(3) : [];

            var viewModel = {
                // 身份
                learner: learner,

                // Part 52: 上下文
                current: current,
                continuation: continuation,
                recentActivity: recent,
                resumeState: resumeState,

                // 进度
                progress: progress,

                // 推荐 (Part 48)
                recommendations: recommendations,

                // 洞察 (Part 47)
                insights: insights,

                // Notes (Part 34)
                notes: notes,

                // 元数据
                _meta: {
                    generatedAt: Date.now(),
                    version: '1.0.0',
                    hasCurrent: current.hasCurrent,
                    hasContinuation: continuation.hasContinuation,
                    hasActivity: recent.hasActivity
                }
            };

            return viewModel;
        },

        prepareLessonExperience: async function(lessonId) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
    
            var lessonMeta = loader && loader.getLessonManifest ? await loader.getLessonManifest(lessonId) : null;
            if (!lessonMeta) {
                return {
                    lesson: null,
                    intro: null,
                    objectives: [],
                    content: null,
                    video: null,
                    notes: null,
                    flashcards: [],
                    practice: null,
                    ai: null,
                    summary: null,
                    reflection: null,
                    isCompleted: false,
                    progress: 0,
                    hasVideo: false,
                    hasNotes: false,
                    hasFlashcards: false,
                    hasPractice: false,
                    hasAI: false,
                    hasSummary: false
                };
            }

            var fullLesson = null;
            if (loader && typeof loader.loadLesson === 'function') {
                var courseId = lessonMeta.courseId;
                var subjectId = lessonMeta.subjectId;
                fullLesson = await loader.loadLesson(courseId, subjectId, lessonId);
            }

            var isCompleted = false;
            var progress = 0;
            if (adapter) {
                var state = adapter.getState ? adapter.getState() : null;
                if (state && state.lessonProgress) {
                    var lessonProgress = state.lessonProgress[lessonId];
                    if (lessonProgress) {
                        progress = lessonProgress.progress || 0;
                        isCompleted = lessonProgress.completed || false;
                    }
                }
            }

            var lessonData = fullLesson || lessonMeta;
        
            return {
                lesson: lessonData,
                intro: lessonData.intro || null,
                objectives: lessonData.learningObjectives || lessonMeta.objectives || [],
                content: lessonData.content || null,
                video: lessonData.video || null,
                notes: lessonData.notes || null,
                flashcards: lessonData.flashcards || [],
                practice: lessonData.practice || null,
                ai: lessonData.aiTools || null,
                summary: lessonData.summary || null,
                reflection: lessonData.reflection || null,
                isCompleted: isCompleted,
                progress: progress,
                hasVideo: !!(lessonData.video && lessonData.video.url),
                hasNotes: !!(lessonData.notes && lessonData.notes.keyPoints && lessonData.notes.keyPoints.length),
                hasFlashcards: !!(lessonData.flashcards && lessonData.flashcards.length),
                hasPractice: !!(lessonData.practice && lessonData.practice.enabled),
                hasAI: !!(lessonData.aiTools && lessonData.aiTools.length),
                hasSummary: !!(lessonData.summary && lessonData.summary.keyTakeaways && lessonData.summary.keyTakeaways.length)
            };
        },

        startPractice: async function(lessonId, type) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                console.warn('[ExperienceManager] PracticeModule not available');
                return null;
            }

            try {
                var practice = await practiceModule.startPractice(lessonId, type);
                if (practice) {
                    this._emit('PRACTICE_STARTED', {
                        lessonId: lessonId,
                        practiceId: practice.practiceId,
                        type: type
                    });
                }
                return practice;
            } catch (e) {
                console.warn('[ExperienceManager] Failed to start practice:', e);
                return null;
            }
        },

        submitPracticeAnswer: function(practice, userAnswer, questionIndex) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                console.warn('[ExperienceManager] PracticeModule not available');
                return null;
            }

            var result = practiceModule.submitAnswer ? practiceModule.submitAnswer(practice, userAnswer, questionIndex) : null;
            if (result) {
                this._emit('PRACTICE_ANSWER_SUBMITTED', {
                    practiceId: practice.practiceId,
                    correct: result.correct,
                    isComplete: result.isComplete,
                    score: result.score,
                    total: result.total
                });
            }
            return result;
        },

        getPracticeStatus: function(practice) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                return { exists: false, progress: 0, completed: false };
            }
            return practiceModule.getStatus ? practiceModule.getStatus(practice) : { exists: false, progress: 0, completed: false };
        },

        // ============================================================
        // 🔥 Part 53: Learner Insight & Explainable Recommendation Experience
        // ============================================================

        /**
         * 获取学习者洞察
         * @param {Object} options - 配置选项
         * @returns {Array} 洞察列表
         */
        getLearnerInsights: function(options) {
            options = options || {};
            var limit = options.limit || 3;
            var insights = [];

            // 1. 当前学习洞察
            var current = this.getCurrentExperienceContext();
            if (current && current.hasCurrent) {
                insights.push({
                    id: 'insight_current_' + Date.now(),
                    type: 'CURRENT_CONTEXT',
                    title: 'Current Learning',
                    summary: 'You are currently studying: ' + current.title,
                    reason: 'Based on your active learning session',
                    action: 'continue',
                    targetId: current.id,
                    targetType: current.type,
                    source: 'current_context',
                    timestamp: Date.now(),
                    confidence: 0.9,
                    dismissible: false
                });
            }

            // 2. 进度洞察
            try {
                var progress = window.LawAIApp?.ProgressEngine;
                if (progress && typeof progress.getProgress === 'function') {
                    var p = progress.getProgress();
                    var completed = (p.completedLessons || []).length;
                    var total = p.totalLessons || 365;
                    var percent = p.completionPercent || 0;

                    if (percent > 0 && percent < 100) {
                        insights.push({
                            id: 'insight_progress_' + Date.now(),
                            type: 'PROGRESS',
                            title: 'Progress Update',
                            summary: 'You have completed ' + completed + ' of ' + total + ' lessons (' + percent + '%)',
                            reason: 'Based on your learning progress',
                            action: null,
                            targetId: null,
                            targetType: null,
                            source: 'progress',
                            timestamp: Date.now(),
                            confidence: 1.0,
                            dismissible: true
                        });
                    } else if (percent >= 100) {
                        insights.push({
                            id: 'insight_complete_' + Date.now(),
                            type: 'MILESTONE',
                            title: '🎉 All Lessons Complete!',
                            summary: 'You have completed all ' + total + ' lessons',
                            reason: 'Based on your learning progress',
                            action: 'review',
                            targetId: null,
                            targetType: null,
                            source: 'progress',
                            timestamp: Date.now(),
                            confidence: 1.0,
                            dismissible: true
                        });
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 3. 复习洞察
            try {
                var review = window.LawAIApp?.MemoryReview;
                if (review && typeof review.getTodayReviews === 'function') {
                    var due = review.getTodayReviews();
                    if (due && due.length > 0) {
                        insights.push({
                            id: 'insight_review_' + Date.now(),
                            type: 'REVIEW',
                            title: 'Review Due',
                            summary: 'You have ' + due.length + ' item(s) due for review today',
                            reason: 'Based on your review schedule',
                            action: 'review',
                            targetId: due[0]?.knowledgeId || null,
                            targetType: 'REVIEW',
                            source: 'memory_review',
                            timestamp: Date.now(),
                            confidence: 0.9,
                            dismissible: true
                        });
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 4. 学习势头洞察
            try {
                var lm = window.LawAIApp?.LearnerModel;
                if (lm && typeof lm.getLearningMomentum === 'function') {
                    var momentum = lm.getLearningMomentum();
                    if (momentum) {
                        var score = momentum.score || 0;
                        var level = momentum.level || 'medium';
                        if (score > 70) {
                            insights.push({
                                id: 'insight_momentum_' + Date.now(),
                                type: 'PATTERN',
                                title: 'Great Momentum! 🔥',
                                summary: momentum.description || 'You\'re making consistent progress',
                                reason: 'Based on your recent learning activity',
                                action: null,
                                targetId: null,
                                targetType: null,
                                source: 'learner_model',
                                timestamp: Date.now(),
                                confidence: 0.85,
                                dismissible: true
                            });
                        } else if (score < 30) {
                            insights.push({
                                id: 'insight_momentum_low_' + Date.now(),
                                type: 'PATTERN',
                                title: 'Building Momentum',
                                summary: 'Try completing a lesson to build your learning streak',
                                reason: 'Based on your recent learning activity',
                                action: 'start',
                                targetId: null,
                                targetType: null,
                                source: 'learner_model',
                                timestamp: Date.now(),
                                confidence: 0.7,
                                dismissible: true
                            });
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 5. 目标洞察
            try {
                var goals = window.LawAIApp?.GoalEngine;
                if (goals && typeof goals.getActiveGoals === 'function') {
                    var active = goals.getActiveGoals();
                    if (active && active.length > 0) {
                        var goal = active[0];
                        insights.push({
                            id: 'insight_goal_' + Date.now(),
                            type: 'GOAL',
                            title: 'Active Goal: ' + (goal.title || 'Learning Goal'),
                            summary: (goal.progress || 0) + '% complete',
                            reason: 'Based on your current learning goal',
                            action: 'continue',
                            targetId: goal.targetId || null,
                            targetType: 'GOAL',
                            source: 'goal_engine',
                            timestamp: Date.now(),
                            confidence: 0.9,
                            dismissible: true
                        });
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 6. 笔记洞察
            try {
                var notes = this._getNotesExperience ? this._getNotesExperience(3) : [];
                if (notes && notes.length > 0) {
                    insights.push({
                        id: 'insight_notes_' + Date.now(),
                        type: 'KNOWLEDGE',
                        title: 'You have ' + notes.length + ' note(s)',
                        summary: 'Your notes capture important learning insights',
                        reason: 'Based on your personal notes',
                        action: 'view_notes',
                        targetId: null,
                        targetType: null,
                        source: 'notes',
                        timestamp: Date.now(),
                        confidence: 1.0,
                        dismissible: true
                    });
                }
            } catch (e) {
                // 忽略
            }

            // 排序：按信心和重要性
            insights.sort(function(a, b) {
                var priority = { 'CURRENT_CONTEXT': 100, 'MILESTONE': 90, 'PROGRESS': 80, 'GOAL': 70, 'REVIEW': 60, 'PATTERN': 50, 'KNOWLEDGE': 40 };
                var pa = priority[a.type] || 50;
                var pb = priority[b.type] || 50;
                return pb - pa;
            });

            // 限制数量
            if (insights.length > limit) {
                insights = insights.slice(0, limit);
            }    

            return insights;
        },

        /**
         * 获取可解释推荐
         * @param {Object} options - 配置选项
         * @returns {Array} 可解释推荐列表
         */
        getExplainableRecommendations: function(options) {
            options = options || {};
            var limit = options.limit || 3;
            var recommendations = [];

            try {
                var engine = window.LawAIApp?.RecommendationEngine;
                if (engine && typeof engine.getActiveRecommendations === 'function') {
                    var recs = engine.getActiveRecommendations();
                    if (recs && recs.length > 0) {
                        var top = recs.slice(0, limit);
                        for (var i = 0; i < top.length; i++) {
                            var rec = top[i];
                            var explanation = this._getRecommendationExplanation(rec);
                            recommendations.push({
                                id: rec.id || rec.recommendationId,
                                title: rec.reason || 'Recommended',
                                summary: rec.reason || 'Based on your learning progress',
                                explanation: explanation,
                                reason: rec.reason || 'Recommended based on your learning progress',
                                targetId: rec.targetId,
                                targetType: rec.targetType || 'KNOWLEDGE',
                                priority: rec.priorityScore >= 70 ? 'HIGH' : rec.priorityScore >= 40 ? 'MEDIUM' : 'LOW',
                                action: 'explore',
                                alternatives: [],
                                source: 'recommendation_engine',
                                timestamp: rec.createdAt || Date.now(),
                                confidence: rec.confidence || 0.7,
                                dismissible: true,
                                _raw: rec
                            });
                        }

                        // 如果推荐数量 > 1，生成替代选项
                        if (recommendations.length > 1) {
                            for (var i = 1; i < recommendations.length; i++) {
                                recommendations[0].alternatives.push({
                                    id: recommendations[i].id,
                                    title: recommendations[i].title,
                                    summary: recommendations[i].summary
                                });    
                            }
                        }
                    }
                }
            } catch (e) {
                // 忽略
            }

            // 如果没有推荐，生成默认
            if (recommendations.length === 0) {
                var current = this.getCurrentExperienceContext();
                if (current && current.hasCurrent) {
                    recommendations.push({
                        id: 'rec_continue_' + Date.now(),
                        title: 'Continue Learning',
                        summary: 'Continue your current learning activity',
                        explanation: 'You were recently studying this topic',
                        reason: 'Based on your current activity',
                        targetId: current.id,
                        targetType: current.type || 'LESSON',
                        priority: 'HIGH',
                        action: 'continue',
                        alternatives: [],
                        source: 'experience_bridge',
                        timestamp: Date.now(),
                        confidence: 0.9,
                        dismissible: true
                    });
                } else {
                    recommendations.push({
                        id: 'rec_explore_' + Date.now(),
                        title: 'Explore Learning',
                        summary: 'Choose a course to begin your learning journey',
                        explanation: 'Explore available courses and find your interest',
                        reason: 'Start your learning journey',
                        targetId: null,
                        targetType: 'COURSE',
                        priority: 'MEDIUM',
                        action: 'explore',
                        alternatives: [],
                        source: 'experience_bridge',
                        timestamp: Date.now(),
                        confidence: 0.7,
                        dismissible: true
                    });
                }
            }

            return recommendations;
        },

        /**
         * 获取洞察摘要
         * @param {Object} options - 配置选项
         * @returns {Object} 洞察摘要
         */
        getInsightSummary: function(options) {
            options = options || {};

            var insights = this.getLearnerInsights(options);
            var recommendations = this.getExplainableRecommendations(options);

            return {
                insights: insights,
                recommendations: recommendations,
                hasInsights: insights.length > 0,
                hasRecommendations: recommendations.length > 0,
                insightCount: insights.length,
                recommendationCount: recommendations.length,
                timestamp: Date.now()
            };
        },

        /**
         * 构建完整洞察体验
         * @param {Object} options - 配置选项
         * @returns {Object} 完整体验
         */
        buildInsightExperience: function(options) {
            options = options || {};

            var current = this.getCurrentExperienceContext(options);
            var continuation = this.getContinuationContext(options);
            var recent = this.getRecentActivityContext(options);
            var insights = this.getLearnerInsights(options);
            var recommendations = this.getExplainableRecommendations(options);
            var resumeState = this.getResumeState(options.lessonId);

            return {
                // 上下文 (Part 52)
                current: current,
                continuation: continuation,
                recentActivity: recent,
                resumeState: resumeState,

                // 洞察 (Part 53)
                insights: insights,
                recommendations: recommendations,

                // 摘要
                summary: {
                    hasCurrent: current.hasCurrent,
                    hasContinuation: continuation.hasContinuation,
                    hasInsights: insights.length > 0,
                    hasRecommendations: recommendations.length > 0,
                    insightCount: insights.length,
                    recommendationCount: recommendations.length
                },

                // 元数据
                _meta: {
                    generatedAt: Date.now(),
                    version: '1.0.0',
                    quality: 'FULL'
                }
            };
        }

        // ============================================================
        // 2. PRIVATE — Layer Initialization
        // ============================================================

        _initLayers: function() {
            console.log('[AcademyExperienceManager] Initializing layers...');

            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (schoolRegistry && !schoolRegistry.initialized) {
                if (typeof schoolRegistry.initialize === 'function') {
                    schoolRegistry.initialize();
                }
            }

            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (programRegistry && !programRegistry.initialized) {
                if (typeof programRegistry.initialize === 'function') {
                    programRegistry.initialize();
                }
            }

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (courseRegistry && !courseRegistry.initialized) {
                if (typeof courseRegistry.initialize === 'function') {
                    courseRegistry.initialize();
                }
            }

            var curriculumRegistry = window.LawAIApp && window.LawAIApp.CurriculumRegistry;
            if (curriculumRegistry && typeof curriculumRegistry.init === 'function') {
                curriculumRegistry.init();
            }

            // 🔥 确保 SchoolRegistry 有数据
            var existingSchools = this._getSchools();
            if (!existingSchools || existingSchools.length === 0) {
                console.warn('[AcademyExperienceManager] No schools found, using fallback data');
                // 注入 fallback 到 window
                if (!window.LawAIApp) window.LawAIApp = {};
                if (!window.LawAIApp.SchoolRegistry) {
                    window.LawAIApp.SchoolRegistry = {
                        schools: FALLBACK_SCHOOLS,
                        getAllSchools: function() { return this.schools; },
                        getSchool: function(id) {
                            return this.schools.find(function(s) { return s.id === id; });
                        },
                        getProgramsBySchool: function(schoolId) {
                            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
                            if (programRegistry && typeof programRegistry.getProgramsBySchool === 'function') {
                                return programRegistry.getProgramsBySchool(schoolId);
                            }
                            return [];
                        }
                    };
                    console.log('[AcademyExperienceManager] ✅ Created fallback SchoolRegistry with ' + FALLBACK_SCHOOLS.length + ' schools');
                }
            }

            console.log('[AcademyExperienceManager] ✅ Layers initialized');
        },

        // ============================================================
        // 3. PRIVATE — Data Access
        // ============================================================

        _getRenderData: function() {
            return {
                schools: this._getSchools(),
                programs: this._getPrograms(),
                courses: this._getCourses(),
                progress: this._getProgress(),
                currentSchoolId: this._state.currentSchoolId,
                currentProgramId: this._state.currentProgramId,
                currentCourseId: this._state.currentCourseId,
                currentModuleId: this._state.currentModuleId,
                currentSubjectId: this._state.currentSubjectId,
                currentLessonId: this._state.currentLessonId,
                viewMode: this._state.viewMode
            };
        },

        _getSchools: function() {
            var registry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (registry) {
                if (typeof registry.getAllSchools === 'function') {
                    var schools = registry.getAllSchools();
                    if (schools && schools.length > 0) {
                        return schools;
                    }
                }
                if (typeof registry.getAll === 'function') {
                    var schools = registry.getAll();
                    if (schools && schools.length > 0) {
                        return schools;
                    }
                }
                if (registry.schools && Array.isArray(registry.schools) && registry.schools.length > 0) {
                    return registry.schools;
                }
            }

            // 🔥 FALLBACK: 返回预定义数据
            console.warn('[AcademyExperienceManager] No schools in registry, using fallback');
            return FALLBACK_SCHOOLS;
        },

        _getPrograms: function() {
            var registry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (registry) {
                if (typeof registry.getAllPrograms === 'function') {
                    var programs = registry.getAllPrograms();
                    if (programs && programs.length > 0) {
                        return programs;
                    }
                }
                if (registry.programs && Array.isArray(registry.programs) && registry.programs.length > 0) {
                    return registry.programs;
                }
            }
            return [];
        },

        _getCourses: function() {
            var registry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (registry) {
                if (typeof registry.getAllCourses === 'function') {
                    var courses = registry.getAllCourses();
                    if (courses && courses.length > 0) {
                        return courses;
                    }
                }
            }
            return [];
        },

        _getProgress: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                return adapter.getState();
            }

            var stateManager = window.LawAIApp && window.LawAIApp.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                return stateManager.getState();
            }

            return null;
        },

        _getContinueLearning: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.getContinueLearning === 'function') {
                return adapter.getContinueLearning();
            }
            return null;
        },

        _getLearningGuidance: function() {
            var guidance = window.LawAIApp && window.LawAIApp.LearningGuidance;
            if (guidance && typeof guidance.getCurrentGuidance === 'function') {
                return guidance.getCurrentGuidance();
            }
            return null;
        },

        // ============================================================
        // 4. PRIVATE — Container
        // ============================================================

        _createContainer: function() {
            var container = document.createElement('div');
            container.id = 'academy-root';
            container.style.cssText = 'min-height: 100vh; background: #0b1220;';
            document.body.appendChild(container);
            console.log('[AcademyExperienceManager] ✅ Created #academy-root');
            return container;
        },

        // ============================================================
        // 5. PRIVATE — Fallback Render
        // ============================================================

        _renderFallback: function(container, data) {
            var viewMode = data.viewMode || 'dashboard';

            if (viewMode === 'school') {
                this._renderSchoolViewFallback(container, data.currentSchoolId);
            } else if (viewMode === 'program') {
                this._renderProgramViewFallback(container, data.currentProgramId);
            } else if (viewMode === 'course') {
                this._renderCourseViewFallback(container, data.currentCourseId);
            } else if (viewMode === 'course-learning') {
                this._renderCourseLearningViewFallback(container, data.currentCourseId);
            } else {
                this._renderDashboardFallback(container, data);
            }
        },

        _renderDashboardFallback: function(container, data) {
            var schools = data.schools || [];
            var continueData = this._getContinueLearning();

            // 🔥 如果 schools 为空，使用 fallback
            if (!schools || schools.length === 0) {
                schools = FALLBACK_SCHOOLS;
            }

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <a href="/" style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); text-decoration: none; font-family: inherit;">
                        <span style="font-size:16px;">🏠</span> Dashboard
                    </a>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">🏛️ Law AI Academy</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Explore your learning path</p>
            `;

            if (continueData) {
                html += this._renderContinueLearningFallback(continueData);
            }

            if (schools && schools.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">🎓 Schools</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < schools.length; i++) {
                    var school = schools[i];
                    var progCount = school.programs ? school.programs.length : 0;
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToSchool('${school.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="font-size: 32px; margin-bottom: 6px;">${school.icon || '🏛️'}</div>
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${school.name}</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${school.description || ''}</p>
                            <span style="color: #4a9eff; font-size: 13px;">${progCount} programs</span>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                        <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0;">Welcome to Law AI Academy</h2>
                        <p style="color: #94a3b8; font-size: 15px; margin: 0;">Schools and programs will appear here soon</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderContinueLearningFallback: function(continueData) {
            var progress = continueData.progress || 0;
            var isCompleted = continueData.isCompleted || false;

            return `
                <div style="background: linear-gradient(135deg, rgba(74,158,255,0.08) 0%, rgba(74,158,255,0.02) 100%); 
                            border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; 
                            border: 1px solid rgba(74,158,255,0.12);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${isCompleted ? '🎉' : '📖'}</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">${isCompleted ? 'Completed Course' : 'Continue Learning'}</div>
                                <div style="font-size: 15px; font-weight: 500;">${continueData.title || 'Your Journey'}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div style="text-align: right;">
                                <div style="font-size: 13px; color: #94a3b8;">${isCompleted ? '✅ Done' : progress + '% complete'}</div>
                            </div>
                            <button onclick="window.LawAIApp.AcademyExperienceManager.startCourse('${continueData.courseId}')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                ${isCompleted ? 'Review →' : 'Continue →'}
                            </button>
                        </div>
                    </div>
                    ${!isCompleted ? `
                        <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: #4a9eff; height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        _renderSchoolViewFallback: function(container, schoolId) {
            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;

            var school = schoolRegistry && schoolRegistry.getSchool ? schoolRegistry.getSchool(schoolId) : null;
            // 如果 school 不存在，从 fallback 中查找
            if (!school) {
                school = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
            }
            var programs = programRegistry && programRegistry.getProgramsBySchool ? programRegistry.getProgramsBySchool(schoolId) : [];

            if (!school) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>School not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Academy
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">${school.icon || '🏛️'}</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${school.name}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${school.description || ''}</p>
                        </div>
                    </div>
            `;

            if (programs && programs.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📚 Programs (${programs.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < programs.length; i++) {
                    var program = programs[i];
                    var levelLabel = program.level || 'beginner';
                    var levelColor = levelLabel === 'beginner' ? '#10b981' : levelLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
                    var levelEmoji = levelLabel === 'beginner' ? '🟢' : levelLabel === 'intermediate' ? '🟡' : '🔴';
                    var moduleCount = program.modules ? program.modules.length : 0;

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToProgram('${program.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${program.name}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${program.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${levelColor}; font-size: 12px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${levelEmoji} ${levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1)}</span>
                                        <span style="color: #64748b; font-size: 12px;">${moduleCount} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 18px;">→</span>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>No programs available for this school yet.</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderProgramViewFallback: function(container, programId) {
            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;

            var program = programRegistry && programRegistry.getProgram ? programRegistry.getProgram(programId) : null;
            var courses = courseRegistry && courseRegistry.getCoursesByProgram ? courseRegistry.getCoursesByProgram(programId) : [];

            if (!program) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Program not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var levelLabel = program.level || 'beginner';
            var levelColor = levelLabel === 'beginner' ? '#10b981' : levelLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
            var levelEmoji = levelLabel === 'beginner' ? '🟢' : levelLabel === 'intermediate' ? '🟡' : '🔴';
            var statusLabel = program.status || 'active';
            var statusColor = statusLabel === 'active' ? '#10b981' : statusLabel === 'draft' ? '#f59e0b' : '#64748b';
            var moduleCount = program.modules ? program.modules.length : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToSchool('${program.schoolId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to School
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">📚</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${program.name}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${program.description || ''}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${levelColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${levelEmoji} ${levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1)}</span>
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${moduleCount} modules</span>
                    </div>
            `;

            if (courses && courses.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📖 Courses (${courses.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < courses.length; i++) {
                    var course = courses[i];
                    var courseStatus = course.status || 'active';
                    var courseStatusColor = courseStatus === 'active' ? '#10b981' : courseStatus === 'draft' ? '#f59e0b' : '#64748b';
                    var courseModuleCount = course.modules ? course.modules.length : 0;

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToCourse('${course.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${course.title}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${course.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${courseStatusColor}; font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${courseStatus}</span>
                                        <span style="color: #64748b; font-size: 11px;">${courseModuleCount} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 16px;">→</span>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>📝 No courses available for this program yet.</p>
                        <p style="font-size: 13px;">Content is being prepared</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderCourseViewFallback: function(container, courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var difficultyLabel = course.difficulty || 'beginner';
            var difficultyColor = difficultyLabel === 'beginner' ? '#10b981' : difficultyLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
            var difficultyEmoji = difficultyLabel === 'beginner' ? '🟢' : difficultyLabel === 'intermediate' ? '🟡' : '🔴';
            var statusLabel = course.status || 'active';
            var statusColor = statusLabel === 'active' ? '#10b981' : statusLabel === 'draft' ? '#f59e0b' : '#64748b';
            var moduleCount = course.modules ? course.modules.length : 0;

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var courseState = adapter && adapter.getCourseState ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToProgram('${course.programId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Program
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">📖</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${difficultyColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${difficultyEmoji} ${difficultyLabel.charAt(0).toUpperCase() + difficultyLabel.slice(1)}</span>
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${moduleCount} modules</span>
                        ${course.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${course.estimatedHours}h</span>` : ''}
                    </div>
            `;

            var completedLessons = courseState && courseState.completedLessons ? courseState.completedLessons.length : 0;
            html += `
                <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="font-size: 13px; color: #94a3b8;">📊 Your Progress</div>
                            <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${progress}%</div>
                            <div style="font-size: 12px; color: #64748b;">${completedLessons} lessons completed</div>
                        </div>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.startCourse('${courseId}')" 
                                style="padding: 12px 32px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                            ${progress > 0 ? '📖 Continue Learning' : '🚀 Start Learning'}
                        </button>
                    </div>
                    ${progress > 0 ? `
                        <div style="margin-top: 12px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.5s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;

            html += `
                <div style="margin-top: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules</h2>
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 36px; margin-bottom: 12px;">📝</div>
                        <p style="font-size: 16px; margin: 0;">Course modules are being prepared</p>
                        <p style="font-size: 13px; margin: 4px 0 0;">Check back soon for lessons</p>
                    </div>
                </div>
            `;

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderCourseLearningViewFallback: function(container, courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var state = adapter && adapter.getState ? adapter.getState() : null;
            var progress = state ? state.progress : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToCourse('${courseId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Course
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Learning Mode</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">📖</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>

                    <div style="margin-top: 16px; background: rgba(74,158,255,0.06); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(74,158,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span style="color: #94a3b8; font-size: 13px;">📊 Learning Progress</span>
                            <span style="color: #4a9eff; font-weight: 600;">${progress}%</span>
                        </div>
                        <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Course Modules</h2>
                        <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="font-size: 16px; margin: 0; font-weight: 500;">Learning modules are being prepared</p>
                            <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Module and lesson content coming soon</p>
                            <p style="font-size: 13px; margin: 8px 0 0; color: #64748b;">Check back for updates</p>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        // ============================================================
        // 6. PRIVATE — View Model Preparation
        // ============================================================

        _prepareMotivationViewModel: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                return {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    achievements: [],
                    achievementCount: 0,
                    nextLevelXp: 0,
                    xpProgress: 0
                };
            }

            var motivation = adapter.getLearningMotivation ? adapter.getLearningMotivation() : null;
            if (!motivation) {
                return {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    achievements: [],
                    achievementCount: 0,
                    nextLevelXp: 0,
                    xpProgress: 0
                };
            }

            return {
                xp: motivation.xp || 0,
                level: motivation.level || 1,
                streak: motivation.streak || 0,
                achievements: motivation.achievements || [],
                achievementCount: motivation.achievementCount || 0,
                nextLevelXp: motivation.nextLevelXp || 0,
                xpProgress: motivation.xpProgress || 0
            };
        },

        _prepareContinueLearningViewModel: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                return {
                    courseId: null,
                    title: '',
                    progress: 0,
                    isCompleted: false,
                    lastActivity: null,
                    lessonId: null,
                    moduleId: null,
                    hasActiveSession: false
                };
            }

            var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;
            if (!continueData || !continueData.courseId) {
                return {
                    courseId: null,
                    title: '',
                    progress: 0,
                    isCompleted: false,
                    lastActivity: null,
                    lessonId: null,
                    moduleId: null,
                    hasActiveSession: false
                };
            }

            var hasActiveSession = adapter.hasActiveSession ? adapter.hasActiveSession() : false;

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(continueData.courseId) : null;
            var title = course ? (course.title || course.name || continueData.title) : (continueData.title || 'Your Course');

            return {
                courseId: continueData.courseId,
                title: title,
                progress: continueData.progress || 0,
                isCompleted: continueData.isCompleted || false,
                lastActivity: continueData.lastActivity || null,
                lessonId: continueData.lessonId || null,
                moduleId: continueData.moduleId || null,
                hasActiveSession: hasActiveSession
            };
        },

        _prepareDashboardViewModel: function() {
            var schools = this._getSchools();
            var continueData = this._prepareContinueLearningViewModel();
            var motivation = this._prepareMotivationViewModel();
            var guidance = this._getLearningGuidance();

            return {
                schools: schools,
                viewMode: this._state.viewMode || 'dashboard',
                continueLearning: continueData,
                motivation: motivation,
                guidance: guidance,
                hasContinueLearning: continueData.courseId !== null,
                hasSchools: schools && schools.length > 0
            };
        },

        _prepareCourseViewData: function(courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                return {
                    course: null,
                    modules: [],
                    progress: 0,
                    isCompleted: false,
                    currentModuleId: null,
                    currentLessonId: null
                };
            }

            var courseState = adapter && adapter.getCourseState ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;
            var isCompleted = courseState ? courseState.isCompleted : false;
            var modules = adapter && adapter.getCourseModules ? adapter.getCourseModules(courseId) : [];

            return {
                course: course,
                modules: modules,
                progress: progress,
                isCompleted: isCompleted,
                currentModuleId: this._state.currentModuleId || null,
                currentLessonId: this._state.currentLessonId || null
            };
        },

        _prepareModuleViewData: function(moduleId) {
            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var module = academyRegistry && academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                return {
                    module: null,
                    lessons: [],
                    progress: 0,
                    isCompleted: false,
                    currentLessonId: null
                };
            }

            var progressData = adapter && adapter.getModuleProgress ? adapter.getModuleProgress(moduleId) : { progress: 0, completed: false };
            var lessons = adapter && adapter.getModuleLessons ? adapter.getModuleLessons(moduleId) : [];

            return {
                module: module,
                lessons: lessons,
                progress: progressData.progress || 0,
                isCompleted: progressData.completed || false,
                currentLessonId: this._state.currentLessonId || null
            };
        },

        _prepareLessonViewData: function(lessonId) {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var lesson = adapter && adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                return {
                    lesson: null,
                    isCompleted: false,
                    session: null
                };
            }

            var isCompleted = lesson.isCompleted || false;
            var session = adapter && adapter.getActiveSession ? adapter.getActiveSession() : null;

            return {
                lesson: lesson,
                isCompleted: isCompleted,
                session: session
            };
        },

        _validateViewModel: function(viewModel, expectedKeys) {
            if (!viewModel || typeof viewModel !== 'object') {
                console.warn('[ExperienceManager] Invalid ViewModel: not an object');
                return false;
            }

            var missingKeys = [];
            for (var i = 0; i < expectedKeys.length; i++) {
                var key = expectedKeys[i];
                if (!(key in viewModel)) {
                    missingKeys.push(key);
                }
            }

            if (missingKeys.length > 0) {
                console.warn('[ExperienceManager] ViewModel missing keys:', missingKeys);
                return false;
            }

            return true;
        },

        _normalizeProgress: function(value) {
            if (typeof value !== 'number' || isNaN(value)) {
                return 0;
            }
            if (value < 0) return 0;
            if (value > 100) return 100;
            return Math.round(value);
        },

        _normalizeBoolean: function(value) {
            return value === true || value === 'true' || value === 1;
        },

        _getViewModelDiagnostics: function() {
            var diagnostics = {
                viewModels: {},
                errors: [],
                warnings: []
            };

            try {
                var dashboardVM = this._prepareDashboardViewModel();
                var dashboardKeys = ['schools', 'viewMode', 'continueLearning', 'motivation', 'guidance'];
                var isValid = this._validateViewModel(dashboardVM, dashboardKeys);
                diagnostics.viewModels.dashboard = {
                    valid: isValid,
                    hasData: !!(dashboardVM.schools && dashboardVM.schools.length > 0)
                };
            } catch (e) {
                diagnostics.errors.push('Dashboard VM error: ' + e.message);
            }

            try {
                var motivationVM = this._prepareMotivationViewModel();
                var motivationKeys = ['xp', 'level', 'streak', 'achievements', 'achievementCount', 'nextLevelXp', 'xpProgress'];
                var isValid = this._validateViewModel(motivationVM, motivationKeys);
                diagnostics.viewModels.motivation = {
                    valid: isValid,
                    xp: motivationVM.xp || 0,
                    level: motivationVM.level || 0
                };
            } catch (e) {
                diagnostics.errors.push('Motivation VM error: ' + e.message);
            }

            try {
                var continueVM = this._prepareContinueLearningViewModel();
                var continueKeys = ['courseId', 'title', 'progress', 'isCompleted', 'lastActivity', 'lessonId', 'moduleId', 'hasActiveSession'];
                var isValid = this._validateViewModel(continueVM, continueKeys);
                diagnostics.viewModels.continueLearning = {
                    valid: isValid,
                    hasCourse: !!(continueVM.courseId),
                    progress: continueVM.progress || 0
                };
            } catch (e) {
                diagnostics.errors.push('Continue Learning VM error: ' + e.message);
            }

            return diagnostics;
        },

        /**
         * ═══ Part 34: 保存知识点到 Notes ═══
         * @param {Object} noteData - 笔记数据
         * @param {string} noteData.type - 类型 (KEY_POINT, DEFINITION, EXAMPLE, SUMMARY, PERSONAL_NOTE, QUESTION, MISTAKE, INSIGHT, BOOKMARK)
         * @param {string} noteData.title - 标题
         * @param {string} noteData.content - 内容
         * @param {string} noteData.courseId - Course ID
         * @param {string} noteData.subjectId - Subject ID
         * @param {string} noteData.lessonId - Lesson ID
         * @param {Array} noteData.tags - 标签
         * @param {Object} noteData.metadata - 额外元数据
         * @returns {Object} 创建的 Note
         */
        saveNote: function(noteData) {
            var notesModule = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (!notesModule) {
                console.warn('[ExperienceManager] Notes module not available');
                return null;
            }

            var note = {
                id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: noteData.type || 'KEY_POINT',
                title: noteData.title || '',
                content: noteData.content || '',
                courseId: noteData.courseId || null,
                subjectId: noteData.subjectId || null,
                lessonId: noteData.lessonId || null,
                tags: noteData.tags || [],
                source: noteData.source || {
                    type: 'lesson',
                    lessonId: noteData.lessonId
                },
                metadata: noteData.metadata || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pinned: false,
                reviewCount: 0,
                lastReviewedAt: null,
                reviewStatus: 'new'
            };

            // 尝试保存到现有系统
            if (typeof notesModule.saveNote === 'function') {
                return notesModule.saveNote(note);
            } else if (typeof notesModule.add === 'function') {
                return notesModule.add(note);
            } else if (typeof notesModule.create === 'function') {
                return notesModule.create(note);
            }

            // Fallback: 保存到 StorageEngine
            try {
                var storage = window.LawAIApp?.StorageEngine;
                if (storage) {
                    var notes = storage.get('user_notes', []);
                    notes.push(note);
                    storage.set('user_notes', notes);
                    this._emit('NOTE_CREATED', { note: note });
                    return note;
                }
            } catch (e) {
                console.warn('[ExperienceManager] Failed to save note:', e);
                return null;
            }

            return null;
        },

        /**
         * ═══ Part 34: 获取 Notes ═══
         */
        getNotes: function(filter) {
            var notesModule = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (notesModule) {
                if (typeof notesModule.getNotes === 'function') {
                    return notesModule.getNotes(filter);
                } else if (typeof notesModule.getAll === 'function') {
                    var all = notesModule.getAll();
                    return this._filterNotes(all, filter);
                }
            }

            // Fallback: 从 StorageEngine 获取
            try {
                var storage = window.LawAIApp?.StorageEngine;
                if (storage) {
                    var notes = storage.get('user_notes', []);
                    return this._filterNotes(notes, filter);
                }
            } catch (e) {
                console.warn('[ExperienceManager] Failed to get notes:', e);
            }
            return [];
        },

        /**
         * ═══ Part 34: 过滤 Notes ═══
         */
        _filterNotes: function(notes, filter) {
            if (!filter || !notes || notes.length === 0) return notes;

            var filtered = notes;
            if (filter.courseId) {
                filtered = filtered.filter(function(n) { return n.courseId === filter.courseId; });
            }
            if (filter.subjectId) {
                filtered = filtered.filter(function(n) { return n.subjectId === filter.subjectId; });
            }
            if (filter.lessonId) {
                filtered = filtered.filter(function(n) { return n.lessonId === filter.lessonId; });
            }
            if (filter.type) {
                filtered = filtered.filter(function(n) { return n.type === filter.type; });
            }
            if (filter.tag) {
                filtered = filtered.filter(function(n) {
                    return n.tags && n.tags.indexOf(filter.tag) !== -1;
                });
            }
            if (filter.pinned !== undefined) {
                filtered = filtered.filter(function(n) { return n.pinned === filter.pinned; });
            }
            return filtered;
        },

        /**
         * ═══ Part 34: 更新 Note ═══
         */
        updateNote: function(noteId, updates) {
            var notesModule = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (notesModule && typeof notesModule.updateNote === 'function') {
                return notesModule.updateNote(noteId, updates);
            }

            try {
                var storage = window.LawAIApp?.StorageEngine;
                if (storage) {
                    var notes = storage.get('user_notes', []);
                    for (var i = 0; i < notes.length; i++) {
                        if (notes[i].id === noteId) {
                            notes[i] = { ...notes[i], ...updates, updatedAt: new Date().toISOString() };
                            storage.set('user_notes', notes);
                            this._emit('NOTE_UPDATED', { noteId: noteId, updates: updates });
                            return notes[i];
                        }
                    }
                }
            } catch (e) {
                console.warn('[ExperienceManager] Failed to update note:', e);
            }
            return null;
        },

        /**
         * ═══ Part 34: 删除 Note ═══
         */
        deleteNote: function(noteId) {
            var notesModule = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (notesModule && typeof notesModule.deleteNote === 'function') {
                return notesModule.deleteNote(noteId);
            }

            try {
                var storage = window.LawAIApp?.StorageEngine;
                if (storage) {
                    var notes = storage.get('user_notes', []);
                    var newNotes = [];
                    for (var i = 0; i < notes.length; i++) {
                        if (notes[i].id !== noteId) {
                            newNotes.push(notes[i]);
                        }
                    }
                    storage.set('user_notes', newNotes);
                    this._emit('NOTE_DELETED', { noteId: noteId });
                    return true;
                }
            } catch (e) {
                console.warn('[ExperienceManager] Failed to delete note:', e);
            }
            return false;
        },

        /**
         * ═══ Part 34: 固定/取消固定 Note ═══
         */
        togglePinNote: function(noteId) {
            var notes = this.getNotes({});
            for (var i = 0; i < notes.length; i++) {
                if (notes[i].id === noteId) {
                    var newPinned = !notes[i].pinned;
                    return this.updateNote(noteId, { pinned: newPinned });
                }
            }
            return null;
        },

        /**
         * ═══ Part 34: 从 Lesson 保存知识点 ═══
         */
        saveFromLesson: function(lessonId, type, content, title) {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            var lessonMeta = null;
            if (loader && typeof loader.getLessonManifest === 'function') {
                loader.getLessonManifest(lessonId).then(function(meta) {
                    lessonMeta = meta;
                }).catch(function() {});
            }

            var noteData = {
                type: type || 'KEY_POINT',
                title: title || '',
                content: content || '',
                lessonId: lessonId,
                courseId: lessonMeta?.courseId || null,
                subjectId: lessonMeta?.subjectId || null,
                source: { type: 'lesson', lessonId: lessonId }
            };

            if (type === 'MISTAKE') {
                noteData.metadata = { fromPractice: true };
            }

            var note = this.saveNote(noteData);
            if (note) {
                this._emit('NOTE_SAVED_FROM_LESSON', { note: note, lessonId: lessonId });
            }
            return note;
        },

        /**
         * ═══ Part 34: 从 Practice 保存解释 ═══
         */
        saveFromPractice: function(practice, questionIndex, explanation) {
            var question = practice?.questions?.[questionIndex];
            var noteData = {
                type: 'MISTAKE',
                title: 'Practice: ' + (question?.prompt || 'Question'),
                content: explanation || 'Practice explanation saved.',
                lessonId: practice?.lessonId || null,
                tags: ['practice', 'mistake'],
                metadata: {
                    practiceId: practice?.practiceId,
                    questionId: question?.id,
                    questionIndex: questionIndex
                }
            };

            var note = this.saveNote(noteData);
            if (note) {
                this._emit('NOTE_SAVED_FROM_PRACTICE', { note: note, practiceId: practice?.practiceId });
            }
            return note;
        },

        /**
         * ═══ Part 34: 获取 Notes 统计 ═══
         */
        getNotesStats: function() {
            var notes = this.getNotes({});
            var pinned = 0;
            var byType = {};
            var byCourse = {};

            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                if (note.pinned) pinned++;
                var type = note.type || 'UNKNOWN';
                byType[type] = (byType[type] || 0) + 1;
                var courseId = note.courseId || 'UNKNOWN';
                byCourse[courseId] = (byCourse[courseId] || 0) + 1;
            }

            return {
                total: notes.length,
                pinned: pinned,
                byType: byType,
                byCourse: byCourse
            };
        },

        // ============================================================
        // 7. PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            console.log('[AcademyExperienceManager] Binding events...');

            var self = this;

            document.addEventListener('ACADEMY_READY', function() {
                console.log('[AcademyExperienceManager] 📡 ACADEMY_READY received');
                if (!self.initialized) {
                    self.init();
                } else {
                    self.refresh();
                }
            });

            document.addEventListener('SCHOOL_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('PROGRAM_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('COURSE_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('LEARNING_STATE_UPDATED', function() {
                console.log('[AcademyExperienceManager] 📡 LEARNING_STATE_UPDATED received, refreshing...');
                self.refresh();
            });

            console.log('[AcademyExperienceManager] ✅ Events bound');
        },

        // ============================================================
        // 8. PRIVATE — Event Helpers
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp && window.LawAIApp.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
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

    window.LawAIApp.AcademyExperienceManager = AcademyExperienceManager;

    console.log('[AcademyExperienceManager] Module loaded (v6.2.1)');

    // 自动初始化
    function autoInit() {
        if (document.getElementById('academy-root')) {
            AcademyExperienceManager.init();
        } else {
            var observer = new MutationObserver(function() {
                if (document.getElementById('academy-root')) {
                    observer.disconnect();
                    AcademyExperienceManager.init();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 200);
        });
    }

})();
