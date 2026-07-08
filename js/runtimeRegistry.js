window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeRegistry = {
  engines: [],

  register(name, engine) {
    if (!engine) return;

    const exists = this.engines.find(e => e.name === name);
    if (exists) return;

    this.engines.push({
      name,
      engine
    });

    console.log(`🧩 Runtime registered: ${name}`);
  },

  get(name) {
    return this.engines.find(e => e.name === name)?.engine;
  },

  getAll() {
    return this.engines;
  },

  activateAll() {
    console.log("🚀 Runtime activating engines...");

    this.engines.forEach(({ name, engine }) => {
      try {
        if (typeof engine.init === "function") {
          engine.init();
          console.log(`✅ ${name} activated`);
        }
      } catch (err) {
        console.warn(`⚠️ ${name} activation failed`, err);
      }
    });
  }
};
