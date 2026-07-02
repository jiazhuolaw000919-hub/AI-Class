// lessonStorage.js
LawAIApp.LessonStorage = {
  // 获取某节课的完整进度状态（从已有引擎中读取）
  getStatus(lessonId) {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const completed = prog.completedLessons.includes(lessonId);
    const current = prog.currentLesson === parseInt(lessonId.split('-')[1]); // 假设 lessonId 为 day-xxx
    const reviewQueue = LawAIApp.ReviewQueue.getTodayReviews();
    const needsReview = reviewQueue.includes(lessonId);
    const bookmarked = LawAIApp.Bookmark.isBookmarked(lessonId, 'lesson');
    const favorited = LawAIApp.Bookmark.isBookmarked(lessonId, 'lesson_favorite');

    return {
      completed,
      current,
      needsReview,
      bookmarked,
      favorited,
      completedDate: completed ? this._getCompletedDate(lessonId) : null
    };
  },

  _getCompletedDate(lessonId) {
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const lesson = allLessons.find(l => l.lessonId === lessonId);
    return lesson?.completedDate || null;
  },

  // 收藏
  toggleFavorite(lessonId) {
    LawAIApp.Bookmark.toggle(lessonId, 'lesson_favorite');
  },

  // 书签
  toggleBookmark(lessonId) {
    LawAIApp.Bookmark.toggle(lessonId, 'lesson');
  },

  // 获取某模块内所有课程的状态列表（用于列表显示）
  getModuleLessonStatuses(moduleId) {
    // 需要从 Learning Pack 中获取该模块的 lesson id 列表，这里暂时返回空，等后续集成
    return [];
  }
};
