window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {

    initialized: false,

    init(boot) {

        if (this.initialized) {
            this.refresh();
            return;
        }

        this.initialized = true;

        console.log("🧩 SystemComposer V3.9.9 LIVE");

        const root =
            document.getElementById("law-runtime-root")
            || document.body;

        root.innerHTML = "";

        root.innerHTML = `

        <div
            style="
                padding:25px;
                color:white;
                background:#0b1220;
                min-height:100vh;
                font-family:Arial;
            ">

            <h1>🚀 Law AI Academy</h1>

            <div id="learningPanel"></div>

            <br>

            <div id="workspacePanel"></div>

            <br>

            <div id="runtimePanel"></div>

            <br>

            <div id="modulePanel"></div>

        </div>

        `;

        this.refresh();

    },

    refresh() {

        this.mountLearning();

        this.mountWorkspace();

        this.mountRuntime();

        this.mountRuntimeModules();

    },

    /* =====================================
       LEARNING
    ===================================== */

    mountLearning() {

        const el =
            document.getElementById("learningPanel");

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
                padding:15px;
                border-radius:10px;
            ">

            <h2>📚 Learning</h2>

            <p>📈 Level : ${state.level || 1}</p>

            <p>⭐ XP : ${state.xp || 0}</p>

            <p>🔥 Streak : ${state.streak || 0}</p>

        </div>

        `;

    },

    /* =====================================
       WORKSPACE
    ===================================== */

    mountWorkspace() {

        const el =
            document.getElementById("workspacePanel");

        if (!el) return;

        const ws =
            LawAIApp
                .WorkspaceState
                ?.get?.("default")
            || {};

        el.innerHTML = `

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

            <h2>🧩 Workspace</h2>

            <pre>${JSON.stringify(ws, null, 2)}</pre>

        </div>

        `;

    },

    /* =====================================
       RUNTIME
    ===================================== */

    mountRuntime() {

        const el =
            document.getElementById("runtimePanel");

        if (!el) return;

        const boot =
            LawAIApp.bootStatus
            || {};

        let runtimeModules = [];

        try {

            runtimeModules =
                LawAIApp.RuntimeRegistry
                    ?.discover?.()
                || [];

        } catch (err) {

            console.warn(
                "RuntimeRegistry discover failed",
                err
            );

        }

        el.innerHTML = `

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

            <h2>⚙ Runtime</h2>

            <p>

                ✅ Active Engines :

                <strong>

                ${boot.active?.length || 0}

                </strong>

            </p>

            <p>

                📦 Loaded Files :

                <strong>

                ${boot.loaded?.length || 0}

                </strong>

            </p>

            <p>

                🧩 Runtime Modules :

                <strong>

                ${runtimeModules.length}

                </strong>

            </p>

            <p>

                🚨 Missing :

                <strong>

                ${boot.missing?.length || 0}

                </strong>

            </p>

            <p>

                🛡 Safe Mode :

                <strong>

                ${boot.safeMode ? "ON" : "OFF"}

                </strong>

            </p>

        </div>

        `;

    },

    /* =====================================
       RUNTIME MODULES
    ===================================== */

    mountRuntimeModules() {

        const el =
            document.getElementById("modulePanel");

        if (!el) return;

        el.innerHTML = "";

        if (LawAIApp.RuntimeInjector?.inject) {

            LawAIApp.RuntimeInjector.inject(el);

            return;

        }

        el.innerHTML = `

        <div
            style="
                background:#1e293b;
                padding:15px;
                border-radius:10px;
            ">

            <h2>📦 Runtime Modules</h2>

            <p>

                RuntimeInjector not ready.

            </p>

        </div>

        `;

    }

};

/* =====================================
   AUTO REFRESH
===================================== */

window.addEventListener(

    "LEARNING_UI_REFRESH",

    () => {

        LawAIApp.SystemComposer.refresh();

    }

);

window.addEventListener(

    "SYSTEM_READY",

    () => {

        LawAIApp.SystemComposer.refresh();

    }

);
