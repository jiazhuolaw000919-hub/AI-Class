window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {
  init(boot) {
    console.log("🧩 SystemComposer init");

    const root = document.getElementById("app") || document.body;

    root.innerHTML = "";

    // 🧠 MAIN DASHBOARD
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
        <div id="learningPanel"></div>
      </div>

      <div style="margin-top:20px;">
        <h2>🧠 Workspace</h2>
        <div id="workspacePanel"></div>
      </div>
    `;

    root.appendChild(container);

    this.mountLearning(boot);
    this.mountWorkspace(boot);
  },

  mountLearning(boot) {
    const el = document.getElementById("learningPanel");

    const level = LawAIApp.LevelEngine?.getState?.() || {};
    const xp = LawAIApp.ExperienceEngine?.getXP?.() || 0;

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>📈 Level: ${level.level || 1}</p>
        <p>⭐ XP: ${xp}</p>
      </div>
    `;
  },

  mountWorkspace(boot) {
    const el = document.getElementById("workspacePanel");

    const ws = LawAIApp.WorkspaceState?.get?.("default") || {};

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>🧩 Workspace Active</p>
        <pre>${JSON.stringify(ws, null, 2)}</pre>
      </div>
    `;
  }
};
