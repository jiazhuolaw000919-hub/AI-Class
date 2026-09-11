// js/academy/academyView.js
// Part 58.5 — Lesson Structure Foundation Layer (完整版)
// Law AI Academy Developer Bible

// ============================================================
// 🔥 安全访问辅助函数（替代 ?. 可选链）
// ============================================================

/**
 * 安全获取对象属性（替代 ?.）
 * @param {Object} obj - 目标对象
 * @param {string} path - 属性路径，用 '.' 分隔
 * @returns {*} 属性值或 undefined
 */
function safeGet(obj, path) {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        current = current[parts[i]];
    }
    return current;
}

/**
 * 安全调用函数（替代 ?.()）
 * @param {Object} obj - 目标对象
 * @param {string} path - 方法路径，用 '.' 分隔
 * @param {...*} args - 参数
 * @returns {*} 函数返回值或 undefined
 */
function safeCall(obj, path) {
    var fn = safeGet(obj, path);
    if (typeof fn === 'function') {
        var args = Array.prototype.slice.call(arguments, 2);
        return fn.apply(safeGet(obj, path.substring(0, path.lastIndexOf('.'))), args);
    }
    return undefined;
}

/**
 * 安全执行表达式（用于 onclick 等内联事件）
 * 支持两种调用方式：
 * 1. __safeCall('path', arg1, arg2, ...)
 * 2. __safeCall(obj, 'path', arg1, arg2, ...)  // 兼容旧代码
 * @param {string|Object} pathOrObj - 路径字符串或对象
 * @param {...*} args - 参数
 * @returns {*} 函数返回值或 undefined
 */
function __safeCall(pathOrObj) {
    var path;
    var args = Array.prototype.slice.call(arguments);
    var obj = window;
    
    // 判断调用方式
    if (typeof pathOrObj === 'string') {
        // 方式1: __safeCall('path', arg1, arg2)
        path = pathOrObj;
        args = args.slice(1);
    } else if (typeof pathOrObj === 'object' && arguments.length >= 2 && typeof arguments[1] === 'string') {
        // 方式2: __safeCall(obj, 'path', arg1, arg2)
        obj = pathOrObj || window;
        path = arguments[1];
        args = args.slice(2);
    } else {
        console.warn('[__safeCall] Invalid arguments:', arguments);
        return undefined;
    }
    
    if (!path || typeof path !== 'string') {
        return undefined;
    }
    
    var parts = path.split('.');
    var current = obj;
    
    // 沿着路径查找
    for (var i = 0; i < parts.length - 1; i++) {
        if (current == null) return undefined;
        current = current[parts[i]];
    }
    
    var fn = current ? current[parts[parts.length - 1]] : undefined;
    
    if (typeof fn === 'function') {
        return fn.apply(current, args);
    }
    
    return undefined;
}

