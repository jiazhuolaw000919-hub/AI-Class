// ===========================================
// router.js – Phase 60 升级版（Season 2 完结）
// Season 1.5 升级：增加页面缓存 + 面包屑导航
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Router = {
    currentPage: 'dashboard',
    currentParams: {},
    pages: [
        'dashboard','learning','calendar','notes','tools','prompt','settings',
        'lesson','academy','academy-dashboard','course-ai-fundamentals','module',
        'lesson-detail','practice','quiz-dashboard','smart-project','learning-hub',
        'knowledge-capture','knowledge-editor','knowledge-favorites','knowledge-export',
        'adaptive-memory','intelligence','mentor-brain','conversations',
        'planner','goal-intelligence','command-center','career-showcase'
    ],

    _pageCache: {},
    _breadcrumbStack: [],
    _initialized: false,

    /**
     * 初始化路由
     */
    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🧭 Router initialized');

        // 监听导航点击
        document.querySelectorAll('.nav-item').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var page = this.dataset.page;
                if (page) {
                    LawAIApp.Router.navigate(page);
                }
            });
        });

        // 监听 popstate
        window.addEventListener('popstate', function(e) {
            var path = window.location.pathname;
            var page = this._getPageFromPath(path);
            if (page) {
                this.navigate(page, {}, { replace: true });
            }
        }.bind(this));

        // 加载默认页面
        this.loadPage('dashboard');
        this.updateNav('dashboard');
    },

    /**
     * 导航到指定页面
     */
    navigate: function(page, params, options) {
        options = options || {};
        params = params || {};

        if (page === this.currentPage && JSON.stringify(params) === JSON.stringify(this.currentParams) && !options.force) {
            return;
        }

        this.currentParams = params;

        if (!options.replace) {
            this._pushBreadcrumb(page, params);
        }

        this.loadPage(page);
        this.updateNav(page);

        // 更新 URL（可选）
        var path = '/' + page;
        if (Object.keys(params).length > 0) {
            var query = Object.keys(params).map(function(k) {
                return k + '=' + encodeURIComponent(params[k]);
            }).join('&');
            path += '?' + query;
        }
        if (!options.replace) {
            window.history.pushState({ page: page, params: params }, '', path);
        } else {
            window.history.replaceState({ page: page, params: params }, '', path);
        }

        LawAIApp.EventBus?.emit?.('RouteChanged', { page: page, params: params });
    },

    /**
     * 加载页面
     */
    loadPage: function(page) {
        var app = document.getElementById('app');

        // ============================================================
        //  Academy 路由（修复版）
        // ============================================================
        if (page === 'academy') {
            if (app) {
                // 检查 AcademyAIView 是否可用
                if (LawAIApp.Views?.AcademyAIView && typeof LawAIApp.Views.AcademyAIView.render === 'function') {
                    app.innerHTML = '';
                    LawAIApp.Views.AcademyAIView.render(app);
                } else {
                    // 显示加载占位
                    app.innerHTML = `
                        <div style="padding:40px;text-align:center;color:#94a3b8;">
                            <h3>🏛️ Academy</h3>
                            <p>Loading academy content...</p>
                            <div style="margin-top:20px;width:30px;height:30px;border:3px solid rgba(255,255,255,0.06);border-top-color:#4a9eff;border-radius:50%;animation:spin 1s linear infinite;display:inline-block;"></div>
                            <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
                        </div>
                    `;
                    // 尝试重新加载（最多重试 3 次）
                    var retries = 0;
                    var maxRetries = 3;
                    var retryInterval = setInterval(function() {
                        retries++;
                        if (LawAIApp.Views?.AcademyAIView && typeof LawAIApp.Views.AcademyAIView.render === 'function') {
                            clearInterval(retryInterval);
                            app.innerHTML = '';
                            LawAIApp.Views.AcademyAIView.render(app);
                            console.log('✅ Academy retry succeeded');
                        } else if (retries >= maxRetries) {
                            clearInterval(retryInterval);
                            console.warn('⚠️ AcademyAIView not available after retries');
                            app.innerHTML = `
                                <div style="padding:40px;text-align:center;color:#94a3b8;">
                                    <h3>🏛️ Academy</h3>
                                    <p>Academy content is loading. Please refresh if empty.</p>
                                    <button onclick="location.reload()" style="margin-top:16px;padding:8px 24px;background:#4a9eff;border:none;border-radius:8px;color:white;cursor:pointer;">🔄 Refresh</button>
                                </div>
                            `;
                        }
                    }, 500);
                }
            }
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  academy-dashboard（兼容旧路由）
        // ============================================================
        if (page === 'academy-dashboard') {
            if (app) {
                app.innerHTML = '';
                if (LawAIApp.Views?.AcademyAIView && typeof LawAIApp.Views.AcademyAIView.render === 'function') {
                    LawAIApp.Views.AcademyAIView.render(app);
                } else if (LawAIApp.AcademyAIView && typeof LawAIApp.AcademyAIView.render === 'function') {
                    LawAIApp.AcademyAIView.render();
                } else {
                    app.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;"><h3>🤖 AI Foundation</h3><p>Loading...</p></div>';
                }
            }
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  course-ai-fundamentals
        // ============================================================
        if (page === 'course-ai-fundamentals' && LawAIApp.CourseAIFundamentalsView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.CourseAIFundamentalsView.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  module
        // ============================================================
        if (page === 'module' && LawAIApp.ModuleView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ModuleView.render(this.currentParams.moduleId);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  lesson-detail
        // ============================================================
        if (page === 'lesson-detail' && LawAIApp.Views && LawAIApp.Views.LessonView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.Views.LessonView.render(this.currentParams.lessonId, app);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  practice
        // ============================================================
        if (page === 'practice' && LawAIApp.PracticeView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.PracticeView.render(this.currentParams.practiceId);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  quiz-dashboard
        // ============================================================
        if (page === 'quiz-dashboard' && LawAIApp.QuizInsightDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.QuizInsightDashboard.render(this.currentParams.moduleId);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  smart-project
        // ============================================================
        if (page === 'smart-project' && LawAIApp.SmartProjectView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.SmartProjectView.render(this.currentParams.projectId);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  learning-hub
        // ============================================================
        if (page === 'learning-hub' && LawAIApp.LearningHub) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.LearningHub.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  knowledge-capture
        // ============================================================
        if (page === 'knowledge-capture' && LawAIApp.KnowledgeDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.KnowledgeDashboard.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  knowledge-editor
        // ============================================================
        if (page === 'knowledge-editor' && LawAIApp.KnowledgeEditor) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.KnowledgeEditor.render(this.currentParams);
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  knowledge-favorites
        // ============================================================
        if (page === 'knowledge-favorites') {
            if (app) {
                app.innerHTML = '<div class="page"><button class="back-btn" onclick="LawAIApp.Router.navigate(\'knowledge-capture\')">← Back</button><h2>⭐ Favorites</h2><div id="fav-list"></div></div>';
                var favs = LawAIApp.KnowledgeCapture?.getNotes?.({ isFavorite: true }) || [];
                var listEl = document.getElementById('fav-list');
                if (listEl) {
                    if (favs.length > 0) {
                        listEl.innerHTML = favs.map(function(n) {
                            return '<div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:4px;">' + (n.title || n.content || 'Untitled') + '</div>';
                        }).join('');
                    } else {
                        listEl.innerHTML = '<p style="color:#94a3b8;">No favorites yet.</p>';
                    }
                }
            }
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  knowledge-export
        // ============================================================
        if (page === 'knowledge-export' && LawAIApp.KnowledgeExport) {
            LawAIApp.KnowledgeExport.exportAll();
            this.navigate('knowledge-capture');
            return;
        }

        // ============================================================
        //  adaptive-memory
        // ============================================================
        if (page === 'adaptive-memory' && LawAIApp.MemoryDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.MemoryDashboard.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  intelligence
        // ============================================================
        if (page === 'intelligence' && LawAIApp.IntelligenceEngine) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.IntelligenceEngine.renderDashboard();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  mentor-brain
        // ============================================================
        if (page === 'mentor-brain' && LawAIApp.MentorBrain) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.MentorBrain.renderDashboard();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  conversations
        // ============================================================
        if (page === 'conversations' && LawAIApp.ConversationUI) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ConversationUI.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  planner
        // ============================================================
        if (page === 'planner' && LawAIApp.PlannerDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.PlannerDashboard.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  goal-intelligence
        // ============================================================
        if (page === 'goal-intelligence' && LawAIApp.GoalDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.GoalDashboard.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  command-center
        // ============================================================
        if (page === 'command-center' && LawAIApp.CommandCenter) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.CommandCenter.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  career-showcase
        // ============================================================
        if (page === 'career-showcase' && LawAIApp.ShowcaseDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ShowcaseDashboard.render();
            this.currentPage = page;
            return;
        }

        // ============================================================
        //  模板页面（原有逻辑）
        // ============================================================
        var cacheKey = this._getCacheKey(page, this.currentParams);
        if (this._pageCache[cacheKey]) {
            if (app) {
                app.innerHTML = this._pageCache[cacheKey];
            }
            this.currentPage = page;
            this._rerunPageScripts(page);
            return;
        }

        var template = document.getElementById('template-' + page);
        if (!template) {
            // 不再报错，显示友好的占位
            console.log('📄 Page: ' + page + ' (no template, using fallback)');
            if (app) {
                app.innerHTML = `
                    <div style="padding:40px;text-align:center;color:#94a3b8;">
                        <h3>📄 ${page.charAt(0).toUpperCase() + page.slice(1)}</h3>
                        <p>Content is being prepared.</p>
                        <button onclick="LawAIApp.Router.goHome()" style="margin-top:16px;padding:8px 24px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;cursor:pointer;">🏠 Go Home</button>
                    </div>
                `;
            }
            this.currentPage = page;
            return;
        }

        if (app) {
            app.innerHTML = '';
            var clone = template.content.cloneNode(true);
            app.appendChild(clone);
        }
        this.currentPage = page;

        // 页面初始化
        if (page === 'dashboard' && LawAIApp.Dashboard) LawAIApp.Dashboard.render();
        else if (page === 'learning' && LawAIApp.Learning) LawAIApp.Learning.render();
        else if (page === 'calendar' && LawAIApp.Calendar) LawAIApp.Calendar.render();
        else if (page === 'notes' && LawAIApp.Notes) LawAIApp.Notes.render();
        else if (page === 'settings' && LawAIApp.Settings) LawAIApp.Settings.render();
        else if (page === 'tools' && LawAIApp.Tools) LawAIApp.Tools.render?.();
        else if (page === 'prompt' && LawAIApp.Prompt) LawAIApp.Prompt.render?.();
        else if (page === 'lesson' && LawAIApp.LessonPage) LawAIApp.LessonPage.render(this.currentParams);

        // 缓存页面（非动态页面）
        setTimeout(function() {
            if (page !== 'lesson' && page !== 'lesson-detail' && page !== 'module') {
                var currentHTML = document.getElementById('app')?.innerHTML;
                if (currentHTML) {
                    this._pageCache[cacheKey] = currentHTML;
                }
            }
        }.bind(this), 100);
    },

    /**
     * 更新导航高亮
     */
    updateNav: function(activePage) {
        document.querySelectorAll('.nav-item').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.page === activePage);
        });
        this._renderBreadcrumb();
    },

    /**
     * 返回上一页
     */
    goBack: function() {
        if (this._breadcrumbStack.length > 1) {
            this._breadcrumbStack.pop();
            var prev = this._breadcrumbStack[this._breadcrumbStack.length - 1];
            if (prev) {
                this.navigate(prev.page, prev.params || {}, { replace: true });
                return;
            }
        }
        this.goHome();
    },

    /**
     * 返回首页
     */
    goHome: function() {
        this.navigate('dashboard', {}, { replace: true });
    },

    /**
     * 获取当前路径
     */
    getCurrentPath: function() {
        return '/' + this.currentPage;
    },

    /**
     * 获取历史
     */
    getHistory: function() {
        return this._breadcrumbStack.slice();
    },

    /**
     * 清除缓存
     */
    clearCache: function() {
        this._pageCache = {};
        this._breadcrumbStack = [];
        var oldBreadcrumb = document.getElementById('breadcrumb-nav');
        if (oldBreadcrumb) oldBreadcrumb.remove();
        console.log('🧹 Router cache cleared');
    },

    /**
     * 从路径获取页面
     */
    _getPageFromPath: function(path) {
        var segments = path.split('/').filter(function(s) { return s; });
        if (segments.length === 0) return 'dashboard';
        var page = segments[0];
        if (this.pages.indexOf(page) !== -1) return page;
        return null;
    },

    /**
     * 获取缓存 key
     */
    _getCacheKey: function(page, params) {
        if (page === 'lesson' && params.day) return 'lesson_day_' + params.day;
        if (page === 'module' && params.moduleId) return 'module_' + params.moduleId;
        if (page === 'lesson-detail' && params.lessonId) return 'lesson_detail_' + params.lessonId;
        if (page === 'practice' && params.practiceId) return 'practice_' + params.practiceId;
        if (page === 'quiz-dashboard' && params.moduleId) return 'quiz_' + params.moduleId;
        if (page === 'smart-project' && params.projectId) return 'project_' + params.projectId;
        if (page === 'knowledge-editor' && params.noteId) return 'editor_' + params.noteId;
        return page;
    },

    /**
     * 面包屑
     */
    _pushBreadcrumb: function(page, params) {
        var titles = {
            dashboard: '📊 Dashboard',
            learning: '📚 Learning',
            calendar: '📅 Calendar',
            notes: '📝 Notes',
            tools: '🛠️ Tools',
            prompt: '📋 Prompts',
            settings: '⚙️ Settings',
            lesson: '📖 Day ' + (params?.day || '?'),
            academy: '🏫 Academy',
            'academy-dashboard': '🤖 AI Foundation',
            'course-ai-fundamentals': '📖 AI Fundamentals',
            module: '📦 ' + (params?.moduleId || 'Module'),
            'lesson-detail': '📖 ' + (params?.lessonId || 'Lesson'),
            practice: '⚡ ' + (params?.practiceId || 'Practice'),
            'quiz-dashboard': '📊 Quiz Insights',
            'smart-project': '🚀 ' + (params?.projectId || 'Project'),
            'learning-hub': '📚 Learning Hub',
            'knowledge-capture': '📓 Notes',
            'knowledge-editor': '✏️ Editor',
            'knowledge-favorites': '⭐ Favorites',
            'knowledge-export': '📤 Export',
            'adaptive-memory': '🧠 Adaptive Memory',
            'intelligence': '🧠 Intelligence',
            'mentor-brain': '🤖 Mentor Brain',
            'conversations': '💬 Chat',
            'planner': '📅 Planner',
            'goal-intelligence': '🎯 Goals',
            'command-center': '🚀 Command Center',
            'career-showcase': '🚀 Showcase'
        };

        var title = titles[page] || page;
        if (this._breadcrumbStack.length > 0 && this._breadcrumbStack[this._breadcrumbStack.length - 1].page === page) {
            return;
        }

        this._breadcrumbStack.push({ page: page, title: title, params: params });
        if (this._breadcrumbStack.length > 8) {
            this._breadcrumbStack.shift();
        }
    },

    /**
     * 渲染面包屑
     */
    _renderBreadcrumb: function() {
        var oldBreadcrumb = document.getElementById('breadcrumb-nav');
        if (oldBreadcrumb) oldBreadcrumb.remove();

        if (this.currentPage === 'dashboard' || this._breadcrumbStack.length <= 1) return;

        var breadcrumb = document.createElement('div');
        breadcrumb.id = 'breadcrumb-nav';
        breadcrumb.style.cssText = `
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            flex-wrap: wrap;
            max-width: 1000px;
            margin: 0 auto;
            animation: fadeIn 0.3s ease;
        `;

        var html = '<span style="cursor:pointer;color:#4a9eff;" onclick="LawAIApp.Router.navigate(\'dashboard\')">🏠 Home</span>';

        this._breadcrumbStack.forEach(function(crumb, index) {
            html += ' <span style="opacity:0.4;">›</span> ';
            if (index === this._breadcrumbStack.length - 1) {
                html += '<span style="color:#e2e8f0;">' + crumb.title + '</span>';
            } else {
                html += '<span style="cursor:pointer;color:#4a9eff;" onclick="LawAIApp.Router.navigate(\'' + crumb.page + '\', ' + JSON.stringify(crumb.params || {}).replace(/"/g, "'") + ')">' + crumb.title + '</span>';
            }
        }.bind(this));

        breadcrumb.innerHTML = html;

        var app = document.getElementById('app');
        if (app && app.parentNode) {
            app.parentNode.insertBefore(breadcrumb, app);
        }
    },

    /**
     * 重新运行页面脚本
     */
    _rerunPageScripts: function(page) {
        // 预留
    }
};

// 自动初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (LawAIApp.Router && typeof LawAIApp.Router.init === 'function') {
            LawAIApp.Router.init();
        }
    }, 100);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (LawAIApp.Router && typeof LawAIApp.Router.init === 'function') {
                LawAIApp.Router.init();
            }
        }, 100);
    });
}

console.log('🧭 Router V3.0 ready');
