window.LawAIApp = window.LawAIApp || {};

window.App = {
  init() {
    console.log("🚀 App initialized");

    if (LawAIApp.EventBus) {
      LawAIApp.EventBus.emit("app:ready");
    }
  }
};

window.addEventListener("load", () => {
  window.App.init();
});
