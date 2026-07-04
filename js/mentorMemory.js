// mentorMemory.js
// ✅ 保留原有全部功能：上下文更新、强弱项刷新、getMemory、对话摘要
// ✅ Season 4 升级：新增多导师记忆、困难追踪、学习速度记录

LawAIApp.MentorMemory = {
  // ========== 原有代码（完全保留） ==========
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
  },

  // ========== Season 4 新增：多导师记忆系统 ==========
  _multiMentorKeyPrefix: 'mentor_memory_v2_',

  // 获取某个用户-导师组合的记忆
  getMentorMemory(userId, mentorId) {
    const key = this._multiMentorKeyPrefix + userId + '_' + mentorId;
    return LawAIApp.StorageEngine.get(key, {
      preferredExplanationDepth: 'normal',
      pastStruggles: [],
      favoriteProjectTypes: [],
      learningSpeed: 'average',
      weakSkills: [],
      interactionCount: 0,
      lastInteraction: null
    });
  },

  // 更新多导师记忆
  updateMentorMemory(userId, mentorId, updates) {
    const key = this._multiMentorKeyPrefix + userId + '_' + mentorId;
    const mem = this.getMentorMemory(userId, mentorId);
    Object.assign(mem, updates, {
      lastInteraction: new Date().toISOString(),
      interactionCount: mem.interactionCount + 1
    });
    LawAIApp.StorageEngine.set(key, mem);
  },

  // 记录一次困难（多导师版）
  recordStruggle(userId, mentorId, topic) {
    const mem = this.getMentorMemory(userId, mentorId);
    if (!mem.pastStruggles.includes(topic)) {
      mem.pastStruggles.push(topic);
    }
    this.updateMentorMemory(userId, mentorId, { pastStruggles: mem.pastStruggles });
  },

  // 记录学习速度（多导师版）
  setLearningSpeed(userId, mentorId, speed) {
    this.updateMentorMemory(userId, mentorId, { learningSpeed: speed });
  }
};
