// notes.js — S4 升级版 (Part 34)
// 包含：自动加载 CSS、Notes Tab 渲染、KnowledgeCapture 集成

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    // ============================================================
    // 1. 自动加载 CSS（如果尚未加载）
    // ============================================================
    function _loadNotesCSS() {
        if (document.getElementById('notes-css')) return;
        var link = document.createElement('link');
        link.id = 'notes-css';
        link.rel = 'stylesheet';
        link.href = '/css/notes.css';
        document.head.appendChild(link);
        console.log('[Notes] ✅ CSS loaded');
    }

    // ============================================================
    // 2. Notes 模块
    // ============================================================
    var Notes = {
        notes: [],
        _currentFilter: 'ALL',
        _currentSort: 'recent',

        /**
         * 初始化 Notes 模块
         */
        init: function() {
            _loadNotesCSS();
            this.refresh();
            console.log('[Notes] 📝 S4 module initialized');
            return this;
        },

        /**
         * 刷新笔记列表（从 KnowledgeCapture 同步）
         */
        refresh: function() {
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.getNotes === 'function') {
                this.notes = capture.getNotes() || [];
            } else {
                this.notes = [];
            }
            // 按更新时间排序
            this.notes.sort(function(a, b) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            return this;
        },

        /**
         * 渲染 Notes Tab（主入口）
         */
        render: function() {
            this.refresh();
            var container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[Notes] #academy-root not found');
                return;
            }
            container.innerHTML = this._renderHTML();
            this._bindEvents();
            this._renderList();
            return this;
        },

        // ============================================================
        // 3. 渲染 HTML
        // ============================================================
        _renderHTML: function() {
            var stats = this._getStats();
            var pinnedCount = this.notes.filter(function(n) { return n.isPinned; }).length;

            return `
                <div class="notes-container">
                    <!-- Header -->
                    <div class="notes-header">
                        <h1>📝 Notes</h1>
                        <div class="notes-header-actions">
                            <button class="notes-filter-btn" onclick="LawAIApp.Notes.createNew()" 
                                    style="background:#4a9eff; color:white; border:none; padding:8px 20px; border-radius:8px; cursor:pointer; font-weight:600; font-family:inherit;">
                                ➕ New Note
                            </button>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="notes-stats">
                        <span class="notes-stat-item">📚 Total: <span>${stats.total}</span></span>
                        <span class="notes-stat-item">📌 Pinned: <span>${pinnedCount}</span></span>
                        ${Object.keys(stats.byType).map(function(type) {
                            return `<span class="notes-stat-item">${type.replace('_', ' ')}: <span>${stats.byType[type]}</span></span>`;
                        }).join('')}
                    </div>

                    <!-- Search -->
                    <div class="notes-search-wrapper">
                        <span class="notes-search-icon">🔍</span>
                        <input type="text" id="notes-search-input" placeholder="Search notes by title, content, or tags..." />
                    </div>

                    <!-- Filters -->
                    <div class="notes-filters" id="notes-filters">
                        ${['ALL', 'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY', 'PERSONAL_NOTE', 'MISTAKE', 'INSIGHT'].map(function(type) {
                            var label = type === 'ALL' ? 'All' : type.replace('_', ' ');
                            var active = type === this._currentFilter ? 'active' : '';
                            return `<button class="notes-filter-btn ${active}" data-type="${type}">${label}</button>`;
                        }.bind(this)).join('')}
                    </div>

                    <!-- List -->
                    <div id="notes-list"></div>
                </div>
            `;
        },

        // ============================================================
        // 4. 渲染列表
        // ============================================================
        _renderList: function() {
            var container = document.getElementById('notes-list');
            if (!container) return;

            var filtered = this._getFilteredNotes();
            var sorted = this._getSortedNotes(filtered);

            if (sorted.length === 0) {
                container.innerHTML = this._renderEmptyState();
                return;
            }

            container.innerHTML = sorted.map(function(note) {
                return this._renderNoteCard(note);
            }.bind(this)).join('');
        },

        _renderNoteCard: function(note) {
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
            var color = typeColors[note.type] || '#4a9eff';
            var pinnedClass = note.isPinned ? 'pinned' : '';

            return `
                <div class="note-card ${pinnedClass} note-card-enter" style="border-left-color: ${color};">
                    <div class="note-card-header">
                        <div class="note-card-title">${note.title || 'Untitled'}</div>
                        <span class="note-card-type" style="background: ${color}22; color: ${color};">${note.type || 'KEY_POINT'}</span>
                    </div>
                    ${note.content ? `<div class="note-card-content">${this._truncate(note.content, 200)}</div>` : ''}
                    ${note.tags && note.tags.length > 0 ? `
                        <div class="note-card-tags">
                            ${note.tags.map(function(t) {
                                return `<span class="note-card-tag">#${t}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}
                    <div class="note-card-meta">
                        <span class="note-card-meta-item">📚 ${note.courseId || 'No Course'}</span>
                        <span class="note-card-meta-item">📖 ${note.lessonId || 'No Lesson'}</span>
                        <span class="note-card-meta-item">🕐 ${new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="note-card-actions">
                        <button class="btn-pin" onclick="LawAIApp.Notes.togglePin('${note.id}')">
                            ${note.isPinned ? '📌 Unpin' : '📌 Pin'}
                        </button>
                        <button class="btn-edit" onclick="LawAIApp.Notes.editNote('${note.id}')">
                            ✏️ Edit
                        </button>
                        <button class="btn-delete" onclick="LawAIApp.Notes.deleteNote('${note.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        },

        // ============================================================
        // 5. 空状态
        // ============================================================
        _renderEmptyState: function() {
            var message = this._currentFilter === 'ALL' ?
                'No notes yet. Start saving important ideas while you learn!' :
                'No notes of this type yet.';
            return `
                <div class="notes-empty">
                    <div class="notes-empty-icon">📭</div>
                    <h3>${this._currentFilter === 'ALL' ? 'No notes yet' : 'No matching notes'}</h3>
                    <p>${message}</p>
                    ${this._currentFilter === 'ALL' ? `
                        <button class="btn-primary" onclick="LawAIApp.Notes.createNew()">➕ Create your first note</button>
                    ` : `
                        <button class="btn-primary" onclick="LawAIApp.Notes.filterBy('ALL')">Show all notes</button>
                    `}
                </div>
            `;
        },

        // ============================================================
        // 6. 业务逻辑
        // ============================================================
        _getFilteredNotes: function() {
            if (this._currentFilter === 'ALL') return this.notes;
            return this.notes.filter(function(n) {
                return n.type === this._currentFilter;
            }.bind(this));
        },

        _getSortedNotes: function(notes) {
            // Pinned 优先，然后按更新时间
            return notes.slice().sort(function(a, b) {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
        },

        _getStats: function() {
            var byType = {};
            for (var i = 0; i < this.notes.length; i++) {
                var type = this.notes[i].type || 'KEY_POINT';
                byType[type] = (byType[type] || 0) + 1;
            }
            return {
                total: this.notes.length,
                byType: byType
            };
        },

        _truncate: function(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        },

        // ============================================================
        // 7. 事件绑定
        // ============================================================
        _bindEvents: function() {
            // Search
            var searchInput = document.getElementById('notes-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    var q = e.target.value.toLowerCase();
                    var container = document.getElementById('notes-list');
                    if (!container) return;

                    if (!q) {
                        this._renderList();
                        return;
                    }

                    var filtered = this.notes.filter(function(n) {
                        return (n.title && n.title.toLowerCase().indexOf(q) !== -1) ||
                               (n.content && n.content.toLowerCase().indexOf(q) !== -1) ||
                               (n.tags && n.tags.some(function(t) {
                                   return t.toLowerCase().indexOf(q) !== -1;
                               }));
                    }.bind(this));

                    if (filtered.length === 0) {
                        container.innerHTML = `
                            <div class="notes-empty">
                                <div class="notes-empty-icon">🔍</div>
                                <h3>No results found</h3>
                                <p>Try a different search term.</p>
                            </div>
                        `;
                    } else {
                        container.innerHTML = filtered.map(function(note) {
                            return this._renderNoteCard(note);
                        }.bind(this)).join('');
                    }
                }.bind(this));
            }

            // Filters
            var filterButtons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < filterButtons.length; i++) {
                filterButtons[i].addEventListener('click', function(e) {
                    var type = e.target.getAttribute('data-type');
                    this.filterBy(type);
                }.bind(this));
            }
        },

        // ============================================================
        // 8. 公共 Actions
        // ============================================================
        filterBy: function(type) {
            this._currentFilter = type;
            // 更新按钮状态
            var buttons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.toggle('active', buttons[i].getAttribute('data-type') === type);
            }
            this._renderList();
        },

        createNew: function() {
            // 跳转到新建笔记页面（如果有 Router）
            var router = window.LawAIApp?.Router;
            if (router && typeof router.navigate === 'function') {
                router.navigate('knowledge-editor', { noteId: 'new' });
            } else {
                // Fallback: 直接打开编辑器
                var editor = window.LawAIApp?.KnowledgeEditor;
                if (editor && typeof editor.render === 'function') {
                    editor.render({ noteId: 'new' });
                } else {
                    console.warn('[Notes] KnowledgeEditor not available');
                }
            }
        },

        editNote: function(noteId) {
            var router = window.LawAIApp?.Router;
            if (router && typeof router.navigate === 'function') {
                router.navigate('knowledge-editor', { noteId: noteId });
            } else {
                var editor = window.LawAIApp?.KnowledgeEditor;
                if (editor && typeof editor.render === 'function') {
                    editor.render({ noteId: noteId });
                }
            }
        },

        deleteNote: function(noteId) {
            if (!confirm('Delete this note permanently?')) return;
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.remove === 'function') {
                capture.remove(noteId);
                this.refresh();
                this._renderList();
                console.log('[Notes] ✅ Note deleted:', noteId);
            }
        },

        togglePin: function(noteId) {
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.togglePin === 'function') {
                capture.togglePin(noteId);
                this.refresh();
                this._renderList();
                console.log('[Notes] ✅ Pin toggled:', noteId);
            }
        },

        // ============================================================
        // 9. 获取状态
        // ============================================================
        getStats: function() {
            this.refresh();
            return this._getStats();
        },

        getNotes: function() {
            this.refresh();
            return this.notes;
        }
    };

    // ============================================================
    // 10. 挂载到 LawAIApp
    // ============================================================
    window.LawAIApp.Notes = Notes;

    // 如果 Notes Tab 需要自动渲染，由外部调用 Notes.render()

    console.log('[Notes] 📝 S4 module loaded');

})();
