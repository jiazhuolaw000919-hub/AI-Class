window.LawAIApp = window.LawAIApp || {};

function renderApp() {
  console.log("🎯 Rendering UI...");

  const status = window.LawAIApp?.bootStatus;

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0f172a;
      color:#fff;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System Online</h1>

      <h3>📊 Engine Status</h3>
      <pre style="background:#111;padding:10px;border-radius:8px">
${JSON.stringify(status, null, 2)}
      </pre>

      <h3>🧠 System Ready</h3>
      <p>${new Date().toISOString()}</p>
    </div>
  `;
}

window.App = {
  init() {
    console.log("🚀 App init triggered");

    renderApp();
  }
};

/**
 * IMPORTANT FIX:
 * event might fire before listener → so we handle BOTH cases
 */
window.addEventListener("LAW_APP_READY", () => {
  console.log("⚡ LAW_APP_READY received");

  window.App.init();
});

/**
 * SAFETY NET (CRITICAL FIX)
 * if event already fired → still render
 */
setTimeout(() => {
  if (window.LawAIApp?.bootStatus && !document.body.innerHTML.includes("Law AI System")) {
    console.warn("⚠️ fallback render triggered");
    window.App.init();
  }
}, 300);

const safeMode = window.LawAIApp?.safeMode;

if (safeMode) {
  document.body.innerHTML += `
    <div style="color:orange;margin-top:20px">
      ⚠️ Safe Mode Active (Core engines missing)
    </div>
  `;
}
