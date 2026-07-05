window.LawAIApp = window.LawAIApp || {};

function render(boot) {
  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (V3.6)</h1>

      <h3>🧠 System Status</h3>
      <pre>${JSON.stringify(boot, null, 2)}</pre>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${window.LawAIApp.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>

      <p style="margin-top:20px">
        Orchestrated Boot Complete ✔
      </p>
    </div>
  `;
}

window.App = {
  init(boot) {
    console.log("🚀 App init (V3.6)");

    render(boot);
  }
};

/**
 * NEW FLOW (IMPORTANT)
 */
window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");

  window.App.init(e.detail);
});
