// mentorMemory.js
LawAIApp.MentorMemory = {
  _getStore() {
    return LawAIApp.StorageEngine.get('mentor_memory', {
      goals: [],
      weakSubjects: [],
      strongSubjects: [],
      favoriteAcademy: 'academy_ai',
      learningStyle: 'balanced',
      recentContext: {
        lastAcademy: null,
        lastCourse: null,
        lastModule: null,
        lastLesson: null,
        lastInteraction: null
      },
      conversationSummary: ''
    });
  },
  _save(store) { LawAIApp.StorageEngine.set('mentor_memory', store); },

  // 更新最近学习上下文
  updateContext(lessonId) {
    const store = this._getStore();
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (lesson) {
      store.recentContext.lastLesson = lessonId;
      store.recentContext.lastAcademy = 'academy_ai';
    }
    store.recentContext.lastInteraction = new Date().toISOString();
    this._save(store);
  },

  // 记录强弱项（简单版：基于分析数据）
  refreshStrengths() {
    const portfolio = LawAIApp.PortfolioGenerator.getDistribution();
    const sorted = Object.entries(portfolio).sort((a,b) => b[1]-a[1]);
    const strong = sorted.slice(0,2).map(s => s[0]);
    const weak = sorted.slice(-2).map(s => s[0]);
    const store = this._getStore();
    store.strongSubjects = strong;
    store.weakSubjects = weak;
    this._save(store);
  },

  getMemory() {
    const store = this._getStore();
    const health = LawAIApp.HealthScore.calculate();
    const snapshot = LawAIApp.DashboardStatistics.getSnapshot();
    return {
      ...store,
      currentLevel: snapshot.level,
      streak: snapshot.currentStreak,
      health: health.label,
      knowledgeScore: snapshot.knowledgeScore
    };
  },

  // 记录导师对话摘要（简单存储）
  addConversationTurn(role, text) {
    const store = this._getStore();
    store.conversationSummary += `\n${role}: ${text}`;
    if (store.conversationSummary.length > 2000) store.conversationSummary = store.conversationSummary.slice(-1500);
    this._save(store);
  }
};
