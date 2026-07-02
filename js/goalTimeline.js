// goalTimeline.js
LawAIApp.GoalTimeline = {
  // 生成目标的时间线（里程碑、历史事件）
  generate(goalId) {
    const goal = LawAIApp.GoalTracker._getStore().find(g => g.goalId === goalId);
    if (!goal) return [];

    const timeline = [];
    // 创建事件
    timeline.push({ date: goal.createdAt, event: 'Goal Created', type: 'system' });

    // 里程碑事件
    goal.progress.milestones.forEach(m => {
      timeline.push({ date: goal.updatedAt, event: `Milestone: ${m}`, type: 'milestone' });
    });

    // 如果有完成日期
    if (goal.status === 'completed') {
      timeline.push({ date: goal.updatedAt, event: 'Goal Completed', type: 'achievement' });
    }

    // 可加入进度更新事件（从GoalUpdated日志中提取，这里简化）
    return timeline.sort((a,b) => new Date(a.date) - new Date(b.date));
  },

  // 获取所有目标的汇总时间线
  getFullTimeline() {
    const allGoals = LawAIApp.GoalTracker._getStore();
    let fullTimeline = [];
    allGoals.forEach(g => {
      fullTimeline = fullTimeline.concat(this.generate(g.goalId));
    });
    return fullTimeline.sort((a,b) => new Date(a.date) - new Date(b.date));
  }
};
