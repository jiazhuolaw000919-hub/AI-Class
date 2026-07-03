// app.js - 应用主入口（Phase 13 升级版 → Season 1.5 稳定版）
// ✅ 保留 Phase 1 + Phase 2 全部功能
// ✅ 新增：注册 Core Learning Engine 事件监听器
// ✅ 新增：监听 LessonCompleted 事件，触发连续签到、成就、复习、第二大脑
// ✅ Season 1.5：不再生成假进度，所有数据初始为 0
// ✅ Season 1.5：添加全局错误捕获

(function() {
  // ========== Season 1.5 新增：全局错误监听 ==========
  window.addEventListener('error', function(e) {
    const errorLog = LawAIApp.StorageEngine 
      ? LawAIApp.StorageEngine.get('error_log', []) 
      : [];
    errorLog.push({
      message: e.message,
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      timestamp: new Date().toISOString()
    });
    // 只保留最近 20 条错误
    if (errorLog.length > 20) errorLog.shift();
    if (LawAIApp.StorageEngine) {
      LawAIApp.StorageEngine.set('error_log', errorLog);
    }
    console.error('🚨 Global error caught:', e.message, '@', e.filename, ':', e.lineno);
  });

  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise rejection:', e.reason);
  });

  // ========== Phase 1 原有：主题初始化 ==========
  LawAIApp.Theme.init();

  // ========== Phase 2 新增：存储引擎统一初始化 ==========
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('theme')) {
      LawAIApp.StorageEngine.set('theme', currentTheme);
    }
  } else {
    if (!LawAIApp.Storage.get('theme')) {
      LawAIApp.Storage.set('theme', currentTheme);
    }
  }

  // ========== Phase 2 新增：生成全部 365 节课数据 ==========
  if (LawAIApp.LessonEngine) {
    LawAIApp.LessonEngine.generateAllLessons();
  }

  // ========== Season 1.5 修改：初始化进度数据（只创建空结构，不生成假进度） ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('progress')) {
      LawAIApp.StorageEngine.set('progress', {
        completedLessons: [],
        currentLesson: 1,
        completionPercent: 0,
        currentStage: 'Foundation',
        xp: 0,
        totalLessons: 365
      });
    }
  } else {
    if (!LawAIApp.Storage.get('progress')) {
      LawAIApp.Storage.set('progress', {
        completedLessons: [],
        currentLesson: 1,
        completionPercent: 0,
        currentStage: 'Foundation',
        xp: 0,
        totalLessons: 365
      });
    }
  }

  // ========== Phase 2 新增：初始化收藏夹 ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('favorites')) {
      LawAIApp.StorageEngine.set('favorites', []);
    }
  } else {
    if (!LawAIApp.Storage.get('favorites')) {
      LawAIApp.Storage.set('favorites', []);
    }
  }

  // ========== Season 1.5 修改：初始化连续签到数据（保持为 0） ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('streakData')) {
      LawAIApp.StorageEngine.set('streakData', {
        currentStreak: 0,
        longestStreak: 0,
        lastLearningDate: null
      });
    }
  } else {
    if (!LawAIApp.Storage.get('streakData')) {
      LawAIApp.Storage.set('streakData', {
        currentStreak: 0,
        longestStreak: 0,
        lastLearningDate: null
      });
    }
  }

  // ========== Phase 2 新增：初始化成就数据 ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('unlockedAchievements')) {
      LawAIApp.StorageEngine.set('unlockedAchievements', []);
    }
  } else {
    if (!LawAIApp.Storage.get('unlockedAchievements')) {
      LawAIApp.Storage.set('unlockedAchievements', []);
    }
  }

  // ========== Season 1.5 修改：初始化 XP 数据（保持为 0） ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('xp_data')) {
      LawAIApp.StorageEngine.set('xp_data', {
        totalXP: 0,
        lifetimeXP: 0,
        currentLevel: 1
      });
    }
  }

  // ========== Phase 2 原有：同步旧版已完成课程数据（保留，但仅在有旧数据时执行） ==========
  const oldCompleted = LawAIApp.Storage.get('completedLessons');
  if (oldCompleted && oldCompleted.length > 0) {
    if (LawAIApp.StorageEngine) {
      const currentProgress = LawAIApp.StorageEngine.get('progress');
      const merged = [...new Set([...currentProgress.completedLessons, ...oldCompleted])];
      if (merged.length !== currentProgress.completedLessons.length) {
        currentProgress.completedLessons = merged;
        currentProgress.completionPercent = (merged.length / 365) * 100;
        
        const allLessons = LawAIApp.LessonEngine 
          ? LawAIApp.LessonEngine.getAllLessons() 
          : LawAIApp.Data.generateLessons();
        const allIds = allLessons.map(l => l.lessonId || `day-${l.id}`);
        const nextIdx = allIds.findIndex(id => !merged.includes(id));
        currentProgress.currentLesson = nextIdx !== -1 ? (nextIdx + 1) : 365;
        
        currentProgress.xp = merged.reduce((total, lessonId) => {
          const dayMatch = lessonId.match(/day-(\d+)/) || lessonId.match(/^(\d+)$/);
          const day = dayMatch ? parseInt(dayMatch[1]) : 1;
          return total + (20 + Math.floor(day / 5));
        }, 0);
        
        LawAIApp.StorageEngine.set('progress', currentProgress);
      }
      LawAIApp.Storage.remove('completedLessons');
    }
  }

  // ========== Phase 1 原有：模板预填充 ==========
  const templates = {
    dashboard: document.getElementById('template-dashboard'),
    learning: document.getElementById('template-learning'),
    calendar: document.getElementById('template-calendar'),
    notes: document.getElementById('template-notes'),
    tools: document.getElementById('template-tools'),
    prompt: document.getElementById('template-prompt'),
    settings: document.getElementById('template-settings')
  };

  Object.keys(templates).forEach(key => {
    if (templates[key] && !templates[key].content.childNodes.length) {
      templates[key].innerHTML = `<div>Loading ${key}...</div>`;
    }
  });

  // ========== Phase 1 原有：路由初始化 ==========
  LawAIApp.Router.init();

  // ========== Season 1.5 修改：应用启动日志（显示真实数据） ==========
  console.log('🚀 Law AI Academy - Season 1.5 Alpha 已启动');
  console.log('📚 课程数据:', LawAIApp.LessonEngine ? '已加载引擎（365 节课）' : '使用假数据');
  console.log('💾 存储系统:', LawAIApp.StorageEngine ? 'StorageEngine' : 'Legacy Storage');
  
  const progress = LawAIApp.ProgressEngine 
    ? LawAIApp.ProgressEngine.getProgress() 
    : (LawAIApp.StorageEngine ? LawAIApp.StorageEngine.get('progress') : LawAIApp.Storage.get('progress'));
  if (progress) {
    console.log(`📊 进度: ${progress.completedLessons.length}/365 课 | ⭐ ${progress.xp} XP | 🎯 ${progress.currentStage}`);
  }

  // ========== Phase 11 + Phase 13 新增：注册事件监听 ==========
  (function registerCLEListeners() {
    if (!LawAIApp.EventBus) {
      console.warn('EventBus 未加载，跳过 CLE 事件注册');
      return;
    }

    // ---- Phase 11 原有：小写 lessonCompleted（由 CoreLearningEngine 发出）----
    LawAIApp.EventBus.on('lessonCompleted', function(data) {
      if (LawAIApp.LessonEvents && LawAIApp.LessonEvents.onLessonCompleted) {
        LawAIApp.LessonEvents.onLessonCompleted(data.lessonId);
      }
    });

    // ---- Phase 13 新增：大写 LessonCompleted（由 ProgressEngine 发出）----
    LawAIApp.EventBus.on('LessonCompleted', function(data) {
      // 更新连续签到
      if (LawAIApp.StreakEngine) LawAIApp.StreakEngine.updateStreak();
      // 检查成就
      if (LawAIApp.AchievementEngine) LawAIApp.AchievementEngine.checkAll();
      // 添加到复习队列
      if (LawAIApp.ReviewQueue) LawAIApp.ReviewQueue.addLessonToReview(data.lessonId);
      // 创建第二大脑条目
      if (LawAIApp.SecondBrain) LawAIApp.SecondBrain.getEntry(data.lessonId);
    });

    // 状态变化日志（可用于调试）
    LawAIApp.EventBus.on('stateChanged', function(data) {
      console.log('CLE state:', data.state);
    });
  })();

  // ========== Phase 1 原有：初始加载 Dashboard ==========
  LawAIApp.Router.loadPage('dashboard');

  // ========== Season 1.5 修改：首次访问欢迎提示（数据初始为 0 的提示） ==========
  const hasVisited = LawAIApp.StorageEngine 
    ? LawAIApp.StorageEngine.get('hasVisited', false)
    : LawAIApp.Storage.get('hasVisited', false);
  
  if (!hasVisited) {
    setTimeout(() => {
      console.log('👋 欢迎首次使用 Law AI Academy！');
      console.log('📖 前往 Learning 页面开始你的第一节课吧');
      console.log('💡 所有进度从零开始，真实记录你的学习旅程');
    }, 500);
    
    if (LawAIApp.StorageEngine) {
      LawAIApp.StorageEngine.set('hasVisited', true);
    } else {
      LawAIApp.Storage.set('hasVisited', true);
    }
  }

  // ========== Season 1.5 新增：输出错误日志数量（如果有） ==========
  const errorLog = LawAIApp.StorageEngine 
    ? LawAIApp.StorageEngine.get('error_log', []) 
    : [];
  if (errorLog.length > 0) {
    console.warn(`⚠️ 检测到 ${errorLog.length} 条历史错误记录，可调用 LawAIApp.StorageEngine.get('error_log') 查看`);
  }

})();
