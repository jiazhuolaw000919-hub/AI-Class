window.LawAIApp = window.LawAIApp || {};

LawAIApp.LayoutEngineV2 = {
  state: "init",

  init() {
    console.log("🧱 LayoutEngineV2 init");

    this.state = "ready";

    LawAIApp.EventBus?.on("ui:workspace:open", () => {
      this.renderWorkspace();
    });

    LawAIApp.EventBus?.on("ui:workspace:close", () => {
      this.clear();
    });
  },

  renderWorkspace() {
    const root = document.getElementById("app");

    if (!root) {
      console.warn("⚠️ No #app root found");
      return;
    }

    root.innerHTML = `
      <div style="padding:20px;color:white">
        <h2>📚 Learning Workspace</h2>
        <p>System Active</p>
      </div>
    `;
  },

  clear() {
    const root = document.getElementById("app");
    if (root) root.innerHTML = "";
  }
};
