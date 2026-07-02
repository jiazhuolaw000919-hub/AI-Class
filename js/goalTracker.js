// goalTracker.js
LawAIApp.GoalTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('goals', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('goals', list); },

  // 创建一个新目标
  create(goalDef) {
    const list = this._getStore();
    const goal = {
      goalId: 'goal_' + Date.now(),
      ...goalDef,
      progress: {
        completedLessons: 0,
        mastery: 0,
        practice: 0,
        memoryStrength: 0,
        learningHours: 0,
        milestones: []
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(goal);
    this._save(list);
    LawAIApp.EventBus.emit('GoalCreated', { goal });
    return goal;
  },

  // 更新目标进度
  updateProgress(goalId, progressUpdate) {
    const list = this._getStore();
    const goal = list.find(g => g.goalId === goalId);
    if (!goal) return;
    Object.assign(goal.progress, progressUpdate);
    goal.updatedAt = new Date().toISOString();

    // 检查里程碑
    const ms = this._checkMilestones(goal);
    if (ms.length > 0) {
      goal.progress.milestones = [...new Set([...goal.progress.milestones, ...ms])];
      ms.forEach(m => LawAIApp.EventBus.emit('MilestoneReached', { goalId, milestone: m }));
    }

    // 检查目标完成条件 (示例：完成所有相关课程)
    if (goal.completionCondition && goal.completionCondition(goal)) {
      goal.status = 'completed';
      LawAIApp.EventBus.emit('GoalCompleted', { goalId });
    }

    this._save(list);
    LawAIApp.EventBus.emit('GoalUpdated', { goalId, progress: goal.progress });
  },

  // 获取目标进度
  getProgress(goalId) {
    const goal = this._getStore().find(g => g.goalId === goalId);
    return goal ? goal.progress : null;
  },

  // 自动计算里程碑
  _checkMilestones(goal) {
    const milestones = [];
    const prog = goal.progress;
    if (prog.completedLessons >= 10 && !prog.milestones.includes('10_lessons')) milestones.push('10_lessons');
    if (prog.completedLessons >= 50 && !prog.milestones.includes('50_lessons')) milestones.push('50_lessons');
    // 可以继续扩展
    return milestones;
  },

  // 获取所有活跃目标
  getActiveGoals() {
    return this._getStore().filter(g => g.status === 'active');
  },

  // 删除目标
  removeGoal(goalId) {
    const list = this._getStore().filter(g => g.goalId !== goalId);
    this._save(list);
  }
};
