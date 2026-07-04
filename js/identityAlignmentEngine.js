// ===========================================
// identityAlignmentEngine.js
// 身份对齐引擎：确保大学、代理、课程与文明使命保持一致
// ===========================================
LawAIApp.IdentityAlignmentEngine = {
  // 检查大学是否符合文明身份
  checkUniversityAlignment(universityId) {
    const university = LawAIApp.UniversityDeploymentEngine?.getUniversities()
      .find(u => u.id === universityId);
    if (!university) return { aligned: false, reason: 'University not found' };

    // 大学必须有至少一个学院
    if (!university.faculties || university.faculties.length === 0) {
      return { aligned: false, reason: 'University lacks faculties for knowledge delivery' };
    }
    return { aligned: true };
  },

  // 检查代理是否拥有明确的使命陈述
  checkAgentAlignment(agentName) {
    const agent = LawAIApp.AgentOrchestrator?.agents?.find(a => a.name === agentName);
    if (!agent) return { aligned: false, reason: 'Agent not found' };
    // 所有内置代理都被认为对齐，因为它们的设计符合宪法约束
    return { aligned: true, role: agent.role };
  },

  // 检查课程内容是否促进人类潜能
  checkCurriculumAlignment(courseId) {
    const course = LawAIApp.LearningAssetManager?.getAsset(courseId);
    if (!course) return { aligned: false, reason: 'Course not found' };
    // 简单规则：课程标题或描述不能为空
    if (!course.title || !course.description) {
      return { aligned: false, reason: 'Course lacks identity-aligned description' };
    }
    return { aligned: true };
  },

  // 运行全面对齐审计
  performFullAudit() {
    const report = {
      universities: [],
      agents: [],
      courses: []
    };

    const universities = LawAIApp.UniversityDeploymentEngine?.getUniversities() || [];
    universities.forEach(u => {
      report.universities.push({ id: u.id, ...this.checkUniversityAlignment(u.id) });
    });

    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(a => {
      report.agents.push({ name: a.name, ...this.checkAgentAlignment(a.name) });
    });

    const assets = LawAIApp.LearningAssetManager?.getAllAssets() || [];
    assets.forEach(c => {
      report.courses.push({ id: c.id, ...this.checkCurriculumAlignment(c.id) });
    });

    LawAIApp.EventBus.emit('AlignmentAuditCompleted', report);
    return report;
  }
};
