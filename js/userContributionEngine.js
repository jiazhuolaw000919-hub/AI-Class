LawAIApp.UserContributionEngine = {
  recordCourseCompletion(assetId) {
    LawAIApp.LearningAssetManager.recordUsage(assetId);
    const asset = LawAIApp.LearningAssetManager.getAsset(assetId);
    if (asset) LawAIApp.LearningAssetManager.updateAsset(assetId, { effectivenessScore: Math.min(100, (asset.effectivenessScore || 50) + 2) });
    LawAIApp.CourseRankingSystem.calculateRankings();
  },
  submitRating(assetId, rating) {
    const asset = LawAIApp.LearningAssetManager.getAsset(assetId);
    if (asset) {
      const newRating = asset.rating ? (asset.rating + rating) / 2 : rating;
      LawAIApp.LearningAssetManager.updateAsset(assetId, { rating: newRating });
      LawAIApp.CourseRankingSystem.calculateRankings();
    }
  }
};
