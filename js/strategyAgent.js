// strategyAgent.js
LawAIApp.StrategyAgent = class extends LawAIApp.AgentCore {
  constructor() {
    super('StrategyAgent', 'Long-term planning');
  }
  init() {
    this.on('GoalCompleted', (data) => this.celebrateAndSuggestNext(data));
    this.on('LevelUp', (data) => this.adjustRoadmap(data.newLevel));
  }
  celebrateAndSuggestNext(goal) {
    this.log(`Goal achieved! Recommending next steps...`);
    if (LawAIApp.GoalIntelligenceEngine) {
      const nextGoal = LawAIApp.GoalIntelligenceEngine.getActiveGoals()[0];
      if (!nextGoal) {
        this.emit('NewGoalSuggested', { title: 'Continue Advanced AI Studies' });
      }
    }
  }
  adjustRoadmap(level) {
    this.log(`Level ${level} reached. Accelerating roadmap if appropriate.`);
    if (level > 5) {
      this.emit('ContentAccelerationSuggested', { reason: 'high level' });
    }
  }
};
