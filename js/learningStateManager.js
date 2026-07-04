// learningStateManager.js
LawAIApp.LearningStateManager = {
  _key: 'globalLearningState',
  _defaultState() {
    return {
      currentGoal: null,
      currentCourse: null,
      currentModule: null,
      currentLesson: null,
      weakTopics: [],
      strongTopics: [],
      memoryHealth: 100,
      learningMomentum: 0,
      riskLevel: 'low',
      lastUpdated: null
    };
  },
  getState() {
    return LawAIApp.StorageEngine.get(this._key, this._defaultState());
  },
  saveState(state) {
    state.lastUpdated = new Date().toISOString();
    LawAIApp.StorageEngine.set(this._key, state);
    LawAIApp.EventBus.emit('GlobalStateUpdated', state);
  },
  // 从现有引擎刷新全局状态
  refresh() {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const goals = LawAIApp.GoalEngine?.getActiveGoals() || [];
    const currentGoal = goals.length > 0 ? goals[0].title : null;
    const memHealth = LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 100;
    const momentum = LawAIApp.HabitScore?.calculate() || 50;
    const risk = LawAIApp.GoalAnalytics?.assessRisk(goals[0]) || 'low';
    const profile = LawAIApp.PersonalityProfile.get();
    const weakTopics = profile.knowledgeGaps || [];
    const strongTopics = profile.strongSkills || [];

    const state = {
      currentGoal,
      currentCourse: null, // 可从当前模块推断
      currentModule: progress.currentStage,
      currentLesson: progress.currentLesson,
      weakTopics,
      strongTopics,
      memoryHealth: memHealth,
      learningMomentum: momentum,
      riskLevel: risk,
      lastUpdated: new Date().toISOString()
    };
    this.saveState(state);
    return state;
  }
};
