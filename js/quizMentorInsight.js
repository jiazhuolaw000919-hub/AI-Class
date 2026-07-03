// quizMentorInsight.js
LawAIApp.QuizMentorInsight = {
  render(insight) {
    return `
      <div class="section-card" style="display:flex; gap:1rem; align-items:flex-start;">
        <div style="font-size:2rem;">🤖</div>
        <div>
          <h3>AI Mentor Insight</h3>
          <p><strong>${insight.summary}</strong></p>
          <p>📈 Pattern: ${insight.pattern}</p>
          <p>🎯 Suggestion: ${insight.suggestedPractice}</p>
          <p>📚 Recommended: ${insight.recommendedLesson}</p>
          <p>⭐ Goal: ${insight.futureGoal}</p>
        </div>
      </div>
    `;
  }
};
