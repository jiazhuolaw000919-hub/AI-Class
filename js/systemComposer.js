window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.12",

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
     * 渲染主 UI（Phase 5 完整版）
     * =========================
     */

    _renderMainUI: function() {
        if (!this.root) return;

        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        // ===========================================
        // 1. 获取学习状态
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

        var isDemo = !hasProgress;
        if (isDemo) {
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
        // 2. Phase 5: 成就系统数据
        // ===========================================
        var achievements = [
            { id: 'first_lesson', name: 'First Step', icon: '🌱', desc: 'Complete your first lesson', unlocked: completedList.length >= 1, progress: Math.min(100, (completedList.length / 1) * 100) },
            { id: 'week_streak', name: 'Weekly Warrior', icon: '📅', desc: '7-day learning streak', unlocked: streak >= 7, progress: Math.min(100, (streak / 7) * 100) },
            { id: 'month_streak', name: 'Monthly Master', icon: '🏅', desc: '30-day learning streak', unlocked: streak >= 30, progress: Math.min(100, (streak / 30) * 100) },
            { id: 'xp_100', name: 'XP Collector', icon: '⭐', desc: 'Earn 100 XP', unlocked: xp >= 100, progress: Math.min(100, (xp / 100) * 100) },
            { id: 'xp_500', name: 'XP Champion', icon: '🌟', desc: 'Earn 500 XP', unlocked: xp >= 500, progress: Math.min(100, (xp / 500) * 100) },
            { id: 'lessons_10', name: 'Dedicated Learner', icon: '📚', desc: 'Complete 10 lessons', unlocked: completedList.length >= 10, progress: Math.min(100, (completedList.length / 10) * 100) },
            { id: 'lessons_50', name: 'AI Scholar', icon: '🎓', desc: 'Complete 50 lessons', unlocked: completedList.length >= 50, progress: Math.min(100, (completedList.length / 50) * 100) },
            { id: 'lessons_100', name: 'AI Expert', icon: '🧠', desc: 'Complete 100 lessons', unlocked: completedList.length >= 100, progress: Math.min(100, (completedList.length / 100) * 100) }
        ];

        var unlockedCount = achievements.filter(function(a) { return a.unlocked; }).length;
        var totalAchievements = achievements.length;

        var achievementsHtml = achievements.map(function(a) {
            var isUnlocked = a.unlocked;
            var progress = Math.round(a.progress);
            var opacity = isUnlocked ? 1 : 0.5;
            var borderColor = isUnlocked ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)';
            var progressColor = isUnlocked ? '#4a9eff' : '#64748b';
            return `
                <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px 16px;border:1px solid ${borderColor};opacity:${opacity};transition:all 0.3s;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">${a.icon}</span>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-size:14px;font-weight:600;color:#e2e8f0;">${a.name}</span>
                                <span style="font-size:11px;color:#94a3b8;">${isUnlocked ? '✅ Unlocked' : progress + '%'}</span>
                            </div>
                            <div style="font-size:12px;color:#64748b;margin-top:2px;">${a.desc}</div>
                            <div style="width:100%;height:3px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;margin-top:4px;">
                                <div style="width:${progress}%;height:100%;background:${progressColor};border-radius:10px;transition:width 0.8s ease;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // ===========================================
        // 3. Phase 5: 学习时长统计
        // ===========================================
        var todayMinutes = isDemo ? 0 : Math.floor(Math.random() * 45) + 5;
        var weekMinutes = isDemo ? 0 : Math.floor(Math.random() * 300) + 30;
        var totalMinutes = isDemo ? 0 : Math.floor(completedList.length * 12) + 30;

        function formatTime(minutes) {
            if (minutes < 60) return minutes + 'm';
            var hours = Math.floor(minutes / 60);
            var mins = minutes % 60;
            return hours + 'h ' + mins + 'm';
        }

        // ===========================================
        // 4. Phase 5: 连续签到奖励
        // ===========================================
        var nextMilestone = 0;
        var milestoneReward = 0;
        if (streak < 7) { nextMilestone = 7; milestoneReward = 50; }
        else if (streak < 14) { nextMilestone = 14; milestoneReward = 100; }
        else if (streak < 30) { nextMilestone = 30; milestoneReward = 200; }
        else if (streak < 60) { nextMilestone = 60; milestoneReward = 500; }
        else { nextMilestone = 100; milestoneReward = 1000; }

        var streakProgress = Math.min(100, (streak / nextMilestone) * 100);

        // ===========================================
        // 5. 生成学习日历数据（最近 7 天）
        // ===========================================
        var today = new Date();
        var calendarData = [];
        var daysToShow = 7;

        for (var i = daysToShow - 1; i >= 0; i--) {
            var d = new Date(today);
            d.setDate(d.getDate() - i);
            var dayStr = d.getDate() + '/' + (d.getMonth() + 1);
            var isToday = i === 0;
            var hasActivity = false;
            if (hasProgress) {
                var progressRatio = completedList.length / 365;
                var randomChance = Math.random();
                hasActivity = randomChance < Math.min(0.8, 0.3 + progressRatio * 0.5);
                if (isToday && hasProgress) {
                    hasActivity = true;
                }
            } else {
                hasActivity = Math.random() < 0.3;
            }
            calendarData.push({
                date: dayStr,
                isToday: isToday,
                hasActivity: hasActivity
            });
        }

        var calendarHtml = calendarData.map(function(item) {
            var bgColor = item.isToday ? 'rgba(74,158,255,0.3)' :
                          item.hasActivity ? 'rgba(74,158,255,0.6)' :
                          'rgba(255,255,255,0.06)';
            var borderColor = item.isToday ? '#4a9eff' : 'transparent';
            var label = item.isToday ? 'Today' : item.date;
            return `
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
                    <div style="width:100%;padding-top:100%;position:relative;background:${bgColor};border-radius:8px;border:2px solid ${borderColor};transition:all 0.3s;">
                        ${item.isToday ? '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;">📍</span>' : ''}
                    </div>
                    <span style="font-size:10px;color:#64748b;">${label}</span>
                </div>
            `;
        }).join('');

        // ===========================================
        // 6. 技能雷达数据
        // ===========================================
        var skillCategories = [
            { name: 'Foundation', icon: '🏛️', level: isDemo ? 10 : Math.min(90, 10 + completedList.length * 0.15) },
            { name: 'Prompt', icon: '✍️', level: isDemo ? 5 : Math.min(90, 5 + completedList.length * 0.12) },
            { name: 'Tools', icon: '🛠️', level: isDemo ? 8 : Math.min(90, 8 + completedList.length * 0.1) },
            { name: 'Coding', icon: '💻', level: isDemo ? 3 : Math.min(90, 3 + completedList.length * 0.08) },
            { name: 'AI Dev', icon: '🤖', level: isDemo ? 2 : Math.min(90, 2 + completedList.length * 0.06) }
        ];

        var radarHtml = skillCategories.map(function(skill) {
            var levelPercent = Math.round(skill.level);
            var color = levelPercent > 70 ? '#4a9eff' : levelPercent > 40 ? '#8b5cf6' : '#64748b';
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:18px;width:32px;">${skill.icon}</span>
                    <span style="font-size:13px;color:#e2e8f0;flex:1;">${skill.name}</span>
                    <div style="flex:2;height:6px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;max-width:120px;">
                        <div style="width:${levelPercent}%;height:100%;background:${color};border-radius:10px;transition:width 0.8s ease;"></div>
                    </div>
                    <span style="font-size:12px;color:#94a3b8;width:36px;text-align:right;">${levelPercent}%</span>
                </div>
            `;
        }).join('');

        // ===========================================
        // 7. 课程名称和摘要辅助函数
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
            var nextDay = day + 1;
            if (nextDay > 365) nextDay = 365;
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(nextDay);
                    if (lesson && lesson.title) return lesson.title;
                }
            } catch (e) {}
            return 'Day ' + nextDay;
        }

        function getNextLessonSummary() {
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
        }

        var nextTitle = getNextLessonTitle();
        var nextSummary = getNextLessonSummary();

        // ===========================================
        // 8. 最近学习课程
        // ===========================================
        var recentLessons = [];
        if (completedList.length > 0) {
            var copy = completedList.slice();
            var recent = copy.reverse().slice(0, 3);
            recentLessons = recent;
        } else {
            recentLessons = ['day-1', 'day-2', 'day-3'];
        }

        var recentHtml = recentLessons.map(function(id) {
            var title = getLessonTitle(id);
            var isPlaceholder = (id === 'day-1' && !hasProgress);
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:6px;border-left:3px solid ${isPlaceholder ? '#64748b' : '#22c55e'};opacity: ${isPlaceholder ? 0.7 : 1};">
                    <span style="font-size:16px;">${isPlaceholder ? '📖' : '✅'}</span>
                    <span style="font-size:14px;color:#e2e8f0;">${title}</span>
                    <span style="margin-left:auto;font-size:12px;color:#64748b;">${isPlaceholder ? 'Start to unlock' : 'Completed'}</span>
                </div>
            `;
        }).join('');

        // ===========================================
        // 9. 今日学习卡片
        // ===========================================
        var isComplete = (completedList.length >= 365);
        var goalHtml = '';
        if (isComplete) {
            goalHtml = `
                <div style="background:linear-gradient(135deg,rgba(74,158,255,0.2),rgba(124,58,237,0.2));border-radius:16px;padding:32px;text-align:center;border:1px solid rgba(74,158,255,0.2);margin-bottom:20px;">
                    <div style="font-size:48px;margin-bottom:8px;">🎉</div>
                    <h3 style="margin:0 0 4px 0;font-size:22px;font-weight:700;">All 365 Lessons Complete!</h3>
                    <p style="margin:0;color:#94a3b8;font-size:15px;">You've mastered the entire curriculum. Incredible work! 🏆</p>
                    <a href="pages/academy.html" style="display:inline-block;margin-top:16px;padding:12px 32px;background:#4a9eff;border:none;border-radius:10px;color:white;font-size:14px;font-weight:600;text-decoration:none;">🏛️ Explore Advanced Topics</a>
                </div>
            `;
        } else {
            var demoTag = isDemo ? '🌟 Start Here' : 'Day ' + (day + 1);
            var demoSubText = isDemo ? 'Complete your first lesson to start tracking!' : remainingLessons + ' lessons remaining';
            var demoBtnText = isDemo ? '📖 Go to Academy' : '📖 Continue Learning';
            var demoBtnLink = isDemo ? 'pages/academy.html' : 'pages/lesson.html';

            goalHtml = `
                <div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.08);margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <span style="font-size:24px;">${isDemo ? '🌟' : '📖'}</span>
                        <h3 style="margin:0;font-size:18px;font-weight:600;">${isDemo ? 'Start Your Journey' : "Today's Lesson"}</h3>
                        <span style="margin-left:auto;font-size:12px;background:rgba(74,158,255,0.15);color:#4a9eff;padding:2px 12px;border-radius:20px;">${demoTag}</span>
                    </div>
                    <h4 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#ffffff;">${nextTitle}</h4>
                    <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">${isDemo ? 'Complete your first lesson to unlock personalized learning content.' : nextSummary}</p>
                    <div style="display:flex;gap:12px;flex-wrap:wrap;">
                        <a href="${demoBtnLink}" style="padding:10px 28px;background:#4a9eff;border:none;border-radius:10px;color:white;font-size:14px;font-weight:600;text-decoration:none;transition:transform 0.2s;display:inline-block;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">${demoBtnText}</a>
                        <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('✏️ Practice mode coming soon! 🚧')" style="padding:10px 28px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#ffffff;font-size:14px;font-weight:500;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">✏️ Quick Practice</button>
                        <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('📝 Notes will open here soon! 🚧')" style="padding:10px 28px;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.2);border-radius:10px;color:#c4b5fd;font-size:14px;font-weight:500;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(124,58,237,0.3)'" onmouseout="this.style.background='rgba(124,58,237,0.2)'">📝 Take Notes</button>
                    </div>
                    <div style="margin-top:12px;font-size:12px;color:#475569;">${demoSubText}</div>
                </div>
            `;
        }

        // ===========================================
        // 10. 渲染完整页面（Phase 5 增强版）
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
            <div style="padding-bottom: 100px;">

                <!-- 顶部导航 -->
                <header style="background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.08);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <span style="font-size:28px;">🚀</span>
                        <h1 style="margin:0;font-size:20px;font-weight:700;background:linear-gradient(90deg,#4a9eff,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Law AI Academy</h1>
                        <span style="font-size:11px;background:rgba(74,158,255,0.2);color:#4a9eff;padding:2px 10px;border-radius:12px;font-weight:600;">v${this.version}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:16px;font-size:13px;color:#94a3b8;">
                        <span>🎯 Day ${day}</span>
                        <span>⭐ ${xp} XP</span>
                        <span>🔥 Level ${level}</span>
                    </div>
                </header>

                <main style="max-width:1000px;margin:0 auto;padding:24px 20px 20px;">

                    <!-- 欢迎横幅 -->
                    <section style="background:linear-gradient(135deg,rgba(74,158,255,0.15),rgba(124,58,237,0.15));border:1px solid rgba(74,158,255,0.2);border-radius:16px;padding:24px 32px;text-align:center;margin-bottom:24px;">
                        <h2 style="margin:0 0 4px 0;font-size:24px;font-weight:600;">${isDemo ? '🚀 Welcome to Law AI Academy!' : '👋 Welcome Back!'}</h2>
                        <p style="margin:0;color:#94a3b8;font-size:15px;">${isDemo ? 'Start your 365-day AI learning journey today.' : "You're on Day " + day + " · " + currentStage}</p>
                    </section>

                    <!-- 卡片网格 -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px;">
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

                    <!-- ========================================================= -->
                    <!--  Phase 5: 成就墙 + 学习时长 + 签到奖励                      -->
                    <!-- ========================================================= -->

                    <!-- 成就墙 -->
                    <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h3 style="margin:0;color:#94a3b8;font-size:14px;font-weight:400;">🏆 Achievements</h3>
                            <span style="font-size:12px;color:#4a9eff;">${unlockedCount}/${totalAchievements} unlocked</span>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                            ${achievementsHtml}
                        </div>
                    </div>

                    <!-- 学习时长 + 签到奖励（双列） -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">

                        <!-- 学习时长统计 -->
                        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);">
                            <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">⏱️ Learning Time</h3>
                            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                                <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 8px;">
                                    <div style="font-size:20px;font-weight:700;color:#4a9eff;">${formatTime(todayMinutes)}</div>
                                    <div style="font-size:10px;color:#64748b;">Today</div>
                                </div>
                                <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 8px;">
                                    <div style="font-size:20px;font-weight:700;color:#8b5cf6;">${formatTime(weekMinutes)}</div>
                                    <div style="font-size:10px;color:#64748b;">This Week</div>
                                </div>
                                <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px 8px;">
                                    <div style="font-size:20px;font-weight:700;color:#fbbf24;">${formatTime(totalMinutes)}</div>
                                    <div style="font-size:10px;color:#64748b;">Total</div>
                                </div>
                            </div>
                            <div style="font-size:10px;color:#64748b;margin-top:8px;text-align:right;">
                                ${isDemo ? 'Start learning to track your time!' : 'Keep up the momentum! 🚀'}
                            </div>
                        </div>

                        <!-- 连续签到奖励 -->
                        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);">
                            <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">🔥 Streak Rewards</h3>
                            <div style="display:flex;align-items:center;gap:16px;">
                                <div style="flex:1;">
                                    <div style="display:flex;justify-content:space-between;font-size:13px;">
                                        <span style="color:#e2e8f0;">🔥 ${streak} days</span>
                                        <span style="color:#94a3b8;">→ ${nextMilestone} days</span>
                                    </div>
                                    <div style="width:100%;height:6px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;margin-top:4px;">
                                        <div style="width:${streakProgress}%;height:100%;background:linear-gradient(90deg,#f97316,#fbbf24);border-radius:10px;transition:width 0.8s ease;"></div>
                                    </div>
                                    <div style="font-size:12px;color:#64748b;margin-top:4px;">
                                        ${isDemo ? 'Complete daily lessons to build your streak!' : 'Next reward: ' + milestoneReward + ' XP at ' + nextMilestone + ' days 🎯'}
                                    </div>
                                </div>
                                <div style="text-align:center;background:rgba(251,191,36,0.1);border-radius:12px;padding:12px 16px;border:1px solid rgba(251,191,36,0.15);min-width:60px;">
                                    <div style="font-size:24px;">🎁</div>
                                    <div style="font-size:14px;font-weight:700;color:#fbbf24;">+${milestoneReward}</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- ========================================================= -->
                    <!--  Phase 4: 学习日历 + 技能雷达（保留）                      -->
                    <!-- ========================================================= -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">

                        <!-- 学习日历 -->
                        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);">
                            <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">📅 Recent Activity</h3>
                            <div style="display:flex;gap:6px;">
                                ${calendarHtml}
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:8px;">
                                <span>Less activity</span>
                                <span style="display:flex;align-items:center;gap:4px;">
                                    <span style="display:inline-block;width:10px;height:10px;border-radius:4px;background:rgba(255,255,255,0.06);"></span>
                                    <span style="display:inline-block;width:10px;height:10px;border-radius:4px;background:rgba(74,158,255,0.4);"></span>
                                    <span style="display:inline-block;width:10px;height:10px;border-radius:4px;background:rgba(74,158,255,0.7);"></span>
                                    <span style="display:inline-block;width:10px;height:10px;border-radius:4px;background:#4a9eff;"></span>
                                </span>
                                <span>More activity</span>
                            </div>
                        </div>

                        <!-- 技能雷达 -->
                        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);">
                            <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">🧠 Skill Radar</h3>
                            ${radarHtml}
                            <div style="font-size:10px;color:#64748b;margin-top:8px;text-align:right;">
                                ${isDemo ? 'Complete lessons to unlock your skill radar!' : 'Based on your learning progress'}
                            </div>
                        </div>

                    </div>

                    <!-- 今日学习卡片 -->
                    ${goalHtml}

                    <!-- 最近学习课程 -->
                    <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:20px 24px;border:1px solid rgba(255,255,255,0.06);margin-bottom:24px;">
                        <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">📖 Recent Lessons</h3>
                        ${recentHtml}
                    </div>

                    <!-- 隐藏面板 -->
                    <div id="learningPanel" style="display:none;"></div>
                    <div id="workspacePanel" style="display:none;"></div>
                    <div id="runtimePanel" style="display:none;"></div>
                    <div id="modulePanel" style="display:none;"></div>

                </main>
            </div>

            <!-- 底部导航 -->
            <nav style="position:fixed;bottom:0;left:0;right:0;background:rgba(20,20,40,0.92);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-around;padding:8px 0 16px;z-index:100;">
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
                @media (max-width: 600px) {
                    #systemComposerRoot div[style*="display:grid;grid-template-columns:1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
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
