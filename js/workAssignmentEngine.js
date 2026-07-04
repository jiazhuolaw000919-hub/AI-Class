// ===========================================
// workAssignmentEngine.js
// 工作任务分配引擎（用户侧）
// ===========================================
LawAIApp.WorkAssignmentEngine = {
  async acceptAndStartTask(taskId) {
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const task = tasks.find(t => t.taskId === taskId);
    if (!task || task.status !== 'available') return null;

    const assigned = await LawAIApp.AgentTaskCoordinator.assignTask(task);
    if (!assigned) return null;

    // 标记为用户进行中
    task.status = 'in_progress';
    LawAIApp.StorageEngine.set('generated_tasks', tasks);
    LawAIApp.EventBus.emit('WorkTaskStarted', task);
    return task;
  },

  completeTask(taskId, performanceScore = 1.0) {
    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const task = tasks.find(t => t.taskId === taskId);
    if (!task || task.status !== 'in_progress') return null;

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.performanceScore = performanceScore;
    LawAIApp.StorageEngine.set('generated_tasks', tasks);

    // 反馈给技能部署引擎
    LawAIApp.SkillDeploymentEngine.handleTaskCompletion(task);

    LawAIApp.EventBus.emit('WorkTaskCompleted', task);
    return task;
  }
};
