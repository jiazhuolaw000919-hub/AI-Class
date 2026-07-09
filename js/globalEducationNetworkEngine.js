// ===========================================
// globalEducationNetworkEngine.js
// 全球 AI 教育网络引擎：连接所有大学（Phase 75 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GlobalEducationNetworkEngine = {
    _initialized: false,
    _networkActive: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('[GlobalNet] Global education network initializing...');

        // 1. 注册当前部署的大学
        var universities = LawAIApp.UniversityDeploymentEngine?.getUniversities?.() || [];
        if (universities.length > 0 && LawAIApp.UniversityInterconnectLayer && typeof LawAIApp.UniversityInterconnectLayer.registerUniversity === 'function') {
            for (var i = 0; i < universities.length; i++) {
                LawAIApp.UniversityInterconnectLayer.registerUniversity(universities[i]);
            }
        }

        // 2. 如果尚未部署大学，则先部署默认大学
        if (universities.length === 0 && LawAIApp.UniversityDeploymentEngine && typeof LawAIApp.UniversityDeploymentEngine.launchDefaultUniversity === 'function') {
            var defaultUni = LawAIApp.UniversityDeploymentEngine.launchDefaultUniversity();
            if (LawAIApp.UniversityInterconnectLayer && typeof LawAIApp.UniversityInterconnectLayer.registerUniversity === 'function') {
                LawAIApp.UniversityInterconnectLayer.registerUniversity(defaultUni);
            }
        }

        // 3. 加载并同步全球技能图谱
        if (LawAIApp.UniversalSkillGraph && typeof LawAIApp.UniversalSkillGraph.importFromLocalGraph === 'function') {
            LawAIApp.UniversalSkillGraph.importFromLocalGraph();
        }

        // 4. 创建全球成绩单
        var student = null;
        try {
            if (LawAIApp.StudentTrackingSystem && typeof LawAIApp.StudentTrackingSystem.getCurrentStudent === 'function') {
                student = LawAIApp.StudentTrackingSystem.getCurrentStudent();
            }
        } catch (e) {}
        if (student && LawAIApp.CrossUniversityCreditSystem && typeof LawAIApp.CrossUniversityCreditSystem.createGlobalTranscript === 'function') {
            LawAIApp.CrossUniversityCreditSystem.createGlobalTranscript(student.id);
        }

        // 5. 首次数据交换
        if (LawAIApp.UniversityInterconnectLayer && typeof LawAIApp.UniversityInterconnectLayer.exchangeData === 'function') {
            LawAIApp.UniversityInterconnectLayer.exchangeData();
        }

        // 6. 定期同步（每10分钟）
        setInterval(function() {
            if (LawAIApp.UniversityInterconnectLayer && typeof LawAIApp.UniversityInterconnectLayer.exchangeData === 'function') {
                LawAIApp.UniversityInterconnectLayer.exchangeData();
            }
        }, 600000);

        this._networkActive = true;
        LawAIApp.EventBus?.emit?.('GlobalEducationNetworkActive');

        console.log('[GlobalNet] Global AI Education Network Protocol is active.');
        return this;
    },

    getNetworkSummary: function() {
        var summary = {
            connectedUniversities: [],
            consensus: null,
            skillStandards: null,
            studentTranscript: null
        };

        try {
            if (LawAIApp.UniversityInterconnectLayer && typeof LawAIApp.UniversityInterconnectLayer.getNetwork === 'function') {
                summary.connectedUniversities = LawAIApp.UniversityInterconnectLayer.getNetwork() || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.EducationConsensusEngine && typeof LawAIApp.EducationConsensusEngine.generateConsensus === 'function') {
                summary.consensus = LawAIApp.EducationConsensusEngine.generateConsensus();
            }
        } catch (e) {}

        try {
            if (LawAIApp.UniversalSkillGraph && typeof LawAIApp.UniversalSkillGraph.exportSkillStandards === 'function') {
                summary.skillStandards = LawAIApp.UniversalSkillGraph.exportSkillStandards();
            }
        } catch (e) {}

        try {
            if (LawAIApp.CrossUniversityCreditSystem && LawAIApp.CrossUniversityCreditSystem._transcripts) {
                summary.studentTranscript = LawAIApp.CrossUniversityCreditSystem._transcripts;
            }
        } catch (e) {}

        return summary;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            networkActive: this._networkActive,
            summary: this.getNetworkSummary()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.GlobalEducationNetworkEngine && typeof LawAIApp.GlobalEducationNetworkEngine.init === 'function') {
        LawAIApp.GlobalEducationNetworkEngine.init();
    }
}, 700);

console.log('[GlobalNet] GlobalEducationNetworkEngine V2.0 ready');
