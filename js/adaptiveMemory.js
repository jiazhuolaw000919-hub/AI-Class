// adaptiveMemory.js
(function() {
  'use strict';

  // 等待 LawAIApp 和 EventBus 准备好
  function initAdaptiveMemory() {
    // 检查 EventBus 是否存在
    if (!window.LawAIApp || !window.LawAIApp.EventBus) {
      console.warn('[AdaptiveMemory] ⚠️ EventBus not available, retrying...');
      setTimeout(initAdaptiveMemory, 500);
      return;
    }

    // 如果已经初始化过了，跳过
    if (window.LawAIApp.AdaptiveMemory) {
      console.log('[AdaptiveMemory] Already initialized');
      return;
    }

    console.log('[AdaptiveMemory] 🚀 Initializing...');

    // 监听学习事件
    try {
      window.LawAIApp.EventBus.on('LessonCompleted', function(data) {
        console.log('[AdaptiveMemory] 📚 Lesson completed:', data);
        // 触发复习调度更新
        if (window.LawAIApp.MemoryScheduler && typeof window.LawAIApp.MemoryScheduler.recalculate === 'function') {
          window.LawAIApp.MemoryScheduler.recalculate();
        }
      });

      window.LawAIApp.EventBus.on('PracticeCompleted', function(data) {
        console.log('[AdaptiveMemory] ✏️ Practice completed:', data);
        // 练习完成后触发复习检查
        if (window.LawAIApp.MemoryReview && typeof window.LawAIApp.MemoryReview.checkDue === 'function') {
          window.LawAIApp.MemoryReview.checkDue();
        }
      });

      console.log('[AdaptiveMemory] ✅ Event listeners registered');
    } catch (e) {
      console.warn('[AdaptiveMemory] ⚠️ Failed to register events:', e);
    }

    // 每日检查并发出记忆警报
    setInterval(function() {
      try {
        if (window.LawAIApp.MemoryScheduler && typeof window.LawAIApp.MemoryScheduler.getAtRiskTopics === 'function') {
          var atRisk = window.LawAIApp.MemoryScheduler.getAtRiskTopics();
          if (atRisk && atRisk.length > 0) {
            console.log('[AdaptiveMemory] 🔔 Memory Alert: ' + atRisk.length + ' topics need attention.');
            
            // 触发事件通知其他模块
            if (window.LawAIApp.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
              window.LawAIApp.EventBus.emit('MemoryAlert', { atRiskCount: atRisk.length });
            }
          }
        }
      } catch (e) {
        console.warn('[AdaptiveMemory] ⚠️ Memory check failed:', e);
      }
    }, 3600000); // 每小时检查一次

    // 暴露 API
    window.LawAIApp.AdaptiveMemory = {
      dashboard: function() {
        if (window.LawAIApp.MemoryDashboard && typeof window.LawAIApp.MemoryDashboard.render === 'function') {
          return window.LawAIApp.MemoryDashboard.render();
        }
        console.warn('[AdaptiveMemory] ⚠️ MemoryDashboard not available');
        return null;
      },
      getScheduler: function() {
        return window.LawAIApp.MemoryScheduler || null;
      },
      getAnalytics: function() {
        return window.LawAIApp.MemoryAnalytics || null;
      },
      getStatus: function() {
        return {
          initialized: true,
          schedulerAvailable: !!(window.LawAIApp.MemoryScheduler),
          analyticsAvailable: !!(window.LawAIApp.MemoryAnalytics),
          dashboardAvailable: !!(window.LawAIApp.MemoryDashboard)
        };
      }
    };

    console.log('[AdaptiveMemory] ✅ Initialized successfully');
  }

  // 确保 LawAIApp 对象存在
  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  // 启动初始化（带重试机制）
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM 已就绪，立即尝试
    initAdaptiveMemory();
  } else {
    // 等待 DOM 就绪
    window.addEventListener('load', initAdaptiveMemory);
  }

  // 额外监听 EventBus 就绪事件（如果有的话）
  window.addEventListener('EVENTBUS_READY', initAdaptiveMemory);
  document.addEventListener('EVENTBUS_READY', initAdaptiveMemory);

})();
