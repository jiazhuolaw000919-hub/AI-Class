window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineBootstrapper = {
  init() {
    console.log("⚡ EngineBootstrapper starting...");

    const engines = [
      "LevelEngine",
      "ExperienceEngine",
      "LearningIntelligence",
      "WorkspaceEngine"
    ];

    engines.forEach(name => {
      const engine = LawAIApp[name];

      if (engine?.init) {
        try {
          engine.init();
          console.log(`✅ ${name} initialized`);
        } catch (e) {
          console.warn(`⚠️ ${name} failed init`, e);
        }
      }
    });

    window.dispatchEvent(new Event("ENGINE_BOOTSTRAPPED"));
  }
};
