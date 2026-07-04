// plannerAgent.js
LawAIApp.PlannerAgent = class extends LawAIApp.AgentCore {
  constructor() {
    super('PlannerAgent', 'Task optimization');
  }
  init() {
    this.on('GoalUpdated', () => this.recalculatePlan());
    this.on('MemoryHealthChanged', () => this.adjustReviewSchedule());
    this.on('PlannerRecalculate', (data) => this.handlePlannerRecalculate(data));
  }
  recalculatePlan() {
    if (LawAIApp.PlannerEngine) {
      LawAIApp.PlannerEngine.generatePlan(30);
      this.log('Plan regenerated based on current goals.');
    }
  }
  adjustReviewSchedule() {
    if (LawAIApp.MemoryScheduler) {
      this.log('Review schedule adjusted for memory health.');
    }
  }
  handlePlannerRecalculate(data) {
    if (data.priority === 'review') {
      LawAIApp.PlannerEngine?.generatePlan(20);
    } else if (data.priority === 'advance') {
      LawAIApp.PlannerEngine?.generatePlan(45);
    }
  }
};
