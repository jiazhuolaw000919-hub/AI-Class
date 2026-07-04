// learningSocietyController.js
LawAIApp.LearningSocietyController = {
  init() {
    // 注册所有活跃代理到共识引擎
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(agent => {
      LawAIApp.AgentConsensusEngine.registerVoter(agent.name, 1);
    });

    // 监听重要事件触发共识轮次
    LawAIApp.EventBus.on('QuizFailed', (data) => {
      LawAIApp.AgentConsensusEngine.runConsensusRound({ event: 'QuizFailed', data });
    });
    LawAIApp.EventBus.on('GoalDelayed', (data) => {
      LawAIApp.AgentConsensusEngine.runConsensusRound({ event: 'GoalDelayed', data });
    });
    LawAIApp.EventBus.on('MemoryDecayDetected', (data) => {
      LawAIApp.AgentConsensusEngine.runConsensusRound({ event: 'MemoryDecayDetected', data });
    });

    // 将学习图变更同步给各代理
    LawAIApp.EventBus.on('GraphNodeStrengthChanged', (data) => {
      agents.forEach(agent => {
        if (agent.onGraphChange) agent.onGraphChange(data);
      });
    });

    console.log('Learning Society Controller activated. Agents collaborating.');
  }
};
// 在 agentOrchestrator 启动后初始化
setTimeout(() => {
  if (LawAIApp.AgentOrchestrator) {
    LawAIApp.LearningSocietyController.init();
  }
}, 1000);
