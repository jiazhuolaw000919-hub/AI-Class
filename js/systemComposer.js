window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    version: "4.0.0",

    initialized: false,

    boot: {},

    root: null,

    cache: {},

    panels: {},

    init(boot = {}) {

        this.boot = boot || LawAIApp.bootStatus || {};

        if (this.initialized) {

            this.refresh();

            return;

        }

        this.initialized = true;

        console.log("🧩 SystemComposer V4.0 LIVE");

        this.root =
            document.getElementById("law-runtime-root")
            || document.body;

        this.cache = {};

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

            <h1 style="margin-top:0;">
                🚀 Law AI Academy
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

        this.refresh();

    },

    refresh() {

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

    },

    /* =====================================
   LEARNING
===================================== */

mountLearning() {

    const el = this.cache.learning;

    if (!el) return;

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

    if (!el) return;

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
        ">${JSON.stringify(workspace, null, 2)}</pre>

    </div>

    `;

},

    /* =====================================
   RUNTIME
===================================== */

mountRuntime() {

    const el = this.cache.runtime;

    if (!el) return;

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

        console.warn(err);

    }

    const runtimeStarted =
        runtime.started
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

    if (!el) return;

    el.innerHTML = "";

    if (LawAIApp.RuntimeInjector?.inject) {

        LawAIApp.RuntimeInjector.inject(el);

        return;

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

        console.warn(err);

    }

    const cards = engines.map(engine => `

        <div
            style="
                padding:10px;
                border-radius:8px;
                background:#334155;
            ">

            ${engine.name || engine.constructor?.name || "Unnamed Engine"}

        </div>

    `).join("");

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

            ${cards || "<p>No runtime modules.</p>"}

        </div>

    </div>

    ";

},

},

/* =====================================
   PANEL MANAGEMENT
===================================== */

registerPanel(name, renderer) {

    if (!name || typeof renderer !== "function") return;

    this.panels[name] = renderer;

},

refreshPanel(name) {

    if (!this.panels[name]) return;

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

    console.log("🧩 SystemComposer destroyed");

}

};

/* =====================================
   AUTO REFRESH
===================================== */

window.addEventListener(

    "LEARNING_UI_REFRESH",

    () => {

        LawAIApp.SystemComposer?.refresh();

    }

);

window.addEventListener(

    "SYSTEM_READY",

    e => {

        if (

            !LawAIApp.SystemComposer.initialized

        ) {

            LawAIApp.SystemComposer.init(

                e.detail?.boot

            );

        }

        else {

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

        LawAIApp.SystemComposer?.refreshPanel(

            "runtime"

        );

        LawAIApp.SystemComposer?.refreshPanel(

            "modules"

        );

    }

);

window.addEventListener(

    "WORKSPACE_UPDATED",

    () => {

        LawAIApp.SystemComposer?.refreshPanel(

            "workspace"

        );

    }

);

window.addEventListener(

    "PROFILE_UPDATED",

    () => {

        LawAIApp.SystemComposer?.refreshPanel(

            "learning"

        );

    }

);

console.log(

    "🧩 SystemComposer V4.0 Ready"

);
