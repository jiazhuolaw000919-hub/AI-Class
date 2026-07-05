window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {
  init(boot) {
    console.log("🧩 SystemComposer V3.9.12 init");

    const root = document.getElementById("app") || document.body;
    root.innerHTML = "";

    const container = document.createElement("div");
    container.style.cssText = `
      padding:20px;
      font-family:Arial;
      color:white;
      background:#0b1220;
      min-height:100vh;
    `;

    container.innerHTML = `
      <h1>🚀 Law AI System LIVE</h1>

      <div style="margin-top:20px;">
        <h2>📊 Learning Engine</h2>
        <div id="learningPanel"></div>
      </div>

      <div style="margin-top:20px;">
        <h2>🧠 Learning Intelligence</h2>
        <div id="intelligencePanel"></div>
      </div>

      <div style="margin-top:20px;">
        <h2>🧩 Workspace</h2>
        <div id="workspacePanel"></div>
      </div>
    `;

    root.appendChild(container);

    this.mountLearning();
    this.mountIntelligence();
    this.mountWorkspace();
  },

  mountLearning() {
    const el = document.getElementById("learningPanel");

    const level = LawAIApp.levelEngine?.getState?.() || {};
    const xp = LawAIApp.experienceEngine?.getXP?.() || 0;

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>📈 Level: ${level.level || 1}</p>
        <p>⭐ XP: ${xp}</p>
      </div>
    `;
  },

  mountIntelligence() {
    const el = document.getElementById("intelligencePanel");

    const ai = LawAIApp.learningIntelligence?.getState?.() || {
      status: "inactive"
    };

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>🧠 AI Status: ${ai.status}</p>
        <pre>${JSON.stringify(ai, null, 2)}</pre>
      </div>
    `;
  },

  mountWorkspace() {
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
