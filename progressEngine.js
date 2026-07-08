// progressEngine.js (Phase 14 修正版 + 防御性检查)

// 确保 LawAIApp 存在
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
      totalLessons: 365
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
      if (LawAIApp.ProgressEvents && typeof LawAIApp.ProgressEvents.emit === 'function') {
        LawAIApp.ProgressEvents.emit(eventName, data);
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

  // 供 XPEngine 更新总 XP
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

  // 获取当前 XP
  getXP() {
    try {
      const prog = this.getProgress();
      return prog.xp || 0;
    } catch (err) {
      console.warn('⚠️ Failed to get XP:', err);
      return 0;
    }
  },

  // 完成一节课
  completeLesson(lessonId) {
    console.log(`📚 ProgressEngine completing lesson: ${lessonId}`);
    
    try {
      // ===========================================
      // 1. 防御性检查：LessonEngine
      // ===========================================
      if (!LawAIApp.LessonEngine || typeof LawAIApp.LessonEngine.getAllLessons !== 'function') {
        console.warn('⚠️ LessonEngine not ready, cannot complete lesson');
        return null;
      }

      const allLessons = LawAIApp.LessonEngine.getAllLessons();
      if (!allLessons || !Array.isArray(allLessons) || allLessons.length === 0) {
        console.warn('⚠️ No lessons available');
        return null;
      }

      const lesson = allLessons.find(l => l && l.lessonId === lessonId);
      if (!lesson) {
        console.warn(`⚠️ Lesson not found: ${lessonId}`);
        return null;
      }

      // ===========================================
      // 2. 获取进度
      // ===========================================
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

      // ===========================================
      // 3. 更新完成列表
      // ===========================================
      prog.completedLessons.push(lessonId);
      
      const totalLessons = prog.totalLessons || 365;
      prog.completionPercent = Math.min(100, Math.round((prog.completedLessons.length / totalLessons) * 100));

      // ===========================================
      // 4. 标记课程已完成
      // ===========================================
      try {
        if (lesson && typeof lesson === 'object') {
          lesson.completed = true;
          lesson.completedDate = new Date().toISOString();
          if (allLessons && Array.isArray(allLessons) && lesson.day && lesson.day >= 1 && lesson.day <= allLessons.length) {
            allLessons[lesson.day - 1] = lesson;
            this._safeSet('allLessons', allLessons);
          }
        }
      } catch (err) {
        console.warn('⚠️ Failed to update lesson status:', err);
      }

      // ===========================================
      // 5. 更新当前课程
      // ===========================================
      try {
        const allIds = allLessons.map(l => l && l.lessonId).filter(Boolean);
        const nextIdx = allIds.findIndex(id => !prog.completedLessons.includes(id));
        prog.currentLesson = nextIdx !== -1 ? (allLessons[nextIdx]?.day || 1) : 365;
      } catch (err) {
        console.warn('⚠️ Failed to find next lesson:', err);
        prog.currentLesson = 1;
      }

      // ===========================================
      // 6. 更新阶段
      // ===========================================
      try {
        const currentLessonObj = allLessons[prog.currentLesson - 1];
        if (currentLessonObj && LawAIApp.LessonEngine && LawAIApp.LessonEngine.stages) {
          const stages = LawAIApp.LessonEngine.stages;
          if (Array.isArray(stages)) {
            const stage = stages.find(s => 
              s && s.range && 
              currentLessonObj.day >= s.range[0] && 
              currentLessonObj.day <= s.range[1]
            );
            prog.currentStage = stage ? stage.name : 'Advanced';
          } else {
            prog.currentStage = 'Advanced';
          }
        } else {
          prog.currentStage = 'Advanced';
        }
      } catch (err) {
        console.warn('⚠️ Failed to determine stage:', err);
        prog.currentStage = 'Advanced';
      }

      // ===========================================
      // 7. 保存进度
      // ===========================================
      this.saveProgress(prog);

      // ===========================================
      // 8. 保存到 ProgressStorage（新模型）
      // ===========================================
      try {
        if (LawAIApp.ProgressStorage && typeof LawAIApp.ProgressStorage.upsertLessonRecord === 'function') {
          LawAIApp.ProgressStorage.upsertLessonRecord({
            lessonId: lessonId,
            academyId: 'academy_ai',
            courseId: null,
            moduleId: null,
            status: 'completed',
            completionPercentage: 100,
            startedAt: lesson.completedDate,
            lastOpened: lesson.completedDate,
            completedAt: lesson.completedDate,
            elapsedTime: 0,
            attempts: 1,
            resumePosition: null,
            lastReview: null,
            favorite: false,
            bookmark: false
          });
        }
      } catch (err) {
        console.warn('⚠️ Failed to save to ProgressStorage:', err);
      }

      // ===========================================
      // 9. 发布事件
      // ===========================================
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

  // 获取完成百分比
  getCompletionPercent() {
    try {
      const prog = this.getProgress();
      return prog.completionPercent || 0;
    } catch (err) {
      console.warn('⚠️ Failed to get completion percent:', err);
      return 0;
    }
  },

  // 获取当前课程
  getCurrentLesson() {
    try {
      const prog = this.getProgress();
      return prog.currentLesson || 1;
    } catch (err) {
      console.warn('⚠️ Failed to get current lesson:', err);
      return 1;
    }
  },

  // 获取当前阶段
  getCurrentStage() {
    try {
      const prog = this.getProgress();
      return prog.currentStage || 'Foundation';
    } catch (err) {
      console.warn('⚠️ Failed to get current stage:', err);
      return 'Foundation';
    }
  },

  // 检查课程是否已完成
  isLessonCompleted(lessonId) {
    try {
      const prog = this.getProgress();
      return prog.completedLessons?.includes(lessonId) || false;
    } catch (err) {
      console.warn(`⚠️ Failed to check lesson ${lessonId}:`, err);
      return false;
    }
  },

  // 获取已完成课程列表
  getCompletedLessons() {
    try {
      const prog = this.getProgress();
      return prog.completedLessons || [];
    } catch (err) {
      console.warn('⚠️ Failed to get completed lessons:', err);
      return [];
    }
  },

  // 重置进度
  resetProgress() {
    try {
      this._safeSet('progress', null);
      console.log('🔄 Progress reset');
      return this.defaultProgress();
    } catch (err) {
      console.warn('⚠️ Failed to reset progress:', err);
      return this.defaultProgress();
    }
  }
};

// 自动初始化
LawAIApp.ProgressEngine.init();

console.log('📊 ProgressEngine V1.0 ready');
