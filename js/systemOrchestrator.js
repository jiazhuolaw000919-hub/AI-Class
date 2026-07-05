window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemOrchestrator = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🧠 SystemOrchestrator (Learning Layer) init");

    // 🧠 SAFETY CHECKS
    if (!LawAIApp.EventBus) {
      console.warn("⚠️ EventBus not ready - retrying");
      setTimeout(() => this.init(), 300);
      return;
    }

    if (!LawAIApp.LearningStateManager) {
      console.warn("⚠️ LearningStateManager missing - delayed init");
      setTimeout(() => this.init(), 300);
      return;
    }

    // =========================
    // EVENT BINDING (YOUR ORIGINAL LOGIC)
    // =========================
    const updateState = () => {
      try {
        LawAIApp.LearningStateManager.refresh();
      } catch (e) {
        console.warn("⚠️ state refresh failed", e);
      }
    };

    const events = [
      'LessonCompleted',
      'QuizCompleted',
      'PracticeCompleted',
      'ProjectFinished',
      'GoalUpdated',
      'MemoryUpdated',
      'StreakMilestone'
    ];

    events.forEach(evt => {
      LawAIApp.EventBus.on(evt, updateState);
    });

    // initial refresh
    setTimeout(updateState, 500);

    console.log("🧠 Learning Orchestrator ready");
  },

  // =========================
  // LEARNING LOOP (SAFE)
  // =========================
  triggerLearningLoop(lessonId, result) {
    const loop = LawAIApp.LearningLoopEngine;
    const state = LawAIApp.LearningStateManager?.getState?.();

    if (!loop || !state) {
      console.warn("⚠️ LearningLoopEngine not ready");
      return;
    }

    if (result === 'completed') {
      loop.recordSuccess(lessonId);

      if (state.riskLevel === 'low') {
        LawAIApp.EventBus?.emit?.(
          'ContentAccelerationSuggested',
          { lessonId }
        );
      }

    } else {
      loop.recordFailure(lessonId);

      LawAIApp.EventBus?.emit?.('ReviewInserted', { lessonId });
      LawAIApp.EventBus?.emit?.('DifficultyReduced', { lessonId });
    }

    loop.adapt?.();
  }
};

// =========================
// AUTO INIT (SAFE HOOKED)
// =========================
window.addEventListener("SYSTEM_READY", () => {
  setTimeout(() => {
    LawAIApp.SystemOrchestrator.init();
  }, 100);
});
