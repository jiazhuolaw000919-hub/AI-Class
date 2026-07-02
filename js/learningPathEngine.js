// learningPathEngine.js
LawAIApp.LearningPathEngine = {
  init() {
    LawAIApp.JourneyTracker.init();
    // 如果还没有路径，自动生成
    if (!LawAIApp.StorageEngine.get('current_path')) {
      LawAIApp.PathPlanner.generateDefaultPath();
    }
  },

  getCurrentPath() {
    return LawAIApp.StorageEngine.get('current_path', null);
  },

  generateNewPath(academyId) {
    return LawAIApp.PathPlanner.generateDefaultPath(academyId);
  },

  getCareerRecommendation() {
    return LawAIApp.CareerPathGenerator.getRecommendedCareer();
  },

  getJourneySummary() {
    return LawAIApp.JourneyTracker.getSummary();
  },

  getMilestones() {
    return LawAIApp.MilestoneEngine.getUnlockedMilestones();
  },

  // 手动调整路径（添加可选课程）
  addOptionalLesson(lessonId) {
    const path = LawAIApp.StorageEngine.get('current_path');
    if (path && !path.optionalLessons.includes(lessonId)) {
      path.optionalLessons.push(lessonId);
      LawAIApp.StorageEngine.set('current_path', path);
      LawAIApp.EventBus.emit('PathUpdated', { path });
    }
  }
};

// 启动时初始化
LawAIApp.LearningPathEngine.init();
