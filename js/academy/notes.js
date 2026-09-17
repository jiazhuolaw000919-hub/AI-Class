// notes.js — Part 177 产品化版
// Notes = 学习者拥有的知识/反思/上下文表面
// 所有 CRUD 走 NotesAuthority

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    // ============================================================
    // 1. 自动加载 CSS
    // ============================================================
    function _loadNotesCSS() {
        if (document.getElementById('notes-css')) return;
        var link = document.createElement('link');
        link.id = 'notes-css';
        link.rel = 'stylesheet';
        link.href = '/css/notes.css';
        document.head.appendChild(link);
    }

    // ============================================================
    // 2. Notes 模块
    // ============================================================
    var Notes = {
        version: '2.0.0',
        notes: [],
        _currentFilter: 'ALL',
        _root: null,
        _ready: false,

        // ============================================================
        // 生命周期
        // ============================================================
        init: function() {
            _loadNotesCSS();
            var self = this;
            var auth = window.LawAIApp?.NotesAuthority;

            if (!auth) {
                console.warn('[Notes] NotesAuthority not available');
                return this;
            }

            auth.onReady(function() {
                self._ready = true;
                console.log('[Notes] ✅ NotesAuthority ready');
                // 如果已经渲染过，刷新
                if (self._root) {
                    self.render();
                }
            });

            return this;
        },

        // ============================================================
        // 数据读取 — 只从 NotesAuthority
        // ============================================================
        refresh: function() {
            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) {
                this.notes = [];
                return this;
            }

            // NotesAuthority 用 noteId / noteType / pinned
            // notes.js UI 用 id / type / isPinned
            // 做字段映射
            this.notes = auth.getAllNotes().map(this._mapNote.bind(this));
            this.notes.sort(function(a, b) {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            return this;
        },

        /**
         * 字段映射：NotesAuthority → UI
         */
        _mapNote: function(n) {
            return {
                id: n.noteId,
                title: n.title || 'Untitled Note',
                content: n.content || '',
                type: n.noteType || 'KEY_POINT',
                tags: n.tags || [],
                isPinned: !!n.pinned,
                isFavorite: false,
                archived: !!n.archived,
                status: n.status || 'ACTIVE',
                lessonId: n.relatedLessonRef || null,
                subjectId: n.relatedSubjectRef || null,
                courseId: n.relatedCourseRef || null,
                schoolId: n.relatedSchoolRef || null,
                reflections: n.reflections || [],
                provenance: n.provenance || null,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
                _authorityNote: n
            };
        },

        // ============================================================
        // 导航
        // ============================================================
        goToDashboard: function() {
            var container = document.getElementById('academy-root') ||
                            document.getElementById('app') ||
                            document.getElementById('law-runtime-root');

            var isAcademyPage = window.location.pathname.includes('/pages/academy.html');

            if (isAcademyPage) {
                if (container) container.innerHTML = '';
                window.location.href = '/pages/academy.html';
            } else {
                if (container) container.innerHTML = '';
                if (window.LawAIApp?.Dashboard) {
                    window.LawAIApp.Dashboard._rendered = false;
                    window.LawAIApp.Dashboard.render();
                } else {
                    window.location.href = '/';
                }
            }
        },

        // ============================================================
        // 主渲染
        // ============================================================
        render: function() {
            var container = this._root ||
                            document.getElementById('academy-root') ||
                            document.getElementById('app') ||
                            document.getElementById('law-runtime-root');
            if (!container) return this;

            this._root = container;

            // Loading state: Authority 未 ready
            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) {
                container.innerHTML = this._renderLoadingState();
                var self = this;
                if (auth && auth.onReady) {
                    auth.onReady(function() {
                        self._ready = true;
                        self.render();
                    });
                }
                return this;
            }

            this.refresh();
            container.innerHTML = this._renderHTML();
            this._bindEvents();
            this._renderList();
            return this;
        },

        // ============================================================
        // State 渲染
        // ============================================================
        _renderLoadingState: function() {
            return `
                <div class="notes-container">
                    <div class="notes-loading">
                        <div class="notes-loading-spinner"></div>
                        <p>Loading notes...</p>
                    </div>
                </div>
            `;
        },

        _renderErrorState: function(message) {
            return `
                <div class="notes-container">
                    <div class="notes-empty">
                        <div class="notes-empty-icon">⚠️</div>
                        <h3>Couldn't load notes</h3>
                        <p>${message || 'Please try again.'}</p>
                        <button class="btn-primary" onclick="LawAIApp.Notes.render()">
                            Try again
                        </button>
                    </div>
                </div>
            `;
        },

        // ============================================================
        // 渲染 HTML
        // ============================================================
        _renderHTML: function() {
            var stats = this._getStats();
            var pinnedCount = this.notes.filter(function(n) { return n.isPinned; }).length;

            return `
                <div class="notes-container">
                    <!-- 返回按钮组 -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                        <button onclick="LawAIApp.Notes.goToDashboard()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:14px;">← Back to Dashboard</button>
                    </div>

                    <!-- Header -->
                    <div class="notes-header">
                        <h1>📝 Notes</h1>
                        <div class="notes-header-actions">
                            <button class="btn-primary" onclick="LawAIApp.Notes.createNew()" style="background:#4a9eff;color:white;border:none;padding:8px 20px;border-radius:100px;cursor:pointer;font-weight:600;font-family:inherit;">➕ New Note</button>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="notes-stats">
                        <div class="notes-stat-item">Total: <span>${stats.total}</span></div>
                        <div class="notes-stat-item">Pinned: <span>${pinnedCount}</span></div>
                    </div>

                    <!-- Search -->
                    <div class="notes-search-wrapper">
                        <span class="notes-search-icon">🔍</span>
                        <input type="text" id="notes-search-input" placeholder="Search notes by title, content, or tags..." />
                    </div>

                    <!-- Filters -->
                    <div class="notes-filters">
                        ${['ALL', 'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY', 'PERSONAL_NOTE', 'QUESTION', 'MISTAKE', 'INSIGHT', 'BOOKMARK'].map(function(type) {
                            var label = type === 'ALL' ? 'All' : type.replace('_', ' ');
                            var active = type === this._currentFilter;
                            return `<button class="notes-filter-btn ${active ? 'active' : ''}" data-type="${type}">${label}</button>`;
                        }.bind(this)).join('')}
                    </div>

                    <!-- List -->
                    <div id="notes-list"></div>
                </div>
            `;
        },

        // ============================================================
        // 渲染列表
        // ============================================================
        _renderList: function() {
            var container = document.getElementById('notes-list');
            if (!container) return;
            var filtered = this._getFilteredNotes();
            var sorted = this._getSortedNotes(filtered);

            if (sorted.length === 0) {
                container.innerHTML = `
                    <div class="notes-empty">
                        <div class="notes-empty-icon">📭</div>
                        <h3>No notes yet</h3>
                        <p>Capture an idea, question, or takeaway while you learn.</p>
                        <button class="btn-primary" onclick="LawAIApp.Notes.createNew()">Create a note</button>
                    </div>
                `;
                return;
            }
            container.innerHTML = sorted.map(function(note) {
                return this._renderNoteCard(note);
            }.bind(this)).join('');
        },

        // ============================================================
        // 笔记卡片
        // ============================================================
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

            // Context
            var contextHTML = '';
            var hasContext = note.lessonId || note.courseId || note.subjectId;
            if (hasContext) {
                var contextParts = [];
                if (note.schoolId) contextParts.push('🏫 ' + note.schoolId);
                if (note.courseId) contextParts.push('📚 ' + note.courseId);
                if (note.subjectId) contextParts.push('📖 ' + note.subjectId);
                if (note.lessonId) contextParts.push('📝 ' + note.lessonId);
                var contextDisplay = contextParts.join(' → ');
                contextHTML = `
                    <div style="display:flex;align-items:center;gap:8px;margin:6px 0 8px;padding:6px 12px;background:rgba(74,158,255,0.04);border-radius:6px;border-left:2px solid #4a9eff;">
                        <span style="font-size:11px;color:#64748b;">🔗</span>
                        <span style="font-size:11px;color:#94a3b8;flex:1;">${contextDisplay}</span>
                        ${note.lessonId ? `
                            <button onclick="LawAIApp.Notes.navigateToLesson('${note.lessonId}')" style="padding:3px 14px;background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.12);border-radius:100px;color:#4a9eff;font-size:10px;cursor:pointer;font-family:inherit;white-space:nowrap;">📖 Open Lesson →</button>
                        ` : ''}
                    </div>
                `;
            }

            // Reflection
            var reflectionHTML = '';
            var hasReflection = note.reflections && note.reflections.length > 0;
            if (hasReflection) {
                var latestReflection = note.reflections[note.reflections.length - 1];
                reflectionHTML = `
                    <div style="margin:6px 0 8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:6px;border-left:2px solid #8b5cf6;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:10px;color:#8b5cf6;">💭 Latest reflection</span>
                            <span style="font-size:9px;color:#64748b;">${new Date(latestReflection.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;font-style:italic;">${this._truncate(latestReflection.content, 100)}</p>
                    </div>
                `;
            }

            // Reflection input
            var reflectionInputHTML = `
                <div id="reflection-area-${note.id}" style="display:none;margin:6px 0 8px;">
                    <textarea id="reflection-input-${note.id}" placeholder="Reflect on this note... (optional)" style="width:100%;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#e2e8f0;font-family:inherit;font-size:12px;resize:vertical;min-height:50px;box-sizing:border-box;"></textarea>
                    <div style="display:flex;gap:6px;margin-top:4px;">
                        <button onclick="LawAIApp.Notes.saveReflection('${note.id}')" style="padding:4px 14px;background:#8b5cf6;border:none;border-radius:6px;color:white;font-size:11px;cursor:pointer;font-family:inherit;">💾 Save</button>
                        <button onclick="LawAIApp.Notes.toggleReflection('${note.id}')" style="padding:4px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#94a3b8;font-size:11px;cursor:pointer;font-family:inherit;">Cancel</button>
                    </div>
                </div>
            `;

            // Provenance
            var provenanceHTML = `
                <div style="margin:2px 0 6px;font-size:10px;color:#64748b;">
                    ✏️ Created by you · ${new Date(note.createdAt).toLocaleDateString()}
                </div>
            `;

            return `
                <div class="note-card ${note.isPinned ? 'pinned' : ''}" style="border-left:3px solid ${color};">
                    <div class="note-card-header">
                        <strong class="note-card-title">${note.title || 'Untitled'}</strong>
                        <span class="note-card-type" style="background:${color}22;color:${color};">${note.type || 'KEY_POINT'}</span>
                    </div>
                    ${note.content ? `<p class="note-card-content">${this._truncate(note.content, 150)}</p>` : ''}
                    ${note.tags && note.tags.length > 0 ? `
                        <div class="note-card-tags">
                            ${note.tags.map(function(t) { return `<span class="note-card-tag">#${t}</span>`; }).join('')}
                        </div>
                    ` : ''}
                    ${contextHTML}
                    ${provenanceHTML}
                    ${reflectionHTML}
                    ${reflectionInputHTML}
                    <div class="note-card-meta">
                        <span class="note-card-meta-item">🕐 ${new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="note-card-actions">
                        <button class="btn-reflect" onclick="LawAIApp.Notes.toggleReflection('${note.id}')">💭 Reflect</button>
                        <button class="btn-pin" onclick="LawAIApp.Notes.togglePin('${note.id}')">${note.isPinned ? '📌 Unpin' : '📌 Pin'}</button>
                        <button class="btn-edit" onclick="LawAIApp.Notes.editNote('${note.id}')">✏️ Edit</button>
                        <button class="btn-delete" onclick="LawAIApp.Notes.deleteNote('${note.id}')">🗑️</button>
                    </div>
                </div>
            `;
        },

        // ============================================================
        // 过滤和排序
        // ============================================================
        _getFilteredNotes: function() {
            if (this._currentFilter === 'ALL') return this.notes;
            return this.notes.filter(function(n) { return n.type === this._currentFilter; }.bind(this));
        },

        _getSortedNotes: function(notes) {
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
            return { total: this.notes.length, byType: byType };
        },

        _truncate: function(text, max) {
            if (!text) return '';
            return text.length <= max ? text : text.substring(0, max) + '...';
        },

        // ============================================================
        // 事件绑定
        // ============================================================
        _bindEvents: function() {
            var searchInput = document.getElementById('notes-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function(e) {
                    var q = e.target.value.toLowerCase();
                    var container = document.getElementById('notes-list');
                    if (!container) return;
                    if (!q) { this._renderList(); return; }
                    var filtered = this.notes.filter(function(n) {
                        return (n.title && n.title.toLowerCase().indexOf(q) !== -1) ||
                               (n.content && n.content.toLowerCase().indexOf(q) !== -1) ||
                               (n.tags && n.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
                    }.bind(this));
                    container.innerHTML = filtered.length === 0
                        ? '<div class="notes-empty"><div class="notes-empty-icon">🔍</div><h3>No results</h3></div>'
                        : filtered.map(function(note) { return this._renderNoteCard(note); }.bind(this)).join('');
                }.bind(this));
            }
            var buttons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener('click', function(e) {
                    this.filterBy(e.target.getAttribute('data-type'));
                }.bind(this));
            }
        },

        // ============================================================
        // Actions — 全部走 NotesAuthority
        // ============================================================
        filterBy: function(type) {
            this._currentFilter = type;
            var buttons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < buttons.length; i++) {
                var active = buttons[i].getAttribute('data-type') === type;
                if (active) buttons[i].classList.add('active');
                else buttons[i].classList.remove('active');
            }
            this._renderList();
        },

        createNew: function(context) {
            var editor = window.LawAIApp?.KnowledgeEditor;
            if (editor && editor.render) {
                editor.render({ noteId: 'new', context: context || {} });
            }
        },

        editNote: function(id) {
            var editor = window.LawAIApp?.KnowledgeEditor;
            if (editor && editor.render) {
                editor.render({ noteId: id });
            }
        },

        deleteNote: function(id) {
            if (!confirm('Delete this note?')) return;
            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) return;

            var result = auth.delete(id);
            if (result.success) {
                this.refresh();
                this._renderList();
                if (window.LawAIApp?.Toast?.success) {
                    LawAIApp.Toast.success('🗑️ Note deleted');
                }
            } else {
                if (window.LawAIApp?.Toast?.error) {
                    LawAIApp.Toast.error('Couldn\'t delete note. Please try again.');
                }
            }
        },

        togglePin: function(id) {
            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) return;

            var note = auth.getNote(id);
            if (!note) return;

            var result = note.pinned ? auth.unpin(id) : auth.pin(id);
            if (result.success) {
                this.refresh();
                this._renderList();
            }
        },

        // ============================================================
        // 导航到 Lesson
        // ============================================================
        navigateToLesson: function(lessonId) {
            try {
                localStorage.setItem('lawai_notes_return_context', JSON.stringify({
                    from: 'notes', timestamp: Date.now(), lessonId: lessonId
                }));
            } catch (e) {}
            window.location.href = '/pages/academy.html?view=lesson&id=' + encodeURIComponent(lessonId) + '&returnTo=notes';
        },

        // ============================================================
        // Reflection — 走 NotesAuthority
        // ============================================================
        toggleReflection: function(noteId) {
            var area = document.getElementById('reflection-area-' + noteId);
            if (!area) return;
            var visible = area.style.display !== 'none';
            area.style.display = visible ? 'none' : 'block';
            if (!visible) {
                var input = document.getElementById('reflection-input-' + noteId);
                if (input) setTimeout(function() { input.focus(); }, 100);
            }
        },

        saveReflection: function(noteId) {
            var input = document.getElementById('reflection-input-' + noteId);
            if (!input) return;
            var content = input.value.trim();
            if (!content) {
                if (window.LawAIApp?.Toast?.info) LawAIApp.Toast.info('Please write something first.');
                return;
            }

            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) {
                if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Notes not ready.');
                return;
            }

            var result = auth.addReflection(noteId, content);
            if (result.success) {
                input.value = '';
                var area = document.getElementById('reflection-area-' + noteId);
                if (area) area.style.display = 'none';
                this.refresh();
                this._renderList();
                if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('💭 Reflection saved');
            } else {
                if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Couldn\'t save reflection.');
            }
        },

        getReflections: function(noteId) {
            var auth = window.LawAIApp?.NotesAuthority;
            if (!auth || !auth.isReady) return [];
            return auth.getReflections(noteId);
        },

        getStats: function() { this.refresh(); return this._getStats(); },
        getNotes: function() { this.refresh(); return this.notes; }
    };

    window.LawAIApp.Notes = Notes;

    // 自动初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() { Notes.init(); }, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() { Notes.init(); }, 100);
        });
    }

    console.log('[Notes] ✅ Module loaded (v2.0.0 — Part 177)');
})();
