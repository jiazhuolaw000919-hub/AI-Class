// ===========================================
// learningJourneyEngine.js
// 学习旅程引擎：为每个任务生成“为什么重要”卡片和目标
// ===========================================
LawAIApp.LearningJourneyEngine = {
  // 为特定任务生成完整背景信息
  async prepareMissionContext(userId, courseId, missionId) {
    const mission = LawAIApp.MissionFlowEngine.generateMissions(courseId).find(m => m.id === missionId);
    if (!mission) return null;

    // 获取职业关联
    const careers = LawAIApp.CareerMappingEngine.getCareersForLesson(mission.title);
    const skillValue = LawAIApp.CareerMappingEngine.getSkillValue(mission.title);

    // 生成学习目标
    const learningGoal = {
      today: `Understand the core concepts of ${mission.title}`,
      outcome: `Be able to apply ${mission.title} in real-world scenarios`,
      commonMistakes: ['Skipping fundamentals', 'Not practicing enough'],
      whereUsed: `Used by ${careers.join(', ')} in daily work`
    };

    // 记录旅程事件
    LawAIApp.JourneyTracker.logEvent(userId, 'mission_context_viewed', mission.title);

    return {
      mission,
      whyThisMatters: {
        objective: mission.goal,
        scenario: `Imagine you are a ${careers[0] || 'professional'} needing to solve a problem using ${mission.title}.`,
        skillsUnlocked: mission.skillsUnlocked,
        careerRelevance: careers,
        estimatedOutcome: `By completing this, you will be one step closer to becoming a ${careers[0] || 'skilled professional'}.`
      },
      learningGoal,
      skillValue,
      careers
    };
  },

  // 获取用户的整个旅程时间线
  async getJourneyTimeline(userId) {
    const timeline = LawAIApp.GoalTimeline.generateTimeline(userId);
    const summary = LawAIApp.JourneyTracker.getSummary(userId);
    return { timeline, summary };
  }
};
