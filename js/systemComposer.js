window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.15",

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

    // ============================================================
    // 辅助函数：获取学习状态
    // ============================================================

    _getState: function() {
        var state = {};
        var completedList = [];
        var hasProgress = false;

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

        if (!hasProgress) {
            return {
                hasProgress: false,
                isDemo: true,
                state: { level: 1, xp: 0, streak: 0, day: 1, completionPercent: 0, currentStage: 'Foundation', remainingLessons: 365, completedLessons: [] },
                completedList: []
            };
        }

        return { hasProgress: true, isDemo: false, state: state, completedList: completedList };
    },

    // ============================================================
    // 辅助函数：课程名称
    // ============================================================

    _getLessonTitle: function(lessonId) {
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
    },

    _getLessonSummary: function(lessonId) {
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
    },

    _getNextLessonTitle: function(day) {
        var nextDay = day + 1;
        if (nextDay > 365) nextDay = 365;
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(nextDay);
                if (lesson && lesson.title) return lesson.title;
            }
        } catch (e) {}
        return 'Day ' + nextDay;
    },

    _getNextLessonSummary: function(day) {
        var nextDay = day + 1;
        if (nextDay > 365) nextDay = 365;
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(nextDay);
                if (lesson && lesson.summary) return lesson.summary;
                if (lesson && lesson.subtitle) return lesson.subtitle;
            }
        } catch (e) {}
        return 'Continue building your AI knowledge with today\'s lesson.';
    },

    // ============================================================
    // Phase 8: 目标系统
    // ============================================================

    _generateGoals: function(day, completedList, streak, isDemo) {
        var goals = [];
        var totalLessons = 365;

        if (isDemo) {
            return [
                { icon: '📖', label: 'Complete your first lesson', done: false },
                { icon: '🔥', label: 'Start your first learning streak', done: false },
                { icon: '⭐', label: 'Earn your first XP', done: false }
            ];
        }

        // 今日课程目标
        var nextDay = Math.min(day + 1, totalLessons);
        var completed = completedList.length;
        var todayGoal = Math.min(completed + 1, totalLessons);

        goals.push({
            icon: '📖',
            label: 'Complete Day ' + todayGoal + ' lesson',
            done: completed >= todayGoal
        });

        // 连续签到目标
        if (streak < 7) {
            goals.push({
                icon: '🔥',
                label: 'Reach 7-day streak (' + streak + '/7)',
                done: false
            });
        } else if (streak < 14) {
            goals.push({
                icon: '🔥',
                label: 'Reach 14-day streak (' + streak + '/14)',
                done: false
            });
        } else if (streak < 30) {
            goals.push({
                icon: '🔥',
                label: 'Reach 30-day streak (' + streak + '/30)',
                done: false
            });
        } else {
            goals.push({
                icon: '🏅',
                label: 'Maintain your ' + streak + '-day streak!',
                done: true
            });
        }

        // XP 目标
        var xp = completed * 20;
        if (xp < 100) {
            goals.push({ icon: '⭐', label: 'Earn 100 XP (' + xp + '/100)', done: false });
        } else if (xp < 500) {
            goals.push({ icon: '⭐', label: 'Earn 500 XP (' + xp + '/500)', done: false });
        } else {
            goals.push({ icon: '🌟', label: 'You\'re an XP Champion! (' + xp + ' XP)', done: true });
        }

        return goals;
    },

    // ============================================================
    // 渲染主 UI（Phase 8 完整版）
    // ============================================================

    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        var data = this._getState();
        var isDemo = data.isDemo;
        var state = data.state;
        var completedList = data.completedList;

        var day = state.day || 1;
        var xp = state.xp || 0;
        var level = state.level || 1;
        var streak = state.streak || 0;
        var completionPercent = Math.round(state.completionPercent || 0);
        var currentStage = state.currentStage || 'Foundation';
        var remainingLessons = state.remainingLessons || 365;
        var today = new Date();

        // ---- 课程名称 ----
        var nextTitle = this._getNextLessonTitle(day);
        var nextSummary = this._getNextLessonSummary(day);

        // ---- Phase 8: 目标系统 ----
        var goals = this._generateGoals(day, completedList, streak, isDemo);
        var completedGoals = goals.filter(function(g) { return g.done; }).length;
        var totalGoals = goals.length;
        var goalPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        var goalsHtml = goals.map(function(g) {
            var iconColor = g.done ? '#22c55e' : '#64748b';
            var textColor = g.done ? '#22c55e' : '#e2e8f0';
            var strike = g.done ? 'line-through' : 'none';
            return `
                <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:16px;color:${iconColor};">${g.icon}</span>
                    <span style="font-size:13px;color:${textColor};text-decoration:${strike};">${g.label}</span>
                    ${g.done ? '<span style="margin-left:auto;font-size:12px;color:#22c55e;">✅</span>' : '<span style="margin-left:auto;font-size:11px;color:#64748b;">⏳</span>'}
                </div>
            `;
        }).join('');

        // ---- 目标完成进度 ----
        var goalProgressHtml = '';
        for (var i = 0; i < totalGoals; i++) {
            var isDone = i < completedGoals;
            goalProgressHtml += `
                <div style="flex:1;height:4px;background:${isDone ? '#4a9eff' : 'rgba(255,255,255,0.06)'};border-radius:10px;${isDone ? 'box-shadow: 0 0 8px rgba(74,158,255,0.3);' : ''}"></div>
            `;
        }

        // ---- Phase 8: 今日倒计时 ----
        var now = new Date();
        var endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        var diffMs = endOfDay - now;
        var diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        var diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // ---- Phase 7: AI 导师建议（简化） ----
        var mentorMsg = isDemo ? '🌟 Complete your first lesson to unlock personalized guidance!' :
                        (completedList.length >= 365 ? '🏆 You\'ve mastered all 365 lessons! Incredible!' :
                        (completionPercent < 30 ? '🌱 Keep building your foundation. Consistency is key!' :
                        (completionPercent < 60 ? '📈 You\'re making great progress! Keep it up!' :
                        (completionPercent < 90 ? '💪 Almost there! Finish strong!' :
                        '🎯 You\'re so close to the finish line!'))));

        // ---- 技能雷达（精简） ----
        var skillCategories = [
            { name: 'Foundation', icon: '🏛️', level: isDemo ? 10 : Math.min(90, 10 + completedList.length * 0.15) },
            { name: 'Prompt', icon: '✍️', level: isDemo ? 5 : Math.min(90, 5 + completedList.length * 0.12) },
            { name: 'Tools', icon: '🛠️', level: isDemo ? 8 : Math.min(90, 8 + completedList.length * 0.1) },
            { name: 'Coding', icon: '💻', level: isDemo ? 3 : Math.min(90, 3 + completedList.length * 0.08) },
            { name: 'AI Dev', icon: '🤖', level: isDemo ? 2 : Math.min(90, 2 + completedList.length * 0.06) }
        ];

        var radarHtml = skillCategories.map(function(skill) {
            var lvl = Math.round(skill.level);
            var color = lvl > 70 ? '#4a9eff' : lvl > 40 ? '#8b5cf6' : '#64748b';
            return `
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                    <span style="font-size:14px;">${skill.icon}</span>
                    <span style="font-size:11px;color:#94a3b8;width:50px;">${skill.name}</span>
                    <div style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                        <div style="width:${lvl}%;height:100%;background:${color};border-radius:10px;"></div>
                    </div>
                    <span style="font-size:10px;color:#64748b;width:30px;text-align:right;">${lvl}%</span>
                </div>
            `;
        }).join('');

        // ---- 最近学习 ----
        var recentLessons = [];
        if (completedList.length > 0) {
            var copy = completedList.slice();
            recentLessons = copy.reverse().slice(0, 3);
        } else {
            recentLessons = ['day-1', 'day-2', 'day-3'];
        }

        var recentHtml = recentLessons.map(function(id) {
            var title = this._getLessonTitle(id);
            var isPlaceholder = (id === 'day-1' && !data.hasProgress);
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:4px;border-left:3px solid ${isPlaceholder ? '#64748b' : '#22c55e'};opacity:${isPlaceholder ? 0.6 : 1};">
                    <span style="font-size:14px;">${isPlaceholder ? '📖' : '✅'}</span>
                    <span style="font-size:13px;color:#e2e8f0;">${title}</span>
                    <span style="margin-left:auto;font-size:10px;color:#64748b;">${isPlaceholder ? 'Start' : 'Done'}</span>
                </div>
            `;
        }.bind(this)).join('');

        // ============================================
        // 渲染完整页面
        // ============================================

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
            <div style="padding-bottom: 90px;">

                <!-- 顶部导航 -->
                <header style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-size:22px;">🚀</span>
                        <h1 style="margin:0;font-size:18px;font-weight:700;background:linear-gradient(90deg,#4a9eff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Law AI Academy</h1>
                        <span style="font-size:10px;background:rgba(74,158,255,0.2);color:#4a9eff;padding:2px 8px;border-radius:12px;">v${this.version}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;font-size:12px;color:#94a3b8;">
                        <span>🎯 Day ${day}</span>
                        <span>⭐ ${xp}</span>
                        <span>🔥 ${level}</span>
                    </div>
                </header>

                <main style="max-width:1000px;margin:0 auto;padding:16px 16px 20px;">

                    <!-- ========================================================= -->
                    <!--  Phase 8: 今日目标 + 目标完成度 + 倒计时（新增）           -->
                    <!-- ========================================================= -->

                    <div style="
                        background:linear-gradient(135deg,rgba(74,158,255,0.12),rgba(124,58,237,0.12));
                        border-radius:14px;
                        padding:18px 20px;
                        border:1px solid rgba(74,158,255,0.15);
                        margin-bottom:16px;
                    ">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-size:13px;color:#94a3b8;">🎯 Today's Goals</span>
                            <span style="font-size:13px;color:#4a9eff;font-weight:600;">${completedGoals}/${totalGoals}</span>
                        </div>
                        <div style="display:flex;gap:4px;margin-bottom:10px;">
                            ${goalProgressHtml}
                        </div>
                        ${goalsHtml}
                        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:#64748b;">
                            <span>⏰ ${diffHrs}h ${diffMin}m remaining today</span>
                            <span>${goalPercent}% complete</span>
                        </div>
                    </div>

                    <!-- ========================================================= -->
                    <!--  Phase 7: AI 导师建议（精简）                              -->
                    <!-- ========================================================= -->

                    <div style="
                        background:rgba(74,158,255,0.08);
                        border-radius:12px;
                        padding:14px 18px;
                        border:1px solid rgba(74,158,255,0.12);
                        margin-bottom:16px;
                        display:flex;
                        align-items:center;
                        gap:12px;
                    ">
                        <span style="font-size:24px;">🧠</span>
                        <span style="font-size:14px;color:#e2e8f0;flex:1;">${mentorMsg}</span>
                    </div>

                    <!-- ========================================================= -->
                    <!--  卡片网格（精简）                                         -->
                    <!-- ========================================================= -->

                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
                        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:22px;color:#4a9eff;">${level}</div>
                            <div style="font-size:10px;color:#64748b;">Level</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:22px;color:#fbbf24;">${xp}</div>
                            <div style="font-size:10px;color:#64748b;">XP</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:22px;color:#f97316;">${streak}</div>
                            <div style="font-size:10px;color:#64748b;">Streak</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:22px;color:#8b5cf6;">${completionPercent}%</div>
                            <div style="font-size:10px;color:#64748b;">Progress</div>
                        </div>
                    </div>

                    <!-- ========================================================= -->
                    <!--  今日学习卡片                                               -->
                    <!-- ========================================================= -->

                    ${(completedList.length >= 365) ? `
                    <div style="background:linear-gradient(135deg,rgba(74,158,255,0.15),rgba(124,58,237,0.15));border-radius:14px;padding:24px;text-align:center;border:1px solid rgba(74,158,255,0.15);margin-bottom:16px;">
                        <div style="font-size:36px;">🎉</div>
                        <h3 style="margin:4px 0;font-size:18px;">All 365 Lessons Complete!</h3>
                        <p style="color:#94a3b8;font-size:13px;">You've mastered the entire curriculum! 🏆</p>
                        <a href="pages/academy.html" style="display:inline-block;margin-top:10px;padding:8px 24px;background:#4a9eff;border-radius:8px;color:white;font-size:13px;font-weight:600;text-decoration:none;">🏛️ Explore Advanced</a>
                    </div>
                    ` : `
                    <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                            <span style="font-size:20px;">📖</span>
                            <span style="font-size:14px;font-weight:600;">${nextTitle}</span>
                            <span style="margin-left:auto;font-size:10px;background:rgba(74,158,255,0.12);color:#4a9eff;padding:2px 10px;border-radius:12px;">Day ${Math.min(day + 1, 365)}</span>
                        </div>
                        <p style="margin:0 0 10px 0;color:#94a3b8;font-size:13px;">${isDemo ? 'Complete your first lesson to unlock content!' : nextSummary}</p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <a href="${isDemo ? 'pages/academy.html' : 'pages/lesson.html'}" style="padding:8px 20px;background:#4a9eff;border-radius:8px;color:white;font-size:13px;font-weight:600;text-decoration:none;">${isDemo ? '📖 Start' : '📖 Continue'}</a>
                            <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('✏️ Practice coming soon!')" style="padding:8px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:13px;cursor:pointer;">✏️ Practice</button>
                        </div>
                    </div>
                    `}

                    <!-- ========================================================= -->
                    <!--  技能雷达 + 最近学习（双列）                                -->
                    <!-- ========================================================= -->

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                            <h4 style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:400;">🧠 Skills</h4>
                            ${radarHtml}
                        </div>
                        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                            <h4 style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:400;">📖 Recent</h4>
                            ${recentHtml}
                        </div>
                    </div>

                    <!-- 隐藏面板 -->
                    <div id="learningPanel" style="display:none;"></div>
                    <div id="workspacePanel" style="display:none;"></div>
                    <div id="runtimePanel" style="display:none;"></div>
                    <div id="modulePanel" style="display:none;"></div>

                </main>
            </div>

            <!-- 底部导航 -->
            <nav style="position:fixed;bottom:0;left:0;right:0;background:rgba(20,20,40,0.92);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-around;padding:6px 0 12px;z-index:100;">
                <a href="#" class="nav-item active" data-tab="home" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#4a9eff;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">🏠</span><span>Home</span></a>
                <a href="pages/academy.html" class="nav-item" data-tab="academy" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📚</span><span>Academy</span></a>
                <a href="#" class="nav-item" data-tab="calendar" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📅</span><span>Calendar</span></a>
                <a href="#" class="nav-item" data-tab="notes" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📝</span><span>Notes</span></a>
                <a href="#" class="nav-item" data-tab="settings" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">⚙️</span><span>Settings</span></a>
            </nav>

            <style>
                .nav-item:hover { color: #94a3b8 !important; }
                .nav-item.active { color: #4a9eff !important; }
                @media (max-width: 480px) {
                    .nav-item span:last-child { font-size: 8px; }
                    #systemComposerRoot div[style*="display:grid;grid-template-columns:1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                    #systemComposerRoot div[style*="display:grid;grid-template-columns:repeat(4,1fr)"] {
                        grid-template-columns: repeat(2,1fr) !important;
                    }
                }
            </style>
        </div>
        `;

        this._setupNavGuard();
    },

    // ============================================================
    // 底部导航守卫
    // ============================================================

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

    // ============================================================
    // 兜底 UI
    // ============================================================

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
            <div style="margin-top:40px;text-align:center;color:#475569;font-size:12px;">⚡ System running in fallback mode</div>
        `;
        this.root.appendChild(container);
        this.root = container;
    },

    _renderFallbackUI: function(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;font-family:'Inter',sans-serif;">
                <h2>⚠️ SystemComposer Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <p style="color:#666;font-size:14px;margin-top:20px;">Please refresh or check console for details</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:14px;cursor:pointer;">🔄 Refresh</button>
            </div>
        `;
    },

    _notifyMounted: function() {
        if (this._mountedNotified) return;
        try {
            var event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: { version: this.version, initialized: this.initialized, root: this.root ? this.root.id : null }
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
            try { panel(); } catch (err) { console.warn("Panel render failed:", err); }
        });
    },

    // ============================================================
    // 原有 Panel 方法（兼容保留）
    // ============================================================

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
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📚 Learning</h2><div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;"><span>Level ${state.level || 1}</span><span>XP ${state.xp || 0}</span><span>Streak ${state.streak || 0}</span><span>Day ${state.day || 1}</span></div></div>`;
    },

    mountWorkspace: function() {
        var el = this.cache.workspace;
        if (!el) {
            this.cache.workspace = document.getElementById("workspacePanel");
            if (!this.cache.workspace) return;
            el = this.cache.workspace;
        }
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">🧩 Workspace</h2><p style="color:#94a3b8;font-size:13px;">Ready</p></div>`;
    },

    mountRuntime: function() {
        var el = this.cache.runtime;
        if (!el) {
            this.cache.runtime = document.getElementById("runtimePanel");
            if (!this.cache.runtime) return;
            el = this.cache.runtime;
        }
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">⚙ Runtime</h2><p style="color:#4a9eff;font-size:13px;">🟢 Online</p></div>`;
    },

    mountRuntimeModules: function() {
        var el = this.cache.modules;
        if (!el) {
            this.cache.modules = document.getElementById("modulePanel");
            if (!this.cache.modules) return;
            el = this.cache.modules;
        }
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📦 Modules</h2><p style="color:#94a3b8;font-size:13px;">All systems ready</p></div>`;
    },

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
        try { this.panels[name](); } catch (err) { console.warn('Panel ' + name + ' refresh failed', err); }
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
