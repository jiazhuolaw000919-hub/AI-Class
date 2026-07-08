window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeManager = {

    initialized: false,

    started: false,

    engines: {},

    /**
     * =========================
     * INIT
     * =========================
     */

    init() {

        if (this.initialized) return;

        this.initialized = true;

        console.log("🧠 RuntimeManager initialized");

    },

    /**
     * =========================
     * REGISTER ENGINE
     * Loader 会调用这里
     * =========================
     */

    registerEngine(name, engine) {

        if (!name || !engine) return;

        if (this.engines[name]) return;

        this.engines[name] = engine;

        console.log("📦 Runtime registered:", name);

    },

    /**
     * =========================
     * GET ENGINE
     * =========================
     */

    getEngine(name) {

        return this.engines[name];

    },

    /**
     * =========================
     * GET ALL
     * =========================
     */

    getAll() {

        return Object.values(this.engines);

    },

    /**
     * =========================
     * AUTO COLLECT
     * =========================
     */

    collect() {

        const runtimeEngines = [

            "storageEngine",
            "eventBus",
            "profileEngine",

            "levelEngine",
            "experienceEngine",
            "learningIntelligence",

            "workspaceEngine",
            "workspaceState",
            "workspaceLayout",
            "workspaceWidgets",
            "workspaceSearch",

            "motionSystem",
            "celebrationEngine",
            "themeExperience",
            "ambientEngine",

            "knowledgeNetwork",
            "kreEngine"

        ];

        runtimeEngines.forEach(name => {

            const engine = LawAIApp[name];

            if (!engine) return;

            this.registerEngine(name, engine);

            LawAIApp.RuntimeRegistry?.register?.(

                name,

                engine

            );

        });

        console.log(

            `🧠 Runtime collected ${Object.keys(this.engines).length} engines`

        );

    },

    /**
     * =========================
     * START
     * =========================
     */

    start() {

        if (this.started) return;

        this.started = true;

        console.log("🚀 RuntimeManager starting...");

        this.collect();

        LawAIApp.RuntimeRegistry?.activateAll?.();

        window.dispatchEvent(

            new CustomEvent(

                "RUNTIME_READY",

                {

                    detail: {

                        boot: LawAIApp.bootStatus,

                        timestamp: Date.now()

                    }

                }

            )

        );

        console.log("✅ Runtime READY");

    },

    /**
     * =========================
     * BOOT
     * Loader 调用这里
     * =========================
     */

    boot(payload) {

        this.start();

        console.log("📊 Runtime Boot");

        console.table({

            registered:

                Object.keys(this.engines).length,

            active:

                payload?.active?.length || 0,

            loaded:

                payload?.boot?.loaded?.length || 0,

            missing:

                payload?.boot?.missing?.length || 0

        });

    },

    /**
     * =========================
     * REFRESH
     * =========================
     */

    refresh() {

        window.dispatchEvent(

            new CustomEvent(

                "RUNTIME_REFRESH"

            )

        );

    }

};
