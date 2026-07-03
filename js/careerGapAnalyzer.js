// careerGapAnalyzer.js
LawAIApp.CareerGapAnalyzer = {
  // 分析技能差距
  getSkillGaps(career) {
    if (!career.requiredSkills) return [];
    return career.requiredSkills
      .map(skillName => {
        const skillId = `skill_${skillName.toLowerCase().replace(/\s/g,'_')}`;
        const skill = LawAIApp.SkillTracker.getSkill(skillId);
        return {
          name: skillName,
          current: skill ? skill.mastery : 0,
          required: 80,
          gap: 80 - (skill ? skill.mastery : 0)
        };
      })
      .filter(s => s.gap > 0)
      .sort((a,b) => b.gap - a.gap);
  },

  // 缺少的推荐项目
  getMissingProjects(career) {
    if (!career.recommendedProjects) return [];
    const completedIds = LawAIApp.PortfolioEngine.getPortfolio().map(p => p.projectId);
    return career.recommendedProjects.filter(id => !completedIds.includes(id));
  },

  // 薄弱技能（低于40）
  getWeakSkills(career) {
    return this.getSkillGaps(career).filter(s => s.current < 40);
  },

  // 生成综合差距报告
  generateReport(careerId) {
    const career = LawAIApp.CareerProfile.getCareer(careerId);
    if (!career) return null;
    const report = {
      skillGaps: this.getSkillGaps(career),
      missingProjects: this.getMissingProjects(career),
      weakSkills: this.getWeakSkills(career)
    };
    LawAIApp.EventBus.emit('CareerGapDetected', { careerId, report });
    return report;
  }
};
