window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.5",

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
     * 渲染主 UI（用户界面版）
     * =========================
     */

    _renderMainUI: function() {
        if (!this.root) return;
        
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }
        
        // 获取学习状态
        var state = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                state = LawAIApp.ProgressEngine.getState();
            } else if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                var p = LawAIApp.ProgressEngine.getProgress();
                state = {
                    level: p.level || 1,
                    xp: p.xp || 0,
                    streak: p.streak || 0,
                    day: p.day || 1,
                    completionPercent: p.completionPercent || 0,
                    currentStage: p.currentStage || 'Foundation',
                    remainingLessons: (p.totalLessons || 365) - (p.completedLessons ? p.completedLessons.length : 0)
                };
            }
        } catch (err) {
            console.warn('⚠️ Failed to get progress state:', err);
        }
        
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
            <!-- ===== 顶部导航 ===== -->
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
                    <span style="
                        font-size:11px;
                        background: rgba(74,158,255,0.2);
                        color: #4a9eff;
                        padding:2px 10px;
                        border-radius:12px;
                        font-weight:600;
                    ">v${this.version}</span>
                </div>
                <div style="display:flex;align-items:center;gap:16px;font-size:13px;color:#94a3b8;">
                    <span>🎯 Day ${state.day || 1}</span>
                    <span>⭐ ${state.xp || 0} XP</span>
                    <span>🔥 Level ${state.level || 1}</span>
                </div>
            </header>

            <!-- ===== 主内容 ===== -->
            <main style="max-width:1000px;margin:0 auto;padding:24px 20px 60px;">
                
                <!-- 欢迎横幅 -->
                <div style="
                    background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15));
                    border: 1px solid rgba(74,158,255,0.2);
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    margin-bottom: 24px;
                ">
                    <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:600;">👋 Welcome Back!</h2>
                    <p style="margin:0;color:#94a3b8;font-size:16px;">
                        Continue your AI learning journey. You're on Day ${state.day || 1}!
                    </p>
                    <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                        <button onclick="location.href='pages/lesson.html'" style="
                            padding:12px 32px;
                            background:#4a9eff;
                            border:none;
                            border-radius:10px;
                            color:white;
                            font-size:15px;
                            font-weight:600;
                            cursor:pointer;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📖 Continue Learning
                        </button>
                        <button onclick="location.href='pages/academy.html'" style="
                            padding:12px 32px;
                            background:rgba(255,255,255,0.08);
                            border:1px solid rgba(255,255,255,0.15);
                            border-radius:10px;
                            color:white;
                            font-size:15px;
                            cursor:pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                            🏛️ Academy
                        </button>
                    </div>
                </div>

                <!-- ===== 状态卡片 ===== -->
                <div style="
                    display:grid;
                    grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
                    gap:16px;
                    margin-bottom:24px;
                ">
                    <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                        <div style="font-size:32px;">📈</div>
                        <div style="font-size:28px;font-weight:700;color:#4a9eff;">${state.level || 1}</div>
                        <div style="color:#94a3b8;font-size:13px;">Level</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                        <div style="font-size:32px;">⭐</div>
                        <div style="font-size:28px;font-weight:700;color:#fbbf24;">${state.xp || 0}</div>
                        <div style="color:#94a3b8;font-size:13px;">Total XP</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                        <div style="font-size:32px;">🔥</div>
                        <div style="font-size:28px;font-weight:700;color:#f97316;">${state.streak || 0}</div>
                        <div style="color:#94a3b8;font-size:13px;">Day Streak</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                        <div style="font-size:32px;">📚</div>
                        <div style="font-size:28px;font-weight:700;color:#8b5cf6;">${Math.round(state.completionPercent || 0)}%</div>
                        <div style="color:#94a3b8;font-size:13px;">Progress</div>
                    </div>
                </div>

                <!-- ===== 快速操作 ===== -->
                <div style="
                    background:rgba(255,255,255,0.03);
                    border-radius:14px;
                    padding:20px 24px;
                    border:1px dashed rgba(255,255,255,0.08);
                ">
                    <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">🚀 Quick Actions</h3>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;">
                        <a href="pages/lesson.html" style="color:#4a9eff;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='#7c3aed'" onmouseout="this.style.color='#4a9eff'">📖 Today's Lesson</a>
                        <a href="pages/academy.html" style="color:#4a9eff;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='#7c3aed'" onmouseout="this.style.color='#4a9eff'">🏛️ Academy Dashboard</a>
                        <span style="color:#475569;font-size:14px;">⚡ System: Online</span>
                        <span style="color:#475569;font-size:14px;">📍 ${state.currentStage || 'Foundation'}</span>
                    </div>
                </div>

                <!-- ===== 进度条 ===== -->
                <div style="margin-top:20px;">
                    <div style="display:flex;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:6px;">
                        <span>Learning Progress</span>
                        <span>${Math.round(state.completionPercent || 0)}%</span>
                    </div>
                    <div style="
                        width:100%;
                        height:6px;
                        background:rgba(255,255,255,0.08);
                        border-radius:10px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${Math.round(state.completionPercent || 0)}%;
                            height:100%;
                            background: linear-gradient(90deg, #4a9eff, #7c3aed);
                            border-radius:10px;
                            transition: width 0.5s ease;
                        "></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-top:4px;">
                        <span>Day ${state.day || 1}</span>
                        <span>${state.remainingLessons || 365} lessons remaining</span>
                    </div>
                </div>

                <!-- ===== 隐藏的面板（保留功能） ===== -->
                <div id="learningPanel" style="display:none;"></div>
                <div id="workspacePanel" style="display:none;"></div>
                <div id="runtimePanel" style="display:none;"></div>
                <div id="modulePanel" style="display:none;"></div>

            </main>

            <!-- ===== 底部 ===== -->
            <footer style="
                text-align:center;
                padding:20px;
                border-top:1px solid rgba(255,255,255,0.05);
                color:#475569;
                font-size:12px;
            ">
                <span>🏛️ Law AI Academy · Built with ❤️ · v${this.version}</span>
            </footer>
        </div>
        `;
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
            <div style="padding:40px;text-align:center;background:#0b1220;color:white;min-height:100vh;">
                <h2>⚠️ SystemComposer Error</h2>
                <p style="color:#ff6b6b;">${errorMsg || 'Unknown error'}</p>
                <p style="color:#666;font-size:14px;margin-top:20px;">
                    Please refresh or check console for details
                </p>
            </div>
        `;
    },

    /**
     * =========================
     * 通知 App 已挂载（仅触发一次）
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

console.log("🧩 SystemComposer V4.0.5 Ready");

// 确保挂载到全局
if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer V' + LawAIApp.SystemComposer.version + ' attached to LawAIApp');
}
