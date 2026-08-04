// js/academy/academyExperienceManager.js
// Part 57.8 — Program Explorer Experience Layer
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
        console.log('[AcademyExperienceManager] Already exists, skipping...');
        return;
    }

    var AcademyExperienceManager = {
        version: '6.1.2',
        initialized: false,
        mounted: false,
        status: 'pending',

        _state: {
            currentSchoolId: null,
            currentProgramId: null,
            currentCourseId: null,
            viewMode: 'dashboard' // dashboard | school | program | course
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

        /**
         * 🔥 Part 57.8: 导航到 Program
         */
        navigateToProgram: function(programId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);

            // 验证 Program 存在
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

            // 更新状态 — 保留 currentSchoolId
            this._state.currentProgramId = programId;
            this._state.currentCourseId = null;
            this._state.viewMode = 'program';

            // 如果 schoolId 丢失，从 program 中获取
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

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'course',
                currentCourseId: courseId
            });

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

            var progress = this._getProgress();
            if (progress && progress.currentLessonId) {
                this._emit('ACADEMY_CONTINUE', {
                    lessonId: progress.currentLessonId,
                    moduleId: progress.currentModuleId,
                    courseId: progress.currentCourseId
                });
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
            var stateManager = window.LawAIApp?.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                return stateManager.getState();
            }

            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine && typeof progressEngine.getProgress === 'function') {
                return progressEngine.getProgress();
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
            } else {
                this._renderDashboardFallback(container, data);
            }
        },

        _renderDashboardFallback: function(container, data) {
            var schools = data.schools || [];

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

            if (schools && schools.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">🎓 Schools</h2>`;
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

        /**
         * 🔥 Part 57.8: Program View Fallback
         */
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

            // 返回栏 — Back to School
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${program.schoolId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to School
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            // Program Header
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

            // Courses
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

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToProgram?.('${course.programId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Program
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">📖 ${course.title}</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">${course.description || ''}</p>
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <p>📝 Course content is being prepared</p>
                        <p style="font-size: 13px;">Check back soon for lessons</p>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        // ============================================================
        // 6. PRIVATE — Events
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
                self.refresh();
            });

            console.log('[AcademyExperienceManager] ✅ Events bound');
        },

        // ============================================================
        // 7. PRIVATE — Event Helpers
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

    console.log('[AcademyExperienceManager] Module loaded (v6.1.2)');

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
