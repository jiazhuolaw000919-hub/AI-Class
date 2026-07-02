// practice.js
LawAIApp.PracticeModule = {
  generateHTML(lesson) {
    return `
      <div class="section-card">
        <h3>⚡ Today's Challenge</h3>
        <div class="practice-box">
          <p>Use <strong>${lesson.category}</strong> to complete a simple task.</p>
          <p><em>Example: “Ask ChatGPT to explain ${lesson.title} in simple terms.”</em></p>
        </div>
        <p style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-secondary);">Future: AI will verify your answer.</p>
      </div>
    `;
  }
};
