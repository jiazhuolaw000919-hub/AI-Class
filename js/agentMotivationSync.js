// ===========================================
// agentMotivationSync.js
// 代理动机同步器：将文明级别的动机映射到每个代理
// ===========================================
LawAIApp.AgentMotivationSync = {
  // 根据文明动机调整代理行为权重
  syncAgentsToMotivation() {
    const motivation = LawAIApp.CivilizationMotivationCore.motivationState.overallMotivation;
    const agents = LawAIApp.AgentOrchestrator?.agents || [];

    agents.forEach(agent => {
      // 动机越高，代理越活跃；反之则保守
      const activityMultiplier = motivation / 100;

      // 根据代理角色分配不同的驱动力权重
      switch (agent.role) {
        case 'Teaching & guidance':
          agent.driveWeight = activityMultiplier * 1.2; // Mentor 更受动机影响
          break;
        case 'Error detection':
          agent.driveWeight = activityMultiplier * 0.9; // Reviewer 相对稳定
          break;
        case 'Long-term planning':
          agent.driveWeight = activityMultiplier * 1.0;
          break;
        case 'Task optimization':
          agent.driveWeight = activityMultiplier * 1.1;
          break;
        case 'Knowledge persistence':
          agent.driveWeight = activityMultiplier * 0.8;
          break;
        default:
          agent.driveWeight = activityMultiplier;
      }
    });

    LawAIApp.EventBus.emit('AgentMotivationSynced', { motivation, agentCount: agents.length });
  },

  // 获取代理当前驱动力（用于决策时参考）
  getAgentDrive(agentName) {
    const agent = LawAIApp.AgentOrchestrator?.agents?.find(a => a.name === agentName);
    return agent?.driveWeight || 1;
  }
};
