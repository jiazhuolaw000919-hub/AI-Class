window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * SAFE BOOT CONTEXT
 * =========================
 */
function getSafeBoot(data) {
  const boot = data?.boot || data || {};

  return {
    loaded: boot.loaded || [],
    missing: boot.missing || [],
    total: boot.total ?? 0,
    booted: boot.booted ?? false,
    safeMode: boot.safeMode ?? false
  };
}

/**
 * =========================
 * SELF-HEAL UI ENGINE
 * =========================
 */
function ensureUIFallback(boot) {
  const hasUI =
    window.LawAIApp?.UI ||
    window.LawAIApp?.Dashboard ||
    window.LawAIApp?.LearningUI;

  if (hasUI) return;

  console.warn("🧠 UI missing → activating fallback renderer");

  window.LawAIApp.UIFallback = {
    render() {
      const container = document.createElement("div");

      container.style = `
        padding:20px;
        font-family:Arial;
        background:#0b1220;
        color:white;
        min-height:100vh;
      `;

      container.innerHTML = `
        <h1>🚀 Law AI System (V3.9.5)</h1>

        <h3>🧠 System Status</h3>

        <pre>${JSON.stringify(boot, null, 2)}</pre>

        <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
          ${boot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
        </div>

        <hr/>

        <h3>📦 Engine Health</h3>
        <p>Loaded Engines: ${boot.loaded.length}</p>
        <p>Missing Engines: ${boot.missing.length}</p>

        <hr/>

        <h3>🧠 System Mode</h3>
        <p>${boot.safeMode ? "DEGRADED MODE" : "FULL MODE ACTIVE"}</p>

        <p style="margin-top:20px">
          Orchestrated Boot Complete ✔
        </p>
      `;

      document.body.innerHTML = "";
      document.body.appendChild(container);
    }
  };

  window.LawAIApp.UIFallback.render();
}

/**
 * =========================
 * EVENT SELF-HEAL
 * =========================
 */
function ensureEventBus() {
  if (window.LawAIApp.EventBus) return;

  console.warn("⚠️ EventBus missing → injecting fallback");

  window.LawAIApp.EventBus = {
    events: {},
    on(evt, fn) {
      this.events[evt] = this.events[evt] || [];
      this.events[evt].push(fn);
    },
    emit(evt, data) {
      (this.events[evt] || []).forEach(fn => fn(data));
    }
  };
}

/**
 * =========================
 * RENDER CORE
 * =========================
 */
function render(data) {
  const boot = getSafeBoot(data);

  ensureEventBus();
  ensureUIFallback(boot);

  const safeBoot = boot;

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (V3.9.5 SELF-HEALING)</h1>

      <h3>🧠 System Status</h3>

      <pre>${JSON.stringify(safeBoot, null, 2)}</pre>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${safeBoot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>

      <hr/>

      <h3>🛠 Self-Healing Status</h3>
      <ul>
        <li>EventBus: ${window.LawAIApp.EventBus ? "OK" : "FIXED"}</li>
        <li>UI Layer: ${window.LawAIApp.UIFallback ? "FALLBACK ACTIVE" : "OK"}</li>
      </ul>

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
    console.log("🚀 App V3.9.5 SELF-HEAL INIT");

    if (!payload) {
      payload = { boot: window.LawAIApp.bootStatus };
    }

    render(payload);
  }
};

/**
 * =========================
 * SYSTEM READY WIRING
 * =========================
 */
window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");
  window.App.init(e?.detail || {});
});

window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");

  window.App.init(e.detail);

  // 🔥 ADD THIS
  LawAIApp.SystemComposer?.init(e.detail.boot);
});
