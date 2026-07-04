// ===========================================
// collectiveMemorySystem.js
// 集体记忆系统：维护文明级别的完整学习轨迹
// ===========================================
LawAIApp.CollectiveMemorySystem = {
  _memoryStore: {
    events: [],
    skillEvolution: {},
    universityHistory: [],
    globalSnapshot: null
  },

  // 初始化记忆，从现有存储中提取
  init() {
    // 导入事件历史
    this._memoryStore.events = LawAIApp.AnalyticsStorage?.getEventLog().slice(-200) || [];

    // 导入技能进化史（从技能追踪器）
    const skills = LawAIApp.SkillTracker?.getAllSkills() || [];
    skills.forEach(s => {
      this._memoryStore.skillEvolution[s.skillId] = {
        name: s.title,
        masteryTimeline: [s.mastery],
        lastUpdated: s.lastUpdated || new Date().toISOString()
      };
    });

    // 导入大学历史
    this._memoryStore.universityHistory = LawAIApp.UniversityDeploymentEngine?.getUniversities() || [];

    // 首次快照
    this.takeSnapshot();

    console.log('Collective memory system initialized.');
  },

  // 记录新事件
  recordEvent(event) {
    this._memoryStore.events.push({
      ...event,
      recordedAt: new Date().toISOString()
    });
    if (this._memoryStore.events.length > 1000) {
      this._memoryStore.events.splice(0, this._memoryStore.events.length - 1000);
    }
  },

  // 更新技能进化
  recordSkillEvolution(skillId, mastery) {
    if (!this._memoryStore.skillEvolution[skillId]) {
      this._memoryStore.skillEvolution[skillId] = {
        name: LawAIApp.SkillTracker?.getSkill(skillId)?.title || skillId,
        masteryTimeline: []
      };
    }
    this._memoryStore.skillEvolution[skillId].masteryTimeline.push(mastery);
    if (this._memoryStore.skillEvolution[skillId].masteryTimeline.length > 50) {
      this._memoryStore.skillEvolution[skillId].masteryTimeline.splice(0, 
        this._memoryStore.skillEvolution[skillId].masteryTimeline.length - 50);
    }
    this._memoryStore.skillEvolution[skillId].lastUpdated = new Date().toISOString();
  },

  // 创建全球快照
  takeSnapshot() {
    this._memoryStore.globalSnapshot = {
      identity: LawAIApp.CivilizationIdentityCore.selfState,
      health: LawAIApp.SystemHealthMonitor.getMetrics(),
      economy: LawAIApp.KnowledgeEconomyEngine?.getSummary() || {},
      timestamp: new Date().toISOString()
    };
  },

  // 获取记忆摘要
  getMemorySummary() {
    return {
      totalEvents: this._memoryStore.events.length,
      skillsTracked: Object.keys(this._memoryStore.skillEvolution).length,
      universities: this._memoryStore.universityHistory.length,
      latestSnapshot: this._memoryStore.globalSnapshot?.timestamp
    };
  }
};

// 自动初始化
setTimeout(() => LawAIApp.CollectiveMemorySystem.init(), 500);
