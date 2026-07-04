// ===========================================
// civilizationEventBus.js
// 文明事件总线：升级版事件系统，添加全局事件记录
// ===========================================
LawAIApp.CivilizationEventBus = {
  _globalLog: [],

  init() {
    // 包装原有 emit，记录所有全局事件
    const originalEmit = LawAIApp.EventBus.emit;
    LawAIApp.EventBus.emit = (event, data, priority) => {
      // 仅记录文明层事件
      const civilizationEvents = [
        'SkillCertified', 'TaskAssigned', 'PromotionEvaluated',
        'SystemHealthUpdated', 'GovernanceAction', 'GlobalPathGenerated'
      ];
      if (civilizationEvents.includes(event)) {
        this._globalLog.push({
          event,
          data,
          timestamp: new Date().toISOString()
        });
        if (this._globalLog.length > 200) this._globalLog.shift();
      }
      // 执行原始发射
      originalEmit.call(LawAIApp.EventBus, event, data, priority);
    };
    console.log('Civilization Event Bus activated.');
  },

  getGlobalEventLog() {
    return [...this._globalLog];
  }
};

// 自动初始化
setTimeout(() => LawAIApp.CivilizationEventBus.init(), 200);
