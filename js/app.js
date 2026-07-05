window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * SAFE BOOT NORMALIZER
 * =========================
 */
function normalizeBoot(payload) {
  const boot = payload?.boot || payload || {};

  return {
    loaded: boot.loaded || [],
    missing: boot.missing || [],
    total: boot.total ?? (boot.loaded?.length || 0),
    booted: boot.booted ?? true,
    safeMode: boot.safeMode ?? false
  };
}

/**
 * =========================
 * FALLBACK UI (IMPORTANT FIX)
 * =========================
 */
function fallbackRender(container, boot) {
  container.innerHTML = `
    <div style="padding:12px;background:#111827;border-radius:10px;margin-top:10px">
      <h3>⚠️ UI Composer Fallback Mode</h3>
      <p>System is running but UI engine not attached.</p>
      <pre style="white-space:pre-wrap">${JSON.stringify(boot, null, 2)}</pre>
    </div>
  `;
}

/**
 * =========================
 * MAIN RENDER
 * =========================
 */
function render(payload) {
  const boot = normalizeBoot(payload);

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (LIVE v3.9.11)</h1>

      <div id="system-root"></div>

      <div style="margin-top:20px;opacity:0.7">
        ${boot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>
    </div>
  `;

  const root = document.getElementById("system-root");

  try {
    // 🧠 Preferred UI system
    if (window.LawAIApp?.SystemComposer?.render) {
      window.LawAIApp.SystemComposer.render({
        container: root,
        boot
      });

    // 🧠 Secondary UI system
    } else if (window.LawAIApp?.UIRootEngine?.render) {
      window.LawAIApp.UIRootEngine.render(root, boot);

    // 🧠 NEW: layout engine fallback (IMPORTANT FIX)
    } else if (window.LawAIApp?.LayoutEngineV2?.render) {
      window.LawAIApp.LayoutEngineV2.render(root, boot);

    // 🧠 FINAL FALLBACK (no more white screen)
    } else {
      fallbackRender(root, boot);
    }

  } catch (e) {
    console.warn("UI render crashed → fallback activated", e);
    fallbackRender(root, boot);
  }
}

/**
 * =========================
 * APP CORE
 * =========================
 */
window.App = {
  init(payload) {
    console.log("🚀 App V3.9.11 init (UI COMPOSER FIX)");

    if (!payload) {
      payload = { boot: window.LawAIApp.bootStatus };
    }

    render(payload);
  }
};

/**
 * =========================
 * EVENT HOOK
 * =========================
 */
window.addEventListener("SYSTEM_READY", (e) => {
  console.log("⚡ SYSTEM_READY received");
  window.App.init(e?.detail || {});
});

window.addEventListener("ENGINE_BOOTSTRAPPED", () => {
  console.log("🔥 Engines ready → refreshing UI");

  if (window.App?.init) {
    window.App.init(window.LawAIApp.bootStatus);
  }
});

window.addEventListener("ENGINE_RUNTIME_READY", () => {
  console.log("🔥 ENGINE RUNTIME FULLY ACTIVE");
});
