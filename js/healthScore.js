// healthScore.js
LawAIApp.HealthScore = {
  // 根据综合指标得出学习健康度描述
  calculate() {
    const metrics = LawAIApp.AnalyticsEngine.getMetrics();
    const learning = metrics.learning || {};
    const behavior = metrics.behavior || {};
    const knowledge = metrics.knowledge || {};
    const consistency = metrics.consistency || {};

    let score = 0;
    score += Math.min(learning.completionRate || 0, 100) * 0.3;
    score += Math.min((knowledge.knowledgeScore || 0) / 10, 100) * 0.3;
    score += Math.min((consistency.currentStreak || 0) * 2, 100) * 0.2;
    score += Math.min((behavior.totalSessions || 0) * 5, 100) * 0.2;

    const final = Math.round(score);
    let label = 'Needs Improvement';
    if (final >= 80) label = 'Excellent';
    else if (final >= 60) label = 'Good';
    else if (final >= 40) label = 'Average';

    return { score: final, label };
  }
};
