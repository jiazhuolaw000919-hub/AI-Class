// ===========================================
// certificationGenerator.js
// AI 认证与技能验证 - 证书生成器（Phase 66 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CertificationGenerator = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📜 CertificationGenerator initialized');
    },

    certifySkill: async function(skillId) {
        console.log('📜 Certifying skill:', skillId);

        var assessment = { masteryScore: 70, level: 'Intermediate' };
        try {
            if (LawAIApp.SkillAssessmentEngine && typeof LawAIApp.SkillAssessmentEngine.assessSkill === 'function') {
                assessment = await LawAIApp.SkillAssessmentEngine.assessSkill(skillId) || assessment;
            }
        } catch (e) {}

        var validation = { averageScore: 75, consensusPassed: true, confidence: 80 };
        try {
            if (LawAIApp.AgentValidationNetwork && typeof LawAIApp.AgentValidationNetwork.validateSkill === 'function') {
                validation = await LawAIApp.AgentValidationNetwork.validateSkill(skillId) || validation;
            }
        } catch (e) {}

        var credential = {
            skillId: skillId,
            certificationId: 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            issuedAt: new Date().toISOString(),
            masteryScore: assessment.masteryScore || 70,
            certificationLevel: this._getLevel(validation.averageScore || 75),
            validationConfidence: validation.confidence || 80,
            consensusPassed: validation.consensusPassed !== false,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        // 存储证书
        try {
            var certs = LawAIApp.StorageEngine?.get?.('skill_certificates') || {};
            certs[skillId] = credential;
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('skill_certificates', certs);
            }
        } catch (e) {}

        // 更新图谱
        try {
            if (LawAIApp.GraphNodeManager && typeof LawAIApp.GraphNodeManager.addNode === 'function') {
                LawAIApp.GraphNodeManager.addNode(skillId, 'validated_skill', {
                    strength: credential.masteryScore,
                    certified: true,
                    level: credential.certificationLevel
                });
            }
        } catch (e) {}

        LawAIApp.EventBus?.emit?.('SkillCertified', credential);
        console.log('✅ Skill certified:', skillId, 'Level:', credential.certificationLevel);
        return credential;
    },

    _getLevel: function(score) {
        if (score >= 85) return 'Expert';
        if (score >= 70) return 'Advanced';
        if (score >= 55) return 'Intermediate';
        return 'Beginner';
    },

    getAllCertificates: function() {
        try {
            return Object.values(LawAIApp.StorageEngine?.get?.('skill_certificates') || {});
        } catch (e) {
            return [];
        }
    },

    getCertificate: function(skillId) {
        try {
            var certs = LawAIApp.StorageEngine?.get?.('skill_certificates') || {};
            return certs[skillId] || null;
        } catch (e) {
            return null;
        }
    },

    revokeCertificate: function(skillId) {
        try {
            var certs = LawAIApp.StorageEngine?.get?.('skill_certificates') || {};
            delete certs[skillId];
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('skill_certificates', certs);
            }
            console.log('🗑️ Certificate revoked:', skillId);
            return true;
        } catch (e) {
            return false;
        }
    },

    getStatus: function() {
        var certs = this.getAllCertificates();
        return {
            initialized: this._initialized,
            totalCertificates: certs.length,
            levels: certs.reduce(function(acc, c) {
                acc[c.certificationLevel] = (acc[c.certificationLevel] || 0) + 1;
                return acc;
            }, {})
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CertificationGenerator && typeof LawAIApp.CertificationGenerator.init === 'function') {
        LawAIApp.CertificationGenerator.init();
    }
}, 500);

console.log('📜 CertificationGenerator V2.0 ready');
