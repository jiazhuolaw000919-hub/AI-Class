// personalitySwitch.js
LawAIApp.PersonalitySwitch = {
  modes: {
    coach: { name: 'Coach', description: 'High energy, action-driven' },
    mentor: { name: 'Mentor', description: 'Calm, step-by-step' },
    analyst: { name: 'Analyst', description: 'Data-driven feedback' },
    strategist: { name: 'Strategist', description: 'Long-term roadmap' }
  },
  selectMode() {
    const profile = LawAIApp.PersonalityProfile.analyzeLearningEvents();
    const { motivationLevel, confusionLevel, confidenceLevel, learningSpeed } = profile;

    if (motivationLevel < 40) return 'coach';
    if (confusionLevel > 60) return 'mentor';
    if (confidenceLevel < 40) return 'analyst';
    if (learningSpeed > 70 && confidenceLevel > 60) return 'strategist';
    const memory = LawAIApp.PersonalityMemory.get();
    return memory.preferredStyle || 'mentor';
  },
  switchTo(mode) {
    if (this.modes[mode]) {
      LawAIApp.PersonalityMemory.recordEngagement(mode, true);
      LawAIApp.EventBus.emit('PersonalitySwitched', { mode });
      return mode;
    }
    return this.selectMode();
  }
};
