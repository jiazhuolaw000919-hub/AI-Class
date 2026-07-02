// lessonActions.js
LawAIApp.LessonActions = {
  openLesson(lessonId) {
    // 通过核心引擎开始学习（加载课程、创建会话、触发事件）
    LawAIApp.CoreLearningEngine.startLearning(lessonId);
    // 导航到 lesson 页面（保留原有路由跳转）
    const day = parseInt(lessonId.split('-')[1]);
    if (!isNaN(day)) LawAIApp.Router.navigate('lesson', { day });
  },

  completeLesson(lessonId) {
    // 先保存笔记（如果有）—— 保留原有笔记保存逻辑
    const noteArea = document.querySelector('.note-field');
    if (noteArea && noteArea.value.trim()) {
      this.addPersonalNote(lessonId, noteArea.value.trim());
    }
    // 通过核心引擎完成课程（会触发事件总线，进而触发 LessonEvents.onLessonCompleted）
    LawAIApp.CoreLearningEngine.completeLesson(lessonId);
  },

  restartLesson(lessonId) {
    // 重置进度（从已完成中移除）
    const prog = LawAIApp.ProgressEngine.getProgress();
    const idx = prog.completedLessons.indexOf(lessonId);
    if (idx !== -1) {
      prog.completedLessons.splice(idx, 1);
      prog.xp = Math.max(0, prog.xp - (LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]))?.xpReward || 0));
      prog.completionPercent = (prog.completedLessons.length / prog.totalLessons) * 100;
      LawAIApp.ProgressEngine.saveProgress(prog);
    }
    // 更新 allLessons 标记
    const all = LawAIApp.LessonEngine.getAllLessons();
    const lesson = all.find(l => l.lessonId === lessonId);
    if (lesson) {
      lesson.completed = false;
      lesson.completedDate = null;
      LawAIApp.StorageEngine.set('allLessons', all);
    }
  },

  bookmarkLesson(lessonId) {
    LawAIApp.LessonStorage.toggleBookmark(lessonId);
  },

  favoriteLesson(lessonId) {
    LawAIApp.LessonStorage.toggleFavorite(lessonId);
  },

  addPersonalNote(lessonId, note) {
    const all = LawAIApp.LessonEngine.getAllLessons();
    const lesson = all.find(l => l.lessonId === lessonId);
    if (lesson) {
      lesson.notes.push({ text: note, date: new Date().toISOString() });
      LawAIApp.StorageEngine.set('allLessons', all);
    }
  }
};
