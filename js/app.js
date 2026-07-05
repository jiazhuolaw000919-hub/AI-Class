window.LawAIApp = window.LawAIApp || {};

function render(data) {
  const safeBoot = data?.boot || data || {};

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (V3.9.7)</h1>

      <h3>🧠 System Status</h3>

      <pre>${JSON.stringify(safeBoot, null, 2)}</pre>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${safeBoot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>

      <p style="margin-top:20px">
        Orchestrated Boot Complete ✔
      </p>
    </div>
  `;
}

window.App = {
  init(payload) {
    console.log("🚀 App V3.9.7 init");

    // ✅ SAFE GUARD (NO illegal return)
    const safePayload = payload || {
      boot: window.LawAIApp.bootStatus || {}
    };

    render(safePayload);
  }
};

window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");
  window.App.init(e?.detail);
});
