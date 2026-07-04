LawAIApp.MarketplaceEngine = {
  init() {
    setTimeout(() => {
      LawAIApp.KnowledgeAssetGraph.syncAssetsToGraph();
      LawAIApp.CourseRankingSystem.calculateRankings();
    }, 300);
    LawAIApp.EventBus.on('LessonCompleted', (data) => {
      const assets = LawAIApp.LearningAssetManager.getAllAssets();
      for (let a of assets) {
        if (a.lessons?.includes(data.lessonId)) {
          LawAIApp.UserContributionEngine.recordCourseCompletion(a.id);
          break;
        }
      }
    });
    LawAIApp.EventBus.on('WeaknessDetected', () => LawAIApp.AgentContentGenerator.generateCourseFromWeakAreas());
    console.log('Global Learning Marketplace activated.');
  },
  getMarketSummary() {
    return {
      topCourses: LawAIApp.CourseRankingSystem.getTopAssets(5),
      globalMetrics: LawAIApp.GlobalLearningMetrics.getMetrics(),
      recommended: LawAIApp.AgentContentGenerator.recommendTopContent()
    };
  }
};
setTimeout(() => LawAIApp.MarketplaceEngine.init(), 600);
