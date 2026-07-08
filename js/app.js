window.LawAIApp = window.LawAIApp || {};

window.App = {

    initialized: false,

    root: null,

    boot: null,

    /**
     * =========================
     * INIT
     * =========================
     */

    init(payload) {

        if (this.initialized) {

            this.refresh(payload);

            return;

        }

        this.initialized = true;

        console.log("🚀 App Runtime V4");

        this.boot =
            payload?.boot ||
            window.LawAIApp.bootStatus ||
            {};

        this.mountRoot();

        this.render();

    },

    /**
     * =========================
     * ROOT
     * =========================
     */

    mountRoot() {

        let root =
            document.getElementById(
                "law-runtime-root"
            );

        if (!root) {

            document.body.innerHTML = `

            <div
                id="law-runtime-root"
                style="
                    min-height:100vh;
                    background:#0b1220;
                    color:white;
                    font-family:Arial;
                ">
            </div>

            `;

            root =
                document.getElementById(
                    "law-runtime-root"
                );

        }

        this.root = root;

    },

    /**
     * =========================
     * RENDER
     * =========================
     */

    render() {

        if (!this.root) return;

        if (

            window.LawAIApp
                .SystemComposer
                ?.init

        ) {

            window.LawAIApp
                .SystemComposer
                .init(this.boot);

            return;

        }

        this.root.innerHTML = `

        <div style="padding:30px">

            <h1>🚀 Runtime Loading...</h1>

            <p>Waiting SystemComposer...</p>

        </div>

        `;

    },

    /**
     * =========================
     * REFRESH
     * =========================
     */

    refresh(payload) {

        if (payload?.boot) {

            this.boot = payload.boot;

        }

        window.LawAIApp
            .SystemComposer
            ?.refresh?.();

    },

    /**
     * =========================
     * DESTROY
     * =========================
     */

    destroy() {

        this.initialized = false;

        this.boot = null;

        if (this.root) {

            this.root.innerHTML = "";

        }

    }

};

/**
 * =========================
 * EVENTS
 * =========================
 */

window.addEventListener(

    "SYSTEM_READY",

    (e) => {

        console.log("⚡ SYSTEM_READY");

        window.App.init(e.detail);

    }

);

window.addEventListener(

    "RUNTIME_REFRESH",

    () => {

        window.App.refresh();

    }

);

window.addEventListener(

    "RUNTIME_RESET",

    () => {

        window.App.destroy();

    }

);
