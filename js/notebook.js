// notebook.js
LawAIApp.NotebookModule = {
  generateHTML(lesson) {
    const tags = lesson.tags.join(', ');
    return `
      <div class="section-card">
        <h3>📓 Notebook</h3>
        <p><strong>Summary:</strong> ${lesson.summary}</p>
        <p><strong>Important Keywords:</strong> ${lesson.category}, AI, Automation</p>
        <p><strong>Tags:</strong> <span class="badge">${tags}</span></p>
        <label>Quick Note:</label>
        <textarea class="note-field" placeholder="Write your note here... (saved locally)"></textarea>
        <button class="official-btn" style="margin-top:0.5rem;">Save Note</button>
      </div>
    `;
  }
};
