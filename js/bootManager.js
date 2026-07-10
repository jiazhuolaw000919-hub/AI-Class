// ================================================================
// bootManager.js – V2.0.0 - Async Startup Queue (Phase 0.1.1)
// 启动流程：关键任务立即执行，非关键任务延迟执行
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.BootManager = {
  _booted: false,
  _queue: [],
  _processing: false,

  /**
   * 启动管理器 - 异步队列启动
   * 关键任务立即执行，非关键任务通过队列延迟执行
   */
  async start() {
    if (this._booted) {
      console.log('🔄 BootManager already booted');
      return;
    }

    console.log('🚀 BootManager starting (async queue)...');
    const errors = [];

    // 1. 立即执行：发出启动事件（不阻塞）
    try {
      LawAIApp.EventBus?.emit?.('BootStarted');
    } catch (e) {
      // 忽略
    }

    // 2. 立即执行：验证引擎依赖（轻量，不阻塞）
    let missingEngines = [];
    try {
      if (LawAIApp.StartupValidator && typeof LawAIApp.StartupValidator.validate === 'function') {
        missingEngines = LawAIApp.StartupValidator.validate() || [];
        if (missingEngines.length > 0) {
          console.warn('⚠️ Missing engines:', missingEngines);
        }
      }
    } catch (e) {
      errors.push('Validator error: ' + e.message);
    }

    // ============================================================
    // 队列任务（延迟执行，不阻塞 UI）
    // ============================================================
    this._queue = [
      // 任务 1：加载学习包
      {
        id: 'load_packs',
        priority: 'background',
        fn: async () => {
          try {
            if (LawAIApp.LearningPack && LawAIApp.LPSRegistry) {
              if (!LawAIApp.LPSRegistry.isInstalled('academy_ai')) {
                const result = await LawAIApp.LearningPack.installDefaultPack();
                if (!result.success) {
                  console.warn('⚠️ Default pack install failed:', result.error || result.errors);
                }
              }
            }
          } catch (e) {
            console.warn('⚠️ Pack loading error:', e.message);
          }
        }
      },
      // 任务 2：构建知识关系图谱
      {
        id: 'build_relationships',
        priority: 'background',
        fn: async () => {
          try {
            if (LawAIApp.RelationshipEngine38 && typeof LawAIApp.RelationshipEngine38.init === 'function') {
              LawAIApp.RelationshipEngine38.init();
            }
          } catch (e) {
            console.warn('⚠️ Graph init error:', e.message);
          }
        }
      },
      // 任务 3：初始化 AI 导师
      {
        id: 'init_mentor',
        priority: 'background',
        fn: async () => {
          try {
            if (LawAIApp.MentorEngine && LawAIApp.MentorMemory) {
              LawAIApp.MentorMemory.refreshStrengths?.();
            }
          } catch (e) {
            console.warn('⚠️ Mentor init error:', e.message);
          }
        }
      },
      // 任务 4：构建运行时注册表
      {
        id: 'build_registry',
        priority: 'idle',
        fn: async () => {
          try {
            if (LawAIApp.RegistryBuilder && typeof LawAIApp.RegistryBuilder.build === 'function') {
              LawAIApp.RegistryBuilder.build();
            }
          } catch (e) {
            console.warn('⚠️ Registry build error:', e.message);
          }
        }
      },
      // 任务 5：恢复进度（仅当 ProgressEngine 存在）
      {
        id: 'restore_progress',
        priority: 'background',
        fn: async () => {
          try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
              LawAIApp.ProgressEngine.getProgress();
            }
          } catch (e) {
            console.warn('⚠️ Progress restore error:', e.message);
          }
        }
      },
      // 任务 6：生成启动报告
      {
        id: 'generate_report',
        priority: 'idle',
        fn: async () => {
          try {
            if (LawAIApp.BootReport && typeof LawAIApp.BootReport.generate === 'function') {
              const registry = LawAIApp.RegistryBuilder?.build?.() || {};
              LawAIApp.BootReport.generate(registry, missingEngines, errors);
            }
          } catch (e) {
            console.warn('⚠️ Boot report error:', e.message);
          }
        }
      }
    ];

    // 3. 立即执行：发出 Dashboard 就绪事件（不等待队列）
    try {
      LawAIApp.EventBus?.emit?.('DashboardReady');
    } catch (e) {
      // 忽略
    }

    console.log('✅ BootManager: Critical tasks complete, dashboard ready');

    // 4. 启动后台队列（不阻塞）
    this._processQueue();

    this._booted = true;
  },

  /**
   * 处理启动队列（使用 requestIdleCallback 或 setTimeout）
   */
  _processQueue: function() {
    if (this._processing) return;
    this._processing = true;

    console.log('📦 BootManager: Processing ' + this._queue.length + ' background tasks...');

    const scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 100); };

    let index = 0;
    const processNext = () => {
      if (index >= this._queue.length) {
        this._processing = false;
        console.log('✅ BootManager: All background tasks processed');
        LawAIApp.EventBus?.emit?.('BootComplete');
        return;
      }

      const task = this._queue[index];
      index++;

      // 使用 requestIdleCallback 或 setTimeout 调度
      scheduleFn(() => {
        try {
          // 如果是异步函数，等待完成
          const result = task.fn();
          if (result && typeof result.then === 'function') {
            result.catch(err => {
              console.warn('⚠️ Task "' + task.id + '" error:', err.message);
            });
          }
        } catch (err) {
          console.warn('⚠️ Task "' + task.id + '" error:', err.message);
        }
        // 继续下一个
        processNext();
      });
    };

    // 开始处理
    processNext();
  },

  /**
   * 获取启动状态
   */
  getStatus: function() {
    return {
      booted: this._booted,
      queueLength: this._queue.length,
      processing: this._processing
    };
  }
};

console.log('🚀 BootManager V2.0 loaded (async queue)');
