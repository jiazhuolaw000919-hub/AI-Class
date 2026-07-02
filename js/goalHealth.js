// goalHealth.js
LawAIApp.GoalHealth = {
  // 检查所有活跃目标的健康状态
  checkAll() {
    const activeGoals = LawAIApp.GoalTracker.getActiveGoals();
    const results = [];
    activeGoals.forEach(goal => {
      const health = this.checkGoal(goal);
      if (health.status !== 'healthy') {
        results.push({ goalId: goal.goalId, ...health });
        LawAIApp.EventBus.emit('GoalHealthAlert', { goalId: goal.goalId, health });
      }
    });
    return results;
  },

  checkGoal(goal) {
    const now = Date.now();
    const created = new Date(goal.createdAt).getTime();
    const daysSinceCreation = (now - created) / 86400000;
    const progress = goal.progress.completedLessons;

    // 如果创建超过7天但完成的课程少于5，标记为延迟
    if (daysSinceCreation > 7 && progress < 5) {
      return { status: 'delayed', reason: 'Progress is slower than expected' };
    }

    // 如果有deadline，检查是否临近
    if (goal.deadline) {
      const deadline = new Date(goal.deadline).getTime();
      const daysLeft = (deadline - now) / 86400000;
      if (daysLeft < 2 && goal.status !== 'completed') {
        return { status: 'at_risk', reason: 'Deadline approaching' };
      }
    }

    return { status: 'healthy' };
  }
};
