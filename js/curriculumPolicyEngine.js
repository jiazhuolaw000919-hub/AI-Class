// ===========================================
// curriculumPolicyEngine.js
// 课程政策引擎：控制课程生成规则，确保符合治理要求
// ===========================================
LawAIApp.CurriculumPolicyEngine = {
  // 新课程生成前的合规检查
  preGenerationCheck(domainDef) {
    const issues = [];
    if (!domainDef.skills || domainDef.skills.length === 0) {
      issues.push('Domain must have at least one skill');
    }
    // 检查是否满足最小课程数
    const minLessons = LawAIApp.GlobalStandardEngine.standards.curriculum.minLessonsPerCourse;
    // 这里无法直接得知生成后数量，所以只做基础检查
    if (issues.length > 0) {
      LawAIApp.EventBus.emit('PolicyViolation', { domain: domainDef.name, issues });
    }
    return issues.length === 0;
  },

  // 对已生成的课程资产进行政策审查
  auditExistingCurriculum() {
    const assets = LawAIApp.LearningAssetManager?.getAllAssets() || [];
    const violations = [];
    assets.forEach(asset => {
      const check = LawAIApp.GlobalStandardEngine.validateCourse(asset.id);
      if (!check.valid) {
        violations.push({ assetId: asset.id, reason: check.reason });
      }
    });
    if (violations.length > 0) {
      LawAIApp.EventBus.emit('PolicyViolationsDetected', { violations });
    }
    return violations;
  }
};
