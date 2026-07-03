// conversationActions.js
LawAIApp.ConversationActions = {
  suggest(analysis) {
    const suggestions = [];
    if (analysis.reviewDue > 0) {
      suggestions.push({ text: '📅 Start Today's Review', action: 'open_review' });
    }
    if (analysis.weakTopics.length > 0) {
      suggestions.push({ text: `📘 Learn about ${analysis.weakTopics[0]}`, action: 'open_weak_topic' });
    }
    if (analysis.activeProjects > 0) {
      suggestions.push({ text: '🚀 Continue Your Project', action: 'open_projects' });
    }
    if (analysis.completionRate < 100) {
      suggestions.push({ text: '📖 Continue Learning Path', action: 'open_learning' });
    }
    suggestions.push({ text: '🧠 Open Memory Dashboard', action: 'open_memory' });
    return suggestions;
  }
};
