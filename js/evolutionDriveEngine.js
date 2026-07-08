// ===========================================
// evolutionDriveEngine.js
// 进化驱动引擎：根据文明状态自动调整进化方向
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.EvolutionDriveEngine = {
  // 当前进化焦点（系统会自动选择最需要改进的维度）
  currentFocus: 'efficiency',
  initialized: false,
  _intervalId: null,
  _isRunning: false,

  /**
   * =========================
   * 初始化
   * =========================
   */

  init() {
    if (this.initialized) {
      console.log('🔄 EvolutionDriveEngine already initialized');
      return;
    }

    console.log('🚀 EvolutionDriveEngine initializing...');
    this.initialized = true;

    try {
      this.start();
      console.log('✅ EvolutionDriveEngine initialized successfully');
    } catch (err) {
      console.error('❌ EvolutionDriveEngine init failed:', err);
      this.initialized = false;
    }
  },

  /**
   * =========================
   * 安全获取指标（带防御）
   * =========================
   */

  _safeGetMetrics() {
    try {
      if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getMetrics === 'function') {
        const metrics = LawAIApp.SystemHealthMonitor.getMetrics();
        if (metrics && typeof metrics === 'object') {
          return metrics;
        }
      }
      console.warn('⚠️ SystemHealthMonitor not ready, using default metrics');
      return this._getDefaultMetrics();
    } catch (err) {
      console.warn('⚠️ Failed to get metrics:', err);
      return this._getDefaultMetrics();
    }
  },

  _getDefaultMetrics() {
    return {
      learningEfficiency: 80,
      retentionEffectiveness: 80,
      taskCompletionRate: 75,
      agentCoordinationEfficiency: 70,
      graphOptimizationScore: 75
    };
  },

  /**
   * =========================
   * 安全事件触发（带防御）
   * =========================
   */

  _safeEmit(eventName, data) {
    try {
      if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
        LawAIApp.EventBus.emit(eventName, data);
        return true;
      }
      // 备选：使用自定义事件
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      return true;
    } catch (err) {
      console.warn(`⚠️ Failed to emit event "${eventName}":`, err);
      return false;
    }
  },

  /**
   * =========================
   * 安全调用方法（带防御）
   * =========================
   */

  _safeCall(obj, methodName, ...args) {
    try {
      if (obj && typeof obj[methodName] === 'function') {
        return obj[methodName](...args);
      }
      console.warn(`⚠️ ${obj?.constructor?.name || 'Object'}.${methodName} not available`);
      return null;
    } catch (err) {
      console.warn(`⚠️ Failed to call ${methodName}:`, err);
      return null;
    }
  },

  /**
   * =========================
   * 根据系统健康指标确定进化优先级
   * =========================
   */

  determineFocus() {
    console.log('🎯 EvolutionDriveEngine determining focus...');

    try {
      const health = this._safeGetMetrics();
      
      // 确保所有分数都有默认值
      const scores = {
        efficiency: health.learningEfficiency ?? 80,
        memory: health.retentionEffectiveness ?? 80,
        taskCompletion: health.taskCompletionRate ?? 75,
        agentCoordination: health.agentCoordinationEfficiency ?? 70,
        graphOptimization: health.graphOptimizationScore ?? 75
      };

      // 检查是否有任何分数低于阈值
      const entries = Object.entries(scores);
      const lowEntries = entries.filter(([, value]) => value < 60);
      
      if (lowEntries.length === 0) {
        // 所有指标都健康，选择相对最低的
        const sorted = entries.sort((a, b) => a[1] - b[1]);
        this.currentFocus = sorted[0][0];
        console.log(`✅ All metrics healthy, focusing on: ${this.currentFocus} (${Math.round(sorted[0][1])}%)`);
      } else {
        // 选择最低的指标
        const lowest = lowEntries.sort((a, b) => a[1] - b[1])[0];
        this.currentFocus = lowest[0];
        console.log(`⚠️ Low metric detected, focusing on: ${this.currentFocus} (${Math.round(lowest[1])}%)`);
      }

      // 触发进化操作
      this.triggerEvolution(this.currentFocus);

      // 触发事件
      this._safeEmit('EvolutionFocusChanged', { 
        focus: this.currentFocus, 
        scores,
        timestamp: new Date().toISOString()
      });

      return this.currentFocus;

    } catch (err) {
      console.error('❌ Failed to determine focus:', err);
      // 默认回到效率模式
      this.currentFocus = 'efficiency';
      return this.currentFocus;
    }
  },

  /**
   * =========================
   * 触发进化操作（带防御）
   * =========================
   */

  triggerEvolution(focus) {
    console.log(`⚡ Triggering evolution for focus: ${focus}`);

    try {
      switch (focus) {
        case 'efficiency':
          this._safeCall(LawAIApp.SelfImprovementEngine, 'performSelfHealing');
          break;

        case 'memory':
          this._safeCall(LawAIApp.GraphSignalProcessor, 'reinforceRecent');
          // 备选：如果 GraphSignalProcessor 不存在，尝试其他方式
          if (!LawAIApp.GraphSignalProcessor) {
            console.warn('⚠️ GraphSignalProcessor not available, using fallback memory reinforcement');
            this._safeCall(LawAIApp.MemoryScheduler, 'scheduleReview');
          }
          break;

        case 'taskCompletion':
          // 降低任务难度
          this._safeCall(LawAIApp.StorageEngine, 'set', 'preferred_task_difficulty', 'low');
          // 触发任务重新生成
          this._safeCall(LawAIApp.TaskGenerationEngine, 'generateTasks');
          break;

        case 'agentCoordination':
          // 重置代理权重
          try {
            if (LawAIApp.AgentConsensusEngine && LawAIApp.AgentConsensusEngine._voters) {
              const voters = LawAIApp.AgentConsensusEngine._voters;
              if (Array.isArray(voters)) {
                voters.forEach(v => { if (v) v.weight = 1; });
                console.log(`✅ Reset weights for ${voters.length} voters`);
              }
            } else {
              console.warn('⚠️ AgentConsensusEngine._voters not available');
            }
          } catch (err) {
            console.warn('⚠️ Failed to reset agent weights:', err);
          }
          break;

        case 'graphOptimization':
          // 优化图谱
          this._safeCall(LawAIApp.GraphSignalProcessor, 'reinforceRecent');
          // 备选：使用其他图谱优化方法
          this._safeCall(LawAIApp.GraphOptimizer, 'optimize');
          break;

        default:
          console.warn(`⚠️ Unknown focus type: ${focus}, using efficiency`);
          this._safeCall(LawAIApp.SelfImprovementEngine, 'performSelfHealing');
      }

      // 记录进化事件
      this._safeEmit('EvolutionTriggered', { 
        focus, 
        timestamp: new Date().toISOString() 
      });

    } catch (err) {
      console.error(`❌ Failed to trigger evolution for ${focus}:`, err);
    }
  },

  /**
   * =========================
   * 获取所有维度的健康评分
   * =========================
   */

  getScores() {
    try {
      const health = this._safeGetMetrics();
      return {
        efficiency: health.learningEfficiency ?? 80,
        memory: health.retentionEffectiveness ?? 80,
        taskCompletion: health.taskCompletionRate ?? 75,
        agentCoordination: health.agentCoordinationEfficiency ?? 70,
        graphOptimization: health.graphOptimizationScore ?? 75
      };
    } catch (err) {
      console.warn('⚠️ Failed to get scores:', err);
      return this._getDefaultMetrics();
    }
  },

  /**
   * =========================
   * 获取当前焦点信息
   * =========================
   */

  getCurrentFocusInfo() {
    const scores = this.getScores();
    return {
      focus: this.currentFocus,
      score: scores[this.currentFocus] ?? 0,
      allScores: scores,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * =========================
   * 手动设置焦点
   * =========================
   */

  setFocus(focus) {
    const validFoci = ['efficiency', 'memory', 'taskCompletion', 'agentCoordination', 'graphOptimization'];
    if (!validFoci.includes(focus)) {
      console.warn(`⚠️ Invalid focus: ${focus}, must be one of: ${validFoci.join(', ')}`);
      return false;
    }

    console.log(`🎯 Manually setting focus to: ${focus}`);
    this.currentFocus = focus;
    this.triggerEvolution(focus);
    this._safeEmit('EvolutionFocusChanged', { 
      focus, 
      source: 'manual',
      timestamp: new Date().toISOString()
    });
    return true;
  },

  /**
   * =========================
   * 启动定期检查（每15分钟）
   * =========================
   */

  start() {
    if (this._isRunning) {
      console.log('🔄 EvolutionDriveEngine already running');
      return;
    }

    console.log('🚀 Starting EvolutionDriveEngine...');

    // 清除旧定时器
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._isRunning = true;

    // 立即执行一次
    try {
      this.determineFocus();
    } catch (err) {
      console.warn('⚠️ Initial focus determination failed:', err);
    }

    // 每15分钟检查一次
    this._intervalId = setInterval(() => {
      try {
        if (!this._isRunning) return;
        this.determineFocus();
      } catch (err) {
        console.warn('⚠️ Evolution cycle failed:', err);
      }
    }, 900000); // 15分钟

    console.log('✅ EvolutionDriveEngine started (interval: 15min)');
  },

  /**
   * =========================
   * 停止定期检查
   * =========================
   */

  stop() {
    console.log('🛑 Stopping EvolutionDriveEngine...');
    this._isRunning = false;
    
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    
    console.log('✅ EvolutionDriveEngine stopped');
  },

  /**
   * =========================
   * 手动触发一次进化（不改变焦点）
   * =========================
   */

  manualEvolve(focus) {
    const target = focus || this.currentFocus || 'efficiency';
    console.log(`🔧 Manual evolution triggered for: ${target}`);
    this.triggerEvolution(target);
    return target;
  },

  /**
   * =========================
   * 销毁（清理资源）
   * =========================
   */

  destroy() {
    console.log('🚀 EvolutionDriveEngine destroying...');
    this.stop();
    this.initialized = false;
    this._isRunning = false;
    console.log('✅ EvolutionDriveEngine destroyed');
  }
};

// ===========================================
// 自动初始化
// ===========================================

setTimeout(() => {
  try {
    if (LawAIApp.EvolutionDriveEngine && typeof LawAIApp.EvolutionDriveEngine.init === 'function') {
      LawAIApp.EvolutionDriveEngine.init();
    } else {
      console.warn('⚠️ EvolutionDriveEngine not ready for auto-start');
    }
  } catch (err) {
    console.warn('⚠️ EvolutionDriveEngine auto-start failed:', err);
  }
}, 3000);

console.log('🚀 EvolutionDriveEngine V1.0 ready');
