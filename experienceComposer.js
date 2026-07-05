window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceComposer = {
  init() {
    console.log("🎬 ExperienceComposer init");

    const bus = LawAIApp.EventBus;

    if (!bus) return;

    bus.on("experience:update", (data) => {
      this.renderExperience(data);
    });
  },

  renderExperience(data) {
    const root = document.getElementById("app");

    if (!root) return;

    root.innerHTML = `
      <div style="padding:20px;color:white">
        <h2>🧠 Learning Experience</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }
};
