// ===========================================
// agentTaskCoordinator.js
// 代理任务协调器：多代理合作分配和验证任务
// ===========================================
LawAIApp.AgentTaskCoordinator = {
  // 让代理网络对任务进行可行性评估
  async evaluateTask(task) {
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    const evaluations = [];
    agents.forEach(agent => {
      let approval = true;
      if (agent.role === 'Error detection' && task.difficulty > 2) {
        approval = task.successProbability > 0.7;
      }
      evaluations.push({ agent: agent.name, approval, note: approval ? 'Suitable' : 'Risky' });
    });
    return evaluations;
  },

  // 分配任务：各代理给出执行建议
  async assignTask(task) {
    const evaluations = await this.evaluateTask(task);
    const approved = evaluations.filter(e => e.approval).length >= 2; // 至少2个代理同意

    if (!approved) {
      task.status = 'rejected';
      LawAIApp.EventBus.emit('TaskRejected', { taskId: task.taskId, evaluations });
      return false;
    }

    // 策略代理建议执行时间
    const strategySuggestion = 'Start within 24 hours';
    const plannerSuggestion = 'Add to daily planner';

    // 更新任务状态
    task.status = 'assigned';
    task.assignedAt = new Date().toISOString();
    task.agentSuggestions = { strategy: strategySuggestion, planner: plannerSuggestion };

    const tasks = LawAIApp.StorageEngine.get('generated_tasks', []);
    const idx = tasks.findIndex(t => t.taskId === task.taskId);
    if (idx !== -1) tasks[idx] = task;
    LawAIApp.StorageEngine.set('generated_tasks', tasks);

    LawAIApp.EventBus.emit('TaskAssigned', task);
    return true;
  }
};
