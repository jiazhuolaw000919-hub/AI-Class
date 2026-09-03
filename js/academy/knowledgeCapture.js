// knowledgeCapture.js — S4 升级版 (Part 34)
// 使用 ContentLoader 获取课程/课时信息
window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeCapture = {
    _key: 'knowledge_notes',

    _getAll: function() {
        return LawAIApp.StorageEngine?.get(this._key, []) || [];
    },

    _saveAll: function(notes) {
        LawAIApp.StorageEngine?.set(this._key, notes);
    },

    // 创建笔记
    create: function(noteData) {
        var notes = this._getAll();
        var note = {
            id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            title: noteData.title || 'Untitled',
            content: noteData.content || '',
            tags: noteData.tags || [],
            keywords: noteData.keywords || [],
            lessonId: noteData.lessonId || null,
            subjectId: noteData.subjectId || null,
            courseId: noteData.courseId || null,
            schoolId: noteData.schoolId || null,
            isFavorite: false,
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // S4 新增：来源元数据
            source: noteData.source || {
                type: noteData.lessonId ? 'lesson' : 'manual',
                lessonId: noteData.lessonId || null,
                subjectId: noteData.subjectId || null,
                courseId: noteData.courseId || null
            },
            // S4 新增：内容类型
            type: noteData.type || 'KEY_POINT'
        };
        notes.unshift(note);
        this._saveAll(notes);
        LawAIApp.EventBus?.emit?.('NOTE_CREATED', { note: note });
        return note;
    },

    // 更新笔记
    update: function(id, updates) {
        var notes = this._getAll();
        var idx = -1;
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].id === id) {
                idx = i;
                break;
            }
        }
        if (idx === -1) return null;
        notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
        this._saveAll(notes);
        LawAIApp.EventBus?.emit?.('NOTE_UPDATED', { noteId: id, updates: updates });
        return notes[idx];
    },

    // 删除笔记
    remove: function(id) {
        var notes = this._getAll().filter(function(n) { return n.id !== id; });
        this._saveAll(notes);
        LawAIApp.EventBus?.emit?.('NOTE_DELETED', { noteId: id });
    },

    // 获取单个
    getById: function(id) {
        return this._getAll().find(function(n) { return n.id === id; }) || null;
    },

    // 获取所有笔记（可按条件过滤）
    getNotes: function(filter) {
        filter = filter || {};
        var notes = this._getAll();
        if (filter.lessonId) notes = notes.filter(function(n) { return n.lessonId === filter.lessonId; });
        if (filter.subjectId) notes = notes.filter(function(n) { return n.subjectId === filter.subjectId; });
        if (filter.courseId) notes = notes.filter(function(n) { return n.courseId === filter.courseId; });
        if (filter.schoolId) notes = notes.filter(function(n) { return n.schoolId === filter.schoolId; });
        if (filter.tag) notes = notes.filter(function(n) { return n.tags && n.tags.indexOf(filter.tag) !== -1; });
        if (filter.isFavorite) notes = notes.filter(function(n) { return n.isFavorite; });
        if (filter.isPinned) notes = notes.filter(function(n) { return n.isPinned; });
        if (filter.type) notes = notes.filter(function(n) { return n.type === filter.type; });
        // 按更新时间降序
        notes.sort(function(a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        return notes;
    },

    // 切换收藏
    toggleFavorite: function(id) {
        var note = this.getById(id);
        if (note) this.update(id, { isFavorite: !note.isFavorite });
    },

    // 切换置顶
    togglePin: function(id) {
        var note = this.getById(id);
        if (note) this.update(id, { isPinned: !note.isPinned });
    },

    // 全文搜索
    search: function(query) {
        var q = query.toLowerCase();
        return this._getAll().filter(function(n) {
            return n.title.toLowerCase().indexOf(q) !== -1 ||
                n.content.toLowerCase().indexOf(q) !== -1 ||
                (n.tags && n.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
        }).sort(function(a, b) {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    },

    // S4: 从 Lesson 获取详细信息（用于关联）
    getLessonInfo: function(lessonId) {
        var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
        if (!loader) return null;
        // 使用同步方式尝试获取（实际是异步，但简化处理）
        return { lessonId: lessonId, source: 'S4' };
    },

    // 获取笔记关联的课程/模块信息（S4 升级版）
    getLinkedKnowledge: function(id) {
        var note = this.getById(id);
        if (!note) return {};
        var links = {};
        if (note.lessonId) {
            // 尝试从 S4 获取
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getLessonManifest === 'function') {
                loader.getLessonManifest(note.lessonId).then(function(meta) {
                    if (meta) {
                        links.lesson = { lessonId: meta.id, title: meta.title };
                        links.subject = { subjectId: meta.subjectId };
                        links.course = { courseId: meta.courseId };
                    }
                }).catch(function() {});
            }
        }
        return links;
    },

    // S4: 从 Lesson 保存知识点
    saveFromLesson: function(lessonId, type, content, title) {
        var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
        var noteData = {
            lessonId: lessonId,
            type: type || 'KEY_POINT',
            title: title || '',
            content: content || '',
            source: { type: 'lesson', lessonId: lessonId }
        };
        // 尝试获取关联信息
        if (loader && typeof loader.getLessonManifest === 'function') {
            loader.getLessonManifest(lessonId).then(function(meta) {
                if (meta) {
                    noteData.subjectId = meta.subjectId;
                    noteData.courseId = meta.courseId;
                    noteData.tags = meta.tags || [];
                }
                return this.create(noteData);
            }.bind(this)).catch(function() {
                return this.create(noteData);
            }.bind(this));
        } else {
            return this.create(noteData);
        }
    },

    // 获取统计
    getStats: function() {
        var notes = this._getAll();
        var pinned = 0;
        var byType = {};
        for (var i = 0; i < notes.length; i++) {
            if (notes[i].isPinned) pinned++;
            var type = notes[i].type || 'KEY_POINT';
            byType[type] = (byType[type] || 0) + 1;
        }
        return {
            total: notes.length,
            pinned: pinned,
            byType: byType
        };
    },
        
    // ============================================================
    // 🔥 Part 114: 新增 — 按 Context 获取笔记
    // ============================================================
    getNotesByLesson: function(lessonId) {
        return this.getNotes({ lessonId: lessonId });
    },

    getNotesBySubject: function(subjectId) {
        return this.getNotes({ subjectId: subjectId });
    },

    getNotesByCourse: function(courseId) {
        return this.getNotes({ courseId: courseId });
    },

    getNotesBySchool: function(schoolId) {
        return this.getNotes({ schoolId: schoolId });
    },

    // ============================================================
    // 🔥 Part 116: 反思 (Reflection) 支持
    // ============================================================

    /**
     * 添加反思到笔记
     * @param {string} noteId - 笔记 ID
     * @param {string} reflection - 反思内容
     * @returns {Object} 更新后的笔记
     */
    addReflection: function(noteId, reflection) {
        if (!reflection || reflection.trim() === '') return null;
    
        var note = this.getById(noteId);
        if (!note) return null;
    
        // 获取现有反思列表
        var reflections = note.reflections || [];
    
        // 添加新反思 (包含时间戳)
        reflections.push({
            content: reflection.trim(),
            createdAt: new Date().toISOString()
        });
    
        // 只保留最近 10 条反思
        if (reflections.length > 10) {
            reflections = reflections.slice(-10);
        }
    
        return this.update(noteId, { 
            reflections: reflections,
            lastReflectionAt: new Date().toISOString()
        });
    },

    /**
     * 获取笔记的所有反思
     * @param {string} noteId - 笔记 ID
     * @returns {Array} 反思列表
     */
    getReflections: function(noteId) {
        var note = this.getById(noteId);
        if (!note) return [];
        return note.reflections || [];
    },
};
