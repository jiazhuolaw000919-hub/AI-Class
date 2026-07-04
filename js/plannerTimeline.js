// plannerTimeline.js
LawAIApp.PlannerTimeline = {
  // 根据时间块长度生成计划时间线
  generateTimeline(timeBlockMinutes = 30) {
    const rankedTasks = LawAIApp.PlannerPriority.getRankedTasks();
    const timeline = [];
    let remainingTime = timeBlockMinutes;

    for (const task of rankedTasks) {
      if (remainingTime <= 0) break;
      if (task.estimatedMinutes <= remainingTime) {
        timeline.push({ ...task, scheduled: true });
        remainingTime -= task.estimatedMinutes;
      } else {
        // 如果时间不够，但任务重要（impact > 70），可以部分分配
        if (task.impact > 70) {
          timeline.push({ ...task, estimatedMinutes: remainingTime, scheduled: true, partial: true });
          remainingTime = 0;
        }
      }
    }

    return {
      timeBlock: timeBlockMinutes,
      usedMinutes: timeBlockMinutes - remainingTime,
      tasks: timeline
    };
  }
};
