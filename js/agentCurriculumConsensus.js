// ===========================================
// agentCurriculumConsensus.js
// 代理间协商课程设计
// ===========================================
LawAIApp.AgentCurriculumConsensus = {
  // 收集代理对课程设计的建议
  async gatherAgentInputs(context) {
    const inputs = [];
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(agent => {
      if (agent.role === 'Teaching & guidance') {
        inputs.push({ agent: 'mentor', style: 'step-by-step' });
      } else if (agent.role === 'Task optimization') {
        inputs.push({ agent: 'planner', sequence: 'optimal' });
      } else if (agent.role === 'Error detection') {
        inputs.push({ agent: 'reviewer', reinforcementNodes: [] });
      } else if (agent.role === 'Long-term planning') {
        inputs.push({ agent: 'strategist', alignGoal: true });
      } else if (agent.role === 'Knowledge persistence') {
        inputs.push({ agent: 'memory', retentionCheck: true });
      }
    });
    return inputs;
  },

  // 根据代理输入和上下文达成课程参数
  designCurriculum(context) {
    const { strategy, nodeIds } = context;
    const curriculum = {
      strategy,
      nodes: nodeIds,
      explanationStyle: 'mentor',   // 默认
      includeReinforcement: false,
      alignedToGoal: false,
      retentionOptimized: true
    };

    // 模拟根据代理输入调整
    const agents = LawAIApp.AgentOrchestrator?.agents || [];
    agents.forEach(agent => {
      if (agent.role === 'Teaching & guidance') {
        curriculum.explanationStyle = 'step-by-step';
      } else if (agent.role === 'Error detection' && strategy === 'weakness-targeted') {
        curriculum.includeReinforcement = true;
      } else if (agent.role === 'Long-term planning') {
        curriculum.alignedToGoal = true;
      }
    });

    return curriculum;
  }
};
