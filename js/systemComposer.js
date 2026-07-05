window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemComposer = {
  init(boot) {
    console.log("🧠 SystemComposer binding engines → UI");

    if (LawAIApp.UIRootEngine) {
      LawAIApp.UIRootEngine.mount(boot);
    }

    // auto mount learning if exists
    if (boot.loaded.includes("learningIntelligence.js")) {
      setTimeout(() => {
        LawAIApp.UIRootEngine.show("learning");
      }, 300);
    }
  }
};
