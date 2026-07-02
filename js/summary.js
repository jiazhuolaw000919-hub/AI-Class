// summary.js
LawAIApp.SummaryModule = {
  generateHTML(lesson) {
    return `
      <div class="section-card">
        <h3>📖 AI Summary</h3>
        <p class="summary-point"><strong>1-Minute Summary:</strong> ${lesson.summary}</p>
        <p><strong>Key Points:</strong></p>
        <ul>
          <li>Understand the core concept of ${lesson.category}</li>
          <li>Identify real-world use cases</li>
          <li>Compare with alternative approaches</li>
          <li>Recognize common pitfalls</li>
          <li>Apply in a project setting</li>
        </ul>
        <p><strong>Things to Remember:</strong> Consistency beats intensity.</p>
        <p><strong>Common Mistake:</strong> Skipping fundamentals.</p>
        <p><strong>Real World Usage:</strong> Used in apps like ChatGPT, Midjourney.</p>
      </div>
    `;
  }
};
