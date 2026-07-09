// ===========================================
// marketplaceEngine.js
// 全球学习市场 - 知识资产市场（Phase 65 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MarketplaceEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🌍 Global Learning Marketplace activating...');

        // 同步资产到图谱
        setTimeout(function() {
            if (LawAIApp.KnowledgeAssetGraph && typeof LawAIApp.KnowledgeAssetGraph.syncAssetsToGraph === 'function') {
                LawAIApp.KnowledgeAssetGraph.syncAssetsToGraph();
            }
            if (LawAIApp.CourseRankingSystem && typeof LawAIApp.CourseRankingSystem.calculateRankings === 'function') {
                LawAIApp.CourseRankingSystem.calculateRankings();
            }
        }, 500);

        // 监听事件
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            try {
                var assets = LawAIApp.LearningAssetManager?.getAllAssets?.() || [];
                for (var i = 0; i < assets.length; i++) {
                    var a = assets[i];
                    if (a.lessons && a.lessons.indexOf(lessonId) !== -1) {
                        LawAIApp.UserContributionEngine?.recordCourseCompletion?.(a.id);
                        break;
                    }
                }
            } catch (e) {}
        });

        LawAIApp.EventBus?.on?.('WeaknessDetected', function() {
            if (LawAIApp.AgentContentGenerator && typeof LawAIApp.AgentContentGenerator.generateCourseFromWeakAreas === 'function') {
                LawAIApp.AgentContentGenerator.generateCourseFromWeakAreas();
            }
        });

        console.log('✅ Global Learning Marketplace activated.');
    },

    getMarketSummary: function() {
        var topCourses = [];
        var globalMetrics = {};
        var recommended = [];

        try {
            if (LawAIApp.CourseRankingSystem && typeof LawAIApp.CourseRankingSystem.getTopAssets === 'function') {
                topCourses = LawAIApp.CourseRankingSystem.getTopAssets(5) || [];
            }
        } catch (e) {}

        try {
            if (LawAIApp.GlobalLearningMetrics && typeof LawAIApp.GlobalLearningMetrics.getMetrics === 'function') {
                globalMetrics = LawAIApp.GlobalLearningMetrics.getMetrics() || {};
            }
        } catch (e) {}

        try {
            if (LawAIApp.AgentContentGenerator && typeof LawAIApp.AgentContentGenerator.recommendTopContent === 'function') {
                recommended = LawAIApp.AgentContentGenerator.recommendTopContent() || [];
            }
        } catch (e) {}

        return {
            topCourses: topCourses,
            globalMetrics: globalMetrics,
            recommended: recommended,
            timestamp: new Date().toISOString()
        };
    },

    getAsset: function(assetId) {
        try {
            if (LawAIApp.LearningAssetManager && typeof LawAIApp.LearningAssetManager.getAsset === 'function') {
                return LawAIApp.LearningAssetManager.getAsset(assetId);
            }
        } catch (e) {}
        return null;
    },

    getTopAssets: function(limit) {
        limit = limit || 5;
        try {
            if (LawAIApp.CourseRankingSystem && typeof LawAIApp.CourseRankingSystem.getTopAssets === 'function') {
                return LawAIApp.CourseRankingSystem.getTopAssets(limit) || [];
            }
        } catch (e) {}
        return [];
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            topAssets: this.getTopAssets(3).length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.MarketplaceEngine && typeof LawAIApp.MarketplaceEngine.init === 'function') {
        LawAIApp.MarketplaceEngine.init();
    }
}, 600);

console.log('🌍 MarketplaceEngine V2.0 ready');
