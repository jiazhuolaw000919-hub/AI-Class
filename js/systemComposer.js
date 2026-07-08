window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.1",

    initialized: false,

    boot: {},

    root: null,

    cache: {},

    panels: {},

    _mounting: false,

    init(boot = {}) {

        this.boot = boot || LawAIApp.bootStatus || {};

        if (this.initialized) {
            console.log("🔄 SystemComposer already initialized, refreshing...");
            this.refresh();
            // 仍然触发事件，通知 App 它还活着
            this._notifyMounted();
            return;
        }

        // 防止并发初始化
        if (this._mounting) {
            console.warn("⏳ SystemComposer is already mounting, skipping duplicate init");
            return;
        }

        this._mounting = true;
        console.log("🧩 SystemComposer V4.0.1 initializing...");

        try {
            this.initialized = true;
            this.root =
                document.getElementById("law-runtime-root")
                || document.body;

            this.cache = {};

            // 只在 root 是 law-runtime-root 时才渲染完整界面
            // 避免破坏外部布局
            if (this.root.id === "law-runtime-root") {
                this._renderMainUI();
            } else {
                console.warn("⚠️ Root element is not 'law-runtime-root', skipping full UI render");
                // 如果 root 不是预期的，只渲染核心内容
                this._renderMinimalUI();
            }

            // Cache frequently-used DOM nodes
            this.cache.learning =
                document.getElementById("learningPanel");

            this.cache.workspace =
                document.getElementById("workspacePanel");

            this.cache.runtime =
                document.getElementById("runtimePanel");

            this.cache.modules =
                document.getElementById("modulePanel");

            // Register built-in panels
            this.panels = {

                learning: () => this.mountLearning(),

                workspace: () => this.mountWorkspace(),

                runtime: () => this.mountRuntime(),

                modules: () => this.mountRuntimeModules()

            };

            // 首次渲染所有面板
            this.refresh();

            console.log("✅ SystemComposer V4.0.1 initialized successfully");
            
            // 通知 App 已经挂载完成
            this._notifyMounted();

        } catch (err) {
            console.error("❌ SystemComposer init failed:", err);
            // 即使失败，也显示基本内容
            this._renderFallbackUI(err.message);
        } finally {
            this._mounting = false;
        }

    },

    /**
     * =========================
     * 渲染主 UI
     * =========================
     */

    _renderMainUI() {
        if (!this.root) return;
        
        this.root.innerHTML = `

        <div
            id="systemComposerRoot"
            style="
                min-height:100vh;
                background:#0b1220;
                color:white;
                font-family:Arial,sans-serif;
                padding:24px;
                box-sizing:border-box;
            ">

            <h1 style="margin-top:0;display:flex;align-items:center;gap:12px;">
                <span>🚀 Law AI Academy</span>
                <span style="font-size:14px;color:#4a9eff;font-weight:normal;">
                    v${this.version}
                </span>
            </h1>

            <div id="learningPanel"></div>

            <br>

            <div id="workspacePanel"></div>

            <br>

            <div id="runtimePanel"></div>

            <br>

            <div id="modulePanel"></div>

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
        // 如果 root 不是预期的，只追加内容而不是覆盖
        const container = document.createElement('div');
        container.id = 'systemComposerRoot';
        container.style.cssText = 'padding:20px;background:#0b1220;color:white;';
        container.innerHTML = `
            <h2>🚀 SystemComposer Active</h2>
            <p style="color:#aaa;">Version ${this.version}</p>
            <div id="learningPanel"></div>
            <div id="workspacePanel"></div>
            <div id="runtimePanel"></div>
            <div id="modulePanel"></div>
        `;
        this.root.appendChild(container);
        // 更新 root 引用到新容器
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
     * 通知 App 已挂载
     * =========================
     */

    _notifyMounted() {
        try {
            const event = new CustomEvent('COMPOSER_MOUNTED', {
                detail: {
                    version: this.version,
                    initialized: this.initialized,
                    root: this.root?.id || null
                }
            });
            window.dispatchEvent(event);
            console.log("📡 Dispatched COMPOSER_MOUNTED event");
        } catch (err) {
            console.warn("Failed to dispatch COMPOSER_MOUNTED:", err);
        }
    },

    refresh() {
        console.log("🔄 SystemComposer refreshing all panels...");
        Object.values(this.panels).forEach(panel => {

            try {

                panel();

            }

            catch (err) {

                console.warn(
                    "Panel render failed:",
                    err
                );

            }

        });
        // 刷新后也通知
        this._notifyMounted();
    },

    /* =====================================
   LEARNING
===================================== */

mountLearning() {

    const el = this.cache.learning;

    if (!el) {
        // 如果缓存丢失，尝试重新获取
        this.cache.learning = document.getElementById("learningPanel");
        if (!this.cache.learning) return;
        el = this.cache.learning;
    }

    const state =
        LawAIApp
            .LearningStateManager
            ?.getState?.()
        || {};

    el.innerHTML = `

    <div
        style="
            background:#1e293b;
            padding:18px;
            border-radius:12px;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
        ">

        <h2 style="margin-top:0;">
            📚 Learning
        </h2>

        <div style="
            display:flex;
            gap:24px;
            flex-wrap:wrap;
        ">

            <div>
                <strong>📈 Level</strong><br>
                ${state.level ?? 1}
            </div>

            <div>
                <strong>⭐ XP</strong><br>
                ${state.xp ?? 0}
            </div>

            <div>
                <strong>🔥 Streak</strong><br>
                ${state.streak ?? 0}
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

    const workspace =
        LawAIApp
            .WorkspaceState
            ?.get?.("default")
        || {};

    el.innerHTML = `

    <div
        style="
            background:#1e293b;
            padding:18px;
            border-radius:12px;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
        ">

        <h2 style="margin-top:0;">
            🧩 Workspace
        </h2>

        <pre style="
            margin:0;
            white-space:pre-wrap;
            word-break:break-word;
            color:#cbd5e1;
            max-height:200px;
            overflow:auto;
            font-size:13px;
        ">${JSON.stringify(workspace, null, 2)}</pre>

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

    const boot =
        LawAIApp.bootStatus || {};

    const runtime =
        LawAIApp.RuntimeManager || {};

    const registry =
        LawAIApp.RuntimeRegistry;

    let modules = [];

    try {

        modules =
            registry?.discover?.()
            || registry?.getAll?.()
            || [];

    } catch (err) {

        console.warn("Runtime registry error:", err);

    }

    const runtimeStarted = runtime.started
        ? "🟢 Running"
        : "🟡 Waiting";

    el.innerHTML = `

    <div
        style="
            background:#1e293b;
            padding:18px;
            border-radius:12px;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
        ">

        <h2 style="margin-top:0;">
            ⚙ Runtime
        </h2>

        <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
            gap:16px;
        ">

            <div>

                <strong>Status</strong><br>

                ${runtimeStarted}

            </div>

            <div>

                <strong>Active Engines</strong><br>

                ${boot.active?.length ?? 0}

            </div>

            <div>

                <strong>Loaded Files</strong><br>

                ${boot.loaded?.length ?? 0}

            </div>

            <div>

                <strong>Runtime Modules</strong><br>

                ${modules.length}

            </div>

            <div>

                <strong>Missing</strong><br>

                ${boot.missing?.length ?? 0}

            </div>

            <div>

                <strong>Safe Mode</strong><br>

                ${boot.safeMode ? "ON" : "OFF"}

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

    const registry =
        LawAIApp.RuntimeRegistry;

    let engines = [];

    try {

        engines =
            registry?.discover?.()
            || registry?.getAll?.()
            || [];

    } catch (err) {

        console.warn("Runtime registry error:", err);

    }

    const cards = engines.length > 0 ? engines.map(engine => `

        <div
            style="
                padding:10px;
                border-radius:8px;
                background:#334155;
                border-left:3px solid #4a9eff;
            ">

            ${engine.name || engine.constructor?.name || "Unnamed Engine"}

        </div>

    `).join("") : "<p style='color:#888;'>No runtime modules loaded.</p>";

    el.innerHTML = `

    <div
        style="
            background:#1e293b;
            padding:18px;
            border-radius:12px;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
        ">

        <h2 style="margin-top:0;">
            📦 Runtime Modules
        </h2>

        <div
            style="
                display:grid;
                grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
                gap:10px;
            ">

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

    }

    catch (err) {

        console.warn(
            `Panel ${name} refresh failed`,
            err
        );

    }

},

destroy() {

    this.initialized = false;

    this.boot = {};

    this.cache = {};

    this.panels = {};

    this.root = null;

    this._mounting = false;

    console.log("🧩 SystemComposer destroyed");

}

};

/* =====================================
   AUTO REFRESH
===================================== */

window.addEventListener(

    "LEARNING_UI_REFRESH",

    () => {

        LawAIApp.SystemComposer?.refreshPanel("learning");

    }

);

window.addEventListener(

    "SYSTEM_READY",

    e => {

        console.log("📡 SYSTEM_READY received by SystemComposer");

        if (!LawAIApp.SystemComposer.initialized) {

            LawAIApp.SystemComposer.init(
                e.detail?.boot
            );

        } else {

            LawAIApp.SystemComposer.boot =
                e.detail?.boot ||
                LawAIApp.bootStatus ||
                {};

            LawAIApp.SystemComposer.refresh();

        }

    }

);

window.addEventListener(

    "RUNTIME_READY",

    () => {

        LawAIApp.SystemComposer?.refreshPanel("runtime");
        LawAIApp.SystemComposer?.refreshPanel("modules");

    }

);

window.addEventListener(

    "WORKSPACE_UPDATED",

    () => {

        LawAIApp.SystemComposer?.refreshPanel("workspace");

    }

);

window.addEventListener(

    "PROFILE_UPDATED",

    () => {

        LawAIApp.SystemComposer?.refreshPanel("learning");

    }

);

// 新增：监听 COMPOSER_MOUNTED 事件，App 可以据此确认渲染完成
console.log("🧩 SystemComposer V4.0.1 Ready");

// 确保挂载到全局
if (typeof window.LawAIApp !== 'undefined') {
    window.LawAIApp.SystemComposer = LawAIApp.SystemComposer;
    console.log('✅ SystemComposer attached to LawAIApp');
}
