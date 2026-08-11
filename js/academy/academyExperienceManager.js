// js/academy/academyExperienceManager.js
// Part 58.1 — Course Learning Entry Layer
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
        console.log('[AcademyExperienceManager] Already exists, skipping...');
        return;
    }

    var AcademyExperienceManager = {
        version: '6.2.1',
        initialized: false,
        mounted: false,
        status: 'pending',

        _state: {
            currentSchoolId: null,
            currentProgramId: null,
            currentCourseId: null,
            viewMode: 'dashboard' // dashboard | school | program | course | course-learning
        },

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        init: function() {
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

                console.log('[AcademyExperienceManager] ✅ Initialized');

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

            if (window.LawAIApp?.AcademyView && typeof window.LawAIApp.AcademyView.render === 'function') {
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

            var schoolRegistry = window.LawAIApp?.SchoolRegistry;
            if (!schoolRegistry) {
                console.warn('[AcademyExperienceManager] SchoolRegistry not available');
                return this;
            }

            var school = schoolRegistry.getSchool(schoolId);
            if (!school) {
                console.warn('[AcademyExperienceManager] School not found:', schoolId);
                return this;
            }

            this._state.currentSchoolId = schoolId;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
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

            var programRegistry = window.LawAIApp?.ProgramRegistry;
            if (!programRegistry) {
                console.warn('[AcademyExperienceManager] ProgramRegistry not available');
                return this;
            }

            var program = programRegistry.getProgram(programId);
            if (!program) {
                console.warn('[AcademyExperienceManager] Program not found:', programId);
                return this;
            }

            this._state.currentProgramId = programId;
            this._state.currentCourseId = null;
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

            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse(courseId);
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            this._state.currentCourseId = courseId;
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

        /**
         * 🔥 Part 58.1: 开始学习 Course
         */
        startCourse: function(courseId) {
            console.log('[AcademyExperienceManager] 🚀 Starting course:', courseId);

            // 验证 Course 存在
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse(courseId);
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            // 更新状态
            this._state.currentCourseId = courseId;
            this._state.viewMode = 'course-learning';

            // 初始化学习状态
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.initializeCourse === 'function') {
                adapter.initializeCourse(courseId);
                console.log('[AcademyExperienceManager] ✅ Learning journey initialized');
            }

            // 广播事件
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

                /**
         * 🔥 Part 58.3: 选择 Module
         */
        selectModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Selecting module:', moduleId);

            // 验证 Module 存在
            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule(moduleId);
            if (!module) {
                console.warn('[AcademyExperienceManager] Module not found:', moduleId);
                return this;
            }

            // 更新状态
            this._state.currentModuleId = moduleId;
            this._state.viewMode = 'module';

            // 通知 LearningJourneyAdapter
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
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

        /**
         * 🔥 Part 58.5: 选择 Lesson
         */
        selectLesson: function(lessonId) {
            console.log('[AcademyExperienceManager] 📍 Selecting lesson:', lessonId);

            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var lesson = adapter.getLessonDetail(lessonId);
            if (!lesson) {
                console.warn('[AcademyExperienceManager] Lesson not found:', lessonId);
                return this;
            }

            this._state.currentLessonId = lessonId;
            this._state.currentModuleId = lesson.moduleId;
            this._state.viewMode = 'lesson';

            adapter.selectLesson(lessonId);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: lessonId,
                currentModuleId: lesson.moduleId,
                currentCourseId: this._state.currentCourseId
            });

            console.log('[AcademyExperienceManager] ✅ Lesson selected:', lessonId);
            return this;
        },

        /**
         * 🔥 Part 58.5: 导航到 Module
         */
        navigateToModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to module:', moduleId);

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule(moduleId);
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
                currentCourseId: this._state.currentCourseId
            });

            console.log('[AcademyExperienceManager] ✅ Navigated to module:', moduleId);
            return this;
        },

        goHome: function() {
            console.log('[AcademyExperienceManager] 🏠 Going home...');

            this._state.currentSchoolId = null;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
            this._state.viewMode = 'dashboard';

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'dashboard'
            });

            return this;
        },

        continueLearning: function() {
            console.log('[AcademyExperienceManager] 📖 Continuing learning...');

            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var continueData = adapter ? adapter.getContinueLearning() : null;

            if (continueData && continueData.courseId) {
                // 如果有继续学习的课程
                this.startCourse(continueData.courseId);
            } else {
                // 没有进度，跳转到第一个 School
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

        // ============================================================
        // 2. PRIVATE — Layer Initialization
        // ============================================================

        _initLayers: function() {
            console.log('[AcademyExperienceManager] Initializing layers...');

            var schoolRegistry = window.LawAIApp?.SchoolRegistry;
            if (schoolRegistry && !schoolRegistry.initialized) {
                schoolRegistry.initialize();
            }

            var programRegistry = window.LawAIApp?.ProgramRegistry;
            if (programRegistry && !programRegistry.initialized) {
                programRegistry.initialize();
            }

            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && !courseRegistry.initialized) {
                courseRegistry.initialize();
            }

            var curriculumRegistry = window.LawAIApp?.CurriculumRegistry;
            if (curriculumRegistry && typeof curriculumRegistry.init === 'function') {
                curriculumRegistry.init();
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
                viewMode: this._state.viewMode
            };
        },

        _getSchools: function() {
            var registry = window.LawAIApp?.SchoolRegistry;
            if (registry) {
                if (typeof registry.getAllSchools === 'function') return registry.getAllSchools();
                if (typeof registry.getAll === 'function') return registry.getAll();
            }
            return [];
        },

        _getPrograms: function() {
            var registry = window.LawAIApp?.ProgramRegistry;
            if (registry) {
                if (typeof registry.getAllPrograms === 'function') return registry.getAllPrograms();
            }
            return [];
        },

        _getCourses: function() {
            var registry = window.LawAIApp?.CourseRegistry;
            if (registry) {
                if (typeof registry.getAllCourses === 'function') return registry.getAllCourses();
            }
            return [];
        },

        _getProgress: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                return adapter.getState();
            }

            var stateManager = window.LawAIApp?.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                return stateManager.getState();
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

            // Continue Learning Section
            if (continueData) {
                html += this._renderContinueLearningFallback(continueData);
            }

            if (schools && schools.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">🎓 Schools</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">`;

                schools.forEach(function(school) {
                    var progCount = school.programs?.length || 0;
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${school.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="font-size: 32px; margin-bottom: 6px;">${school.icon || '🏛️'}</div>
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${school.name}</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${school.description || ''}</p>
                            <span style="color: #4a9eff; font-size: 13px;">${progCount} programs</span>
                        </div>
                    `;
                });

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

        /**
         * 🔥 Part 58.1: Continue Learning Fallback
         */
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
                            <button onclick="LawAIApp.AcademyExperienceManager?.startCourse?.('${continueData.courseId}')" 
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
            var schoolRegistry = window.LawAIApp?.SchoolRegistry;
            var programRegistry = window.LawAIApp?.ProgramRegistry;

            var school = schoolRegistry ? schoolRegistry.getSchool(schoolId) : null;
            var programs = programRegistry ? programRegistry.getProgramsBySchool(schoolId) : [];

            if (!school) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>School not found</p>
                        <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
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
                    <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
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

                programs.forEach(function(program) {
                    var levelLabel = program.level || 'beginner';
                    var levelColor = levelLabel === 'beginner' ? '#10b981' : levelLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
                    var levelEmoji = levelLabel === 'beginner' ? '🟢' : levelLabel === 'intermediate' ? '🟡' : '🔴';

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="LawAIApp.AcademyExperienceManager?.navigateToProgram?.('${program.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${program.name}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${program.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${levelColor}; font-size: 12px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${levelEmoji} ${levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1)}</span>
                                        <span style="color: #64748b; font-size: 12px;">${program.modules?.length || 0} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 18px;">→</span>
                            </div>
                        </div>
                    `;
                });

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
            var programRegistry = window.LawAIApp?.ProgramRegistry;
            var courseRegistry = window.LawAIApp?.CourseRegistry;

            var program = programRegistry ? programRegistry.getProgram(programId) : null;
            var courses = courseRegistry ? courseRegistry.getCoursesByProgram(programId) : [];

            if (!program) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Program not found</p>
                        <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
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

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${program.schoolId}')" 
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
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${program.modules?.length || 0} modules</span>
                    </div>
            `;

            if (courses && courses.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📖 Courses (${courses.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                courses.forEach(function(course) {
                    var courseStatus = course.status || 'active';
                    var courseStatusColor = courseStatus === 'active' ? '#10b981' : courseStatus === 'draft' ? '#f59e0b' : '#64748b';

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="LawAIApp.AcademyExperienceManager?.navigateToCourse?.('${course.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${course.title}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${course.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${courseStatusColor}; font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${courseStatus}</span>
                                        <span style="color: #64748b; font-size: 11px;">${course.modules?.length || 0} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 16px;">→</span>
                            </div>
                        </div>
                    `;
                });

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
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = courseRegistry ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
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

            // 获取课程学习状态
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var courseState = adapter ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToProgram?.('${course.programId}')" 
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
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${course.modules?.length || 0} modules</span>
                        ${course.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${course.estimatedHours}h</span>` : ''}
                    </div>
            `;

            // 学习面板
            html += `
                <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="font-size: 13px; color: #94a3b8;">📊 Your Progress</div>
                            <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${progress}%</div>
                            <div style="font-size: 12px; color: #64748b;">${courseState?.completedLessons?.length || 0} lessons completed</div>
                        </div>
                        <button onclick="LawAIApp.AcademyExperienceManager?.startCourse?.('${courseId}')" 
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

            // Modules Section (Placeholder)
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

        /**
         * 🔥 Part 58.1: Course Learning View
         */
        _renderCourseLearningViewFallback: function(container, courseId) {
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = courseRegistry ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            // 获取学习状态
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var state = adapter ? adapter.getState() : null;
            var progress = state ? state.progress : 0;

            var html = '';

            // 返回栏
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToCourse?.('${courseId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Course
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Learning Mode</span>
                </div>
            `;

            // 学习内容
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">📖</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>

                    <!-- Progress -->
                    <div style="margin-top: 16px; background: rgba(74,158,255,0.06); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(74,158,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span style="color: #94a3b8; font-size: 13px;">📊 Learning Progress</span>
                            <span style="color: #4a9eff; font-weight: 600;">${progress}%</span>
                        </div>
                        <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <!-- Modules Placeholder -->
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
        // 6. PRIVATE — Helpers
        // ============================================================

        _getContinueLearning: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getContinueLearning === 'function') {
                return adapter.getContinueLearning();
            }
            return null;
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
