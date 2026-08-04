// js/academy/continueLearning.js
// Part 57.4 — Continue Learning
// Law AI Academy Developer Bible
//
// PURPOSE: Display user's current learning path
// DATA SOURCE: learningStateManager, progressEngine

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ContinueLearning) {
        console.log('[ContinueLearning] Already exists, skipping...');
        return;
    }

    const ContinueLearning = {
        version: '1.0.0',
        initialized: false,
        _currentProgress: null,

        // ============================================================
        // PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[ContinueLearning] Already initialized');
                return this;
            }

            console.log('[ContinueLearning] Initializing...');
            this.initialized = true;
            this._bindEvents();
            return this;
        },

        /**
         * 获取当前学习进度
         * @returns {Object|null}
         */
        getProgress: function() {
            // 1. 从 learningStateManager 获取
            const stateManager = window.LawAIApp?.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                const state = stateManager.getState();
                if (state) {
                    this._currentProgress = state;
                    return state;
                }
            }

            // 2. 从 progressEngine 获取
            const progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine && typeof progressEngine.getProgress === 'function') {
                const progress = progressEngine.getProgress();
                if (progress) {
                    this._currentProgress = progress;
                    return progress;
                }
            }

            // 3. 从 AcademyRegistry 获取
            const registry = window.LawAIApp?.AcademyRegistry;
            if (registry && typeof registry.getLearningProgress === 'function') {
                const progress = registry.getLearningProgress('current-user', null);
                if (progress) {
                    this._currentProgress = progress;
                    return progress;
                }
            }

            return null;
        },

        /**
         * 检查是否有进行中的学习
         * @returns {boolean}
         */
        hasActiveLearning: function() {
            const progress = this.getProgress();
            if (!progress) return false;

            return !!(progress.currentLessonId || progress.currentModuleId || (progress.completedLessons && progress.completedLessons.length > 0));
        },

        /**
         * 获取 Continue 按钮的目标
         * @returns {Object|null} { lessonId, moduleId, programId }
         */
        getContinueTarget: function() {
            const progress = this.getProgress();
            if (!progress) return null;

            // 如果有当前 Lesson
            if (progress.currentLessonId) {
                return {
                    lessonId: progress.currentLessonId,
                    moduleId: progress.currentModuleId,
                    programId: progress.currentProgramId
                };
            }

            // 如果有最近的完成记录
            if (progress.completedLessons && progress.completedLessons.length > 0) {
                const lastLesson = progress.completedLessons[progress.completedLessons.length - 1];
                return {
                    lessonId: lastLesson,
                    moduleId: progress.currentModuleId,
                    programId: progress.currentProgramId
                };
            }

            return null;
        },

        /**
         * 渲染 Continue Learning 卡片
         * @param {string} containerId — 容器 ID
         */
        render: function(containerId) {
            const container = document.getElementById(containerId || 'academy-root');
            if (!container) {
                console.warn('[ContinueLearning] Container not found');
                return;
            }

            const progress = this.getProgress();

            if (!progress || !this.hasActiveLearning()) {
                container.innerHTML = this._renderOnboarding();
                return;
            }

            container.innerHTML = this._renderCard(progress);
        },

        /**
         * 继续学习
         */
        continueLearning: function() {
            const target = this.getContinueTarget();
            if (!target) {
                // 没有进度，跳转到第一个 School
                const schools = window.LawAIApp?.SchoolRegistry?.getAllSchools?.() || [];
                if (schools.length > 0) {
                    window.LawAIApp.AcademyExperienceManager?.navigateToSchool?.(schools[0].id);
                }
                return;
            }

            console.log('[ContinueLearning] Continuing to:', target);

            // 触发继续事件
            this._emit('CONTINUE_LEARNING', {
                lessonId: target.lessonId,
                moduleId: target.moduleId,
                programId: target.programId
            });

            // 通知 ExperienceManager 跳转
            if (window.LawAIApp?.AcademyExperienceManager) {
                window.LawAIApp.AcademyExperienceManager.navigateToProgram(target.programId);
            }
        },

        // ============================================================
        // PRIVATE — Rendering
        // ============================================================

        _renderCard: function(progress) {
            const pct = progress.overallProgress || 0;
            const completed = progress.completedLessons?.length || 0;
            const total = progress.totalLessons || 0;

            return `
                <div style="background: linear-gradient(135deg, rgba(74,158,255,0.08) 0%, rgba(74,158,255,0.02) 100%); 
                            border-radius: 12px; padding: 18px 20px; 
                            border: 1px solid rgba(74,158,255,0.12);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">📖</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">Continue Learning</div>
                                <div style="font-size: 15px; font-weight: 500;">${progress.currentLessonTitle || 'Your Journey'}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div style="text-align: right;">
                                <div style="font-size: 13px; color: #94a3b8;">${completed} / ${total || '∞'} lessons</div>
                                <div style="font-size: 13px; color: #4a9eff;">${pct}% complete</div>
                            </div>
                            <button onclick="LawAIApp.ContinueLearning?.continueLearning?.()" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                Continue →
                            </button>
                        </div>
                    </div>
                    <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                        <div style="background: #4a9eff; height: 100%; width: ${Math.min(100, pct)}%; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;
        },

        _renderOnboarding: function() {
            return `
                <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 24px 20px; 
                            border: 1px solid rgba(255,255,255,0.06); text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🚀</div>
                    <h3 style="font-size: 17px; font-weight: 600; margin: 0 0 4px;">Start Your Journey</h3>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px;">Choose a school to begin learning</p>
                    <button onclick="LawAIApp.AcademyExperienceManager?.render()" 
                            style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 500; cursor: pointer; font-size: 14px;">
                        Explore Schools →
                    </button>
                </div>
            `;
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            document.addEventListener('LEARNING_STATE_UPDATED', function() {
                console.log('[ContinueLearning] Learning state updated');
                this._currentProgress = null;
            }.bind(this));

            console.log('[ContinueLearning] Events bound');
        },

        _emit: function(eventName, data) {
            try {
                const event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
                if (window.LawAIApp?.EventBus) {
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

    window.LawAIApp.ContinueLearning = ContinueLearning;

    console.log('[ContinueLearning] Module loaded (Part 57.4)');

})();
