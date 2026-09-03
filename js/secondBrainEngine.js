// secondBrainEngine.js — 改为适配器模式

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SecondBrainEngine = (function() {
    var _initialized = false;

    // ===========================================
    // 适配器: 通过 KnowledgeGraph API
    // ===========================================
    function getGraph() {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) {
            console.warn('[SecondBrainEngine] KnowledgeGraph not available');
            return { nodes: [], links: [], nodeCount: 0, linkCount: 0 };
        }
        
        var nodes = kg.getAllNodes();
        var links = [];
        nodes.forEach(function(node) {
            var rels = kg.getRelations(node.id);
            rels.forEach(function(rel) {
                links.push({
                    from: rel.from,
                    to: rel.to,
                    type: rel.type,
                    createdAt: rel.createdAt
                });
            });
        });
        
        return {
            nodes: nodes.map(function(n) {
                return {
                    id: n.id,
                    label: n.title,
                    confidence: n.metadata?.confidence || 50,
                    reviewedAt: n.updatedAt
                };
            }),
            links: links,
            nodeCount: nodes.length,
            linkCount: links.length
        };
    }

    function getNeighbors(entityId) {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) return [];
        
        var rels = kg.getRelations(entityId);
        var neighbors = [];
        rels.forEach(function(rel) {
            if (rel.from === entityId) neighbors.push(rel.to);
            if (rel.to === entityId) neighbors.push(rel.from);
        });
        return neighbors;
    }

    // ===========================================
    // 适配器: 卡片操作 → KnowledgeGraph 节点
    // ===========================================
    function getOrCreateCard(lessonId) {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) return null;
        
        if (kg.hasNode(lessonId)) {
            var node = kg.getNode(lessonId);
            return {
                lessonId: node.id,
                title: node.title,
                summary: node.description,
                keywords: node.metadata?.keywords || [],
                confidence: node.metadata?.confidence || 50,
                createdAt: node.createdAt,
                updatedAt: node.updatedAt,
                reviewedAt: node.metadata?.reviewedAt || null,
                reviewCount: node.metadata?.reviewCount || 0
            };
        }
        
        // 创建新节点
        var newNode = kg.registerNode({
            id: lessonId,
            type: kg.NODE_TYPES.LESSON,
            title: 'Lesson ' + lessonId,
            description: 'Knowledge captured from ' + lessonId,
            metadata: {
                keywords: [],
                confidence: 50,
                reviewCount: 0,
                reviewedAt: null
            }
        });
        
        return {
            lessonId: newNode.id,
            title: newNode.title,
            summary: newNode.description,
            keywords: newNode.metadata?.keywords || [],
            confidence: newNode.metadata?.confidence || 50,
            createdAt: newNode.createdAt,
            updatedAt: newNode.updatedAt,
            reviewedAt: newNode.metadata?.reviewedAt || null,
            reviewCount: newNode.metadata?.reviewCount || 0
        };
    }

    // ===========================================
    // 公共 API
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        console.log('🧠 SecondBrainEngine initialized (adapter mode)');
    }

    setTimeout(init, 500);

    return {
        init: init,
        getOrCreate: getOrCreateCard,
        getGraph: getGraph,
        getNeighbors: getNeighbors,
        getAllCards: function() {
            var kg = window.LawAIApp?.KnowledgeGraph;
            if (!kg) return [];
            return kg.getAllNodes().map(function(n) {
                return {
                    lessonId: n.id,
                    title: n.title,
                    summary: n.description,
                    keywords: n.metadata?.keywords || [],
                    confidence: n.metadata?.confidence || 50,
                    createdAt: n.createdAt,
                    updatedAt: n.updatedAt,
                    reviewedAt: n.metadata?.reviewedAt || null,
                    reviewCount: n.metadata?.reviewCount || 0
                };
            });
        },
        // 其他方法...
        autoLinkForLesson: function(lessonId) {
            var kg = window.LawAIApp?.KnowledgeGraph;
            if (!kg) return;
            
            // 通过 KnowledgeGraph API 建立关系
            // 查找同阶段课程...
        }
    };
})();

console.log('🧠 SecondBrainEngine V3.0 ready (adapter mode)');
