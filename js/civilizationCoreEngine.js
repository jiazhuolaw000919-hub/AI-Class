// ===========================================
// civilizationCoreEngine.js
// 文明核心引擎 - 统一调度各文明子模块（Phase 70 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CivilizationCoreEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🏛️ CivilizationCoreEngine initializing...');

        // 确保各模块已初始化
        var modules = [
            'CivilizationIdentityCore',
            'CivilizationMotivationCore',
            'AIConsciousnessLayer',
            'EducationGovernanceAuthority',
            'GlobalEducationNetworkEngine',
            'UniversityDeploymentEngine',
            'CurriculumFactoryEngine',
            'LearningGraphEngine',
            'PerformanceEvaluationEngine',
            'SelfImprovementEngine',
            'InfiniteLearningEngine'
        ];

        for (var i = 0; i < modules.length; i++) {
            var mod = modules[i];
            if (LawAIApp[mod] && typeof LawAIApp[mod].init === 'function') {
                try {
                    LawAIApp[mod].init();
                } catch (e) {}
            }
        }

        console.log('🏛️ AI Civilization Core Protocol is now active.');
    },

    getCivilizationSnapshot: function() {
        var snapshot = {
            health: null,
            economy: null,
            recentGlobalEvents: [],
            globalConsensusPath: null,
            timestamp: new Date().toISOString()
        };

        try {
            if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getMetrics === 'function') {
                snapshot.health = LawAIApp.SystemHealthMonitor.getMetrics();
            }
        } catch (e) {}

        try {
            if (LawAIApp.KnowledgeEconomyEngine && typeof LawAIApp.KnowledgeEconomyEngine.getSummary === 'function') {
                snapshot.economy = LawAIApp.KnowledgeEconomyEngine.getSummary();
            }
        } catch (e) {}

        try {
            if (LawAIApp.CivilizationEventBus && typeof LawAIApp.CivilizationEventBus.getGlobalEventLog === 'function') {
                var events = LawAIApp.CivilizationEventBus.getGlobalEventLog() || [];
                snapshot.recentGlobalEvents = events.slice(-10);
            }
        } catch (e) {}

        try {
            if (LawAIApp.CollectiveLearningProcessor && typeof LawAIApp.CollectiveLearningProcessor.recommendGlobalPath === 'function') {
                snapshot.globalConsensusPath = LawAIApp.CollectiveLearningProcessor.recommendGlobalPath();
            }
        } catch (e) {}

        return snapshot;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            snapshot: this.getCivilizationSnapshot()
        };
    }
};

// 启动文明
setTimeout(function() {
    if (LawAIApp.CivilizationCoreEngine && typeof LawAIApp.CivilizationCoreEngine.init === 'function') {
        LawAIApp.CivilizationCoreEngine.init();
    }
}, 1200);

console.log('🏛️ CivilizationCoreEngine V2.0 ready');
