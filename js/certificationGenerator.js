// ===========================================
// PHASE 66-04: certificationGenerator.js
// 生成完整的技能证书
// ===========================================
LawAIApp.CertificationGenerator = {
  async certifySkill(skillId) {
    const assessment = LawAIApp.SkillAssessmentEngine.assessSkill(skillId);
    const validation = await LawAIApp.AgentValidationNetwork.validateSkill(skillId);
    const credential = LawAIApp.CredentialFormatter.format(skillId, assessment, validation);

    // 存储证书
    const certs = LawAIApp.StorageEngine.get('skill_certificates', {});
    certs[skillId] = credential;
    LawAIApp.StorageEngine.set('skill_certificates', certs);

    // 更新学习图谱节点为已验证
    LawAIApp.GraphNodeManager.addNode(skillId, 'validated_skill', {
      strength: credential.masteryScore,
      certified: true,
      level: credential.certificationLevel
    });

    LawAIApp.EventBus.emit('SkillCertified', credential);
    return credential;
  },

  getAllCertificates() {
    return Object.values(LawAIApp.StorageEngine.get('skill_certificates', {}));
  }
};
