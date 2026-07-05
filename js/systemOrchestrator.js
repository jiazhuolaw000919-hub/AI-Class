window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemOrchestrator = {
  initialized: false,
  booted: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;

    console.log("🧠 SystemOrchestrator (V3.9.3) init");

    // =========================
    // SAFETY CHECK LOOP
    // =========================
    const check = () => {
      if (!LawAIApp.EventBus || !LawAIApp.LearningStateManager) {
        console.warn("⚠️ System dependencies missing, retry...");
        setTimeout(check, 200);
        return false;
      }
      return true;
    };

    if (!check()) return;

    // =========================
    // STATE UPDATE CORE (UNCHANGED LOGIC)
    // =========================
    const updateState = () => {
      try {
        LawAIApp.LearningStateManager.refresh();
      } catch (e) {
        console.warn("⚠️ state refresh failed", e);
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

    // initial sync
    setTimeout(updateState, 300);

    // =========================
    // MARK SYSTEM READY
    // =========================
    this.booted = true;

    window.dispatchEvent(
      new CustomEvent("SYSTEM_READY", {
        detail: LawAIApp.bootStatus || {}
      })
    );

    console.log("🧠 SystemOrchestrator READY");
  },

  // =========================
  // LEARNING LOOP (UNCHANGED, SAFER)
  // =========================
  triggerLearningLoop(lessonId, result) {
    const loop = LawAIApp.LearningLoopEngine;
    const state = LawAIApp.LearningStateManager?.getState?.();

    if (!loop || !state) {
      console.warn("⚠️ LearningLoopEngine not ready");
      return;
    }

    if (result === "completed") {
      loop.recordSuccess(lessonId);

      if (state.riskLevel === "low") {
        LawAIApp.EventBus?.emit?.(
          "ContentAccelerationSuggested",
          { lessonId }
        );
      }
    } else {
      loop.recordFailure(lessonId);

      LawAIApp.EventBus?.emit?.("ReviewInserted", { lessonId });
      LawAIApp.EventBus?.emit?.("DifficultyReduced", { lessonId });
    }

    loop.adapt?.();
  }
};

// =========================
// AUTO INIT (ROBUST V3 FIX)
// =========================
const bootCheck = () => {
  if (LawAIApp.bootStatus) {
    LawAIApp.SystemOrchestrator.init();
  } else {
    setTimeout(bootCheck, 150);
  }
};

bootCheck();
