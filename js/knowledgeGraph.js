// ================================================================
// ENGINE: KnowledgeGraph
// LAYER: Core Logic Layer
// DOMAIN: Knowledge Graph & Relationship Management
// VERSION: 2.0.0 — Part 40 Knowledge Graph Foundation
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

    function registerNode(node) {
        if (!node || !node.id) {
            console.warn('[KnowledgeGraph] Node requires id');
            return null;
        }

        if (_nodes[node.id]) {
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

        if (!_indexes.byType[newNode.type]) {
            _indexes.byType[newNode.type] = [];
        }
        _indexes.byType[newNode.type].push(node.id);

        _save();

        return newNode;
    }

    function getNode(id) {
        return _nodes[id] || null;
    }

    function hasNode(id) {
        return !!_nodes[id];
    }

    function getAllNodes() {
        return Object.values(_nodes);
    }

    function getNodesByType(type) {
        var ids = _indexes.byType[type] || [];
        return ids.map(function(id) { return _nodes[id]; }).filter(function(n) { return n; });
    }

    function getActiveNodes() {
        return Object.values(_nodes).filter(function(n) {
            return n.status === 'active' || n.status === 'published';
        });
    }

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

    function removeNode(id) {
        var node = _nodes[id];
        if (!node) return false;

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

    function registerRelation(relation) {
        if (!relation || !relation.from || !relation.to || !relation.type) {
            console.warn('[KnowledgeGraph] Relation requires from, to, type');
            return null;
        }

        if (!_nodes[relation.from]) {
            console.warn('[KnowledgeGraph] Source node not found:', relation.from);
            return null;
        }
        if (!_nodes[relation.to]) {
            console.warn('[KnowledgeGraph] Target node not found:', relation.to);
            return null;
        }

        if (relation.from === relation.to) {
            console.warn('[KnowledgeGraph] Self-relation rejected:', relation.from, '→', relation.to);
            return null;
        }

        var existing = _findRelation(relation.from, relation.to, relation.type);
        if (existing) {
            console.warn('[KnowledgeGraph] Duplicate relation exists:', relation.from, '→', relation.to, relation.type);
            return existing;
        }

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

    function _findRelation(from, to, type) {
        for (var key in _relations) {
            var rel = _relations[key];
            if (rel.from === from && rel.to === to && rel.type === type) {
                return rel;
            }
        }
        return null;
    }

    function hasRelation(from, to, type) {
        return !!_findRelation(from, to, type);
    }

    function getRelations(nodeId) {
        var ids = _indexes.byNode[nodeId] || [];
        return ids.map(function(id) { return _relations[id]; }).filter(function(r) { return r; });
    }

    function getRelationsByType(type) {
        var ids = _indexes.byRelationType[type] || [];
        return ids.map(function(id) { return _relations[id]; }).filter(function(r) { return r; });
    }

    // ============================================================
    // CORE: Prerequisite Queries
    // ============================================================

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
            var node = _nodes[id];
            if (node && chain.indexOf(node) === -1) {
                chain.push(node);
            }
        }

        traverse(nodeId);
        return chain;
    }

    function getDependencyDepth(nodeId) {
        var chain = getPrerequisiteChain(nodeId);
        return chain.length - 1;
    }

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

    function validateGraph() {
        var errors = [];
        var warnings = [];

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
            _nodes = {};
            _relations = {};
            _indexes = {
                byNode: {},
                byType: {},
                byRelationType: {}
            };

            if (data.nodes && Array.isArray(data.nodes)) {
                for (var i = 0; i < data.nodes.length; i++) {
                    registerNode(data.nodes[i]);
                }
            }

            if (data.relations && Array.isArray(data.relations)) {
                for (var j = 0; j < data.relations.length; j++) {
                    var rel = data.relations[j];
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

            _initialized = true;
            console.log('[KnowledgeGraph] ✅ Initialized, nodes:', Object.keys(_nodes).length, 'relations:', Object.keys(_relations).length);
        } catch (e) {
            console.error('[KnowledgeGraph] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    function getUnmetPrerequisites(nodeId, learnerModel) {
        var prereqs = getPrerequisites(nodeId);
        if (!learnerModel || !Array.isArray(prereqs) || prereqs.length === 0) {
            return prereqs || [];
        }

        var unmet = [];
        for (var i = 0; i < prereqs.length; i++) {
            var prereq = prereqs[i];
            var knowledgeState = learnerModel.getKnowledgeState ? 
                learnerModel.getKnowledgeState(prereq.id) : null;

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
    // PUBLIC API（包含 PART 118 增强查询）
    // ============================================================
    var KnowledgeGraph = {
        _upgraded: true,
        _version: '2.0.0',

        RELATION_TYPES: RELATION_TYPES,
        NODE_TYPES: NODE_TYPES,

        init: init,
        reset: reset,

        registerNode: registerNode,
        getNode: getNode,
        hasNode: hasNode,
        getAllNodes: getAllNodes,
        getNodesByType: getNodesByType,
        getActiveNodes: getActiveNodes,
        deprecateNode: deprecateNode,
        removeNode: removeNode,

        registerRelation: registerRelation,
        hasRelation: hasRelation,
        getRelations: getRelations,
        getRelationsByType: getRelationsByType,

        getPrerequisites: getPrerequisites,
        getDependents: getDependents,
        getPrerequisiteChain: getPrerequisiteChain,
        getDependencyDepth: getDependencyDepth,
        getTopologicalOrder: getTopologicalOrder,

        getUnmetPrerequisites: getUnmetPrerequisites,

        validateGraph: validateGraph,

        exportGraph: exportGraph,
        importGraph: importGraph,

        getStatus: getStatus,

        // ============================================================
        // PART 118: 增强查询 API
        // ============================================================
        getEntity: function(id) {
            var node = this.getNode(id);
            if (!node) return null;
            return {
                id: node.id,
                type: node.type,
                label: node.title,
                description: node.description,
                status: node.status,
                source: { type: node.type, id: node.id },
                provenance: { createdAt: node.createdAt, updatedAt: node.updatedAt }
            };
        },

        getRelationships: function(entityId) {
            var rels = this.getRelations(entityId);
            return rels.map(function(rel) {
                return {
                    id: rel.id,
                    source: rel.from,
                    target: rel.to,
                    type: rel.type,
                    direction: rel.direction,
                    weight: rel.weight,
                    confidence: rel.confidence,
                    sourceType: rel.source,
                    provenance: { createdAt: rel.createdAt, updatedAt: rel.updatedAt }
                };
            });
        },

        getGraphStats: function() {
            var validation = this.validateGraph();
            var typeStats = {};
            for (var type in _indexes.byType) { typeStats[type] = _indexes.byType[type].length; }
            var relTypeStats = {};
            for (var relType in _indexes.byRelationType) { relTypeStats[relType] = _indexes.byRelationType[relType].length; }
            return {
                totalEntities: Object.keys(_nodes).length,
                totalRelationships: Object.keys(_relations).length,
                typeStats: typeStats,
                relationTypeStats: relTypeStats,
                orphanCount: validation.orphanCount || 0,
                valid: validation.valid,
                errors: validation.errors || [],
                warnings: validation.warnings || []
            };
        },

        getEntityTags: function(entityId) {
            var node = this.getNode(entityId);
            if (!node) return [];
            var tags = node.metadata?.tags || [];
            var rels = this.getRelations(entityId);
            rels.forEach(function(rel) {
                var target = this.getNode(rel.to);
                if (target && target.metadata?.tags) {
                    target.metadata.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) tags.push(tag);
                    });
                }
            }.bind(this));
            return tags;
        },

        getConcepts: function() {
            var knowledgeNodes = this.getNodesByType(this.NODE_TYPES.KNOWLEDGE);
            var lessonNodes = this.getNodesByType(this.NODE_TYPES.LESSON);
            return knowledgeNodes.concat(lessonNodes);
        }
    }
    
    // ============================================================
    // PART 119: 真实数据导入
    // ============================================================

    /**
     * 从 Academy 导入数据到图谱
     * @param {Object} options - 配置选项
     * @param {boolean} options.clearExisting - 是否清空现有图谱
     * @param {boolean} options.dryRun - 是否只预览不实际写入
     * @returns {Object} 导入报告
     */
    ingestFromAcademy: function(options) {
        options = options || {};
        var report = this._createIngestionReport('academy');

        try {
            // 1. 获取 Academy 数据
            var schools = this._getAllSchools();
            report.sourceCounts.schools = schools.length;
    
            // 2. 构建图谱
            schools.forEach(function(school) {
                // School → Course
                var schoolEntity = this._upsertEntity({
                    id: 'school:' + school.id,
                    type: this.NODE_TYPES.COURSE,
                    label: school.title || school.name || school.id,
                    sourceType: 'school',
                    sourceId: school.id,
                    provenance: {
                        sourceSystem: 'academy',
                        sourceType: 'school',
                        sourceId: school.id
                    }
                });
                report.entitiesCreated++;

                var courses = this._getCoursesBySchool(school.id);
                courses.forEach(function(course) {
                    var courseEntity = this._upsertEntity({
                        id: 'course:' + course.id,
                        type: this.NODE_TYPES.COURSE,
                        label: course.title || course.name || course.id,
                        sourceType: 'course',
                        sourceId: course.id,
                        provenance: {
                            sourceSystem: 'academy',
                            sourceType: 'course',
                            sourceId: course.id
                        }
                    });
                    report.entitiesCreated++;
    
                    // Course → Module
                    var modules = this._getModulesByCourse(course.id);
                    modules.forEach(function(module) {
                        var moduleEntity = this._upsertEntity({
                            id: 'module:' + module.id,
                            type: this.NODE_TYPES.KNOWLEDGE,
                            label: module.title || module.name || module.id,
                            sourceType: 'module',
                            sourceId: module.id,
                            provenance: {
                                sourceSystem: 'academy',
                                sourceType: 'module',
                                sourceId: module.id
                            }
                        });
                        report.entitiesCreated++;
    
                        // Module → Subject
                        var subjects = this._getSubjectsByModule(module.id);
                        subjects.forEach(function(subject) {
                            var subjectEntity = this._upsertEntity({
                                id: 'subject:' + subject.id,
                                type: this.NODE_TYPES.KNOWLEDGE,
                                label: subject.title || subject.name || subject.id,
                                sourceType: 'subject',
                                sourceId: subject.id,
                                provenance: {
                                    sourceSystem: 'academy',
                                    sourceType: 'subject',
                                    sourceId: subject.id
                                }
                            });
                            report.entitiesCreated++;
    
                            // Subject → Lesson
                            var lessons = this._getLessonsBySubject(subject.id);
                            lessons.forEach(function(lesson) {
                                var lessonEntity = this._upsertEntity({
                                    id: 'lesson:' + lesson.id,
                                    type: this.NODE_TYPES.LESSON,
                                    label: lesson.title || lesson.name || lesson.id,
                                    sourceType: 'lesson',
                                    sourceId: lesson.id,
                                    provenance: {
                                        sourceSystem: 'academy',
                                        sourceType: 'lesson',
                                        sourceId: lesson.id
                                    }
                                });
                                report.entitiesCreated++;

                                // 创建关系: Subject → CONTAINS → Lesson
                                var rel = this._upsertRelationship({
                                    from: 'subject:' + subject.id,
                                    to: 'lesson:' + lesson.id,
                                    type: this.RELATION_TYPES.PART_OF,
                                    weight: 1,
                                    confidence: 1.0,
                                    source: 'academy',
                                    provenance: {
                                        sourceSystem: 'academy',
                                        sourceType: 'hierarchy',
                                        sourceId: subject.id + '→' + lesson.id
                                    }
                                });
                                if (rel) report.relationshipsCreated++;
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));

            report.status = 'completed';
            report.completedAt = Date.now();

        } catch (e) {
            report.status = 'failed';
            report.error = e.message;
            console.error('[KnowledgeGraph] Academy ingestion failed:', e);
        }

        return report;
    },

    /**
     * 从 Notes 导入数据到图谱
     * @param {Object} options
     * @returns {Object} 导入报告
     */
    ingestFromNotes: function(options) {
        options = options || {};
        var report = this._createIngestionReport('notes');

        try {
            var notes = window.LawAIApp?.KnowledgeCapture?.getNotes() || [];
            report.sourceCounts.notes = notes.length;
    
            notes.forEach(function(note) {
                // 创建 Note 实体
                var noteEntity = this._upsertEntity({
                    id: 'note:' + note.id,
                    type: this.NODE_TYPES.KNOWLEDGE,
                    label: note.title || 'Untitled Note',
                    sourceType: 'note',
                    sourceId: note.id,
                    metadata: {
                        type: note.type,
                        tags: note.tags || [],
                        hasReflection: !!(note.reflections && note.reflections.length > 0),
                        reflectionCount: note.reflections ? note.reflections.length : 0
                    },    
                    provenance: {
                        sourceSystem: 'notes',
                        sourceType: 'note',
                        sourceId: note.id
                    }    
                });
                report.entitiesCreated++;

                // 如果 Note 有 Lesson Context，创建关系
                if (note.lessonId) {
                    var targetId = 'lesson:' + note.lessonId;
                    // 检查目标是否存在
                    if (this.hasNode(targetId)) {
                        var rel = this._upsertRelationship({
                            from: 'note:' + note.id,
                            to: targetId,
                            type: this.RELATION_TYPES.REFERENCES,
                            weight: 1,
                            confidence: 0.9,
                            source: 'notes',
                            provenance: {
                                sourceSystem: 'notes',
                                sourceType: 'context',
                                sourceId: note.id + '→' + note.lessonId
                            }
                        });
                        if (rel) report.relationshipsCreated++;
                    } else {
                        report.brokenReferences++;
                    }
                }    

                // 如果 Note 有 Course Context
                if (note.courseId) {
                    var targetId = 'course:' + note.courseId;
                    if (this.hasNode(targetId)) {
                        var rel = this._upsertRelationship({
                            from: 'note:' + note.id,
                            to: targetId,
                            type: this.RELATION_TYPES.RELATED,
                            weight: 0.7,
                            confidence: 0.7,
                            source: 'notes',
                            provenance: {
                                sourceSystem: 'notes',
                                sourceType: 'context',
                                sourceId: note.id + '→' + note.courseId
                            }
                        });
                        if (rel) report.relationshipsCreated++;
                    }
                }
            }.bind(this));

            report.status = 'completed';
            report.completedAt = Date.now();
    
        } catch (e) {
            report.status = 'failed';
            report.error = e.message;
            console.error('[KnowledgeGraph] Notes ingestion failed:', e);
        }

        return report;
    },

    // ============================================================
    // PART 119: 辅助方法
    // ============================================================

    /**
     * 创建导入报告
     */
    _createIngestionReport: function(sourceType) {
        return {
            sourceType: sourceType,
            status: 'pending',
            startedAt: Date.now(),
            completedAt: null,
            sourceCounts: {
                schools: 0,
                courses: 0,
                modules: 0,
                subjects: 0,
                lessons: 0,
                notes: 0
            },
            entitiesCreated: 0,
            entitiesUpdated: 0,
            relationshipsCreated: 0,
            relationshipsUpdated: 0,
            duplicatesPrevented: 0,
            brokenReferences: 0,
            errors: [],
            error: null
        };    
    },

    /**
     * 获取所有 Schools
     */
    _getAllSchools: function() {
        try {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getSchools === 'function') {
                return loader.getSchools() || [];
            }    
        } catch (e) {
            console.warn('[KnowledgeGraph] Failed to get schools:', e);
        }
        return [];
    },    

    /**
     * 获取 Courses by School
     */    
    _getCoursesBySchool: function(schoolId) {
        try {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getCoursesBySchool === 'function') {
                return loader.getCoursesBySchool(schoolId) || [];
            }    
        } catch (e) {
            console.warn('[KnowledgeGraph] Failed to get courses:', e);
        }    
        return [];
    },

    /**
     * 获取 Modules by Course
     */
    _getModulesByCourse: function(courseId) {
        try {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getModulesByCourse === 'function') {
                return loader.getModulesByCourse(courseId) || [];
            }
        } catch (e) {
            console.warn('[KnowledgeGraph] Failed to get modules:', e);
        }    
        return [];
    },    

    /**
     * 获取 Subjects by Module
     */
    _getSubjectsByModule: function(moduleId) {
        try {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getSubjectsByModule === 'function') {
                return loader.getSubjectsByModule(moduleId) || [];
            }
        } catch (e) {
            console.warn('[KnowledgeGraph] Failed to get subjects:', e);
        }
        return [];
    },

    /**
     * 获取 Lessons by Subject
     */
    _getLessonsBySubject: function(subjectId) {
        try {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (loader && typeof loader.getLessonsBySubject === 'function') {
                return loader.getLessonsBySubject(subjectId) || [];
            }    
        } catch (e) {
            console.warn('[KnowledgeGraph] Failed to get lessons:', e);
        }
        return [];
    },

    /**
     * 更新或创建实体 (idempotent)
     */
    _upsertEntity: function(entityData) {
        // 检查是否已存在
        if (this.hasNode(entityData.id)) {
            var existing = this.getNode(entityData.id);
            // 更新 label 和 metadata
            existing.label = entityData.label || existing.label;
            existing.metadata = { ...existing.metadata, ...entityData.metadata };
            existing.updatedAt = Date.now();
            return existing;
        }

        // 创建新实体
        return this.registerNode({
            id: entityData.id,
            type: entityData.type || this.NODE_TYPES.KNOWLEDGE,
            title: entityData.label,
            description: '',
            metadata: entityData.metadata || {},
            sourceType: entityData.sourceType,
            sourceId: entityData.sourceId,
            provenance: entityData.provenance
        });
    },

    /**
     * 更新或创建关系 (idempotent)
     */
    _upsertRelationship: function(relData) {
        // 检查是否已存在
        if (this.hasRelation(relData.from, relData.to, relData.type)) {
            return null; // 已存在，不重复创建
        }

        // 检查节点是否存在
        if (!this.hasNode(relData.from) || !this.hasNode(relData.to)) {
            console.warn('[KnowledgeGraph] Cannot create relationship: missing node(s)', relData.from, relData.to);
            return null;
        }

        return this.registerRelation({
            from: relData.from,
            to: relData.to,
            type: relData.type || this.RELATION_TYPES.RELATED,
            weight: relData.weight || 1,
            confidence: relData.confidence || 0.8,
            source: relData.source || 'SYSTEM',
            metadata: relData.provenance || {}
        });
    },

    /**
     * 获取导入报告摘要
     */
    getIngestionReport: function() {
        var status = this.getStatus();
        return {
            graphStatus: status,
            lastIngestion: {
                academy: this._getLastIngestion('academy'),
                notes: this._getLastIngestion('notes')
            }
        };
    },

    /**
     * 获取最后一次导入记录
     */
    _getLastIngestion: function(sourceType) {
        try {
            var key = 'lawai_graph_ingestion_' + sourceType;
            var stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * 保存导入记录
     */
    _saveIngestionReport: function(sourceType, report) {
        try {
            var key = 'lawai_graph_ingestion_' + sourceType;
            localStorage.setItem(key, JSON.stringify(report));
        } catch (e) {}
    },

    /**
     * 完整导入 (从所有源)
     */
    ingestAll: function(options) {
        options = options || {};

        // 如果指定清空现有图谱
        if (options.clearExisting) {
            this.reset();
        }

        var academyReport = this.ingestFromAcademy(options);
        this._saveIngestionReport('academy', academyReport);

        var notesReport = this.ingestFromNotes(options);
        this._saveIngestionReport('notes', notesReport);

        // 验证图谱
        var validation = this.validateGraph();

        return {
            academy: academyReport,
            notes: notesReport,
            validation: validation,
            totalEntities: Object.keys(_nodes).length,
            totalRelationships: Object.keys(_relations).length,
            valid: validation.valid
        };
    },

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
