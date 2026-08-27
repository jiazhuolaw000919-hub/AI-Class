// ================================================================
// ENGINE: KnowledgeGraph
// LAYER: Core Logic Layer
// DOMAIN: Knowledge Graph & Relationship Management
// VERSION: 2.0.0 — Part 40 Knowledge Graph Foundation
// ================================================================
//
// PURPOSE
// ================================================================
//   Provide structured representation of relationships between
//   learning objects (knowledge nodes, prerequisites, dependencies).
//
// RELATION TYPES (Part 40)
// ================================================================
//   PREREQUISITE  → A must be learned before B (hard)
//   RELATED       → A and B are meaningfully connected (soft)
//   PART_OF       → A belongs to B (structural)
//   SUPPORTS      → A supports understanding B (soft)
//   NEXT          → A logically comes before B (sequence)
//   SIMILAR       → A and B are similar concepts
//   EXTENDS       → A extends B (advanced)
//   APPLIES_TO    → A applies to B (practical)
//
// CORE PRINCIPLE
// ================================================================
//   Knowledge Graph describes RELATIONSHIPS, not content.
//   It does NOT own: Memory, Mastery, Review, Recommendation.
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.KnowledgeGraph && window.LawAIApp.KnowledgeGraph._upgraded) {
        console.log('[KnowledgeGraph] Already upgraded, skipping...');
        return;
    }

    // ============================================================
    // RELATION TYPE CONSTANTS
    // ============================================================
    var RELATION_TYPES = {
        PREREQUISITE: 'PREREQUISITE',
        RELATED: 'RELATED',
        PART_OF: 'PART_OF',
        SUPPORTS: 'SUPPORTS',
        NEXT: 'NEXT',
        SIMILAR: 'SIMILAR',
        EXTENDS: 'EXTENDS',
        APPLIES_TO: 'APPLIES_TO'
    };

    var RELATION_DIRECTIONS = {
        PREREQUISITE: 'directed',
        RELATED: 'undirected',
        PART_OF: 'directed',
        SUPPORTS: 'directed',
        NEXT: 'directed',
        SIMILAR: 'undirected',
        EXTENDS: 'directed',
        APPLIES_TO: 'directed'
    };

    var RELATION_PRIORITY = {
        PREREQUISITE: 100,
        EXTENDS: 80,
        PART_OF: 70,
        SUPPORTS: 60,
        NEXT: 50,
        APPLIES_TO: 40,
        RELATED: 30,
        SIMILAR: 20
    };

    // ============================================================
    // NODE MODEL
    // ============================================================
    var NODE_TYPES = {
        KNOWLEDGE: 'KNOWLEDGE',
        SKILL: 'SKILL',
        LESSON: 'LESSON',
        RESOURCE: 'RESOURCE',
        COURSE: 'COURSE',
        PROJECT: 'PROJECT',
        ASSESSMENT: 'ASSESSMENT'
    };

    // ============================================================
    // STORAGE
    // ============================================================
    var _storageKey = 'knowledge_graph';
    var _schemaVersion = '2.0.0';
    var _initialized = false;

    var _nodes = {};
    var _relations = {};
    var _indexes = {
        byNode: {},
        byType: {},
        byRelationType: {}
    };

    // ============================================================
    // CORE: Node Management
    // ============================================================

    /**
     * 注册知识节点
     */
    function registerNode(node) {
        if (!node || !node.id) {
            console.warn('[KnowledgeGraph] Node requires id');
            return null;
        }

        // 如果节点已存在，检查是否需要更新
        if (_nodes[node.id]) {
            // 允许更新，但保留原始创建时间
            var existing = _nodes[node.id];
            _nodes[node.id] = {
                ...existing,
                ...node,
                updatedAt: Date.now()
            };
            return _nodes[node.id];
        }

        var newNode = {
            id: node.id,
            type: node.type || NODE_TYPES.KNOWLEDGE,
            title: node.title || node.id,
            description: node.description || '',
            status: node.status || 'active',
            courseId: node.courseId || null,
            subjectId: node.subjectId || null,
            lessonId: node.lessonId || null,
            metadata: node.metadata || {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
            schemaVersion: _schemaVersion
        };

        _nodes[node.id] = newNode;

        // 更新索引
        if (!_indexes.byType[newNode.type]) {
            _indexes.byType[newNode.type] = [];
        }
        _indexes.byType[newNode.type].push(node.id);

        _save();

        return newNode;
    }

    /**
     * 获取节点
     */
    function getNode(id) {
        return _nodes[id] || null;
    }

    /**
     * 检查节点是否存在
     */
    function hasNode(id) {
        return !!_nodes[id];
    }

    /**
     * 获取所有节点
     */
    function getAllNodes() {
        return Object.values(_nodes);
    }

    /**
     * 按类型获取节点
     */
    function getNodesByType(type) {
        var ids = _indexes.byType[type] || [];
        return ids.map(function(id) { return _nodes[id]; }).filter(function(n) { return n; });
    }

    /**
     * 获取活跃节点
     */
    function getActiveNodes() {
        return Object.values(_nodes).filter(function(n) {
            return n.status === 'active' || n.status === 'published';
        });
    }

    /**
     * 弃用节点
     */
    function deprecateNode(id, reason) {
        var node = _nodes[id];
        if (!node) return false;

        node.status = 'deprecated';
        node.deprecatedAt = Date.now();
        node.deprecationReason = reason || 'No reason provided';
        node.updatedAt = Date.now();
        _save();
        return true;
    }

    /**
     * 删除节点（仅当无关系时）
     */
    function removeNode(id) {
        var node = _nodes[id];
        if (!node) return false;

        // 检查是否有关系
        var hasRelations = false;
        for (var key in _relations) {
            var rel = _relations[key];
            if (rel.from === id || rel.to === id) {
                hasRelations = true;
                break;
            }
        }

        if (hasRelations) {
            console.warn('[KnowledgeGraph] Cannot delete node with relationships:', id);
            return false;
        }

        delete _nodes[id];

        // 更新索引
        for (var type in _indexes.byType) {
            var idx = _indexes.byType[type];
            var pos = idx.indexOf(id);
            if (pos !== -1) {
                idx.splice(pos, 1);
            }
        }

        _save();
        return true;
    }

    // ============================================================
    // CORE: Relation Management
    // ============================================================

    /**
     * 注册关系
     */
    function registerRelation(relation) {
        if (!relation || !relation.from || !relation.to || !relation.type) {
            console.warn('[KnowledgeGraph] Relation requires from, to, type');
            return null;
        }

        // 检查节点是否存在
        if (!_nodes[relation.from]) {
            console.warn('[KnowledgeGraph] Source node not found:', relation.from);
            return null;
        }
        if (!_nodes[relation.to]) {
            console.warn('[KnowledgeGraph] Target node not found:', relation.to);
            return null;
        }

        // 检查自引用
        if (relation.from === relation.to) {
            console.warn('[KnowledgeGraph] Self-relation rejected:', relation.from, '→', relation.to);
            return null;
        }

        // 检查重复
        var existing = _findRelation(relation.from, relation.to, relation.type);
        if (existing) {
            console.warn('[KnowledgeGraph] Duplicate relation exists:', relation.from, '→', relation.to, relation.type);
            return existing;
        }

        // 如果是 PREREQUISITE，检查循环
        if (relation.type === RELATION_TYPES.PREREQUISITE) {
            if (_wouldCreateCycle(relation.from, relation.to)) {
                console.warn('[KnowledgeGraph] Cycle detected:', relation.from, '→', relation.to);
                return null;
            }
        }

        var id = 'rel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

        var newRelation = {
            id: id,
            from: relation.from,
            to: relation.to,
            type: relation.type,
            direction: relation.direction || RELATION_DIRECTIONS[relation.type] || 'directed',
            weight: relation.weight || 1,
            confidence: relation.confidence || 0.8,
            source: relation.source || 'SYSTEM',
            metadata: relation.metadata || {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
            schemaVersion: _schemaVersion
        };

        _relations[id] = newRelation;

        // 更新索引
        if (!_indexes.byNode[relation.from]) {
            _indexes.byNode[relation.from] = [];
        }
        _indexes.byNode[relation.from].push(id);

        if (!_indexes.byNode[relation.to]) {
            _indexes.byNode[relation.to] = [];
        }
        _indexes.byNode[relation.to].push(id);

        if (!_indexes.byRelationType[relation.type]) {
            _indexes.byRelationType[relation.type] = [];
        }
        _indexes.byRelationType[relation.type].push(id);

        _save();
        return newRelation;
    }

    /**
     * 查找关系
     */
    function _findRelation(from, to, type) {
        for (var key in _relations) {
            var rel = _relations[key];
            if (rel.from === from && rel.to === to && rel.type === type) {
                return rel;
            }
        }
        return null;
    }

    /**
     * 检查关系是否存在
     */
    function hasRelation(from, to, type) {
        return !!_findRelation(from, to, type);
    }

    /**
     * 获取节点的所有关系
     */
    function getRelations(nodeId) {
        var ids = _indexes.byNode[nodeId] || [];
        return ids.map(function(id) { return _relations[id]; }).filter(function(r) { return r; });
    }

    /**
     * 获取特定类型的关系
     */
    function getRelationsByType(type) {
        var ids = _indexes.byRelationType[type] || [];
        return ids.map(function(id) { return _relations[id]; }).filter(function(r) { return r; });
    }

    // ============================================================
    // CORE: Prerequisite Queries
    // ============================================================

    /**
     * 获取前置条件（直接依赖）
     */
    function getPrerequisites(nodeId) {
        var relations = getRelations(nodeId);
        return relations
            .filter(function(r) {
                return r.to === nodeId && r.type === RELATION_TYPES.PREREQUISITE;
            })
            .map(function(r) {
                return _nodes[r.from];
            })
            .filter(function(n) { return n; });
    }

    /**
     * 获取依赖者（谁依赖这个节点）
     */
    function getDependents(nodeId) {
        var relations = getRelations(nodeId);
        return relations
            .filter(function(r) {
                return r.from === nodeId && r.type === RELATION_TYPES.PREREQUISITE;
            })
            .map(function(r) {
                return _nodes[r.to];
            })
            .filter(function(n) { return n; });
    }

    /**
     * 获取前置条件链（完整的依赖路径）
     */
    function getPrerequisiteChain(nodeId) {
        var chain = [];
        var visited = {};

        function traverse(id) {
            if (visited[id]) return;
            visited[id] = true;

            var prereqs = getPrerequisites(id);
            for (var i = 0; i < prereqs.length; i++) {
                var prereq = prereqs[i];
                traverse(prereq.id);
                if (chain.indexOf(prereq) === -1) {
                    chain.push(prereq);
                }
            }
            // 添加当前节点（在依赖之后）
            var node = _nodes[id];
            if (node && chain.indexOf(node) === -1) {
                chain.push(node);
            }
        }

        traverse(nodeId);
        return chain;
    }

    /**
     * 获取依赖深度（最长前置路径长度）
     */
    function getDependencyDepth(nodeId) {
        var chain = getPrerequisiteChain(nodeId);
        // 深度 = chain 中前置节点的数量（不包括自身）
        return chain.length - 1;
    }

    /**
     * 获取拓扑排序
     */
    function getTopologicalOrder() {
        var nodes = Object.values(_nodes);
        var visited = {};
        var order = [];

        function visit(id) {
            if (visited[id]) return;
            visited[id] = true;

            var deps = getDependents(id);
            for (var i = 0; i < deps.length; i++) {
                visit(deps[i].id);
            }
            order.push(id);
        }

        for (var i = 0; i < nodes.length; i++) {
            if (!visited[nodes[i].id]) {
                visit(nodes[i].id);
            }
        }

        return order.reverse().map(function(id) { return _nodes[id]; }).filter(function(n) { return n; });
    }

    // ============================================================
    // CORE: Cycle Detection
    // ============================================================

    function _wouldCreateCycle(from, to) {
        // 检查是否已存在 to → from 的路径
        var visited = {};

        function hasPath(current, target) {
            if (current === target) return true;
            if (visited[current]) return false;
            visited[current] = true;

            var deps = getDependents(current);
            for (var i = 0; i < deps.length; i++) {
                if (hasPath(deps[i].id, target)) {
                    return true;
                }
            }
            return false;
        }

        return hasPath(to, from);
    }

    /**
     * 验证图谱（检测循环、孤立节点等）
     */
    function validateGraph() {
        var errors = [];
        var warnings = [];

        // 检查孤立节点
        var orphanNodes = [];
        for (var nodeId in _nodes) {
            var rels = getRelations(nodeId);
            if (rels.length === 0) {
                orphanNodes.push(nodeId);
            }
        }

        if (orphanNodes.length > 0) {
            warnings.push('Orphan nodes: ' + orphanNodes.join(', '));
        }

        // 检查关系目标是否存在
        for (var relId in _relations) {
            var rel = _relations[relId];
            if (!_nodes[rel.from]) {
                errors.push('Missing source node: ' + rel.from);
            }
            if (!_nodes[rel.to]) {
                errors.push('Missing target node: ' + rel.to);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            nodeCount: Object.keys(_nodes).length,
            relationCount: Object.keys(_relations).length,
            orphanCount: orphanNodes.length
        };
    }

    // ============================================================
    // CORE: Serialization
    // ============================================================

    function exportGraph() {
        return {
            schemaVersion: _schemaVersion,
            exportedAt: Date.now(),
            nodes: Object.values(_nodes),
            relations: Object.values(_relations)
        };
    }

    function importGraph(data) {
        if (!data || typeof data !== 'object') {
            console.warn('[KnowledgeGraph] Invalid import data');
            return false;
        }

        try {
            // 清空现有数据
            _nodes = {};
            _relations = {};
            _indexes = {
                byNode: {},
                byType: {},
                byRelationType: {}
            };

            // 导入节点
            if (data.nodes && Array.isArray(data.nodes)) {
                for (var i = 0; i < data.nodes.length; i++) {
                    registerNode(data.nodes[i]);
                }
            }

            // 导入关系
            if (data.relations && Array.isArray(data.relations)) {
                for (var j = 0; j < data.relations.length; j++) {
                    var rel = data.relations[j];
                    // 跳过无效关系
                    if (!rel.from || !rel.to || !rel.type) continue;
                    registerRelation(rel);
                }
            }

            _save();
            console.log('[KnowledgeGraph] ✅ Import complete, nodes:', Object.keys(_nodes).length, 'relations:', Object.keys(_relations).length);
            return true;
        } catch (e) {
            console.error('[KnowledgeGraph] Import failed:', e);
            return false;
        }
    }

    // ============================================================
    // CORE: Storage
    // ============================================================

    function _load() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            if (stored) {
                if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                    console.warn('[KnowledgeGraph] Schema version mismatch, migrating...');
                    // 简单迁移：保留数据，更新版本
                    _nodes = stored.nodes || {};
                    _relations = stored.relations || {};
                    _rebuildIndexes();
                    _save();
                } else {
                    _nodes = stored.nodes || {};
                    _relations = stored.relations || {};
                    _rebuildIndexes();
                }
                console.log('[KnowledgeGraph] Loaded from storage, nodes:', Object.keys(_nodes).length);
            }
        } catch (e) {
            console.warn('[KnowledgeGraph] Load failed:', e);
        }
    }

    function _save() {
        try {
            var data = {
                _schemaVersion: _schemaVersion,
                nodes: _nodes,
                relations: _relations,
                updatedAt: Date.now()
            };
            LawAIApp.StorageEngine?.set?.(_storageKey, data);
        } catch (e) {
            console.warn('[KnowledgeGraph] Save failed:', e);
        }
    }

    function _rebuildIndexes() {
        _indexes = {
            byNode: {},
            byType: {},
            byRelationType: {}
        };

        for (var nodeId in _nodes) {
            var node = _nodes[nodeId];
            if (!_indexes.byType[node.type]) {
                _indexes.byType[node.type] = [];
            }
            _indexes.byType[node.type].push(nodeId);
        }

        for (var relId in _relations) {
            var rel = _relations[relId];
            if (!_indexes.byNode[rel.from]) {
                _indexes.byNode[rel.from] = [];
            }
            _indexes.byNode[rel.from].push(relId);
            if (!_indexes.byNode[rel.to]) {
                _indexes.byNode[rel.to] = [];
            }
            _indexes.byNode[rel.to].push(relId);
            if (!_indexes.byRelationType[rel.type]) {
                _indexes.byRelationType[rel.type] = [];
            }
            _indexes.byRelationType[rel.type].push(relId);
        }
    }

    // ============================================================
    // CORE: Initialization
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[KnowledgeGraph] Already initialized');
            return;
        }

        console.log('[KnowledgeGraph] 🚀 Initializing v2.0.0...');

        try {
            _load();

            // 如果有默认测试数据，可以注册
            // 但保持为空，由外部填充

            _initialized = true;
            console.log('[KnowledgeGraph] ✅ Initialized, nodes:', Object.keys(_nodes).length, 'relations:', Object.keys(_relations).length);
        } catch (e) {
            console.error('[KnowledgeGraph] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    /**
     * 获取未满足的前置条件（基于 Learner Model）
     * @param {string} nodeId - 知识节点 ID
     * @param {Object} learnerModel - Learner Model 实例
     * @returns {Array} 未满足的前置条件列表
     */
    getUnmetPrerequisites: function(nodeId, learnerModel) {
        var prereqs = this.getPrerequisites(nodeId);
        if (!learnerModel || !Array.isArray(prereqs) || prereqs.length === 0) {
            return prereqs || [];
        }

        var unmet = [];
        for (var i = 0; i < prereqs.length; i++) {
            var prereq = prereqs[i];
            var knowledgeState = learnerModel.getKnowledgeState ? 
                learnerModel.getKnowledgeState(prereq.id) : null;

            // 如果前置知识未掌握 (mastery < 0.6)，标记为未满足
            if (!knowledgeState || (knowledgeState.mastery && knowledgeState.mastery.level < 0.6)) {
                unmet.push({
                    node: prereq,
                    reason: 'Not mastered',
                    currentMastery: knowledgeState ? knowledgeState.mastery.level : 0
                });
            }
        }

        return unmet;
    }

    // ============================================================
    // CORE: Status
    // ============================================================

    function getStatus() {
        var validation = validateGraph();
        return {
            version: '2.0.0',
            initialized: _initialized,
            schemaVersion: _schemaVersion,
            nodeCount: Object.keys(_nodes).length,
            relationCount: Object.keys(_relations).length,
            relationTypes: Object.keys(_indexes.byRelationType),
            nodeTypes: Object.keys(_indexes.byType),
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            orphanCount: validation.orphanCount,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ============================================================
    // CORE: Reset
    // ============================================================

    function reset() {
        _nodes = {};
        _relations = {};
        _indexes = {
            byNode: {},
            byType: {},
            byRelationType: {}
        };
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, {
                _schemaVersion: _schemaVersion,
                nodes: {},
                relations: {}
            });
        } catch (e) {}
        console.log('[KnowledgeGraph] Reset complete');
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    var KnowledgeGraph = {
        _upgraded: true,
        _version: '2.0.0',

        // Constants
        RELATION_TYPES: RELATION_TYPES,
        NODE_TYPES: NODE_TYPES,

        // Lifecycle
        init: init,
        reset: reset,

        // Node API
        registerNode: registerNode,
        getNode: getNode,
        hasNode: hasNode,
        getAllNodes: getAllNodes,
        getNodesByType: getNodesByType,
        getActiveNodes: getActiveNodes,
        deprecateNode: deprecateNode,
        removeNode: removeNode,

        // Relation API
        registerRelation: registerRelation,
        hasRelation: hasRelation,
        getRelations: getRelations,
        getRelationsByType: getRelationsByType,

        // Prerequisite Queries
        getPrerequisites: getPrerequisites,
        getDependents: getDependents,
        getPrerequisiteChain: getPrerequisiteChain,
        getDependencyDepth: getDependencyDepth,
        getTopologicalOrder: getTopologicalOrder,

        // Validation
        validateGraph: validateGraph,

        // Serialization
        exportGraph: exportGraph,
        importGraph: importGraph,

        // Status
        getStatus: getStatus
    };

    // ============================================================
    // EXPORT
    // ============================================================

    window.LawAIApp.KnowledgeGraph = KnowledgeGraph;

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            KnowledgeGraph.init();
            console.log('[KnowledgeGraph] ✅ Auto-initialized');
        } catch (err) {
            console.warn('[KnowledgeGraph] ⚠️ Auto-init failed:', err);
        }
    }, 800);

    console.log('[KnowledgeGraph] ✅ Module loaded (v2.0.0)');

})();
