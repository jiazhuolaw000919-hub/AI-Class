// knowledgeDashboard.js
LawAIApp.KnowledgeDashboard = {
  render() {
    const notes = LawAIApp.KnowledgeCapture.getNotes();
    const pinned = notes.filter(n => n.isPinned);
    const recent = notes.slice(0, 5);
    const favorites = notes.filter(n => n.isFavorite);
    const stats = LawAIApp.KnowledgeAnalytics ? LawAIApp.KnowledgeAnalytics.getStats() : { total: notes.length };

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="...">← Back</button>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2>📓 Knowledge Capture</h2>
          <button class="quick-btn" id="new-note-btn">+ New Note</button>
        </div>

        <input class="search-box" id="note-search" placeholder="Search notes...">

        <!-- Stats -->
        <div class="widget-grid" style="margin:1rem 0;">
          <div class="widget-card"><h3>📝 Total</h3><p>${stats.total}</p></div>
          <div class="widget-card"><h3>⭐ Favorites</h3><p>${favorites.length}</p></div>
          <div class="widget-card"><h3>📌 Pinned</h3><p>${pinned.length}</p></div>
        </div>

        <!-- Pinned Section -->
        ${pinned.length > 0 ? `
          <div class="section-card">
            <h3>📌 Pinned</h3>
            <div id="pinned-list">${this.renderNoteCards(pinned)}</div>
          </div>
        ` : ''}

        <!-- Recent Notes -->
        <div class="section-card">
          <h3>🕒 Recent</h3>
          <div id="recent-list">${notes.length === 0 ? '<p style="color:var(--text-secondary);">Your knowledge library is empty. Start capturing your first insight.</p>' : this.renderNoteCards(recent)}</div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-access" style="margin-top:1rem;">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('knowledge-favorites')">⭐ Favorites</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('knowledge-export')">📤 Export</button>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
    this.attachEvents();
  },

  renderNoteCards(notesArray) {
    return notesArray.map(note => `
      <div class="note-card" style="cursor:pointer;" onclick="LawAIApp.Router.navigate('knowledge-editor', { noteId: '${note.id}' })">
        <div style="display:flex; justify-content:space-between;">
          <strong>${note.title}</strong>
          <div>
            <span onclick="event.stopPropagation(); LawAIApp.KnowledgeCapture.togglePin('${note.id}'); LawAIApp.KnowledgeDashboard.render()" style="cursor:pointer; margin-right:4px;">${note.isPinned ? '📌' : '📍'}</span>
            <span onclick="event.stopPropagation(); LawAIApp.KnowledgeCapture.toggleFavorite('${note.id}'); LawAIApp.KnowledgeDashboard.render()" style="cursor:pointer;">${note.isFavorite ? '⭐' : '☆'}</span>
          </div>
        </div>
        <p style="color:var(--text-secondary); font-size:0.85rem;">${note.content.substring(0, 80)}${note.content.length > 80 ? '...' : ''}</p>
        <div style="display:flex; gap:0.3rem; flex-wrap:wrap;">
          ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <small style="color:var(--text-secondary);">${new Date(note.updatedAt).toLocaleDateString()}</small>
      </div>
    `).join('');
  },

  attachEvents() {
    document.getElementById('new-note-btn')?.addEventListener('click', () => {
      LawAIApp.Router.navigate('knowledge-editor', { noteId: 'new' });
    });

    const searchInput = document.getElementById('note-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const results = query ? LawAIApp.KnowledgeCapture.search(query) : LawAIApp.KnowledgeCapture.getNotes();
        const recentContainer = document.getElementById('recent-list');
        if (recentContainer) recentContainer.innerHTML = results.length > 0 ? this.renderNoteCards(results) : '<p style="color:var(--text-secondary);">No results.</p>';
      });
    }
  }
};
