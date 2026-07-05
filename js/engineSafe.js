window.LawAIApp = window.LawAIApp || {};

LawAIApp.safeEngine = function(name, factory) {
  try {
    const instance = factory();

    if (window.LawAIApp.EngineRegistry) {
      window.LawAIApp.EngineRegistry.register(name, instance);
    }

    return instance;

  } catch (err) {
    console.warn(`⚠️ Engine failed: ${name}`, err);

    if (window.LawAIApp.EngineRegistry) {
      window.LawAIApp.EngineRegistry.register(name, {
        __failed: true
      });
    }

    return null;
  }
};
