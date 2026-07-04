// ===========================================
// PHASE 66-01: skillAssessmentEngine.js
// 综合评估技能水平，输出 0–100 分
// ===========================================
LawAIApp.SkillAssessmentEngine = {
  // 评估特定技能，结合测验、项目、记忆、实践等数据
  assessSkill(skillId) {
    const skill = LawAIApp.SkillTracker?.getSkill(skillId);
    if (!skill) return { score: 0, confidence: 0 };

    // 从各维度收集证据
    const quizResult = LawAIApp.StorageEngine.get('last_quiz_result', {});
    const quizScore = quizResult.score || 0;           // 0-100
    const practiceCompleted = skill.practiceCount || 0;
    const projectCount = skill.projectCount || 0;
    const memoryStrength = LawAIApp.MemoryScheduler
      ? LawAIApp.MemoryScheduler.calculateMemoryHealth()
      : 50;

    // 权重分配：测验 30%，实践 25%，项目 25%，记忆 20%
    const score = Math.round(
      quizScore * 0.3 +
      Math.min(100, practiceCompleted * 10) * 0.25 +
      Math.min(100, projectCount * 20) * 0.25 +
      memoryStrength * 0.2
    );

    // 置信度由数据充分性决定
    const confidence = Math.min(100,
      (quizScore > 0 ? 30 : 0) +
      (practiceCompleted > 0 ? 25 : 0) +
      (projectCount > 0 ? 25 : 0) +
      20
    );

    return { score, confidence, skillId, title: skill.title };
  },

  // 获取所有已注册技能的评估报告
  getSkillReport() {
    const skills = LawAIApp.SkillTracker?.getAllSkills() || [];
    return skills.map(s => this.assessSkill(s.skillId));
  }
};
