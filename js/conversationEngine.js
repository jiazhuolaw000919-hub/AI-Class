// conversationEngine.js
LawAIApp.ConversationEngine = {
  async sendMessage(userMessage) {
    // 获取上下文
    const ctx = LawAIApp.ConversationContext.gather();
    const analysis = LawAIApp.MentorAnalytics.getComprehensiveAnalysis();
    
    // 记录用户消息
    LawAIApp.ConversationMemory.addMessage('user', userMessage);

    // 模拟 AI 回复（未来可替换为真实 API）
    const reply = this._generateReply(userMessage, ctx, analysis);
    
    // 记录助手消息
    const msg = LawAIApp.ConversationMemory.addMessage('assistant', reply.text, {
      suggestions: reply.suggestions
    });

    LawAIApp.EventBus.emit('ConversationMessageAdded', { message: msg });
    return msg;
  },

  _generateReply(message, ctx, analysis) {
    const msg = message.toLowerCase();
    let text = '';
    let suggestions = LawAIApp.ConversationActions.suggest(analysis);

    if (msg.includes('progress') || msg.includes('how am i')) {
      text = `You've completed ${ctx.completionPercent}% of your learning path. Your learning health is ${ctx.health}% and memory health is ${ctx.memory}%. Keep going!`;
    } else if (msg.includes('weak') || msg.includes('improve')) {
      text = ctx.weakTopics.length > 0 
        ? `I recommend focusing on: ${ctx.weakTopics.join(', ')}. These areas will boost your overall understanding.`
        : 'You are doing great across all topics!';
    } else if (msg.includes('review') || msg.includes('memory')) {
      text = `Memory health: ${ctx.memory}%. ${analysis.reviewDue > 0 ? `You have ${analysis.reviewDue} review(s) due.` : 'No reviews pending today.'}`;
    } else if (msg.includes('project') || msg.includes('building')) {
      text = ctx.activeProjects.length > 0 
        ? `You have ${ctx.activeProjects.length} active project(s): ${ctx.activeProjects.join(', ')}.`
        : 'No active projects. Would you like to start one?';
    } else if (msg.includes('goal') || msg.includes('target')) {
      text = ctx.goals.length > 0 
        ? `Current goals: ${ctx.goals.join(', ')}.`
        : 'You haven't set any goals yet. I can help you define some.';
    } else {
      text = `Thanks for sharing! Based on your current progress, I suggest focusing on your ${ctx.todayFocus.toLowerCase()}. ${ctx.health > 70 ? 'Your learning health looks excellent!' : 'Consider taking a short break to recharge.'}`;
    }

    return { text, suggestions };
  }
};
