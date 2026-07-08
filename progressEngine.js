// ===========================================
// progressEngine.js
// 进度引擎 - 追踪用户学习进度
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ProgressEngine = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('📊 ProgressEngine initialized');
    return this;
  },

  defaultProgress() {
    return {
      completedLessons: [],
      currentLesson: 1,
      completionPercent: 0,
      currentStage: 'Foundation',
      xp: 0,
      totalLessons: 365,
      day: 1,
      level: 1,
      streak: 0
    };
  },

  // ===========================================
  // 安全存储访问（带防御）
  // ===========================================
  
  _safeGet(key, defaultValue) {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
        return LawAIApp.StorageEngine.get(key, defaultValue);
      }
      console.warn(`⚠️ StorageEngine not ready, using default for "${key}"`);
      return defaultValue;
    } catch (err) {
      console.warn(`⚠️ Failed to get "${key}" from storage:`, err);
      return defaultValue;
    }
  },

  _safeSet(key, value) {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
        LawAIApp.StorageEngine.set(key, value);
        return true;
      }
      console.warn(`⚠️ StorageEngine not ready, cannot save "${key}"`);
      return false;
    } catch (err) {
      console.warn(`⚠️ Failed to save "${key}" to storage:`, err);
      return false;
    }
  },

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

  // ===========================================
  // 核心方法
  // ===========================================

  getProgress() {
    try {
      const stored = this._safeGet('progress', null);
      const defaults = this.defaultProgress();
      if (stored && typeof stored === 'object') {
        return { ...defaults, ...stored };
      }
      return defaults;
    } catch (err) {
      console.warn('⚠️ Failed to get progress:', err);
      return this.defaultProgress();
    }
  },

  saveProgress(progress) {
    try {
      if (!progress || typeof progress !== 'object') {
        console.warn('⚠️ Invalid progress data, not saving');
        return false;
      }
      return this._safeSet('progress', progress);
    } catch (err) {
      console.warn('⚠️ Failed to save progress:', err);
      return false;
    }
  },

  // 更新 XP
  setXP(totalXP) {
    try {
      const prog = this.getProgress();
      const xpValue = typeof totalXP === 'number' && !isNaN(totalXP) ? totalXP : 0;
      prog.xp = xpValue;
      return this.saveProgress(prog);
    } catch (err) {
      console.warn('⚠️ Failed to set XP:', err);
      return false;
    }
  },

  getXP() {
    try {
      const prog = this.getProgress();
      return prog.xp || 0;
    } catch (err) {
      console.warn('⚠️ Failed to get XP:', err);
      return 0;
    }
  },

  // 获取当前等级
  getLevel() {
    try {
      const prog = this.getProgress();
      return prog.level || 1;
    } catch (err) {
      console.warn('⚠️ Failed to get level:', err);
      return 1;
    }
  },

  // 获取当前 Day
  getDay() {
    try {
      const prog = this.getProgress();
      return prog.day || 1;
    } catch (err) {
      console.warn('⚠️ Failed to get day:', err);
      return 1;
    }
  },

  // 获取连续学习天数
  getStreak() {
    try {
      const prog = this.getProgress();
      return prog.streak || 0;
    } catch (err) {
      console.warn('⚠️ Failed to get streak:', err);
      return 0;
    }
  },

  // 完成一节课
  completeLesson(lessonId) {
    console.log(`📚 ProgressEngine completing lesson: ${lessonId}`);
    
    try {
      // 获取进度
      const prog = this.getProgress();
      if (!prog || typeof prog !== 'object') {
        console.warn('⚠️ Invalid progress state');
        return null;
      }

      // 确保 completedLessons 是数组
      if (!prog.completedLessons || !Array.isArray(prog.completedLessons)) {
        prog.completedLessons = [];
      }

      // 检查是否已完成
      if (prog.completedLessons.includes(lessonId)) {
        console.log(`📚 Lesson ${lessonId} already completed`);
        return prog;
      }

      // 更新完成列表
      prog.completedLessons.push(lessonId);
      
      const totalLessons = prog.totalLessons || 365;
      prog.completionPercent = Math.min(100, Math.round((prog.completedLessons.length / totalLessons) * 100));

      // 更新 Day（简单逻辑：完成课程数 + 1）
      prog.day = Math.min(365, prog.completedLessons.length + 1);
      
      // 更新等级（每 10 节课升一级）
      prog.level = Math.max(1, Math.floor(prog.completedLessons.length / 10) + 1);
      
      // 更新连续学习天数（简化版）
      prog.streak = Math.min(365, prog.completedLessons.length);

      // 更新当前课程
      prog.currentLesson = prog.day;

      // 更新阶段
      if (prog.day <= 30) {
        prog.currentStage = 'Foundation';
      } else if (prog.day <= 70) {
        prog.currentStage = 'Prompt Engineering';
      } else if (prog.day <= 120) {
        prog.currentStage = 'AI Tools';
      } else if (prog.day <= 220) {
        prog.currentStage = 'AI Development';
      } else if (prog.day <= 300) {
        prog.currentStage = 'Projects';
      } else {
        prog.currentStage = 'AI Business';
      }

      // 保存进度
      this.saveProgress(prog);

      // 发布事件
      this._safeEmit('LessonCompleted', { lessonId });
      this._safeEmit('ProgressUpdated', { lessonId, overall: prog });

      console.log(`✅ Lesson ${lessonId} completed! Progress: ${Math.round(prog.completionPercent)}%`);
      return prog;

    } catch (err) {
      console.error('❌ ProgressEngine.completeLesson() failed:', err);
      return null;
    }
  },

  getRemainingLessons() {
    try {
      const prog = this.getProgress();
      const total = prog.totalLessons || 365;
      const completed = prog.completedLessons?.length || 0;
      return Math.max(0, total - completed);
    } catch (err) {
      console.warn('⚠️ Failed to get remaining lessons:', err);
      return 365;
    }
  },

  getCompletionPercent() {
    try {
      const prog = this.getProgress();
      return prog.completionPercent || 0;
    } catch (err) {
      console.warn('⚠️ Failed to get completion percent:', err);
      return 0;
    }
  },

  getCurrentLesson() {
    try {
      const prog = this.getProgress();
      return prog.currentLesson || 1;
    } catch (err) {
      console.warn('⚠️ Failed to get current lesson:', err);
      return 1;
    }
  },

  getCurrentStage() {
    try {
      const prog = this.getProgress();
      return prog.currentStage || 'Foundation';
    } catch (err) {
      console.warn('⚠️ Failed to get current stage:', err);
      return 'Foundation';
    }
  },

  isLessonCompleted(lessonId) {
    try {
      const prog = this.getProgress();
      return prog.completedLessons?.includes(lessonId) || false;
    } catch (err) {
      console.warn(`⚠️ Failed to check lesson ${lessonId}:`, err);
      return false;
    }
  },

  getCompletedLessons() {
    try {
      const prog = this.getProgress();
      return prog.completedLessons || [];
    } catch (err) {
      console.warn('⚠️ Failed to get completed lessons:', err);
      return [];
    }
  },

  resetProgress() {
    try {
      this._safeSet('progress', null);
      console.log('🔄 Progress reset');
      return this.defaultProgress();
    } catch (err) {
      console.warn('⚠️ Failed to reset progress:', err);
      return this.defaultProgress();
    }
  },

  // 获取完整状态（供 UI 使用）
  getState() {
    try {
      const prog = this.getProgress();
      return {
        level: prog.level || 1,
        xp: prog.xp || 0,
        streak: prog.streak || 0,
        day: prog.day || 1,
        completionPercent: prog.completionPercent || 0,
        currentStage: prog.currentStage || 'Foundation',
        completedLessons: prog.completedLessons || [],
        totalLessons: prog.totalLessons || 365,
        remainingLessons: this.getRemainingLessons()
      };
    } catch (err) {
      console.warn('⚠️ Failed to get state:', err);
      return {
        level: 1,
        xp: 0,
        streak: 0,
        day: 1,
        completionPercent: 0,
        currentStage: 'Foundation',
        completedLessons: [],
        totalLessons: 365,
        remainingLessons: 365
      };
    }
  }
};

// ===========================================
// 自动初始化（延迟执行）
// ===========================================

setTimeout(function() {
  try {
    if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.init === 'function') {
      LawAIApp.ProgressEngine.init();
      console.log('✅ ProgressEngine auto-initialized');
    }
  } catch (err) {
    console.warn('⚠️ ProgressEngine auto-init failed:', err);
  }
}, 500);

console.log('📊 ProgressEngine V1.0 ready');
