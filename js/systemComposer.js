window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.3",

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
     * 渲染主 UI（使用 CSS 类）
     * =========================
     */

    _renderMainUI() {
        if (!this.root) return;
        
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping render");
            return;
        }
        
        this.root.innerHTML = `
        <div id="systemComposerRoot" class="app-container">
            <!-- 顶部导航 -->
            <header class="app-header">
                <div class="header-left">
                    <span class="logo-icon">🚀</span>
                    <h1 class="app-title">Law AI Academy</h1>
                    <span class="version-badge">v${this.version}</span>
                </div>
                <div class="header-right">
                    <span class="stat-item" id="headerDay">🎯 Day 1</span>
                    <span class="stat-item" id="headerXP">⭐ 0 XP</span>
                    <span class="stat-item" id="headerLevel">🔥 Level 1</span>
                </div>
            </header>

            <!-- 主内容 -->
            <main class="app-main">
                <!-- 欢迎横幅 -->
                <section class="welcome-banner">
                    <h2>👋 Welcome to Your AI Learning Journey</h2>
                    <p>365 days of immersive AI education — track your progress, earn XP, and master the future.</p>
                </section>

                <!-- 面板网格 -->
                <div class="panels-grid">
                    <div id="learningPanel" class="panel-card"></div>
                    <div id="workspacePanel" class="panel-card"></div>
                    <div id="runtimePanel" class="panel-card"></div>
                    <div id="modulePanel" class="panel-card panel-full"></div>
                </div>
            </main>

            <!-- 底部 -->
            <footer class="app-footer">
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

    _renderMinimalUI() {
        if (!this.root) return;
        
        if (document.getElementById("systemComposerRoot")) {
            console.log("🔄 systemComposerRoot already exists, skipping minimal render");
            return;
        }
        
        const container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.className = 'app-container';
        container.innerHTML = `
            <header class="app-header">
                <div class="header-left">
                    <span class="logo-icon">🚀</span>
                    <h1 class="app-title">Law AI Academy</h1>
                    <span class="version-badge">v${this.version}</span>
                </div>
            </header>
            <main class="app-main">
                <section class="welcome-banner">
                    <h2>🚀 SystemComposer Active</h2>
                    <p>Version ${this.version}</p>
                </section>
                <div class="panels-grid">
                    <div id="learningPanel" class="panel-card"></div>
                    <div id="workspacePanel" class="panel-card"></div>
                    <div id="runtimePanel" class="panel-card"></div>
                    <div id="modulePanel" class="panel-card panel-full"></div>
                </div>
            </main>
            <footer class="app-footer">
                <span>🏛️ Law AI Academy · v${this.version}</span>
            </footer>
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
        // 更新顶部状态栏
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
   LEARNING（使用 CSS 类）
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
   WORKSPACE（使用 CSS 类）
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
   RUNTIME（使用 CSS 类）
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
   RUNTIME MODULES（使用 CSS 类）
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

console.log("🧩 SystemComposer V4.0.3 Ready");

// 确保挂载到全局
if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer V' + LawAIApp.SystemComposer.version + ' attached to LawAIApp');
}
