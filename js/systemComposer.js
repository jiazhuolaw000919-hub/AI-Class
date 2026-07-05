window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {
  init(boot) {
    console.log("🧩 SystemComposer V3.9.10 init");

    const root = document.getElementById("app") || document.body;

    if (!boot) {
      console.warn("⚠️ No boot data received, using fallback");
      boot = window.LawAIApp.bootStatus || {};
    }

    root.innerHTML = "";

    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.fontFamily = "Arial";
    container.style.color = "white";
    container.style.background = "#0b1220";
    container.style.minHeight = "100vh";

    container.innerHTML = `
      <h1>🚀 Law AI System LIVE (V3.9.10)</h1>

      <div style="margin-top:20px;">
        <h2>📊 Engine Health</h2>
        <pre>${JSON.stringify(boot, null, 2)}</pre>
      </div>

      <div style="margin-top:20px;">
        <h2>🧠 Learning System</h2>
        <div id="learningPanel">Loading...</div>
      </div>

      <div style="margin-top:20px;">
        <h2>🧩 Workspace System</h2>
        <div id="workspacePanel">Loading...</div>
      </div>

      <div style="margin-top:20px;padding:10px;background:#1e293b;border-radius:10px">
        ${
          boot.safeMode
            ? "⚠️ SAFE MODE ACTIVE"
            : "✅ FULL SYSTEM ACTIVE"
        }
      </div>
    `;

    root.appendChild(container);

    // async mount (prevents blank UI crash)
    setTimeout(() => {
      this.mountLearning();
      this.mountWorkspace();
    }, 50);
  },

  mountLearning() {
    const el = document.getElementById("learningPanel");
    if (!el) return;

    const level = LawAIApp.LevelEngine?.getState?.() || { level: 1 };
    const xp = LawAIApp.ExperienceEngine?.getXP?.() || 0;
    const learning = LawAIApp.LearningIntelligence?.getState?.() || null;

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>📈 Level: ${level.level || 1}</p>
        <p>⭐ XP: ${xp}</p>
        <p>🧠 AI Status: ${learning ? "ACTIVE" : "STUB/LOADING"}</p>
      </div>
    `;
  },

  mountWorkspace() {
    const el = document.getElementById("workspacePanel");
    if (!el) return;

    const ws =
      LawAIApp.WorkspaceState?.get?.("default") ||
      LawAIApp.WorkspaceEngine?.getState?.() ||
      {};

    el.innerHTML = `
      <div style="padding:10px;background:#1e293b;border-radius:10px">
        <p>🧩 Workspace Active</p>
        <pre>${JSON.stringify(ws, null, 2)}</pre>
      </div>
    `;
  }
};
