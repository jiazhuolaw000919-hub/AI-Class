window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineAutoStub = {
  create(name) {
    console.warn(`🧪 Creating stub engine: ${name}`);

    const stub = {
      __stub: true,
      name,

      init() {
        console.log(`⚠️ Stub engine running: ${name}`);
      }
    };

    if (window.LawAIApp.EngineRegistry) {
      window.LawAIApp.EngineRegistry.register(name, stub);
    }

    return stub;
  }
};
