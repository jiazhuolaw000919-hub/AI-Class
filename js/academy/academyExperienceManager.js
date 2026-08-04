// js/academy/academyExperienceManager.js
// Part 57.4 — Academy Experience Manager
// Law AI Academy Developer Bible
//
// PURPOSE: Orchestrate Academy Experience Layer
// COORDINATES: initialization, state, rendering, interaction
// REUSES: existing engines, does NOT duplicate

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
        console.warn('[AcademyExperienceManager] Already exists, skipping...');
        return;
    }

    class AcademyExperienceManager {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.rendered = false;
            this.status = 'pending';

            // 子组件引用
            this._components = {
                view: null,
                schoolExplorer: null,
                programExplorer: null,
                continueLearning: null,
                progressView: null
            };

            // 状态
            this._state = {
                currentSchoolId: null,
                currentProgramId: null,
                currentModuleId: null,
                viewMode: 'dashboard' // dashboard | school | program | lesson
            };

            // 事件监听
            this._listeners = [];
        }

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Academy Experience
         */
        init: function() {
            if (this.initialized) {
                console.log('[AcademyExperienceManager] Already initialized');
                return this;
            }

            console.log('[AcademyExperienceManager] 🚀 Initializing...');

            try {
                // 1. 检查 AcademyLoader 是否就绪
                if (!this._isAcademyReady()) {
                    console.warn('[AcademyExperienceManager] Academy not ready, waiting...');
                    this._waitForAcademy();
                    return this;
                }

                // 2. 初始化子组件
                this._initComponents();

                // 3. 绑定事件
                this._bindEvents();

                // 4. 渲染
                this.render();

                this.initialized = true;
                this.status = 'ready';

                console.log('[AcademyExperienceManager] ✅ Initialized');
                this._emit('ACADEMY_VIEW_READY', { version: this.version });

            } catch (error) {
                console.error('[AcademyExperienceManager] Init failed:', error);
                this.status = 'failed';
            }

            return this;
        },

        /**
         * 渲染 Academy
         */
        render: function() {
            if (this.rendered) {
                console.log('[AcademyExperienceManager] Already rendered');
                return this;
            }

            console.log('[AcademyExperienceManager] 🎨 Rendering Academy...');

            const container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[AcademyExperienceManager] #academy-root not found, creating...');
                this._createContainer();
            }

            // 获取数据
            const schools = this._getSchools();
            const progress = this._getProgress();

            // 使用 View 层渲染
            if (window.LawAIApp?.AcademyView) {
                window.LawAIApp.AcademyView.render({
                    schools: schools,
                    progress: progress,
                    currentSchoolId: this._state.currentSchoolId,
                    viewMode: this._state.viewMode
                });
            } else {
                // Fallback: 直接渲染
                this._renderFallback(schools, progress);
            }

            this.rendered = true;
            console.log('[AcademyExperienceManager] ✅ Rendered');

            return this;
        },

        /**
         * 刷新 Academy
         */
        refresh: function() {
            console.log('[AcademyExperienceManager] 🔄 Refreshing...');

            // 重新获取数据
            const schools = this._getSchools();
            const progress = this._getProgress();

            // 重新渲染
            if (window.LawAIApp?.AcademyView) {
                window.LawAIApp.AcademyView.render({
                    schools: schools,
                    progress: progress,
                    currentSchoolId: this._state.currentSchoolId,
                    viewMode: this._state.viewMode
                });
            }

            this._emit('ACADEMY_REFRESH', { timestamp: Date.now() });

            return this;
        },

        /**
         * 导航到 School
         */
        navigateToSchool: function(schoolId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to school:', schoolId);
            this._state.currentSchoolId = schoolId;
            this._state.viewMode = 'school';
            this.refresh();
            return this;
        },

        /**
         * 导航到 Program
         */
        navigateToProgram: function(programId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);
            this._state.currentProgramId = programId;
            this._state.viewMode = 'program';
            this.refresh();
            return this;
        },

        /**
         * 继续学习
         */
        continueLearning: function() {
            console.log('[AcademyExperienceManager] 📖 Continuing learning...');

            const progress = this._getProgress();
            if (progress && progress.currentLessonId) {
                // 跳转到当前 Lesson
                this._emit('ACADEMY_CONTINUE', {
                    lessonId: progress.currentLessonId,
                    moduleId: progress.currentModuleId
                });
            } else {
                // 没有进度，跳转到第一个 School
                const schools = this._getSchools();
                if (schools && schools.length > 0) {
                    this.navigateToSchool(schools[0].id);
                }
            }

            return this;
        },

        /**
         * 销毁 Academy Experience
         */
        destroy: function() {
            console.log('[AcademyExperienceManager] 🧹 Destroying...');

            // 清理事件监听
            this._listeners.forEach(function(listener) {
                document.removeEventListener(listener.event, listener.handler);
            });
            this._listeners = [];

            // 清理容器
            const container = document.getElementById('academy-root');
            if (container) {
                container.innerHTML = '';
            }

            this.initialized = false;
            this.rendered = false;
            this.status = 'destroyed';

            return this;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                rendered: this.rendered,
                status: this.status,
                state: this._state,
                components: Object.keys(this._components)
            };
        },

        // ============================================================
        // 2. PRIVATE — Academy Readiness
        // ============================================================

        _isAcademyReady: function() {
            const loader = window.LawAIApp?.AcademyLoader;
            if (!loader) return false;

            const status = loader.getStatus ? loader.getStatus() : {};
            return status.status === 'ready' || status.ready === true;
        },

        _waitForAcademy: function() {
            console.log('[AcademyExperienceManager] ⏳ Waiting for Academy...');

            const self = this;
            let attempts = 0;
            const maxAttempts = 30;

            const checkInterval = setInterval(function() {
                attempts++;
                if (self._isAcademyReady()) {
                    clearInterval(checkInterval);
                    console.log('[AcademyExperienceManager] ✅ Academy ready, initializing...');
                    self.init();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('[AcademyExperienceManager] ⚠️ Academy timeout, initializing anyway...');
                    self.init();
                }
            }, 200);
        },

        // ============================================================
        // 3. PRIVATE — Component Initialization
        // ============================================================

        _initComponents: function() {
            console.log('[AcademyExperienceManager] Initializing components...');

            // 初始化 AcademyView
            if (window.LawAIApp?.AcademyView) {
                if (typeof window.LawAIApp.AcademyView.init === 'function') {
                    window.LawAIApp.AcademyView.init();
                }
                this._components.view = 'AcademyView';
                console.log('[AcademyExperienceManager] ✅ AcademyView ready');
            }

            // 初始化 SchoolExplorer
            if (window.LawAIApp?.SchoolExplorer) {
                if (typeof window.LawAIApp.SchoolExplorer.init === 'function') {
                    window.LawAIApp.SchoolExplorer.init();
                }
                this._components.schoolExplorer = 'SchoolExplorer';
                console.log('[AcademyExperienceManager] ✅ SchoolExplorer ready');
            }

            // 初始化 ProgramExplorer
            if (window.LawAIApp?.ProgramExplorer) {
                if (typeof window.LawAIApp.ProgramExplorer.init === 'function') {
                    window.LawAIApp.ProgramExplorer.init();
                }
                this._components.programExplorer = 'ProgramExplorer';
                console.log('[AcademyExperienceManager] ✅ ProgramExplorer ready');
            }

            // 初始化 ContinueLearning
            if (window.LawAIApp?.ContinueLearning) {
                if (typeof window.LawAIApp.ContinueLearning.init === 'function') {
                    window.LawAIApp.ContinueLearning.init();
                }
                this._components.continueLearning = 'ContinueLearning';
                console.log('[AcademyExperienceManager] ✅ ContinueLearning ready');
            }

            // 初始化 AcademyProgressView
            if (window.LawAIApp?.AcademyProgressView) {
                if (typeof window.LawAIApp.AcademyProgressView.init === 'function') {
                    window.LawAIApp.AcademyProgressView.init();
                }
                this._components.progressView = 'AcademyProgressView';
                console.log('[AcademyExperienceManager] ✅ AcademyProgressView ready');
            }
        },

        // ============================================================
        // 4. PRIVATE — Event Binding
        // ============================================================

        _bindEvents: function() {
            console.log('[AcademyExperienceManager] Binding events...');

            // 监听 ACADEMY_READY
            this._addListener('ACADEMY_READY', function() {
                console.log('[AcademyExperienceManager] 📡 ACADEMY_READY received');
                if (!this.initialized) {
                    this.init();
                } else {
                    this.refresh();
                }
            }.bind(this));

            // 监听 SCHOOL_REGISTERED
            this._addListener('SCHOOL_REGISTERED', function() {
                console.log('[AcademyExperienceManager] 📡 SCHOOL_REGISTERED received');
                this.refresh();
            }.bind(this));

            // 监听 LEARNING_STATE_UPDATED
            this._addListener('LEARNING_STATE_UPDATED', function() {
                console.log('[AcademyExperienceManager] 📡 LEARNING_STATE_UPDATED received');
                this.refresh();
            }.bind(this));

            // 监听 ACADEMY_REFRESH
            this._addListener('ACADEMY_REFRESH', function() {
                console.log('[AcademyExperienceManager] 📡 ACADEMY_REFRESH received');
                this.refresh();
            }.bind(this));

            console.log('[AcademyExperienceManager] ✅ Events bound');
        },

        _addListener: function(event, handler) {
            document.addEventListener(event, handler);
            this._listeners.push({ event: event, handler: handler });
        },

        // ============================================================
        // 5. PRIVATE — Data Access
        // ============================================================

        _getSchools: function() {
            const registry = window.LawAIApp?.SchoolRegistry;
            if (registry) {
                if (typeof registry.getAll === 'function') {
                    return registry.getAll();
                }
                if (typeof registry.getActive === 'function') {
                    return registry.getActive();
                }
                if (typeof registry.getSchools === 'function') {
                    return registry.getSchools();
                }
            }

            // Fallback: 从 AcademyRegistry 获取
            const academyReg = window.LawAIApp?.AcademyRegistry;
            if (academyReg && typeof academyReg.getAllSchools === 'function') {
                return academyReg.getAllSchools();
            }

            return [];
        },

        _getProgress: function() {
            // 从 progressEngine 获取
            const progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine && typeof progressEngine.getProgress === 'function') {
                return progressEngine.getProgress();
            }

            // 从 learningStateManager 获取
            const stateManager = window.LawAIApp?.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                return stateManager.getState();
            }

            return null;
        },

        // ============================================================
        // 6. PRIVATE — Container
        // ============================================================

        _createContainer: function() {
            const container = document.createElement('div');
            container.id = 'academy-root';
            container.style.cssText = 'min-height: 100vh; background: #0b1220;';
            document.body.appendChild(container);
            console.log('[AcademyExperienceManager] ✅ Created #academy-root');
        },

        // ============================================================
        // 7. PRIVATE — Fallback Render
        // ============================================================

        _renderFallback: function(schools, progress) {
            const container = document.getElementById('academy-root');
            if (!container) return;

            let html = `
                <div style="padding: 40px; color: #e2e8f0; font-family: 'Inter', sans-serif; max-width: 1200px; margin: 0 auto;">
                    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">🏛️ Law AI Academy</h1>
                    <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">Your AI learning journey starts here</p>
            `;

            // 进度概览
            if (progress) {
                html += `
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <span style="color: #94a3b8; font-size: 13px;">Progress</span>
                                <div style="font-size: 20px; font-weight: 600;">${progress.overallProgress || 0}%</div>
                            </div>
                            <div>
                                <span style="color: #94a3b8; font-size: 13px;">Lessons Completed</span>
                                <div style="font-size: 20px; font-weight: 600;">${progress.completedLessons?.length || 0}</div>
                            </div>
                            <button onclick="LawAIApp.AcademyExperienceManager?.continueLearning?.()" style="padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                                📖 Continue Learning
                            </button>
                        </div>
                    </div>
                `;
            }

            // Schools
            if (schools && schools.length > 0) {
                html += `<h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">🎓 Schools</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                schools.forEach(function(school) {
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;" 
                             onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${school.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="font-size: 32px; margin-bottom: 8px;">${school.icon || '🏛️'}</div>
                            <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 4px;">${school.name}</h3>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px;">${school.description || ''}</p>
                            <span style="color: #4a9eff; font-size: 13px;">${school.programs?.length || 0} programs</span>
                        </div>
                    `;
                });

                html += `</div>`;
            } else {
                // Empty State
                html += `
                    <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                        <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">Welcome to Law AI Academy</h2>
                        <p style="color: #94a3b8; font-size: 16px; margin: 0;">Your learning journey starts here</p>
                        <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Schools and programs will appear here soon</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        // ============================================================
        // 8. PRIVATE — Event Emitter
        // ============================================================

        _emit: function(eventName, data) {
            try {
                const event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {
                // 忽略
            }
        }
    }

    // ============================================================
    // Export
    // ============================================================

    const manager = new AcademyExperienceManager();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AcademyExperienceManager = manager;

    console.log('[AcademyExperienceManager] Module loaded (Part 57.4)');

    // ============================================================
    // Auto-Init — 等待 DOM 就绪
    // ============================================================

    function autoInit() {
        if (document.getElementById('academy-root')) {
            console.log('[AcademyExperienceManager] 🔥 Auto-initializing...');
            manager.init();
        } else {
            console.log('[AcademyExperienceManager] ⏳ Waiting for #academy-root...');
            const observer = new MutationObserver(function() {
                if (document.getElementById('academy-root')) {
                    observer.disconnect();
                    console.log('[AcademyExperienceManager] 🔥 #academy-root found, initializing...');
                    manager.init();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 100);
        });
    }

})();
