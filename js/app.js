window.LawAIApp = window.LawAIApp || {};

window.App = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🚀 App initialized");

    const Bus = window.LawAIApp.EventBus;
    if (Bus) {
      Bus.emit("app:ready");
    }
  }
};

// ❌ 不要再用 window load 触发 init
// 因为 loader 才是主 boot system

window.addEventListener("LAW_APP_READY", () => {
  console.log("🎉 Loader finished → starting app");

  window.App.init();
});
