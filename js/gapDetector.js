// gapDetector.js
LawAIApp.GapDetector = {
  // 检测缺失的前置知识（基于知识图谱的前置关系）
  getMissingPrerequisites(lessonId) {
    return LawAIApp.KnowledgeGraph?.getMissingPrerequisites(lessonId) || [];
  },

  // 检测薄弱技能（掌握度 < 40）
  getWeakSkills() {
    const skills = LawAIApp.SkillTracker.getAllSkills();
    return skills.filter(s => s.mastery < 40);
  },

  // 检测低保留率知识点（记忆强度 < 40）
  getLowRetentionLessons() {
    const allMemory = LawAIApp.MemoryTracker.getAll();
    return Object.keys(allMemory).filter(id => allMemory[id].strength < 40);
  },

  // 生成完整的知识缺口报告
  getReport(lessonId = null) {
    const report = {
      missingPrerequisites: lessonId ? this.getMissingPrerequisites(lessonId) : [],
      weakSkills: this.getWeakSkills().map(s => s.title),
      lowRetention: this.getLowRetentionLessons()
    };
    LawAIApp.EventBus.emit('GapDetected', report);
    return report;
  }
};
