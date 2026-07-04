// ===========================================
// certificationStandardsEngine.js
// 认证标准引擎：统一技能认证的等级和可信度
// ===========================================
LawAIApp.CertificationStandardsEngine = {
  // 根据全局标准验证并升级证书
  standardizeCertification(certificate) {
    const { skillId, masteryScore } = certificate;
    const check = LawAIApp.GlobalStandardEngine.validateSkillForCertification(skillId);
    if (!check.valid) {
      // 降级为未认证
      return { ...certificate, certificationLevel: 'Not Certified', trustLevel: 'Internal' };
    }

    const level = LawAIApp.GlobalStandardEngine.getMasteryLevel(masteryScore);
    let trustLevel = 'Internal';
    if (certificate.agentConsensus === 'verified' && masteryScore >= 80) {
      trustLevel = 'Premium Verified';
    } else if (certificate.agentConsensus === 'verified') {
      trustLevel = 'Verified';
    } else if (masteryScore >= 70) {
      trustLevel = 'Portable';
    }

    return { ...certificate, certificationLevel: level, trustLevel };
  },

  // 当新证书生成时，自动进行标准化
  listenAndStandardize() {
    LawAIApp.EventBus.on('SkillCertified', (cert) => {
      const standardized = LawAIApp.CertificationStandardsEngine.standardizeCertification(cert);
      // 更新存储中的证书（如果有）
      const certs = LawAIApp.StorageEngine.get('skill_certificates', {});
      if (certs[cert.skillId]) {
        certs[cert.skillId] = standardized;
        LawAIApp.StorageEngine.set('skill_certificates', certs);
      }
    });
  }
};
