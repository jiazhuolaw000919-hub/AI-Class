window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemOrchestrator = {
  initialized: false,
  ready: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🧠 SystemOrchestrator V3.9.3 init");

    const waitForDeps = () => {
      const ok =
        LawAIApp.EventBus &&
        LawAIApp.LearningStateManager;

      if (!ok) {
        console.warn("⚠️ waiting dependencies...");
        return setTimeout(waitForDeps, 200);
      }

      this.bindEvents();
      this.start();
    };

    waitForDeps();
  },

  bindEvents() {
    const updateState = () => {
      try {
        LawAIApp.LearningStateManager.refresh();
      } catch (e) {
        console.warn("⚠️ refresh failed", e);
      }
    };

    const events = [
      "LessonCompleted",
      "QuizCompleted",
      "PracticeCompleted",
      "ProjectFinished",
      "GoalUpdated",
      "MemoryUpdated",
      "StreakMilestone"
    ];

    events.forEach(evt => {
      LawAIApp.EventBus.on(evt, updateState);
    });

    this.updateState = updateState;
  },

  start() {
    setTimeout(() => {
      this.updateState?.();
    }, 300);

    this.ready = true;

    // 🔥 CRITICAL ADDITION (THIS IS THE FIX)
    window.dispatchEvent(
      new CustomEvent("LEARNING_SYSTEM_READY", {
        detail: {
          boot: LawAIApp.bootStatus,
          safeMode: LawAIApp.bootStatus?.safeMode
        }
      })
    );

    console.log("🧠 SystemOrchestrator READY + WIRED");
  },

  triggerLearningLoop(lessonId, result) {
    const loop = LawAIApp.LearningLoopEngine;
    const state = LawAIApp.LearningStateManager?.getState?.();

    if (!loop || !state) return;

    if (result === "completed") {
      loop.recordSuccess(lessonId);

      if (state.riskLevel === "low") {
        LawAIApp.EventBus?.emit(
          "ContentAccelerationSuggested",
          { lessonId }
        );
      }
    } else {
      loop.recordFailure(lessonId);

      LawAIApp.EventBus?.emit("ReviewInserted", { lessonId });
      LawAIApp.EventBus?.emit("DifficultyReduced", { lessonId });
    }

    loop.adapt?.();
  }
};

window.addEventListener("SYSTEM_READY", () => {
  LawAIApp.EngineBinder?.init();
  LawAIApp.LayoutEngineV2?.init();
  LawAIApp.ExperienceComposer?.init();
});
