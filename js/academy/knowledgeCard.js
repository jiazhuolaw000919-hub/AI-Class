// knowledgeCard.js — S4 升级版 (Part 34)
window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeCard = {
    _getAll: function() {
        return LawAIApp.StorageEngine?.get('knowledge_cards', {}) || {};
    },

    _saveAll: function(cards) {
        LawAIApp.StorageEngine?.set('knowledge_cards', cards);
    },

    // 获取或创建一张卡片（S4 升级版）
    getOrCreate: function(lessonId) {
        var cards = this._getAll();
        if (cards[lessonId]) return cards[lessonId];

        // 从 S4 ContentLoader 获取 Lesson 信息
        var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
        var card = {
            knowledgeId: 'kc_' + lessonId,
            lessonId: lessonId,
            title: 'Lesson',
            summary: '',
            keywords: [],
            memoryHook: '',
            examples: [],
            commonMistakes: [],
            reflection: '',
            confidence: 0,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (loader && typeof loader.getLessonManifest === 'function') {
            loader.getLessonManifest(lessonId).then(function(meta) {
                if (meta) {
                    card.title = meta.title || 'Lesson';
                    card.summary = meta.description || '';
                    card.keywords = meta.tags || [];
                    cards[lessonId] = card;
                    this._saveAll(cards);
                    LawAIApp.EventBus?.emit?.('KnowledgeCreated', {
                        knowledgeId: card.knowledgeId,
                        lessonId: lessonId
                    });
                }
            }.bind(this)).catch(function() {
                // Fallback: 使用现有数据
                cards[lessonId] = card;
                this._saveAll(cards);
            }.bind(this));
        } else {
            // Fallback
            cards[lessonId] = card;
            this._saveAll(cards);
        }

        return card;
    },

    update: function(lessonId, updates) {
        var cards = this._getAll();
        if (!cards[lessonId]) return null;
        cards[lessonId] = {
            ...cards[lessonId],
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (cards[lessonId].version || 1) + 1
        };
        this._saveAll(cards);
        LawAIApp.EventBus?.emit?.('KnowledgeUpdated', {
            knowledgeId: cards[lessonId].knowledgeId,
            lessonId: lessonId
        });
        return cards[lessonId];
    },

    get: function(lessonId) {
        return this._getAll()[lessonId] || null;
    },

    getAllCards: function() {
        return Object.values(this._getAll());
    },

    getStats: function() {
        var cards = this._getAll();
        var total = 0;
        for (var key in cards) { total++; }
        return { total: total };
    }
};
