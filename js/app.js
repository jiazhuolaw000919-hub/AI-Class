window.LawAIApp = window.LawAIApp || {};

window.App = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🚀 App init V3");

    const Bus = window.LawAIApp.EventBus;

    if (Bus) {
      Bus.emit("app:ready");
    }
  }
};

window.addEventListener("LAW_APP_READY", () => {
  window.App.init();
});
