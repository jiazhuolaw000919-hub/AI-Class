window.LawAIApp = window.LawAIApp || {};

LawAIApp.UIRootEngine = {
  mounted: false,

  mount(boot) {
    if (this.mounted) return;
    this.mounted = true;

    console.log("🧩 UIRootEngine mounting...");

    document.body.innerHTML += `
      <div id="app-shell" style="display:flex;gap:10px;margin-top:20px;">
        <div id="sidebar" style="width:200px;background:#111;padding:10px;">
          <button onclick="LawAIApp.UIRootEngine.show('learning')">Learning</button>
          <button onclick="LawAIApp.UIRootEngine.show('workspace')">Workspace</button>
        </div>

        <div id="main" style="flex:1;background:#0f172a;padding:10px;">
          <h3>System Active Modules</h3>
          <div id="module-view"></div>
        </div>
      </div>
    `;

    this.boot = boot;
  },

  show(module) {
    const view = document.getElementById("module-view");

    if (module === "learning") {
      view.innerHTML = "🧠 Learning Engine Active";
    }

    if (module === "workspace") {
      view.innerHTML = "🗂 Workspace Engine Active";
    }
  }
};
