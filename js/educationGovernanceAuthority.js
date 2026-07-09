// ===========================================
// educationGovernanceAuthority.js
// AI 教育治理机构：整合所有治理模块，执行监督（Phase 76 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.EducationGovernanceAuthority = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🏛️ Education Governance Authority (AEGA) initializing...');

        // 1. 启用伦理控制器定期检查
        setInterval(function() {
            if (LawAIApp.AIEthicsController && typeof LawAIApp.AIEthicsController.enforceAgentFairness === 'function') {
                LawAIApp.AIEthicsController.enforceAgentFairness();
            }
        }, 600000);

        // 2. 监听新课程生成
        LawAIApp.EventBus?.on?.('CurriculumGenerated', function(data) {
            if (data && data.course) {
                if (LawAIApp.CurriculumPolicyEngine && typeof LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum === 'function') {
                    LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum();
                }
            }
        });

        // 3. 监听认证事件
        if (LawAIApp.CertificationStandardsEngine && typeof LawAIApp.CertificationStandardsEngine.listenAndStandardize === 'function') {
            LawAIApp.CertificationStandardsEngine.listenAndStandardize();
        }

        // 4. 监听提案失败
        LawAIApp.EventBus?.on?.('ProposalRejected', function(proposal) {
            if (LawAIApp.ConflictResolutionSystem && typeof LawAIApp.ConflictResolutionSystem.mediateConsensus === 'function') {
                LawAIApp.ConflictResolutionSystem.mediateConsensus(proposal);
            }
        });

        // 5. 执行初始审计
        if (LawAIApp.CurriculumPolicyEngine && typeof LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum === 'function') {
            LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum();
        }
        if (LawAIApp.AIEthicsController && typeof LawAIApp.AIEthicsController.enforceAgentFairness === 'function') {
            LawAIApp.AIEthicsController.enforceAgentFairness();
        }

        console.log('🏛️ AI Education Governance Authority (AEGA) is now overseeing the civilization.');
    },

    getGovernanceReport: function() {
        var report = {
            standards: {},
            ethicsIssues: [],
            policyViolations: [],
            conflictLog: []
        };

        try {
            if (LawAIApp.GlobalStandardEngine && LawAIApp.GlobalStandardEngine.standards) {
                report.standards = LawAIApp.GlobalStandardEngine.standards;
            }
        } catch (e) {}

        try {
            if (LawAIApp.AIEthicsController && typeof LawAIApp.AIEthicsController.auditFairness === 'function') {
                report.ethicsIssues = LawAIApp.AIEthicsController.auditFairness() || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.CurriculumPolicyEngine && typeof LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum === 'function') {
                var result = LawAIApp.CurriculumPolicyEngine.auditExistingCurriculum();
                report.policyViolations = result || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.ConflictResolutionSystem && LawAIApp.ConflictResolutionSystem._resolutionLog) {
                report.conflictLog = LawAIApp.ConflictResolutionSystem._resolutionLog.slice(-10);
            }
        } catch (e) {}

        return report;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            report: this.getGovernanceReport()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.EducationGovernanceAuthority && typeof LawAIApp.EducationGovernanceAuthority.init === 'function') {
        LawAIApp.EducationGovernanceAuthority.init();
    }
}, 800);

console.log('🏛️ EducationGovernanceAuthority V2.0 ready');
