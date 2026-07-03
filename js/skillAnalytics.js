// skillAnalytics.js
LawAIApp.SkillAnalytics = {
  // 技能成长时间线（基于事件日志模拟）
  getGrowthTimeline(skillId) {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const events = log.filter(e => 
      (e.eventType === 'SkillUpdated' || e.eventType === 'SkillUnlocked') &&
      e.payload?.skillId === skillId
    );
    return events.map(e => ({
      date: e.timestamp,
      mastery: e.payload?.mastery || 0,
      event: e.eventType
    }));
  },

  // 生成技能雷达数据（各技能掌握度）
  getRadarData() {
    const skills = LawAIApp.SkillTracker.getAllSkills();
    return skills.map(s => ({
      skillId: s.skillId,
      title: s.title,
      mastery: s.mastery,
      confidence: s.confidence,
      level: LawAIApp.MasteryEngine.getLevelName(s.mastery)
    }));
  },

  // 推荐需要关注的技能（低掌握且高价值）
  getRecommendedSkills() {
    const skills = LawAIApp.SkillTracker.getAllSkills();
    return skills.filter(s => s.mastery < 50 && s.relatedLessons.length > 0)
      .sort((a, b) => a.mastery - b.mastery);
  }
};
