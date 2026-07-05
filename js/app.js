window.LawAIApp = window.LawAIApp || {};

window.App = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🚀 App V3.1 starting...");

    const health = window.LawAIApp.EngineHealth?.report?.();

    console.log("📊 ENGINE HEALTH REPORT:", health);

    const Bus = window.LawAIApp.EventBus;

    if (Bus) {
      Bus.emit("app:ready", { health });
    }
  }
};

window.addEventListener("LAW_APP_READY", () => {
  window.App.init();
});
