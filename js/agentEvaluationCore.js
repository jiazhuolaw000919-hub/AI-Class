// ===========================================
// agentEvaluationCore.js
// 多代理联合评估核心
// ===========================================
LawAIApp.AgentEvaluationCore = {
  // 收集各代理对用户的整体评价
  async evaluateOverallPerformance() {
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    const evaluations = [];
    agents.forEach(agent => {
      let score = 50;
      if (agent.role === 'Teaching & guidance') score = Math.random() * 30 + 70;
      else if (agent.role === 'Error detection') score = Math.random() * 40 + 60;
      else if (agent.role === 'Long-term planning') score = Math.random() * 20 + 80;
      else if (agent.role === 'Task optimization') score = Math.random() * 35 + 65;
      evaluations.push({ agent: agent.name, score: Math.round(score) });
    });
    const avg = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
    return { average: Math.round(avg), agentEvaluations: evaluations };
  }
};
