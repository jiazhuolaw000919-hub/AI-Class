// ===========================================
// performanceEvaluationEngine.js
// 主引擎：绩效评估与晋升系统入口
// ===========================================
LawAIApp.PerformanceEvaluationEngine = {
  init() {
    // 在关键节点触发评估
    LawAIApp.EventBus.on('LessonCompleted', () => {
      // 每完成10节课评估一次
      const progress = LawAIApp.ProgressEngine.getProgress();
      if (progress.completedLessons.length % 10 === 0) {
        LawAIApp.PromotionEngine.evaluatePromotion();
      }
    });

    LawAIApp.EventBus.on('ProjectFinished', () => {
      LawAIApp.PromotionEngine.evaluatePromotion();
    });

    console.log('Performance Evaluation & Promotion Engine activated.');
  },

  // 对外接口：手动获取当前所有评估数据
  getPerformanceReport() {
    const skills = LawAIApp.SkillTracker?.getAllSkills() || [];
    const skillReports = skills.map(s => ({
      skill: s.title,
      score: LawAIApp.SkillScoringSystem.calculateSkillScore(s.skillId)
    }));
    const reliability = LawAIApp.SkillScoringSystem.calculateReliabilityScore();
    const consistency = LawAIApp.SkillScoringSystem.calculateConsistencyIndex();
    const careerStatus = LawAIApp.CareerProgressionEngine.getCareerStatus();

    return {
      skillScores: skillReports,
      reliability,
      consistency,
      career: careerStatus
    };
  },

  // 触发即时晋升评估
  async triggerPromotionCheck() {
    return LawAIApp.PromotionEngine.evaluatePromotion();
  }
};

// 自动初始化
setTimeout(() => LawAIApp.PerformanceEvaluationEngine.init(), 700);
