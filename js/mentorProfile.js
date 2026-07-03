// mentorProfile.js
LawAIApp.MentorProfile = {
  _key: 'mentorProfileV2',
  get() {
    return LawAIApp.StorageEngine.get(this._key, {
      learningStyle: 'balanced',
      preferredTime: 'morning',
      currentMotivation: 'neutral',
      knowledgeGaps: [],
      strongSkills: [],
      weakSkills: [],
      learningMomentum: 0,
      consistency: 0
    });
  },
  save(profile) { LawAIApp.StorageEngine.set(this._key, profile); },
  updateFromSignals() {
    const analysis = LawAIApp.MentorAnalytics.getComprehensiveAnalysis();
    const profile = this.get();
    profile.knowledgeGaps = analysis.weakTopics;
    profile.strongSkills = analysis.strongTopics;
    profile.weakSkills = analysis.weakTopics;
    profile.learningMomentum = analysis.habitScore;
    profile.consistency = analysis.intelligenceHealth;
    profile.currentMotivation = analysis.habitScore > 70 ? 'high' : (analysis.habitScore > 40 ? 'moderate' : 'low');
    this.save(profile);
    LawAIApp.EventBus.emit('MentorProfileUpdated', profile);
  }
};
