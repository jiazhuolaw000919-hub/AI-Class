// app.js - 应用主入口（Phase 2 完整升级版）
// ✅ 保留 Phase 1 全部旧功能：主题初始化、路由初始化、模板预填充、初始页面加载
// ✅ 新增 Phase 2 功能：存储引擎初始化、课程数据生成、进度恢复、收藏夹初始化、首次使用检测

(function() {
  // ========== Phase 1 原有：主题初始化 ==========
  LawAIApp.Theme.init();

  // ========== Phase 2 新增：存储引擎统一初始化 ==========
  // 确保主题设置已持久化（兼容新旧存储方式）
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

  // ========== Phase 2 新增：生成全部 365 节课数据（首次运行自动创建） ==========
  if (LawAIApp.LessonEngine) {
    LawAIApp.LessonEngine.generateAllLessons();
  }

  // ========== Phase 2 新增：初始化进度数据（首次运行创建默认进度对象） ==========
  if (LawAIApp.StorageEngine) {
    if (!LawAIApp.StorageEngine.get('progress')) {
      const defaultProgress = {
        completedLessons: [],
        currentLesson: 1,
        completionPercent: 0,
        currentStage: 'Foundation',
        xp: 0,
        totalLessons: 365
      };
      LawAIApp.StorageEngine.set('progress', defaultProgress);
    }
  } else {
    // 兜底：使用 Phase 1 旧版 Storage
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

  // ========== Phase 2 新增：同步旧版已完成课程数据到新引擎 ==========
  // 如果用户有旧版 completedLessons 数据（Phase 1 格式），迁移到新进度引擎
  const oldCompleted = LawAIApp.Storage.get('completedLessons');
  if (oldCompleted && oldCompleted.length > 0) {
    if (LawAIApp.StorageEngine) {
      const currentProgress = LawAIApp.StorageEngine.get('progress');
      // 合并旧数据（去重）
      const merged = [...new Set([...currentProgress.completedLessons, ...oldCompleted])];
      if (merged.length !== currentProgress.completedLessons.length) {
        currentProgress.completedLessons = merged;
        currentProgress.completionPercent = (merged.length / 365) * 100;
        
        // 更新当前课程为第一个未完成的
        const allLessons = LawAIApp.LessonEngine 
          ? LawAIApp.LessonEngine.getAllLessons() 
          : LawAIApp.Data.generateLessons();
        const allIds = allLessons.map(l => l.lessonId || `day-${l.id}`);
        const nextIdx = allIds.findIndex(id => !merged.includes(id));
        currentProgress.currentLesson = nextIdx !== -1 ? (nextIdx + 1) : 365;
        
        // 更新 XP（根据已完成课程估算）
        currentProgress.xp = merged.reduce((total, lessonId) => {
          const dayMatch = lessonId.match(/day-(\d+)/) || lessonId.match(/^(\d+)$/);
          const day = dayMatch ? parseInt(dayMatch[1]) : 1;
          return total + (20 + Math.floor(day / 5));
        }, 0);
        
        LawAIApp.StorageEngine.set('progress', currentProgress);
      }
      // 清除旧格式数据（已完成迁移）
      LawAIApp.Storage.remove('completedLessons');
    }
  }

  // ========== Phase 1 原有：模板预填充（离线兼容） ==========
  // Pre‑populate templates from pages/ folder content (for offline fallback)
  // In real server, this would be fetched. For direct file open, we embed.
  const templates = {
    dashboard: document.getElementById('template-dashboard'),
    learning: document.getElementById('template-learning'),
    calendar: document.getElementById('template-calendar'),
    notes: document.getElementById('template-notes'),
    tools: document.getElementById('template-tools'),
    prompt: document.getElementById('template-prompt'),
    settings: document.getElementById('template-settings')
  };

  // Dummy innerHTML placeholders (the router will replace on load, but we need valid templates)
  Object.keys(templates).forEach(key => {
    if (templates[key] && !templates[key].content.childNodes.length) {
      templates[key].innerHTML = `<div>Loading ${key}...</div>`;
    }
  });

  // ========== Phase 1 原有：路由初始化 ==========
  LawAIApp.Router.init();

  // ========== Phase 2 新增：应用启动日志 ==========
  console.log('🚀 Law AI Academy - Phase 2 已启动');
  console.log('📚 课程数据:', LawAIApp.LessonEngine ? '已加载引擎' : '使用假数据');
  console.log('💾 存储系统:', LawAIApp.StorageEngine ? 'StorageEngine' : 'Legacy Storage');
  
  // 输出当前学习状态
  const progress = LawAIApp.ProgressEngine 
    ? LawAIApp.ProgressEngine.getProgress() 
    : LawAIApp.Storage.get('progress');
  if (progress) {
    console.log(`📊 进度: ${progress.completedLessons.length}/365 课 | ⭐ ${progress.xp} XP | 🎯 ${progress.currentStage}`);
  }

  // ========== Phase 1 原有：初始加载 Dashboard 页面 ==========
  LawAIApp.Router.loadPage('dashboard');

  // ========== Phase 2 新增：首次访问欢迎提示 ==========
  const hasVisited = LawAIApp.StorageEngine 
    ? LawAIApp.StorageEngine.get('hasVisited', false)
    : LawAIApp.Storage.get('hasVisited', false);
  
  if (!hasVisited) {
    // 延迟显示，等页面渲染完成
    setTimeout(() => {
      console.log('👋 欢迎首次使用 Law AI Academy！');
      console.log('📖 前往 Learning 页面开始你的第一节课吧');
    }, 500);
    
    // 标记已访问
    if (LawAIApp.StorageEngine) {
      LawAIApp.StorageEngine.set('hasVisited', true);
    } else {
      LawAIApp.Storage.set('hasVisited', true);
    }
  }

})();
  // Initial load
  LawAIApp.Router.loadPage('dashboard');
})();
