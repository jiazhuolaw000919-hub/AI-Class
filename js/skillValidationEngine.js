// ===========================================
// PHASE 66-06: skillValidationEngine.js
// 主引擎：技能验证与证书网络
// ===========================================
LawAIApp.SkillValidationEngine = {
  async init() {
    // 在关键学习事件后自动验证技能
    LawAIApp.EventBus.on('ProjectFinished', async (data) => {
      if (data.skills) {
        data.skills.forEach(async (skillName) => {
          const skillId = `skill_${skillName.toLowerCase().replace(/\s/g, '_')}`;
          await LawAIApp.CertificationGenerator.certifySkill(skillId);
        });
      }
    });

    LawAIApp.EventBus.on('QuizCompleted', async (data) => {
      // 简单处理：对当前模块相关的技能进行验证
      const skills = LawAIApp.SkillTracker?.getAllSkills() || [];
      for (const skill of skills.slice(0, 2)) { // 仅验证前两个
        await LawAIApp.CertificationGenerator.certifySkill(skill.skillId);
      }
    });

    console.log('Skill Validation Network activated.');
  },

  // 对外接口：手动验证技能
  async validateAndCertify(skillId) {
    return LawAIApp.CertificationGenerator.certifySkill(skillId);
  },

  getCertificates() {
    return LawAIApp.CertificationGenerator.getAllCertificates();
  },

  exportSkillCredential(skillId) {
    return LawAIApp.SkillTrustLayer.exportCredential(skillId);
  }
};

// 自动初始化
setTimeout(() => LawAIApp.SkillValidationEngine.init(), 800);
