window.LawAIApp = window.LawAIApp || {};

function render(boot) {
  const safeBoot = boot?.boot || boot || {};

  document.body.innerHTML = `
    <div style="
      padding:20px;
      font-family:Arial;
      background:#0b1220;
      color:white;
      min-height:100vh;
    ">
      <h1>🚀 Law AI System (LIVE)</h1>

      <div id="system-root"></div>

      <div style="margin-top:20px;opacity:0.7">
        ${safeBoot.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>
    </div>
  `;

  // 🔥 NEW: TRY TO BOOT REAL SYSTEM UI
  try {
    if (window.LawAIApp?.SystemComposer?.render) {
      window.LawAIApp.SystemComposer.render({
        container: document.getElementById("system-root"),
        boot: safeBoot
      });
    } else if (window.LawAIApp?.UIRootEngine?.render) {
      window.LawAIApp.UIRootEngine.render(document.getElementById("system-root"));
    } else {
      document.getElementById("system-root").innerHTML =
        "<p>⚠️ UI Composer missing (system not fully wired)</p>";
    }
  } catch (e) {
    console.warn("UI render failed:", e);
  }
}

window.App = {
  init(payload) {
    console.log("🚀 App V3.9.10 init (UI FIX)");

    if (!payload) {
      payload = { boot: window.LawAIApp.bootStatus };
    }

    render(payload);
  }
};

window.addEventListener("SYSTEM_READY", (e) => {
  window.App.init(e.detail);
});
