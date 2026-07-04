LawAIApp.KnowledgeAssetGraph = {
  registerAssetNode(assetId) {
    const asset = LawAIApp.LearningAssetManager.getAsset(assetId);
    if (!asset) return;
    LawAIApp.GraphNodeManager.addNode(assetId, 'marketplace_asset', {
      title: asset.title, type: asset.type, creator: asset.creator, effectivenessScore: asset.effectivenessScore
    });
    if (asset.lessons) {
      asset.lessons.forEach(lessonId => LawAIApp.GraphEdgeManager.addEdge(assetId, lessonId, 'contains', 1));
    }
  },
  syncAssetsToGraph() {
    const assets = LawAIApp.LearningAssetManager.getAllAssets();
    assets.forEach(a => this.registerAssetNode(a.id));
  }
};
