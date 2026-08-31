// ================================================================
// ENGINE: SystemComposer
// LAYER: UI Layer
// DOMAIN: System Composition & UI Rendering
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 5.3.4 - Fixed
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'SystemComposer',
    _engineVersion: '5.3.4',
    version: '5.3.4',  // 🔥 添加 version 属性
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
            } else {
                // 🔥 立即渲染
                this._renderMainUI();
                this._cacheDOM();
            }

            // 延迟注册面板
            this._schedulePanelRegistration();

            // 延迟刷新
            var self = this;
            setTimeout(function() {
                self.refresh();
                console.log("✅ SystemComposer panels refreshed");
            }, 300);

            setTimeout(function() {
                self._notifyMounted();
            }, 100);

            this._firstPaintComplete = true;
            this._hideLoader();

            console.log("✅ SystemComposer V" + this.version + " initialized successfully");

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }
    },

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
    // 8. Refresh（只定义一个）
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
        if (this._dirtyPanels) this._dirtyPanels.clear();
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
    // 11. 数据获取方法
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
        } catch (err) {}

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
    // 12. Render Main UI
    // ============================================================
    _renderMainUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }
    
        console.log("⚡ First Paint: Rendering S4 Dashboard...");

        // 🔥 优先使用真正的 S4 Dashboard
        if (window.LawAIApp && window.LawAIApp.Dashboard && typeof window.LawAIApp.Dashboard.render === 'function') {
            var container = document.createElement('div');
            container.id = 'systemComposerRoot';
            this.root.appendChild(container);
        
            window.LawAIApp.Dashboard.render();
        
            this._hideLoader();
            console.log("✅ S4 Dashboard rendered");
            return;
        }

        // ⚠️ Fallback: 显示 minimal skeleton
        console.warn("⚠️ Dashboard not available, using minimal skeleton");
        this._renderMinimalUI();
    },

    // ============================================================
    // 13. Minimal UI
    // ============================================================
    _renderMinimalUI: function() {
        if (!this.root) return;
        if (document.getElementById("systemComposerRoot")) return;
        var container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'padding:20px;background:#0b1220;color:white;min-height:100vh;';
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <h1 style="margin:0;">🚀 Law AI Academy</h1>
                <span style="font-size:14px;color:#4a9eff;background:#1e293b;padding:4px 12px;border-radius:20px;">v${this.version}</span>
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
        console.log("🔄 Minimal UI rendered");
    },

    _renderFallbackUI: function(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;font-family:'Inter',sans-serif;">
                <h2>⚠️ SystemComposer Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:14px;cursor:pointer;">🔄 Refresh</button>
            </div>
        `;
    },

    // ============================================================
    // 14. Panel 方法
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
    // 15. Status
    // ============================================================
    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            initialized: this.initialized,
            mounted: this._mountedNotified,
            totalPanels: Object.keys(this.panels).length,
            hasDashboard: !!(window.LawAIApp && window.LawAIApp.Dashboard)
        };
    },

    isReady: function() {
        return this.initialized && this._mountedNotified;
    }
};

// ============================================================
// Event Listeners
// ============================================================

window.addEventListener("LEARNING_UI_REFRESH", function() {
    if (LawAIApp.SystemComposer) {
        LawAIApp.SystemComposer.refreshPanel("learning");
    }
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
    if (LawAIApp.SystemComposer) {
        LawAIApp.SystemComposer.refreshPanel("runtime");
        LawAIApp.SystemComposer.refreshPanel("modules");
    }
});

console.log("🧩 SystemComposer V" + LawAIApp.SystemComposer.version + " loaded");
