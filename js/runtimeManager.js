window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeManager = {
  started: false,

  start() {
    if (this.started) return;

    this.started = true;

    console.log("🚀 RuntimeManager starting...");

    this.collect();

    LawAIApp.RuntimeRegistry?.activateAll?.();

    window.dispatchEvent(
      new CustomEvent("RUNTIME_READY", {
        detail: {
          boot: LawAIApp.bootStatus,
          timestamp: Date.now()
        }
      })
    );

    console.log("✅ Runtime READY");
  },

  collect() {

    const runtimeEngines = [
      "LevelEngine",
      "ExperienceEngine",
      "LearningIntelligence",

      "WorkspaceEngine",
      "WorkspaceState",
      "WorkspaceLayout",
      "WorkspaceWidgets",
      "WorkspaceSearch",

      "MotionSystem",
      "CelebrationEngine",
      "ThemeExperience",
      "AmbientEngine",

      "KnowledgeNetwork",
      "KREEngine"
    ];

    runtimeEngines.forEach(name => {

      const engine = LawAIApp[name];

      if (!engine) return;

      LawAIApp.RuntimeRegistry?.register(name, engine);

    });

    console.log(
      `🧠 Runtime collected ${LawAIApp.RuntimeRegistry.getAll().length} engines`
    );
  }
};
