// progressStorage.js
LawAIApp.ProgressStorage = {
  // 获取传统整体进度对象（兼容旧代码）
  getOverallProgress() {
    return LawAIApp.StorageEngine.get('progress', {
      completedLessons: [],
      currentLesson: 1,
      completionPercent: 0,
      currentStage: 'Foundation',
      xp: 0,
      totalLessons: 365
    });
  },

  saveOverallProgress(progress) {
    LawAIApp.StorageEngine.set('progress', progress);
  },

  // 获取所有单项进度记录（新模型）
  getRecords() {
    return LawAIApp.StorageEngine.get('progress_records', {});
  },

  saveRecords(records) {
    LawAIApp.StorageEngine.set('progress_records', records);
  },

  // 获取特定 Lesson 的进度记录
  getLessonRecord(lessonId) {
    const records = this.getRecords();
    return records[lessonId] || null;
  },

  // 创建或更新 Lesson 进度记录
  upsertLessonRecord(record) {
    const records = this.getRecords();
    records[record.lessonId] = { ...records[record.lessonId], ...record, updatedAt: new Date().toISOString() };
    this.saveRecords(records);
    return records[record.lessonId];
  },

  // 清除所有进度（重置）
  resetAll() {
    LawAIApp.StorageEngine.remove('progress');
    LawAIApp.StorageEngine.remove('progress_records');
  }
};
