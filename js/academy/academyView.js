// js/academy/academyView.js
// Part 58.5 — Lesson Structure Foundation Layer (完整版)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyView) {
        console.log('[AcademyView] Already exists, skipping...');
        return;
    }

    var AcademyView = {
        version: '1.0.0',
        initialized: false,

        init: function() {
            if (this.initialized) {
                console.log('[AcademyView] Already initialized');
                return this;
            }

            console.log('[AcademyView] Initializing...');
            this._bindEvents();
            this.initialized = true;
            return this;
        },

        /**
         * 🔥 Part 59.6: 销毁 AcademyView (清理事件)
         */
        destroy: function() {
            console.log('[AcademyView] Destroying...');
            this._unbindEvents();
            this.initialized = false;
            console.log('[AcademyView] ✅ Destroyed');
            return this;
        },

        /**
         * 🔥 Part 63: 获取 Motivation 数据 (兼容性方法)
         */
        _getMotivationData: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (!adapter) {
                return null;
            }
            try {
                return adapter.getLearningMotivation ? adapter.getLearningMotivation() : null;
            } catch (error) {
                console.warn('[AcademyView] Motivation data unavailable:', error);
                return null;
            }
        },

                /**
         * 🔥 Part 64: 准备 Continue Learning 数据
         */
        _prepareContinueLearningData: function() {
            var continueData = this._getContinueLearning();
            if (!continueData || !continueData.courseId) {
                return null;
            }

            // 构建面包屑
            var breadcrumb = this._buildResumeBreadcrumb(
                continueData.courseId,
                continueData.moduleId,
                continueData.lessonId
            );

            // 计算时间
            var timeAgo = continueData.lastActivity ? this._getTimeAgo(continueData.lastActivity) : '';

            return {
                courseId: continueData.courseId,
                title: continueData.title || 'Your Course',
                progress: continueData.progress || 0,
                isCompleted: continueData.isCompleted || false,
                lastActivity: continueData.lastActivity || null,
                lessonId: continueData.lessonId || null,
                moduleId: continueData.moduleId || null,
                hasActiveSession: continueData.hasActiveSession || false,
                breadcrumb: breadcrumb,
                timeAgo: timeAgo
            };
        },

        render: function(data) {
            // 🔥 Part 59.6: 检查是否已挂载
            if (!this.initialized) {
                console.warn('[AcademyView] Not initialized, skipping render');
                return;
            }

            var container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[AcademyView] #academy-root not found');
                return;
            }

            // 🔥 Part 60.6: 使用 Render Router
            var viewMode = data.viewMode || 'dashboard';
            console.log('[AcademyView] Rendering viewMode:', viewMode);

            // 更新状态
            this._currentViewMode = viewMode;

            // 通过 Router 渲染
            this._renderCurrentView(container, data);
        },

        /**
         * 🔥 Part 60.6: Render Router — 根据 viewMode 路由到对应渲染器
         * @param {HTMLElement} container - 渲染容器
         * @param {Object} data - 渲染数据
         */
        _renderCurrentView: function(container, data) {
            var viewMode = data.viewMode || 'dashboard';

            switch (viewMode) {
                case 'school':
                    this._renderSchoolView(container, data.currentSchoolId);
                    break;
                case 'program':
                    this._renderProgramView(container, data.currentProgramId);
                    break;
                case 'course':
                    this._renderCourseView(container, data.currentCourseId);
                    break;
                case 'course-learning':
                    this._renderCourseLearningView(container, data.currentCourseId);
                    break;
                case 'module':
                    this._renderModuleView(container, data.currentModuleId);
                    break;
                case 'lesson':
                    this._renderLessonView(container, data.currentLessonId);
                    break;
                default:
                    this._renderDashboard(container, data);
                    break;
            }
        },

        /**
         * 🔥 Part 60.4: 准备 Dashboard 数据 (数据准备层)
         */
        _prepareDashboardData: function(data) {
            var schools = data.schools || [];
            var continueData = this._getContinueLearning();
            var motivation = null;

            // 获取 Motivation (如果可用)
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter && typeof adapter.getLearningMotivation === 'function') {
                try {
                    motivation = adapter.getLearningMotivation();
                } catch (error) {
                    console.warn('[AcademyView] Motivation unavailable:', error);
                }
            }

            return {
                schools: schools,
                continueData: continueData,
                motivation: motivation,
                hasContinueLearning: !!continueData,
                hasSchools: schools && schools.length > 0
            };
        },

        /**
         * 🔥 Part 60.5: 渲染 School Cards (显示辅助)
         * @param {Array} schools - School 列表
         * @returns {string} HTML 字符串
         */
        _renderSchoolCards: function(schools) {
            if (!schools || schools.length === 0) {
                return '';
            }

            var html = '';
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
            return html;
        },

                /**
         * 🔥 Part 60.5: 渲染欢迎空状态 (显示辅助)
         * @returns {string} HTML 字符串
         */
        _renderWelcomeEmptyState: function() {
            return `
                <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                    <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0;">Welcome to Law AI Academy</h2>
                    <p style="color: #94a3b8; font-size: 15px; margin: 0;">Schools and programs will appear here soon</p>
                </div>
            `;
        },

        // ============================================================
        // PRIVATE — Views
        // ============================================================

        _renderDashboard: function(container, data) {
            // 🔥 Part 60.4: 准备数据
            var viewData = this._prepareDashboardData(data);
            var schools = viewData.schools;
            var continueData = viewData.continueData;
            var motivation = viewData.motivation;

            var html = '';

            // ============================================================
            // 1. 返回栏 (保留内联，因为它是布局的一部分)
            // ============================================================
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <a href="/" style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); text-decoration: none; font-family: inherit;">
                        <span style="font-size:16px;">🏠</span> Dashboard
                    </a>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            // ============================================================
            // 2. 主内容
            // ============================================================
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">🏛️ Law AI Academy</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Explore your learning path</p>
            `;

            // ============================================================
            // 3. Continue Learning / Empty State
            // ============================================================
            if (continueData) {
                html += this._renderContinueLearning(continueData);
            } else {
                html += this._renderGuidanceEmptyState();
            }

            // ============================================================
            // 4. Motivation Summary
            // ============================================================
            if (motivation) {
                html += this._renderMotivationSummary();
            }

            // ============================================================
            // 5. Quick Navigation (如果活跃)
            // ============================================================
            var guidance = this._getLearningGuidance();
            if (guidance && guidance.hasActiveState) {
                html += this._renderQuickNavigation(guidance);
            }

            // ============================================================
            // 6. 🔥 Part 60.5: School Cards (使用提取的辅助方法)
            // ============================================================
            if (schools && schools.length > 0) {
                html += this._renderSchoolCards(schools);
            } else {
                html += this._renderWelcomeEmptyState();
            }

            html += `</div>`;
            container.innerHTML = html;
        },

                /**
         * 🔥 Part 63: Motivation Renderer (兼容性包装器)
         * 委托给独立的 MotivationRenderer
         */
        _renderMotivationSummary: function() {
            // 获取 Motivation 数据
            var motivation = this._getMotivationData();

            if (!motivation) {
                return '';
            }

            // 🔥 使用独立渲染器
            var renderer = window.LawAIApp?.MotivationRenderer;
            if (renderer && typeof renderer.render === 'function') {
                // 创建临时容器用于渲染
                var tempContainer = document.createElement('div');
                renderer.render(tempContainer, motivation);
                return tempContainer.innerHTML;
            }

            // ⚠️ 回退: 如果渲染器不可用，使用原有逻辑 (安全网)
            console.warn('[AcademyView] MotivationRenderer not available, using fallback');
            return this._renderMotivationFallback(motivation);
        },

        /**
         * 🔥 Part 63: Motivation Fallback (仅当渲染器不可用时)
         * @private
         */
        _renderMotivationFallback: function(motivation) {
            var xp = motivation.xp || 0;
            var level = motivation.level || 1;
            var streak = motivation.streak || 0;
            var achievements = motivation.achievements || [];
            var achievementCount = motivation.achievementCount || 0;
            var xpProgress = motivation.xpProgress || 0;

            var html = '';

            html += `
                <div style="margin: 16px 0 24px 0;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #4a9eff;">${xp}</div>
                            <div style="font-size: 11px; color: #94a3b8;">XP</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${level}</div>
                            <div style="font-size: 11px; color: #94a3b8;">Level</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                                <div style="background: rgba(255,255,255,0.06); border-radius: 2px; height: 2px; overflow: hidden; width: 60px; margin: 0 auto;">
                                    <div style="background: #f59e0b; height: 100%; width: ${Math.min(100, xpProgress)}%; transition: width 0.3s;"></div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #ec4899;">${streak}</div>
                            <div style="font-size: 11px; color: #94a3b8;">🔥 Day Streak</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${achievementCount}</div>
                            <div style="font-size: 11px; color: #94a3b8;">🏆 Achievements</div>
                        </div>
                    </div>
                    ${achievements && achievements.length > 0 ? `
                        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                            ${achievements.slice(0, 3).map(function(a) {
                                var name = a.name || a.title || a;
                                var icon = a.icon || '🏆';
                                return `<span style="background:rgba(74,158,255,0.08);padding:2px 10px;border-radius:12px;font-size:11px;color:#4a9eff;display:inline-flex;align-items:center;gap:4px;">${icon} ${name}</span>`;
                            }).join('')}
                            ${achievements.length > 3 ? `<span style="font-size:11px;color:#64748b;">+${achievements.length - 3} more</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;

            return html;
        },

                // ============================================================
        // CONTINUE LEARNING
        // ============================================================

        /**
         * 🔥 Part 64: 准备 Continue Learning 数据
         */
        _prepareContinueLearningData: function(continueData) {
            if (!continueData || !continueData.courseId) {
                return null;
            }

            // 获取课程元数据
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = courseRegistry ? courseRegistry.getCourse(continueData.courseId) : null;

            // 获取 Module/Lesson 元数据
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var moduleInfo = null;
            var lessonInfo = null;

            if (adapter && continueData.moduleId) {
                var module = adapter.getModuleDetail ? adapter.getModuleDetail(continueData.moduleId) : null;
                if (module) {
                    moduleInfo = {
                        name: module.name || 'Current Module',
                        progress: module.progress || 0
                    };
                }
            }

            if (adapter && continueData.lessonId) {
                var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(continueData.lessonId) : null;
                if (lesson) {
                    lessonInfo = {
                        name: lesson.name || 'Current Lesson'
                    };
                }
            }

            // 构建层级路径
            var breadcrumb = this._buildResumeBreadcrumb(course, moduleInfo, lessonInfo);

            // 时间信息
            var timeAgo = '';
            if (continueData.lastActivity) {
                timeAgo = this._getTimeAgo(continueData.lastActivity);
            }

            var title = course ? (course.title || course.name || continueData.title) : (continueData.title || 'Your Course');

            return {
                courseId: continueData.courseId,
                title: title,
                progress: continueData.progress || 0,
                isCompleted: continueData.isCompleted || false,
                lastActivity: continueData.lastActivity || null,
                lessonId: continueData.lessonId || null,
                moduleId: continueData.moduleId || null,
                hasActiveSession: continueData.hasActiveSession || false,
                breadcrumb: breadcrumb,
                timeAgo: timeAgo
            };
        },

        /**
         * 🔥 Part 64: Continue Learning / Resume Experience (兼容性包装器)
         */
        _renderContinueLearning: function(continueData) {
            if (!continueData || !continueData.courseId) {
                return this._renderResumeEmptyState();
            }

            // 🔥 Part 64: 使用独立渲染器
            var renderer = window.LawAIApp?.ContinueLearningRenderer;
            if (renderer && typeof renderer.render === 'function') {
                var preparedData = this._prepareContinueLearningData(continueData);
                if (!preparedData) {
                    return this._renderResumeEmptyState();
                }

                var tempContainer = document.createElement('div');
                renderer.render(tempContainer, preparedData);
                return tempContainer.innerHTML;
            }

            // ⚠️ 回退: 使用原有逻辑 (安全网)
            console.warn('[AcademyView] ContinueLearningRenderer not available, using fallback');
            return this._renderContinueLearningFallback(continueData);
        },

        /**
         * 🔥 Part 64: Continue Learning Fallback (仅当渲染器不可用时)
         * @private
         */
        _renderContinueLearningFallback: function(continueData) {
            // 安全网: 返回空状态
            return this._renderResumeEmptyState();
        },

        /**
         * 🔥 Part 60: Guidance 空状态
         */
        _renderGuidanceEmptyState: function() {
            return `
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">🚀</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">Ready to Learn</div>
                                <div style="font-size: 15px; font-weight: 500; color: #e2e8f0;">Explore your first course</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('school-ai')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                Explore Schools →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * 🔥 Part 60: Guidance 空状态
         */
        _renderGuidanceEmptyState: function() {
            return `
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">🚀</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">Ready to Learn</div>
                                <div style="font-size: 15px; font-weight: 500; color: #e2e8f0;">Explore your first course</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('school-ai')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                Explore Schools →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * 🔥 Part 60: 获取学习引导信息
         */
        _getLearningGuidance: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (!adapter) {
                return null;
            }

            var state = adapter.getState ? adapter.getState() : null;
            if (!state) {
                return null;
            }

            var hasActiveState = !!(state.currentCourseId || state.currentModuleId || state.currentLessonId);
            var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;

            return {
                hasActiveState: hasActiveState,
                currentCourseId: state.currentCourseId,
                currentModuleId: state.currentModuleId,
                currentLessonId: state.currentLessonId,
                progress: state.progress || 0,
                continueData: continueData
            };
        },

        /**
         * 🔥 Part 60: 快速导航 (显示当前学习位置)
         */
        _renderQuickNavigation: function(guidance) {
            if (!guidance || !guidance.hasActiveState) {
                return '';
            }

            var html = '';
            var courseId = guidance.currentCourseId;
            var moduleId = guidance.currentModuleId;
            var lessonId = guidance.currentLessonId;

            var courseName = 'Current Course';
            var moduleName = 'Current Module';
            var lessonName = 'Current Lesson';

            // 获取名称
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && courseId) {
                var course = courseRegistry.getCourse(courseId);
                if (course) {
                    courseName = course.title || course.name || 'Current Course';
                }
            }

            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            if (academyRegistry) {
                if (moduleId) {
                    var module = academyRegistry.getModule(moduleId);
                    if (module) {
                        moduleName = module.name || 'Current Module';
                    }
                }
                if (lessonId) {
                    var lesson = academyRegistry.getLesson(lessonId);
                    if (lesson) {
                        lessonName = lesson.title || lesson.name || 'Current Lesson';
                    }
                }
            }

            var progress = guidance.progress || 0;

            html += `
                <div style="margin: 0 0 20px 0; background: rgba(255,255,255,0.02); border-radius: 10px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.04);">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">📍 Current Position</div>
                    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px;">
                        ${courseId ? `<span style="color: #94a3b8; font-size: 14px;">📘 ${courseName}</span>` : ''}
                        ${courseId && moduleId ? `<span style="color: #475569; font-size: 12px;">›</span>` : ''}
                        ${moduleId ? `<span style="color: #94a3b8; font-size: 14px;">📂 ${moduleName}</span>` : ''}
                        ${moduleId && lessonId ? `<span style="color: #475569; font-size: 12px;">›</span>` : ''}
                        ${lessonId ? `<span style="color: #4a9eff; font-size: 14px; font-weight: 500;">📖 ${lessonName}</span>` : ''}
                        ${progress > 0 ? `<span style="color: #64748b; font-size: 12px; margin-left: 4px;">(${progress}%)</span>` : ''}
                    </div>
                </div>
            `;

            return html;
        },

        /**
         * 🔥 Part 59.5: 构建 Resume 面包屑
         */
        _buildResumeBreadcrumb: function(course, moduleInfo, lessonInfo) {
            var parts = [];

            if (course) {
                parts.push(course.title || course.name || 'Course');
            }

            if (moduleInfo && moduleInfo.name) {
                parts.push(moduleInfo.name);
            }

            if (lessonInfo && lessonInfo.name) {
                parts.push(lessonInfo.name);
            }

            return parts.length > 0 ? parts.join(' → ') : '';
        },

        /**
         * 🔥 Part 59.5: 获取相对时间
         */
        _getTimeAgo: function(timestamp) {
            if (!timestamp) return '';

            try {
                var now = Date.now();
                var then = new Date(timestamp).getTime();
                var diff = now - then;

                if (diff < 0) return '';

                var minutes = Math.floor(diff / 60000);
                var hours = Math.floor(diff / 3600000);
                var days = Math.floor(diff / 86400000);

                if (minutes < 1) return 'Just now';
                if (minutes < 60) return minutes + 'm ago';
                if (hours < 24) return hours + 'h ago';
                if (days < 7) return days + 'd ago';
                if (days < 30) return Math.floor(days / 7) + 'w ago';
                return new Date(timestamp).toLocaleDateString();

            } catch (error) {
                return '';
            }
        },

        /**
         * 🔥 Part 59.5: Resume 空状态
         */
        _renderResumeEmptyState: function() {
            return `
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">🚀</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">Ready to Learn</div>
                                <div style="font-size: 15px; font-weight: 500; color: #e2e8f0;">Explore your first course</div>
                            </div>
                        </div>
                        <div>
                            <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('school-ai')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                Explore Schools →
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        _renderSchoolView: function(container, schoolId) {
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

        _renderProgramView: function(container, programId) {
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

        /**
         * 🔥 Part 59.2: Course Experience (升级版)
         */
        _renderCourseView: function(container, courseId) {
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = courseRegistry ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = this._renderCourseNotFound();
                return;
            }

            // 获取学习状态
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var courseState = adapter ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;
            var modules = adapter ? adapter.getCourseModules(courseId) : [];

            // 计算完成状态
            var isCompleted = courseState ? courseState.isCompleted : false;
            var hasProgress = progress > 0 && progress < 100;
            var isNotStarted = progress === 0;

            // 获取课程元数据
            var difficultyLabel = course.difficulty || 'beginner';
            var difficultyColor = this._getDifficultyColor(difficultyLabel);
            var difficultyEmoji = this._getDifficultyEmoji(difficultyLabel);
            var statusLabel = course.status || 'active';

            // 构建进度标签
            var progressLabel = isCompleted ? '✅ Completed' : hasProgress ? progress + '% complete' : '📝 Not started';

            var html = '';

            // ============================================================
            // 1. 返回栏
            // ============================================================
            html += `
                <div class="academy-back-bar" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToProgram?.('${course.programId || ''}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Program
                    </button>
                    <span style="color: #475569; font-size: 14px;">|</span>
                    <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.04); color: #94a3b8; border: 1px solid rgba(255,255,255,0.06); font-family: inherit;">
                        <span style="font-size:14px;">🏠</span> Dashboard
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Course</span>
                </div>
            `;

            // ============================================================
            // 2. Course Header
            // ============================================================
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 12px; flex-wrap: wrap;">
                        <div style="font-size: 56px; line-height: 1;">${course.icon || '📘'}</div>
                        <div style="flex: 1; min-width: 200px;">
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 15px; margin: 0 0 8px 0;">${course.description || ''}</p>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                ${course.programId ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📚 Program: ${course.programId}</span>` : ''}
                                <span style="color: ${difficultyColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${difficultyEmoji} ${difficultyLabel.charAt(0).toUpperCase() + difficultyLabel.slice(1)}</span>
                                <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                                ${course.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${course.estimatedHours}h</span>` : ''}
                                <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${modules.length} modules</span>
                            </div>
                        </div>
                    </div>
            `;

            // ============================================================
            // 3. Progress Summary + Primary Action
            // ============================================================
            html += this._renderCourseActionPanel(courseId, progress, isCompleted, hasProgress, isNotStarted);

            // ============================================================
            // 4. Module List
            // ============================================================
            if (modules && modules.length > 0) {
                html += this._renderModuleList(modules, courseId);
            } else {
                html += this._renderEmptyModuleState();
            }

            html += `</div>`;
            container.innerHTML = html;
        },

                // ============================================================
        // 🔥 Part 59.2: Course Experience Helpers
        // ============================================================

        /**
         * 渲染 Course Action Panel (Progress + Primary Action)
         */
        _renderCourseActionPanel: function(courseId, progress, isCompleted, hasProgress, isNotStarted) {
            var actionLabel = isCompleted ? '🔄 Review Course' : hasProgress ? '📖 Continue Learning' : '🚀 Start Course';
            var actionColor = isCompleted ? '#10b981' : hasProgress ? '#4a9eff' : '#4a9eff';
            var progressDisplay = isCompleted ? '100%' : isNotStarted ? '0%' : progress + '%';
            var statusText = isCompleted ? '🎉 Completed!' : isNotStarted ? '📝 Ready to begin' : '📊 In progress';
            var statusColor = isCompleted ? '#10b981' : isNotStarted ? '#94a3b8' : '#4a9eff';

            return `
                <div style="margin: 20px 0 24px 0; background: rgba(74,158,255,0.04); border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <div style="font-size: 13px; color: #94a3b8;">📊 Progress</div>
                            <div style="font-size: 28px; font-weight: 700; color: ${statusColor};">${progressDisplay}</div>
                            <div style="font-size: 14px; color: ${statusColor};">${statusText}</div>
                        </div>
                        <button onclick="LawAIApp.AcademyExperienceManager?.startCourse?.('${courseId}')" 
                                style="padding: 12px 32px; background: ${actionColor}; border: none; border-radius: 10px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                            ${actionLabel}
                        </button>
                    </div>
                    ${hasProgress || isCompleted ? `
                        <div style="margin-top: 12px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, ${isCompleted ? '#10b981' : '#4a9eff'}); height: 100%; width: ${isCompleted ? 100 : progress}%; transition: width 0.5s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        /**
         * 渲染 Module 列表
         */
        _renderModuleList: function(modules, courseId) {
            var html = `
                <div style="margin-top: 8px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules (${modules.length})</h2>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
            `;

            modules.forEach(function(module, index) {
                var moduleProgress = module.progress || 0;
                var isCompleted = module.isCompleted || false;
                var isActive = module.isActive || false;
                var lessonCount = module.lessonCount || 0;
                var completedLessons = module.completedLessonCount || 0;

                var statusIcon = isCompleted ? '✅' : isActive ? '▶️' : '📄';
                var statusColor = isCompleted ? '#10b981' : isActive ? '#4a9eff' : '#64748b';
                var statusText = isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Not Started';
                var borderColor = isActive ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)';
                var bgColor = isActive ? 'rgba(74,158,255,0.06)' : 'rgba(255,255,255,0.02)';

                var progressLabel = isCompleted ? '100%' : moduleProgress + '%';

                html += `
                    <div style="background: ${bgColor}; border-radius: 12px; padding: 14px 18px; border: 1px solid ${borderColor}; cursor: pointer; transition: all 0.2s;"
                         onclick="LawAIApp.AcademyExperienceManager?.selectModule?.('${module.id}')"
                         onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                         onmouseout="this.style.background='${bgColor}'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
                            <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 150px;">
                                <span style="font-size: 18px; color: ${statusColor}; width: 28px; text-align: center;">${statusIcon}</span>
                                <div style="flex: 1; min-width: 100px;">
                                    <div style="font-weight: 500; font-size: 15px; color: ${isCompleted ? '#94a3b8' : '#e2e8f0'};">
                                        ${String(index + 1).padStart(2, '0')}. ${module.name}
                                    </div>
                                    ${module.description ? `<div style="color: #64748b; font-size: 13px; margin-top: 2px;">${module.description}</div>` : ''}
                                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                                        <span style="color: #64748b; font-size: 12px;">📖 ${completedLessons}/${lessonCount} lessons</span>
                                        <span style="color: ${statusColor}; font-size: 12px;">${statusText}</span>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                                <div style="text-align: right; min-width: 50px;">
                                    <div style="font-size: 14px; font-weight: 500; color: ${isCompleted ? '#10b981' : '#4a9eff'};">${progressLabel}</div>
                                </div>
                                <span style="color: ${statusColor}; font-size: 16px;">→</span>
                            </div>
                        </div>
                        ${!isCompleted && moduleProgress > 0 ? `
                            <div style="margin-top: 8px; background: rgba(255,255,255,0.06); border-radius: 3px; height: 3px; overflow: hidden; max-width: 300px;">
                                <div style="background: #4a9eff; height: 100%; width: ${Math.min(100, moduleProgress)}%; transition: width 0.3s;"></div>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `</div></div>`;
            return html;
        },

        /**
         * 渲染 Course Not Found
         */
        _renderCourseNotFound: function() {
            return `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
                    <p style="font-size: 16px; margin: 0;">Course not found</p>
                    <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
                            style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                        ← Back to Academy
                    </button>
                </div>
            `;
        },

        /**
         * 渲染 Empty Module State
         */
        _renderEmptyModuleState: function() {
            return `
                <div style="margin-top: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules</h2>
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                        <p style="font-size: 16px; margin: 0; font-weight: 500;">Course content is being prepared</p>
                        <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Check back soon for modules and lessons</p>
                    </div>
                </div>
            `;
        },

        /**
         * 获取难度颜色
         */
        _getDifficultyColor: function(difficulty) {
            var colors = {
                beginner: '#10b981',
                intermediate: '#f59e0b',
                advanced: '#ef4444'
            };
            return colors[difficulty] || '#64748b';
        },

        /**
         * 获取难度 Emoji
         */
        _getDifficultyEmoji: function(difficulty) {
            var emojis = {
                beginner: '🟢',
                intermediate: '🟡',
                advanced: '🔴'
            };
            return emojis[difficulty] || '📘';
        },

        /**
         * 🔥 Part 58.2: Course Learning View (含 Module 列表)
         */
        _renderCourseLearningView: function(container, courseId) {
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

            // 获取学习状态和 Modules
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var state = adapter ? adapter.getState() : null;
            var progress = state ? state.progress : 0;
            var modules = adapter ? adapter.getCourseModules(courseId) : [];

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

            // 课程头部
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">📖</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>
            `;

            // 进度条
            html += `
                <div style="margin-top: 16px; background: rgba(74,158,255,0.06); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(74,158,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span style="color: #94a3b8; font-size: 13px;">📊 Course Progress</span>
                        <span style="color: #4a9eff; font-weight: 600;">${progress}%</span>
                    </div>
                    <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;

            // Module 列表
            if (modules && modules.length > 0) {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules (${modules.length})</h2>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                `;

                modules.forEach(function(module, index) {
                    var moduleProgress = module.progress || 0;
                    var isCompleted = module.isCompleted || false;
                    var isActive = module.isActive || false;
                    var statusIcon = isCompleted ? '✅' : isActive ? '▶️' : '📄';
                    var statusColor = isCompleted ? '#10b981' : isActive ? '#4a9eff' : '#64748b';
                    var borderColor = isActive ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)';
                    var bgColor = isActive ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.03)';

                    html += `
                        <div style="background: ${bgColor}; border-radius: 10px; padding: 14px 18px; border: 1px solid ${borderColor}; cursor: pointer; transition: all 0.2s;"
                             onclick="LawAIApp.AcademyExperienceManager?.selectModule?.('${module.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='${bgColor}'">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 18px;">${statusIcon}</span>
                                    <div>
                                        <div style="font-weight: 500; font-size: 15px; color: ${isCompleted ? '#94a3b8' : '#e2e8f0'};">
                                            ${index + 1}. ${module.name}
                                        </div>
                                        ${module.description ? `<div style="color: #64748b; font-size: 13px;">${module.description}</div>` : ''}
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="text-align: right;">
                                        <div style="font-size: 13px; color: ${isCompleted ? '#10b981' : '#94a3b8'};">
                                            ${isCompleted ? '✅ Completed' : moduleProgress + '%'}
                                        </div>
                                        <div style="font-size: 11px; color: #64748b;">${module.lessonCount || 0} lessons</div>
                                    </div>
                                    <span style="color: ${statusColor}; font-size: 16px;">→</span>
                                </div>
                            </div>
                            ${!isCompleted && moduleProgress > 0 ? `
                                <div style="margin-top: 8px; background: rgba(255,255,255,0.06); border-radius: 3px; height: 3px; overflow: hidden;">
                                    <div style="background: #4a9eff; height: 100%; width: ${Math.min(100, moduleProgress)}%; transition: width 0.3s;"></div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });

                html += `</div></div>`;
            } else {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules</h2>
                        <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="font-size: 16px; margin: 0; font-weight: 500;">No modules available for this course yet</p>
                            <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Module content coming soon</p>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        /**
         * 🔥 Part 58.3: Module View
         */
        _renderModuleView: function(container, moduleId) {
            var academyRegistry = window.LawAIApp?.AcademyRegistry;
            var module = academyRegistry ? academyRegistry.getModule(moduleId) : null;

            if (!module) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Module not found</p>
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
            var moduleProgress = state && state.moduleProgress ? state.moduleProgress[moduleId] || 0 : 0;
            var isModuleCompleted = state && state.completedModules ? state.completedModules.indexOf(moduleId) !== -1 : false;

            // 获取 Lessons 数量
            var lessonCount = module.lessons ? module.lessons.length : 0;
            var completedLessons = 0;
            if (state && state.completedLessons && module.lessons) {
                completedLessons = module.lessons.filter(function(lesson) {
                    return state.completedLessons.indexOf(lesson.id) !== -1;
                }).length;
            }

            // 获取 CourseId (从 module 或 state)
            var courseId = module.courseId || module.programId || state?.currentCourseId || '';

            var html = '';

            // 返回栏 — Back to Course
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToCourse?.('${courseId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Course
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📋 Module</span>
                </div>
            `;

            // Module 头部
            var statusIcon = isModuleCompleted ? '✅' : '📄';
            var statusColor = isModuleCompleted ? '#10b981' : '#4a9eff';
            var statusText = isModuleCompleted ? 'Completed' : 'In Progress';

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">${statusIcon}</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${module.name}</h1>
                            ${module.description ? `<p style="color: #94a3b8; font-size: 14px; margin: 0;">${module.description}</p>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusIcon} ${statusText}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${lessonCount} lessons</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📊 ${moduleProgress}% complete</span>
                    </div>
            `;

            // 进度条 — 使用 adapter 的进度数据
            var progressData = adapter ? adapter.getModuleProgress(moduleId) : { progress: 0, completed: false };
            var displayProgress = progressData.progress || 0;
            var isCompleted = progressData.completed || false;

            html += `
                <div style="margin-top: 16px; background: rgba(74,158,255,0.06); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(74,158,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span style="color: #94a3b8; font-size: 13px;">📊 Module Progress</span>
                        <span style="color: #4a9eff; font-weight: 600;">${displayProgress}%</span>
                    </div>
                    <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #4a9eff, ${isCompleted ? '#10b981' : '#4a9eff'}); height: 100%; width: ${Math.min(100, displayProgress)}%; transition: width 0.5s;"></div>
                    </div>
                    ${lessonCount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; color: #64748b;">
                            <span>📖 ${completedLessons} / ${lessonCount} lessons completed</span>
                            ${isCompleted ? '<span style="color: #10b981;">✅ Completed</span>' : ''}
                        </div>
                    ` : ''}
                </div>
            `;

            // ============================================================
            // 🔥 Part 58.5: Lesson 列表
            // ============================================================
            var lessons = adapter ? adapter.getModuleLessons(moduleId) : [];

            if (lessons && lessons.length > 0) {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📖 Lessons (${lessons.length})</h2>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                `;

                lessons.forEach(function(lesson, index) {
                    var lessonCompleted = lesson.isCompleted || false;
                    var lessonActive = lesson.isActive || false;
                    var lStatusIcon = lessonCompleted ? '✅' : lessonActive ? '▶️' : '○';
                    var lStatusColor = lessonCompleted ? '#10b981' : lessonActive ? '#4a9eff' : '#64748b';
                    var lStatusText = lessonCompleted ? 'Completed' : lessonActive ? 'In Progress' : 'Not Started';
                    var lBorderColor = lessonActive ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)';
                    var lBgColor = lessonActive ? 'rgba(74,158,255,0.06)' : 'rgba(255,255,255,0.02)';

                    html += `
                        <div style="background: ${lBgColor}; border-radius: 10px; padding: 12px 16px; border: 1px solid ${lBorderColor}; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;"
                             onclick="LawAIApp.AcademyExperienceManager?.selectLesson?.('${lesson.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                             onmouseout="this.style.background='${lBgColor}'">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 16px; color: ${lStatusColor}; width: 24px; text-align: center;">${lStatusIcon}</span>
                                <div>
                                    <div style="font-weight: 500; font-size: 14px; color: ${lessonCompleted ? '#94a3b8' : '#e2e8f0'};">
                                        ${String(index + 1).padStart(2, '0')}. ${lesson.name}
                                    </div>
                                    ${lesson.description ? `<div style="color: #64748b; font-size: 12px;">${lesson.description}</div>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    ${lesson.duration ? `<span style="color: #64748b; font-size: 12px;">⏱️ ${lesson.duration}min</span>` : ''}
                                    <span style="color: ${lStatusColor}; font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${lStatusText}</span>
                                </div>
                                <span style="color: ${lStatusColor}; font-size: 14px;">→</span>
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            } else {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📖 Lessons</h2>
                        <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 32px; margin-bottom: 12px;">📝</div>
                            <p style="font-size: 15px; margin: 0; font-weight: 500;">No lessons available for this module yet</p>
                            <p style="font-size: 13px; margin: 4px 0 0; color: #94a3b8;">Lesson content coming soon</p>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        /**
         * 🔥 Part 58.5: Lesson View (Placeholder)
         */
        _renderLessonView: function(container, lessonId) {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var lesson = adapter ? adapter.getLessonDetail(lessonId) : null;

            if (!lesson) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Lesson not found</p>
                        <button onclick="LawAIApp.AcademyExperienceManager?.goHome?.()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var isCompleted = lesson.isCompleted || false;
            var statusIcon = isCompleted ? '✅' : '📄';
            var statusColor = isCompleted ? '#10b981' : '#4a9eff';
            var statusText = isCompleted ? 'Completed' : 'Ready';

            var html = '';

            // 返回栏 — Back to Module
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToModule?.('${lesson.moduleId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Module
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Lesson</span>
                </div>
            `;

            // Lesson 内容
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">${statusIcon}</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${lesson.name}</h1>
                            ${lesson.description ? `<p style="color: #94a3b8; font-size: 14px; margin: 0;">${lesson.description}</p>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusIcon} ${statusText}</span>
                        ${lesson.duration ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${lesson.duration} minutes</span>` : ''}
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 Module: ${lesson.moduleId}</span>
                    </div>

                    // 🔥 Part 58.6: Learning Session Panel (加在这里！)
                    html += this._renderSessionPanel(lessonId);

                    <!-- Lesson 内容占位 -->
                    <div style="margin-top: 24px;">
                        <div style="text-align: center; padding: 80px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 56px; margin-bottom: 16px;">📝</div>
                            <p style="font-size: 18px; margin: 0; font-weight: 500; color: #94a3b8;">Lesson Experience Coming Soon</p>
                            <p style="font-size: 14px; margin: 8px 0 0; color: #64748b;">This lesson is being prepared</p>
                            <p style="font-size: 13px; margin: 4px 0 0; color: #475569;">Interactive lesson content will appear here</p>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

                /**
         * 🔥 Part 58.6: Session Panel
         */
        _renderSessionPanel: function(lessonId) {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var session = adapter ? adapter.getActiveSession() : null;
            var isActive = session && session.lessonId === lessonId && session.status === 'active';

            var html = '';

            html += `
                <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid ${isActive ? 'rgba(74,158,255,0.3)' : 'rgba(74,158,255,0.08)'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="font-size: 13px; color: #94a3b8;">📖 Learning Session</div>
                            <div style="font-size: 20px; font-weight: 700; color: ${isActive ? '#4a9eff' : '#e2e8f0'};">
                                ${isActive ? '▶️ Learning in Progress' : 'Ready to Learn'}
                            </div>
                            ${isActive ? `<div style="font-size: 12px; color: #64748b;">Started: ${new Date(session.startedAt).toLocaleTimeString()}</div>` : ''}
                        </div>
                        ${isActive ? `
                            <button onclick="LawAIApp.AcademyExperienceManager?.endLessonSession?.()" 
                                    style="padding: 10px 24px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #ef4444; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                                ⏹️ End Session
                            </button>
                        ` : `
                            <button onclick="LawAIApp.AcademyExperienceManager?.startLesson?.('${lessonId}')" 
                                    style="padding: 12px 32px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                🚀 Start Learning
                            </button>
                        `}
                    </div>
                    ${isActive ? `
                        <div style="margin-top: 12px; background: rgba(74,158,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: 100%; animation: pulse 2s ease-in-out infinite;"></div>
                        </div>
                        <style>
                            @keyframes pulse {
                                0%, 100% { opacity: 0.6; }
                                50% { opacity: 1; }
                            }
                        </style>
                    ` : ''}
                </div>
            `;

            return html;
        },

        /**
         * 🔥 Part 58.0: 获取 Continue Learning 数据
         */
        _getContinueLearning: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (!adapter) {
                return null;
            }

            var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;
            if (!continueData) {
                return null;
            }

            // 🔥 Part 59.5: 添加会话信息
            var hasActiveSession = adapter.hasActiveSession ? adapter.hasActiveSession() : false;

            return {
                ...continueData,
                hasActiveSession: hasActiveSession
            };
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            console.log('[AcademyView] Binding events...');

            var self = this;

            // 存储 handler 引用以便清理
            this._eventHandlers = this._eventHandlers || {};

            // ============================================================
            // 1. 现有事件 (保留)
            // ============================================================

            // ACADEMY_VIEW_CHANGED
            var viewChangedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 ACADEMY_VIEW_CHANGED received:', data);
                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('ACADEMY_VIEW_CHANGED', viewChangedHandler);
            this._eventHandlers.viewChanged = viewChangedHandler;

            // ACADEMY_REFRESH
            var refreshHandler = function() {
                console.log('[AcademyView] 📡 ACADEMY_REFRESH received');
                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('ACADEMY_REFRESH', refreshHandler);
            this._eventHandlers.academyRefresh = refreshHandler;

            // ACADEMY_LEARNING_UPDATED
            var learningUpdatedHandler = function(e) {
                console.log('[AcademyView] 📡 ACADEMY_LEARNING_UPDATED received');
                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('ACADEMY_LEARNING_UPDATED', learningUpdatedHandler);
            this._eventHandlers.learningUpdated = learningUpdatedHandler;

            // ============================================================
            // 🔥 Part 59.6: 新增学习事件监听
            // ============================================================

            // LEARNING_STATE_UPDATED
            var stateUpdatedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 LEARNING_STATE_UPDATED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('LEARNING_STATE_UPDATED', stateUpdatedHandler);
            this._eventHandlers.stateUpdated = stateUpdatedHandler;

            // LEARNING_PROGRESS_UPDATED
            var progressUpdatedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 LEARNING_PROGRESS_UPDATED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('LEARNING_PROGRESS_UPDATED', progressUpdatedHandler);
            this._eventHandlers.progressUpdated = progressUpdatedHandler;

            // LEARNING_SESSION_STARTED
            var sessionStartedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 LEARNING_SESSION_STARTED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('LEARNING_SESSION_STARTED', sessionStartedHandler);
            this._eventHandlers.sessionStarted = sessionStartedHandler;

            // LEARNING_SESSION_ENDED
            var sessionEndedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 LEARNING_SESSION_ENDED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('LEARNING_SESSION_ENDED', sessionEndedHandler);
            this._eventHandlers.sessionEnded = sessionEndedHandler;

            // MODULE_COMPLETED
            var moduleCompletedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 MODULE_COMPLETED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('MODULE_COMPLETED', moduleCompletedHandler);
            this._eventHandlers.moduleCompleted = moduleCompletedHandler;

            // MOTIVATION_UPDATED
            var motivationUpdatedHandler = function(e) {
                var data = e.detail || {};
                console.log('[AcademyView] 📡 MOTIVATION_UPDATED received:', data);

                if (!self.initialized) {
                    console.log('[AcademyView] ⏳ Not mounted, skipping refresh');
                    return;
                }

                var manager = window.LawAIApp?.AcademyExperienceManager;
                if (manager) {
                    var renderData = manager._getRenderData ? manager._getRenderData() : {};
                    self.render(renderData);
                }
            };
            document.addEventListener('MOTIVATION_UPDATED', motivationUpdatedHandler);
            this._eventHandlers.motivationUpdated = motivationUpdatedHandler;

            console.log('[AcademyView] ✅ Events bound (' + Object.keys(this._eventHandlers).length + ' handlers)');
        },

        /**
         * 🔥 Part 59.6: 移除事件监听 (防止内存泄漏)
         */
        _unbindEvents: function() {
            console.log('[AcademyView] Unbinding events...');

            if (!this._eventHandlers) {
                console.log('[AcademyView] No handlers to unbind');
                return;
            }

            var handlers = this._eventHandlers;

            for (var eventName in handlers) {
                if (handlers.hasOwnProperty(eventName)) {
                    var handler = handlers[eventName];
                    var domEventName = this._getEventName(eventName);
                    document.removeEventListener(domEventName, handler);
                    window.removeEventListener(domEventName, handler);
                    console.log('[AcademyView] Removed listener:', domEventName);
                }
            }

            this._eventHandlers = {};
            console.log('[AcademyView] ✅ Events unbound');
        },

        /**
         * 🔥 Part 59.6: 映射内部事件名到 DOM 事件名
         */
        _getEventName: function(internalName) {
            var mapping = {
                'viewChanged': 'ACADEMY_VIEW_CHANGED',
                'academyRefresh': 'ACADEMY_REFRESH',
                'learningUpdated': 'ACADEMY_LEARNING_UPDATED',
                'stateUpdated': 'LEARNING_STATE_UPDATED',
                'progressUpdated': 'LEARNING_PROGRESS_UPDATED',
                'sessionStarted': 'LEARNING_SESSION_STARTED',
                'sessionEnded': 'LEARNING_SESSION_ENDED',
                'moduleCompleted': 'MODULE_COMPLETED',
                'motivationUpdated': 'MOTIVATION_UPDATED'
            };
            return mapping[internalName] || internalName;
        },

        // ============================================================
        // Export
        // ============================================================

        if (!window.LawAIApp) {
            window.LawAIApp = {};
        }

        window.LawAIApp.AcademyView = AcademyView;

        console.log('[AcademyView] Module loaded (Part 58.5)');

    })();
