window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.10",

    initialized: false,

    boot: {},

    root: null,

    cache: {},

    panels: {},

    _mounting: false,

    _mountedNotified: false,

    init: function(boot) {
        boot = boot || {};
        this.boot = boot || LawAIApp.bootStatus || {};

        if (this.initialized) {
            console.log("🔄 SystemComposer already initialized, refreshing...");
            this.refresh();
            if (!this._mountedNotified) {
                this._notifyMounted();
            }
            return;
        }

        if (this._mounting) {
            console.warn("⏳ SystemComposer is already mounting, skipping duplicate init");
            return;
        }

        this._mounting = true;
        this._mountedNotified = false;
        console.log("🧩 SystemComposer V" + this.version + " initializing...");

        try {
            this.initialized = true;
            this.root = document.getElementById("law-runtime-root") || document.body;
            this.cache = {};

            var existingRoot = document.getElementById("systemComposerRoot");
            if (existingRoot) {
                console.log("🔄 systemComposerRoot already exists, reusing...");
                this.root = existingRoot;
                this.cache.learning = document.getElementById("learningPanel");
                this.cache.workspace = document.getElementById("workspacePanel");
                this.cache.runtime = document.getElementById("runtimePanel");
                this.cache.modules = document.getElementById("modulePanel");
            } else {
                if (this.root.id === "law-runtime-root") {
                    this._renderMainUI();
                } else {
                    console.warn("⚠️ Root element is not 'law-runtime-root', using fallback");
                    this._renderMinimalUI();
                }

                this.cache.learning = document.getElementById("learningPanel");
                this.cache.workspace = document.getElementById("workspacePanel");
                this.cache.runtime = document.getElementById("runtimePanel");
                this.cache.modules = document.getElementById("modulePanel");
            }

            this.panels = {
                learning: function() { this.mountLearning(); }.bind(this),
                workspace: function() { this.mountWorkspace(); }.bind(this),
                runtime: function() { this.mountRuntime(); }.bind(this),
                modules: function() { this.mountRuntimeModules(); }.bind(this)
            };

            this.refresh();

            console.log("✅ SystemComposer V" + this.version + " initialized successfully");
            this._notifyMounted();

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }
    },

    /**
     * =========================
     * 渲染主 UI（直接显示完整界面版）
     * =========================
     */

    _renderMainUI: function() {
        if (!this.root) return;

        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        // ===========================================
        // 1. 获取学习状态（有进度就用真实数据，无进度用示范占位）
        // ===========================================
        var state = {};
        var hasProgress = false;
        var completedList = [];

        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                state = LawAIApp.ProgressEngine.getState();
                completedList = state.completedLessons || [];
                hasProgress = completedList.length > 0;
            } else if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                var p = LawAIApp.ProgressEngine.getProgress();
                completedList = p.completedLessons || [];
                state = {
                    level: p.level || 1,
                    xp: p.xp || 0,
                    streak: p.streak || 0,
                    day: p.day || 1,
                    completionPercent: p.completionPercent || 0,
                    currentStage: p.currentStage || 'Foundation',
                    remainingLessons: (p.totalLessons || 365) - completedList.length,
                    completedLessons: completedList
                };
                hasProgress = completedList.length > 0;
            }
        } catch (err) {
            console.warn('⚠️ Failed to get progress state:', err);
        }

        // 如果没有进度，使用示范占位数据（但仍显示完整界面）
        var isDemo = false;
        if (!hasProgress) {
            isDemo = true;
            state = {
                level: 1,
                xp: 0,
                streak: 0,
                day: 1,
                completionPercent: 0,
                currentStage: 'Foundation',
                remainingLessons: 365,
                completedLessons: []
            };
            completedList = [];
        }

        var day = state.day || 1;
        var xp = state.xp || 0;
        var level = state.level || 1;
        var streak = state.streak || 0;
        var completionPercent = Math.round(state.completionPercent || 0);
        var currentStage = state.currentStage || 'Foundation';
        var remainingLessons = state.remainingLessons || 365;

        // ===========================================
        // 2. 计算下一节课
        // ===========================================
        var nextLessonDay = day + 1;
        var totalLessons = 365;
        if (nextLessonDay > totalLessons) {
            nextLessonDay = totalLessons;
        }

        // ===========================================
        // 3. 获取最近 3 节已学课程（或示范数据）
        // ===========================================
        var recentLessons = [];
        if (completedList.length > 0) {
            var copy = completedList.slice();
            var recent = copy.reverse().slice(0, 3);
            recentLessons = recent;
        } else {
            // 示范占位数据
            recentLessons = ['day-1', 'day-2', 'day-3'];
        }

        // ===========================================
        // 4. 课程名称和摘要辅助函数
        // ===========================================
        function getLessonTitle(lessonId) {
            if (!lessonId) return 'Lesson';
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var dayNum = parseInt(lessonId.replace('day-', ''));
                    if (!isNaN(dayNum)) {
                        var lesson = LawAIApp.LessonEngine.getLessonByDay(dayNum);
                        if (lesson && lesson.title) return lesson.title;
                    }
                }
            } catch (e) {}
            var num = lessonId.replace('day-', '');
            return 'Day ' + num;
        }

        function getLessonSummary(lessonId) {
            if (!lessonId) return 'Continue building your AI knowledge.';
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var dayNum = parseInt(lessonId.replace('day-', ''));
                    if (!isNaN(dayNum)) {
                        var lesson = LawAIApp.LessonEngine.getLessonByDay(dayNum);
                        if (lesson && lesson.summary) return lesson.summary;
                        if (lesson && lesson.subtitle) return lesson.subtitle;
                    }
                }
            } catch (e) {}
            return 'Continue building your AI knowledge with today\'s lesson.';
        }

        function getNextLessonTitle() {
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(nextLessonDay);
                    if (lesson && lesson.title) return lesson.title;
                }
            } catch (e) {}
            return 'Day ' + nextLessonDay;
        }

        function getNextLessonSummary() {
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(nextLessonDay);
                    if (lesson && lesson.summary) return lesson.summary;
                    if (lesson && lesson.subtitle) return lesson.subtitle;
                }
            } catch (e) {}
            return 'Continue building your AI knowledge with today\'s lesson.';
        }

        var nextTitle = getNextLessonTitle();
        var nextSummary = getNextLessonSummary();
        var isComplete = (completedList.length >= totalLessons);

        // ===========================================
        // 5. 最近学习课程 HTML（支持示范模式）
        // ===========================================
        var recentHtml = '';
        if (recentLessons.length > 0) {
            recentHtml = recentLessons.map(function(id) {
                var title = getLessonTitle(id);
                var isPlaceholder = (id === 'day-1' && !hasProgress);
                return `
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        padding:10px 14px;
                        background:rgba(255,255,255,0.04);
                        border-radius:10px;
                        margin-bottom:6px;
                        border-left:3px solid ${isPlaceholder ? '#64748b' : '#22c55e'};
                        opacity: ${isPlaceholder ? 0.7 : 1};
                    ">
                        <span style="font-size:16px;">${isPlaceholder ? '📖' : '✅'}</span>
                        <span style="font-size:14px;color:#e2e8f0;">${title}</span>
                        <span style="margin-left:auto;font-size:12px;color:#64748b;">${isPlaceholder ? 'Start to unlock' : 'Completed'}</span>
                    </div>
                `;
            }).join('');
        } else {
            recentHtml = `
                <div style="text-align:center;padding:16px 0;color:#64748b;font-size:14px;">
                    Complete your first lesson to see progress here!
                </div>
            `;
        }

        // ===========================================
        // 6. 今日学习卡片（支持示范模式）
        // ===========================================
        var goalHtml = '';
        if (isComplete) {
            goalHtml = `
                <div style="
                    background: linear-gradient(135deg, rgba(74,158,255,0.2), rgba(124,58,237,0.2));
                    border-radius:16px;
                    padding:32px;
                    text-align:center;
                    border:1px solid rgba(74,158,255,0.2);
                    margin-bottom:20px;
                ">
                    <div style="font-size:48px;margin-bottom:8px;">🎉</div>
                    <h3 style="margin:0 0 4px 0;font-size:22px;font-weight:700;">All 365 Lessons Complete!</h3>
                    <p style="margin:0;color:#94a3b8;font-size:15px;">You've mastered the entire curriculum. Incredible work! 🏆</p>
                    <a href="pages/academy.html" style="
                        display:inline-block;
                        margin-top:16px;
                        padding:12px 32px;
                        background:#4a9eff;
                        border:none;
                        border-radius:10px;
                        color:white;
                        font-size:14px;
                        font-weight:600;
                        text-decoration:none;
                    ">🏛️ Explore Advanced Topics</a>
                </div>
            `;
        } else {
            var demoTag = isDemo ? '🌟 Start Here' : 'Day ' + nextLessonDay;
            var demoSubText = isDemo ? 'Complete your first lesson to start tracking!' : remainingLessons + ' lessons remaining';
            var demoBtnText = isDemo ? '📖 Go to Academy' : '📖 Continue Learning';
            var demoBtnLink = isDemo ? 'pages/academy.html' : 'pages/lesson.html';

            goalHtml = `
                <div style="
                    background: rgba(255,255,255,0.04);
                    border-radius:16px;
                    padding:24px;
                    border:1px solid rgba(255,255,255,0.08);
                    margin-bottom:20px;
                ">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <span style="font-size:24px;">${isDemo ? '🌟' : '📖'}</span>
                        <h3 style="margin:0;font-size:18px;font-weight:600;">${isDemo ? 'Start Your Journey' : "Today's Lesson"}</h3>
                        <span style="margin-left:auto;font-size:12px;background:rgba(74,158,255,0.15);color:#4a9eff;padding:2px 12px;border-radius:20px;">${demoTag}</span>
                    </div>
                    <h4 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#ffffff;">${nextTitle}</h4>
                    <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">${isDemo ? 'Complete your first lesson to unlock personalized learning content.' : nextSummary}</p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="${demoBtnLink}" style="
                            padding:10px 28px;
                            background:#4a9eff;
                            border:none;
                            border-radius:10px;
                            color:white;
                            font-size:14px;
                            font-weight:600;
                            text-decoration:none;
                            transition:transform 0.2s;
                            display:inline-block;
                        " onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">${demoBtnText}</a>
                        <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('✏️ Practice mode coming soon! 🚧')" style="
                            padding:10px 28px;
                            background:rgba(255,255,255,0.08);
                            border:1px solid rgba(255,255,255,0.12);
                            border-radius:10px;
                            color:#ffffff;
                            font-size:14px;
                            font-weight:500;
                            cursor:pointer;
                            transition:background 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">✏️ Quick Practice</button>
                        <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('📝 Notes will open here soon! 🚧')" style="
                            padding:10px 28px;
                            background:rgba(124,58,237,0.2);
                            border:1px solid rgba(124,58,237,0.2);
                            border-radius:10px;
                            color:#c4b5fd;
                            font-size:14px;
                            font-weight:500;
                            cursor:pointer;
                            transition:background 0.2s;
                        " onmouseover="this.style.background='rgba(124,58,237,0.3)'" onmouseout="this.style.background='rgba(124,58,237,0.2)'">📝 Take Notes</button>
                    </div>
                    <div style="margin-top:12px;font-size:12px;color:#475569;">
                        ${demoSubText}
                    </div>
                </div>
            `;
        }

        // ===========================================
        // 7. 渲染完整页面（始终显示完整界面）
        // ===========================================
        this.root.innerHTML = `
        <div id="systemComposerRoot" style="
            min-height: 100vh;
            background: linear-gradient(135deg, #0b1220 0%, #1a1a2e 50%, #16213e 100%);
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        ">
            <!-- 主内容 -->
            <div style="padding-bottom: 100px;">

                <!-- 顶部导航 -->
                <header style="
                    background: rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                ">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <span style="font-size:28px;">🚀</span>
                        <h1 style="
                            margin:0;
                            font-size:20px;
                            font-weight:700;
                            background: linear-gradient(90deg, #4a9eff, #7c3aed);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        ">Law AI Academy</h1>
                        <span style="font-size:11px;background:rgba(74,158,255,0.2);color:#4a9eff;padding:2px 10px;border-radius:12px;font-weight:600;">v${this.version}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:16px;font-size:13px;color:#94a3b8;">
                        <span>🎯 Day ${day}</span>
                        <span>⭐ ${xp} XP</span>
                        <span>🔥 Level ${level}</span>
                    </div>
                </header>

                <!-- 主内容 -->
                <main style="max-width:1000px;margin:0 auto;padding:24px 20px 20px;">

                    <!-- 欢迎横幅 -->
                    <section style="
                        background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15));
                        border: 1px solid rgba(74,158,255,0.2);
                        border-radius: 16px;
                        padding: 24px 32px;
                        text-align: center;
                        margin-bottom: 24px;
                    ">
                        <h2 style="margin:0 0 4px 0;font-size:24px;font-weight:600;">${isDemo ? '🚀 Welcome to Law AI Academy!' : '👋 Welcome Back!'}</h2>
                        <p style="margin:0;color:#94a3b8;font-size:15px;">${isDemo ? 'Start your 365-day AI learning journey today.' : "You're on Day " + day + " · " + currentStage}</p>
                    </section>

                    <!-- Dashboard 卡片网格 -->
                    <div style="
                        display:grid;
                        grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
                        gap:16px;
                        margin-bottom:24px;
                    ">
                        <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                            <div style="font-size:32px;">📈</div>
                            <div style="font-size:28px;font-weight:700;color:#4a9eff;">${level}</div>
                            <div style="color:#94a3b8;font-size:13px;">Level</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                            <div style="font-size:32px;">⭐</div>
                            <div style="font-size:28px;font-weight:700;color:#fbbf24;">${xp}</div>
                            <div style="color:#94a3b8;font-size:13px;">Total XP</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                            <div style="font-size:32px;">🔥</div>
                            <div style="font-size:28px;font-weight:700;color:#f97316;">${streak}</div>
                            <div style="color:#94a3b8;font-size:13px;">Day Streak</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                            <div style="font-size:32px;">📚</div>
                            <div style="font-size:28px;font-weight:700;color:#8b5cf6;">${completionPercent}%</div>
                            <div style="color:#94a3b8;font-size:13px;">Progress</div>
                        </div>
                    </div>

                    <!-- 进度条 -->
                    <div style="margin-bottom:24px;">
                        <div style="display:flex;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:6px;">
                            <span>Learning Progress</span>
                            <span>${completionPercent}%</span>
                        </div>
                        <div style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                            <div style="width:${completionPercent}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;transition:width 0.5s ease;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-top:4px;">
                            <span>Day ${day}</span>
                            <span>${remainingLessons} lessons remaining</span>
                        </div>
                    </div>

                    <!-- ===== 今日学习卡片 ===== -->
                    ${goalHtml}

                    <!-- ===== 最近学习课程 ===== -->
                    <div style="
                        background:rgba(255,255,255,0.03);
                        border-radius:14px;
                        padding:20px 24px;
                        border:1px solid rgba(255,255,255,0.06);
                        margin-bottom:24px;
                    ">
                        <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">📖 Recent Lessons</h3>
                        ${recentHtml}
                    </div>

                    <!-- 隐藏的面板（保留功能） -->
                    <div id="learningPanel" style="display:none;"></div>
                    <div id="workspacePanel" style="display:none;"></div>
                    <div id="runtimePanel" style="display:none;"></div>
                    <div id="modulePanel" style="display:none;"></div>

                </main>
            </div>

            <!-- 底部导航 -->
            <nav style="
                position:fixed;
                bottom:0;
                left:0;
                right:0;
                background:rgba(20,20,40,0.92);
                backdrop-filter:blur(12px);
                border-top:1px solid rgba(255,255,255,0.06);
                display:flex;
                justify-content:space-around;
                padding:8px 0 16px;
                z-index:100;
            ">
                <a href="#" class="nav-item active" data-tab="home" style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#4a9eff;text-decoration:none;font-size:10px;font-weight:500;"><span style="font-size:20px;">🏠</span><span>Home</span></a>
                <a href="pages/academy.html" class="nav-item" data-tab="academy" style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#64748b;text-decoration:none;font-size:10px;font-weight:500;"><span style="font-size:20px;">📚</span><span>Academy</span></a>
                <a href="#" class="nav-item" data-tab="calendar" style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#64748b;text-decoration:none;font-size:10px;font-weight:500;"><span style="font-size:20px;">📅</span><span>Calendar</span></a>
                <a href="#" class="nav-item" data-tab="notes" style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#64748b;text-decoration:none;font-size:10px;font-weight:500;"><span style="font-size:20px;">📝</span><span>Notes</span></a>
                <a href="#" class="nav-item" data-tab="settings" style="display:flex;flex-direction:column;align-items:center;gap:2px;color:#64748b;text-decoration:none;font-size:10px;font-weight:500;"><span style="font-size:20px;">⚙️</span><span>Settings</span></a>
            </nav>

            <style>
                .nav-item:hover { color: #94a3b8 !important; }
                .nav-item.active { color: #4a9eff !important; }
                @media (max-width: 600px) {
                    .nav-item span:last-child { font-size: 9px; }
                }
            </style>
        </div>
        `;

        this._setupNavGuard();
    },

    /**
     * =========================
     * 底部导航守卫
     * =========================
     */

    _setupNavGuard: function() {
        var self = this;
        var navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(function(item) {
            item.removeEventListener('click', self._navClickHandler);
            item.addEventListener('click', self._navClickHandler = function(e) {
                var tab = this.getAttribute('data-tab');
                if (tab === 'home' || tab === 'academy') {
                    return;
                }
                e.preventDefault();
                var tabNames = {
                    'calendar': '📅 Calendar',
                    'notes': '📝 Notes',
                    'settings': '⚙️ Settings'
                };
                var tabDisplay = tabNames[tab] || tab;
                if (LawAIApp.Toast && typeof LawAIApp.Toast.info === 'function') {
                    LawAIApp.Toast.info(tabDisplay + ' is coming soon! 🚧');
                } else {
                    alert(tabDisplay + ' is coming soon! 🚧');
                }
                navItems.forEach(function(nav) {
                    nav.style.color = '#64748b';
                    nav.classList.remove('active');
                });
                this.style.color = '#4a9eff';
                this.classList.add('active');
            });
        });
    },

    /**
     * =========================
     * 最小化 UI（兜底）
     * =========================
     */

    _renderMinimalUI: function() {
        if (!this.root) return;

        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping minimal render");
            return;
        }

        var container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'padding:20px;background:#0b1220;color:white;';
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <h1 style="margin:0;">🚀 Law AI Academy</h1>
                <span style="font-size:14px;color:#4a9eff;font-weight:normal;background:#1e293b;padding:4px 12px;border-radius:20px;">v${this.version}</span>
            </div>
            <div id="learningPanel"></div>
            <br>
            <div id="workspacePanel"></div>
            <br>
            <div id="runtimePanel"></div>
            <br>
            <div id="modulePanel"></div>
            <div style="margin-top:40px;text-align:center;color:#475569;font-size:12px;">
                ⚡ System running in fallback mode
            </div>
        `;
        this.root.appendChild(container);
        this.root = container;
    },

    /**
     * =========================
     * 失败时的兜底 UI
     * =========================
     */

    _renderFallbackUI: function(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;font-family:'Inter',sans-serif;">
                <h2>⚠️ SystemComposer Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <p style="color:#666;font-size:14px;margin-top:20px;">
                    Please refresh or check console for details
                </p>
                <button onclick="location.reload()" style="
                    margin-top:20px;
                    padding:10px 30px;
                    background:#4a9eff;
                    border:none;
                    border-radius:8px;
                    color:white;
                    font-size:14px;
                    cursor:pointer;
                ">🔄 Refresh</button>
            </div>
        `;
    },

    /**
     * =========================
     * 通知 App 已挂载
     * =========================
     */

    _notifyMounted: function() {
        if (this._mountedNotified) return;

        try {
            var event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: {
                    version: this.version,
                    initialized: this.initialized,
                    root: this.root ? this.root.id : null
                }
            });
            window.dispatchEvent(event);
            this._mountedNotified = true;
            console.log("📡 Dispatched COMPOSER_MOUNTED event (once)");
        } catch (err) {
            console.warn("Failed to dispatch COMPOSER_MOUNTED:", err);
        }
    },

    refresh: function() {
        console.log("🔄 SystemComposer refreshing all panels...");
        var self = this;
        Object.values(this.panels).forEach(function(panel) {
            try {
                panel();
            } catch (err) {
                console.warn("Panel render failed:", err);
            }
        });
    },

    /* =====================================
    LEARNING（兼容保留）
    ===================================== */

    mountLearning: function() {
        var el = this.cache.learning;
        if (!el) {
            this.cache.learning = document.getElementById("learningPanel");
            if (!this.cache.learning) return;
            el = this.cache.learning;
        }

        var state = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                state = LawAIApp.ProgressEngine.getState();
            }
        } catch (err) {}

        el.innerHTML = `
            <div style="background:#1e293b;padding:18px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);">
                <h2 style="margin-top:0;">📚 Learning</h2>
                <div style="display:flex;gap:24px;flex-wrap:wrap;">
                    <div><strong>📈 Level</strong><br>${state.level || 1}</div>
                    <div><strong>⭐ XP</strong><br>${state.xp || 0}</div>
                    <div><strong>🔥 Streak</strong><br>${state.streak || 0}</div>
                    <div><strong>📅 Day</strong><br>${state.day || 1}</div>
                </div>
            </div>
        `;
    },

    /* =====================================
    WORKSPACE（兼容保留）
    ===================================== */

    mountWorkspace: function() {
        var el = this.cache.workspace;
        if (!el) {
            this.cache.workspace = document.getElementById("workspacePanel");
            if (!this.cache.workspace) return;
            el = this.cache.workspace;
        }

        var workspace = {};
        try {
            if (LawAIApp.WorkspaceState && typeof LawAIApp.WorkspaceState.get === 'function') {
                workspace = LawAIApp.WorkspaceState.get("default") || {};
            }
        } catch (err) {}

        el.innerHTML = `
            <div style="background:#1e293b;padding:18px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);">
                <h2 style="margin-top:0;">🧩 Workspace</h2>
                <pre style="margin:0;white-space:pre-wrap;word-break:break-word;color:#cbd5e1;max-height:200px;overflow:auto;font-size:13px;">${JSON.stringify(workspace, null, 2)}</pre>
            </div>
        `;
    },

    /* =====================================
    RUNTIME（兼容保留）
    ===================================== */

    mountRuntime: function() {
        var el = this.cache.runtime;
        if (!el) {
            this.cache.runtime = document.getElementById("runtimePanel");
            if (!this.cache.runtime) return;
            el = this.cache.runtime;
        }

        var boot = LawAIApp.bootStatus || {};
        var runtime = LawAIApp.RuntimeManager || {};

        el.innerHTML = `
            <div style="background:#1e293b;padding:18px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);">
                <h2 style="margin-top:0;">⚙ Runtime</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;">
                    <div><strong>Status</strong><br>${runtime.started ? "🟢 Running" : "🟡 Waiting"}</div>
                    <div><strong>Active Engines</strong><br>${boot.active ? boot.active.length : 0}</div>
                    <div><strong>Loaded Files</strong><br>${boot.loaded ? boot.loaded.length : 0}</div>
                    <div><strong>Safe Mode</strong><br>${boot.safeMode ? "ON" : "OFF"}</div>
                </div>
            </div>
        `;
    },

    /* =====================================
    RUNTIME MODULES（兼容保留）
    ===================================== */

    mountRuntimeModules: function() {
        var el = this.cache.modules;
        if (!el) {
            this.cache.modules = document.getElementById("modulePanel");
            if (!this.cache.modules) return;
            el = this.cache.modules;
        }

        el.innerHTML = `
            <div style="background:#1e293b;padding:18px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.25);">
                <h2 style="margin-top:0;">📦 Runtime Modules</h2>
                <p style="color:#888;">System running smoothly</p>
            </div>
        `;
    },

    /* =====================================
    PANEL MANAGEMENT
    ===================================== */

    registerPanel: function(name, renderer) {
        if (!name || typeof renderer !== "function") {
            console.warn("Invalid panel registration:", name);
            return;
        }
        this.panels[name] = renderer;
        console.log('📌 Panel "' + name + '" registered');
    },

    refreshPanel: function(name) {
        if (!this.panels[name]) {
            console.warn('Panel "' + name + '" not found');
            return;
        }
        try {
            this.panels[name]();
        } catch (err) {
            console.warn('Panel ' + name + ' refresh failed', err);
        }
    },

    destroy: function() {
        this.initialized = false;
        this.boot = {};
        this.cache = {};
        this.panels = {};
        this.root = null;
        this._mounting = false;
        this._mountedNotified = false;
        console.log("🧩 SystemComposer destroyed");
    }

};

/* =====================================
   AUTO REFRESH
===================================== */

window.addEventListener("LEARNING_UI_REFRESH", function() {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

window.addEventListener("SYSTEM_READY", function(e) {
    console.log("📡 SYSTEM_READY received by SystemComposer");
    if (!LawAIApp.SystemComposer.initialized) {
        LawAIApp.SystemComposer.init(e.detail ? e.detail.boot : undefined);
    } else {
        LawAIApp.SystemComposer.boot = e.detail ? e.detail.boot : LawAIApp.bootStatus || {};
        LawAIApp.SystemComposer.refresh();
    }
});

window.addEventListener("RUNTIME_READY", function() {
    LawAIApp.SystemComposer?.refreshPanel("runtime");
    LawAIApp.SystemComposer?.refreshPanel("modules");
});

window.addEventListener("WORKSPACE_UPDATED", function() {
    LawAIApp.SystemComposer?.refreshPanel("workspace");
});

window.addEventListener("PROFILE_UPDATED", function() {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

console.log("🧩 SystemComposer V" + LawAIApp.SystemComposer.version + " Ready");

if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer V' + LawAIApp.SystemComposer.version + ' attached to LawAIApp');
}
