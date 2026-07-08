// ===========================================
// knowledgeGraph.js
// 知识图谱引擎 - 知识节点网络（Phase 28 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeGraph = (function() {
    var _initialized = false;
    var _nodes = [];
    var _edges = [];

    // ===========================================
    // 节点管理
    // ===========================================
    function getNodes() {
        _sync();
        return _nodes;
    }

    function getEdges() {
        _sync();
        return _edges;
    }

    function getGraph() {
        _sync();
        return {
            nodes: _nodes,
            edges: _edges,
            nodeCount: _nodes.length,
            edgeCount: _edges.length
        };
    }

    function getNode(lessonId) {
        _sync();
        return _nodes.find(function(n) { return n.id === lessonId; }) || null;
    }

    function addNode(lessonId, label, data) {
        _sync();
        var existing = getNode(lessonId);
        if (existing) return existing;
        
        var node = {
            id: lessonId,
            label: label || lessonId,
            type: 'lesson',
            confidence: 50,
            data: data || {},
            createdAt: new Date().toISOString()
        };
        
        _nodes.push(node);
        _save();
        return node;
    }

    // ===========================================
    // 边管理
    // ===========================================
    function addEdge(fromId, toId, type) {
        _sync();
        type = type || 'related';
        
        // 检查是否已存在
        var existing = _edges.find(function(e) {
            return (e.from === fromId && e.to === toId) ||
                   (e.from === toId && e.to === fromId);
        });
        if (existing) return existing;
        
        var edge = {
            from: fromId,
            to: toId,
            type: type,
            createdAt: new Date().toISOString()
        };
        
        _edges.push(edge);
        _save();
        return edge;
    }

    function getNeighbors(lessonId) {
        _sync();
        var neighborIds = [];
        _edges.forEach(function(e) {
            if (e.from === lessonId && neighborIds.indexOf(e.to) === -1) {
                neighborIds.push(e.to);
            }
            if (e.to === lessonId && neighborIds.indexOf(e.from) === -1) {
                neighborIds.push(e.from);
            }
        });
        
        return neighborIds.map(function(id) {
            return getNode(id);
        }).filter(function(n) { return n; });
    }

    function getConnections(lessonId) {
        _sync();
        var result = [];
        _edges.forEach(function(e) {
            if (e.from === lessonId) {
                result.push({ target: e.to, type: e.type, direction: 'out' });
            }
            if (e.to === lessonId) {
                result.push({ target: e.from, type: e.type, direction: 'in' });
            }
        });
        return result;
    }

    // ===========================================
    // 图谱分析
    // ===========================================
    function findPath(fromId, toId) {
        _sync();
        // BFS 搜索
        var queue = [[fromId]];
        var visited = {};
        visited[fromId] = true;
        
        while (queue.length > 0) {
            var path = queue.shift();
            var current = path[path.length - 1];
            
            if (current === toId) {
                return path;
            }
            
            var neighbors = getNeighbors(current);
            for (var i = 0; i < neighbors.length; i++) {
                var n = neighbors[i];
                if (!n) continue;
                if (!visited[n.id]) {
                    visited[n.id] = true;
                    var newPath = path.slice();
                    newPath.push(n.id);
                    queue.push(newPath);
                }
            }
        }
        
        return null;
    }

    function getClusters() {
        _sync();
        // 简单的聚类：基于节点连接
        var clusters = {};
        var visited = {};
        
        function traverse(nodeId, clusterId) {
            if (visited[nodeId]) return;
            visited[nodeId] = true;
            clusters[clusterId].push(nodeId);
            
            var neighbors = getNeighbors(nodeId);
            for (var i = 0; i < neighbors.length; i++) {
                var n = neighbors[i];
                if (n && !visited[n.id]) {
                    traverse(n.id, clusterId);
                }
            }
        }
        
        var clusterId = 0;
        for (var i = 0; i < _nodes.length; i++) {
            var node = _nodes[i];
            if (!visited[node.id]) {
                clusters['cluster_' + clusterId] = [];
                traverse(node.id, 'cluster_' + clusterId);
                clusterId++;
            }
        }
        
        return clusters;
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var storedNodes = LawAIApp.StorageEngine?.get?.('kg_nodes');
            if (storedNodes) _nodes = storedNodes;
            
            var storedEdges = LawAIApp.StorageEngine?.get?.('kg_edges');
            if (storedEdges) _edges = storedEdges;
        } catch (e) {}
    }

    function _save() {
        try {
            LawAIApp.StorageEngine?.set?.('kg_nodes', _nodes);
            LawAIApp.StorageEngine?.set?.('kg_edges', _edges);
        } catch (e) {}
    }

    function _initFromCards() {
        try {
            var cards = LawAIApp.SecondBrainEngine?.getAllCards?.() || [];
            cards.forEach(function(card) {
                if (card && card.lessonId) {
                    addNode(card.lessonId, card.title, { confidence: card.confidence });
                }
            });
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        if (_nodes.length === 0) {
            _initFromCards();
        }
        
        console.log('🕸️ KnowledgeGraph initialized');
    }

    setTimeout(init, 400);

    return {
        init: init,
        getGraph: getGraph,
        getNodes: getNodes,
        getEdges: getEdges,
        getNode: getNode,
        addNode: addNode,
        addEdge: addEdge,
        getNeighbors: getNeighbors,
        getConnections: getConnections,
        findPath: findPath,
        getClusters: getClusters
    };
})();

console.log('🕸️ KnowledgeGraph V2.0 ready');
