window.LawAIApp = window.LawAIApp || {};

window.App = {
  init() {
    console.log("🚀 App init");

    if (window.LawAIApp?.EventBus) {
      window.LawAIApp.EventBus.emit("app:ready");
    }

    // 🔥 CRITICAL FIX: render something so not blank
    document.body.innerHTML = `
      <div style="padding:20px;font-family:Arial">
        <h2>🚀 Law AI System Online</h2>
        <p>Engine Status:</p>
        <pre>${JSON.stringify(window.__ENGINE_STATUS__, null, 2)}</pre>
      </div>
    `;
  }
};

window.addEventListener("load", () => {
  console.log("📦 window load");
});

window.addEventListener("LAW_APP_READY", () => {
  console.log("⚡ LAW_APP_READY received");

  if (window.App?.init) {
    window.App.init();
  }
});
