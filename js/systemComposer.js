window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {
  init(boot) {
    console.log("🧩 SystemComposer v3.9.9 init");

    const root = document.getElementById("system-root") || document.body;

    root.innerHTML = "";

    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial";
    container.style.color = "white";
    container.style.background = "#0b1220";
    container.style.minHeight = "100vh";

    container.innerHTML = `
      <h1>🚀 Law AI System LIVE</h1>

      <div style="margin-top:20px;">
        <h2>📊 Learning Engine</h2>
        <div id="learningPanel">Loading...</div>
      </div>

      <div style="margin-top:20px;">
        <h2>🧠 Workspace</h2>
        <div id="workspacePanel">Loading...</div>
      </div>

      <div style="margin-top:20px;opacity:0.7">
        ${boot?.safeMode ? "⚠️ SAFE MODE ACTIVE" : "✅ FULL SYSTEM ACTIVE"}
      </div>
    `;

    root.appendChild(container);

    this.mountLearning(boot);
    this.mountWorkspace(boot);
  },

  /**
   * =========================
   * FIXED LEARNING PANEL
   * =========================
   */
  mountLearning(boot) {
    const el = document.getElementById("learningPanel");
    if (!el) return;

    // 🔥 FIX: correct engine names (IMPORTANT)
    const level =
      LawAIApp.levelEngine?.getState?.() ||
      LawAIApp.LevelEngine?.getState?.() ||
      { level: 1 };

    const xp =
      LawAIApp.experienceEngine?.getXP?.() ??
      LawAIApp.ExperienceEngine?.getXP?.() ??
      0;

    const ai =
      LawAIApp.learningIntelligence?.getState?.() ||
      LawAIApp.LearningIntelligence?.getState?.() ||
      null;

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>📈 Level: ${level.level ?? 1}</p>
        <p>⭐ XP: ${xp}</p>
        <p>🧠 AI Status: ${ai ? "ACTIVE" : "STUB MODE"}</p>
      </div>
    `;
  },

  /**
   * =========================
   * FIXED WORKSPACE PANEL
   * =========================
   */
  mountWorkspace(boot) {
    const el = document.getElementById("workspacePanel");
    if (!el) return;

    const ws =
      LawAIApp.workspaceState?.get?.("default") ||
      LawAIApp.WorkspaceState?.get?.("default") ||
      {};

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>🧩 Workspace Active</p>
        <pre style="white-space:pre-wrap">${JSON.stringify(ws, null, 2)}</pre>
      </div>
    `;
  }
};
