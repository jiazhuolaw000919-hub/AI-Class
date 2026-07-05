window.LawAIApp = window.LawAIApp || {};

LawAIApp.UIComposer = {
  build(boot) {
    const loaded = boot?.loaded || [];

    const hasLearning = [
      "levelEngine.js",
      "experienceEngine.js",
      "learningIntelligence.js"
    ].every(e => loaded.includes(e));

    const hasWorkspace = loaded.includes("workspaceEngine.js");

    return {
      header: "🚀 Law AI System (V3.9.11)",
      modules: {
        learning: hasLearning,
        workspace: hasWorkspace,
        optional: loaded.filter(f =>
          f.includes("motion") ||
          f.includes("theme") ||
          f.includes("ambient")
        )
      }
    };
  }
};
