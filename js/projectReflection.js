// projectReflection.js
LawAIApp.ProjectReflection = {
  // 生成项目完成后的反思问题（模拟，未来可用AI生成）
  generateQuestions(projectId) {
    const project = LawAIApp.ProjectTracker.getProject(projectId);
    if (!project) return [];

    return [
      `What was the most challenging part of "${project.title}"?`,
      `How does this project connect to your learning goals?`,
      `What would you do differently if you built it again?`,
      `Which skills did you improve through this project?`
    ];
  },

  // 保存反思内容
  saveReflection(projectId, answers) {
    const project = LawAIApp.ProjectTracker.getProject(projectId);
    if (!project) return false;
    project.progress.reflection = JSON.stringify(answers);
    LawAIApp.ProjectTracker._save(LawAIApp.ProjectTracker._getStore());
    return true;
  }
};
