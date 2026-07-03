// careerAnalytics.js
LawAIApp.CareerAnalytics = {
  // 计算某个职业的技能覆盖率（%）
  getSkillCoverage(career) {
    if (!career.requiredSkills || career.requiredSkills.length === 0) return 100;
    const skills = career.requiredSkills.map(s => 
      LawAIApp.SkillTracker.getSkill(`skill_${s.toLowerCase().replace(/\s/g,'_')}`)
    ).filter(Boolean);
    if (skills.length === 0) return 0;
    const totalMastery = skills.reduce((sum, s) => sum + s.mastery, 0);
    return Math.round(totalMastery / (skills.length * 100) * 100);
  },

  // 项目覆盖率（推荐项目中有多少已完成）
  getProjectCoverage(career) {
    if (!career.recommendedProjects || career.recommendedProjects.length === 0) return 100;
    const completedProjects = LawAIApp.PortfolioEngine.getPortfolio().map(p => p.projectId);
    const covered = career.recommendedProjects.filter(id => completedProjects.includes(id)).length;
    return Math.round((covered / career.recommendedProjects.length) * 100);
  },

  // 职业准备度（综合技能、项目、学习进度）
  getReadiness(careerId) {
    const career = LawAIApp.CareerProfile.getCareer(careerId);
    if (!career) return 0;
    const skillCov = this.getSkillCoverage(career);
    const projCov = this.getProjectCoverage(career);
    return Math.round(skillCov * 0.7 + projCov * 0.3);
  },

  // 职业信心（基于准备度和最近学习表现）
  getConfidence(careerId) {
    const readiness = this.getReadiness(careerId);
    const health = LawAIApp.LearningHealth.getOverallHealth().overall || 50;
    return Math.round(readiness * 0.6 + health * 0.4);
  }
};
