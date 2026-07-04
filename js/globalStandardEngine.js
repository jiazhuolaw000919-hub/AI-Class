// ===========================================
// globalStandardEngine.js
// 全球标准化引擎：定义技能、掌握度、认证的统一标准
// ===========================================
LawAIApp.GlobalStandardEngine = {
  // 标准定义
  standards: {
    skill: {
      minStrengthForCertification: 70,   // 技能强度 ≥70 才可认证
      masteryLevels: [
        { min: 0, label: 'Basic Understanding' },
        { min: 50, label: 'Functional Proficiency' },
        { min: 70, label: 'Applied Skill' },
        { min: 85, label: 'Advanced Mastery' },
        { min: 95, label: 'Expert-Level Mastery' }
      ]
    },
    curriculum: {
      minLessonsPerCourse: 3,
      maxDifficulty: 3,
      requiredPracticeTasks: 1
    },
    agent: {
      maxVoteWeight: 3,
      evaluationTransparency: true
    },
    university: {
      minFaculties: 1,
      accreditationRequired: true
    }
  },

  // 检查技能是否符合认证标准
  validateSkillForCertification(skillId) {
    const skill = LawAIApp.SkillTracker?.getSkill(skillId);
    if (!skill) return { valid: false, reason: 'Skill not found' };
    if (skill.mastery < this.standards.skill.minStrengthForCertification) {
      return { valid: false, reason: `Mastery ${skill.mastery} below threshold ${this.standards.skill.minStrengthForCertification}` };
    }
    return { valid: true };
  },

  // 检查课程是否符合标准
  validateCourse(courseId) {
    const asset = LawAIApp.LearningAssetManager?.getAsset(courseId);
    if (!asset) return { valid: false, reason: 'Course not found' };
    if ((asset.lessons?.length || 0) < this.standards.curriculum.minLessonsPerCourse) {
      return { valid: false, reason: 'Insufficient lessons' };
    }
    return { valid: true };
  },

  // 获取掌握度级别标签
  getMasteryLevel(score) {
    const levels = this.standards.skill.masteryLevels;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (score >= levels[i].min) return levels[i].label;
    }
    return levels[0].label;
  }
};
