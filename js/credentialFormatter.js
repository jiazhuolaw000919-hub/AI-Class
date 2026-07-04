// ===========================================
// PHASE 66-03: credentialFormatter.js
// 生成标准化的技能凭证对象
// ===========================================
LawAIApp.CredentialFormatter = {
  format(skillId, assessment, validation) {
    const skill = LawAIApp.SkillTracker?.getSkill(skillId) || {};
    return {
      skillId,
      skillName: skill.title || skillId,
      masteryScore: assessment.score,
      confidence: assessment.confidence,
      agentValidationScore: validation.averageScore,
      agentConsensus: validation.consensusPassed ? 'verified' : 'pending',
      evidence: {
        quiz: LawAIApp.StorageEngine.get('last_quiz_result', {}).score || 0,
        practice: skill.practiceCount || 0,
        projects: skill.projectCount || 0,
        memoryHealth: LawAIApp.MemoryScheduler?.calculateMemoryHealth() || 50
      },
      certificationLevel: this.determineLevel(assessment.score),
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 86400000).toISOString()
    };
  },

  determineLevel(score) {
    if (score >= 95) return 'Expert-Level Mastery';
    if (score >= 80) return 'Advanced Mastery';
    if (score >= 65) return 'Applied Skill';
    if (score >= 50) return 'Functional Proficiency';
    return 'Basic Understanding';
  }
};
