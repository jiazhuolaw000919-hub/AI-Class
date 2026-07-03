// migrationEngine.js
LawAIApp.MigrationEngine = {
  _key: 'migrations',
  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, {});
  },
  _save(store) { LawAIApp.StorageEngine.set(this._key, store); },

  // 生成迁移计划（标识哪些内容需要学习者的关注）
  generatePlan(contentId, fromVersion, toVersion, diffSummary) {
    const plan = {
      migrationId: `mig_${contentId}_${Date.now()}`,
      contentId,
      fromVersion,
      toVersion,
      diffSummary,
      status: 'pending',
      recommendedActions: [],
      createdAt: new Date().toISOString()
    };
    // 根据差异类型推荐动作
    if (diffSummary.includes('Added')) plan.recommendedActions.push('Review new material');
    if (diffSummary.includes('Changed')) plan.recommendedActions.push('Update notes');
    if (diffSummary.includes('Removed')) plan.recommendedActions.push('Archive old references');
    return plan;
  },

  // 保存迁移状态
  saveMigration(plan) {
    const store = this._getAll();
    store[plan.migrationId] = plan;
    this._save(store);
    LawAIApp.EventBus.emit('MigrationGenerated', plan);
  },

  // 完成迁移（标记为完成）
  completeMigration(migrationId) {
    const store = this._getAll();
    if (store[migrationId]) {
      store[migrationId].status = 'completed';
      this._save(store);
    }
  },

  // 检查某个内容是否有待处理迁移
  getPendingMigrations(contentId) {
    return Object.values(this._getAll()).filter(m => m.contentId === contentId && m.status === 'pending');
  }
};
