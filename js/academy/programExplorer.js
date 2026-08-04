// js/academy/programExplorer.js
// Part 57.4 — Program Explorer
// Law AI Academy Developer Bible
//
// PURPOSE: Display Academy programs with hierarchy
// DATA SOURCE: AcademyRegistry, ProgramRegistry

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ProgramExplorer) {
        console.log('[ProgramExplorer] Already exists, skipping...');
        return;
    }

    const ProgramExplorer = {
        version: '1.0.0',
        initialized: false,
        _currentProgramId: null,

        // ============================================================
        // PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[ProgramExplorer] Already initialized');
                return this;
            }

            console.log('[ProgramExplorer] Initializing...');
            this.initialized = true;

            this._bindEvents();
            return this;
        },

        /**
         * 获取 Program 详情（含 Modules 和 Lessons）
         * @param {string} programId
         * @returns {Object|null}
         */
        getProgramDetail: function(programId) {
            const registry = window.LawAIApp?.AcademyRegistry;
            if (!registry) {
                console.warn('[ProgramExplorer] AcademyRegistry not available');
                return null;
            }

            // 获取 Program
            let program = null;
            if (typeof registry.getProgram === 'function') {
                program = registry.getProgram(programId);
            } else if (window.LawAIApp?.ProgramRegistry && typeof window.LawAIApp.ProgramRegistry.getProgram === 'function') {
                program = window.LawAIApp.ProgramRegistry.getProgram(programId);
            }

            if (!program) return null;

            // 获取 Modules
            let modules = [];
            if (typeof registry.getModulesByProgram === 'function') {
                modules = registry.getModulesByProgram(programId);
            }

            // 为每个 Module 获取 Lessons
            const enrichedModules = modules.map(function(module) {
                let lessons = [];
                if (typeof registry.getLessonsByModule === 'function') {
                    lessons = registry.getLessonsByModule(module.id);
                }
                return {
                    ...module,
                    lessons: lessons,
                    lessonCount: lessons.length
                };
            });

            return {
                ...program,
                modules: enrichedModules,
                totalModules: enrichedModules.length,
                totalLessons: enrichedModules.reduce(function(sum, m) {
                    return sum + (m.lessons?.length || 0);
                }, 0)
            };
        },

        /**
         * 获取 Programs 列表（按学校）
         * @param {string} schoolId
         * @returns {Array}
         */
        getProgramsBySchool: function(schoolId) {
            const registry = window.LawAIApp?.ProgramRegistry;
            if (registry && typeof registry.getProgramsBySchool === 'function') {
                return registry.getProgramsBySchool(schoolId);
            }

            // Fallback: AcademyRegistry
            const academyReg = window.LawAIApp?.AcademyRegistry;
            if (academyReg && typeof academyReg.getProgramsBySchool === 'function') {
                return academyReg.getProgramsBySchool(schoolId);
            }

            return [];
        },

        /**
         * 渲染 Program 详情视图
         * @param {string} programId
         */
        renderProgramDetail: function(programId) {
            const container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[ProgramExplorer] #academy-root not found');
                return;
            }

            const detail = this.getProgramDetail(programId);
            if (!detail) {
                container.innerHTML = this._renderNotFound('Program not found');
                return;
            }

            this._currentProgramId = programId;
            container.innerHTML = this._renderDetailView(detail);
        },

        /**
         * 刷新 Programs
         */
        refresh: function() {
            console.log('[ProgramExplorer] Refreshing...');
            if (this._currentProgramId) {
                this.renderProgramDetail(this._currentProgramId);
            }
            return this;
        },

        // ============================================================
        // PRIVATE — Rendering
        // ============================================================

        _renderDetailView: function(detail) {
            let html = `
                <div style="padding: 32px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 900px; margin: 0 auto;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${detail.schoolId || ''}')" 
                            style="background: none; border: none; color: #4a9eff; cursor: pointer; font-size: 14px; padding: 0; margin-bottom: 16px;">
                        ← Back to School
                    </button>
                    
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                            <span style="font-size: 32px;">📚</span>
                            <h1 style="font-size: 26px; font-weight: 700; margin: 0;">${detail.name}</h1>
                        </div>
                        <p style="color: #94a3b8; font-size: 15px; margin: 4px 0;">${detail.description || ''}</p>
                        <div style="display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
                            <span style="color: #64748b; font-size: 13px;">${detail.totalModules || 0} modules</span>
                            <span style="color: #64748b; font-size: 13px;">${detail.totalLessons || 0} lessons</span>
                            <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${detail.level || 'Beginner'}</span>
                        </div>
                    </div>
            `;

            // Modules
            if (detail.modules && detail.modules.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 12px;">📖 Modules</h2>`;
                html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;

                detail.modules.forEach(function(module, index) {
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06);">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                <div>
                                    <span style="color: #64748b; font-size: 12px; margin-right: 8px;">${index + 1}.</span>
                                    <span style="font-weight: 500;">${module.name}</span>
                                </div>
                                <span style="color: #64748b; font-size: 12px;">${module.lessons?.length || 0} lessons</span>
                            </div>
                            ${module.description ? `<p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 24px;">${module.description}</p>` : ''}
                        </div>
                    `;
                });

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 32px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px;">
                        <p>No modules available for this program yet.</p>
                    </div>
                `;
            }

            html += `</div>`;
            return html;
        },

        _renderNotFound: function(message) {
            return `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <p>${message}</p>
                    <button onclick="LawAIApp.AcademyExperienceManager?.render()" 
                            style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                        ← Back
                    </button>
                </div>
            `;
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            document.addEventListener('PROGRAM_REGISTERED', function() {
                this.refresh();
            }.bind(this));

            document.addEventListener('ACADEMY_REFRESH', function() {
                this.refresh();
            }.bind(this));

            console.log('[ProgramExplorer] Events bound');
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ProgramExplorer = ProgramExplorer;

    console.log('[ProgramExplorer] Module loaded (Part 57.4)');

})();
