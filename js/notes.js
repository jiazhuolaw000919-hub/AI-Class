LawAIApp.Notes = {
  notes: LawAIApp.Data.fakeNotes(),
  render() {
    const html = `
      <div class="page">
        <h2>📝 Notebook</h2>
        <input class="search-box" placeholder="Search notes..." id="notes-search">
        <div id="notes-container"></div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    this.displayNotes(this.notes);
    document.getElementById('notes-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = this.notes.filter(n => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q));
      this.displayNotes(filtered);
    });
  },
  displayNotes(list) {
    const container = document.getElementById('notes-container');
    container.innerHTML = list.map(n => `
      <div class="note-card">
        <strong>${n.title}</strong><p>${n.summary}</p>
        <div>${n.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <small>${n.date}</small>
      </div>
    `).join('');
  }
};
