// ===========================================
// secondBrainEngine.js
// Second Brain 引擎 - 知识卡片、图谱（Phase 20 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SecondBrainEngine = (function() {
    var _initialized = false;
    var _cards = [];
    var _links = [];
    var _confidences = {};

    // ===========================================
    // 核心数据结构
    // ===========================================
    function getCards() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var stored = LawAIApp.StorageEngine.get('second_brain_cards', null);
                if (stored) return stored;
            }
            var val = localStorage.getItem('lawai_second_brain_cards');
            return val ? JSON.parse(val) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCards(cards) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('second_brain_cards', cards);
                return;
            }
            localStorage.setItem('lawai_second_brain_cards', JSON.stringify(cards));
        } catch (e) {
            console.warn('⚠️ Failed to save cards:', e);
        }
    }

    function getLinks() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var stored = LawAIApp.StorageEngine.get('second_brain_links', null);
                if (stored) return stored;
            }
            var val = localStorage.getItem('lawai_second_brain_links');
            return val ? JSON.parse(val) : [];
        } catch (e) {
            return [];
        }
    }

    function saveLinks(links) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('second_brain_links', links);
                return;
            }
            localStorage.setItem('lawai_second_brain_links', JSON.stringify(links));
        } catch (e) {
            console.warn('⚠️ Failed to save links:', e);
        }
    }

    // ===========================================
    // 知识卡片
    // ===========================================
    function getOrCreateCard(lessonId) {
        var cards = getCards();
        var existing = cards.find(function(c) { return c.lessonId === lessonId; });
        if (existing) return existing;
        
        var title = 'Lesson ' + lessonId;
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                    if (lesson && lesson.title) title = lesson.title;
                }
            }
        } catch (e) {}
        
        var card = {
            lessonId: lessonId,
            title: title,
            summary: 'Knowledge captured from ' + lessonId,
            keywords: [],
            memoryHook: 'Remember: ' + title,
            confidence: 50,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewCount: 0
        };
        
        cards.push(card);
        saveCards(cards);
        return card;
    }

    function getCard(lessonId) {
        var cards = getCards();
        return cards.find(function(c) { return c.lessonId === lessonId; }) || null;
    }

    function getAllCards() {
        return getCards();
    }

    function updateCard(lessonId, updates) {
        var cards = getCards();
        var index = cards.findIndex(function(c) { return c.lessonId === lessonId; });
        if (index === -1) {
            var card = getOrCreateCard(lessonId);
            index = cards.indexOf(card);
        }
        cards[index] = { ...cards[index], ...updates, updatedAt: new Date().toISOString() };
        saveCards(cards);
        return cards[index];
    }

    // ===========================================
    // 知识链接
    // ===========================================
    function autoLinkForLesson(lessonId) {
        var links = getLinks();
        var cards = getCards();
        
        // 找相似课程（同阶段）
        var day = parseInt(lessonId.replace('day-', ''));
        if (isNaN(day)) return;
        
        var stage = 'Foundation';
        if (day <= 30) stage = 'Foundation';
        else if (day <= 70) stage = 'Prompt Engineering';
        else if (day <= 120) stage = 'AI Tools';
        else if (day <= 220) stage = 'AI Development';
        else if (day <= 300) stage = 'Projects';
        else stage = 'AI Business';
        
        // 找同阶段的其他课程
        var sameStage = cards.filter(function(c) {
            var d = parseInt(c.lessonId.replace('day-', ''));
            if (isNaN(d)) return false;
            if (c.lessonId === lessonId) return false;
            var s = 'Foundation';
            if (d <= 30) s = 'Foundation';
            else if (d <= 70) s = 'Prompt Engineering';
            else if (d <= 120) s = 'AI Tools';
            else if (d <= 220) s = 'AI Development';
            else if (d <= 300) s = 'Projects';
            else s = 'AI Business';
            return s === stage;
        });
        
        sameStage.slice(0, 3).forEach(function(target) {
            var linkExists = links.some(function(l) {
                return (l.from === lessonId && l.to === target.lessonId) ||
                       (l.from === target.lessonId && l.to === lessonId);
            });
            if (!linkExists) {
                links.push({
                    from: lessonId,
                    to: target.lessonId,
                    type: 'related',
                    createdAt: new Date().toISOString()
                });
            }
        });
        
        saveLinks(links);
    }

    function getGraph() {
        var cards = getAllCards();
        var links = getLinks();
        var nodes = cards.map(function(c) {
            return {
                id: c.lessonId,
                label: c.title,
                confidence: c.confidence || 50,
                reviewedAt: c.reviewedAt
            };
        });
        
        return {
            nodes: nodes,
            links: links,
            nodeCount: nodes.length,
            linkCount: links.length
        };
    }

    function getNeighbors(lessonId) {
        var links = getLinks();
        var neighbors = links
            .filter(function(l) { return l.from === lessonId || l.to === lessonId; })
            .map(function(l) {
                return l.from === lessonId ? l.to : l.from;
            });
        return neighbors;
    }

    // ===========================================
    // 置信度管理
    // ===========================================
    function calculateConfidence(lessonId) {
        var card = getCard(lessonId);
        if (!card) return 0;
        
        // 置信度 = 基础 + 复习加成 - 衰减
        var base = card.confidence || 50;
        var reviewBonus = Math.min(30, card.reviewCount * 2);
        var decay = 0;
        
        if (card.reviewedAt) {
            var daysSince = Math.floor((Date.now() - new Date(card.reviewedAt).getTime()) / (1000 * 60 * 60 * 24));
            decay = Math.min(30, daysSince * 0.5);
        }
        
        return Math.max(0, Math.min(100, base + reviewBonus - decay));
    }

    function checkDecay(lessonId) {
        var confidence = calculateConfidence(lessonId);
        var card = getCard(lessonId);
        if (card && card.confidence !== confidence) {
            updateCard(lessonId, { confidence: Math.round(confidence) });
        }
        return confidence;
    }

    function checkAll() {
        var cards = getAllCards();
        cards.forEach(function(card) {
            checkDecay(card.lessonId);
        });
        console.log('🔄 Confidence check completed for ' + cards.length + ' cards');
    }

    // ===========================================
    // 搜索
    // ===========================================
    function search(query) {
        if (!query) return [];
        var q = query.toLowerCase();
        var cards = getAllCards();
        return cards.filter(function(c) {
            return c.title.toLowerCase().indexOf(q) !== -1 ||
                   (c.keywords && c.keywords.some(function(k) { return k.toLowerCase().indexOf(q) !== -1; })) ||
                   (c.summary && c.summary.toLowerCase().indexOf(q) !== -1);
        });
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        // 监听课程完成
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            if (lessonId) {
                var card = getOrCreateCard(lessonId);
                autoLinkForLesson(lessonId);
                checkDecay(lessonId);
                LawAIApp.EventBus?.emit?.('KnowledgeCardUpdated', { lessonId: lessonId, card: card });
            }
        });
        
        // 定时检查衰减
        setInterval(function() {
            checkAll();
        }, 3600000); // 每小时
        
        console.log('🧠 SecondBrainEngine initialized');
    }

    // ===========================================
    // 公共 API
    // ===========================================
    setTimeout(init, 400);

    return {
        init: init,
        getOrCreate: getOrCreateCard,
        get: getCard,
        getAllCards: getAllCards,
        update: updateCard,
        getGraph: getGraph,
        getNeighbors: getNeighbors,
        getConfidence: calculateConfidence,
        checkDecay: checkDecay,
        checkAll: checkAll,
        search: search,
        autoLinkForLesson: autoLinkForLesson
    };
})();

console.log('🧠 SecondBrainEngine V2.0 ready');
