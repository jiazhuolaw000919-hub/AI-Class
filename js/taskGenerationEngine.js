// ===========================================
// taskGenerationEngine.js
// 任务生成引擎
// ===========================================
LawAIApp.TaskGenerationEngine = {
  _taskStoreKey: 'generated_tasks',

  generateTask(match) {
    const task = {
      taskId: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: match.taskTemplate.type,
      title: this._getTaskTitle(match),
      description: this._getTaskDescription(match),
      skillId: match.skillId,
      difficulty: match.difficulty,
      estimatedMinutes: match.estimatedTime,
      xpReward: match.xpReward,
      successProbability: match.successProbability,
      status: 'available',
      assignedAt: null,
      completedAt: null,
      requirements: {
        minimumMastery: Math.max(0, match.masteryScore - 20),
        timeLimit: match.estimatedTime * 1.5
      }
    };
    // 存储任务
    const tasks = LawAIApp.StorageEngine.get(this._taskStoreKey, []);
    tasks.push(task);
    LawAIApp.StorageEngine.set(this._taskStoreKey, tasks);
    LawAIApp.EventBus.emit('TaskGenerated', task);
    return task;
  },

  _getTaskTitle(match) {
    const titles = {
      reinforcement: `Strengthen ${match.skillName}`,
      simulation: `Simulate: ${match.skillName} in practice`,
      project: `Build: ${match.skillName} Project`,
      problem_solving: `Solve: ${match.skillName} Challenge`,
      collaborative: `Collaborate on ${match.skillName}`
    };
    return titles[match.taskTemplate.type] || `Task: ${match.skillName}`;
  },

  _getTaskDescription(match) {
    return `Apply your ${match.skillName} skills to complete this ${match.taskTemplate.type} task. ` +
           `Estimated difficulty: ${match.difficulty}/3.`;
  },

  getAvailableTasks() {
    return LawAIApp.StorageEngine.get(this._taskStoreKey, []).filter(t => t.status === 'available');
  }
};
