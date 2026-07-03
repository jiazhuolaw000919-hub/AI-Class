// intelligenceProfile.js
LawAIApp.IntelligenceProfile = {
  _key: 'intelProfile',
  get() {
    return LawAIApp.StorageEngine.get(this._key, {
      currentSkillLevel: 1,
      memoryHealth: 100,
      learningMomentum: 0,
      learningStyle: 'balanced',
      knowledgeCoverage: 0,
      topicConfidence: {},
      learningGoals: []
    });
  },
  save(profile) { LawAIApp.StorageEngine.set(this._key, profile); },
  update(changes) {
    const profile = this.get();
    Object.assign(profile, changes);
    this.save(profile);
    LawAIApp.EventBus.emit('ProfileUpdated', profile);
  },
  // 自动从信号更新
  refreshFromSignals() {
    const signals = LawAIApp.IntelligenceSignals.getSignals();
    const profile = this.get();
    profile.currentSkillLevel = LawAIApp.LevelEngine.calculateLevel().level;
    profile.memoryHealth = signals.reviewCompletion;
    profile.learningMomentum = signals.consistency;
    profile.knowledgeCoverage = LawAIApp.ProgressEngine.getProgress().completionPercent;
    this.save(profile);
  }
};
