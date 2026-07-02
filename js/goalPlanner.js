// goalPlanner.js
LawAIApp.GoalPlanner = {
  // 基于用户当前学习情况推荐一个合理的新目标
  recommendGoal() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const stats = LawAIApp.StatisticsEngine.getDashboardSnapshot();
    const path = LawAIApp.LearningPathEngine.getCurrentPath();

    // 示例：如果接近完成所有课程，推荐“完成AI学院”目标
    if (prog.completionPercent >= 80 && prog.completionPercent < 100) {
      return {
        title: 'Finish AI Academy',
        description: 'Complete the remaining lessons to master AI.',
        type: 'skill_development',
        priority: 'high',
        academyIds: ['academy_ai'],
        completionCondition: (goal) => LawAIApp.ProgressEngine.getProgress().completionPercent >= 100
      };
    }

    // 否则推荐“完成基础阶段”
    if (prog.currentStage === 'Foundation') {
      return {
        title: 'Complete AI Foundation',
        description: 'Finish all lessons in the Foundation stage.',
        type: 'skill_development',
        priority: 'normal',
        academyIds: ['academy_ai'],
        completionCondition: (goal) => {
          const p = LawAIApp.ProgressEngine.getProgress();
          return p.currentStage !== 'Foundation';
        }
      };
    }

    return {
      title: 'Keep Learning',
      description: 'Continue your daily learning habit.',
      type: 'custom',
      priority: 'low',
      academyIds: ['academy_ai']
    };
  },

  // 根据目标推荐每日任务数量
  suggestDailyTaskCount(goalId) {
    const goal = LawAIApp.GoalTracker.getProgress(goalId);
    if (!goal) return 1;
    // 简单逻辑：如果进度慢，建议增加任务
    return goal.completedLessons < 10 ? 2 : 1;
  }
};
