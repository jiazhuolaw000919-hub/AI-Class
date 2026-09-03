// pkosKnowledgeGraph.js — 改为使用 KnowledgeGraph API

LawAIApp.PKOSKnowledgeGraph = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[PKOSGraph] Initialized (using KnowledgeGraph API)');
    },

    syncNotesToGraph: function() {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) {
            console.warn('[PKOSGraph] KnowledgeGraph not available');
            return { nodes: [], edges: [] };
        }
        
        var notes = window.LawAIApp?.KnowledgeCapture?.getNotes() || [];
        var graph = {
            nodes: [],
            edges: []
        };
        
        // 通过 KnowledgeGraph 注册节点
        notes.forEach(function(note) {
            if (!kg.hasNode(note.id)) {
                var node = kg.registerNode({
                    id: note.id,
                    type: kg.NODE_TYPES.KNOWLEDGE,
                    title: note.title || 'Untitled',
                    description: note.content || '',
                    metadata: {
                        tags: note.tags || [],
                        type: note.type,
                        createdAt: note.createdAt
                    }
                });
                graph.nodes.push({
                    id: node.id,
                    label: node.title,
                    type: node.type,
                    tags: node.metadata?.tags || []
                });
            }
        });
        
        // 建立基于标签的关系
        for (var i = 0; i < notes.length; i++) {
            for (var j = i + 1; j < notes.length; j++) {
                var tags1 = notes[i].tags || [];
                var tags2 = notes[j].tags || [];
                var commonTags = tags1.filter(function(t) { return tags2.indexOf(t) !== -1; });
                
                if (commonTags.length > 0) {
                    if (!kg.hasRelation(notes[i].id, notes[j].id, kg.RELATION_TYPES.RELATED)) {
                        var rel = kg.registerRelation({
                            from: notes[i].id,
                            to: notes[j].id,
                            type: kg.RELATION_TYPES.RELATED,
                            weight: commonTags.length,
                            confidence: 0.7,
                            metadata: { tags: commonTags }
                        });
                        if (rel) {
                            graph.edges.push({
                                source: rel.from,
                                target: rel.to,
                                relation: rel.type,
                                tags: commonTags
                            });
                        }
                    }
                }
            }
        }
        
        return graph;
    },

    getGraphData: function() {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) return { nodes: [], edges: [] };
        
        var allNodes = kg.getAllNodes();
        var allRels = [];
        allNodes.forEach(function(node) {
            var rels = kg.getRelations(node.id);
            allRels = allRels.concat(rels);
        });
        
        return {
            nodes: allNodes.map(function(n) {
                return {
                    id: n.id,
                    label: n.title,
                    type: n.type,
                    tags: n.metadata?.tags || []
                };
            }),
            edges: allRels.map(function(r) {
                return {
                    source: r.from,
                    target: r.to,
                    relation: r.type,
                    weight: r.weight
                };
            })
        };
    },

    getNeighbors: function(entityId) {
        var kg = window.LawAIApp?.KnowledgeGraph;
        if (!kg) return { nodes: [], edges: [] };
        
        var rels = kg.getRelations(entityId);
        var neighborIds = [];
        rels.forEach(function(rel) {
            if (rel.from === entityId) neighborIds.push(rel.to);
            if (rel.to === entityId) neighborIds.push(rel.from);
        });
        
        var nodes = neighborIds.map(function(id) {
            var node = kg.getNode(id);
            return node ? {
                id: node.id,
                label: node.title,
                type: node.type
            } : null;
        }).filter(function(n) { return n; });
        
        return {
            nodes: nodes,
            edges: rels.map(function(r) {
                return {
                    source: r.from,
                    target: r.to,
                    relation: r.type
                };
            })
        };
    }
};

console.log('🔗 PKOSKnowledgeGraph loaded (adapter mode)');
