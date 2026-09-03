// notes.js — S4 升级版 (Part 34)
// 包含：自动加载 CSS、Notes Tab 渲染、KnowledgeCapture 集成、Back 按钮

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

        init: function() {
            _loadNotesCSS();
            this.refresh();
            console.log('[Notes] 📝 S4 module initialized');
            return this;
        },

        refresh: function() {
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.getNotes === 'function') {
                this.notes = capture.getNotes() || [];
            } else {
                this.notes = [];
            }
            this.notes.sort(function(a, b) {
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            return this;
        },

        // ============================================================
        // 🔥 返回 Dashboard
        // ============================================================
        goToDashboard: function() {
            console.log('[Notes] 📊 Back to Dashboard');
            var container = document.getElementById('academy-root') || 
                            document.getElementById('app') ||
                            document.getElementById('law-runtime-root');
            if (container) {
                container.innerHTML = '';
            }
            if (window.LawAIApp?.Dashboard) {
                if (typeof window.LawAIApp.Dashboard._forceRender === 'function') {
                    window.LawAIApp.Dashboard._forceRender();
                } else {
                    window.LawAIApp.Dashboard._rendered = false;
                    window.LawAIApp.Dashboard.render();
                }
            } else {
                window.location.href = '/';
            }
        },

        render: function() {
            this.refresh();
    
            var container = document.getElementById('academy-root') || 
                            document.getElementById('app') ||
                            document.getElementById('law-runtime-root');
                    
            if (!container) {
                console.warn('[Notes] No container found');
                return;
            }
    
            container.innerHTML = this._renderHTML();
            this._bindEvents();
            this._renderList();
            return this;
        },

        // ============================================================
        // 3. 渲染 HTML（添加 Back 按钮）
        // ============================================================
        _renderHTML: function() {
            var stats = this._getStats();
            var pinnedCount = this.notes.filter(function(n) { return n.isPinned; }).length;

            return `
                <div class="notes-container" style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
                
                    <!-- 🔥 返回按钮组 -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                        <button onclick="LawAIApp.Notes.goToDashboard()" style="
                            background:rgba(74,158,255,0.08);
                            border:1px solid rgba(74,158,255,0.15);
                            color:#4a9eff;
                            padding:10px 16px;
                            border-radius:10px;
                            cursor:pointer;
                            font-family:inherit;
                            font-size:14px;
                            transition:all 0.2s;
                        " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
                            ← Back to Dashboard
                        </button>
                        <button onclick="history.back()" style="
                            background:rgba(255,255,255,0.04);
                            border:1px solid rgba(255,255,255,0.06);
                            color:#94a3b8;
                            padding:10px 16px;
                            border-radius:10px;
                            cursor:pointer;
                            font-family:inherit;
                            font-size:14px;
                            transition:all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            ⬅️ 返回上一页
                        </button>
                    </div>

                    <!-- Header -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
                        <h1 style="margin:0;font-size:24px;font-weight:700;">📝 Notes</h1>
                        <div>
                            <button onclick="LawAIApp.Notes.createNew()" 
                                    style="background:#4a9eff; color:white; border:none; padding:8px 20px; border-radius:100px; cursor:pointer; font-weight:600; font-family:inherit;">
                                ➕ New Note
                            </button>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                        <span style="font-size:12px;background:rgba(255,255,255,0.04);padding:4px 14px;border-radius:100px;color:#94a3b8;">📚 Total: <span style="color:#e2e8f0;">${stats.total}</span></span>
                        <span style="font-size:12px;background:rgba(255,255,255,0.04);padding:4px 14px;border-radius:100px;color:#94a3b8;">📌 Pinned: <span style="color:#e2e8f0;">${pinnedCount}</span></span>
                    </div>

                    <!-- Search -->
                    <div style="position:relative;margin-bottom:12px;">
                        <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);">🔍</span>
                        <input type="text" id="notes-search-input" placeholder="Search notes..." style="
                            width:100%;
                            padding:10px 14px 10px 40px;
                            background:rgba(255,255,255,0.04);
                            border:1px solid rgba(255,255,255,0.06);
                            border-radius:100px;
                            color:#e2e8f0;
                            font-family:inherit;
                            font-size:14px;
                            box-sizing:border-box;
                        " />
                    </div>

                    <!-- Filters -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
                        ${['ALL', 'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY', 'PERSONAL_NOTE', 'MISTAKE', 'INSIGHT'].map(function(type) {
                            var label = type === 'ALL' ? 'All' : type.replace('_', ' ');
                            var active = type === this._currentFilter ? 'active' : '';
                            return `<button class="notes-filter-btn" data-type="${type}" style="
                                padding:4px 14px;
                                background:${active ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.04)'};
                                border:1px solid ${active ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'};
                                border-radius:100px;
                                color:${active ? '#4a9eff' : '#94a3b8'};
                                font-size:11px;
                                cursor:pointer;
                                font-family:inherit;
                            ">${label}</button>`;
                        }.bind(this)).join('')}
                    </div>

                    <!-- List -->
                    <div id="notes-list"></div>
                </div>
            `;
        },

        _renderList: function() {
            var container = document.getElementById('notes-list');
            if (!container) return;

            var filtered = this._getFilteredNotes();
            var sorted = this._getSortedNotes(filtered);

            if (sorted.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center;padding:40px;color:#64748b;">
                        <div style="font-size:48px;margin-bottom:12px;">📭</div>
                        <h3 style="color:#94a3b8;margin:0 0 4px;">No notes yet</h3>
                        <p style="margin:0 0 12px;">Start saving important ideas while you learn!</p>
                        <button onclick="LawAIApp.Notes.createNew()" style="
                            padding:8px 20px;
                            background:#4a9eff;
                            border:none;
                            border-radius:100px;
                            color:white;
                            font-size:13px;
                            cursor:pointer;
                            font-family:inherit;
                        ">➕ Create your first note</button>
                    </div>
                `;
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

            // 🔥 Part 115: 构建 Context 显示
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
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        margin:6px 0 8px;
                        padding:6px 12px;
                        background:rgba(74,158,255,0.04);
                        border-radius:6px;
                        border-left:2px solid #4a9eff;
                    ">
                        <span style="font-size:11px;color:#64748b;">🔗</span>
                        <span style="font-size:11px;color:#94a3b8;flex:1;">${contextDisplay}</span>
                        ${note.lessonId ? `
                            <button onclick="LawAIApp.Notes.navigateToLesson('${note.lessonId}')" style="
                                padding:3px 14px;
                                background:rgba(74,158,255,0.08);
                                border:1px solid rgba(74,158,255,0.12);
                                border-radius:100px;
                                color:#4a9eff;
                                font-size:10px;
                                cursor:pointer;
                                font-family:inherit;
                                transition:all 0.2s;
                                white-space:nowrap;
                            " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
                                📖 Open Lesson →
                            </button>
                        ` : ''}
                    </div>
                `;
            }

            // 返回完整卡片 HTML
            return `
                <div style="
                    background:rgba(255,255,255,0.03);
                    border-radius:12px;
                    padding:14px 16px;
                    border:1px solid rgba(255,255,255,0.04);
                    border-left:3px solid ${color};
                    margin-bottom:8px;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <strong style="font-size:14px;">${note.title || 'Untitled'}</strong>
                        <span style="font-size:10px;background:${color}22;color:${color};padding:2px 10px;border-radius:100px;">${note.type || 'KEY_POINT'}</span>
                    </div>
                    ${note.content ? `<p style="color:#94a3b8;font-size:13px;margin:0 0 8px;line-height:1.5;">${this._truncate(note.content, 150)}</p>` : ''}
                    ${note.tags && note.tags.length > 0 ? `
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                            ${note.tags.map(function(t) { return `<span style="font-size:10px;color:#64748b;background:rgba(255,255,255,0.03);padding:2px 8px;border-radius:100px;">#${t}</span>`; }).join('')}
                        </div>
                    ` : ''}
                    ${contextHTML}
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                        <span style="font-size:11px;color:#64748b;">🕐 ${new Date(note.updatedAt).toLocaleDateString()}</span>
                        <div style="display:flex;gap:4px;">
                            <button onclick="LawAIApp.Notes.togglePin('${note.id}')" style="
                                padding:2px 10px;
                                background:rgba(255,255,255,0.04);
                                border:1px solid rgba(255,255,255,0.06);
                                border-radius:100px;
                                color:#94a3b8;
                                font-size:10px;
                                cursor:pointer;
                                font-family:inherit;
                                transition:all 0.2s;
                            " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                                ${note.isPinned ? '📌 Unpin' : '📌 Pin'}
                            </button>
                            <button onclick="LawAIApp.Notes.editNote('${note.id}')" style="
                                padding:2px 10px;
                                background:rgba(255,255,255,0.04);
                                border:1px solid rgba(255,255,255,0.06);
                                border-radius:100px;
                                color:#94a3b8;
                                font-size:10px;
                                cursor:pointer;
                                font-family:inherit;
                                transition:all 0.2s;
                            " onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                                ✏️ Edit
                            </button>
                            <button onclick="LawAIApp.Notes.deleteNote('${note.id}')" style="
                                padding:2px 10px;
                                background:rgba(239,68,68,0.06);
                                border:1px solid rgba(239,68,68,0.08);
                                border-radius:100px;
                                color:#ef4444;
                                font-size:10px;
                                cursor:pointer;
                                font-family:inherit;
                                transition:all 0.2s;
                            " onmouseover="this.style.background='rgba(239,68,68,0.12)'" onmouseout="this.style.background='rgba(239,68,68,0.06)'">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

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

        _truncate: function(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        },

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
            
                    if (filtered.length === 0) {
                        container.innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">🔍 No results found</div>';
                    } else {
                        // 🔥 Part 115: 搜索结果也显示 Context
                        container.innerHTML = filtered.map(function(note) {
                            return this._renderNoteCard(note);
                        }.bind(this)).join('');
                    }
                }.bind(this));
            }
            var filterButtons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < filterButtons.length; i++) {
                filterButtons[i].addEventListener('click', function(e) {
                    var type = e.target.getAttribute('data-type');
                    this.filterBy(type);
                }.bind(this));
            }
        },

        filterBy: function(type) {
            this._currentFilter = type;
            var buttons = document.querySelectorAll('.notes-filter-btn');
            for (var i = 0; i < buttons.length; i++) {
                var isActive = buttons[i].getAttribute('data-type') === type;
                buttons[i].style.background = isActive ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.04)';
                buttons[i].style.color = isActive ? '#4a9eff' : '#94a3b8';
                buttons[i].style.border = isActive ? '1px solid rgba(74,158,255,0.2)' : '1px solid rgba(255,255,255,0.06)';
            }
            this._renderList();
        },

        // ============================================================
        // 原有 createNew 方法 - 替换为支持 Context
        // ============================================================
        createNew: function(context) {
            // 如果传入了 context，使用增强版
            if (context && (context.lessonId || context.courseId)) {
                this.createNoteWithContext(context);
                return;
            }
    
            // 原有逻辑: 直接打开编辑器 (无 Context)
            var editor = window.LawAIApp?.KnowledgeEditor;
            if (editor && typeof editor.render === 'function') {
                editor.render({ noteId: 'new' });
            } else {
                console.warn('[Notes] KnowledgeEditor not available');
            }
        },
        editNote: function(noteId) {
            var editor = window.LawAIApp?.KnowledgeEditor;
            if (editor && typeof editor.render === 'function') {
                editor.render({ noteId: noteId });
            }
        },
        deleteNote: function(noteId) {
            if (!confirm('Delete this note permanently?')) return;
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.remove === 'function') {
                capture.remove(noteId);
                this.refresh();
                this._renderList();
            }
        },
        togglePin: function(noteId) {
            var capture = window.LawAIApp?.KnowledgeCapture;
            if (capture && typeof capture.togglePin === 'function') {
                capture.togglePin(noteId);
                this.refresh();
                this._renderList();
            }
        },
        getStats: function() { this.refresh(); return this._getStats(); },
        getNotes: function() { this.refresh(); return this.notes; }
    };

    // notes.js — 在 Notes 对象内部，所有方法之后

    var Notes = {
    // ... 所有现有方法 (init, refresh, render, _renderHTML, _renderList, _renderNoteCard, _getFilteredNotes, _getSortedNotes, _getStats, _truncate, _bindEvents, filterBy, createNew, editNote, deleteNote, togglePin, getStats, getNotes) ...


     * 导航到 Lesson (从 Context 链接)
     * Part 115: 增强返回路径
     */
    navigateToLesson: function(lessonId) {
        console.log('[Notes] 📖 Navigating to lesson:', lessonId);
    
        // 保存当前状态，以便返回
        try {
            localStorage.setItem('lawai_notes_return_context', JSON.stringify({
                from: 'notes',
                timestamp: Date.now(),
                lessonId: lessonId
            }));
        } catch (e) {}
    
        // 方法 1: 通过 Router
        var router = window.LawAIApp?.Router;
        if (router && typeof router.navigate === 'function') {
            try {
                // 传递 returnTo 参数，让 Academy 知道从哪里来的
                router.navigate('academy', { 
                    view: 'lesson', 
                    id: lessonId,
                    returnTo: 'notes'
                });
                return;
            } catch (e) {
                console.warn('[Notes] Router navigation failed:', e);
            }
        }
    
        // 方法 2: 通过 AcademyView
        var academyView = window.LawAIApp?.AcademyView;
        if (academyView && typeof academyView.showLesson === 'function') {
            try {
                academyView.showLesson(lessonId, { returnTo: 'notes' });
                return;
            } catch (e) {
                console.warn('[Notes] AcademyView.showLesson failed:', e);
            }
        }
    
        // 方法 3: 直接跳转 (带 return 参数)
        window.location.href = '/pages/academy.html?view=lesson&id=' + lessonId + '&returnTo=notes';
    },

    // ============================================================
    // 🔥 新增: 创建笔记支持 Context (Part 114)
    // ============================================================
    createNoteWithContext: function(context) {
        console.log('[Notes] 📝 Creating note with context:', context);
        
        var editor = window.LawAIApp?.KnowledgeEditor;
        if (editor && typeof editor.render === 'function') {
            editor.render({ 
                noteId: 'new',
                context: context || {}
            });
        } else {
            console.warn('[Notes] KnowledgeEditor not available');
            // fallback: 用原有的 createNew
            this.createNew();
        }
    }
};

// 挂载到全局
window.LawAIApp.Notes = Notes;

    window.LawAIApp.Notes = Notes;
    console.log('[Notes] 📝 S4 module loaded');

})();
