window.LawAIApp = window.LawAIApp || {};

LawAIApp.UIBridgeSystem = {
  init() {
    console.log("🧠 UI Bridge System online");

    this.bindEngineEvents();
  },

  /**
   * 🔥 1. ENGINE → UI EVENTS
   */
  bindEngineEvents() {
    const bus = LawAIApp.EventBus;

    if (!bus) {
      console.warn("⚠️ EventBus missing - UI Bridge delayed");
      setTimeout(() => this.init(), 300);
      return;
    }

    // LEVEL ENGINE
    bus.on("level:changed", (data) => {
      this.renderXP(data);
    });

    // EXPERIENCE ENGINE
    bus.on("xp:updated", (data) => {
      this.renderXP(data);
    });

    // LEARNING ENGINE
    bus.on("learning:update", (data) => {
      this.renderLearning(data);
    });
  },

  /**
   * 📊 XP UI
   */
  renderXP(data) {
    this.ensurePanel("xp-panel");

    const el = document.getElementById("xp-panel");
    if (!el) return;

    el.innerHTML = `
      <h3>⭐ XP SYSTEM</h3>
      <p>Level: ${data.level || 0}</p>
      <p>XP: ${data.xp || 0}</p>
    `;
  },

  /**
   * 🧠 Learning UI
   */
  renderLearning(data) {
    this.ensurePanel("learning-panel");

    const el = document.getElementById("learning-panel");
    if (!el) return;

    el.innerHTML = `
      <h3>📘 Learning Engine</h3>
      <p>Status: ${data.status || "active"}</p>
      <p>Progress: ${data.progress || 0}%</p>
    `;
  },

  /**
   * 🧱 AUTO UI PANEL CREATION
   */
  ensurePanel(id) {
    if (document.getElementById(id)) return;

    const div = document.createElement("div");

    div.id = id;
    div.style = `
      margin-top:20px;
      padding:12px;
      background:#1e293b;
      border-radius:10px;
    `;

    document.body.appendChild(div);
  }
};
