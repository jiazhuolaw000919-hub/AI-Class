window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * SAFE RENDER (V3.9.3 FIX)
 * =========================
 */
function render(data) {
  const boot = data?.boot || data || {};

  // 🧠 fallback 防止 undefined
  const safeBoot = {
    loaded: boot.loaded || [],
    missing: boot.missing || [],
    total: boot.total ?? 0,
    booted: boot.booted ?? false,
    safeMode: boot.safeMode ?? false
  };

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (V3.9.3)</h1>

      <h3>🧠 System Status</h3>

      <pre>${JSON.stringify(safeBoot, null, 2)}</pre>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${
          safeBoot.safeMode
            ? "⚠️ SAFE MODE ACTIVE"
            : "✅ FULL SYSTEM ACTIVE"
        }
      </div>

      <p style="margin-top:20px">
        Orchestrated Boot Complete ✔
      </p>
    </div>
  `;
}

/**
 * =========================
 * APP CORE
 * =========================
 */
window.App = {
  init(payload) {
    console.log("🚀 App V3.9.3 init");

    // 🧠 safety check
    if (!payload) {
      console.warn("⚠️ No SYSTEM_READY payload received");
      payload = { boot: window.LawAIApp.bootStatus };
    }

    render(payload);
  }
};

/**
 * =========================
 * EVENT WIRING (FIXED)
 * =========================
 */
window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");

  window.App.init(e?.detail || {});
});
