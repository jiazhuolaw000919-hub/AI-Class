// projectEngine.js
LawAIApp.ProjectEngine = (function() {
  // 当课程完成时，自动更新相关项目进度
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    const lessonId = data.lessonId;
    const activeProjects = LawAIApp.ProjectTracker.getActiveProjects();
    activeProjects.forEach(project => {
      if (project.requiredLessons && project.requiredLessons.includes(lessonId)) {
        const newLessonsCompleted = (project.progress.lessonsCompleted || 0) + 1;
        LawAIApp.ProjectTracker.updateProgress(project.projectId, {
          lessonsCompleted: newLessonsCompleted
        });
      }
    });
  });

  // 当项目完成时，自动加入作品集
  LawAIApp.EventBus.on('ProjectFinished', (data) => {
    LawAIApp.PortfolioEngine.addToPortfolio(data.projectId);
    // 为AI导师生成反思提示（预留）
    const questions = LawAIApp.ProjectReflection.generateQuestions(data.projectId);
    if (questions.length > 0) {
      // 可以存储到某个地方供UI展示
      LawAIApp.StorageEngine.set(`project_reflection_${data.projectId}`, questions);
    }
  });

  return {
    create: (def) => LawAIApp.ProjectTracker.create(def),
    updateProgress: (projId, prog) => LawAIApp.ProjectTracker.updateProgress(projId, prog),
    getActiveProjects: () => LawAIApp.ProjectTracker.getActiveProjects(),
    getCompletedProjects: () => LawAIApp.ProjectTracker.getCompletedProjects(),
    recommend: () => LawAIApp.ProjectPlanner.recommendProject(),
    generateFromGoal: (goalId) => LawAIApp.ProjectPlanner.generateFromGoal(goalId),
    getPortfolio: () => LawAIApp.PortfolioEngine.getPortfolio(),
    getReflectionQuestions: (projId) => LawAIApp.ProjectReflection.generateQuestions(projId),
    saveReflection: (projId, answers) => LawAIApp.ProjectReflection.saveReflection(projId, answers)
  };
})();
