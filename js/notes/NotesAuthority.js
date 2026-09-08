// /js/notes/NotesAuthority.js
// Part 164 — 唯一的 Notes 权威 (后台加载版)
// Notes = 学习者拥有的知识/反思/上下文表面
// 不是系统知识权威

(function() {
    'use strict';

    // ============================================================
    // 状态
    // ============================================================
    var _notes = [];
    var _initialized = false;
    var _loading = false;
    var _readyCallbacks = [];
    var _version = '1.0.0';
    var _storageKey = 'notesAuthority_v1';

    // ============================================================
    // 核心 API
    // ============================================================
    var NotesAuthority = {

        get initialized() { return _initialized; },
        get loading() { return _loading; },
        get isReady() { return _initialized && !_loading; },
        get version() { return _version; },

        // ---- 初始化（后台加载） ----
        init: function() {
            if (_initialized) {
                console.log('[NotesAuthority] Already initialized');
                return this;
            }
            if (_loading) {
                console.log('[NotesAuthority] Already loading...');
                return this;
            }

            console.log('[NotesAuthority] 🚀 Starting background load...');
            _loading = true;
            this._loadFromStorageAsync();
            return this;
        },

        // ---- 就绪回调 ----
        onReady: function(callback) {
            if (_initialized) {
                callback(this);
                return;
            }
            _readyCallbacks.push(callback);
        },

        // ============================================================
        // 命令 — 所有写操作必须通过这些方法
        // ============================================================

        /**
         * CREATE — 创建笔记
         * Notes 只负责笔记本身，不修改任何其他权威
         */
        create: function(command) {
            if (!_initialized) {
                return { success: false, error: 'NotesAuthority not ready', code: 'NOT_READY' };
            }

            if (!command.content && !command.title) {
                return { success: false, error: 'content or title required', code: 'INVALID_INPUT' };
            }

            var note = {
                noteId: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                learnerId: command.learnerId || 'default',
                title: command.title || 'Untitled Note',
                content: command.content || '',
                noteType: command.noteType || 'GENERAL',
                status: command.status || 'ACTIVE',
                tags: command.tags || [],
                links: command.links || [],
                references: command.references || [],
                sourceRefs: command.sourceRefs || [],
                contextRefs: command.contextRefs || [],
                pinned: command.pinned || false,
                archived: command.archived || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                provenance: {
                    createdBy: command.createdBy || 'learner',
                    source: command.source || 'manual',
                    timestamp: new Date().toISOString()
                },
                // 可选：关联的学习对象
                relatedLessonRef: command.relatedLessonRef || null,
                relatedSubjectRef: command.relatedSubjectRef || null,
                relatedCourseRef: command.relatedCourseRef || null,
                relatedSchoolRef: command.relatedSchoolRef || null,
                relatedActivityRef: command.relatedActivityRef || null,
                // AI 辅助标记
                aiAssisted: command.aiAssisted || false,
                aiModel: command.aiModel || null,
                // 历史
                _history: []
            };

            _notes.push(note);
            this._saveToStorage();

            this._emit('NOTE_CREATED', {
                noteId: note.noteId,
                title: note.title,
                noteType: note.noteType,
                source: note.provenance.source
            });

            return { success: true, note: note };
        },

        /**
         * UPDATE — 更新笔记
         */
        update: function(noteId, updates) {
            if (!_initialized) {
                return { success: false, error: 'NotesAuthority not ready', code: 'NOT_READY' };
            }

            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }

            // 保存历史
            note._history.push({
                previous: {
                    title: note.title,
                    content: note.content,
                    tags: note.tags.slice(),
                    status: note.status
                },
                changedAt: new Date().toISOString()
            });

            // 应用更新
            if (updates.title !== undefined) note.title = updates.title;
            if (updates.content !== undefined) note.content = updates.content;
            if (updates.noteType !== undefined) note.noteType = updates.noteType;
            if (updates.status !== undefined) note.status = updates.status;
            if (updates.tags !== undefined) note.tags = updates.tags.slice();
            if (updates.links !== undefined) note.links = updates.links.slice();
            if (updates.references !== undefined) note.references = updates.references.slice();
            if (updates.pinned !== undefined) note.pinned = updates.pinned;
            if (updates.archived !== undefined) note.archived = updates.archived;
            if (updates.relatedLessonRef !== undefined) note.relatedLessonRef = updates.relatedLessonRef;
            if (updates.relatedSubjectRef !== undefined) note.relatedSubjectRef = updates.relatedSubjectRef;
            if (updates.relatedCourseRef !== undefined) note.relatedCourseRef = updates.relatedCourseRef;

            note.updatedAt = new Date().toISOString();
            note.version = (note.version || 1) + 1;

            this._saveToStorage();

            this._emit('NOTE_UPDATED', {
                noteId: note.noteId,
                title: note.title,
                version: note.version
            });

            return { success: true, note: note };
        },

        /**
         * DELETE — 删除笔记（软删除）
         */
        delete: function(noteId) {
            if (!_initialized) {
                return { success: false, error: 'NotesAuthority not ready', code: 'NOT_READY' };
            }

            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }

            note.status = 'DELETED';
            note.updatedAt = new Date().toISOString();
            note.version = (note.version || 1) + 1;

            this._saveToStorage();

            this._emit('NOTE_DELETED', {
                noteId: note.noteId,
                title: note.title
            });

            return { success: true, note: note };
        },

        /**
         * ARCHIVE — 归档笔记
         */
        archive: function(noteId) {
            var result = this.update(noteId, { archived: true, status: 'ARCHIVED' });
            if (result.success) {
                this._emit('NOTE_ARCHIVED', { noteId: noteId });
            }
            return result;
        },

        /**
         * RESTORE — 恢复归档
         */
        restore: function(noteId) {
            var result = this.update(noteId, { archived: false, status: 'ACTIVE' });
            if (result.success) {
                this._emit('NOTE_RESTORED', { noteId: noteId });
            }
            return result;
        },

        /**
         * PIN — 置顶笔记
         */
        pin: function(noteId) {
            return this.update(noteId, { pinned: true });
        },

        /**
         * UNPIN — 取消置顶
         */
        unpin: function(noteId) {
            return this.update(noteId, { pinned: false });
        },

        /**
         * ADD_TAG — 添加标签
         */
        addTag: function(noteId, tag) {
            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }
            if (!note.tags) note.tags = [];
            if (note.tags.indexOf(tag) === -1) {
                note.tags.push(tag);
                note.updatedAt = new Date().toISOString();
                note.version = (note.version || 1) + 1;
                this._saveToStorage();
                this._emit('NOTE_TAGGED', { noteId: noteId, tag: tag });
            }
            return { success: true, note: note };
        },

        /**
         * REMOVE_TAG — 移除标签
         */
        removeTag: function(noteId, tag) {
            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }
            if (note.tags) {
                note.tags = note.tags.filter(function(t) { return t !== tag; });
                note.updatedAt = new Date().toISOString();
                note.version = (note.version || 1) + 1;
                this._saveToStorage();
                this._emit('NOTE_UNTAGGED', { noteId: noteId, tag: tag });
            }
            return { success: true, note: note };
        },

        /**
         * ADD_LINK — 添加链接
         */
        addLink: function(noteId, targetId, linkType) {
            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }
            if (!note.links) note.links = [];
            var existing = note.links.some(function(l) {
                return l.targetId === targetId && l.linkType === (linkType || 'REFERENCES');
            });
            if (!existing) {
                note.links.push({
                    targetId: targetId,
                    linkType: linkType || 'REFERENCES',
                    createdAt: new Date().toISOString()
                });
                note.updatedAt = new Date().toISOString();
                note.version = (note.version || 1) + 1;
                this._saveToStorage();
                this._emit('NOTE_LINKED', { noteId: noteId, targetId: targetId, linkType: linkType || 'REFERENCES' });
            }
            return { success: true, note: note };
        },

        /**
         * REMOVE_LINK — 移除链接
         */
        removeLink: function(noteId, targetId) {
            var note = this._findNote(noteId);
            if (!note) {
                return { success: false, error: 'Note not found', code: 'NOT_FOUND' };
            }
            if (note.links) {
                note.links = note.links.filter(function(l) { return l.targetId !== targetId; });
                note.updatedAt = new Date().toISOString();
                note.version = (note.version || 1) + 1;
                this._saveToStorage();
                this._emit('NOTE_UNLINKED', { noteId: noteId, targetId: targetId });
            }
            return { success: true, note: note };
        },

        // ============================================================
        // 读方法
        // ============================================================

        getNote: function(noteId) {
            if (!_initialized) return null;
            return this._findNote(noteId);
        },

        getAllNotes: function() {
            if (!_initialized) return [];
            return _notes.filter(function(n) {
                return n.status !== 'DELETED';
            });
        },

        getActiveNotes: function() {
            return this.getAllNotes().filter(function(n) {
                return n.status === 'ACTIVE' && !n.archived;
            });
        },

        getArchivedNotes: function() {
            return this.getAllNotes().filter(function(n) {
                return n.archived === true;
            });
        },

        getPinnedNotes: function() {
            return this.getAllNotes().filter(function(n) {
                return n.pinned === true;
            });
        },

        getNotesByTag: function(tag) {
            return this.getAllNotes().filter(function(n) {
                return n.tags && n.tags.indexOf(tag) !== -1;
            });
        },

        getNotesByLesson: function(lessonRef) {
            return this.getAllNotes().filter(function(n) {
                return n.relatedLessonRef === lessonRef;
            });
        },

        getNotesByCourse: function(courseRef) {
            return this.getAllNotes().filter(function(n) {
                return n.relatedCourseRef === courseRef;
            });
        },

        search: function(query) {
            if (!_initialized) return [];
            var q = query.toLowerCase();
            return this.getAllNotes().filter(function(n) {
                return n.title.toLowerCase().indexOf(q) !== -1 ||
                       n.content.toLowerCase().indexOf(q) !== -1 ||
                       (n.tags && n.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
            });
        },

        getStatusSummary: function() {
            if (!_initialized) {
                return { initialized: false, total: 0, active: 0, archived: 0, pinned: 0 };
            }
            var all = this.getAllNotes();
            return {
                initialized: true,
                total: all.length,
                active: all.filter(function(n) { return n.status === 'ACTIVE' && !n.archived; }).length,
                archived: all.filter(function(n) { return n.archived; }).length,
                pinned: all.filter(function(n) { return n.pinned; }).length,
                version: _version,
                lastUpdated: new Date().toISOString()
            };
        },

        // ---- 迁移：从旧存储导入 ----
        migrateFromLegacy: function() {
            try {
                // 尝试从 KnowledgeCapture 迁移
                var legacyNotes = [];
                
                // 1. 从 KnowledgeCapture 获取
                if (window.LawAIApp?.KnowledgeCapture?.getNotes) {
                    var kcNotes = window.LawAIApp.KnowledgeCapture.getNotes();
                    if (kcNotes && kcNotes.length > 0) {
                        legacyNotes = legacyNotes.concat(kcNotes);
                    }
                }

                // 2. 从 SecondBrain 获取
                if (window.LawAIApp?.SecondBrain?.getAllEntries) {
                    var sbNotes = window.LawAIApp.SecondBrain.getAllEntries();
                    if (sbNotes && sbNotes.length > 0) {
                        legacyNotes = legacyNotes.concat(sbNotes);
                    }
                }

                // 3. 从 Notes 模块获取
                if (window.LawAIApp?.Notes?.getNotes) {
                    var nNotes = window.LawAIApp.Notes.getNotes();
                    if (nNotes && nNotes.length > 0) {
                        legacyNotes = legacyNotes.concat(nNotes);
                    }
                }

                if (legacyNotes.length === 0) {
                    return { success: true, migrated: 0, message: 'No legacy data found' };
                }

                var migrated = 0;
                for (var i = 0; i < legacyNotes.length; i++) {
                    var old = legacyNotes[i];
                    var exists = _notes.some(function(n) {
                        return n.title === old.title && n.content === old.content;
                    });
                    if (!exists) {
                        _notes.push({
                            noteId: old.id || old.noteId || 'note_migrated_' + Date.now() + '_' + i,
                            learnerId: old.learnerId || 'default',
                            title: old.title || 'Migrated Note',
                            content: old.content || old.summary || '',
                            noteType: old.type || old.noteType || 'GENERAL',
                            status: old.status || 'ACTIVE',
                            tags: old.tags || [],
                            links: old.links || [],
                            references: old.references || [],
                            sourceRefs: old.sourceRefs || [],
                            contextRefs: old.contextRefs || [],
                            pinned: old.pinned || false,
                            archived: old.archived || false,
                            createdAt: old.createdAt || old.created || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            version: 1,
                            provenance: {
                                createdBy: old.createdBy || 'legacy',
                                source: 'migration',
                                timestamp: new Date().toISOString()
                            },
                            relatedLessonRef: old.lessonId || old.relatedLessonRef || null,
                            relatedSubjectRef: old.subjectId || old.relatedSubjectRef || null,
                            relatedCourseRef: old.courseId || old.relatedCourseRef || null,
                            _history: [],
                            _migrated: true
                        });
                        migrated++;
                    }
                }

                this._saveToStorage();
                console.log('[NotesAuthority] ✅ Migrated', migrated, 'notes from legacy');

                return { success: true, migrated: migrated };
            } catch (e) {
                console.warn('[NotesAuthority] Migration error:', e);
                return { success: false, error: e.message };
            }
        },

        // ---- 重置 ----
        reset: function() {
            _notes = [];
            this._saveToStorage();
            console.log('[NotesAuthority] 🔄 Reset');
            return { success: true };
        },

        // ============================================================
        // 私有方法
        // ============================================================

        _findNote: function(noteId) {
            for (var i = 0; i < _notes.length; i++) {
                if (_notes[i].noteId === noteId) {
                    return _notes[i];
                }
            }
            return null;
        },

        _loadFromStorageAsync: function() {
            var self = this;

            setTimeout(function() {
                try {
                    var stored = localStorage.getItem(_storageKey);
                    if (stored) {
                        var parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            _notes = parsed;
                            console.log('[NotesAuthority] ✅ Loaded', _notes.length, 'notes');
                        }
                    } else {
                        // 尝试从旧存储迁移
                        self.migrateFromLegacy();
                    }
                } catch (e) {
                    console.warn('[NotesAuthority] Load error:', e);
                    _notes = [];
                }

                _loading = false;
                _initialized = true;

                while (_readyCallbacks.length > 0) {
                    var cb = _readyCallbacks.shift();
                    try {
                        cb(self);
                    } catch (e) {
                        console.warn('[NotesAuthority] Callback error:', e);
                    }
                }

                self._emit('NOTES_AUTHORITY_READY', {
                    noteCount: _notes.length,
                    version: _version
                });

                console.log('[NotesAuthority] ✅ Ready (' + _notes.length + ' notes)');
            }, 0);
        },

        _saveToStorage: function() {
            try {
                localStorage.setItem(_storageKey, JSON.stringify(_notes));
            } catch (e) {
                console.warn('[NotesAuthority] Save error:', e);
            }
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, {
                    detail: {
                        source: 'notes-authority',
                        version: _version,
                        timestamp: new Date().toISOString(),
                        data: data || {}
                    }
                });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus?.emit) {
                    window.LawAIApp.EventBus.emit(eventName, event.detail);
                }
            } catch (e) {}
        },

        _debug: function() {
            return {
                initialized: _initialized,
                loading: _loading,
                noteCount: _notes.length,
                storageKey: _storageKey,
                version: _version,
                readyCallbacks: _readyCallbacks.length
            };
        }
    };

    // ============================================================
    // 注册到全局
    // ============================================================

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.NotesAuthority = NotesAuthority;

    // ============================================================
    // 后台自动初始化
    // ============================================================

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() {
            if (!NotesAuthority.initialized && !NotesAuthority.loading) {
                NotesAuthority.init();
            }
        }, 150);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (!NotesAuthority.initialized && !NotesAuthority.loading) {
                    NotesAuthority.init();
                }
            }, 150);
        });
    }

    console.log('[NotesAuthority] Module loaded (Part 164)');

})();
