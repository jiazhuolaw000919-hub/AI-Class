// moduleProgress.js
LawAIApp.ModuleProgress = {
  _keyPrefix: 'moduleProgress_',

  get(moduleId) {
    const key = this._keyPrefix + moduleId;
    let progress = LawAIApp.StorageEngine.get(key);
    if (!progress) {
      progress = {
        moduleId: moduleId,
        started: false,
        completedLessons: [],
        completedPractices: [],   // ← 新增：支持记录已完成的实践 ID
        practiceCompleted: false,
        quizCompleted: false,
        reflectionCompleted: false,
        xpEarned: 0,
        studyTime: 0, // minutes
        lastOpened: null,
        completedDate: null
      };
      LawAIApp.StorageEngine.set(key, progress);
    }
    return progress;
  },

  save(moduleId, progress) {
    const key = this._keyPrefix + moduleId;
    LawAIApp.StorageEngine.set(key, progress);
  },

  markStarted(moduleId) {
    const p = this.get(moduleId);
    if (!p.started) {
      p.started = true;
      p.lastOpened = new Date().toISOString();
      this.save(moduleId, p);
      // 通知课程进度更新等（可扩展）
    }
  },

  completeLesson(moduleId, lessonId) {
    const p = this.get(moduleId);
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      p.studyTime += 10; // 假设每课10分钟
      this.save(moduleId, p);
    }
  },

  completePractice(moduleId) {
    const p = this.get(moduleId);
    if (!p.practiceCompleted) {
      p.practiceCompleted = true;
      p.studyTime += 15;
      this.save(moduleId, p);
    }
  },

  completeQuiz(moduleId, score) {
    const p = this.get(moduleId);
    p.quizCompleted = true;
    p.quizScore = score; // 0-100
    this.save(moduleId, p);
  },

  completeReflection(moduleId) {
    const p = this.get(moduleId);
    p.reflectionCompleted = true;
    this.save(moduleId, p);
  },

  isCompleted(moduleId) {
    const p = this.get(moduleId);
    const mod = LawAIApp.ModuleData.getById(moduleId);
    if (!mod) return false;
    return p.completedLessons.length >= mod.estimatedLessons &&
           p.practiceCompleted &&
           p.quizCompleted &&
           p.reflectionCompleted;
  }
};
