// knowledgeEvolution.js (主引擎)
LawAIApp.KnowledgeEvolution = (function() {
  // 当内容平台发布新版本时触发
  LawAIApp.EventBus.on('ContentPublished', (data) => {
    const contentId = data.contentId;
    const content = LawAIApp.ContentPlatform.get(contentId);
    if (!content) return;
    const history = LawAIApp.VersionHistory.getHistory(contentId);
    const lastVersion = history.length > 0 ? history[history.length - 1] : null;
    const fromVersion = lastVersion ? lastVersion.toVersion : '0.0.0';
    const toVersion = content.version || '1.0.0';

    // 如果不是首次发布且版本有变化，创建进化记录
    if (fromVersion !== toVersion && lastVersion) {
      // 获取快照（这里简化：从之前版本历史中拿最新快照，实际可存储完整内容快照）
      const oldSnapshot = lastVersion.snapshot || {};
      const newSnapshot = { ...content }; // 简单把当前内容当快照
      const diff = LawAIApp.DiffAnalyzer.compare(oldSnapshot, newSnapshot);
      const summary = LawAIApp.DiffAnalyzer.generateSummary(diff);
      const isBreaking = diff.removed.length > 0 || diff.changed.length > 0;

      const evolutionEntry = LawAIApp.VersionHistory.record(
        contentId,
        fromVersion,
        toVersion,
        isBreaking ? 'major_update' : 'minor_update',
        summary,
        isBreaking
      );

      // 生成迁移计划并通知
      const plan = LawAIApp.MigrationEngine.generatePlan(contentId, fromVersion, toVersion, summary);
      LawAIApp.MigrationEngine.saveMigration(plan);
      LawAIApp.UpdateNotifier.notify(evolutionEntry, plan);

      // 如果涉及重大变更，提醒 AI 导师
      if (isBreaking) {
        LawAIApp.EventBus.emit('KnowledgeUpdated', { contentId, breaking: true });
      }
    }
  });

  // 同时监听来自学习包系统的事件（PackUpdated），此处简略

  return {
    getHistory: LawAIApp.VersionHistory.getHistory,
    getMigrations: LawAIApp.MigrationEngine.getPendingMigrations,
    acknowledgeUpdate: LawAIApp.UpdateNotifier.acknowledge,
    getNotifications: LawAIApp.UpdateNotifier.getUnacknowledged
  };
})();
