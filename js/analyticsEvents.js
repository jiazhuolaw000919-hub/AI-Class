// analyticsEvents.js
LawAIApp.AnalyticsEvents = {
  emitMetricsUpdated(metrics) {
    LawAIApp.EventBus.emit('AnalyticsUpdated', { metrics }, 'low');
  },
  emitLearningTrend(trend) {
    LawAIApp.EventBus.emit('LearningTrendUpdated', trend, 'low');
  },
  emitKnowledgeScoreUpdated(score) {
    LawAIApp.EventBus.emit('KnowledgeScoreUpdated', { score }, 'low');
  }
};
