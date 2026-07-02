// app.js - 应用主入口（Phase 11 升级版）
// ✅ 保留 Phase 1 + Phase 2 全部功能
// ✅ 新增：注册 Core Learning Engine 事件监听器

(function() {
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

  // ========== Phase 2 新增：初始化进度数据 ==========
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

  // ========== Phase 2 新增：初始化连续签到数据 ==========
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

  // ========== Phase 2 新增：同步旧版已完成课程数据 ==========
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

  // ========== Phase 2 新增：应用启动日志 ==========
  console.log('🚀 Law AI Academy - Phase 11 已启动');
  console.log('📚 课程数据:', LawAIApp.LessonEngine ? '已加载引擎' : '使用假数据');
  console.log('💾 存储系统:', LawAIApp.StorageEngine ? 'StorageEngine' : 'Legacy Storage');
  
  const progress = LawAIApp.ProgressEngine 
    ? LawAIApp.ProgressEngine.getProgress() 
    : LawAIApp.Storage.get('progress');
  if (progress) {
    console.log(`📊 进度: ${progress.completedLessons.length}/365 课 | ⭐ ${progress.xp} XP | 🎯 ${progress.currentStage}`);
  }

  // ========== Phase 11 新增：注册 Core Learning Engine 事件监听 ==========
  (function registerCLEListeners() {
    if (!LawAIApp.EventBus) {
      console.warn('EventBus 未加载，跳过 CLE 事件注册');
      return;
    }
    // 课程完成事件 → 触发完整的事件流（进度、成就、复习等）
    LawAIApp.EventBus.on('lessonCompleted', function(data) {
      if (LawAIApp.LessonEvents && LawAIApp.LessonEvents.onLessonCompleted) {
        LawAIApp.LessonEvents.onLessonCompleted(data.lessonId);
      }
    });
    // 状态变化日志（可用于调试）
    LawAIApp.EventBus.on('stateChanged', function(data) {
      console.log('CLE state:', data.state);
    });
  })();

  // ========== Phase 1 原有：初始加载 Dashboard ==========
  LawAIApp.Router.loadPage('dashboard');

  // ========== Phase 2 新增：首次访问欢迎提示 ==========
  const hasVisited = LawAIApp.StorageEngine 
    ? LawAIApp.StorageEngine.get('hasVisited', false)
    : LawAIApp.Storage.get('hasVisited', false);
  
  if (!hasVisited) {
    setTimeout(() => {
      console.log('👋 欢迎首次使用 Law AI Academy！');
      console.log('📖 前往 Learning 页面开始你的第一节课吧');
    }, 500);
    
    if (LawAIApp.StorageEngine) {
      LawAIApp.StorageEngine.set('hasVisited', true);
    } else {
      LawAIApp.Storage.set('hasVisited', true);
    }
  }

})();
