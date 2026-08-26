// knowledgeLinker.js — S4 升级版 (Part 34)
window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeLinker = (function() {
    var _initialized = false;
    var _links = [];

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

    // S4: 自动链接（基于 ContentLoader）
    function autoLinkForLesson(lessonId) {
        var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
        if (!loader) return;

        // 获取所有已加载的 Lessons
        loader.getLessonsByCourse('course-ai').then(function(lessons) {
            if (!lessons) return;
            var lessonIds = lessons.map(function(l) { return l.id; });
            // 找同 Subject 的 Lessons
            var targetLesson = null;
            for (var i = 0; i < lessons.length; i++) {
                if (lessons[i].id === lessonId) {
                    targetLesson = lessons[i];
                    break;
                }
            }
            if (!targetLesson) return;

            var sameSubject = lessons.filter(function(l) {
                return l.subjectId === targetLesson.subjectId && l.id !== lessonId;
            });

            sameSubject.slice(0, 3).forEach(function(target) {
                var existing = _links.find(function(l) {
                    return (l.sourceId === lessonId && l.targetId === target.id) ||
                           (l.sourceId === target.id && l.targetId === lessonId);
                });
                if (!existing) {
                    addLink(lessonId, target.id, 'related', 1);
                }
            });
        }).catch(function() {});
    }

    function buildGraph() {
        _sync();
        var nodes = [];
        var edges = [];
        _links.forEach(function(link) {
            if (nodes.indexOf(link.sourceId) === -1) nodes.push(link.sourceId);
            if (nodes.indexOf(link.targetId) === -1) nodes.push(link.targetId);
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
                // 尝试从 S4 获取标题
                var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
                if (loader && typeof loader.getLessonManifest === 'function') {
                    loader.getLessonManifest(id).then(function(meta) {
                        if (meta) label = meta.title;
                    }).catch(function() {});
                }
                return { id: id, label: label };
            }),
            edges: graph.edges
        };
    }

    function init() {
        if (_initialized) return;
        _initialized = true;
        _sync();
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            if (data && data.lessonId) {
                setTimeout(function() {
                    autoLinkForLesson(data.lessonId);
                }, 500);
            }
        });
        console.log('🔗 KnowledgeLinker (S4) initialized');
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

console.log('🔗 KnowledgeLinker S4 ready');
