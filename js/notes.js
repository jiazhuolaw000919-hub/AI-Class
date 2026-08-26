// notes.js — S4 升级版 (Part 34)
window.LawAIApp = window.LawAIApp || {};

LawAIApp.Notes = {
    // 使用 KnowledgeCapture 作为数据源
    notes: [],

    init: function() {
        this.refresh();
        console.log('📝 Notes (S4) initialized');
        return this;
    },

    refresh: function() {
        var capture = window.LawAIApp?.KnowledgeCapture;
        if (capture) {
            this.notes = capture.getNotes ? capture.getNotes() : [];
        }
        return this;
    },

    render: function() {
        this.refresh();
        var html = `
            <div class="page">
                <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" 
                        style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
                    ← Back
                </button>
                <h2>📝 Notebook</h2>
                <input class="search-box" placeholder="Search notes..." id="notes-search">
                <div style="margin: 8px 0; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('ALL')">All</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('KEY_POINT')">Key Points</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('DEFINITION')">Definitions</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('EXAMPLE')">Examples</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('SUMMARY')">Summaries</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('MISTAKE')">Mistakes</button>
                    <button class="quick-btn" onclick="LawAIApp.Notes.filterByType('INSIGHT')">Insights</button>
                </div>
                <div id="notes-container"></div>
            </div>
        `;
        document.getElementById('app').innerHTML = html;
        this.displayNotes(this.notes);

        var searchInput = document.getElementById('notes-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var q = e.target.value.toLowerCase();
                var filtered = this.notes.filter(function(n) {
                    return (n.title && n.title.toLowerCase().indexOf(q) !== -1) ||
                           (n.content && n.content.toLowerCase().indexOf(q) !== -1) ||
                           (n.tags && n.tags.some(function(t) {
                               return t.toLowerCase().indexOf(q) !== -1;
                           }));
                });
                this.displayNotes(filtered);
            }.bind(this));
        }
    },

    displayNotes: function(list) {
        var container = document.getElementById('notes-container');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                    <p style="font-size: 16px;">No notes yet</p>
                    <p style="font-size: 14px; color: #64748b;">Save important ideas while you learn</p>
                    <button class="quick-btn" onclick="LawAIApp.Router.navigate('academy')" 
                            style="margin-top: 12px; padding: 8px 20px; background: #4a9eff; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Go to Academy →
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(function(n) {
            var typeLabel = n.type || 'KEY_POINT';
            var typeColors = {
                KEY_POINT: '#4a9eff',
                DEFINITION: '#10b981',
                EXAMPLE: '#f59e0b',
                SUMMARY: '#8b5cf6',
                PERSONAL_NOTE: '#ec4899',
                QUESTION: '#ef4444',
                MISTAKE: '#ef4444',
                INSIGHT: '#14b8a6',
                BOOKMARK: '#f472b6'
            };
            var color = typeColors[typeLabel] || '#4a9eff';
            return `
                <div class="note-card" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 3px solid ${color};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <strong style="font-size: 15px;">${n.title || 'Untitled'}</strong>
                            <span style="font-size: 11px; color: ${color}; background: rgba(255,255,255,0.06); padding: 1px 8px; border-radius: 10px; margin-left: 8px;">${typeLabel.replace('_', ' ')}</span>
                        </div>
                        ${n.isPinned ? '<span style="font-size: 14px;">📌</span>' : ''}
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; margin: 6px 0 0;">${n.content ? n.content.substring(0, 120) + (n.content.length > 120 ? '...' : '') : ''}</p>
                    ${n.tags && n.tags.length > 0 ? `
                        <div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
                            ${n.tags.map(function(t) {
                                return `<span style="font-size: 10px; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 10px; color: #64748b;">#${t}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}
                    ${n.courseId ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">📚 ${n.courseId}</div>` : ''}
                    <div style="font-size: 10px; color: #475569; margin-top: 4px;">${new Date(n.createdAt).toLocaleDateString()}</div>
                    <div style="margin-top: 8px; display: flex; gap: 8px;">
                        <button class="quick-btn" onclick="LawAIApp.KnowledgeCapture.togglePin('${n.id}'); LawAIApp.Notes.refresh(); LawAIApp.Notes.render();" 
                                style="font-size: 11px; padding: 2px 10px;">
                            ${n.isPinned ? '📌 Unpin' : '📌 Pin'}
                        </button>
                        <button class="quick-btn" onclick="LawAIApp.Router.navigate('knowledge-editor', { noteId: '${n.id}' })" 
                                style="font-size: 11px; padding: 2px 10px;">
                            ✏️ Edit
                        </button>
                        <button class="quick-btn" onclick="if(confirm('Delete this note?')){LawAIApp.KnowledgeCapture.remove('${n.id}'); LawAIApp.Notes.refresh(); LawAIApp.Notes.render();}" 
                                style="font-size: 11px; padding: 2px 10px; color: #ef4444;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterByType: function(type) {
        this.refresh();
        var container = document.getElementById('notes-container');
        if (!container) return;
        var list = type === 'ALL' ? this.notes : this.notes.filter(function(n) {
            return n.type === type;
        });
        this.displayNotes(list);
    },

    getStats: function() {
        this.refresh();
        return {
            total: this.notes.length,
            byType: this.notes.reduce(function(acc, n) {
                var type = n.type || 'KEY_POINT';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})
        };
    }
};

console.log('📝 Notes (S4) loaded');
