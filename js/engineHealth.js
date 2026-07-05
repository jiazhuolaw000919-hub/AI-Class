window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineHealth = {
  state: {
    loaded: [],
    missing: [],
    failed: []
  },

  markLoaded(name) {
    this.state.loaded.push(name);
  },

  markMissing(name) {
    this.state.missing.push(name);
  },

  markFailed(name) {
    this.state.failed.push(name);
  },

  report() {
    return {
      ...this.state,
      total: this.state.loaded.length + this.state.missing.length + this.state.failed.length
    };
  }
};
