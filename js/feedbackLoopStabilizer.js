// ===========================================
// feedbackLoopStabilizer.js
// 反馈循环稳定器：确保文明的自我强化循环不会失控或崩溃
// ===========================================
LawAIApp.FeedbackLoopStabilizer = {
  _loopState: {
    status: 'stable',
    iterationCount: 0,
    lastImprovement: null,
    diminishingReturns: false
  },

  // 记录一次完整的观察→学习→改进→应用循环
  recordLoop() {
    this._loopState.iterationCount++;
    this._loopState.lastImprovement = new Date().toISOString();

    // 检测收益递减（如果短期内循环过多但改进不大）
    const recentImprovements = LawAIApp.AnalyticsStorage?.getEventLog()
      .filter(e => e.eventType === 'SelfImprovementApplied').length || 0;
    if (recentImprovements > 10 && this._loopState.iterationCount > 20) {
      this._loopState.diminishingReturns = true;
      LawAIApp.EventBus.emit('DiminishingReturnsDetected', { loops: this._loopState.iterationCount });
      // 主动调整：减慢循环频率
      this._loopState.status = 'slowing';
    }

    return { ...this._loopState };
  },

  // 检查是否需要外部干预（停止、暂停等）
  checkStability() {
    if (this._loopState.diminishingReturns && this._loopState.iterationCount > 30) {
      this._loopState.status = 'critical';
      LawAIApp.EventBus.emit('FeedbackLoopCritical', { state: this._loopState });
      // 触发安全机制：暂时降低代理活跃度（模拟）
      LawAIApp.AgentConsensusEngine?._voters?.forEach(v => v.weight = Math.max(1, v.weight - 1));
      return false;
    }
    return true;
  },

  getState() { return { ...this._loopState }; }
};
