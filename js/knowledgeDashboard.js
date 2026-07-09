// ===========================================
// knowledgeDashboard.js
// 知识捕获仪表盘 - 知识管理（Season 2 Phase 49 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.KnowledgeDashboard = {
    render: function() {
        var app = document.getElementById('app');
        if (!app) return;

        // 获取笔记数据
        var notes = this._getNotes();
        var pinned = notes.filter(function(n) { return n.isPinned; });
        var favorites = notes.filter(function(n) { return n.isFavorite; });
        var recent = notes.slice(0, 5);

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 style="margin:0;font-size:22px;font-weight:700;">📓 Knowledge Capture</h2>
                    <button onclick="LawAIApp.Views.KnowledgeDashboard._newNote()" style="padding:8px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;font-weight:600;cursor:pointer;">+ New Note</button>
                </div>

                <input class="search-box" id="note-search" placeholder="Search notes..." style="
                    width:100%;
                    padding:12px 16px;
                    background:rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;
                    color:#e2e8f0;
                    font-size:14px;
                    margin-bottom:16px;
                ">

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">📝 Total</div>
                        <div style="font-size:20px;font-weight:700;">${notes.length}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">⭐ Favorites</div>
                        <div style="font-size:20px;font-weight:700;">${favorites.length}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">📌 Pinned</div>
                        <div style="font-size:20px;font-weight:700;">${pinned.length}</div>
                    </div>
                </div>

                ${pinned.length > 0 ? `
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                        <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📌 Pinned</h3>
                        ${this._renderNoteCards(pinned)}
                    </div>
                ` : ''}

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🕒 Recent</h3>
                    ${notes.length === 0 ? '<p style="color:#64748b;font-size:13px;">Your knowledge library is empty. Start capturing your first insight.</p>' : this._renderNoteCards(recent)}
                </div>

                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button onclick="alert('Favorites coming soon')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">⭐ Favorites</button>
                    <button onclick="alert('Export coming soon')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">📤 Export</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
        this._attachEvents();
    },

    _renderNoteCards: function(notesArray) {
        if (!notesArray || notesArray.length === 0) {
            return '<p style="color:#64748b;font-size:13px;">No notes.</p>';
        }
        return notesArray.map(function(note) {
            return `
                <div style="padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;cursor:pointer;" onclick="LawAIApp.Views.KnowledgeDashboard._editNote('${note.id}')">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong style="font-size:14px;">${note.title || 'Untitled'}</strong>
                        <div>
                            ${note.isPinned ? '📌' : ''}
                            ${note.isFavorite ? '⭐' : ''}
                        </div>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">${(note.content || '').substring(0, 80)}${(note.content || '').length > 80 ? '...' : ''}</p>
                    ${note.tags && note.tags.length > 0 ? `
                        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                            ${note.tags.map(function(tag) { return '<span style="background:rgba(74,158,255,0.12);color:#4a9eff;padding:2px 8px;border-radius:12px;font-size:10px;">' + tag + '</span>'; }).join('')}
                        </div>
                    ` : ''}
                    <small style="color:#64748b;font-size:11px;">${new Date(note.updatedAt || Date.now()).toLocaleDateString()}</small>
                </div>
            `;
        }).join('');
    },

    _getNotes: function() {
        try {
            if (LawAIApp.KnowledgeCapture && typeof LawAIApp.KnowledgeCapture.getNotes === 'function') {
                return LawAIApp.KnowledgeCapture.getNotes() || [];
            }
        } catch (e) {}
        // 内置示例数据
        return [
            { id: 'note_1', title: 'AI Basics', content: 'AI is the simulation of human intelligence in machines.', isPinned: true, isFavorite: true, tags: ['AI', 'Basics'], updatedAt: Date.now() },
            { id: 'note_2', title: 'Prompt Engineering Tips', content: 'Be specific and provide context when crafting prompts.', isPinned: false, isFavorite: false, tags: ['Prompt', 'Tips'], updatedAt: Date.now() - 86400000 },
            { id: 'note_3', title: 'Learning Resources', content: 'OpenAI docs, Hugging Face, and Law AI Academy.', isPinned: false, isFavorite: true, tags: ['Resources'], updatedAt: Date.now() - 172800000 }
        ];
    },

    _newNote: function() {
        var notes = this._getNotes();
        var newNote = {
            id: 'note_' + Date.now(),
            title: 'Untitled Note',
            content: '',
            isPinned: false,
            isFavorite: false,
            tags: [],
            updatedAt: Date.now()
        };
        notes.push(newNote);
        this._saveNotes(notes);
        this.render();
        // 打开编辑
        setTimeout(function() {
            LawAIApp.Views.KnowledgeDashboard._editNote(newNote.id);
        }, 100);
    },

    _editNote: function(noteId) {
        alert('📝 Edit note: ' + noteId + '\n\nFull editor coming in Phase 49!');
    },

    _saveNotes: function(notes) {
        try {
            if (LawAIApp.KnowledgeCapture && typeof LawAIApp.KnowledgeCapture.saveNotes === 'function') {
                LawAIApp.KnowledgeCapture.saveNotes(notes);
                return;
            }
        } catch (e) {}
        // 保存到 localStorage
        try {
            localStorage.setItem('lawai_knowledge_notes', JSON.stringify(notes));
        } catch (e) {}
    },

    _attachEvents: function() {
        var searchInput = document.getElementById('note-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var query = e.target.value.trim();
                if (!query) {
                    LawAIApp.Views.KnowledgeDashboard.render();
                    return;
                }
                var notes = LawAIApp.Views.KnowledgeDashboard._getNotes();
                var q = query.toLowerCase();
                var results = notes.filter(function(n) {
                    return (n.title || '').toLowerCase().indexOf(q) !== -1 ||
                           (n.content || '').toLowerCase().indexOf(q) !== -1 ||
                           (n.tags || []).some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
                });
                var container = document.querySelector('#recent-list');
                if (container) {
                    container.innerHTML = results.length > 0 ? 
                        LawAIApp.Views.KnowledgeDashboard._renderNoteCards(results) : 
                        '<p style="color:#64748b;font-size:13px;">No results.</p>';
                }
            });
        }
    }
};

console.log('📓 KnowledgeDashboard V2.0 ready');
