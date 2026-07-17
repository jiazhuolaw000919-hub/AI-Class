// ================================================================
// ENGINE: SystemComposer
// LAYER: UI Layer
// DOMAIN: System Composition & UI Rendering
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 5.3.2 - Recovery Architecture Integration
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'SystemComposer',
    _engineVersion: '5.3.2',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'UI Layer',
    _domain: 'System Composition & UI Rendering',

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
    _deferredRendered: false,
    _panelsRegistered: false,
    _firstPaintComplete: false,
    _hydrationStage: 0,

    // ============================================================
    // 2. DOM Cache
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
    // 4. Render Queue
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

        var sortedPanels = Array.from(this._dirtyPanels);
        sortedPanels.forEach(function(name) {
            this._renderPanel(name);
        }.bind(this));

        this._dirtyPanels.clear();
    },

    // ============================================================
    // 5. Dirty Panel Render
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
        }
    },

    // ============================================================
    // 6. Recovery
    // ============================================================
    recover: function() {
        if (this._recoveryAttempts >= this._maxRecoveryAttempts) {
            console.warn('⚠️ Max recovery attempts reached');
            return;
        }

        this._recoveryAttempts++;
        console.log('🔄 Recovery attempt ' + this._recoveryAttempts);

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
    // 7. Init — 只做一件事：立即渲染
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
                    // 🔥 关键：立即渲染，不等待任何东西
                    this._renderMainUI();
                } else {
                    console.warn("⚠️ Root element is not 'law-runtime-root', using fallback");
                    this._renderMinimalUI();
                }
                this._cacheDOM();
            }

            // 🔥 面板注册延迟到首屏渲染后（不阻塞）
            this._schedulePanelRegistration();

            // 🔥 刷新延迟到首屏渲染后（不阻塞）
            var self = this;
            setTimeout(function() {
                self.refresh();
                console.log("✅ SystemComposer panels refreshed (after render)");
            }, 300);

            setTimeout(function() {
                self._notifyMounted();
            }, 100);

            // 🔥 标记首屏完成
            this._firstPaintComplete = true;

            // 🔥 隐藏全局 Loader
            this._hideLoader();

            console.log("✅ SystemComposer V" + this.version + " initialized successfully");

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }
    },

    /**
     * 🔥 隐藏全局 Loader（首屏后立即执行）
     */
    _hideLoader: function() {
        var loader = document.getElementById('loading-placeholder');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 800);
            console.log('🔒 Global loader hidden');
        }
    },

    /**
     * 🔥 延迟注册面板（不阻塞首屏）
     */
    _schedulePanelRegistration: function() {
        if (this._panelsRegistered) return;
        this._panelsRegistered = true;

        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 200); };
        
        scheduleFn(function() {
            this.panels = {
                learning: function() { this.mountLearning(); }.bind(this),
                workspace: function() { this.mountWorkspace(); }.bind(this),
                runtime: function() { this.mountRuntime(); }.bind(this),
                modules: function() { this.mountRuntimeModules(); }.bind(this)
            };
            console.log('📌 Panels registered (deferred)');
        }.bind(this));
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
        this._deferredRendered = false;
        this._panelsRegistered = false;
        this._firstPaintComplete = false;
        this._hydrationStage = 0;
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
    // 11. 数据获取方法（纯函数，不依赖引擎状态）
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
            // 静默失败，使用 fallback
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

    // ============================================================
    // ============================================================
    // 🔥 PART 1 RECOVERY: COMPOSE PLACEHOLDER METHODS
    // ============================================================
    // ============================================================

    /**
     * 🔥 composeLayout - Placeholder for future layout composition
     * Part 1 Recovery: Empty placeholder, no behavior change
     */
    composeLayout: function() {
        // Placeholder - future implementation
        // No behavior change
    },

    /**
     * 🔥 composeDashboard - Placeholder for future dashboard composition
     * Part 1 Recovery: Empty placeholder, no behavior change
     */
    composeDashboard: function() {
        // Placeholder - future implementation
        // No behavior change
    },

    /**
     * 🔥 composeWorkspace - Placeholder for future workspace composition
     * Part 1 Recovery: Empty placeholder, no behavior change
     */
    composeWorkspace: function() {
        // Placeholder - future implementation
        // No behavior change
    },

    /**
     * 🔥 composeWidgets - Placeholder for future widget composition
     * Part 1 Recovery: Empty placeholder, no behavior change
     */
    composeWidgets: function() {
        // Placeholder - future implementation
        // No behavior change
    },

    /**
     * 🔥 activateModules - Placeholder for future module activation
     * Part 1 Recovery: Empty placeholder, no behavior change
     */
    activateModules: function() {
        // Placeholder - future implementation
        // No behavior change
    },

    /**
     * 🔥 refresh - Extended to support architecture refresh
     * Part 1 Recovery: Existing refresh + architecture awareness
     */
    refresh: function() {
        console.log("🔄 SystemComposer refreshing all panels...");
        Object.values(this.panels).forEach(function(panel) {
            try { panel(); } catch (err) { console.warn("Panel render failed:", err); }
        });
        this._notifyMounted();
        // Part 1 Recovery: Log architecture status
        console.log('🏗️ Architecture refresh complete');
    },

    /**
     * 🔥 destroy - Extended with architecture cleanup
     * Part 1 Recovery: Existing destroy + architecture cleanup
     */
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
        this._deferredRendered = false;
        this._panelsRegistered = false;
        this._firstPaintComplete = false;
        this._hydrationStage = 0;
        // Part 1 Recovery: Architecture cleanup
        console.log("🧩 SystemComposer destroyed (architecture cleaned)");
    },

    // ============================================================
    // 12. 🔥 First Paint — 立即渲染，零等待
    // ============================================================

    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }

        console.log("⚡ First Paint: Rendering immediately...");

        // ============================================================
        // 1. 获取所有数据（纯函数，立即返回）
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

        var nextTitle = this._getNextLessonTitle(day);
        var nextSummary = this._getNextLessonSummary(day);

        // ===== 动态问候 =====
        function getGreeting() {
            var hour = new Date().getHours();
            if (hour < 12) return 'Good morning';
            if (hour < 17) return 'Good afternoon';
            if (hour < 21) return 'Good evening';
            return 'Good night';
        }

        var greeting = getGreeting();

        // ===== 鼓励语 =====
        var encouragement = '';
        if (completedList.length > 0) {
            if (completedList.length >= 365) {
                encouragement = '🏆 You\'ve completed everything!';
            } else if (streak >= 30) {
                encouragement = '🔥 ' + streak + '-day streak! Unstoppable.';
            } else if (streak >= 7) {
                encouragement = '💪 ' + streak + ' days strong! Keep going.';
            } else if (completedList.length >= 10) {
                encouragement = '🌟 ' + completedList.length + ' lessons done!';
            } else if (completedList.length > 0) {
                encouragement = '🌱 Every step forward counts.';
            }
        }

        var mentorMsg = isDemo ? '🌟 Complete your first lesson to begin.' :
                        (completedList.length >= 365 ? '🎉 You\'re a legend.' :
                        (completionPercent < 30 ? '🌱 Building foundations. Consistency is key.' :
                        (completionPercent < 60 ? '📈 Great momentum. Keep it up!' :
                        (completionPercent < 90 ? '💪 Almost there! Finish strong.' :
                        '🎯 So close to the finish line!'))));

        var fullMentorMsg = greeting + '! ' + mentorMsg;
        if (encouragement) {
            fullMentorMsg += ' ' + encouragement;
        }

        var percent = Math.round(completionPercent || 0);
        var progressDisplay = percent + '%';
        var streakDisplay = streak > 0 ? '🔥 ' + streak + 'd' : '🌱 0d';
        var completedCount = completedList.length || 0;
        var totalCount = 365;
        var lessonCountDisplay = completedCount + '/' + totalCount;

        var nextDay = day + 1;
        if (completedList.length >= 365) {
            nextDay = 365;
        } else if (nextDay > 365) {
            nextDay = 365;
        }
        var lessonLink = isDemo ? '/pages/academy.html' : '/pages/lesson.html?day=' + nextDay;
        var btnText = isDemo ? '📖 Start' : (completedList.length >= 365 ? '🎉 Review' : '📖 Continue');

        // ============================================================
        // 2. 构建 First Paint HTML
        // ============================================================
        var coreHTML = `
        <div id="systemComposerRoot" style="
            min-height: 100vh;
            background: linear-gradient(145deg, #0b1220 0%, #141c2e 50%, #0f1a2e 100%);
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        ">
            <div style="padding: 0 20px 100px; max-width: 1000px; margin: 0 auto;">

                <!-- 🔥 HERO 区 -->
                <div style="
                    margin: 0 -20px 24px;
                    padding: 40px 32px 32px;
                    background: linear-gradient(145deg, #1a2a4a, #0f1a2e);
                    border-radius: 0 0 32px 32px;
                    position: relative;
                    overflow: hidden;
                    isolation: isolate;
                    min-height: 220px;
                ">
                    <div style="
                        position: absolute;
                        top: -120px;
                        right: -80px;
                        width: 400px;
                        height: 400px;
                        background: radial-gradient(circle, rgba(74,158,255,0.06), transparent 70%);
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 0;
                    "></div>
                    <div style="
                        position: absolute;
                        bottom: -100px;
                        left: -60px;
                        width: 300px;
                        height: 300px;
                        background: radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%);
                        border-radius: 50%;
                        pointer-events: none;
                        z-index: 0;
                    "></div>

                    <div style="position:relative;z-index:1;">

                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin-bottom: 12px;
                            flex-wrap: wrap;
                            gap: 8px;
                        ">
                            <span style="
                                font-size: 14px;
                                font-weight: 400;
                                opacity: 0.7;
                                letter-spacing: 0.3px;
                            ">${fullMentorMsg}</span>
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                font-size: 12px;
                                background: rgba(255,255,255,0.04);
                                padding: 2px 12px 2px 8px;
                                border-radius: 100px;
                                border: 1px solid rgba(255,255,255,0.04);
                            ">
                                <span style="opacity:0.5;">✦</span>
                                <span style="font-weight:500;">Lv.${level}</span>
                            </div>
                        </div>

                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 16px;
                            flex-wrap: wrap;
                            margin-bottom: 8px;
                        ">
                            <h1 style="
                                margin: 0;
                                font-size: 28px;
                                font-weight: 700;
                                letter-spacing: -0.3px;
                                background: linear-gradient(90deg, #e2e8f0, #94a3b8);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                background-clip: text;
                            ">Law AI Academy</h1>
                            <div style="
                                display: flex;
                                gap: 6px;
                                flex-wrap: wrap;
                            ">
                                <span style="
                                    font-size: 11px;
                                    background: rgba(74,158,255,0.12);
                                    padding: 2px 12px;
                                    border-radius: 100px;
                                    color: #4a9eff;
                                    font-weight: 500;
                                ">${progressDisplay}</span>
                                <span style="
                                    font-size: 11px;
                                    background: rgba(251,191,36,0.1);
                                    padding: 2px 12px;
                                    border-radius: 100px;
                                    color: #fbbf24;
                                    font-weight: 500;
                                ">${xp} XP</span>
                                <span style="
                                    font-size: 11px;
                                    background: rgba(249,115,22,0.08);
                                    padding: 2px 12px;
                                    border-radius: 100px;
                                    color: #f97316;
                                    font-weight: 500;
                                ">${streakDisplay}</span>
                            </div>
                        </div>

                        <div style="margin-top: 4px;">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                                opacity: 0.5;
                                margin-bottom: 4px;
                            ">
                                <span>Progress</span>
                                <span>${lessonCountDisplay} lessons</span>
                            </div>
                            <div style="
                                height: 3px;
                                background: rgba(255,255,255,0.06);
                                border-radius: 100px;
                                overflow: hidden;
                                max-width: 400px;
                            ">
                                <div style="
                                    width: ${percent}%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #4a9eff, #7c3aed);
                                    border-radius: 100px;
                                    transition: width 0.8s ease;
                                "></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 🔥 Continue Learning -->
                <a href="${lessonLink}" style="
                    display: block;
                    background: linear-gradient(135deg, #4a9eff, #6366f1);
                    border-radius: 20px;
                    padding: 20px 28px;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 40px rgba(74,158,255,0.12);
                    margin-bottom: 28px;
                " onmouseover="this.style.transform='scale(1.01)';this.style.boxShadow='0 12px 60px rgba(74,158,255,0.2)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.12)'">
                    <div style="
                        position: absolute;
                        top: -60px;
                        right: -40px;
                        width: 200px;
                        height: 200px;
                        background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%);
                        border-radius: 50%;
                        pointer-events: none;
                    "></div>
                    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                        <div style="flex:1;min-width:120px;">
                            <div style="
                                font-size: 11px;
                                font-weight: 500;
                                opacity: 0.7;
                                letter-spacing: 0.5px;
                                text-transform: uppercase;
                            ">Next Lesson</div>
                            <div style="
                                font-size: 18px;
                                font-weight: 600;
                                margin: 2px 0;
                                line-height: 1.2;
                            ">${nextTitle}</div>
                            <div style="
                                font-size: 13px;
                                opacity: 0.8;
                            ">${isDemo ? 'Begin your AI journey.' : nextSummary}</div>
                        </div>
                        <div style="
                            padding: 10px 28px;
                            background: rgba(255,255,255,0.12);
                            border-radius: 100px;
                            font-size: 15px;
                            font-weight: 600;
                            backdrop-filter: blur(4px);
                            white-space: nowrap;
                            border: 1px solid rgba(255,255,255,0.05);
                        ">${btnText} →</div>
                    </div>
                </a>

                <!-- ⏳ 延迟加载区（骨架占位） -->
                <div id="deferred-dashboard-content" style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    min-height: 140px;
                    opacity: 0.6;
                ">
                    <div id="skill-mastery-placeholder" style="
                        background: rgba(255,255,255,0.02);
                        border-radius: 16px;
                        padding: 16px 20px;
                        border: 1px solid rgba(255,255,255,0.04);
                    ">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
                            <span style="font-size:14px;">🧠</span>
                            <span style="font-size:12px;color:#94a3b8;font-weight:400;">Skill Mastery</span>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:4px;">
                            ${[0,1,2].map(function(i) {
                                return `
                                <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                                    <span style="font-size:12px;opacity:0.3;">⏳</span>
                                    <span style="font-size:10px;color:#64748b;width:50px;">Loading</span>
                                    <div style="flex:1;height:3px;background:rgba(255,255,255,0.04);border-radius:10px;">
                                        <div style="width:${30 + i * 20}%;height:100%;background:${['#4a9eff','#8b5cf6','#f59e0b'][i]};border-radius:10px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div id="knowledge-graph-placeholder" style="
                        background: rgba(255,255,255,0.02);
                        border-radius: 16px;
                        padding: 16px 20px;
                        border: 1px solid rgba(255,255,255,0.04);
                    ">
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
                            <span style="font-size:14px;">🔗</span>
                            <span style="font-size:12px;color:#94a3b8;font-weight:400;">Knowledge Graph</span>
                        </div>
                        <div style="
                            height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #64748b;
                            font-size: 12px;
                        ">
                            <span style="animation:pulse 1.5s infinite;">Loading graph...</span>
                        </div>
                    </div>
                </div>

                <!-- 底部导航 -->
                <nav style="
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(12,18,30,0.92);
                    backdrop-filter: blur(16px);
                    border-top: 1px solid rgba(255,255,255,0.04);
                    display: flex;
                    justify-content: space-around;
                    padding: 6px 0 14px;
                    z-index: 100;
                ">
                    <a href="/" class="nav-item" data-tab="home" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#4a9eff;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">🏠</span><span>Home</span></a>
                    <a href="/pages/academy.html" class="nav-item" data-tab="academy" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📚</span><span>Academy</span></a>
                    <a href="#" class="nav-item" data-tab="calendar" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📅</span><span>Calendar</span></a>
                    <a href="#" class="nav-item" data-tab="notes" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">📝</span><span>Notes</span></a>
                    <a href="#" class="nav-item" data-tab="settings" style="display:flex;flex-direction:column;align-items:center;gap:1px;color:#64748b;text-decoration:none;font-size:9px;font-weight:500;"><span style="font-size:18px;">⚙️</span><span>Settings</span></a>
                </nav>

                <style>
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                    .nav-item:hover { color: #94a3b8 !important; }
                    .nav-item.active { color: #4a9eff !important; }
                    @media (max-width: 480px) {
                        .nav-item span:last-child { font-size: 8px; }
                        #systemComposerRoot div[style*="display:grid;grid-template-columns:1fr 1fr"] {
                            grid-template-columns: 1fr !important;
                        }
                    }
                </style>
            </div>
        </div>
        `;

        // ============================================================
        // 3. 立即渲染
        // ============================================================
        this.root.innerHTML = coreHTML;
        this._setupNavGuard();
        this._deferredRendered = false;

        console.log("✅ First Paint complete");

        // ============================================================
        // 4. 🔥 分段 Hydration — 不阻塞首屏
        // ============================================================
        var self = this;
        var dataCopy = data;

        // Hydration 1: Skill Mastery (200ms)
        setTimeout(function() {
            self._hydrateSkillMastery(dataCopy, completedList, isDemo);
        }, 200);

        // Hydration 2: Knowledge Graph (400ms)
        setTimeout(function() {
            self._hydrateKnowledgeGraph(dataCopy, completedList, isDemo);
        }, 400);

        // Hydration 3: 刷新面板 (600ms)
        setTimeout(function() {
            self.refresh();
        }, 600);
    },

    /**
     * 🔥 分段 Hydration: Skill Mastery
     */
    _hydrateSkillMastery: function(data, completedList, isDemo) {
        console.log("💧 Hydrating Skill Mastery...");
        this._hydrationStage++;

        var skills = this._getSkillMastery(completedList, isDemo);
        var skillsHtml = skills.map(function(s) {
            var level = s.level;
            var color = level > 70 ? s.color : level > 40 ? '#8b5cf6' : '#64748b';
            return `
                <div style="display:flex;align-items:center;gap:6px;padding:3px 0;">
                    <span style="font-size:12px;">${s.icon}</span>
                    <span style="font-size:10px;color:#94a3b8;width:50px;">${s.name}</span>
                    <div style="flex:1;height:3px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;">
                        <div style="width:${level}%;height:100%;background:${color};border-radius:10px;transition:width 0.6s ease;"></div>
                    </div>
                    <span style="font-size:10px;color:#64748b;width:28px;text-align:right;">${level}%</span>
                </div>
            `;
        }).join('');

        var container = document.getElementById('skill-mastery-placeholder');
        if (container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
                    <span style="font-size:14px;">🧠</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Skill Mastery</span>
                </div>
                ${skillsHtml}
                <div style="font-size:8px;color:#64748b;margin-top:4px;text-align:right;">
                    ${isDemo ? 'Complete lessons to unlock skills!' : ''}
                </div>
            `;
            container.style.animation = 'fadeIn 0.4s ease';
        }
    },

    /**
     * 🔥 分段 Hydration: Knowledge Graph
     */
    _hydrateKnowledgeGraph: function(data, completedList, isDemo) {
        console.log("💧 Hydrating Knowledge Graph...");
        this._hydrationStage++;

        var graph = this._getKnowledgeGraph(completedList, isDemo);
        var nodes = graph.nodes;
        var edges = graph.edges;

        var graphHtml = '';
        if (nodes.length > 0) {
            var nodeHtml = nodes.map(function(n, idx) {
                var size = 20 + (n.size || 0.6) * 12;
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
                        font-size:${size > 24 ? 7 : 5}px;
                        color:white;
                        font-weight:600;
                        text-align:center;
                        box-shadow: 0 0 16px rgba(74,158,255,0.1);
                        border:1px solid rgba(255,255,255,0.06);
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
                        <line x1="${fromLeft}%" y1="50%" x2="${toLeft}%" y2="50%" stroke="rgba(74,158,255,0.12)" stroke-width="1.5" stroke-dasharray="3,3"/>
                    </svg>
                `;
            }).join('');

            graphHtml = `
                <div style="position:relative;height:50px;margin:4px 0 2px;">
                    ${edgeHtml}
                    ${nodeHtml}
                </div>
                <div style="display:flex;justify-content:space-between;font-size:8px;color:#64748b;margin-top:2px;">
                    <span>Knowledge Graph</span>
                    <span>${nodes.length} nodes</span>
                </div>
            `;
        } else {
            graphHtml = '<div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">Complete lessons to build your graph.</div>';
        }

        var container = document.getElementById('knowledge-graph-placeholder');
        if (container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
                    <span style="font-size:14px;">🔗</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Knowledge Graph</span>
                </div>
                ${graphHtml}
            `;
            container.style.animation = 'fadeIn 0.4s ease 0.1s';
        }
    },

    // ============================================================
    // 13. Fallback UI 方法
    // ============================================================

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
    // 14. 导航守卫 — 立即可用
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
    // 15. 原有 Panel 方法
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
    },

    // ============================================================
    // 16. ENGINE STATUS
    // ============================================================
    getStatus: function() {
        var allPanels = Object.keys(this.panels);
        var dirtyPanels = Array.from(this._dirtyPanels);
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this.initialized,
            mounted: this._mountedNotified,
            totalPanels: allPanels.length,
            panels: allPanels,
            dirtyPanels: dirtyPanels,
            recoveryAttempts: this._recoveryAttempts,
            maxRecoveryAttempts: this._maxRecoveryAttempts,
            rootExists: !!this.root,
            domCacheSize: Object.keys(this.cache).length,
            deferredRendered: this._deferredRendered,
            panelsRegistered: this._panelsRegistered,
            firstPaintComplete: this._firstPaintComplete,
            hydrationStage: this._hydrationStage
        };
    },

    // ============================================================
    // 17. IS READY
    // ============================================================
    isReady: function() {
        return this.initialized && this._mountedNotified;
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
