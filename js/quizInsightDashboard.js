// quizInsightDashboard.js
LawAIApp.QuizInsightDashboard = {
  render(moduleId) {
    const result = LawAIApp.QuizAnalytics.generateFakeResult(moduleId);
    const progress = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const levelInfo = LawAIApp.LevelEngine.calculateLevel();

    const html = `
      <div class="page" style="animation: fadeInUp 0.6s ease;">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: '${moduleId}' })" style="...">← Back to Module</button>

        <!-- Hero Summary -->
        <div class="continue-card" style="text-align:center; background: linear-gradient(135deg, #3b82f6, #8b5cf6);">
          <h1>🎉 Quiz Completed!</h1>
          <p>${result.courseName} · ${result.moduleName}</p>
          ${LawAIApp.QuizCharts.circularGauge(result.score)}
          <p style="font-size:2rem; font-weight:bold;">${result.score}%</p>
          <div style="display:flex; justify-content:center; gap:1rem; margin-top:0.5rem;">
            <span class="badge">✅ ${result.correct} correct</span>
            <span class="badge">❌ ${result.incorrect} incorrect</span>
            <span class="badge">⭐ +${result.xpEarned} XP</span>
            <span class="badge">⏱️ ${result.timeTaken}</span>
          </div>
          <p style="margin-top:0.5rem;">Level ${levelInfo.level} · ${streak.currentStreak} day streak</p>
        </div>

        <!-- Performance Overview -->
        <div class="section-card">
          <h3>📈 Recent Performance</h3>
          ${LawAIApp.QuizCharts.lineChart(result.recentScores)}
        </div>

        <!-- Topic Breakdown -->
        <div class="section-card">
          <h3>🧩 Topic Accuracy</h3>
          <div style="display:flex; align-items:center; gap:1rem;">
            ${LawAIApp.QuizCharts.pieChart(result.topicAccuracy)}
            <div>
              ${result.topicAccuracy.map(t => `<p>${t.topic}: ${t.accuracy}%</p>`).join('')}
            </div>
          </div>
        </div>

        <!-- Confidence Analysis -->
        <div class="section-card">
          <h3>💭 Confidence Analysis</h3>
          <div style="display:flex; gap:1rem; text-align:center;">
            <div><strong>😊 Confident & Correct</strong><br>${result.confidence.correctConfident}</div>
            <div><strong>🤔 Guessed Correctly</strong><br>${result.confidence.correctGuessing}</div>
            <div><strong>😕 Incorrect</strong><br>${result.confidence.incorrect}</div>
          </div>
        </div>

        <!-- Question Heatmap -->
        <div class="section-card">
          <h3>🔥 Question Heatmap</h3>
          ${LawAIApp.QuizHeatmap.render(result.heatmap)}
          <p style="font-size:0.8rem; color:var(--text-secondary);">Click a question for details</p>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="widget-grid">
          <div class="widget-card"><h3>💪 Strengths</h3><ul>${result.strengths.map(s => `<li>${s}</li>`).join('')}</ul></div>
          <div class="widget-card"><h3>🛠️ Weaknesses</h3><ul>${result.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul></div>
        </div>

        <!-- AI Mentor Insight -->
        ${LawAIApp.QuizMentorInsight.render(result.mentorInsight)}

        <!-- Progress & Streak -->
        <div class="widget-grid">
          <div class="widget-card"><h3>📊 Academy Progress</h3><p>${progress.completionPercent.toFixed(1)}%</p></div>
          <div class="widget-card"><h3>🔥 Streak</h3><p>${streak.currentStreak} days</p></div>
        </div>

        <!-- Smart Recommendations -->
        <div class="section-card">
          <h3>🚀 What's Next?</h3>
          <div class="quick-access">
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: 'module_ai_intro' })">📖 Review Module</button>
            <button class="quick-btn" onclick="alert('Retry Quiz')">🔄 Retry Quiz</button>
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson-detail', { lessonId: 'module_ai_intro_lesson1' })">📘 Recommended Lesson</button>
            <button class="quick-btn" onclick="alert('Challenge')">🏆 Take Challenge</button>
          </div>
        </div>

        <!-- Share -->
        <div class="section-card" style="text-align:center;">
          <p>📤 Share your achievement</p>
          <button class="quick-btn" onclick="alert('Export PDF coming soon')">Export PDF</button>
          <button class="quick-btn" onclick="alert('Share image')">Share Image</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
