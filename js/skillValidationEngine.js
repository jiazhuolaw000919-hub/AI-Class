// ===========================================
// skillValidationEngine.js
// 技能验证引擎 - 主入口（Phase 66 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SkillValidationEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🔬 SkillValidationEngine initializing...');

        // 监听项目完成
        LawAIApp.EventBus?.on?.('ProjectFinished', function(data) {
            var skills = data.skills || [];
            if (skills.length > 0) {
                for (var i = 0; i < skills.length; i++) {
                    var skillName = skills[i];
                    var skillId = 'skill_' + skillName.toLowerCase().replace(/\s/g, '_');
                    setTimeout(function(sid) {
                        LawAIApp.SkillValidationEngine.validateAndCertify(sid);
                    }, 500, skillId);
                }
            }
        });

        // 监听测验完成
        LawAIApp.EventBus?.on?.('QuizCompleted', function() {
            var skills = [];
            try {
                if (LawAIApp.SkillTracker && typeof LawAIApp.SkillTracker.getAllSkills === 'function') {
                    skills = LawAIApp.SkillTracker.getAllSkills() || [];
                }
            } catch (e) {}

            for (var i = 0; i < Math.min(skills.length, 2); i++) {
                if (skills[i] && skills[i].skillId) {
                    setTimeout(function(sid) {
                        LawAIApp.SkillValidationEngine.validateAndCertify(sid);
                    }, 500, skills[i].skillId);
                }
            }
        });

        console.log('✅ Skill Validation Network activated.');
    },

    validateAndCertify: async function(skillId) {
        console.log('🔬 Validating and certifying skill:', skillId);
        try {
            if (LawAIApp.CertificationGenerator && typeof LawAIApp.CertificationGenerator.certifySkill === 'function') {
                return await LawAIApp.CertificationGenerator.certifySkill(skillId);
            }
        } catch (e) {
            console.warn('⚠️ Certification failed:', e);
        }
        return null;
    },

    getCertificates: function() {
        try {
            if (LawAIApp.CertificationGenerator && typeof LawAIApp.CertificationGenerator.getAllCertificates === 'function') {
                return LawAIApp.CertificationGenerator.getAllCertificates();
            }
        } catch (e) {}
        return [];
    },

    exportSkillCredential: function(skillId) {
        try {
            if (LawAIApp.SkillTrustLayer && typeof LawAIApp.SkillTrustLayer.exportCredential === 'function') {
                return LawAIApp.SkillTrustLayer.exportCredential(skillId);
            }
        } catch (e) {}
        return null;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            certificates: this.getCertificates().length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.SkillValidationEngine && typeof LawAIApp.SkillValidationEngine.init === 'function') {
        LawAIApp.SkillValidationEngine.init();
    }
}, 800);

console.log('🔬 SkillValidationEngine V2.0 ready');
