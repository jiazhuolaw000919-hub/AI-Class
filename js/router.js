// ===========================================
// router.js – V4.7 - Instant First Paint + Profiler (Phase P.1)
// 优化：非关键初始化延迟到首屏后
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
    _popstateHandling: false,
    _isNavigating: false,

    /**
     * 初始化路由 — 立即执行关键功能，延迟非关键功能
     */
    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🧭 Router V4.7 initializing (critical only)...');

        // 🔥 Profiler: 注册 Router
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.registerEngine('Router');
        }

        // ============================================================
        // 1. 关键：立即恢复当前页面状态（从 URL 解析）
        // ============================================================
        var currentPath = window.location.pathname;
        var initialPage = this._getPageFromPath(currentPath);
        
        if (initialPage && (initialPage === 'academy' || initialPage === 'lesson')) {
            this._breadcrumbStack = [
                { page: 'dashboard', title: '📊 Dashboard', params: {} }
            ];
            this._pushBreadcrumb(initialPage, {});
            this.loadPage(initialPage);
            this.updateNav(initialPage);
        } else {
            this.loadPage('dashboard');
            this.updateNav('dashboard');
        }

        // ============================================================
        // 2. 延迟：绑定事件监听（不阻塞首屏）
        // ============================================================
        var self = this;
        
        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 100); };
        
        scheduleFn(function() {
            self._bindEventListeners();
            console.log('🧭 Router: Event listeners bound (deferred)');
        });

        console.log('🧭 Router V4.7 ready (critical)');
    },

    /**
     * 🔥 绑定事件监听（延迟执行）
     */
    _bindEventListeners: function() {
        document.querySelectorAll('.nav-item').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var page = this.dataset.page;
                if (page) {
                    e.preventDefault();
                    LawAIApp.Router.navigate(page);
                }
            });
        });

        window.addEventListener('popstate', function(e) {
            if (this._popstateHandling || this._isNavigating) return;
            this._popstateHandling = true;
            console.log('🔙 popstate triggered');
            
            if (e.state && e.state.page) {
                this.navigate(e.state.page, e.state.params || {}, { replace: true, fromPopstate: true });
                this._popstateHandling = false;
                return;
            }

            var path = window.location.pathname;
            var page = this._getPageFromPath(path);
            if (page) {
                this.navigate(page, {}, { replace: true, fromPopstate: true });
            } else {
                this.goHome();
            }
            this._popstateHandling = false;
        }.bind(this));
    },

    // ============================================================
    // 导航
    // ============================================================

    navigate: function(page, params, options) {
        options = options || {};
        params = params || {};

        if (this._isNavigating) {
            console.log('⏳ Already navigating, skipping');
            return;
        }

        var fromPopstate = options.fromPopstate || false;

        if (page === this.currentPage && JSON.stringify(params) === JSON.stringify(this.currentParams) && !options.force) {
            console.log('📌 Already on this page, skipping');
            return;
        }

        this._isNavigating = true;
        this.currentParams = params;

        if (!fromPopstate && !options.replace) {
            this._pushBreadcrumb(page, params);
        }

        if (page === 'academy' || page === 'academy.html') {
            console.log('📌 Navigating to Academy page');
            this.currentPage = 'academy';
            this._isNavigating = false;
            window.location.href = '/pages/academy.html';
            return;
        }

        if (page === 'lesson' || page === 'lesson.html') {
            var day = params.day || params.lessonId || '1';
            console.log('📌 Navigating to Lesson page: day', day);
            this.currentPage = 'lesson';
            this._isNavigating = false;
            window.location.href = '/pages/lesson.html?day=' + day;
            return;
        }

        if (page === 'dashboard') {
            console.log('📌 Navigating to Dashboard');
            if (window.location.pathname.includes('/pages/')) {
                console.log('📌 On /pages/ path, redirecting to /');
                this._isNavigating = false;
                window.location.href = '/';
                return;
            }
            this.loadPage('dashboard');
            this.updateNav('dashboard');
            this._isNavigating = false;
            return;
        }

        this.loadPage(page);
        this.updateNav(page);

        var path = this._buildPath(page, params);
        if (!fromPopstate) {
            if (!options.replace) {
                window.history.pushState({ page: page, params: params }, '', path);
            } else {
                window.history.replaceState({ page: page, params: params }, '', path);
            }
        }

        LawAIApp.EventBus?.emit?.('RouteChanged', { page: page, params: params });
        this._isNavigating = false;
    },

    /**
     * 构建路径
     */
    _buildPath: function(page, params) {
        if (page === 'academy' || page === 'academy.html') {
            return '/pages/academy.html';
        }
        if (page === 'lesson' || page === 'lesson.html') {
            var day = params.day || params.lessonId || '1';
            return '/pages/lesson.html?day=' + day;
        }
        if (page === 'dashboard') {
            return '/';
        }
        var path = '/' + page;
        if (Object.keys(params).length > 0) {
            var query = Object.keys(params).map(function(k) {
                return k + '=' + encodeURIComponent(params[k]);
            }).join('&');
            path += '?' + query;
        }
        return path;
    },

    /**
     * 加载页面（含 Profiler 渲染计数）
     */
    loadPage: function(page) {
        var app = document.getElementById('app') || document.getElementById('law-runtime-root');

        // 🔥 Profiler: 记录页面渲染
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            var pageName = page;
            if (page === 'academy' || page === 'academy.html' || page === 'pages') pageName = 'academy';
            else if (page === 'lesson' || page === 'lesson.html') pageName = 'lesson';
            else if (page === 'dashboard') pageName = 'dashboard';
            LawAIApp.DevTools.RuntimeProfiler.recordRender(pageName);
        }

        if (page === 'academy' || page === 'academy.html' || page === 'pages') {
            if (app) {
                if (LawAIApp.Views?.AcademyAIView && typeof LawAIApp.Views.AcademyAIView.render === 'function') {
                    app.innerHTML = '';
                    LawAIApp.Views.AcademyAIView.render(app);
                    console.log('✅ Academy rendered via View');
                } else if (LawAIApp.AcademyAIView && typeof LawAIApp.AcademyAIView.render === 'function') {
                    app.innerHTML = '';
                    LawAIApp.AcademyAIView.render(app);
                    console.log('✅ Academy rendered via AcademyAIView');
                } else {
                    app.innerHTML = `
                        <div style="padding:40px;text-align:center;color:#94a3b8;">
                            <h3>🏛️ Academy</h3>
                            <p>Loading academy content...</p>
                            <button onclick="LawAIApp.Router.goHome()" style="margin-top:16px;padding:8px 24px;background:#4a9eff;border:none;border-radius:8px;color:white;cursor:pointer;">🏠 Go Home</button>
                        </div>
                    `;
                }
            }
            this.currentPage = 'academy';
            return;
        }

        if (page === 'lesson' || page === 'lesson.html') {
            var day = this.currentParams.day || this.currentParams.lessonId || '1';
            if (app) {
                if (LawAIApp.Views?.LessonView && typeof LawAIApp.Views.LessonView.render === 'function') {
                    app.innerHTML = '';
                    LawAIApp.Views.LessonView.render(day, app);
                    console.log('✅ Lesson rendered via View');
                } else if (LawAIApp.LessonView && typeof LawAIApp.LessonView.render === 'function') {
                    app.innerHTML = '';
                    LawAIApp.LessonView.render(day, app);
                    console.log('✅ Lesson rendered via LessonView');
                } else {
                    app.innerHTML = `
                        <div style="padding:40px;text-align:center;color:#94a3b8;">
                            <h3>📖 Lesson ${day}</h3>
                            <p>Loading lesson content...</p>
                            <button onclick="LawAIApp.Router.goHome()" style="margin-top:16px;padding:8px 24px;background:#4a9eff;border:none;border-radius:8px;color:white;cursor:pointer;">🏠 Go Home</button>
                        </div>
                    `;
                }
            }
            this.currentPage = 'lesson';
            return;
        }

        // academy-dashboard
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

        // course-ai-fundamentals
        if (page === 'course-ai-fundamentals' && LawAIApp.CourseAIFundamentalsView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.CourseAIFundamentalsView.render();
            this.currentPage = page;
            return;
        }

        // module
        if (page === 'module' && LawAIApp.ModuleView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ModuleView.render(this.currentParams.moduleId);
            this.currentPage = page;
            return;
        }

        // lesson-detail
        if (page === 'lesson-detail' && LawAIApp.Views && LawAIApp.Views.LessonView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.Views.LessonView.render(this.currentParams.lessonId, app);
            this.currentPage = page;
            return;
        }

        // practice
        if (page === 'practice' && LawAIApp.PracticeView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.PracticeView.render(this.currentParams.practiceId);
            this.currentPage = page;
            return;
        }

        // quiz-dashboard
        if (page === 'quiz-dashboard' && LawAIApp.QuizInsightDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.QuizInsightDashboard.render(this.currentParams.moduleId);
            this.currentPage = page;
            return;
        }

        // smart-project
        if (page === 'smart-project' && LawAIApp.SmartProjectView) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.SmartProjectView.render(this.currentParams.projectId);
            this.currentPage = page;
            return;
        }

        // learning-hub
        if (page === 'learning-hub' && LawAIApp.LearningHub) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.LearningHub.render();
            this.currentPage = page;
            return;
        }

        // knowledge-capture
        if (page === 'knowledge-capture' && LawAIApp.KnowledgeDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.KnowledgeDashboard.render();
            this.currentPage = page;
            return;
        }

        // knowledge-editor
        if (page === 'knowledge-editor' && LawAIApp.KnowledgeEditor) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.KnowledgeEditor.render(this.currentParams);
            this.currentPage = page;
            return;
        }

        // knowledge-favorites
        if (page === 'knowledge-favorites') {
            if (app) {
                app.innerHTML = '<div class="page"><button class="back-btn" onclick="LawAIApp.Router.goBack()">← Back</button><h2>⭐ Favorites</h2><div id="fav-list"></div></div>';
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

        // knowledge-export
        if (page === 'knowledge-export' && LawAIApp.KnowledgeExport) {
            LawAIApp.KnowledgeExport.exportAll();
            this.navigate('knowledge-capture');
            return;
        }

        // adaptive-memory
        if (page === 'adaptive-memory' && LawAIApp.MemoryDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.MemoryDashboard.render();
            this.currentPage = page;
            return;
        }

        // intelligence
        if (page === 'intelligence' && LawAIApp.IntelligenceEngine) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.IntelligenceEngine.renderDashboard();
            this.currentPage = page;
            return;
        }

        // mentor-brain
        if (page === 'mentor-brain' && LawAIApp.MentorBrain) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.MentorBrain.renderDashboard();
            this.currentPage = page;
            return;
        }

        // conversations
        if (page === 'conversations' && LawAIApp.ConversationUI) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ConversationUI.render();
            this.currentPage = page;
            return;
        }

        // planner
        if (page === 'planner' && LawAIApp.PlannerDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.PlannerDashboard.render();
            this.currentPage = page;
            return;
        }

        // goal-intelligence
        if (page === 'goal-intelligence' && LawAIApp.GoalDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.GoalDashboard.render();
            this.currentPage = page;
            return;
        }

        // command-center
        if (page === 'command-center' && LawAIApp.CommandCenter) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.CommandCenter.render();
            this.currentPage = page;
            return;
        }

        // career-showcase
        if (page === 'career-showcase' && LawAIApp.ShowcaseDashboard) {
            if (app) { app.innerHTML = ''; }
            LawAIApp.ShowcaseDashboard.render();
            this.currentPage = page;
            return;
        }

        // Dashboard
        if (page === 'dashboard') {
            console.log('📌 Loading Dashboard...');
            
            if (LawAIApp.Dashboard && typeof LawAIApp.Dashboard.render === 'function') {
                console.log('✅ Dashboard.render found');
                if (app) app.innerHTML = '';
                LawAIApp.Dashboard.render(this.currentParams);
                this.currentPage = 'dashboard';
                return;
            }

            console.warn('⚠️ LawAIApp.Dashboard not found, using inline fallback');
            if (app) {
                app.innerHTML = `
                    <div style="padding:20px;max-width:1000px;margin:0 auto;font-family:'Inter',sans-serif;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:28px;">🚀</span>
                                <h1 style="font-size:20px;font-weight:700;background:linear-gradient(90deg,#4a9eff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Law AI Academy</h1>
                            </div>
                            <div style="display:flex;gap:16px;font-size:13px;color:#94a3b8;">
                                <span>🎯 Day 1</span>
                                <span>⭐ 0</span>
                                <span>🔥 Lv.1</span>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0;">
                            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;"><div style="font-size:22px;color:#4a9eff;">1</div><div style="font-size:10px;color:#64748b;">Level</div></div>
                            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;"><div style="font-size:22px;color:#fbbf24;">0</div><div style="font-size:10px;color:#64748b;">XP</div></div>
                            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;"><div style="font-size:22px;color:#f97316;">0</div><div style="font-size:10px;color:#64748b;">Streak</div></div>
                            <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;"><div style="font-size:22px;color:#8b5cf6;">0%</div><div style="font-size:10px;color:#64748b;">Progress</div></div>
                        </div>
                        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.06);margin:16px 0;">
                            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                                <span style="font-size:24px;">📖</span>
                                <div>
                                    <div style="font-weight:600;font-size:16px;">Day 2</div>
                                    <div style="color:#94a3b8;font-size:13px;">Continue building your AI knowledge</div>
                                </div>
                                <span style="margin-left:auto;font-size:11px;background:rgba(74,158,255,0.12);color:#4a9eff;padding:2px 12px;border-radius:12px;">Next</span>
                            </div>
                            <a href="/pages/lesson.html" style="display:inline-block;padding:10px 24px;background:#4a9eff;border-radius:8px;color:white;font-weight:600;text-decoration:none;font-size:14px;">📖 Continue Learning</a>
                        </div>
                        <div style="background:rgba(74,158,255,0.06);border-radius:14px;padding:16px 20px;border:1px solid rgba(74,158,255,0.12);">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span style="font-size:28px;">🏛️</span>
                                <div style="flex:1;">
                                    <div style="font-weight:600;font-size:15px;">AI Academy</div>
                                    <div style="color:#94a3b8;font-size:12px;">Explore all courses and modules</div>
                                </div>
                                <a href="/pages/academy.html" style="padding:8px 20px;background:rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;text-decoration:none;font-size:13px;font-weight:500;">Enter →</a>
                            </div>
                        </div>
                        <div style="margin-top:30px;text-align:center;font-size:12px;color:#64748b;">
                            ⚡ Router V4.7 | Dashboard fallback mode
                        </div>
                    </div>
                `;
            }
            this.currentPage = 'dashboard';
            return;
        }

        // 其他模板页面 fallback
        var cacheKey = this._getCacheKey(page, this.currentParams);
        if (this._pageCache[cacheKey]) {
            if (app) {
                app.innerHTML = this._pageCache[cacheKey];
            }
            this.currentPage = page;
            return;
        }

        var template = document.getElementById('template-' + page);
        if (!template) {
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
    },

    /**
     * 更新导航高亮 + 面包屑
     */
    updateNav: function(activePage) {
        document.querySelectorAll('.nav-item').forEach(function(btn) {
            var page = btn.dataset.page;
            if (page === activePage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this._renderBreadcrumb();
    },

    /**
     * 从路径获取页面名
     */
    _getPageFromPath: function(path) {
        if (path.includes('/pages/')) {
            var parts = path.split('/pages/');
            var file = parts[parts.length - 1];
            if (file === 'academy.html') return 'academy';
            if (file === 'lesson.html') return 'lesson';
            var pageName = file.replace('.html', '');
            if (this.pages.indexOf(pageName) !== -1) return pageName;
            if (file === 'pages') return null;
        }
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

        var html = '<a href="/" style="cursor:pointer;color:#4a9eff;text-decoration:none;">🏠 Home</a>';

        this._breadcrumbStack.forEach(function(crumb, index) {
            html += ' <span style="opacity:0.4;">›</span> ';
            if (index === this._breadcrumbStack.length - 1) {
                html += '<span style="color:#e2e8f0;">' + crumb.title + '</span>';
            } else {
                var href = this._buildPath(crumb.page, crumb.params || {});
                html += '<a href="' + href + '" style="cursor:pointer;color:#4a9eff;text-decoration:none;">' + crumb.title + '</a>';
            }
        }.bind(this));

        breadcrumb.innerHTML = html;

        var app = document.getElementById('app') || document.getElementById('law-runtime-root');
        if (app && app.parentNode) {
            app.parentNode.insertBefore(breadcrumb, app);
        }
    },

    /**
     * 重新运行页面脚本
     */
    _rerunPageScripts: function(page) {},

    /**
     * 返回上一页
     */
    goBack: function() {
        console.log('🔙 goBack called');
        if (this._breadcrumbStack.length > 1) {
            this._breadcrumbStack.pop();
            var prev = this._breadcrumbStack[this._breadcrumbStack.length - 1];
            if (prev) {
                if (prev.page === 'academy' || prev.page === 'lesson') {
                    window.location.href = this._buildPath(prev.page, prev.params || {});
                    return;
                }
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
        console.log('🏠 goHome called');
        if (window.location.pathname.includes('/pages/')) {
            console.log('📌 On /pages/ path, redirecting to /');
            window.location.href = '/';
            return;
        }
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
    }
};

// ============================================================
// 自动初始化
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (LawAIApp.Router && typeof LawAIApp.Router.init === 'function') {
            LawAIApp.Router.init();
        }
    }, 50);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (LawAIApp.Router && typeof LawAIApp.Router.init === 'function') {
                LawAIApp.Router.init();
            }
        }, 50);
    });
}

console.log('🧭 Router V4.7 ready (instant first paint + profiler)');
