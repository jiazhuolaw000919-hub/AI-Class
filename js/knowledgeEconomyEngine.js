// ===========================================
// knowledgeEconomyEngine.js
// 知识经济引擎：将学习资产转化为可交易的知识货币（模拟）
// ===========================================
LawAIApp.KnowledgeEconomyEngine = {
  _economyKey: 'knowledge_economy',

  init() {
    // 初始化经济状态
    if (!LawAIApp.StorageEngine.get(this._economyKey)) {
      LawAIApp.StorageEngine.set(this._economyKey, {
        totalKnowledgePoints: 0,
        assetsCreated: 0,
        transactions: []
      });
    }
    // 监听新资产生成
    LawAIApp.EventBus.on('AssetCreated', (data) => this.recordAssetCreation(data));
    LawAIApp.EventBus.on('SkillCertified', (data) => this.awardKnowledgePoints(data));
  },

  recordAssetCreation(asset) {
    const economy = LawAIApp.StorageEngine.get(this._economyKey);
    economy.assetsCreated += 1;
    economy.transactions.push({
      type: 'asset_creation',
      assetId: asset.assetId,
      timestamp: new Date().toISOString()
    });
    LawAIApp.StorageEngine.set(this._economyKey, economy);
  },

  awardKnowledgePoints(certData) {
    const economy = LawAIApp.StorageEngine.get(this._economyKey);
    const points = Math.round(certData.masteryScore * 0.5); // 掌握度的一半作为知识分
    economy.totalKnowledgePoints += points;
    economy.transactions.push({
      type: 'certification_reward',
      skillId: certData.skillId,
      points,
      timestamp: new Date().toISOString()
    });
    LawAIApp.StorageEngine.set(this._economyKey, economy);
    LawAIApp.EventBus.emit('KnowledgePointsAwarded', { points, total: economy.totalKnowledgePoints });
  },

  // 获取经济摘要
  getSummary() {
    const economy = LawAIApp.StorageEngine.get(this._economyKey, { totalKnowledgePoints: 0, assetsCreated: 0, transactions: [] });
    return {
      totalKnowledgePoints: economy.totalKnowledgePoints,
      assetsCreated: economy.assetsCreated,
      recentTransactions: economy.transactions.slice(-5)
    };
  }
};

// 自动初始化
setTimeout(() => LawAIApp.KnowledgeEconomyEngine.init(), 800);
