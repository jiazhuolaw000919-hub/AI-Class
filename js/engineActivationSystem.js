window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineActivationSystem = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("⚡ EngineActivationSystem init");

    const boot = window.LawAIApp.bootStatus;
    if (!boot) {
      console.warn("⚠️ No bootStatus yet");
      return;
    }

    this.activateEngines();
  },

  activateEngines() {
    const allEngines = [
      "levelEngine",
      "experienceEngine",
      "learningIntelligence",
      "workspaceEngine",
      "workspaceState",
      "workspaceLayout",
      "workspaceWidgets",
      "workspaceSearch",
      "eventBus",
      "storageEngine",
      "profileEngine"
    ];

    let active = 0;

    allEngines.forEach(name => {
      const engine = LawAIApp[name];

      if (engine) {
        try {
          engine.init?.();
          engine.start?.();

          console.log(`🟢 activated: ${name}`);
          active++;
        } catch (e) {
          console.warn(`⚠️ activation failed: ${name}`, e);
        }
      } else {
        console.warn(`⚠️ missing runtime engine: ${name}`);
      }
    });

    console.log(`⚡ Activation complete: ${active}/${allEngines.length}`);

    window.dispatchEvent(
      new Event("ENGINE_RUNTIME_READY")
    );
  }
};
