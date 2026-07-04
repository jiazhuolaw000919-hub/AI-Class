// ===========================================
// knowledgeIntegrityValidator.js
// 确保知识资产可追溯、可验证、模块化
// ===========================================
LawAIApp.KnowledgeIntegrityValidator = {
  _integrityLog: [],

  // 验证一个知识资产（课程/技能）是否完整
  validateAsset(assetId) {
    const asset = LawAIApp.LearningAssetManager?.getAsset(assetId);
    if (!asset) return { valid: false, reason: 'Asset not found' };

    const issues = [];
    // 检查模块化：必须有至少一个课程
    if (!asset.lessons || asset.lessons.length === 0) {
      issues.push('Asset is not modular: no lessons defined');
    }
    // 检查可追溯性：必须有创建者和日期
    if (!asset.creator || !asset.createdAt) {
      issues.push('Asset lacks traceability metadata');
    }
    // 检查可验证性：必须有某种评估标准（这里简单检查是否存在 rating）
    if (asset.rating === undefined) {
      issues.push('Asset has no verifiable quality metric');
    }

    if (issues.length > 0) {
      this._integrityLog.push({ assetId, issues, timestamp: new Date().toISOString() });
      LawAIApp.EventBus.emit('KnowledgeIntegrityIssue', { assetId, issues });
      return { valid: false, issues };
    }
    return { valid: true };
  },

  // 验证当前所有资产
  auditAllAssets() {
    const assets = LawAIApp.LearningAssetManager?.getAllAssets() || [];
    const results = assets.map(asset => this.validateAsset(asset.id));
    return results.filter(r => !r.valid);
  },

  getIntegrityReport() {
    return [...this._integrityLog];
  }
};
