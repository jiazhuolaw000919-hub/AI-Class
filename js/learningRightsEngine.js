// ===========================================
// learningRightsEngine.js
// 保障并监控学习者的宪法权利
// ===========================================
LawAIApp.LearningRightsEngine = {
  _violations: [],

  // 检查当前学习者状态是否享有所有权利
  auditRights() {
    const rights = LawAIApp.CivilizationConstitution.articles.learningRights;
    const issues = [];

    // 检查个性化路径是否被意外禁用（示例）
    if (!rights.personalizedPaths) {
      issues.push('Personalized learning paths are disabled');
    }

    // 检查评估透明度：是否有未记录的成绩
    const recentEvals = LawAIApp.StorageEngine.get('ethics_log', []);
    if (recentEvals.length === 0 && LawAIApp.ProgressEngine.getProgress().completedLessons.length > 5) {
      issues.push('No recent evaluation logs found, possible transparency issue');
    }

    if (issues.length > 0) {
      this._violations.push({ timestamp: new Date().toISOString(), issues });
      LawAIApp.EventBus.emit('LearnerRightsViolation', { issues });
    }
    return issues.length === 0;
  },

  // 确保跨领域学习移动性（例如允许从一个大学转到另一大学）
  enableCrossDomainTransfer(studentId, fromUni, toUni) {
    const creditSystem = LawAIApp.CrossUniversityCreditSystem;
    if (!creditSystem) return false;
    // 转移所有已获得的学分
    const transcript = creditSystem._transcripts[studentId];
    if (transcript) {
      transcript.earnedCredits.forEach(credit => {
        creditSystem.transferCredit(studentId, credit.skillId, fromUni, credit.score);
      });
    }
    LawAIApp.EventBus.emit('CrossDomainTransfer', { studentId, fromUni, toUni });
    return true;
  },

  getViolationHistory() { return [...this._violations]; }
};
