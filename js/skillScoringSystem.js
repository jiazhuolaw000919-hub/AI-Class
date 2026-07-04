// ===========================================
// skillScoringSystem.js
// 技能评分系统：综合各维度计算最终 Skill Score (0–100)
// ===========================================
LawAIApp.SkillScoringSystem = {
  // 计算单个技能的综合评分
  calculateSkillScore(skillId) {
    const skill = LawAIApp.SkillTracker?.getSkill(skillId);
    if (!skill) return 0;

    const assessment = LawAIApp.SkillAssessmentEngine?.assessSkill(skillId) || { score: 0 };
    const certificates = LawAIApp.SkillValidationEngine?.getCertificates() || [];
    const cert = certificates.find(c => c.skillId === skillId);

    // 权重：基础评估 40% + 证书分数 30% + 任务表现 30%
    let taskScore = 0;
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const skillTasks = tasks.filter(t => t.skillId === skillId && t.status === 'completed');
    if (skillTasks.length > 0) {
      const avgPerformance = skillTasks.reduce((sum, t) => sum + (t.performanceScore || 0), 0) / skillTasks.length;
      taskScore = avgPerformance * 100;
    }

    const certScore = cert ? cert.masteryScore : 0;
    const baseScore = assessment.score || 0;

    const finalScore = Math.round(baseScore * 0.4 + certScore * 0.3 + taskScore * 0.3);
    return Math.min(100, Math.max(0, finalScore));
  },

  // 计算可靠性分数 (任务完成率与一致性)
  calculateReliabilityScore() {
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (tasks.length === 0) return 0;
    const completionRate = completedTasks.length / tasks.length;
    // 假设任务绩效均分 (0-1) 的平均值
    const avgPerformance = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + (t.performanceScore || 0), 0) / completedTasks.length
      : 0;
    return Math.round((completionRate * 0.6 + avgPerformance * 0.4) * 100);
  },

  // 成长率分数：比较近期技能分数与过去
  calculateGrowthRate(skillId) {
    // 简化：基于近期10个事件的技能分数变化
    const events = LawAIApp.AnalyticsStorage.getEventLog()
      .filter(e => e.eventType === 'SkillUpdated' && e.payload?.skillId === skillId)
      .slice(-10);
    if (events.length < 2) return 50; // 默认中性
    const first = events[0].payload.mastery || 0;
    const last = events[events.length - 1].payload.mastery || 0;
    const growth = last - first;
    // 映射到 0-100，增长20以上为满分
    return Math.min(100, Math.max(0, 50 + growth * 2));
  },

  // 一致性指标：基于连续学习天数与平均偏差
  calculateConsistencyIndex() {
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;
    const habitScore = LawAIApp.HabitScore?.calculate() || 50;
    return Math.min(100, streak * 5 + habitScore * 0.5);
  },

  // 适应性分数：基于面对失败后的恢复速度 (简化)
  calculateAdaptabilityScore() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const failures = log.filter(e => e.eventType === 'QuizFailed' || e.eventType === 'TaskRejected');
    if (failures.length === 0) return 80;
    const recentFailures = failures.slice(-3);
    // 简单判断：最近失败后若继续有成功事件，则适应性高
    const recoveryEvents = log.filter(e => e.eventType === 'LessonCompleted' || e.eventType === 'TaskAssigned');
    const latestFailureTime = new Date(recentFailures[recentFailures.length - 1].timestamp).getTime();
    const hasRecovery = recoveryEvents.some(e => new Date(e.timestamp).getTime() > latestFailureTime);
    return hasRecovery ? 75 : 45;
  }
};
