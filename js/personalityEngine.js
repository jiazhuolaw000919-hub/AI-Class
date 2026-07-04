// personalityEngine.js
LawAIApp.PersonalityEngine = {
  currentMode: 'mentor',
  init() {
    LawAIApp.EventBus.on('LessonCompleted', () => {
      LawAIApp.PersonalityProfile.analyzeLearningEvents();
    });
    LawAIApp.EventBus.on('QuizCompleted', () => {
      LawAIApp.PersonalityProfile.analyzeLearningEvents();
    });
    LawAIApp.EventBus.on('PracticeCompleted', () => {
      LawAIApp.PersonalityProfile.analyzeLearningEvents();
    });

    this.currentMode = LawAIApp.PersonalitySwitch.selectMode();
    LawAIApp.EventBus.emit('PersonalitySwitched', { mode: this.currentMode });
  },
  getActiveMode() {
    this.currentMode = LawAIApp.PersonalitySwitch.selectMode();
    return this.currentMode;
  },
  respond(originalText, context = {}) {
    const mode = this.getActiveMode();
    return LawAIApp.ResponseStyleEngine.generateResponse(originalText, mode, context);
  },
  setMode(mode) {
    this.currentMode = LawAIApp.PersonalitySwitch.switchTo(mode);
    LawAIApp.EventBus.emit('PersonalitySwitched', { mode: this.currentMode });
    return this.currentMode;
  }
};

setTimeout(() => LawAIApp.PersonalityEngine.init(), 1200);
