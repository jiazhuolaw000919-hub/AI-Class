window.LawAIApp = window.LawAIApp || {};

function render(data) {
  const boot = data?.boot || data;

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (V3.9)</h1>

      <h3>🧠 System Status</h3>

      <pre>${JSON.stringify(boot, null, 2)}</pre>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${boot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>

      <p style="margin-top:20px">
        Orchestrated Boot Complete ✔
      </p>
    </div>
  `;
}

window.App = {
  init(payload) {
    console.log("🚀 App V3.9 init");
    render(payload);
  }
};

window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");
  window.App.init(e.detail);
});
