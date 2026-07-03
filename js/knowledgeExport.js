// knowledgeExport.js
LawAIApp.KnowledgeExport = {
  exportAll(format = 'txt') {
    const notes = LawAIApp.KnowledgeCapture.getNotes();
    let content = '';
    if (format === 'txt') {
      notes.forEach(n => {
        content += `# ${n.title}\n${n.content}\nTags: ${n.tags.join(', ')}\n---\n`;
      });
    } else if (format === 'json') {
      content = JSON.stringify(notes, null, 2);
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `knowledge-export-${new Date().toISOString().slice(0,10)}.${format}`;
    a.click();
  },

  exportNote(id, format = 'txt') {
    const note = LawAIApp.KnowledgeCapture.getById(id);
    if (!note) return;
    let content = `# ${note.title}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${note.title.replace(/\s+/g,'-')}.${format}`;
    a.click();
  }
};
