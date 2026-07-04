// ===========================================
// PHASE 66-05: skillTrustLayer.js
// 管理证书的信任级别和导出能力
// ===========================================
LawAIApp.SkillTrustLayer = {
  // 评估证书的信任级别
  assessTrust(credential) {
    let trustLevel = 'Internal';
    if (credential.agentConsensus === 'verified' && credential.confidence >= 80) {
      trustLevel = 'Premium Verified';
    } else if (credential.agentConsensus === 'verified') {
      trustLevel = 'Verified';
    } else if (credential.confidence >= 60) {
      trustLevel = 'Portable';
    }
    return trustLevel;
  },

  // 导出便携凭证（模拟）
  exportCredential(skillId) {
    const credential = LawAIApp.CertificationGenerator.getAllCertificates()
      .find(c => c.skillId === skillId);
    if (!credential) return null;
    const trust = this.assessTrust(credential);
    return {
      ...credential,
      trustLevel: trust,
      exportFormat: 'JSON',
      exportedAt: new Date().toISOString()
    };
  }
};
