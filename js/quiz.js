// quiz.js
LawAIApp.QuizModule = {
  generateHTML(lesson) {
    return `
      <div class="section-card">
        <h3>🧠 Quick Quiz</h3>
        ${lesson.quiz.map((q, i) => `
          <div class="quiz-question">
            <p><strong>${i+1}. ${q.question}</strong></p>
            ${q.options.map((opt, j) => `
              <label>
                <input type="radio" name="q${i}" value="${j}"> ${opt}
              </label>
            `).join('')}
          </div>
        `).join('')}
        <small style="color:var(--text-secondary);">Grading coming in Phase 4.</small>
      </div>
    `;
  }
};
