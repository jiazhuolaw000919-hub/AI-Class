// ================================================================
// systemComposer.js – V5.0 FINAL
// 重构：DOM Cache + Panel Registry + Render Queue + Dirty Refresh + Recovery
// 100% 保留所有现有功能（含 Phase 7/8/9/10 全部 UI）
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "5.0.0",

    // ============================================================
    // 1. Runtime State
    // ============================================================
    initialized: false,
    boot: {},
    root: null,
    cache: {},
    panels: {},
    _mounting: false,
    _mountedNotified: false,
    _renderScheduled: false,
    _dirtyPanels: new Set(),
    _recoveryAttempts: 0,
    _maxRecoveryAttempts: 3,

    // ============================================================
    // 2. DOM Cache（一次性查询）
    // ============================================================
    _cacheDOM: function() {
        if (Object.keys(this.cache).length > 0) return this.cache;

        this.cache = {
            learning: document.getElementById("learningPanel"),
            workspace: document.getElementById("workspacePanel"),
            runtime: document.getElementById("runtimePanel"),
            modules: document.getElementById("modulePanel"),
            systemComposerRoot: document.getElementById("systemComposerRoot")
        };
        console.log("📦 DOM cached");
        return this.cache;
    },

    getDOM: function(key) {
        this._cacheDOM();
        return this.cache[key] || null;
    },

    // ============================================================
    // 3. Panel Registry
    // ============================================================
    registerPanel: function(name, renderer) {
        if (!name || typeof renderer !== "function") {
            console.warn("Invalid panel registration:", name);
            return;
        }
        this.panels[name] = renderer;
        this._dirtyPanels.add(name);
        console.log('📌 Panel "' + name + '" registered');
    },

    resolvePanel: function(name) {
        return this.panels[name] || null;
    },

    // ============================================================
    // 4. Render Queue（防重复渲染）
    // ============================================================
    scheduleRender: function(panelName) {
        if (panelName && this.panels[panelName]) {
            this._dirtyPanels.add(panelName);
        }

        if (this._renderScheduled) return;

        this._renderScheduled = true;
        requestAnimationFrame(function() {
            this._processQueue();
        }.bind(this));
    },

    _processQueue: function() {
        this._renderScheduled = false;

        if (this._dirtyPanels.size === 0) return;

        console.log("🎨 Processing render queue, panels:", Array.from(this._dirtyPanels));

        // 按注册顺序渲染
        var sortedPanels = Array.from(this._dirtyPanels);
        sortedPanels.forEach(function(name) {
            this._renderPanel(name);
        }.bind(this));

        this._dirtyPanels.clear();
    },

    // ============================================================
    // 5. Dirty Panel Render（容错：单个面板失败不影响其他）
    // ============================================================
    _renderPanel: function(name) {
        var renderer = this.panels[name];
        if (!renderer) {
            console.warn('⚠️ Panel not found:', name);
            return;
        }

        try {
            renderer();
            console.log('✅ Panel "' + name + '" rendered');
            this._recoveryAttempts = 0;
        } catch (err) {
            console.warn('⚠️ Panel "' + name + '" render failed:', err);
            // 继续渲染其他面板，不中断
        }
    },

    // ============================================================
    // 6. Recovery（面板级容错）
    // ============================================================
    recover: function() {
        if (this._recoveryAttempts >= this._maxRecoveryAttempts) {
            console.warn('⚠️ Max recovery attempts reached');
            return;
        }

        this._recoveryAttempts++;
        console.log('🔄 Recovery attempt ' + this._recoveryAttempts);

        // 重新渲染所有面板
        Object.keys(this.panels).forEach(function(name) {
            this._dirtyPanels.add(name);
        }.bind(this));

        this._processQueue();

        if (this._dirtyPanels.size === 0) {
            this._recoveryAttempts = 0;
            console.log('✅ Recovery complete');
        }
    },

    // ============================================================
    // 7. Init
    // ============================================================
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
            this._cacheDOM();

            var existingRoot = document.getElementById("systemComposerRoot");
            if (existingRoot) {
                console.log("🔄 systemComposerRoot already exists, reusing...");
                this.root = existingRoot;
            } else {
                if (this.root.id === "law-runtime-root") {
                    this._renderMainUI();
                } else {
                    console.warn("⚠️ Root element is not 'law-runtime-root', using fallback");
                    this._renderMinimalUI();
                }
                this._cacheDOM();
            }

            // 注册面板（保留所有现有面板）
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
    // 8. Refresh
    // ============================================================
    refresh: function() {
        console.log("🔄 SystemComposer refreshing all panels...");
        Object.values(this.panels).forEach(function(panel) {
            try { panel(); } catch (err) { console.warn("Panel render failed:", err); }
        });
        this._notifyMounted();
    },

    refreshPanel: function(name) {
        if (!this.panels[name]) {
            console.warn('Panel "' + name + '" not found');
            return;
        }
        try { this.panels[name](); } catch (err) { console.warn('Panel ' + name + ' refresh failed', err); }
    },

    // ============================================================
    // 9. Destroy
    // ============================================================
    destroy: function() {
        this.initialized = false;
        this.boot = {};
        this.cache = {};
        this.panels = {};
        this.root = null;
        this._mounting = false;
        this._mountedNotified = false;
        this._dirtyPanels.clear();
        this._renderScheduled = false;
        console.log("🧩 SystemComposer destroyed");
    },

    // ============================================================
    // 10. Notify Mounted
    // ============================================================
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

    // ============================================================
    // 11. 原有 UI 渲染（100% 保留，一行不改）
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

        var nextDay = Math.min(day + 1, totalLessons);
        var completed = completedList.length;
        var todayGoal = Math.min(completed + 1, totalLessons);

        goals.push({ icon: '📖', label: 'Complete Day ' + todayGoal + ' lesson', done: completed >= todayGoal });

        if (streak < 7) {
            goals.push({ icon: '🔥', label: 'Reach 7-day streak (' + streak + '/7)', done: false });
        } else if (streak < 14) {
            goals.push({ icon: '🔥', label: 'Reach 14-day streak (' + streak + '/14)', done: false });
        } else if (streak < 30) {
            goals.push({ icon: '🔥', label: 'Reach 30-day streak (' + streak + '/30)', done: false });
        } else {
            goals.push({ icon: '🏅', label: 'Maintain your ' + streak + '-day streak!', done: true });
        }

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

    _getSkillMastery: function(completedList, isDemo) {
        var skills = [
            { id: 'foundation', name: 'Foundation', icon: '🏛️', color: '#4a9eff' },
            { id: 'prompt', name: 'Prompt Eng', icon: '✍️', color: '#8b5cf6' },
            { id: 'tools', name: 'AI Tools', icon: '🛠️', color: '#f59e0b' },
            { id: 'coding', name: 'Coding', icon: '💻', color: '#22c55e' },
            { id: 'aidev', name: 'AI Dev', icon: '🤖', color: '#f97316' }
        ];

        if (isDemo) {
            return skills.map(function(s) {
                return { ...s, level: Math.floor(Math.random() * 20) + 5 };
            });
        }

        var total = completedList.length || 1;
        var base = Math.min(total / 365, 1);

        return skills.map(function(s, index) {
            var multiplier = 1 + (index * 0.05);
            var level = Math.round(Math.min(95, (base * 85 + 10) * multiplier));
            return { ...s, level: level };
        });
    },

    _getKnowledgeGraph: function(completedList, isDemo) {
        if (isDemo || completedList.length < 3) {
            return {
                nodes: [
                    { id: 'node1', label: 'Start Here', size: 1 },
                    { id: 'node2', label: 'Learn AI', size: 0.8 },
                    { id: 'node3', label: 'Build Skills', size: 0.6 }
                ],
                edges: [
                    { from: 'node1', to: 'node2' },
                    { from: 'node2', to: 'node3' }
                ]
            };
        }

        var recent = completedList.slice(-5);
        var nodes = recent.map(function(id, index) {
            var title = this._getLessonTitle(id);
            return {
                id: 'node' + index,
                label: title.length > 12 ? title.slice(0, 10) + '…' : title,
                size: 0.6 + (index / recent.length) * 0.4
            };
        }.bind(this));

        var edges = [];
        for (var i = 0; i < nodes.length - 1; i++) {
            edges.push({ from: nodes[i].id, to: nodes[i + 1].id });
        }

        return { nodes: nodes, edges: edges };
    },

    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        // ============================================================
        // 以下为完整 UI 渲染（保持你的原版 HTML，一行不改）
        // ============================================================

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

        var nextTitle = this._getNextLessonTitle(day);
        var nextSummary = this._getNextLessonSummary(day);

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

        var goalProgressHtml = '';
        for (var i = 0; i < totalGoals; i++) {
            var isDone = i < completedGoals;
            goalProgressHtml += `
                <div style="flex:1;height:4px;background:${isDone ? '#4a9eff' : 'rgba(255,255,255,0.06)'};border-radius:10px;${isDone ? 'box-shadow: 0 0 8px rgba(74,158,255,0.3);' : ''}"></div>
            `;
        }

        var now = new Date();
        var endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        var diffMs = endOfDay - now;
        var diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        var diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        // ===== 🔥 动态问候 + 鼓励语 =====
        function getGreeting() {
            var hour = new Date().getHours();
            if (hour < 12) return '🌅 Good morning';
            if (hour < 17) return '☀️ Good afternoon';
            if (hour < 21) return '🌇 Good evening';
            return '🌙 Good night';
        }

        var greeting = getGreeting();
        var encouragement = '';
        if (completedList.length > 0) {
            if (completedList.length >= 365) {
                encouragement = '🏆 You\'re a legend!';
            } else if (streak >= 30) {
                encouragement = '🔥 ' + streak + ' days streak! Amazing!';
            } else if (streak >= 7) {
                encouragement = '💪 ' + streak + ' days streak! Keep going!';
            } else if (completedList.length >= 10) {
                encouragement = '🌟 You\'ve completed ' + completedList.length + ' lessons!';
            } else if (completedList.length > 0) {
                encouragement = '🌱 Every journey begins with a single step.';
            }
        }

        var mentorMsg = isDemo ? '🌟 Complete your first lesson to unlock personalized guidance!' :
                        (completedList.length >= 365 ? '🏆 You\'ve mastered all 365 lessons! Incredible!' :
                        (completionPercent < 30 ? '🌱 Keep building your foundation. Consistency is key!' :
                        (completionPercent < 60 ? '📈 You\'re making great progress! Keep it up!' :
                        (completionPercent < 90 ? '💪 Almost there! Finish strong!' :
                        '🎯 You\'re so close to the finish line!'))));

        var fullMentorMsg = greeting + '! ' + mentorMsg;
        if (encouragement) {
            fullMentorMsg += ' ' + encouragement;
        }

        var skills = this._getSkillMastery(completedList, isDemo);
        var skillsHtml = skills.map(function(s) {
            var level = s.level;
            var color = level > 70 ? s.color : level > 40 ? '#8b5cf6' : '#64748b';
            return `
                <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                    <span style="font-size:14px;">${s.icon}</span>
                    <span style="font-size:10px;color:#94a3b8;width:50px;">${s.name}</span>
                    <div style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                        <div style="width:${level}%;height:100%;background:${color};border-radius:10px;"></div>
                    </div>
                    <span style="font-size:10px;color:#64748b;width:28px;text-align:right;">${level}%</span>
                </div>
            `;
        }).join('');

        var graph = this._getKnowledgeGraph(completedList, isDemo);
        var nodes = graph.nodes;
        var edges = graph.edges;

        var graphHtml = '';
        if (nodes.length > 0) {
            var nodeHtml = nodes.map(function(n, idx) {
                var size = 24 + (n.size || 0.6) * 16;
                var left = 10 + (idx / (nodes.length - 1 || 1)) * 80;
                var color = idx === nodes.length - 1 ? '#4a9eff' : '#8b5cf6';
                return `
                    <div style="
                        position:absolute;
                        left:${left}%;
                        top:50%;
                        transform:translate(-50%,-50%);
                        width:${size}px;
                        height:${size}px;
                        background:${color};
                        border-radius:50%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:${size > 30 ? 8 : 6}px;
                        color:white;
                        font-weight:600;
                        text-align:center;
                        box-shadow: 0 0 20px rgba(74,158,255,0.2);
                        border:2px solid rgba(255,255,255,0.1);
                        z-index:2;
                        line-height:1.1;
                        padding:2px;
                    ">
                        ${n.label.length > 8 ? n.label.slice(0,6)+'…' : n.label}
                    </div>
                `;
            }).join('');

            var edgeHtml = edges.map(function(e) {
                var fromIdx = nodes.findIndex(function(n) { return n.id === e.from; });
                var toIdx = nodes.findIndex(function(n) { return n.id === e.to; });
                if (fromIdx === -1 || toIdx === -1) return '';
                var fromLeft = 10 + (fromIdx / (nodes.length - 1 || 1)) * 80;
                var toLeft = 10 + (toIdx / (nodes.length - 1 || 1)) * 80;
                return `
                    <svg style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;">
                        <line x1="${fromLeft}%" y1="50%" x2="${toLeft}%" y2="50%" stroke="rgba(74,158,255,0.2)" stroke-width="2" stroke-dasharray="4,4"/>
                    </svg>
                `;
            }).join('');

            graphHtml = `
                <div style="position:relative;height:70px;margin:4px 0 2px;">
                    ${edgeHtml}
                    ${nodeHtml}
                </div>
                <div style="display:flex;justify-content:space-between;font-size:8px;color:#64748b;margin-top:2px;">
                    <span>Knowledge Graph</span>
                    <span>${nodes.length} nodes</span>
                </div>
            `;
        }

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

        // ============================================================
        // 完整 HTML
        // ============================================================
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
                        <span style="font-size:14px;color:#e2e8f0;flex:1;">${fullMentorMsg}</span>
                    </div>

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

                    ${(completedList.length >= 365) ? `
                    <div style="background:linear-gradient(135deg,rgba(74,158,255,0.15),rgba(124,58,237,0.15));border-radius:14px;padding:24px;text-align:center;border:1px solid rgba(74,158,255,0.15);margin-bottom:16px;">
                        <div style="font-size:36px;">🎉</div>
                        <h3 style="margin:4px 0;font-size:18px;">All 365 Lessons Complete!</h3>
                        <p style="color:#94a3b8;font-size:13px;">You've mastered the entire curriculum! 🏆</p>
                        <a href="/pages/academy.html" style="display:inline-block;margin-top:10px;padding:8px 24px;background:#4a9eff;border-radius:8px;color:white;font-size:13px;font-weight:600;text-decoration:none;">🏛️ Explore Advanced</a>
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
                            ${(function() {
                                var nextDay = completedList.length >= 365 ? 365 : Math.min(day + 1, 365);
                                var lessonLink = isDemo ? '/pages/academy.html' : '/pages/lesson.html?day=' + nextDay;
                                var btnText = isDemo ? '📖 Start' : (completedList.length >= 365 ? '🎉 Review' : '📖 Continue');
                                return '<a href="' + lessonLink + '" style="padding:8px 20px;background:#4a9eff;border-radius:8px;color:white;font-size:13px;font-weight:600;text-decoration:none;">' + btnText + '</a>';
                            })()}
                            <button onclick="if(LawAIApp.Toast) LawAIApp.Toast.info('✏️ Practice coming soon!')" style="padding:8px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#94a3b8;font-size:13px;cursor:pointer;">✏️ Practice</button>
                        </div>
                    </div>
                    `}

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">

                        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                            <h4 style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:400;">🧠 Skill Mastery</h4>
                            ${skillsHtml}
                            <div style="font-size:8px;color:#64748b;margin-top:4px;text-align:right;">
                                ${isDemo ? 'Complete lessons to unlock skills!' : 'Based on completed lessons'}
                            </div>
                        </div>

                        <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                            <h4 style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:400;">🔗 Knowledge Graph</h4>
                            ${graphHtml || '<div style="color:#64748b;font-size:12px;text-align:center;padding:12px 0;">Complete lessons to build your knowledge graph!</div>'}
                        </div>

                    </div>

                    <div id="learningPanel" style="display:none;"></div>
                    <div id="workspacePanel" style="display:none;"></div>
                    <div id="runtimePanel" style="display:none;"></div>
                    <div id="modulePanel" style="display:none;"></div>

                </main>
            </div>

            <nav style="position:fixed;bottom:0;left:0;right:0;background:rgba(20,20,40,0.92);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-around;padding:6px 0 12px;z-index:100;">
                <a href="/" class="nav-item" data-tab="home" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#4a9eff;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">🏠</span><span>Home</span></a>
                <a href="/pages/academy.html" class="nav-item" data-tab="academy" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📚</span><span>Academy</span></a>
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

    _renderMinimalUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;
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

    // ============================================================
    // 🔥 导航守卫（修复：Home 和 Academy 真正跳转）
    // ============================================================
    _setupNavGuard: function() {
        var navItems = document.querySelectorAll('.nav-item');
        var self = this;
        navItems.forEach(function(item) {
            item.removeEventListener('click', self._navClickHandler);
            item.addEventListener('click', self._navClickHandler = function(e) {
                var tab = this.getAttribute('data-tab');
                if (tab === 'home') {
                    window.location.href = '/';
                    return;
                }
                if (tab === 'academy') {
                    window.location.href = '/pages/academy.html';
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
    // 原有 Panel 方法（保留）
    // ============================================================
    mountLearning: function() {
        var el = this.getDOM('learning');
        if (!el) return;
        var state = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                state = LawAIApp.ProgressEngine.getState();
            }
        } catch (err) {}
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📚 Learning</h2><div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;"><span>Level ${state.level || 1}</span><span>XP ${state.xp || 0}</span><span>Streak ${state.streak || 0}</span><span>Day ${state.day || 1}</span></div></div>`;
    },

    mountWorkspace: function() {
        var el = this.getDOM('workspace');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">🧩 Workspace</h2><p style="color:#94a3b8;font-size:13px;">Ready</p></div>`;
    },

    mountRuntime: function() {
        var el = this.getDOM('runtime');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">⚙ Runtime</h2><p style="color:#4a9eff;font-size:13px;">🟢 Online</p></div>`;
    },

    mountRuntimeModules: function() {
        var el = this.getDOM('modules');
        if (!el) return;
        el.innerHTML = `<div style="background:#1e293b;padding:18px;border-radius:12px;"><h2 style="margin:0 0 8px;">📦 Modules</h2><p style="color:#94a3b8;font-size:13px;">All systems ready</p></div>`;
    }

};

// ============================================================
// Event Listeners（保留原有）
// ============================================================

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
