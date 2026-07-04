// ===========================================
// civilizationAwarenessMonitor.js
// 文明感知监控器：持续追踪文明的健康与成长
// ===========================================
LawAIApp.CivilizationAwarenessMonitor = {
  _awarenessState: {
    level: 'conscious',
    lastPulse: null,
    growthIndicators: {
      knowledgeExpansion: 0,
      agentActivity: 0,
      learnerProgress: 0
    }
  },

  // 启动监控
  start() {
    // 定期脉冲，更新感知状态
    setInterval(() => {
      this.pulse();
    }, 300000); // 每5分钟
    this.pulse();
  },

  pulse() {
    // 1. 知识扩展度：图节点数量变化
    const prevNodes = this._awarenessState.growthIndicators.knowledgeExpansion;
    const currentNodes = Object.keys(LawAIApp.GraphNodeManager?._nodes || {}).length;
    this._awarenessState.growthIndicators.knowledgeExpansion = currentNodes;

    // 2. 代理活跃度：最近事件中代理相关事件数
    const recentEvents = LawAIApp.AnalyticsStorage?.getEventLog().slice(-20) || [];
    const agentEvents = recentEvents.filter(e => 
      e.eventType.includes('Agent') || e.eventType.includes('Consensus') || e.eventType.includes('Proposal'));
    this._awarenessState.growthIndicators.agentActivity = agentEvents.length;

    // 3. 学习者进度
    this._awarenessState.growthIndicators.learnerProgress = 
      LawAIApp.ProgressEngine.getProgress().completionPercent;

    this._awarenessState.lastPulse = new Date().toISOString();

    // 评估文明意识水平
    if (currentNodes > 100 && agentEvents.length > 5) {
      this._awarenessState.level = 'highly_conscious';
    } else if (currentNodes > 30) {
      this._awarenessState.level = 'conscious';
    } else {
      this._awarenessState.level = 'emerging';
    }

    LawAIApp.EventBus.emit('CivilizationAwarenessPulse', this._awarenessState);
  },

  getAwarenessReport() {
    return { ...this._awarenessState };
  }
};
