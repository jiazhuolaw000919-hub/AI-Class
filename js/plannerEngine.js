// plannerEngine.js
LawAIApp.PlannerEngine = {
  generatePlan(timeBlockMinutes = 30) {
    const timeline = LawAIApp.PlannerTimeline.generateTimeline(timeBlockMinutes);
    LawAIApp.StorageEngine.set('dailyPlan', timeline);
    LawAIApp.EventBus.emit('PlanUpdated', timeline);
    return timeline;
  },

  getCurrentPlan() {
    return LawAIApp.StorageEngine.get('dailyPlan', null);
  },

  completeTask(taskId) {
    const plan = this.getCurrentPlan();
    if (!plan) return;

    // 根据任务类型执行相应操作
    if (taskId.startsWith('lesson_')) {
      const lessonId = taskId.replace('lesson_', '');
      LawAIApp.Router.navigate('lesson', { day: parseInt(lessonId.split('-')[1]) });
    } else if (taskId.startsWith('review_')) {
      const lessonId = taskId.replace('review_', '');
      // 模拟复习完成
      LawAIApp.MemoryReview.performReview(lessonId, 'flashcard');
      // 从计划中移除
      const updatedTasks = plan.tasks.filter(t => t.id !== taskId);
      plan.tasks = updatedTasks;
      LawAIApp.StorageEngine.set('dailyPlan', plan);
      LawAIApp.PlannerDashboard.render();
    } else if (taskId.startsWith('practice_')) {
      const practiceId = taskId.replace('practice_', '');
      LawAIApp.Router.navigate('practice', { practiceId });
    } else if (taskId.startsWith('project_')) {
      const projectId = taskId.replace('project_', '');
      LawAIApp.Router.navigate('smart-project', { projectId });
    }
  },

  // 重调度：跳过某个任务，重新计算计划
  skipTask(taskId) {
    const plan = this.getCurrentPlan();
    if (!plan) return;
    // 简单移除该任务并重新生成计划
    const updatedTasks = plan.tasks.filter(t => t.id !== taskId);
    plan.tasks = updatedTasks;
    LawAIApp.StorageEngine.set('dailyPlan', plan);
    // 若移除后时间富余，自动补充低优先级任务
    const newTimeline = LawAIApp.PlannerTimeline.generateTimeline(plan.timeBlock);
    LawAIApp.StorageEngine.set('dailyPlan', newTimeline);
    LawAIApp.PlannerDashboard.render();
  }
};
