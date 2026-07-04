// goalRoadmap.js
LawAIApp.GoalRoadmap = {
  generateActionItems(goal) {
    const actions = [];
    if (!goal) return actions;
    const progress = LawAIApp.ProgressEngine.getProgress();
    const remainingLessons = 365 - progress.completedLessons.length;
    const weeksLeft = goal.deadline ? Math.max(1, Math.ceil((new Date(goal.deadline) - Date.now()) / (7 * 86400000))) : 4;

    const dailyLessons = Math.ceil(remainingLessons / (weeksLeft * 7));
    actions.push({
      type: 'lesson',
      priority: 'high',
      description: `Complete ${dailyLessons} lesson(s) today to stay on track.`,
      target: dailyLessons
    });

    const reviewCount = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.getTodayReviewList().length : 0;
    if (reviewCount > 0) {
      actions.push({
        type: 'review',
        priority: 'medium',
        description: `Review ${reviewCount} item(s) to boost memory.`,
        target: reviewCount
      });
    }

    const activeProjects = LawAIApp.ProjectTracker ? LawAIApp.ProjectTracker.getActiveProjects() : [];
    if (activeProjects.length > 0) {
      actions.push({
        type: 'project',
        priority: 'medium',
        description: `Spend 15 minutes on "${activeProjects[0].title}".`,
        target: 15
      });
    }

    return actions;
  },

  generateRoadmap(goal) {
    const progress = LawAIApp.ProgressEngine.getProgress();
    const totalLessons = 365;
    const remaining = totalLessons - progress.completedLessons.length;
    const currentDate = new Date();
    const deadline = goal.deadline ? new Date(goal.deadline) : new Date(currentDate.getTime() + 30 * 86400000);
    const daysLeft = Math.max(1, Math.ceil((deadline - currentDate) / 86400000));
    const lessonsPerDay = Math.ceil(remaining / daysLeft);
    const milestones = [];

    let cumulative = progress.completedLessons.length;
    for (let i = 0; i < daysLeft; i++) {
      cumulative += lessonsPerDay;
      if (cumulative >= totalLessons) break;
      const milestoneDate = new Date(currentDate.getTime() + (i + 1) * 86400000);
      milestones.push({
        date: milestoneDate.toISOString().split('T')[0],
        targetLesson: Math.min(cumulative, totalLessons),
        lessonsNeeded: lessonsPerDay
      });
    }

    return {
      goalId: goal.goalId,
      dailyLessons: lessonsPerDay,
      milestones: milestones.slice(0, 10),
      estimatedCompletion: milestones.length > 0 ? milestones[milestones.length - 1].date : deadline.toISOString().split('T')[0]
    };
  }
};
