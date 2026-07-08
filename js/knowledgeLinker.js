// ===========================================
// knowledgeLinker.js
// 知识关系引擎 - 知识链接管理（Phase 38 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeLinker = (function() {
    var _initialized = false;
    var _links = [];

    // ===========================================
    // 链接管理
    // ===========================================
    function getLinks() {
        _sync();
        return _links;
    }

    function getLinksForLesson(lessonId) {
        _sync();
        return _links.filter(function(l) {
            return l.sourceId === lessonId || l.targetId === lessonId;
        });
    }

    function addLink(sourceId, targetId, type, weight) {
        type = type || 'related';
        weight = weight || 1;
        
        _sync();
        
        // 检查是否已存在
        var existing = _links.find(function(l) {
            return (l.sourceId === sourceId && l.targetId === targetId) ||
                   (l.sourceId === targetId && l.targetId === sourceId);
        });
        if (existing) {
            existing.weight = weight;
            existing.type = type;
            existing.updatedAt = new Date().toISOString();
            _saveLinks();
            return existing;
        }
        
        var link = {
            linkId: 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sourceId: sourceId,
            targetId: targetId,
            type: type,
            weight: weight,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        _links.push(link);
        _saveLinks();
        LawAIApp.EventBus?.emit?.('LinkCreated', { link: link });
        return link;
    }

    function removeLink(linkId) {
        _sync();
        _links = _links.filter(function(l) { return l.linkId !== linkId; });
        _saveLinks();
        LawAIApp.EventBus?.emit?.('LinkRemoved', { linkId: linkId });
    }

    // ===========================================
    // 自动链接
    // ===========================================
    function autoLinkForLesson(lessonId) {
        var card = null;
        try {
            if (LawAIApp.SecondBrainEngine && typeof LawAIApp.SecondBrainEngine.get === 'function') {
                card = LawAIApp.SecondBrainEngine.get(lessonId);
            }
        } catch (e) {}
        
        if (!card) {
            // 尝试从 LessonEngine 获取
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var day = parseInt(lessonId.replace('day-', ''));
                    if (!isNaN(day)) {
                        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                        if (lesson) {
                            card = { lessonId: lessonId, title: lesson.title, keywords: [lesson.category || 'General'] };
                        }
                    }
                }
            } catch (e) {}
        }
        
        if (!card) return;
        
        var allCards = [];
        try {
            if (LawAIApp.SecondBrainEngine && typeof LawAIApp.SecondBrainEngine.getAllCards === 'function') {
                allCards = LawAIApp.SecondBrainEngine.getAllCards();
            }
        } catch (e) {}
        
        var keywords = card.keywords || [];
        
        allCards.forEach(function(other) {
            if (other.lessonId === lessonId) return;
            
            var otherKeywords = other.keywords || [];
            var commonTags = keywords.filter(function(k) {
                return otherKeywords.indexOf(k) !== -1;
            });
            
            // 共享关键词 → 相关链接
            if (commonTags.length > 0) {
                var existing = _links.find(function(l) {
                    return (l.sourceId === lessonId && l.targetId === other.lessonId) ||
                           (l.sourceId === other.lessonId && l.targetId === lessonId);
                });
                if (!existing) {
                    addLink(lessonId, other.lessonId, 'related', commonTags.length);
                }
            }
        });
        
        LawAIApp.EventBus?.emit?.('KnowledgeLinked', { lessonId: lessonId });
    }

    // ===========================================
    // 图谱构建
    // ===========================================
    function buildGraph() {
        _sync();
        var nodes = [];
        var edges = [];
        
        _links.forEach(function(link) {
            if (!nodes.includes(link.sourceId)) nodes.push(link.sourceId);
            if (!nodes.includes(link.targetId)) nodes.push(link.targetId);
            edges.push({
                from: link.sourceId,
                to: link.targetId,
                type: link.type,
                weight: link.weight
            });
        });
        
        return { nodes: nodes, edges: edges };
    }

    function getGraphData() {
        var graph = buildGraph();
        return {
            nodes: graph.nodes.map(function(id) {
                var label = id;
                try {
                    if (LawAIApp.SecondBrainEngine && typeof LawAIApp.SecondBrainEngine.get === 'function') {
                        var card = LawAIApp.SecondBrainEngine.get(id);
                        if (card && card.title) label = card.title;
                    }
                } catch (e) {}
                return { id: id, label: label };
            }),
            edges: graph.edges
        };
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('knowledge_links');
            if (stored) _links = stored;
        } catch (e) {}
    }

    function _saveLinks() {
        try {
            LawAIApp.StorageEngine?.set?.('knowledge_links', _links);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        
        // 监听课程完成自动链接
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            setTimeout(function() {
                autoLinkForLesson(lessonId);
            }, 500);
        });
        
        console.log('🔗 KnowledgeLinker initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getLinks: getLinks,
        getLinksForLesson: getLinksForLesson,
        addLink: addLink,
        removeLink: removeLink,
        autoLinkForLesson: autoLinkForLesson,
        getGraph: getGraphData,
        buildGraph: buildGraph
    };
})();

console.log('🔗 KnowledgeLinker V2.0 ready');
