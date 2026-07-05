window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineDependency = {
  map: {},

  register(engine, deps = []) {
    this.map[engine] = deps;
  },

  canRun(engine) {
    const deps = this.map[engine] || [];

    return deps.every(d => {
      return window.LawAIApp.EngineRegistry?.has(d);
    });
  }
};
