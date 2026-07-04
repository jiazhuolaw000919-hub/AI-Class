// agentOrchestrator.js
LawAIApp.AgentOrchestrator = {
  agents: [],
  start() {
    this.agents = [
      new LawAIApp.MentorAgent(),
      new LawAIApp.PlannerAgent(),
      new LawAIApp.ReviewerAgent(),
      new LawAIApp.StrategyAgent(),
      new LawAIApp.MemoryAgent()
    ];
    console.log('🤖 Multi-Agent Learning Ecosystem activated.');
  }
};
setTimeout(() => LawAIApp.AgentOrchestrator.start(), 600);
