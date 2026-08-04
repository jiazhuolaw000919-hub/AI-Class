// js/academy/academyView.js
// Part 57.4 — Academy View
// Law AI Academy Developer Bible
//
// PURPOSE: Pure rendering layer for Academy UI
// NO business logic — ONLY rendering

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyView) {
        console.warn('[AcademyView] Already exists, skipping...');
        return;
    }

    const AcademyView = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[AcademyView] Already initialized');
                return this;
            }

            console.log('[AcademyView] Initializing...');
            this.initialized = true;
            return this;
        },

        /**
         * 渲染 Academy 主视图
         * @param {Object} data — { schools, progress, currentSchoolId, viewMode }
         */
        render: function(data) {
            const container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[AcademyView] #academy-root not found');
                return;
            }

            const { schools, progress, currentSchoolId, viewMode } = data || {};

            // 根据 viewMode 渲染不同视图
            if (viewMode === 'school' && currentSchoolId) {
                this._renderSchoolView(container, currentSchoolId);
            } else if (viewMode === 'program') {
                this._renderProgramView(container);
            } else {
                this._renderDashboard(container, schools, progress);
            }
        },

        // ============================================================
        // PRIVATE — Views
        // ============================================================

        _renderDashboard: function(container, schools, progress) {
            let html = `
                <div style="padding: 32px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0;">🏛️ Law AI Academy</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Your AI learning journey starts here</p>
                        </div>
                        ${progress ? this._renderProgressBadge(progress) : ''}
                    </div>
            `;

            // Continue Learning Section
            if (progress && progress.currentLessonId) {
                html += this._renderContinueSection(progress);
            }

            // Schools
            if (schools && schools.length > 0) {
                html += this._renderSchools(schools);
            } else {
                html += this._renderEmptyState();
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderSchoolView: function(container, schoolId) {
            // 获取 School 数据
            const registry = window.LawAIApp?.SchoolRegistry;
            let school = null;

            if (registry) {
                if (typeof registry.get === 'function') {
                    school = registry.get(schoolId);
                } else if (typeof registry.getSchool === 'function') {
                    school = registry.getSchool(schoolId);
                }
            }

            if (!school) {
                // Fallback: 从 AcademyRegistry 获取
                const academyReg = window.LawAIApp?.AcademyRegistry;
                if (academyReg && typeof academyReg.getSchool === 'function') {
                    school = academyReg.getSchool(schoolId);
                }
            }

            if (!school) {
                container.innerHTML = this._renderNotFound('School not found');
                return;
            }

            // 获取 Programs
            let programs = [];
            const academyReg = window.LawAIApp?.AcademyRegistry;
            if (academyReg && typeof academyReg.getProgramsBySchool === 'function') {
                programs = academyReg.getProgramsBySchool(schoolId);
            }

            let html = `
                <div style="padding: 32px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.render()" style="background: none; border: none; color: #4a9eff; cursor: pointer; font-size: 14px; padding: 0; margin-bottom: 16px;">
                        ← Back to Schools
                    </button>
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">${school.icon || '🏛️'}</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0;">${school.name}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">${school.description || ''}</p>
                        </div>
                    </div>
            `;

            if (programs && programs.length > 0) {
                html += `
                    <h2 style="font-size: 20px; font-weight: 600; margin: 24px 0 16px;">📚 Programs</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                `;

                programs.forEach(function(program) {
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="LawAIApp.AcademyExperienceManager?.navigateToProgram?.('${program.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${program.name}</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">${program.description || ''}</p>
                            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                <span style="color: #64748b; font-size: 12px;">${program.modules?.length || 0} modules</span>
                                <span style="color: #64748b; font-size: 12px;">${program.difficulty || 'Beginner'}</span>
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                        <p>No programs available yet for this school.</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderProgramView: function(container) {
            // 简单 Program 视图（可扩展）
            container.innerHTML = `
                <div style="padding: 32px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <button onclick="LawAIApp.AcademyExperienceManager?.render()" style="background: none; border: none; color: #4a9eff; cursor: pointer; font-size: 14px; padding: 0; margin-bottom: 16px;">
                        ← Back to School
                    </button>
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">📚 Program Details</h1>
                    <p style="color: #94a3b8; font-size: 14px;">Program content coming soon...</p>
                </div>
            `;
        },

        // ============================================================
        // PRIVATE — Helpers
        // ============================================================

        _renderProgressBadge: function(progress) {
            const pct = progress.overallProgress || 0;
            return `
                <div style="background: rgba(74,158,255,0.12); border-radius: 20px; padding: 8px 16px; border: 1px solid rgba(74,158,255,0.2);">
                    <span style="color: #4a9eff; font-weight: 600; font-size: 14px;">🎯 ${pct}% Complete</span>
                </div>
            `;
        },

        _renderContinueSection: function(progress) {
            const pct = progress.overallProgress || 0;
            return `
                <div style="background: rgba(74,158,255,0.06); border-radius: 12px; padding: 16px 20px; margin: 16px 0 24px; border: 1px solid rgba(74,158,255,0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <span style="color: #94a3b8; font-size: 13px;">📖 Continue Learning</span>
                        <div style="font-size: 15px; font-weight: 500;">${progress.currentLessonTitle || 'Current Lesson'}</div>
                        <div style="color: #64748b; font-size: 13px;">${pct}% complete</div>
                    </div>
                    <button onclick="LawAIApp.AcademyExperienceManager?.continueLearning?.()" style="padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        Continue →
                    </button>
                </div>
            `;
        },

        _renderSchools: function(schools) {
            let html = `<h2 style="font-size: 20px; font-weight: 600; margin: 24px 0 16px;">🎓 Schools</h2>`;
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

            schools.forEach(function(school) {
                html += `
                    <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                         onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${school.id}')"
                         onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                         onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                        <div style="font-size: 32px; margin-bottom: 8px;">${school.icon || '🏛️'}</div>
                        <h3 style="font-size: 17px; font-weight: 600; margin: 0 0 4px;">${school.name}</h3>
                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">${school.description || ''}</p>
                        <span style="color: #4a9eff; font-size: 13px;">${school.programs?.length || 0} programs</span>
                    </div>
                `;
            });

            html += `</div>`;
            return html;
        },

        _renderEmptyState: function() {
            return `
                <div style="text-align: center; padding: 60px 20px; margin: 24px 0; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                    <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Welcome to Law AI Academy</h2>
                    <p style="color: #94a3b8; font-size: 15px; margin: 0;">Your learning journey starts here</p>
                    <p style="color: #64748b; font-size: 13px; margin-top: 8px;">Schools and programs will appear here soon</p>
                </div>
            `;
        },

        _renderNotFound: function(message) {
            return `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <p>${message}</p>
                    <button onclick="LawAIApp.AcademyExperienceManager?.render()" style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                        ← Back
                    </button>
                </div>
            `;
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AcademyView = AcademyView;

    console.log('[AcademyView] Module loaded (Part 57.4)');

})();
