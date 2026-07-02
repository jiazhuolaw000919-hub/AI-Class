// mentorGoals.js
LawAIApp.MentorGoals = {
  _getStore() {
    return LawAIApp.StorageEngine.get('mentor_goals', []);
  },
  _save(goals) { LawAIApp.StorageEngine.set('mentor_goals', goals); },

  addGoal(type, description, targetValue = 0) {
    const goals = this._getStore();
    goals.push({
      id: 'goal_' + Date.now(),
      type,          // daily, weekly, monthly, quarterly
      description,
      targetValue,
      currentValue: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    this._save(goals);
    LawAIApp.EventBus.emit('GoalUpdated', { goals });
  },

  updateProgress(goalId, currentValue) {
    const goals = this._getStore();
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      goal.currentValue = currentValue;
      if (goal.targetValue > 0 && goal.currentValue >= goal.targetValue) {
        goal.completed = true;
        goal.completedAt = new Date().toISOString();
      }
      this._save(goals);
      LawAIApp.EventBus.emit('GoalUpdated', { goals });
    }
  },

  getActiveGoals() {
    return this._getStore().filter(g => !g.completed);
  },

  // 自动生成基于进度的每日目标（引擎调用）
  generateDailyGoal() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const remaining = prog.totalLessons - prog.completedLessons.length;
    const reviewCount = LawAIApp.ReviewQueue.getTodayReviews().length;
    if (remaining > 0) {
      this.addGoal('daily', 'Complete at least 1 lesson', 1);
    }
    if (reviewCount > 0) {
      this.addGoal('daily', `Review ${reviewCount} lesson(s)`, reviewCount);
    }
  }
};
