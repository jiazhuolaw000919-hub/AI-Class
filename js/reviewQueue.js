// reviewQueue.js
LawAIApp.ReviewQueue = {
  // 基于完成日期和间隔生成复习时间点
  generateSchedule(lessonId) {
    const now = new Date();
    const intervals = [1, 3, 7, 30]; // 天
    return intervals.map(d => {
      const date = new Date(now.getTime() + d * 86400000);
      return { lessonId, date: date.toISOString(), interval: d, done: false };
    });
  },

  // 获取某个课程的所有复习任务
  getLessonReviews(lessonId) {
    const all = LawAIApp.StorageEngine.get('reviewQueue', []);
    return all.filter(r => r.lessonId === lessonId);
  },

  // 完成课程后自动创建复习任务
  addLessonToReview(lessonId) {
    const existing = this.getLessonReviews(lessonId);
    if (existing.length > 0) return; // 避免重复创建
    const tasks = this.generateSchedule(lessonId);
    const queue = LawAIApp.StorageEngine.get('reviewQueue', []);
    LawAIApp.StorageEngine.set('reviewQueue', [...queue, ...tasks]);
  },

  // 标记某个复习任务为完成
  completeReviewTask(lessonId, date) {
    const queue = LawAIApp.StorageEngine.get('reviewQueue', []);
    const updated = queue.map(r => {
      if (r.lessonId === lessonId && r.date === date) {
        return { ...r, done: true };
      }
      return r;
    });
    LawAIApp.StorageEngine.set('reviewQueue', updated);
  },

  // 获取今日需要复习的课程 ID
  getTodayReviews() {
    const queue = LawAIApp.StorageEngine.get('reviewQueue', []);
    const today = new Date().toDateString();
    return queue
      .filter(r => new Date(r.date).toDateString() === today && !r.done)
      .map(r => r.lessonId);
  }
};
