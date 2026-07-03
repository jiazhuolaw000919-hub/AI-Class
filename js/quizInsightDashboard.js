// quizInsightDashboard.js
LawAIApp.QuizInsightDashboard = {
  render(moduleId) {
    const result = LawAIApp.QuizAnalytics.generateFakeResult(moduleId);
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();

    const html = `
      <div class="page quiz-dashboard" style="animation: fadeInUp 0.6s ease;">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: '${moduleId}' })">← Back to Module</button>

        <!-- Hero Summary -->
        <div class="hero-card">
          <h1>🎉 Quiz Completed!</h1>
          <p>${result.courseName} · ${result.moduleName}</p>
          <div class="gauge-container">${LawAIApp.QuizCharts.circularGauge(result.score)}</div>
          <p style="font-size:2rem; font-weight:bold; animation: scorePop 0.5s ease;">${result.score}%</p>
          <div style="display:flex; justify-content:center; gap:1rem; margin-top:0.5rem; flex-wrap:wrap;">
            <span class="badge">✅ ${result.correct} correct</span>
            <span class="badge">❌ ${result.incorrect} incorrect</span>
            <span class="badge">⭐ +${result.xpEarned} XP</span>
            <span class="badge">⏱️ ${result.timeTaken}</span>
          </div>
          <p style="margin-top:0.5rem;">Level ${levelInfo.level} · ${streak.currentStreak} day streak</p>
        </div>

        <!-- Performance Overview -->
        <div class="dashboard-card">
          <h3>📈 Recent Performance</h3>
          ${LawAIApp.QuizCharts.lineChart(result.recentScores)}
        </div>

        <!-- Topic Breakdown -->
        <div class="dashboard-card">
          <h3>🧩 Topic Accuracy</h3>
          <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
            ${LawAIApp.QuizCharts.pieChart(result.topicAccuracy)}
            <div>
              ${result.topicAccuracy.map(t => `<p>${t.topic}: ${t.accuracy}%</p>`).join('')}
            </div>
          </div>
        </div>

        <!-- Confidence Analysis -->
        <div class="dashboard-card">
          <h3>💭 Confidence Analysis</h3>
          <div class="confidence-grid">
            <div class="confidence-item"><strong>😊 Confident & Correct</strong><br>${result.confidence.correctConfident}</div>
            <div class="confidence-item"><strong>🤔 Guessed Correctly</strong><br>${result.confidence.correctGuessing}</div>
            <div class="confidence-item"><strong>😕 Incorrect</strong><br>${result.confidence.incorrect}</div>
          </div>
        </div>

        <!-- Question Heatmap -->
        <div class="dashboard-card">
          <h3>🔥 Question Heatmap</h3>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${result.heatmap.map(q => `
              <div class="heat-cell ${q.status}" title="${q.question}: ${q.status}" onclick="alert('Question details coming soon')">${q.question}</div>
            `).join('')}
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Click a question for details</p>
        </div>

        <!-- Strengths & Weaknesses -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="strength-card">
            <h3>💪 Strengths</h3>
            <ul>${result.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          <div class="weakness-card">
            <h3>🛠️ Weaknesses</h3>
            <ul>${result.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
          </div>
        </div>

        <!-- AI Mentor Insight -->
        <div class="dashboard-card mentor-card">
          <div style="font-size:2rem;">🤖</div>
          <div>
            <h3>AI Mentor Insight</h3>
            <p><strong>${result.mentorInsight.summary}</strong></p>
            <p>📈 Pattern: ${result.mentorInsight.pattern}</p>
            <p>🎯 Suggestion: ${result.mentorInsight.suggestedPractice}</p>
            <p>📚 Recommended: ${result.mentorInsight.recommendedLesson}</p>
            <p>⭐ Goal: ${result.mentorInsight.futureGoal}</p>
          </div>
        </div>

        <!-- Progress & Streak -->
        <div class="widget-grid">
          <div class="widget-card">
            <h3>📊 Academy Progress</h3>
            <p style="font-size:1.5rem; font-weight:bold;">${progress.completionPercent.toFixed(1)}%</p>
          </div>
          <div class="widget-card">
            <h3>🔥 Streak</h3>
            <p style="font-size:1.5rem; font-weight:bold;">${streak.currentStreak} days</p>
          </div>
        </div>

        <!-- Smart Recommendations -->
        <div class="dashboard-card">
          <h3>🚀 What's Next?</h3>
          <div class="recommendation-group">
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: 'module_ai_intro' })">📖 Review Module</button>
            <button class="quick-btn" onclick="alert('Retry Quiz')">🔄 Retry Quiz</button>
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson-detail', { lessonId: 'module_ai_intro_lesson1' })">📘 Recommended Lesson</button>
            <button class="quick-btn pulse-btn" onclick="alert('Challenge')">🏆 Take Challenge</button>
          </div>
        </div>

        <!-- Share -->
        <div class="share-section">
          <p>📤 Share your achievement</p>
          <button class="quick-btn" onclick="alert('Export PDF coming soon')">Export PDF</button>
          <button class="quick-btn" onclick="alert('Share image')">Share Image</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
