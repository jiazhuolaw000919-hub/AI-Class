window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.4",

    initialized: false,

    boot: {},

    root: null,

    cache: {},

    panels: {},

    _mounting: false,

    _mountedNotified: false,

    init(boot = {}) {

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
            this.root =
                document.getElementById("law-runtime-root")
                || document.body;

            this.cache = {};

            const existingRoot = document.getElementById("systemComposerRoot");
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
                learning: () => this.mountLearning(),
                workspace: () => this.mountWorkspace(),
                runtime: () => this.mountRuntime(),
                modules: () => this.mountRuntimeModules()
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
     * 渲染主 UI（CSS 类 + 内联样式兜底）
     * =========================
     */

    _renderMainUI() {
        if (!this.root) return;
        
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }
        
        this.root.innerHTML = `
        <div id="systemComposerRoot" class="app-container" style="
            min-height: 100vh;
            background: #0b1220;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        ">
            <!-- 顶部导航 -->
            <header class="app-header" style="
                background: rgba(255,255,255,0.05);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255,255,255,0.08);
                padding: 16px 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
            ">
                <div class="header-left" style="display:flex;align-items:center;gap:14px;">
                    <span class="logo-icon" style="font-size:28px;">🚀</span>
                    <h1 class="app-title" style="
                        margin:0;
                        font-size:22px;
                        font-weight:700;
                        background: linear-gradient(90deg, #4a9eff, #7c3aed);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">Law AI Academy</h1>
                    <span class="version-badge" style="
                        font-size:11px;
                        background: rgba(74,158,255,0.2);
                        color: #4a9eff;
                        padding:2px 10px;
                        border-radius:12px;
                        font-weight:600;
                    ">v${this.version}</span>
                </div>
                <div class="header-right" style="display:flex;align-items:center;gap:16px;font-size:13px;color:#94a3b8;">
                    <span class="stat-item" id="headerDay" style="color:#94a3b8;">🎯 Day 1</span>
                    <span class="stat-item" id="headerXP" style="color:#94a3b8;">⭐ 0 XP</span>
                    <span class="stat-item" id="headerLevel" style="color:#94a3b8;">🔥 Level 1</span>
                </div>
            </header>

            <!-- 主内容 -->
            <main class="app-main" style="
                max-width: 1200px;
                margin: 0 auto;
                padding: 24px 32px 60px;
            ">
                <!-- 欢迎横幅 -->
                <section class="welcome-banner" style="
                    background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15));
                    border: 1px solid rgba(74,158,255,0.2);
                    border-radius: 16px;
                    padding: 28px 32px;
                    margin-bottom: 28px;
                    text-align: center;
                ">
                    <h2 style="margin:0 0 8px 0;font-size:24px;font-weight:600;color:#ffffff;">👋 Welcome to Your AI Learning Journey</h2>
                    <p style="margin:0;color:#94a3b8;font-size:15px;">365 days of immersive AI education — track your progress, earn XP, and master the future.</p>
                </section>

                <!-- 面板网格 -->
                <div class="panels-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                    gap: 20px;
                ">
                    <div id="learningPanel" class="panel-card" style="
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 14px;
                        padding: 20px;
                        backdrop-filter: blur(5px);
                    "></div>
                    <div id="workspacePanel" class="panel-card" style="
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 14px;
                        padding: 20px;
                        backdrop-filter: blur(5px);
                    "></div>
                    <div id="runtimePanel" class="panel-card" style="
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 14px;
                        padding: 20px;
                        backdrop-filter: blur(5px);
                    "></div>
                    <div id="modulePanel" class="panel-card panel-full" style="
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 14px;
                        padding: 20px;
                        backdrop-filter: blur(5px);
                        grid-column: 1 / -1;
                    "></div>
                </div>
            </main>

            <!-- 底部 -->
            <footer class="app-footer" style="
                text-align: center;
                padding: 20px;
                border-top: 1px solid rgba(255,255,255,0.05);
                color: #475569;
                font-size: 12px;
            ">
                <span>🏛️ Law AI Academy · Built with ❤️ · v${this.version}</span>
            </footer>

            <!-- 全局样式增强 -->
            <style>
                #systemComposerRoot * { box-sizing: border-box; }
                #systemComposerRoot h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #e2e8f0; }
                #systemComposerRoot ::-webkit-scrollbar { width: 6px; height: 6px; }
                #systemComposerRoot ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 8px; }
                #systemComposerRoot ::-webkit-scrollbar-thumb { background: rgba(74,158,255,0.3); border-radius: 8px; }
                #systemComposerRoot ::-webkit-scrollbar-thumb:hover { background: rgba(74,158,255,0.5); }
                .panel-content { padding: 4px; }
                .panel-title { font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #e2e8f0; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; }
                .stat-box { background: rgba(255,255,255,0.06); padding: 14px; border-radius: 10px; text-align: center; }
                .stat-label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
                .stat-value { display: block; font-size: 22px; font-weight: 700; color: #ffffff; }
                .runtime-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
                .runtime-item { background: rgba(255,255,255,0.06); padding: 12px; border-radius: 10px; text-align: center; }
                .runtime-label { display: block; font-size: 11px; color: #94a3b8; margin-bottom: 2px; }
                .runtime-value { display: block; font-size: 16px; font-weight: 600; color: #ffffff; }
                .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
                .module-card { background: #1e293b; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #4a9eff; }
                .module-name { font-size: 13px; color: #e2e8f0; }
                .workspace-preview { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; overflow: auto; max-height: 180px; }
                .workspace-json { margin: 0; font-size: 12px; color: #94a3b8; white-space: pre-wrap; word-break: break-word; font-family: 'Courier New', monospace; }
                .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #0b1220; color: white; text-align: center; padding: 20px; }
                .error-message { color: #ff6b6b; margin-top: 10px; }
                .error-hint { color: #666; font-size: 14px; margin-top: 20px; }
                .no-modules { color: #888; text-align: center; padding: 20px; }
            </style>
        </div>
        `;
    },

    /**
     * =========================
     * 最小化 UI（兜底）
     * =========================
     */

    _renderMinimalUI() {
        if (!this.root) return;
        
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping minimal render");
            return;
        }
        
        const container = document.createElement('div');
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

    _renderFallbackUI(errorMsg) {
        if (!this.root) return;
        this.root.innerHTML = `
            <div class="error-container">
                <h2>⚠️ SystemComposer Error</h2>
                <p class="error-message">${errorMsg || 'Unknown error'}</p>
                <p class="error-hint">Please refresh or check console for details</p>
            </div>
        `;
    },

    /**
     * =========================
     * 通知 App 已挂载
     * =========================
     */

    _notifyMounted() {
        if (this._mountedNotified) return;
        
        try {
            const event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: {
                    version: this.version,
                    initialized: this.initialized,
                    root: this.root?.id || null
                }
            });
            window.dispatchEvent(event);
            this._mountedNotified = true;
            console.log("📡 Dispatched COMPOSER_MOUNTED event (once)");
        } catch (err) {
            console.warn("Failed to dispatch COMPOSER_MOUNTED:", err);
        }
    },

    refresh() {
        console.log("🔄 SystemComposer refreshing all panels...");
        Object.values(this.panels).forEach(panel => {
            try {
                panel();
            } catch (err) {
                console.warn("Panel render failed:", err);
            }
        });
        this._updateHeaderStats();
    },

    /**
     * =========================
     * 更新顶部状态栏
     * =========================
     */

    _updateHeaderStats() {
        const state = LawAIApp.LearningStateManager?.getState?.() || {};
        const dayEl = document.getElementById('headerDay');
        const xpEl = document.getElementById('headerXP');
        const levelEl = document.getElementById('headerLevel');
        
        if (dayEl) dayEl.textContent = `🎯 Day ${state.day || 1}`;
        if (xpEl) xpEl.textContent = `⭐ ${state.xp || 0} XP`;
        if (levelEl) levelEl.textContent = `🔥 Level ${state.level || 1}`;
    },

    /* =====================================
   LEARNING
===================================== */

    mountLearning() {
        const el = this.cache.learning;
        if (!el) {
            this.cache.learning = document.getElementById("learningPanel");
            if (!this.cache.learning) return;
            el = this.cache.learning;
        }

        const state = LawAIApp.LearningStateManager?.getState?.() || {};

        el.innerHTML = `
            <div class="panel-content">
                <h2 class="panel-title">📚 Learning</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">📈 Level</span>
                        <span class="stat-value">${state.level ?? 1}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">⭐ XP</span>
                        <span class="stat-value">${state.xp ?? 0}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">🔥 Streak</span>
                        <span class="stat-value">${state.streak ?? 0}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">📅 Day</span>
                        <span class="stat-value">${state.day ?? 1}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /* =====================================
   WORKSPACE
===================================== */

    mountWorkspace() {
        const el = this.cache.workspace;
        if (!el) {
            this.cache.workspace = document.getElementById("workspacePanel");
            if (!this.cache.workspace) return;
            el = this.cache.workspace;
        }

        const workspace = LawAIApp.WorkspaceState?.get?.("default") || {};

        el.innerHTML = `
            <div class="panel-content">
                <h2 class="panel-title">🧩 Workspace</h2>
                <div class="workspace-preview">
                    <pre class="workspace-json">${JSON.stringify(workspace, null, 2)}</pre>
                </div>
            </div>
        `;
    },

    /* =====================================
   RUNTIME
===================================== */

    mountRuntime() {
        const el = this.cache.runtime;
        if (!el) {
            this.cache.runtime = document.getElementById("runtimePanel");
            if (!this.cache.runtime) return;
            el = this.cache.runtime;
        }

        const boot = LawAIApp.bootStatus || {};
        const runtime = LawAIApp.RuntimeManager || {};
        const registry = LawAIApp.RuntimeRegistry;

        let modules = [];
        try {
            modules = registry?.discover?.() || registry?.getAll?.() || [];
        } catch (err) {
            console.warn("Runtime registry error:", err);
        }

        const runtimeStarted = runtime.started ? "🟢 Running" : "🟡 Waiting";

        el.innerHTML = `
            <div class="panel-content">
                <h2 class="panel-title">⚙ Runtime</h2>
                <div class="runtime-grid">
                    <div class="runtime-item">
                        <span class="runtime-label">Status</span>
                        <span class="runtime-value">${runtimeStarted}</span>
                    </div>
                    <div class="runtime-item">
                        <span class="runtime-label">Active Engines</span>
                        <span class="runtime-value">${boot.active?.length ?? 0}</span>
                    </div>
                    <div class="runtime-item">
                        <span class="runtime-label">Loaded Files</span>
                        <span class="runtime-value">${boot.loaded?.length ?? 0}</span>
                    </div>
                    <div class="runtime-item">
                        <span class="runtime-label">Runtime Modules</span>
                        <span class="runtime-value">${modules.length}</span>
                    </div>
                    <div class="runtime-item">
                        <span class="runtime-label">Missing</span>
                        <span class="runtime-value">${boot.missing?.length ?? 0}</span>
                    </div>
                    <div class="runtime-item">
                        <span class="runtime-label">Safe Mode</span>
                        <span class="runtime-value">${boot.safeMode ? "ON" : "OFF"}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /* =====================================
   RUNTIME MODULES
===================================== */

    mountRuntimeModules() {
        const el = this.cache.modules;
        if (!el) {
            this.cache.modules = document.getElementById("modulePanel");
            if (!this.cache.modules) return;
            el = this.cache.modules;
        }

        el.innerHTML = "";

        if (LawAIApp.RuntimeInjector?.inject) {
            try {
                LawAIApp.RuntimeInjector.inject(el);
                return;
            } catch (err) {
                console.warn("RuntimeInjector failed:", err);
            }
        }

        const registry = LawAIApp.RuntimeRegistry;
        let engines = [];
        try {
            engines = registry?.discover?.() || registry?.getAll?.() || [];
        } catch (err) {
            console.warn("Runtime registry error:", err);
        }

        const cards = engines.length > 0 ? engines.map(engine => `
            <div class="module-card">
                <span class="module-name">${engine.name || engine.constructor?.name || "Unnamed Engine"}</span>
            </div>
        `).join("") : "<p class='no-modules'>No runtime modules loaded.</p>";

        el.innerHTML = `
            <div class="panel-content">
                <h2 class="panel-title">📦 Runtime Modules</h2>
                <div class="modules-grid">
                    ${cards}
                </div>
            </div>
        `;
    },

    /* =====================================
   PANEL MANAGEMENT
===================================== */

    registerPanel(name, renderer) {
        if (!name || typeof renderer !== "function") {
            console.warn("Invalid panel registration:", name);
            return;
        }
        this.panels[name] = renderer;
        console.log(`📌 Panel "${name}" registered`);
    },

    refreshPanel(name) {
        if (!this.panels[name]) {
            console.warn(`Panel "${name}" not found`);
            return;
        }
        try {
            this.panels[name]();
        } catch (err) {
            console.warn(`Panel ${name} refresh failed`, err);
        }
    },

    destroy() {
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

window.addEventListener("LEARNING_UI_REFRESH", () => {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

window.addEventListener("SYSTEM_READY", e => {
    console.log("📡 SYSTEM_READY received by SystemComposer");
    if (!LawAIApp.SystemComposer.initialized) {
        LawAIApp.SystemComposer.init(e.detail?.boot);
    } else {
        LawAIApp.SystemComposer.boot = e.detail?.boot || LawAIApp.bootStatus || {};
        LawAIApp.SystemComposer.refresh();
    }
});

window.addEventListener("RUNTIME_READY", () => {
    LawAIApp.SystemComposer?.refreshPanel("runtime");
    LawAIApp.SystemComposer?.refreshPanel("modules");
});

window.addEventListener("WORKSPACE_UPDATED", () => {
    LawAIApp.SystemComposer?.refreshPanel("workspace");
});

window.addEventListener("PROFILE_UPDATED", () => {
    LawAIApp.SystemComposer?.refreshPanel("learning");
});

console.log("🧩 SystemComposer V4.0.4 Ready");

// 确保挂载到全局
if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer V' + LawAIApp.SystemComposer.version + ' attached to LawAIApp');
}
