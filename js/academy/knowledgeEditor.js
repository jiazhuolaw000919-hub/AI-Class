// knowledgeEditor.js — S4 升级版 (Part 34)
window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeEditor = {
    render: function(params) {
        var noteId = params.noteId;
        var isNew = noteId === 'new';
        var note = isNew ? null : LawAIApp.KnowledgeCapture.getById(noteId);
        var title = note ? note.title : '';
        var content = note ? note.content : '';
        var tags = note && note.tags ? note.tags.join(', ') : '';
        var type = note ? note.type : 'KEY_POINT';

        var typeOptions = [
            'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY',
            'PERSONAL_NOTE', 'QUESTION', 'MISTAKE', 'INSIGHT', 'BOOKMARK'
        ];

        var html = `
            <div class="page">
                <button class="back-btn" onclick="LawAIApp.Router.navigate('notes')" 
                        style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
                    ← Back to Notes
                </button>
                <h2>${isNew ? 'New Note' : 'Edit Note'}</h2>
                <div style="margin-bottom: 8px;">
                    <label style="font-size: 12px; color: #94a3b8;">Type</label>
                    <select id="note-type" class="search-box" style="width: 100%;">
                        ${typeOptions.map(function(t) {
                            return `<option value="${t}" ${t === type ? 'selected' : ''}>${t.replace('_', ' ')}</option>`;
                        }).join('')}
                    </select>
                </div>
                <input class="search-box" id="note-title" placeholder="Title" value="${title.replace(/"/g, '&quot;')}">
                <textarea id="note-content" class="note-field" style="min-height:200px; width:100%; padding:12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); color:#e2e8f0;" placeholder="Start writing...">${content}</textarea>
                <input class="search-box" id="note-tags" placeholder="Tags (comma separated)" value="${tags}">
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <button class="complete-btn" id="save-note-btn" style="flex: 1; padding: 10px; background: #4a9eff; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💾 Save Note
                    </button>
                    ${!isNew ? `
                        <button class="quick-btn" id="delete-note-btn" style="padding: 10px 20px; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; cursor: pointer;">
                            🗑️ Delete
                        </button>
                    ` : ''}
                </div>
                ${!isNew ? `
                    <div class="section-card" style="margin-top: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 16px;">
                        <h3 style="font-size: 14px; color: #94a3b8;">🔗 Source</h3>
                        <div id="linked-info" style="font-size: 13px; color: #64748b;">
                            ${note ? (note.lessonId ? `Lesson: ${note.lessonId}` : 'No linked lesson') : ''}
                        </div>
                        ${note && note.createdAt ? `<div style="font-size: 11px; color: #475569; margin-top: 4px;">Created: ${new Date(note.createdAt).toLocaleString()}</div>` : ''}
                        ${note && note.updatedAt ? `<div style="font-size: 11px; color: #475569;">Updated: ${new Date(note.updatedAt).toLocaleString()}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        var saveBtn = document.getElementById('save-note-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var title = document.getElementById('note-title').value.trim();
                var content = document.getElementById('note-content').value.trim();
                var tagsInput = document.getElementById('note-tags').value.trim();
                var type = document.getElementById('note-type').value;
                var tags = tagsInput ? tagsInput.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [];
                if (!title && !content) {
                    alert('Please add a title or content.');
                    return;
                }
                if (isNew) {
                    LawAIApp.KnowledgeCapture.create({
                        title: title,
                        content: content,
                        tags: tags,
                        type: type
                    });
                } else {
                    LawAIApp.KnowledgeCapture.update(noteId, {
                        title: title,
                        content: content,
                        tags: tags,
                        type: type
                    });
                }
                LawAIApp.Router.navigate('notes');
            });
        }

        var deleteBtn = document.getElementById('delete-note-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Delete this note permanently?')) {
                    LawAIApp.KnowledgeCapture.remove(noteId);
                    LawAIApp.Router.navigate('notes');
                }
            });
        }
    }
};
