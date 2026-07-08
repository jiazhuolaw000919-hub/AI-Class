// ===========================================
// systemHealthMonitor.js
// 系统健康监控器：持续追踪系统级指标
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemHealthMonitor = {
  _metricsKey: 'system_health_metrics',
  initialized: false,
  _cachedMetrics: null,
  _updateInterval: null,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('💚 SystemHealthMonitor initialized');
    
    // 初始化时更新一次指标
    this.updateMetrics();
    
    // 每30秒自动更新一次（可选）
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
    }
    this._updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 30000);
    
    return this;
  },

  getMetrics() {
    try {
      // 防御性检查：确保 StorageEngine 存在
      if (!LawAIApp.StorageEngine || typeof LawAIApp.StorageEngine.get !== 'function') {
        console.warn('⚠️ StorageEngine not ready, using default metrics');
        return this._getDefaultMetrics();
      }

      const stored = LawAIApp.StorageEngine.get(this._metricsKey, null);
      if (stored) {
        this._cachedMetrics = stored;
        return stored;
      }
      
      const defaults = this._getDefaultMetrics();
      this._cachedMetrics = defaults;
      return defaults;
      
    } catch (err) {
      console.warn('⚠️ Failed to get metrics from storage:', err);
      return this._getDefaultMetrics();
    }
  },

  _getDefaultMetrics() {
    return {
      learningEfficiency: 85,
      retentionEffectiveness: 85,
      taskCompletionRate: 80,
      agentCoordinationEfficiency: 75,
      graphOptimizationScore: 80,
      lastCheck: new Date().toISOString(),
      overall: 81
    };
  },

  // 更新指标（在关键事件后调用）
  updateMetrics() {
    console.log('🔄 SystemHealthMonitor updating metrics...');
    
    try {
      // ===========================================
      // 1. 获取进度（带防御）
      // ===========================================
      let progress = { completionPercent: 0 };
      try {
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
          const p = LawAIApp.ProgressEngine.getProgress();
          if (p && typeof p === 'object') {
            progress = p;
          } else if (typeof p === 'number') {
            progress = { completionPercent: p };
          }
        } else {
          console.warn('⚠️ ProgressEngine not ready, using default progress');
        }
      } catch (err) {
        console.warn('⚠️ Failed to get progress:', err);
      }

      // ===========================================
      // 2. 获取记忆健康（带防御）
      // ===========================================
      let memHealth = 85;
      try {
        if (LawAIApp.MemoryScheduler && typeof LawAIApp.MemoryScheduler.calculateMemoryHealth === 'function') {
          memHealth = LawAIApp.MemoryScheduler.calculateMemoryHealth() || 85;
        } else {
          console.warn('⚠️ MemoryScheduler not ready, using default memory health');
        }
      } catch (err) {
        console.warn('⚠️ Failed to calculate memory health:', err);
      }

      // ===========================================
      // 3. 计算任务完成率（带防御）
      // ===========================================
      let taskCompletionRate = 80;
      try {
        if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
          const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
          if (tasks && tasks.length > 0) {
            const completedTasks = tasks.filter(t => t && t.status === 'completed');
            taskCompletionRate = Math.round((completedTasks.length / tasks.length) * 100);
          } else {
            taskCompletionRate = 80; // 没有任务时默认
          }
        } else {
          console.warn('⚠️ StorageEngine not ready, using default task rate');
        }
      } catch (err) {
        console.warn('⚠️ Failed to calculate task completion:', err);
      }

      // ===========================================
      // 4. 计算代理协调效率（带防御）
      // ===========================================
      let agentEfficiency = 75;
      try {
        if (LawAIApp.AnalyticsStorage && typeof LawAIApp.AnalyticsStorage.getEventLog === 'function') {
          const eventLog = LawAIApp.AnalyticsStorage.getEventLog();
          if (eventLog && eventLog.length > 0) {
            const consensusEvents = eventLog.filter(e => 
              e && (e.eventType === 'ConsensusReached' || e.eventType === 'ProposalAccepted')
            );
            agentEfficiency = Math.min(100, (consensusEvents.length || 0) * 10 + 20);
          }
        } else {
          console.warn('⚠️ AnalyticsStorage not ready, using default agent efficiency');
        }
      } catch (err) {
        console.warn('⚠️ Failed to calculate agent efficiency:', err);
      }

      // ===========================================
      // 5. 计算图优化分数（带防御）
      // ===========================================
      let graphScore = 80;
      try {
        if (LawAIApp.GraphNodeManager && typeof LawAIApp.GraphNodeManager.getAllNodes === 'function') {
          const nodes = LawAIApp.GraphNodeManager.getAllNodes() || [];
          if (nodes && nodes.length > 0) {
            const weakNodes = nodes.filter(n => n && n.strength < 40);
            graphScore = Math.round(Math.max(0, 100 - ((weakNodes.length || 0) / nodes.length) * 100));
          }
        } else {
          console.warn('⚠️ GraphNodeManager not ready, using default graph score');
        }
      } catch (err) {
        console.warn('⚠️ Failed to calculate graph score:', err);
      }

      // ===========================================
      // 6. 计算学习效率
      // ===========================================
      const completionPercent = progress.completionPercent || 0;
      const learningEfficiency = Math.min(100, Math.round((completionPercent || 0) * 1.2 + 10));

      // ===========================================
      // 7. 组装指标
      // ===========================================
      const metrics = {
        learningEfficiency: Math.min(100, Math.max(0, learningEfficiency)),
        retentionEffectiveness: Math.min(100, Math.max(0, Math.round(memHealth))),
        taskCompletionRate: Math.min(100, Math.max(0, taskCompletionRate)),
        agentCoordinationEfficiency: Math.min(100, Math.max(0, Math.round(agentEfficiency))),
        graphOptimizationScore: Math.min(100, Math.max(0, graphScore)),
        lastCheck: new Date().toISOString()
      };

      // 计算总体健康度
      const avg = (metrics.learningEfficiency + metrics.retentionEffectiveness + 
                   metrics.taskCompletionRate + metrics.agentCoordinationEfficiency + 
                   metrics.graphOptimizationScore) / 5;
      metrics.overall = Math.round(avg);

      // 存储指标（带防御）
      try {
        if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
          LawAIApp.StorageEngine.set(this._metricsKey, metrics);
        } else {
          console.log('📊 Metrics (storage not available):', metrics);
        }
      } catch (err) {
        console.warn('⚠️ Failed to store metrics:', err);
      }

      this._cachedMetrics = metrics;

      // 触发事件（带防御）
      try {
        if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
          LawAIApp.EventBus.emit('SystemHealthUpdated', metrics);
        } else {
          window.dispatchEvent(new CustomEvent('SystemHealthUpdated', {
            detail: metrics
          }));
        }
      } catch (err) {
        console.warn('⚠️ Failed to emit health event:', err);
      }

      console.log('✅ SystemHealthMonitor metrics updated:', metrics);
      return metrics;

    } catch (err) {
      console.error('❌ SystemHealthMonitor.updateMetrics() failed:', err);
      return this._getDefaultMetrics();
    }
  },

  // 获取健康摘要
  getHealthSummary() {
    try {
      const m = this.getMetrics();
      const avg = (m.learningEfficiency + m.retentionEffectiveness + m.taskCompletionRate +
                   m.agentCoordinationEfficiency + m.graphOptimizationScore) / 5;
      return { 
        metrics: m, 
        overall: Math.round(avg),
        status: avg >= 80 ? 'healthy' : avg >= 60 ? 'degraded' : 'critical'
      };
    } catch (err) {
      console.warn('⚠️ Failed to get health summary:', err);
      return {
        metrics: this._getDefaultMetrics(),
        overall: 81,
        status: 'healthy'
      };
    }
  },

  // 获取单个指标
  getMetric(name) {
    try {
      const metrics = this.getMetrics();
      return metrics[name] ?? null;
    } catch (err) {
      console.warn(`⚠️ Failed to get metric "${name}":`, err);
      return null;
    }
  },

  // 获取系统状态
  getSystemStatus() {
    const summary = this.getHealthSummary();
    return {
      status: summary.status,
      overall: summary.overall,
      timestamp: new Date().toISOString(),
      details: summary.metrics
    };
  },

  // 检查系统是否健康
  isHealthy() {
    const summary = this.getHealthSummary();
    return summary.overall >= 70;
  },

  // 销毁（清理定时器）
  destroy() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    this.initialized = false;
    console.log('💚 SystemHealthMonitor destroyed');
  }
};

// 自动初始化
LawAIApp.SystemHealthMonitor.init();

console.log('💚 SystemHealthMonitor V1.0 ready');
