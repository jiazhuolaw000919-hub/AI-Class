// knowledgeEditor.js
LawAIApp.KnowledgeEditor = {
  render(params) {
    const noteId = params.noteId;
    const isNew = noteId === 'new';
    const note = isNew ? null : LawAIApp.KnowledgeCapture.getById(noteId);
    const title = note ? note.title : '';
    const content = note ? note.content : '';
    const tags = note ? note.tags.join(', ') : '';

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('knowledge-capture')" style="...">← Back to Notes</button>
        <h2>${isNew ? 'New Note' : 'Edit Note'}</h2>
        <input class="search-box" id="note-title" placeholder="Title" value="${title.replace(/"/g, '&quot;')}">
        <textarea id="note-content" class="note-field" style="min-height:200px;" placeholder="Start writing...">${content}</textarea>
        <input class="search-box" id="note-tags" placeholder="Tags (comma separated)" value="${tags}">
        ${!isNew ? `
          <button class="quick-btn" style="margin-top:0.5rem; background:var(--danger);" id="delete-note-btn">🗑️ Delete</button>
        ` : ''}
        <button class="complete-btn" id="save-note-btn" style="margin-top:1rem;">💾 Save Note</button>
        ${!isNew ? `
          <div class="section-card" style="margin-top:1rem;">
            <h3>🤖 AI Summary</h3>
            <p id="ai-summary">${LawAIApp.KnowledgeCapture.generateSummary(noteId)}</p>
            <button class="quick-btn" id="regenerate-summary">🔄 Regenerate</button>
          </div>
          <div class="section-card">
            <h3>🔗 Linked Knowledge</h3>
            <div id="linked-info">Loading...</div>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    document.getElementById('save-note-btn').addEventListener('click', () => {
      const title = document.getElementById('note-title').value.trim();
      const content = document.getElementById('note-content').value.trim();
      const tagsInput = document.getElementById('note-tags').value.trim();
      const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
      if (!title && !content) return;
      if (isNew) {
        LawAIApp.KnowledgeCapture.create({ title, content, tags });
      } else {
        LawAIApp.KnowledgeCapture.update(noteId, { title, content, tags });
      }
      LawAIApp.Router.navigate('knowledge-capture');
    });

    if (!isNew) {
      document.getElementById('delete-note-btn')?.addEventListener('click', () => {
        if (confirm('Delete this note?')) {
          LawAIApp.KnowledgeCapture.remove(noteId);
          LawAIApp.Router.navigate('knowledge-capture');
        }
      });
      document.getElementById('regenerate-summary')?.addEventListener('click', () => {
        document.getElementById('ai-summary').textContent = LawAIApp.KnowledgeCapture.generateSummary(noteId);
      });
      // 显示关联知识
      const linked = LawAIApp.KnowledgeCapture.getLinkedKnowledge(noteId);
      const linkedDiv = document.getElementById('linked-info');
      if (linkedDiv) {
        if (linked.lesson) {
          linkedDiv.innerHTML = `<p>📖 Lesson: ${linked.lesson.title}</p>
            <button class="quick-btn" onclick="LawAIApp.Router.navigate('lesson-detail', { lessonId: '${linked.lesson.lessonId}' })">Open Lesson</button>`;
        } else {
          linkedDiv.innerHTML = '<p style="color:var(--text-secondary);">No linked lesson.</p>';
        }
      }
    }
  }
};
