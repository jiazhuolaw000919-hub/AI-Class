// personalityProfile.js
LawAIApp.PersonalityProfile = {
  _key: 'personality_profile',
  defaults: {
    motivationLevel: 50,
    confusionLevel: 30,
    confidenceLevel: 50,
    learningSpeed: 50,
    lastUpdated: null
  },
  get() {
    return LawAIApp.StorageEngine.get(this._key, this.defaults);
  },
  save(profile) {
    profile.lastUpdated = new Date().toISOString();
    LawAIApp.StorageEngine.set(this._key, profile);
  },
  update(changes) {
    const profile = this.get();
    Object.assign(profile, changes);
    this.save(profile);
    LawAIApp.EventBus.emit('PersonalityProfileUpdated', profile);
  },
  analyzeLearningEvents() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const health = LawAIApp.IntelligenceHealth?.calculate() || 50;
    const velocity = LawAIApp.GoalAnalytics?.getDailyVelocity() || 0;
    const profile = this.get();

    profile.motivationLevel = Math.min(100, streak * 5 + health * 0.3);
    const quizResult = LawAIApp.StorageEngine.get('last_quiz_result', {});
    profile.confusionLevel = quizResult.score ? 100 - quizResult.score : 30;
    profile.confidenceLevel = Math.min(100, progress.completionPercent * 0.8 + health * 0.2);
    profile.learningSpeed = Math.min(100, velocity * 50);

    this.save(profile);
    return profile;
  }
};
