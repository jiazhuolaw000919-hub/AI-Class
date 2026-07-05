window.LawAIApp = window.LawAIApp || {};

LawAIApp.safeEngineV2 = function(name, factory, deps = []) {

  const dep = LawAIApp.EngineDependency;

  if (dep && !dep.canRun(name)) {
    console.warn(`⛔ Dependency blocked: ${name}`);
    LawAIApp.EngineHealth.markMissing(name);
    return null;
  }

  try {
    const instance = factory();

    LawAIApp.EngineRegistry?.register(name, instance);
    LawAIApp.EngineHealth.markLoaded(name);

    return instance;

  } catch (err) {
    console.warn(`❌ Engine failed: ${name}`, err);

    LawAIApp.EngineHealth.markFailed(name);

    return null;
  }
};
