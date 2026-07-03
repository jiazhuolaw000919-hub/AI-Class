// projectPlanner.js
LawAIApp.ProjectPlanner = {
  // 基于用户当前进度和知识，推荐一个项目
  recommendProject() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const stats = LawAIApp.StatisticsEngine.getDashboardSnapshot();
    const goals = LawAIApp.GoalEngine.getActiveGoals();

    // 如果接近完成 AI Foundation，推荐一个迷你项目
    if (prog.completionPercent >= 30 && prog.completionPercent < 60) {
      return {
        title: 'Build a Simple AI Assistant',
        description: 'Use prompt engineering and basic AI knowledge to create a helpful assistant.',
        academyIds: ['academy_ai'],
        requiredLessons: ['day-10', 'day-15', 'day-20'], // 示例课程ID
        difficulty: 'Beginner',
        estimatedHours: 4,
        skills: ['Prompt Engineering', 'AI Basics'],
        milestones: ['lessons_complete', 'practice_done', 'reflection_written']
      };
    }

    // 如果已完成大部分课程，推荐一个综合项目
    if (prog.completionPercent >= 60) {
      return {
        title: 'Automate a Business Process',
        description: 'Apply AI and automation skills to streamline a real-world task.',
        academyIds: ['academy_ai'],
        requiredLessons: ['day-30', 'day-50', 'day-80'],
        difficulty: 'Intermediate',
        estimatedHours: 10,
        skills: ['AI Automation', 'API Usage'],
        milestones: ['lessons_complete', 'project_built', 'reflection_written']
      };
    }

    // 默认推荐
    return {
      title: 'Explore AI Concepts',
      description: 'Create a document explaining key AI concepts learned so far.',
      academyIds: ['academy_ai'],
      requiredLessons: ['day-1', 'day-5'],
      difficulty: 'Beginner',
      estimatedHours: 2,
      skills: ['AI Understanding'],
      milestones: ['lessons_complete', 'reflection_written']
    };
  },

  // 根据目标生成关联项目（可扩展）
  generateFromGoal(goalId) {
    const goal = LawAIApp.GoalEngine.getActiveGoals().find(g => g.goalId === goalId);
    if (!goal) return null;
    // 简单映射：每个目标可生成一个同名项目
    return {
      title: `Project: ${goal.title}`,
      description: `Complete the goal "${goal.title}" by building a real project.`,
      academyIds: goal.academyIds || ['academy_ai'],
      requiredLessons: [],
      difficulty: 'Intermediate',
      estimatedHours: 5,
      skills: [],
      milestones: ['lessons_complete', 'reflection_written']
    };
  }
};
