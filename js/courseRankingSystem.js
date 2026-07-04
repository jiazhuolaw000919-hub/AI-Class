LawAIApp.CourseRankingSystem = {
  _rankings: [],
  calculateRankings() {
    const assets = LawAIApp.LearningAssetManager.getAllAssets();
    this._rankings = assets.map(a => ({
      id: a.id, title: a.title,
      score: Math.round((a.effectivenessScore * 0.4) + (a.usageCount * 0.3) + ((a.rating || 0) * 20 * 0.3)),
      type: a.type
    })).sort((a,b) => b.score - a.score);
    LawAIApp.EventBus.emit('RankingsUpdated', this._rankings);
    return this._rankings;
  },
  getTopAssets(limit = 5) {
    if (!this._rankings.length) this.calculateRankings();
    return this._rankings.slice(0, limit);
  }
};
