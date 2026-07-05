window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineRegistry = {
  engines: {},

  register(name, instance) {
    this.engines[name] = instance;
    console.log(`🧩 Engine registered: ${name}`);
  },

  get(name) {
    return this.engines[name];
  },

  has(name) {
    return !!this.engines[name];
  },

  list() {
    return Object.keys(this.engines);
  }
};
