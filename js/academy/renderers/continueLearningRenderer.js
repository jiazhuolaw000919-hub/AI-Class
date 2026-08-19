// js/academy/renderers/continueLearningRenderer.js
// Part 64 — AcademyView Renderer Extraction · Phase A.2
// Law AI Academy Developer Bible
//
// PURPOSE: Pure Continue Learning UI rendering
// RESPONSIBILITY: DATA → HTML → DOM
// STATELESS: Does NOT own learning state, navigation, or events

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ContinueLearningRenderer) {
        console.log('[ContinueLearningRenderer] Already exists, skipping...');
        return;
    }

    /**
     * ContinueLearningRenderer
     * 
     * 纯渲染器 — 接收准备好的数据，生成 Continue Learning UI
     * 
     * 数据契约:
     * {
     *     courseId: string | null,
     *     title: string,
     *     progress: number,
     *     isCompleted: boolean,
     *     lastActivity: string | null,
     *     lessonId: string | null,
     *     moduleId: string | null,
     *     hasActiveSession: boolean
     * }
     */
    var ContinueLearningRenderer = {
        version: '1.0.0',

        /**
         * 渲染 Continue Learning UI
         * @param {HTMLElement} container - DOM 容器
         * @param {Object} data - 准备好的继续学习数据
         * @param {Object} callbacks - 回调函数 (如 onResume)
         */
        render: function(container, data, callbacks) {
            if (!container) {
                console.warn('[ContinueLearningRenderer] Container not provided');
                return;
            }

            // 安全处理空数据
            if (!data || !data.courseId) {
                container.innerHTML = this._renderEmptyState(callbacks);
                return;
            }

            var progress = data.progress || 0;
            var isCompleted = data.isCompleted || false;
            var hasActiveSession = data.hasActiveSession || false;
            var lastActivity = data.lastActivity || null;
            var title = data.title || 'Your Course';

            // 确定状态标签
            var statusLabel = isCompleted ? 'Completed' : hasActiveSession ? 'Active Session' : 'In Progress';
            var statusColor = isCompleted ? '#10b981' : hasActiveSession ? '#4a9eff' : '#f59e0b';
            var statusIcon = isCompleted ? '🎉' : hasActiveSession ? '▶️' : '📖';

            // 确定动作标签
            var actionLabel = isCompleted ? 'Review Course' : hasActiveSession ? 'Resume Learning' : 'Continue Learning';
            var actionColor = isCompleted ? '#10b981' : '#4a9eff';

            // 构建层级路径 (如果有数据)
            var breadcrumb = data.breadcrumb || '';
            var timeAgo = data.timeAgo || '';

            var html = '';

            html += `
                <div style="background: linear-gradient(135deg, rgba(74,158,255,0.08) 0%, rgba(74,158,255,0.02) 100%); 
                            border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; 
                            border: 1px solid rgba(74,158,255,0.12);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                        <div style="flex: 1; min-width: 180px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                                <span style="font-size: 20px;">${statusIcon}</span>
                                <span style="font-size: 13px; color: ${statusColor}; font-weight: 500;">${statusLabel}</span>
                                ${timeAgo ? `<span style="font-size: 11px; color: #64748b;">· ${timeAgo}</span>` : ''}
                            </div>
                            <div style="font-size: 16px; font-weight: 600; color: #e2e8f0;">
                                ${title}
                            </div>
                            ${breadcrumb ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${breadcrumb}</div>` : ''}
                            ${!isCompleted ? `
                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                                    <span style="font-size: 12px; color: #94a3b8;">${progress}% complete</span>
                                    <div style="flex: 1; max-width: 100px; background: rgba(255,255,255,0.06); border-radius: 3px; height: 3px; overflow: hidden;">
                                        <div style="background: ${statusColor}; height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                            ${isCompleted ? `
                                <span style="font-size: 12px; color: #10b981; background: rgba(16,185,129,0.1); padding: 2px 12px; border-radius: 12px;">✅ Done</span>
                            ` : ''}
                            <button onclick="${this._buildResumeHandler(data.courseId, callbacks)}" 
                                    style="padding: 8px 20px; background: ${actionColor}; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                ${isCompleted ? '🔄 Review' : '📖 Continue'}
                            </button>
                        </div>
                    </div>
                    ${!isCompleted && progress > 0 ? `
                        <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, ${progress > 80 ? '#10b981' : '#4a9eff'}); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;

            container.innerHTML = html;
        },

        /**
         * 构建 Resume 处理函数
         * @private
         */
        _buildResumeHandler: function(courseId, callbacks) {
            // 使用 callbacks 或默认的全局调用
            if (callbacks && typeof callbacks.onResume === 'function') {
                // 返回一个函数引用，由 onclick 调用
                return 'window._continueLearningResume(\'' + courseId + '\')';
            }
            // 默认使用现有的 ExperienceManager 路径
            return 'LawAIApp.AcademyExperienceManager?.startCourse?.(\'' + courseId + '\')';
        },

        /**
         * 渲染空状态
         * @private
         */
        _renderEmptyState: function(callbacks) {
            var exploreHandler = (callbacks && typeof callbacks.onExplore === 'function') 
                ? 'window._continueLearningExplore()' 
                : 'LawAIApp.AcademyExperienceManager?.navigateToSchool?.(\'school-ai\')';

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
                            <button onclick="${exploreHandler}" 
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
         * 获取渲染器状态 (诊断用)
         */
        getStatus: function() {
            return {
                version: this.version,
                name: 'ContinueLearningRenderer',
                type: 'pure-renderer'
            };
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    // 注册全局回调 (由 AcademyView 设置)
    window._continueLearningResume = function(courseId) {
        if (window.LawAIApp?.AcademyExperienceManager) {
            window.LawAIApp.AcademyExperienceManager.startCourse(courseId);
        }
    };

    window._continueLearningExplore = function() {
        if (window.LawAIApp?.AcademyExperienceManager) {
            window.LawAIApp.AcademyExperienceManager.navigateToSchool('school-ai');
        }
    };

    window.LawAIApp.ContinueLearningRenderer = ContinueLearningRenderer;

    console.log('[ContinueLearningRenderer] Module loaded (Part 64)');

})();
