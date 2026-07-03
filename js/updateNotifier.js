// updateNotifier.js
LawAIApp.UpdateNotifier = {
  _key: 'pending_updates',
  _getAll() {
    return LawAIApp.StorageEngine.get(this._key, []);
  },
  _save(list) { LawAIApp.StorageEngine.set(this._key, list); },

  // 添加一条更新通知
  notify(evolutionEntry, migrationPlan) {
    const list = this._getAll();
    const notification = {
      notifyId: `notify_${evolutionEntry.evolutionId}`,
      contentId: evolutionEntry.contentId,
      title: `Content updated: ${evolutionEntry.contentId}`,
      message: `${evolutionEntry.changeType} from v${evolutionEntry.fromVersion} to v${evolutionEntry.toVersion}`,
      breaking: evolutionEntry.breakingChange,
      actions: migrationPlan.recommendedActions || [],
      acknowledged: false,
      createdAt: new Date().toISOString()
    };
    list.push(notification);
    this._save(list);
    LawAIApp.EventBus.emit('UpdateNotified', notification);
  },

  // 标记通知为已读
  acknowledge(notifyId) {
    const list = this._getAll();
    const notif = list.find(n => n.notifyId === notifyId);
    if (notif) notif.acknowledged = true;
    this._save(list);
  },

  // 获取所有未读通知
  getUnacknowledged() {
    return this._getAll().filter(n => !n.acknowledged);
  }
};