(function() {
    'use strict';

    // ✅ 先确保 LawAIApp 存在
    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.AcademyView) {
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
         * ═══ S4 新增: 确保 S4 内容已加载 ═══
         */
        _ensureS4ContentLoaded: function() {
            var registry = safeGet(window, 'LawAIApp.CourseRegistry');
            if (registry && typeof registry.loadFromS4 === 'function' && !registry._s4Loaded) {
                console.log('[AcademyView] 🔄 Loading S4 content...');
                return registry.loadFromS4().catch(function(err) {
                    console.warn('[AcademyView] S4 load failed, continuing with legacy content:', err);
                });
            }
            return Promise.resolve();
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
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
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

            // ═══ S4 新增: 确保 S4 内容已加载再渲染 ═══
            var self = this;
            this._ensureS4ContentLoaded().then(function() {
                // 🔥 Part 60.6: 使用 Render Router
                var viewMode = data.viewMode || 'dashboard';
                console.log('[AcademyView] Rendering viewMode:', viewMode);

                // 更新状态
                self._currentViewMode = viewMode;

                // 通过 Router 渲染
                self._renderCurrentView(container, data);
            }).catch(function(err) {
                // 如果 S4 加载失败，仍然用现有数据渲染
                console.warn('[AcademyView] S4 load error, using existing data:', err);
                var viewMode = data.viewMode || 'dashboard';
                self._currentViewMode = viewMode;
                self._renderCurrentView(container, data);
            });
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
                case 'subject':
                    this._renderSubjectView(container, data.currentSubjectId);
                    break;
                case 'lesson':
                    this._renderLessonView(container, data.currentLessonId);
                    break;
                default:
                    this._renderDashboard(container, data);
                    break;
                case 'notes':
                    this._renderNotesView(container, data);
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
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
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
                var progCount = (school.programs && school.programs.length) || 0;
                html += `
                    <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                         onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSchool', '${school.id}')"
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
            // 🔥 Part 54: Decision Experience
            // ============================================================
            var decisionContext = this._getDecisionContext();
            if (decisionContext && decisionContext.hasOptions) {
                html += this._renderDecisionOptions(decisionContext);
            }

            // ── Part 55: Recent Outcomes ──
            var outcomes = this._getRecentOutcomes();
            if (outcomes && outcomes.length > 0) {
                html += this._renderRecentOutcomes(outcomes);
            }

            // ── Part 56: Adaptation Explanation ──
            var adaptationExplanation = this._getAdaptationExplanation();
            if (adaptationExplanation) {
                html += this._renderAdaptationExplanation(adaptationExplanation);
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
            var renderer = safeGet(window, 'LawAIApp.MotivationRenderer');
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

        /**
         * Part 54: 获取决策上下文
         * @private
         */
        _getDecisionContext: function() {
            var de = safeGet(window, 'LawAIApp.DecisionExperience');
            if (!de || !de.initialized) return null;

            try {
                var context = de.getDecisionContext();
                var options = de.getOptions({ includeDismissed: false, maxCount: 5 });
                var primary = de.getPrimaryOption();

                if (!options || options.length === 0) {
                    return null;
                }

                return {
                    context: context,
                    options: options,
                    primary: primary,
                    hasOptions: options.length > 0
                };
            } catch (e) {
                console.warn('[AcademyView] Decision context error:', e);
                return null;
            }
        },

        /**
         * Part 54: 渲染决策选项
         * @private
         */
        _renderDecisionOptions: function(decisionContext) {
            if (!decisionContext || !decisionContext.options) return '';

            var options = decisionContext.options;
            var primary = decisionContext.primary;

            var html = '';
            html += `
                <div style="margin: 16px 0 20px 0; background: rgba(74,158,255,0.03); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 12px;">🎯 Your Options</div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
            `;

            for (var i = 0; i < Math.min(options.length, 5); i++) {
                var opt = options[i];
                var isPrimary = primary && primary.id === opt.id;
                var bgColor = isPrimary ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.02)';
                var borderColor = isPrimary ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.04)';

                var typeLabel = opt.type || 'OPTION';
                var actionId = opt.id;

                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: ${bgColor}; border-radius: 8px; padding: 10px 14px; border: 1px solid ${borderColor}; flex-wrap: wrap; gap: 8px;">
                        <div style="flex: 1; min-width: 120px;">
                            <div style="font-size: 14px; font-weight: 500; color: ${isPrimary ? '#4a9eff' : '#e2e8f0'};">
                                ${isPrimary ? '⭐ ' : ''}${opt.title || 'Option'}
                            </div>
                            ${opt.summary ? `<div style="font-size: 12px; color: #94a3b8;">${opt.summary}</div>` : ''}
                            ${opt.reason ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">💡 ${opt.reason}</div>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                            <span style="font-size: 10px; color: #64748b; background: rgba(255,255,255,0.04); padding: 2px 10px; border-radius: 12px;">${typeLabel}</span>
                            <button onclick="__safeCall('LawAIApp.DecisionExperience.selectOption', '${actionId}')" 
                                    style="padding: 6px 16px; background: ${isPrimary ? '#4a9eff' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${isPrimary ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)'}; border-radius: 6px; color: ${isPrimary ? 'white' : '#94a3b8'}; font-size: 12px; cursor: pointer; font-family: inherit; transition: all 0.2s;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                ${isPrimary ? 'Continue →' : 'Select'}
                            </button>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            return html;
        },

        /**
         * Part 55: 获取最近结果
         * @private
         */
        _getRecentOutcomes: function() {
            var actionTracker = safeGet(window, 'LawAIApp.ActionTracker');
            if (!actionTracker) return null;

            try {
                var history = actionTracker.getHistory(5);
                if (!history || history.length === 0) return null;

                return history;
            } catch (e) {
                console.warn('[AcademyView] Outcome error:', e);
                return null;
            }
        },

        /**
         * Part 55: 渲染最近结果
         * @private
         */
        _renderRecentOutcomes: function(outcomes) {
            if (!outcomes || outcomes.length === 0) return '';

            var html = '';
            html += `
                <div style="margin: 8px 0 16px 0; background: rgba(34,197,94,0.03); border-radius: 10px; padding: 12px 16px; border: 1px solid rgba(34,197,94,0.06);">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">📊 Recent Activity</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            `;

            for (var i = 0; i < Math.min(outcomes.length, 4); i++) {
                var action = outcomes[i];
                var typeColor = action.type === 'COMPLETE' ? '#10b981' : 
                                action.type === 'START' ? '#4a9eff' : 
                                action.type === 'DISMISS' ? '#64748b' : '#94a3b8';
                var typeEmoji = action.type === 'COMPLETE' ? '✅' : 
                                action.type === 'START' ? '▶️' : 
                                action.type === 'DISMISS' ? '✕' : '📌';
        
                html += `
                    <span style="font-size: 11px; background: rgba(255,255,255,0.04); padding: 3px 12px; border-radius: 12px; color: ${typeColor};">
                        ${typeEmoji} ${action.type} ${action.target ? '— ' + action.target : ''}
                    </span>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            return html;
        },

        /**
         * Part 56: 获取适应解释
         * @private
         */
        _getAdaptationExplanation: function() {
            var record = safeGet(window, 'LawAIApp.AdaptationRecord');
            var explainer = safeGet(window, 'LawAIApp.AdaptationExplainer');

            if (!record || !explainer) return null;

            try {
                var records = record.getRecords(3);
                if (!records || records.length === 0) return null;

                // 获取最近的有效适应
                var latest = records[0];
                if (!latest) return null;

                var explanation = explainer.explainStandard(latest);
                return {
                    record: latest,
                    explanation: explanation
                };
            } catch (e) {
                console.warn('[AcademyView] Adaptation explanation error:', e);
                return null;
            }
        },

        /**
         * Part 56: 渲染适应解释
         * @private
         */
        _renderAdaptationExplanation: function(adaptationData) {
            if (!adaptationData) return '';

            var record = adaptationData.record;
            var explanation = adaptationData.explanation;

            var statusColor = record.status === 'APPLIED' ? '#4a9eff' :
                              record.status === 'OVERRIDDEN' ? '#f59e0b' :
                              record.status === 'DISMISSED' ? '#64748b' : '#94a3b8';

            var statusLabel = record.status || 'APPLIED';

            var html = '';
            html += `
                <div style="margin: 8px 0 16px 0; background: rgba(139,92,246,0.03); border-radius: 10px; padding: 12px 16px; border: 1px solid rgba(139,92,246,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="font-size: 11px; color: ${statusColor}; font-weight: 500;">🔹 Adaptation</span>
                            <span style="font-size: 10px; color: #64748b; margin-left: 8px;">${statusLabel}</span>
                        </div>
                        <span style="font-size: 9px; color: #475569;">${record.levelLabel || 'Level ' + record.level}</span>
                    </div>
                    <div style="font-size: 13px; color: #e2e8f0; margin-top: 4px;">
                        ${explanation ? explanation.text : (record.reason || 'Adaptation applied')}
                    </div>
                    ${record.evidence && record.evidence.length > 0 ? `
                        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
                            📎 ${record.evidence.slice(0, 2).join('; ')}${record.evidence.length > 2 ? '...' : ''}
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
            var courseRegistry = safeGet(window, 'LawAIApp.CourseRegistry');
            var course = courseRegistry ? courseRegistry.getCourse(continueData.courseId) : null;

            // 获取 Module/Lesson 元数据
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
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
            var renderer = safeGet(window, 'LawAIApp.ContinueLearningRenderer');
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
                            <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSchool', 'school-ai')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * 🔥 Part 60: 获取学习引导信息
         */
        _getLearningGuidance: function() {
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
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
            var courseRegistry = safeGet(window, 'LawAIApp.CourseRegistry');
            if (courseRegistry && courseId) {
                var course = courseRegistry.getCourse(courseId);
                if (course) {
                    courseName = course.title || course.name || 'Current Course';
                }
            }

            var academyRegistry = safeGet(window, 'LawAIApp.AcademyRegistry');
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
                            <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSchool', 'school-ai')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                        </div>
                    </div>
                </div>
            `;
        },

        _renderSchoolView: function(container, schoolId) {
            // 🔥 Part 166: 通过 SchoolViewModel 读取
            var viewModel = window.LawAIApp?.SchoolViewModel;
        
            if (!viewModel) {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading School...</div>';
                return;
            }
        
            var detail = viewModel.buildSchoolDetail(schoolId);
        
            if (detail.status === 'LOADING') {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading School...</div>';
                return;
            }
        
            if (detail.status === 'NOT_FOUND') {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🏛️</div>
                        <p style="font-size: 16px; margin: 0;">School not found</p>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer; font-family: inherit;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }
        
            var school = detail.school;
            var courses = detail.courses;
        
            var html = '';
        
            // 返回栏
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Academy
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;
        
            // School 头部
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
        
            // Course 列表
            if (courses && courses.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📚 Courses (${courses.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;
        
                for (var i = 0; i < courses.length; i++) {
                    var course = courses[i];
                    var levelColor = course.difficulty === 'beginner' ? '#10b981' : 
                                    course.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444';
                    var levelEmoji = course.difficulty === 'beginner' ? '🟢' : 
                                    course.difficulty === 'intermediate' ? '🟡' : '🔴';
        
                    // 🔥 Part 166: 进度来自 ViewModel（原自 Progress）
                    var progressText = course.progress && course.progress.available
                        ? course.progress.percent + '%'
                        : '—';
        
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToCourse', '${course.courseId}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div style="flex: 1;">
                                    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${course.name}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${course.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                                        <span style="color: ${levelColor}; font-size: 12px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${levelEmoji} ${course.difficulty || 'beginner'}</span>
                                        <span style="color: #64748b; font-size: 12px;">${course.subjectCount || 0} subjects</span>
                                        <span style="color: #4a9eff; font-size: 12px;">📊 ${progressText}</span>
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
                        <p>📝 No courses available for this school yet.</p>
                    </div>
                `;
            }
        
            html += `</div>`;
            container.innerHTML = html;
        },

        /**
         * 🔥 Program / Course View（兼容）
         */
        _renderProgramView: function(container, programId) {
            var viewModel = window.LawAIApp?.SchoolViewModel;
            if (!viewModel) {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading...</div>';
                return;
            }

            // 🔥 先尝试从 CourseRegistry 拿（因为 programId 实际是 courseId）
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            var course = null;
            if (courseRegistry) {
                course = courseRegistry.getCourse(programId);
            }

            // Fallback: 用 buildCourseCard
            if (!course) {
                var card = viewModel.buildCourseCard(programId);
                if (card && card.status !== 'UNKNOWN') {
                    course = card;
                }
            }

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
                        <p>Course not found</p>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            // 🔥 从 CurriculumAuthority / SubjectRegistry 拿 subjects
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            var subjectRegistry = window.LawAIApp?.SubjectRegistry;

            var subjects = [];
            if (curriculum && typeof curriculum.getSubjectsByCourse === 'function') {
                subjects = curriculum.getSubjectsByCourse(programId) || [];
            }
            if (subjects.length === 0 && subjectRegistry) {
                subjects = subjectRegistry.getSubjectsByCourse(programId) || [];
            }

            var schoolId = course.schoolId || null;
            var title = course.title || course.name || 'Course';
            var description = course.description || '';
            var icon = course.icon || '📚';
            var difficulty = course.difficulty || 'beginner';

            var levelColor = difficulty === 'beginner' ? '#10b981' : 
                            difficulty === 'intermediate' ? '#f59e0b' : '#ef4444';
            var levelEmoji = difficulty === 'beginner' ? '🟢' : 
                            difficulty === 'intermediate' ? '🟡' : '🔴';

            var html = '';

            // 返回栏
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSchool', '${schoolId || ''}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to School
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📚 Course</span>
                </div>
            `;

            // Course 头部
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">${icon}</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${description}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${levelColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${levelEmoji} ${difficulty}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${subjects.length} subjects</span>
                    </div>
            `;

            // Subject 列表
            if (subjects && subjects.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📖 Subjects (${subjects.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < subjects.length; i++) {
                    var subject = subjects[i];
                    var lessonCount = subject.lessons ? subject.lessons.length : 0;
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="__safeCall('LawAIApp.AcademyExperienceManager.selectSubject', '${subject.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${subject.title || subject.name}</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${subject.description || ''}</p>
                            <span style="color: #64748b; font-size: 12px;">📖 ${lessonCount} lessons</span>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>📝 No subjects available for this course yet.</p>
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
            // 🔥 Part 167: 通过 SchoolViewModel 读取完整 Course 详情
            var viewModel = window.LawAIApp?.SchoolViewModel;
            if (!viewModel || !viewModel.buildCourseDetail) {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading...</div>';
                return;
            }
        
            var detail = viewModel.buildCourseDetail(courseId);
        
            if (detail.status === 'LOADING') {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading Course...</div>';
                return;
            }
        
            if (detail.status === 'NOT_FOUND') {
                container.innerHTML = this._renderCourseNotFound();
                return;
            }
        
            var course = detail.identity;
            var objectives = detail.learningObjectives;
            var prereqs = detail.prerequisites;
            var structure = detail.structure;
            var progress = detail.progress;
            var mastery = detail.mastery;
            var recommendation = detail.recommendation;
            var schedule = detail.schedule;
            var notes = detail.notes;
        
            var levelColor = course.difficulty === 'beginner' ? '#10b981' : 
                            course.difficulty === 'intermediate' ? '#f59e0b' : '#ef4444';
            var levelEmoji = course.difficulty === 'beginner' ? '🟢' : 
                            course.difficulty === 'intermediate' ? '🟡' : '🔴';
        
            // 进度显示
            var progressPercent = progress && progress.available ? progress.percent : 0;
            var progressLabel = progress && progress.available ? progressPercent + '%' : '—';
        
            // 掌握度显示
            var masteryLabel = mastery && mastery.available ? (mastery.label || 'Unknown') : 'Unavailable';
        
            var html = '';
        
            // ============================================================
            // 1. 返回栏
            // ============================================================
            html += `
                <div class="academy-back-bar" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSchool', '${course.schoolId || ''}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to School
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
                        <div style="font-size: 56px; line-height: 1;">${course.icon}</div>
                        <div style="flex: 1; min-width: 200px;">
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${course.name}</h1>
                            <p style="color: #94a3b8; font-size: 15px; margin: 0 0 8px 0;">${course.description}</p>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <span style="color: ${levelColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${levelEmoji} ${course.difficulty}</span>
                                <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${structure.subjectCount} subjects</span>
                                ${course.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${course.estimatedHours}h</span>` : ''}
                            </div>
                        </div>
                    </div>
            `;
        
            // ============================================================
            // 3. Recommendation Context（如果存在）
            // ============================================================
            if (recommendation && recommendation.isRecommended) {
                html += `
                    <div style="margin: 16px 0; background: rgba(139,92,246,0.06); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(139,92,246,0.12); border-left: 3px solid #8b5cf6;">
                        <div style="font-size: 11px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 4px;">💡 RECOMMENDED</div>
                        <div style="font-size: 14px; color: #e2e8f0;">${recommendation.reason || 'Suggested for you'}</div>
                        ${recommendation.confidence ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Confidence: ${recommendation.confidence}</div>` : ''}
                    </div>
                `;
            }
        
            // ============================================================
            // 4. Progress + Mastery 面板
            // ============================================================
            html += `
                <div style="margin: 20px 0 24px 0; background: rgba(74,158,255,0.04); border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                            <div>
                                <div style="font-size: 12px; color: #94a3b8;">📊 Progress</div>
                                <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${progressLabel}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #94a3b8;">🧠 Mastery</div>
                                <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${masteryLabel}</div>
                            </div>
                        </div>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.startCourse', '${courseId}')" 
                                style="padding: 12px 32px; background: #4a9eff; border: none; border-radius: 10px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; font-family: inherit;">
                            🚀 ${progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                        </button>
                    </div>
                    ${progress && progress.available && progressPercent > 0 ? `
                        <div style="margin-top: 12px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${progressPercent}%; transition: width 0.5s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        
            // ============================================================
            // 5. Prerequisites（如果有）
            // ============================================================
            if (prereqs.available && (prereqs.required.length > 0 || prereqs.suggested.length > 0)) {
                html += `
                    <div style="margin-bottom: 24px; background: rgba(245,158,11,0.04); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(245,158,11,0.08);">
                        <div style="font-size: 12px; color: #f59e0b; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📋 PREREQUISITES</div>
                `;
        
                if (prereqs.required.length > 0) {
                    html += `<div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; color: #ef4444; margin-bottom: 4px;">Required</div>`;
                    prereqs.required.forEach(function(p) {
                        var icon = p.satisfied ? '✅' : '⭕';
                        html += `<div style="font-size: 13px; color: #e2e8f0; padding: 2px 0;">${icon} ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                if (prereqs.suggested.length > 0) {
                    html += `<div>
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Suggested</div>`;
                    prereqs.suggested.forEach(function(p) {
                        html += `<div style="font-size: 13px; color: #94a3b8; padding: 2px 0;">○ ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                html += `</div>`;
            }
        
            // ============================================================
            // 6. Learning Objectives（如果有）
            // ============================================================
            if (objectives.available && objectives.objectives.length > 0) {
                html += `
                    <div style="margin-bottom: 24px;">
                        <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🎯 Learning Objectives</h2>
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.04);">
                            <ul style="margin: 0; padding-left: 20px; color: #94a3b8;">
                                ${objectives.objectives.map(function(o) {
                                    return `<li style="padding: 4px 0; font-size: 13px;">${o}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
        
            // ============================================================
            // 7. Course Structure (Subjects)
            // ============================================================
            if (structure.subjects && structure.subjects.length > 0) {
                html += `
                    <div style="margin-top: 8px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Subjects (${structure.subjectCount})</h2>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                `;
        
                for (var i = 0; i < structure.subjects.length; i++) {
                    var subject = structure.subjects[i];
                    html += `
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="__safeCall('LawAIApp.AcademyExperienceManager.selectSubject', '${subject.subjectId}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 500; font-size: 15px;">${subject.title}</div>
                                    ${subject.description ? `<div style="color: #64748b; font-size: 13px; margin-top: 2px;">${subject.description}</div>` : ''}
                                    ${subject.lessonCount > 0 ? `<div style="color: #64748b; font-size: 12px; margin-top: 4px;">📖 ${subject.lessonCount} lessons</div>` : ''}
                                </div>
                                <span style="color: #4a9eff; font-size: 16px;">→</span>
                            </div>
                        </div>
                    `;
                }
        
                html += `</div></div>`;
            } else {
                html += this._renderEmptyModuleState();
            }
        
            // ============================================================
            // 8. Schedule Context（如果有）
            // ============================================================
            if (schedule && schedule.available && schedule.count > 0) {
                html += `
                    <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(74,158,255,0.08);">
                        <div style="font-size: 12px; color: #4a9eff; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📅 SCHEDULED</div>
                        <div style="font-size: 13px; color: #e2e8f0;">
                            ${schedule.count} session${schedule.count > 1 ? 's' : ''} scheduled
                        </div>
                        ${schedule.nextSession ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Next: ${new Date(schedule.nextSession.startAt).toLocaleString()}</div>` : ''}
                    </div>
                `;
            }
        
            // ============================================================
            // 9. Notes Context（如果有）
            // ============================================================
            if (notes && notes.available && notes.count > 0) {
                html += `
                    <div style="margin-top: 16px; background: rgba(139,92,246,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(139,92,246,0.08);">
                        <div style="font-size: 12px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📓 YOUR NOTES</div>
                        <div style="font-size: 13px; color: #e2e8f0;">${notes.count} note${notes.count > 1 ? 's' : ''} linked to this course</div>
                        ${notes.recent.length > 0 ? notes.recent.map(function(n) {
                            return `<div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 6px; border-left: 2px solid #8b5cf6; font-size: 12px; color: #94a3b8;">💭 ${n.title}</div>`;
                        }).join('') : ''}
                    </div>
                `;
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
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.startCourse', '${courseId}')" 
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
         * 渲染 Course Not Found
         */
        _renderCourseNotFound: function() {
            return `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
                    <p style="font-size: 16px; margin: 0;">Course not found</p>
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                            style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                        ← Back to Academy
                    </button>
                </div>
            `;
        },

        /**
         * 🔥 通用空状态（课程/科目/模块都可复用）
         */
        _renderEmptyModuleState: function() {
            return `
                <div style="margin-top: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📚 Content</h2>
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                        <p style="font-size: 16px; margin: 0; font-weight: 500;">Content is being prepared</p>
                        <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Check back soon for lessons</p>
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
         * 🔥 Course Learning View — 直接显示 Subjects（不依赖 modules）
         */
        _renderCourseLearningView: function(container, courseId) {
            var courseRegistry = safeGet(window, 'LawAIApp.CourseRegistry');
            var course = courseRegistry ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            // 🔥 直接拿 Subjects（不走 modules）
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            var subjectRegistry = window.LawAIApp?.SubjectRegistry;

            var subjects = [];
            if (curriculum && typeof curriculum.getSubjectsByCourse === 'function') {
                subjects = curriculum.getSubjectsByCourse(courseId) || [];
            }
            if (subjects.length === 0 && subjectRegistry) {
                subjects = subjectRegistry.getSubjectsByCourse(courseId) || [];
            }

            // 进度
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
            var state = adapter ? adapter.getState() : null;
            var progress = state ? state.progress : 0;

            var html = '';

            // 返回栏
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToCourse', '${courseId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
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
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${course.title || course.name}</h1>
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
            `;

            // 🔥 显示 Subjects 列表
            if (subjects && subjects.length > 0) {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📚 Subjects (${subjects.length})</h2>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                `;

                subjects.forEach(function(subject, index) {
                    var lessonCount = subject.lessons ? subject.lessons.length : 0;

                    html += `
                        <div style="background: rgba(255,255,255,0.03); border-radius: 10px; padding: 16px 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="__safeCall('LawAIApp.AcademyExperienceManager.selectSubject', '${subject.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 20px;">${subject.icon || '📖'}</span>
                                    <div>
                                        <div style="font-weight: 500; font-size: 15px; color: #e2e8f0;">
                                            ${index + 1}. ${subject.title || subject.name}
                                        </div>
                                        ${subject.description ? `<div style="color: #64748b; font-size: 13px; margin-top: 2px;">${subject.description}</div>` : ''}
                                        <div style="color: #64748b; font-size: 12px; margin-top: 4px;">📖 ${lessonCount} lessons</div>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 16px;">→</span>
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            } else {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📚 Subjects</h2>
                        <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="font-size: 16px; margin: 0; font-weight: 500;">No subjects available for this course yet</p>
                            <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Content coming soon</p>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

         /**
         * 🔥 Module View（兼容 — 实际上是 Subject 视图）
         */
        _renderModuleView: function(container, moduleId) {
            // 🔥 优先从 SubjectRegistry 拿
            var subjectRegistry = window.LawAIApp?.SubjectRegistry;
            var subject = subjectRegistry ? subjectRegistry.getSubject(moduleId) : null;

            // Fallback：从 CurriculumAuthority 拿
            if (!subject) {
                var ca = window.LawAIApp?.CurriculumAuthority;
                if (ca && typeof ca.getSubject === 'function') {
                    subject = ca.getSubject(moduleId);
                }
            }

            if (!subject) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
                        <p>Subject not found</p>
                        <p style="font-size: 12px; color: #64748b;">ID: ${moduleId}</p>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var courseId = subject.courseId;
            var course = null;
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && courseId) {
                course = courseRegistry.getCourse(courseId);
            }

            var lessons = subject.lessons || [];

            var html = '';

            // 返回栏
            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToCourse', '${courseId || ''}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Course
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Subject</span>
                </div>
            `;

            // Subject 头部
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">${subject.icon || '📖'}</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${subject.title || subject.name}</h1>
                            ${subject.description ? `<p style="color: #94a3b8; font-size: 14px; margin: 0;">${subject.description}</p>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${lessons.length} lessons</span>
                    </div>
            `;

            // Lessons 列表
            if (lessons && lessons.length > 0) {
                html += `
                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📖 Lessons (${lessons.length})</h2>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                `;

                lessons.forEach(function(lesson, index) {
                    // 🔥 兼容字符串 ID 和对象两种格式
                    var lessonId, lessonTitle, lessonDesc, lessonDuration;
                    if (typeof lesson === 'string') {
                        lessonId = lesson;
                        lessonTitle = lesson;
                        lessonDesc = '';
                        lessonDuration = null;
                    } else {
                        lessonId = lesson.id || lesson.lessonId;
                        lessonTitle = lesson.title || lesson.name || 'Untitled Lesson';
                        lessonDesc = lesson.description || '';
                        lessonDuration = lesson.duration || null;
                    }

                    html += `
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.location.href='/pages/lesson.html?lessonId=${lessonId}'"
                             onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 14px; color: #64748b; font-weight: 500; min-width: 32px;">${String(index + 1).padStart(2, '0')}</span>
                                    <div>
                                        <div style="font-weight: 500; font-size: 14px;">${lessonTitle}</div>
                                        ${lessonDesc ? `<div style="color: #64748b; font-size: 12px; margin-top: 2px;">${lessonDesc}</div>` : ''}
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    ${lessonDuration ? `<span style="color: #64748b; font-size: 11px;">⏱️ ${lessonDuration}min</span>` : ''}
                                    <span style="color: #4a9eff; font-size: 16px;">→</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>📝 No lessons available for this subject yet.</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

       /**
         * Part 168: Subject View — 通过 SchoolViewModel 读取
         */
        _renderSubjectView: function(container, subjectId) {
            // 🔥 Part 168: 通过 SchoolViewModel 读取完整 Subject 详情
            var viewModel = window.LawAIApp?.SchoolViewModel;
            if (!viewModel || !viewModel.buildSubjectDetail) {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading Subject...</div>';
                return;
            }
        
            var detail = viewModel.buildSubjectDetail(subjectId);
        
            if (detail.status === 'LOADING') {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">⏳ Loading Subject...</div>';
                return;
            }
        
            if (detail.status === 'NOT_FOUND') {
                container.innerHTML = this._renderSubjectNotFound();
                return;
            }
        
            var subject = detail.identity;
            var courseContext = detail.courseContext;
            var objectives = detail.learningObjectives;
            var prereqs = detail.prerequisites;
            var structure = detail.structure;
            var progress = detail.progress;
            var mastery = detail.mastery;
            var recommendation = detail.recommendation;
            var schedule = detail.schedule;
            var notes = detail.notes;
        
            // 进度显示
            var progressPercent = progress && progress.available ? progress.percent : 0;
            var progressLabel = progress && progress.available 
                ? (progress.completed + '/' + progress.total) 
                : '—';
            var progressPercentLabel = progress && progress.available ? progressPercent + '%' : '—';
        
            // 掌握度显示
            var masteryLabel = mastery && mastery.available ? (mastery.label || 'Unknown') : 'Unavailable';
        
            var html = '';
        
            // ============================================================
            // 1. 返回栏
            // ============================================================
            var backTarget = courseContext ? courseContext.courseId : '';
            var backLabel = courseContext ? ('Back to ' + courseContext.title) : 'Back to Course';
        
            html += `
                <div class="academy-back-bar" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToCourse', '${backTarget}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> ${backLabel}
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Subject</span>
                </div>
            `;
        
            // ============================================================
            // 2. Subject Header
            // ============================================================
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: flex-start; gap: 20px; margin-bottom: 12px; flex-wrap: wrap;">
                        <div style="font-size: 56px; line-height: 1;">${subject.icon}</div>
                        <div style="flex: 1; min-width: 200px;">
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${subject.title}</h1>
                            <p style="color: #94a3b8; font-size: 15px; margin: 0 0 8px 0;">${subject.description}</p>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${structure.lessonCount} lessons</span>
                                ${subject.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${subject.estimatedHours}h</span>` : ''}
                            </div>
                        </div>
                    </div>
            `;
        
            // ============================================================
            // 3. Recommendation Context
            // ============================================================
            if (recommendation && recommendation.isRecommended) {
                html += `
                    <div style="margin: 16px 0; background: rgba(139,92,246,0.06); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(139,92,246,0.12); border-left: 3px solid #8b5cf6;">
                        <div style="font-size: 11px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 4px;">💡 RECOMMENDED</div>
                        <div style="font-size: 14px; color: #e2e8f0;">${recommendation.reason || 'Suggested for you'}</div>
                    </div>
                `;
            }
        
            // ============================================================
            // 4. Progress + Mastery 面板
            // ============================================================
            html += `
                <div style="margin: 20px 0 24px 0; background: rgba(74,158,255,0.04); border-radius: 14px; padding: 20px 24px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div style="display: flex; gap: 24px; flex-wrap: wrap;">
                            <div>
                                <div style="font-size: 12px; color: #94a3b8;">📊 Progress</div>
                                <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${progressPercentLabel}</div>
                                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${progressLabel} lessons</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #94a3b8;">🧠 Mastery</div>
                                <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">${masteryLabel}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
            // ============================================================
            // 5. Prerequisites
            // ============================================================
            if (prereqs.available && (prereqs.required.length > 0 || prereqs.suggested.length > 0)) {
                html += `
                    <div style="margin-bottom: 24px; background: rgba(245,158,11,0.04); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(245,158,11,0.08);">
                        <div style="font-size: 12px; color: #f59e0b; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📋 PREREQUISITES</div>
                `;
        
                if (prereqs.required.length > 0) {
                    html += `<div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; color: #ef4444; margin-bottom: 4px;">Required</div>`;
                    prereqs.required.forEach(function(p) {
                        var icon = p.satisfied ? '✅' : '⭕';
                        html += `<div style="font-size: 13px; color: #e2e8f0; padding: 2px 0;">${icon} ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                if (prereqs.suggested.length > 0) {
                    html += `<div>
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Suggested</div>`;
                    prereqs.suggested.forEach(function(p) {
                        html += `<div style="font-size: 13px; color: #94a3b8; padding: 2px 0;">○ ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                html += `</div>`;
            }
        
            // ============================================================
            // 6. Learning Objectives
            // ============================================================
            if (objectives.available && objectives.objectives.length > 0) {
                html += `
                    <div style="margin-bottom: 24px;">
                        <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🎯 Learning Objectives</h2>
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.04);">
                            <ul style="margin: 0; padding-left: 20px; color: #94a3b8;">
                                ${objectives.objectives.map(function(o) {
                                    return `<li style="padding: 4px 0; font-size: 13px;">${o}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
        
            // ============================================================
            // 7. Lessons 列表
            // ============================================================
            if (structure.lessons && structure.lessons.length > 0) {
                html += `
                    <div style="margin-top: 8px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📖 Lessons (${structure.lessonCount})</h2>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                `;
        
                for (var i = 0; i < structure.lessons.length; i++) {
                    var lesson = structure.lessons[i];
                    var lessonNum = String(lesson.order).padStart(2, '0');
        
                   html += `
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.location.href='/pages/lesson.html?lessonId=${lesson.lessonId}'"
                             onmouseover="this.style.background='rgba(255,255,255,0.06)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 14px; color: #64748b; font-weight: 500; min-width: 32px;">${lessonNum}</span>
                                    <div>
                                        <div style="font-weight: 500; font-size: 14px;">${lesson.title}</div>
                                        ${lesson.description ? `<div style="color: #64748b; font-size: 12px; margin-top: 2px;">${lesson.description}</div>` : ''}
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    ${lesson.duration ? `<span style="color: #64748b; font-size: 11px;">⏱️ ${lesson.duration}min</span>` : ''}
                                    <span style="color: #4a9eff; font-size: 16px;">→</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
        
                html += `</div></div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>📝 No lessons available for this subject yet.</p>
                    </div>
                `;
            }
        
            // ============================================================
            // 8. Schedule Context
            // ============================================================
            if (schedule && schedule.available && schedule.count > 0) {
                html += `
                    <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(74,158,255,0.08);">
                        <div style="font-size: 12px; color: #4a9eff; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📅 SCHEDULED</div>
                        <div style="font-size: 13px; color: #e2e8f0;">${schedule.count} session${schedule.count > 1 ? 's' : ''} scheduled</div>
                        ${schedule.nextSession ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Next: ${new Date(schedule.nextSession.startAt).toLocaleString()}</div>` : ''}
                    </div>
                `;
            }
        
            // ============================================================
            // 9. Notes Context
            // ============================================================
            if (notes && notes.available && notes.count > 0) {
                html += `
                    <div style="margin-top: 16px; background: rgba(139,92,246,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(139,92,246,0.08);">
                        <div style="font-size: 12px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📓 YOUR NOTES</div>
                        <div style="font-size: 13px; color: #e2e8f0;">${notes.count} note${notes.count > 1 ? 's' : ''} linked to this subject</div>
                    </div>
                `;
            }
        
            html += `</div>`;
            container.innerHTML = html;
        },
        
        /**
         * Part 168: Subject Not Found
         */
        _renderSubjectNotFound: function() {
            return `
                <div style="padding: 40px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
                    <p style="font-size: 16px; margin: 0;">Subject not found</p>
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                            style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer; font-family: inherit;">
                        ← Back to Academy
                    </button>
                </div>
            `;
        },

        /**
         * 🔥 Part 34 Finalization: Notes View
         */
        _renderNotesView: function(container, data) {
            // 检查是否有 Notes 数据
            var notesModule = safeGet(window, 'LawAIApp.Notes') || safeGet(window, 'LawAIApp.KnowledgeCapture');
            var notesData = [];
    
            // 尝试从 Notes 模块获取数据
            if (notesModule && typeof notesModule.getNotes === 'function') {
                notesData = notesModule.getNotes() || [];
            }
    
            // 如果没有 Notes 模块，从 LearningJourneyAdapter 获取已完成的 Lessons
            if (!notesData || notesData.length === 0) {
                var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
                var state = adapter ? adapter.getState() : null;
                var completedLessons = state && state.completedLessons ? state.completedLessons : [];
        
                if (completedLessons && completedLessons.length > 0) {
                    // TODO: 从 Lesson 数据中提取知识点
                    notesData = completedLessons.map(function(lessonId) {
                        return {
                            id: lessonId,
                            title: 'Lesson ' + lessonId,
                            content: 'Knowledge from this lesson will appear here',
                            lessonId: lessonId,
                            createdAt: new Date().toISOString()
                        };
                    });
                }
            }
    
            if (!notesData || notesData.length === 0) {
                container.innerHTML = this._renderNotesEmptyState();
                return;
            }
    
            container.innerHTML = this._renderNotesList(notesData);
        },

        _renderNotesEmptyState: function() {
            return `
                <div style="padding: 60px 20px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                    <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #e2e8f0;">No Notes Yet</h3>
                    <p style="font-size: 15px; margin: 0;">Complete a lesson to start building your personal knowledge library.</p>
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                            style="margin-top: 16px; padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; font-family: inherit;">
                        📖 Start Learning
                    </button>
                </div>
            `;
        },

        /**
         * 🔥 Part 34 Finalization: Notes List
         */
        _renderNotesList: function(notesData) {
            var html = '';
    
            html += `
                <div style="padding: 0 16px 32px; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">📝 Your Notes</h2>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${notesData.length} knowledge assets captured</p>
                        </div>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="padding: 8px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; cursor: pointer; font-family: inherit;">
                            ← Back to Academy
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            `;
    
            // 🔥 修复：使用 for 循环代替 forEach（避免嵌套函数声明问题）
            for (var i = 0; i < notesData.length; i++) {
                var note = notesData[i];
                var title = note.title || 'Untitled Note';
                var content = note.content || note.summary || 'No content';
                var date = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently';
                var lessonId = note.lessonId || '';
        
                html += `
                    <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px;">${title}</div>
                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">${content}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
                            <span>📖 ${lessonId || 'No lesson'}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                `;
            }
    
            html += `
                    </div>
                </div>
            `;
    
            return html;
        },

        /**
         * 🔥 Part 169: Lesson View (On-Demand Loading + Legacy Fallback + Context)
         */
        _renderLessonView: function(container, lessonId) {
            var self = this;
        
            // ═══ Part 7: 检查加载状态 ═══
            var loader = safeGet(window, 'LawAIApp.S4ContentLoader') || safeGet(window, 'LawAIApp.ContentLoader');
            if (loader && typeof loader.getLessonLoadStatus === 'function') {
                var status = loader.getLessonLoadStatus(lessonId);
                if (status.status === 'loading') {
                    container.innerHTML = this._renderLessonLoadingState();
                    return;
                }
                if (status.status === 'error') {
                    container.innerHTML = this._renderLessonErrorState(lessonId, status.error);
                    return;
                }
            }
        
            // ═══════════════════════════════════════════════════════════════
            // 1. 先尝试从 LearningJourneyAdapter 获取基础信息（保留原逻辑）
            // ═══════════════════════════════════════════════════════════════
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
            var lesson = adapter ? adapter.getLessonDetail(lessonId) : null;
        
            if (!lesson) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Lesson not found</p>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }
        
            // ═══════════════════════════════════════════════════════════════
            // 🔥 Part 169: 从 SchoolViewModel 获取完整 Lesson 详情
            // ═══════════════════════════════════════════════════════════════
            var schoolVM = window.LawAIApp?.SchoolViewModel;
            var lessonDetail = null;
        
            if (schoolVM && schoolVM.buildLessonDetail) {
                try {
                    lessonDetail = schoolVM.buildLessonDetail(lessonId);
                } catch (e) {
                    console.warn('[AcademyView] LessonViewModel error:', e);
                }
            }
        
            // 优先使用 ViewModel 的数据，否则 fallback 到 adapter
            var lessonIdentity = (lessonDetail && lessonDetail.status === 'READY')
                ? lessonDetail.identity
                : {
                    lessonId: lessonId,
                    title: lesson.name || 'Lesson',
                    description: lesson.description || '',
                    duration: lesson.duration || null,
                    status: 'ACTIVE'
                };
        
            var lessonContext = (lessonDetail && lessonDetail.status === 'READY')
                ? lessonDetail.context
                : null;
        
            var objectives = (lessonDetail && lessonDetail.learningObjectives)
                ? lessonDetail.learningObjectives
                : { available: false, status: 'NOT_AVAILABLE' };
        
            var prereqs = (lessonDetail && lessonDetail.prerequisites)
                ? lessonDetail.prerequisites
                : { available: false, required: [], suggested: [] };
        
            var recommendation = (lessonDetail && lessonDetail.recommendation)
                ? lessonDetail.recommendation
                : null;
        
            var schedule = (lessonDetail && lessonDetail.schedule)
                ? lessonDetail.schedule
                : { available: false, count: 0 };
        
            var notes = (lessonDetail && lessonDetail.notes)
                ? lessonDetail.notes
                : { available: false, count: 0 };
        
            var lessonProgress = (lessonDetail && lessonDetail.progress)
                ? lessonDetail.progress
                : { available: false, status: 'UNKNOWN' };
        
            var lessonMastery = (lessonDetail && lessonDetail.mastery)
                ? lessonDetail.mastery
                : { available: false, status: 'UNKNOWN' };
        
            // 状态图标
            var isCompleted = lesson.isCompleted || false;
            var statusIcon = isCompleted ? '✅' : '📄';
            var statusColor = isCompleted ? '#10b981' : '#4a9eff';
            var statusText = isCompleted ? 'Completed' : 'Ready';
        
            // ═══════════════════════════════════════════════════════════════
            // 2. 构建基础 HTML（返回栏 + 头部 + Context + Session Panel）
            // ═══════════════════════════════════════════════════════════════
            var html = '';
        
            // ─────────────────────────────────────────────────────────────
            // 返回栏 — Back to Subject
            // ─────────────────────────────────────────────────────────────
            var backTarget = lesson.moduleId || (lessonContext && lessonContext.subject ? lessonContext.subject.subjectId : '');
            var backLabel = 'Back to Subject';
        
            if (lessonContext && lessonContext.subject) {
                backLabel = 'Back to ' + lessonContext.subject.title;
            }
        
            html += `
                <div class="academy-back-bar" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToSubject', '${backTarget}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> ${backLabel}
                    </button>
                    ${lessonContext && lessonContext.course ? `
                        <span style="color: #475569; font-size: 14px;">|</span>
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.navigateToCourse', '${lessonContext.course.courseId}')" 
                                style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.04); color: #94a3b8; border: 1px solid rgba(255,255,255,0.06); font-family: inherit;">
                            📘 ${lessonContext.course.title}
                        </button>
                    ` : ''}
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Lesson</span>
                </div>
            `;
        
            // ─────────────────────────────────────────────────────────────
            // 主内容容器
            // ─────────────────────────────────────────────────────────────
            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
        
                    <!-- ─── Lesson Header ─── -->
                    <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 8px; flex-wrap: wrap;">
                        <span style="font-size: 40px; line-height: 1;">${statusIcon}</span>
                        <div style="flex: 1; min-width: 200px;">
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${lessonIdentity.title}</h1>
                            ${lessonIdentity.description ? `<p style="color: #94a3b8; font-size: 14px; margin: 0 0 8px 0;">${lessonIdentity.description}</p>` : ''}
                            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusIcon} ${statusText}</span>
                                ${lessonIdentity.duration ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${lessonIdentity.duration} min</span>` : ''}
                                ${lessonContext && lessonContext.subject ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">📖 ${lessonContext.subject.title}</span>` : ''}
                            </div>
                        </div>
                    </div>
            `;
        
            // ─────────────────────────────────────────────────────────────
            // 🔥 Part 169: Lesson Context (Breadcrumb)
            // ─────────────────────────────────────────────────────────────
            if (lessonContext && lessonContext.breadcrumb) {
                html += `
                    <div style="margin: 8px 0 16px 0; padding: 8px 12px; background: rgba(255,255,255,0.015); border-radius: 8px; font-size: 11px; color: #475569; border: 1px solid rgba(255,255,255,0.02);">
                        ${lessonContext.breadcrumb}
                    </div>
                `;
            }
        
            // ─────────────────────────────────────────────────────────────
            // 🔥 Part 169: Recommendation Context
            // ─────────────────────────────────────────────────────────────
            if (recommendation && recommendation.isRecommended) {
                html += `
                    <div style="margin: 0 0 16px 0; background: rgba(139,92,246,0.06); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(139,92,246,0.12); border-left: 3px solid #8b5cf6;">
                        <div style="font-size: 11px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 4px;">💡 RECOMMENDED</div>
                        <div style="font-size: 14px; color: #e2e8f0;">${recommendation.reason || 'Suggested for you'}</div>
                        ${recommendation.confidence ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Confidence: ${recommendation.confidence}</div>` : ''}
                    </div>
                `;
            }
        
            // ─────────────────────────────────────────────────────────────
            // 🔥 Part 169: Prerequisites
            // ─────────────────────────────────────────────────────────────
            if (prereqs.available && (prereqs.required.length > 0 || prereqs.suggested.length > 0)) {
                html += `
                    <div style="margin-bottom: 16px; background: rgba(245,158,11,0.04); border-radius: 12px; padding: 16px 20px; border: 1px solid rgba(245,158,11,0.08);">
                        <div style="font-size: 12px; color: #f59e0b; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 8px;">📋 PREREQUISITES</div>
                `;
        
                if (prereqs.required.length > 0) {
                    html += `<div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; color: #ef4444; margin-bottom: 4px;">Required</div>`;
                    prereqs.required.forEach(function(p) {
                        var icon = p.satisfied ? '✅' : '⭕';
                        html += `<div style="font-size: 13px; color: #e2e8f0; padding: 2px 0;">${icon} ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                if (prereqs.suggested.length > 0) {
                    html += `<div>
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Suggested</div>`;
                    prereqs.suggested.forEach(function(p) {
                        html += `<div style="font-size: 13px; color: #94a3b8; padding: 2px 0;">○ ${p.name}</div>`;
                    });
                    html += `</div>`;
                }
        
                html += `</div>`;
            }
        
            // ─────────────────────────────────────────────────────────────
            // 🔥 Part 169: Learning Objectives
            // ─────────────────────────────────────────────────────────────
            if (objectives.available && objectives.objectives.length > 0) {
                html += `
                    <div style="margin-bottom: 16px;">
                        <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">🎯 Learning Objectives</h3>
                        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.04);">
                            <ul style="margin: 0; padding-left: 20px; color: #94a3b8;">
                                ${objectives.objectives.map(function(o) {
                                    return `<li style="padding: 3px 0; font-size: 13px;">${o}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
        
            // ─────────────────────────────────────────────────────────────
            // 🔥 Part 169: Progress + Mastery + Schedule + Notes Summary
            // ─────────────────────────────────────────────────────────────
            var hasSummaryData = (lessonProgress && lessonProgress.available) ||
                                (lessonMastery && lessonMastery.available) ||
                                (schedule && schedule.available && schedule.count > 0) ||
                                (notes && notes.available && notes.count > 0);
        
            if (hasSummaryData) {
                html += `
                    <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                `;
        
                // Progress
                if (lessonProgress && lessonProgress.available) {
                    var progLabel = lessonProgress.percent !== undefined 
                        ? lessonProgress.percent + '%' 
                        : (lessonProgress.status || 'Unknown');
                    html += `
                        <div style="flex: 1; min-width: 120px; background: rgba(74,158,255,0.04); border-radius: 10px; padding: 10px 14px; border: 1px solid rgba(74,158,255,0.08);">
                            <div style="font-size: 11px; color: #94a3b8;">📊 Progress</div>
                            <div style="font-size: 18px; font-weight: 600; color: #4a9eff;">${progLabel}</div>
                        </div>
                    `;
                }
        
                // Mastery
                if (lessonMastery && lessonMastery.available) {
                    html += `
                        <div style="flex: 1; min-width: 120px; background: rgba(139,92,246,0.04); border-radius: 10px; padding: 10px 14px; border: 1px solid rgba(139,92,246,0.08);">
                            <div style="font-size: 11px; color: #94a3b8;">🧠 Mastery</div>
                            <div style="font-size: 18px; font-weight: 600; color: #8b5cf6;">${lessonMastery.label || 'Unknown'}</div>
                        </div>
                    `;
                }
        
                // Schedule
                if (schedule && schedule.available && schedule.count > 0) {
                    html += `
                        <div style="flex: 1; min-width: 120px; background: rgba(16,185,129,0.04); border-radius: 10px; padding: 10px 14px; border: 1px solid rgba(16,185,129,0.08);">
                            <div style="font-size: 11px; color: #94a3b8;">📅 Scheduled</div>
                            <div style="font-size: 18px; font-weight: 600; color: #10b981;">${schedule.count}</div>
                        </div>
                    `;
                }
        
                // Notes
                if (notes && notes.available && notes.count > 0) {
                    html += `
                        <div style="flex: 1; min-width: 120px; background: rgba(139,92,246,0.04); border-radius: 10px; padding: 10px 14px; border: 1px solid rgba(139,92,246,0.08);">
                            <div style="font-size: 11px; color: #94a3b8;">📓 Notes</div>
                            <div style="font-size: 18px; font-weight: 600; color: #8b5cf6;">${notes.count}</div>
                        </div>
                    `;
                }
        
                html += `</div>`;
            }
        
            // ─────────────────────────────────────────────────────────────
            // Session Panel
            // ─────────────────────────────────────────────────────────────
            html += this._renderSessionPanel(lessonId);
        
            // ─────────────────────────────────────────────────────────────
            // 内容区占位（由 _renderLessonBody 填充）
            // ─────────────────────────────────────────────────────────────
            html += `
                    <div id="lesson-body-container" style="margin-top: 24px;">
                        ${this._renderLessonLoadingState()}
                    </div>
                </div>
            `;
        
            // ═══════════════════════════════════════════════════════════════
            // 3. 先渲染基础框架（让用户看到头部和加载状态）
            // ═══════════════════════════════════════════════════════════════
            container.innerHTML = html;
        
            // ═══════════════════════════════════════════════════════════════
            // 4. On-Demand 加载 Lesson 内容（异步，不阻塞 UI）
            // ═══════════════════════════════════════════════════════════════
            var bodyContainer = document.getElementById('lesson-body-container');
        
            if (!bodyContainer) {
                console.warn('[AcademyView] lesson-body-container not found');
                return;
            }
        
            // 查找 lesson 所属的 subject
            var subjectRegistry = safeGet(window, 'LawAIApp.SubjectRegistry');
            var lessonMeta = null;
        
            // 🔥 Part 169: 优先从 CurriculumAuthority 获取
            var curriculumAuth = window.LawAIApp?.CurriculumAuthority;
            if (curriculumAuth && curriculumAuth.isReady) {
                var curriculumLesson = curriculumAuth.getLesson(lessonId);
                if (curriculumLesson && curriculumLesson.subjectId) {
                    var curriculumSubject = curriculumAuth.getSubject(curriculumLesson.subjectId);
                    if (curriculumSubject) {
                        lessonMeta = {
                            courseId: curriculumSubject.courseId,
                            subjectId: curriculumSubject.id
                        };
                    }
                }
            }
        
            // Fallback: 从 SubjectRegistry 获取
            if (!lessonMeta && subjectRegistry) {
                var allSubjects = subjectRegistry.getAllSubjects ? subjectRegistry.getAllSubjects() : [];
                for (var i = 0; i < allSubjects.length; i++) {
                    var subject = allSubjects[i];
                    if (subject.lessons && subject.lessons.indexOf(lessonId) !== -1) {
                        lessonMeta = {
                            courseId: subject.courseId,
                            subjectId: subject.id
                        };
                        break;
                    }
                }
            }
        
            // Fallback: 从 adapter 获取
            if (!lessonMeta) {
                var adapter2 = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
                var lessonDetail2 = adapter2 ? adapter2.getLessonDetail(lessonId) : null;
                if (lessonDetail2) {
                    lessonMeta = {
                        courseId: lessonDetail2.courseId || lessonDetail2.programId,
                        subjectId: lessonDetail2.moduleId || lessonDetail2.subjectId
                    };
                }
            }
        
            // 尝试从 ContentLoader 加载内容
            var contentLoader = safeGet(window, 'LawAIApp.S4ContentLoader') || safeGet(window, 'LawAIApp.ContentLoader');
        
            if (contentLoader && typeof contentLoader.loadLesson === 'function' && lessonMeta) {
                contentLoader.loadLesson(lessonMeta.courseId, lessonMeta.subjectId, lessonId)
                    .then(function(lessonContent) {
                        if (lessonContent) {
                            // ✅ 成功加载：渲染完整内容
                            var contentHtml = self._renderLessonBody(lessonContent);
                            var bodyContainer2 = document.getElementById('lesson-body-container');
                            if (bodyContainer2) {
                                bodyContainer2.innerHTML = contentHtml;
                            }
                        } else {
                            // ⚠️ 加载失败：显示占位
                            var bodyContainer3 = document.getElementById('lesson-body-container');
                            if (bodyContainer3) {
                                bodyContainer3.innerHTML = self._renderLessonPlaceholder();
                            }
                        }
                    })
                    .catch(function(err) {
                        console.warn('[AcademyView] Lesson load failed:', err);
                        var bodyContainer4 = document.getElementById('lesson-body-container');
                        if (bodyContainer4) {
                            bodyContainer4.innerHTML = self._renderLessonPlaceholder();
                        }
                    });
            } else {
                // Fallback: 没有 ContentLoader 或 lessonMeta
                var bodyContainer5 = document.getElementById('lesson-body-container');
                if (bodyContainer5) {
                    bodyContainer5.innerHTML = this._renderLessonPlaceholder();
                }
            }
        },

        /**
         * ═══ Part 4: Lesson 加载状态（使用 LoadingStates） ═══
         */
        _renderLessonLoadingState: function() {
            var loadingStates = safeGet(window, 'LawAIApp.LoadingStates');
            if (loadingStates && typeof loadingStates.showSpinner === 'function') {
                // 创建一个临时容器获取 HTML
                var temp = document.createElement('div');
                loadingStates.showSpinner(temp, 'Loading lesson content...');
                return temp.innerHTML;
            }
            // Fallback
            return `
                <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                    <div style="font-size: 32px; margin-bottom: 12px;">⏳</div>
                    <p style="font-size: 15px;">Loading lesson content...</p>
                </div>
            `;
        },

        /**
         * ═══ Part 4: Lesson 占位（使用 EmptyStates） ═══
         */
        _renderLessonPlaceholder: function() {
            var emptyStates = safeGet(window, 'LawAIApp.EmptyStates');
            if (emptyStates && typeof emptyStates.render === 'function') {
                return emptyStates.render('lessons', 'This lesson is being prepared. Interactive content will appear here.');
            }
            // Fallback
            return `
                <div style="text-align: center; padding: 80px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                    <div style="font-size: 56px; margin-bottom: 16px;">📝</div>
                    <p style="font-size: 18px; margin: 0; font-weight: 500; color: #94a3b8;">Lesson Experience Coming Soon</p>
                    <p style="font-size: 14px; margin: 8px 0 0; color: #64748b;">This lesson is being prepared</p>
                </div>
            `;
        },

        /**
         * ═══ Part 7: Lesson 错误状态（使用 EmptyStates） ═══
         */
        _renderLessonErrorState: function(lessonId, error) {
            var emptyStates = safeGet(window, 'LawAIApp.EmptyStates');
            if (emptyStates && typeof emptyStates.render === 'function') {
                return emptyStates.render('default', '⚠️ Unable to load this lesson. ' + (error || 'Content temporarily unavailable.') + ' Please try again later.');
            }
            // Fallback
            return `
                <div style="padding: 60px 20px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
                    <p style="font-size: 16px; font-weight: 500; color: #ef4444;">Unable to load this lesson</p>
                    <p style="font-size: 14px; color: #64748b; margin-top: 4px;">${error || 'Content temporarily unavailable'}</p>
                    <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center;">
                        <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.goHome')" 
                                style="padding: 8px 20px; background: rgba(74,158,255,0.1); border: 1px solid rgba(74,158,255,0.15); border-radius: 8px; color: #4a9eff; cursor: pointer; font-family: inherit;">
                            ← Back to Academy
                        </button>
                        <button onclick="location.reload()" 
                                style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer; font-family: inherit;">
                            🔄 Retry
                        </button>
                    </div>
                </div>
            `;
        },

        /**
         * ═══ Part 4: 渲染 Lesson 完整内容 ═══
         */
        _renderLessonBody: function(lessonContent) {
            var html = '';

            // ── 摘要 ──
            if (lessonContent.summary) {
                html += `
                    <div style="background: rgba(74,158,255,0.06); border-radius: 10px; padding: 16px 20px; margin-bottom: 16px; border-left: 4px solid #4a9eff;">
                        <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">${lessonContent.summary}</p>
                    </div>
                `;
            }

            // ── Sections ──
            if (lessonContent.sections) {
                var types = ['foundation', 'intermediate', 'advanced', 'expert'];
                var labels = {
                    foundation: '📘 Foundation',
                    intermediate: '📗 Intermediate',
                    advanced: '📕 Advanced',
                    expert: '📙 Expert'
                };
                var colors = {
                    foundation: '#10b981',
                    intermediate: '#4a9eff',
                    advanced: '#f59e0b',
                    expert: '#ef4444'
                };

                for (var i = 0; i < types.length; i++) {
                    var type = types[i];
                    var content = lessonContent.sections[type];
                    if (!content || content.length === 0) continue;

                    html += `
                        <div style="margin: 12px 0; padding: 14px 18px; background: rgba(255,255,255,0.03); border-radius: 10px; border-left: 4px solid ${colors[type]};">
                            <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 6px 0; color: ${colors[type]};">${labels[type]}</h4>
                            ${content.map(function(item) {
                                return `<p style="color: #e2e8f0; font-size: 14px; margin: 4px 0; line-height: 1.6;">${item}</p>`;
                            }).join('')}
                        </div>
                    `;
                }
            }

            // ── Key Takeaways ──
            if (lessonContent.keyTakeaways && lessonContent.keyTakeaways.length > 0) {
                html += `
                    <div style="margin: 16px 0; padding: 16px 20px; background: rgba(16,185,129,0.06); border-radius: 10px; border: 1px solid rgba(16,185,129,0.12);">
                        <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 8px 0; color: #10b981;">🎯 Key Takeaways</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #e2e8f0;">
                            ${lessonContent.keyTakeaways.map(function(t) {
                                return `<li style="margin: 4px 0; font-size: 14px;">${t}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                `;
            }

            // ── Video ──
            if (lessonContent.video && lessonContent.video.url) {
                var v = lessonContent.video;
                
                // 🔥 修复：把各种 YouTube URL 格式转换成正确的 embed URL
                var embedUrl = v.url;
                
                // 1. 空 URL 或只有 https://www.youtube.com/ → 跳过
                var isInvalidYouTube = /^https?:\/\/(www\.)?youtube\.com\/?$/.test(v.url) ||
                                       /^https?:\/\/(www\.)?youtube\.com\/watch/.test(v.url);
                
                // 2. 转成 embed URL
                // https://www.youtube.com/watch?v=VIDEO_ID → https://www.youtube.com/embed/VIDEO_ID
                var watchMatch = v.url.match(/youtube\.com\/watch\?v=([^&]+)/);
                if (watchMatch) {
                    embedUrl = 'https://www.youtube.com/embed/' + watchMatch[1];
                }
                
                // https://youtu.be/VIDEO_ID → https://www.youtube.com/embed/VIDEO_ID
                var shortMatch = v.url.match(/youtu\.be\/([^?]+)/);
                if (shortMatch) {
                    embedUrl = 'https://www.youtube.com/embed/' + shortMatch[1];
                }
                
                // 3. 如果还是无效的（首页、watch 页面没转成功），显示提示而不是 iframe
                if (isInvalidYouTube && !watchMatch) {
                    html += `
                        <div style="margin: 16px 0; padding: 16px 20px; background: rgba(245,158,11,0.06); border-radius: 10px; border: 1px solid rgba(245,158,11,0.12);">
                            <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 8px 0; color: #f59e0b;">🎬 ${v.title || 'Video'}</h4>
                            <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                                ⚠️ 视频链接无效（${v.url}），请更新为 YouTube embed 链接
                            </p>
                            <a href="${v.url}" target="_blank" rel="noopener" 
                               style="display: inline-block; margin-top: 8px; color: #4a9eff; font-size: 13px; text-decoration: none;">
                                🔗 在新窗口打开原链接
                            </a>
                        </div>
                    `;
                } else {
                    // 正常渲染 iframe
                    html += `
                        <div style="margin: 16px 0; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                            <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">🎬 ${v.title || 'Video'}</h4>
                            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #0a0a0a;">
                                <iframe src="${embedUrl}" 
                                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowfullscreen
                                        referrerpolicy="strict-origin-when-cross-origin">
                                </iframe>
                            </div>
                            ${v.duration ? `<span style="color: #64748b; font-size: 12px; margin-top: 4px; display: block;">⏱️ ${Math.floor(v.duration/60)} min</span>` : ''}
                        </div>
                    `;
                }
            }

            // ── Flashcards ──
            if (lessonContent.flashcards && lessonContent.flashcards.length > 0) {
                var fcs = lessonContent.flashcards;
                html += `
                    <div style="margin: 16px 0; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">🃏 Flashcards (${fcs.length})</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                            ${fcs.map(function(fc) {
                                return `
                                    <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06);">
                                        <div style="font-size: 13px; font-weight: 500; color: #4a9eff;">Q: ${fc.front}</div>
                                        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">A: ${fc.back}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            // ── Practice ──
            if (lessonContent.practice && lessonContent.practice.length > 0) {
                var practices = lessonContent.practice;
                html += `
                    <div style="margin: 16px 0; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">✍️ Practice (${practices.length})</h4>
                        ${practices.map(function(p) {
                            return `
                                <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; border-left: 3px solid #4a9eff;">
                                    <div style="font-size: 14px;">${p.question}</div>
                                    ${p.hints ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">💡 ${p.hints.join(', ')}</div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // ── Quiz ──
            if (lessonContent.quiz && lessonContent.quiz.length > 0) {
                var quizzes = lessonContent.quiz;
                html += `
                    <div style="margin: 16px 0; padding: 16px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
                        <h4 style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">📝 Quiz (${quizzes.length})</h4>
                        ${quizzes.map(function(q, idx) {
                            return `
                                <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; border-left: 3px solid #f59e0b;">
                                    <div style="font-size: 14px; font-weight: 500;">${idx+1}. ${q.question}</div>
                                    <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                                        ${q.options.map(function(opt, optIdx) {
                                            return (optIdx === q.correctAnswer ? '✅ ' : '○ ') + opt;
                                        }).join(' | ')}
                                    </div>
                                    ${q.explanation ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">💡 ${q.explanation}</div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // ── 如果没有任何内容，显示占位 ──
            if (!html) {
                html = this._renderLessonPlaceholder();
            }

            return html;
        },

        /**
         * 🔥 Part 58.6: Session Panel
         */
        _renderSessionPanel: function(lessonId) {
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
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
                            <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.endLessonSession')" 
                                    style="padding: 10px 24px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; color: #ef4444; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                                ⏹️ End Session
                            </button>
                        ` : `
                            <button onclick="__safeCall('LawAIApp.AcademyExperienceManager.startLesson', '${lessonId}')" 
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
            var adapter = safeGet(window, 'LawAIApp.LearningJourneyAdapter');
            if (!adapter) {
                return null;
            }

            var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;
            if (!continueData) {
                return null;
            }

            // 🔥 Part 59.5: 添加会话信息
            var hasActiveSession = adapter.hasActiveSession ? adapter.hasActiveSession() : false;

            var result = {
                hasActiveSession: hasActiveSession
            };
            if (continueData) {
                for (var key in continueData) {
                    if (continueData.hasOwnProperty(key)) {
                        result[key] = continueData[key];
                    }
                }
            }
            return result;
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
                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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
                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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
                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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

                var manager = safeGet(window, 'LawAIApp.AcademyExperienceManager');
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
        }

    };  // AcademyView 对象结束

    // ============================================================
    // Export
    // ============================================================

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.AcademyView = AcademyView;
    console.log('[AcademyView] ✅ Module loaded successfully');

    // ============================================================
    // Auto-init
    // ============================================================
    if (document.getElementById('academy-root')) {
        try {
            AcademyView.init().render({ viewMode: 'dashboard' });
            console.log('[AcademyView] ✅ Auto-initialized');
        } catch (e) {
            console.warn('[AcademyView] ⚠️ Auto-init failed:', e);
        }
    }

})();  // 关闭 IIFE
