// lessonActions.js
LawAIApp.LessonActions = {
  openLesson(lessonId) {
    LawAIApp.LessonEvents.onLessonOpened(lessonId);
    // 导航到 lesson 页面（使用现有 Router）
    const day = parseInt(lessonId.split('-')[1]);
    if (!isNaN(day)) LawAIApp.Router.navigate('lesson', { day });
  },

  completeLesson(lessonId) {
    // 先保存笔记（若需要，由 completion module 处理）
    LawAIApp.LessonEvents.onLessonCompleted(lessonId);
  },

  restartLesson(lessonId) {
    // 重置进度（从已完成中移除），这里留简单实现：清除该课程完成状态
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
