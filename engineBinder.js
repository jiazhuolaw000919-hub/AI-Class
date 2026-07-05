window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineBinder = {
  init() {
    console.log("🔗 EngineBinder init");

    const bus = LawAIApp.EventBus;
    if (!bus) {
      console.warn("⚠️ EventBus missing");
      return;
    }

    // =========================
    // CORE BINDINGS
    // =========================

    bus.on("LessonCompleted", (data) => {
      this.forward("experience:update", data);
    });

    bus.on("QuizCompleted", (data) => {
      this.forward("learning:update", data);
    });

    bus.on("WorkspaceOpened", (data) => {
      this.forward("ui:workspace:open", data);
    });

    bus.on("WorkspaceClosed", (data) => {
      this.forward("ui:workspace:close", data);
    });

    console.log("🔗 EngineBinder ready");
  },

  forward(event, payload) {
    LawAIApp.EventBus?.emit?.(event, payload);
  }
};
