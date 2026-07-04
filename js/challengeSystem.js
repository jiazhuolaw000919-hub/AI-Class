// ===========================================
// challengeSystem.js
// 挑战系统：在任务结束后生成挑战任务
// ===========================================
LawAIApp.ChallengeSystem = {
  // 为任务生成挑战
  generateChallenge(mission) {
    const challengeTemplates = [
      { type: 'prompt', title: `Build a Prompt for ${mission.title}`, description: 'Create a prompt that solves a real-world problem related to this mission.' },
      { type: 'code', title: `Fix this Code`, description: 'Debug and fix the provided code snippet.' },
      { type: 'design', title: `Design an AI Workflow`, description: 'Design a workflow that automates a process using the skill you just learned.' },
      { type: 'analysis', title: `Analyze this Business Case`, description: 'Read the case and provide your analysis.' }
    ];
    const template = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
    return {
      id: `challenge_${mission.id}`,
      title: template.title,
      description: template.description,
      completed: false
    };
  },

  // 完成挑战
  completeChallenge(challengeId, userId) {
    // 发放 XP
    LawAIApp.XPRewardEngine.awardChallengeXP(userId, 30);
    LawAIApp.EventBus.emit('ChallengeCompleted', { challengeId, userId });
    return true;
  }
};
