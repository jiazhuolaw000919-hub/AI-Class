// secondBrain.js — S4 升级版 (Part 34)
window.LawAIApp = window.LawAIApp || {};

LawAIApp.SecondBrain = {
    // 自动创建或获取一个课程的 Second Brain 条目（S4 升级版）
    getEntry: function(lessonId) {
        var entries = LawAIApp.StorageEngine?.get('secondBrain', {}) || {};
        if (!entries[lessonId]) {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            // 尝试从 S4 获取
            var entry = {
                lessonId: lessonId,
                title: 'Lesson',
                summary: '',
                notes: [],
                keywords: [],
                practice: [],
                quiz: [],
                tags: [],
                reviewLevel: 'Need Review',
                completedDate: null,
                futureAIReflection: ''
            };

            if (loader && typeof loader.getLessonManifest === 'function') {
                loader.getLessonManifest(lessonId).then(function(meta) {
                    if (meta) {
                        entry.title = meta.title || 'Lesson';
                        entry.summary = meta.description || '';
                        entry.keywords = meta.tags || [];
                        entry.tags = meta.tags || [];
                        entries[lessonId] = entry;
                        LawAIApp.StorageEngine?.set('secondBrain', entries);
                    }
                }).catch(function() {
                    entries[lessonId] = entry;
                    LawAIApp.StorageEngine?.set('secondBrain', entries);
                });
            } else {
                entries[lessonId] = entry;
                LawAIApp.StorageEngine?.set('secondBrain', entries);
            }
        }
        return entries[lessonId];
    },

    updateEntry: function(lessonId, updates) {
        var entries = LawAIApp.StorageEngine?.get('secondBrain', {}) || {};
        if (!entries[lessonId]) this.getEntry(lessonId);
        var entry = entries[lessonId] || {};
        entries[lessonId] = { ...entry, ...updates };
        LawAIApp.StorageEngine?.set('secondBrain', entries);
    },

    getAllEntries: function() {
        var entries = LawAIApp.StorageEngine?.get('secondBrain', {}) || {};
        return Object.values(entries);
    },

    search: function(query) {
        var all = this.getAllEntries();
        var q = query.toLowerCase();
        return all.filter(function(e) {
            return (e.title && e.title.toLowerCase().indexOf(q) !== -1) ||
                (e.summary && e.summary.toLowerCase().indexOf(q) !== -1) ||
                (e.keywords && e.keywords.some(function(k) {
                    return k.toLowerCase().indexOf(q) !== -1;
                })) ||
                (e.tags && e.tags.some(function(t) {
                    return t.toLowerCase().indexOf(q) !== -1;
                }));
        });
    },

    getStats: function() {
        var entries = this.getAllEntries();
        return { total: entries.length };
    }
};
