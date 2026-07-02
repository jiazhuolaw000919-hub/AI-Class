// mentorConversation.js
LawAIApp.MentorConversation = (function() {
  const conversationLog = [];

  // 模拟 AI 回复（未来替换为 AI Layer 调用）
  async function simulateReply(userMessage, context) {
    const memory = LawAIApp.MentorMemory.getMemory();
    const name = memory.favoriteAcademy === 'academy_ai' ? 'AI' : 'learning';
    const responses = {
      hello: `Hello! Ready to continue your ${name} journey?`,
      progress: `You've completed ${context.completedLessons || 0} lessons. Keep going!`,
      tip: `Try reviewing your weak areas: ${(memory.weakSubjects||[]).join(', ') || 'none yet'}.`,
      encouragement: `You're on a ${memory.streak}-day streak! That's amazing!`,
      default: `I'm here to help you learn. What would you like to discuss?`
    };
    const msg = userMessage.toLowerCase();
    let reply = responses.default;
    if (msg.includes('hello') || msg.includes('hi')) reply = responses.hello;
    else if (msg.includes('progress')) reply = responses.progress;
    else if (msg.includes('tip') || msg.includes('weak')) reply = responses.tip;
    else if (msg.includes('streak')) reply = responses.encouragement;

    // 通过 AI Layer 模拟（未来可调用 LawAIApp.AILayer.request('mentor_advice', context)）
    // 现在直接使用本地回复
    return reply;
  }

  return {
    async sendMessage(userMessage) {
      const prog = LawAIApp.ProgressEngine.getProgress();
      const context = { completedLessons: prog.completedLessons.length, totalLessons: prog.totalLessons };
      const reply = await simulateReply(userMessage, context);
      LawAIApp.MentorMemory.addConversationTurn('user', userMessage);
      LawAIApp.MentorMemory.addConversationTurn('mentor', reply);
      LawAIApp.EventBus.emit('MentorConversationStarted', { userMessage, reply });
      return reply;
    }
  };
})();
