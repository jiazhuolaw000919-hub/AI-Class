// ================================================================
// ENGINE: KnowledgeGraph
// LAYER: Core Logic Layer
// DOMAIN: Knowledge Graph & Relationship Management
// VERSION: 2.0.1 — Part 40 Knowledge Graph Foundation
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
        APPLIES_TO: 'APPLIES_TO',
        TEACHES: 'TEACHES',
        REFERENCES: 'REFERENCES',
        RELATES_TO: 'RELATES_TO',
        DERIVED_FROM: 'DERIVED_FROM',
        REFLECTS_ON: 'REFLECTS_ON'
    };

    var RELATION_DIRECTIONS = {
        PREREQUISITE: 'directed',
        RELATED: 'undirected',
        PART_OF: 'directed',
        SUPPORTS: 'directed',
        NEXT: 'directed',
        SIMILAR: 'undirected',
        EXTENDS: 'directed',
        APPLIES_TO: 'directed',
        TEACHES: 'directed',
        REFERENCES: 'directed',
        RELATES_TO: 'undirected',
        DERIVED_FROM: 'directed',
        REFLECTS_ON: 'directed'
    };

    var RELATION_PRIORITY = {
        PREREQUISITE: 100,
        EXTENDS: 80,
        PART_OF: 70,
        SUPPORTS: 60,
        NEXT: 50,
        APPLIES_TO: 40,
        RELATED: 30,
        SIMILAR: 20,
        TEACHES: 90,
        REFERENCES: 80,
        RELATES_TO: 50,
        DERIVED_FROM: 70,
        REFLECTS_ON: 60
    };

    var NODE_TYPES = {
        KNOWLEDGE: 'KNOWLEDGE',
        SKILL: 'SKILL',
        LESSON: 'LESSON',
        RESOURCE: 'RESOURCE',
        COURSE: 'COURSE',
        PROJECT: 'PROJECT',
        ASSESSMENT: 'ASSESSMENT',
        SCHOOL: 'SCHOOL'
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
            _nodes[node.id] = Object.assign({}, existing, node, { updatedAt: Date.now() });
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
        return Object.keys(_nodes).map(function(k) { return _nodes[k]; });
    }

    function getNodesByType(type) {
        var ids = _indexes.byType[type] || [];
        return ids.map(function(id) { return _nodes[id]; }).filter(function(n) { return n; });
    }

    function getActiveNodes() {
        return getAllNodes().filter(function(n) {
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
            if (pos !== -1) idx.splice(pos, 1);
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
            provenance: relation.provenance || null,
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
        var nodes = getAllNodes();
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
            if (!_nodes[rel.from]) errors.push('Missing source node: ' + rel.from);
            if (!_nodes[rel.to]) errors.push('Missing target node: ' + rel.to);
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
            nodes: getAllNodes(),
            relations: Object.keys(_relations).map(function(k) { return _relations[k]; })
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
            _indexes = { byNode: {}, byType: {}, byRelationType: {} };

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
            var stored = LawAIApp.StorageEngine && LawAIApp.StorageEngine.get
                ? LawAIApp.StorageEngine.get(_storageKey)
                : null;
            if (stored) {
                _nodes = stored.nodes || {};
                _relations = stored.relations || {};
                _rebuildIndexes();
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
            if (LawAIApp.StorageEngine && LawAIApp.StorageEngine.set) {
                LawAIApp.StorageEngine.set(_storageKey, data);
            }
        } catch (e) {
            console.warn('[KnowledgeGraph] Save failed:', e);
        }
    }

    function _rebuildIndexes() {
        _indexes = { byNode: {}, byType: {}, byRelationType: {} };

        for (var nodeId in _nodes) {
            var node = _nodes[nodeId];
            if (!_indexes.byType[node.type]) {
                _indexes.byType[node.type] = [];
            }
            _indexes.byType[node.type].push(nodeId);
        }

        for (var relId in _relations) {
            var rel = _relations[relId];
            if (!_indexes.byNode[rel.from]) _indexes.byNode[rel.from] = [];
            _indexes.byNode[rel.from].push(relId);
            if (!_indexes.byNode[rel.to]) _indexes.byNode[rel.to] = [];
            _indexes.byNode[rel.to].push(relId);
            if (!_indexes.byRelationType[rel.type]) _indexes.byRelationType[rel.type] = [];
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

        console.log('[KnowledgeGraph] 🚀 Initializing v2.0.1...');

        try {
            _load();
            _initialized = true;
            console.log('[KnowledgeGraph] ✅ Initialized, nodes:', Object.keys(_nodes).length, 'relations:', Object.keys(_relations).length);
        } catch (e) {
            console.error('[KnowledgeGraph] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    function reset() {
        _nodes = {};
        _relations = {};
        _indexes = { byNode: {}, byType: {}, byRelationType: {} };
        try {
            if (LawAIApp.StorageEngine && LawAIApp.StorageEngine.set) {
                LawAIApp.StorageEngine.set(_storageKey, {
                    _schemaVersion: _schemaVersion,
                    nodes: {},
                    relations: {}
                });
            }
        } catch (e) {}
        console.log('[KnowledgeGraph] Reset complete');
    }

    function getUnmetPrerequisites(nodeId, learnerModel) {
        var prereqs = getPrerequisites(nodeId);
        if (!learnerModel || !Array.isArray(prereqs) || prereqs.length === 0) {
            return prereqs || [];
        }

        var unmet = [];
        for (var i = 0; i < prereqs.length; i++) {
            var prereq = prereqs[i];
            var knowledgeState = learnerModel.getKnowledgeState
                ? learnerModel.getKnowledgeState(prereq.id)
                : null;

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
    // PUBLIC API
    // ============================================================
    var KnowledgeGraph = {
        _upgraded: true,
        _version: '2.0.1',

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

        getStatus: function() {
            var validation = validateGraph();
            return {
                version: '2.0.1',
                initialized: _initialized,
                schemaVersion: _schemaVersion,
                nodeCount: Object.keys(_nodes).length,
                relationCount: Object.keys(_relations).length,
                relationTypes: Object.keys(_indexes.byRelationType),
                nodeTypes: Object.keys(_indexes.byType),
                valid: validation.valid,
                errors: validation.errors,
                warnings: validation.warnings,
                orphanCount: validation.orphanCount
            };
        },

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
                source: (node.metadata && node.metadata.source) || { type: node.type, id: node.id },
                provenance: (node.metadata && node.metadata.provenance) || { createdAt: node.createdAt, updatedAt: node.updatedAt }
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
            var tags = (node.metadata && node.metadata.tags) || [];
            var rels = this.getRelations(entityId);
            var self = this;
            rels.forEach(function(rel) {
                var target = self.getNode(rel.to);
                if (target && target.metadata && target.metadata.tags) {
                    target.metadata.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) tags.push(tag);
                    });
                }
            });
            return tags;
        },

        // ============================================================
        // PART 119: 真实数据导入
        // ============================================================
        ingestFromAcademy: function(options) {
            options = options || {};
            var report = this._createIngestionReport('academy');
            var self = this;

            try {
                var schools = this._getAllSchools();
                report.sourceCounts.schools = schools.length;
                schools.forEach(function(school) {
                    // 🔥 先拿 courses
                    var courses = self._getCoursesBySchool(school.id);
                    
                    // 🔥 没有 courses → 跳过 school 节点（避免孤儿）
                    if (!courses || courses.length === 0) {
                        console.log('[KnowledgeGraph] Skipping school (no courses):', school.id);
                        return;
                    }
                
                    // 有 courses → 创建 school 节点
                    self._upsertEntity({
                        id: 'school:' + school.id,
                        type: self.NODE_TYPES.KNOWLEDGE,   // 🔥 改成 KNOWLEDGE（不要用 COURSE）
                        label: school.title || school.name || school.id,
                        sourceType: 'school',
                        sourceId: school.id,
                        provenance: { sourceSystem: 'academy', sourceType: 'school', sourceId: school.id }
                    });
                    report.entitiesCreated++;
                    report.sourceCounts.courses += courses.length;

                    courses.forEach(function(course) {
                        self._upsertEntity({
                            id: 'course:' + course.id,
                            type: self.NODE_TYPES.COURSE,
                            label: course.title || course.name || course.id,
                            sourceType: 'course',
                            sourceId: course.id,
                            provenance: { sourceSystem: 'academy', sourceType: 'course', sourceId: course.id }
                        });
                        report.entitiesCreated++;

                        var schoolRel = self._upsertRelationship({
                            from: 'school:' + school.id,
                            to: 'course:' + course.id,
                            type: self.RELATION_TYPES.PART_OF,
                            weight: 1,
                            confidence: 1.0,
                            source: 'academy'
                        });
                        if (schoolRel) report.relationshipsCreated++;

                        var subjects = self._getSubjectsByModule(course.id);
                        report.sourceCounts.subjects += subjects.length;
                        subjects.forEach(function(subject) {
                            self._upsertEntity({
                                id: 'subject:' + subject.id,
                                type: self.NODE_TYPES.KNOWLEDGE,
                                label: subject.title || subject.name || subject.id,
                                sourceType: 'subject',
                                sourceId: subject.id,
                                provenance: { sourceSystem: 'academy', sourceType: 'subject', sourceId: subject.id }
                            });
                            report.entitiesCreated++;

                            var lessons = self._getLessonsBySubject(subject.id);
                            report.sourceCounts.lessons += lessons.length;
                            lessons.forEach(function(lesson) {
                                self._upsertEntity({
                                    id: 'lesson:' + lesson.id,
                                    type: self.NODE_TYPES.LESSON,
                                    label: lesson.title || lesson.name || lesson.id,
                                    sourceType: 'lesson',
                                    sourceId: lesson.id,
                                    provenance: { sourceSystem: 'academy', sourceType: 'lesson', sourceId: lesson.id }
                                });
                                report.entitiesCreated++;

                                var rel = self._upsertRelationship({
                                    from: 'subject:' + subject.id,
                                    to: 'lesson:' + lesson.id,
                                    type: self.RELATION_TYPES.PART_OF,
                                    weight: 1,
                                    confidence: 1.0,
                                    source: 'academy'
                                });
                                if (rel) report.relationshipsCreated++;
                            });
                        });
                    });
                });

                report.status = 'completed';
                report.completedAt = Date.now();
            } catch (e) {
                report.status = 'failed';
                report.error = e.message;
                console.error('[KnowledgeGraph] Academy ingestion failed:', e);
            }

            return report;
        },

        ingestFromNotes: function(options) {
            options = options || {};
            var report = this._createIngestionReport('notes');
            var self = this;

            try {
                var notes = (window.LawAIApp && window.LawAIApp.KnowledgeCapture && window.LawAIApp.KnowledgeCapture.getNotes)
                    ? window.LawAIApp.KnowledgeCapture.getNotes()
                    : [];
                report.sourceCounts.notes = notes.length;

                notes.forEach(function(note) {
                    self._upsertEntity({
                        id: 'note:' + note.id,
                        type: self.NODE_TYPES.KNOWLEDGE,
                        label: note.title || 'Untitled Note',
                        sourceType: 'note',
                        sourceId: note.id,
                        metadata: {
                            type: note.type,
                            tags: note.tags || [],
                            hasReflection: !!(note.reflections && note.reflections.length > 0),
                            reflectionCount: note.reflections ? note.reflections.length : 0
                        },
                        provenance: { sourceSystem: 'notes', sourceType: 'note', sourceId: note.id }
                    });
                    report.entitiesCreated++;

                    if (note.lessonId) {
                        var targetId = 'lesson:' + note.lessonId;
                        if (self.hasNode(targetId)) {
                            var rel = self._upsertRelationship({
                                from: 'note:' + note.id,
                                to: targetId,
                                type: self.RELATION_TYPES.REFERENCES,
                                weight: 1,
                                confidence: 0.9,
                                source: 'notes'
                            });
                            if (rel) report.relationshipsCreated++;
                        } else {
                            report.brokenReferences++;
                        }
                    }

                    if (note.courseId) {
                        var courseTargetId = 'course:' + note.courseId;
                        if (self.hasNode(courseTargetId)) {
                            var rel2 = self._upsertRelationship({
                                from: 'note:' + note.id,
                                to: courseTargetId,
                                type: self.RELATION_TYPES.RELATED,
                                weight: 0.7,
                                confidence: 0.7,
                                source: 'notes'
                            });
                            if (rel2) report.relationshipsCreated++;
                        }
                    }
                });

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
        _createIngestionReport: function(sourceType) {
            return {
                sourceType: sourceType,
                status: 'pending',
                startedAt: Date.now(),
                completedAt: null,
                sourceCounts: { schools: 0, courses: 0, modules: 0, subjects: 0, lessons: 0, notes: 0 },
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

        _getAllSchools: function() {
            try {
                var loader = (window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader));
                if (loader && typeof loader.getSchools === 'function') {
                    return loader.getSchools() || [];
                }
            } catch (e) {
                console.warn('[KnowledgeGraph] Failed to get schools:', e);
            }
            return [];
        },

        _getCoursesBySchool: function(schoolId) {
            try {
                var loader = (window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader));
                if (loader && typeof loader.getCoursesBySchool === 'function') {
                    return loader.getCoursesBySchool(schoolId) || [];
                }
            } catch (e) {
                console.warn('[KnowledgeGraph] Failed to get courses:', e);
            }
            return [];
        },

        _getModulesByCourse: function(courseId) {
            return [];
        },

        _getSubjectsByModule: function(courseId) {
            try {
                var loader = (window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader));
                if (loader && typeof loader.getSubjectsByCourse === 'function') {
                    return loader.getSubjectsByCourse(courseId) || [];
                }
                if (loader && typeof loader.getSubjectsByModule === 'function') {
                    return loader.getSubjectsByModule(courseId) || [];
                }
            } catch (e) {
                console.warn('[KnowledgeGraph] Failed to get subjects:', e);
            }
            return [];
        },

        _getLessonsBySubject: function(subjectId) {
            try {
                var loader = (window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader));
                if (loader && typeof loader.getLessonsBySubject === 'function') {
                    return loader.getLessonsBySubject(subjectId) || [];
                }
            } catch (e) {
                console.warn('[KnowledgeGraph] Failed to get lessons:', e);
            }
            return [];
        },

        _upsertEntity: function(entityData) {
            if (this.hasNode(entityData.id)) {
                var existing = this.getNode(entityData.id);
                existing.title = entityData.label || existing.title;
                existing.metadata = Object.assign({}, existing.metadata, entityData.metadata);
                existing.updatedAt = Date.now();
                return existing;
            }

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

        _upsertRelationship: function(relData) {
            if (this.hasRelation(relData.from, relData.to, relData.type)) {
                return null;
            }

            if (!this.hasNode(relData.from) || !this.hasNode(relData.to)) {
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

        _getLastIngestion: function(sourceType) {
            try {
                var key = 'lawai_graph_ingestion_' + sourceType;
                var stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        },

        _saveIngestionReport: function(sourceType, report) {
            try {
                var key = 'lawai_graph_ingestion_' + sourceType;
                localStorage.setItem(key, JSON.stringify(report));
            } catch (e) {}
        },

        ingestAll: function(options) {
            options = options || {};
            if (options.clearExisting) this.reset();
            var academyReport = this.ingestFromAcademy(options);
            this._saveIngestionReport('academy', academyReport);
            var notesReport = this.ingestFromNotes(options);
            this._saveIngestionReport('notes', notesReport);
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
        // PART 120: 概念层 (Concept Layer)
        // ============================================================
        registerConcept: function(conceptData) {
            if (!conceptData || !conceptData.id) {
                console.warn('[KnowledgeGraph] Concept requires id');
                return null;
            }

            if (this.hasNode(conceptData.id)) {
                var existing = this.getNode(conceptData.id);
                existing.title = conceptData.label || existing.title;
                existing.description = conceptData.definition || existing.description;
                existing.metadata = Object.assign({}, existing.metadata, {
                    aliases: conceptData.aliases || (existing.metadata && existing.metadata.aliases) || [],
                    provenance: conceptData.provenance || (existing.metadata && existing.metadata.provenance) || 'curated',
                    type: 'concept'
                });
                existing.updatedAt = Date.now();
                return existing;
            }

            return this.registerNode({
                id: conceptData.id,
                type: this.NODE_TYPES.KNOWLEDGE,
                title: conceptData.label || conceptData.id,
                description: conceptData.definition || '',
                metadata: {
                    aliases: conceptData.aliases || [],
                    provenance: conceptData.provenance || 'curated',
                    type: 'concept'
                },
                sourceType: 'concept',
                sourceId: conceptData.id
            });
        },

        getConcept: function(conceptId) {
            return this.getNode(conceptId);
        },

        // 唯一版本 getConcepts（修复重复定义）
        getConcepts: function() {
            var allNodes = this.getAllNodes();
            return allNodes.filter(function(node) {
                return (node.metadata && node.metadata.type === 'concept') ||
                       node.type === NODE_TYPES.KNOWLEDGE;
            });
        },

        getConceptsForLesson: function(lessonId) {
            var kg = this;
            var relations = this.getRelations(lessonId);
            var conceptIds = relations
                .filter(function(rel) {
                    return rel.type === RELATION_TYPES.TEACHES;
                })
                .map(function(rel) {
                    return rel.to;
                });

            return conceptIds
                .map(function(id) { return kg.getConcept(id); })
                .filter(function(c) { return c; });
        },

        getNotesForConcept: function(conceptId) {
            var relations = this.getRelations(conceptId);
            var noteIds = relations
                .filter(function(rel) {
                    return rel.type === RELATION_TYPES.REFERENCES && rel.to === conceptId;
                })
                .map(function(rel) {
                    return rel.from;
                });

            var notes = (window.LawAIApp && window.LawAIApp.KnowledgeCapture && window.LawAIApp.KnowledgeCapture.getNotes)
                ? window.LawAIApp.KnowledgeCapture.getNotes()
                : [];
            return notes.filter(function(note) {
                return noteIds.indexOf(note.id) !== -1;
            });
        },

        getLessonsForConcept: function(conceptId) {
            var relations = this.getRelations(conceptId);
            var lessonIds = relations
                .filter(function(rel) {
                    return rel.type === RELATION_TYPES.TEACHES && rel.to === conceptId;
                })
                .map(function(rel) {
                    return rel.from;
                });

            var loader = (window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader));
            if (!loader) return [];

            var lessons = [];
            lessonIds.forEach(function(id) {
                try {
                    var lesson = loader.getLessonManifest ? loader.getLessonManifest(id) : null;
                    if (lesson) lessons.push(lesson);
                } catch (e) {
                    console.warn('[KnowledgeGraph] Failed to load lesson:', id);
                }
            });
            return lessons;
        },

        getRelatedConcepts: function(conceptId, maxDepth) {
            maxDepth = maxDepth || 1;
            var kg = this;
            var result = [];
            var visited = {};

            function traverse(id, depth) {
                if (depth > maxDepth) return;
                if (visited[id]) return;
                visited[id] = true;

                var relations = kg.getRelations(id);
                relations
                    .filter(function(rel) {
                        return rel.type === RELATION_TYPES.RELATES_TO;
                    })
                    .forEach(function(rel) {
                        var targetId = rel.from === id ? rel.to : rel.from;
                        var concept = kg.getConcept(targetId);
                        if (concept) {
                            result.push(concept);
                            traverse(targetId, depth + 1);
                        }
                    });
            }

            traverse(conceptId, 0);
            return result;
        },

        // ============================================================
        // PART 121: 查询与发现层
        // ============================================================
        getOutgoingRelationships: function(entityId) {
            var allRels = this.getRelations(entityId);
            return allRels.filter(function(rel) {
                return rel.from === entityId;
            });
        },

        getIncomingRelationships: function(entityId) {
            var allRels = this.getRelations(entityId);
            return allRels.filter(function(rel) {
                return rel.to === entityId;
            });
        },

        getNeighbors: function(entityId, options) {
            if (!this._validateEntityId(entityId)) {
                return this._createErrorResponse('INVALID_ENTITY_ID', 'Invalid entity ID: ' + entityId);
            }

            options = options || { direction: 'both' };
            if (!this._validateDirection(options.direction)) {
                return this._createErrorResponse('INVALID_DIRECTION', 'Invalid direction: ' + options.direction);
            }

            var kg = this;
            var rels = this.getRelations(entityId);

            if (options.direction === 'outgoing') {
                rels = rels.filter(function(r) { return r.from === entityId; });
            } else if (options.direction === 'incoming') {
                rels = rels.filter(function(r) { return r.to === entityId; });
            }

            var neighbors = [];
            rels.forEach(function(rel) {
                var neighborId = rel.from === entityId ? rel.to : rel.from;
                var entity = kg.getNode(neighborId);
                if (entity) {
                    neighbors.push({
                        entity: entity,
                        relationship: rel,
                        direction: rel.from === entityId ? 'outgoing' : 'incoming'
                    });
                }
            });

            return this._createSuccessResponse(neighbors, {
                queryType: 'NEIGHBOR',
                entityId: entityId,
                direction: options.direction,
                count: neighbors.length
            });
        },

        getNeighborsByRelation: function(entityId, relationType, options) {
            options = options || { direction: 'both' };
            var kg = this;
            var rels = this.getRelations(entityId);

            rels = rels.filter(function(r) { return r.type === relationType; });

            if (options.direction === 'outgoing') {
                rels = rels.filter(function(r) { return r.from === entityId; });
            } else if (options.direction === 'incoming') {
                rels = rels.filter(function(r) { return r.to === entityId; });
            }

            var neighbors = [];
            rels.forEach(function(rel) {
                var neighborId = rel.from === entityId ? rel.to : rel.from;
                var entity = kg.getNode(neighborId);
                if (entity) {
                    neighbors.push({
                        entity: entity,
                        relationship: rel,
                        direction: rel.from === entityId ? 'outgoing' : 'incoming'
                    });
                }
            });

            return neighbors;
        },

        traverse: function(startId, options) {
            if (!this._validateEntityId(startId)) {
                return this._createErrorResponse('INVALID_ENTITY_ID', 'Invalid start entity ID: ' + startId);
            }
            options = options || {};
            var maxDepth = options.maxDepth !== undefined ? options.maxDepth : 2;
            var direction = options.direction || 'outgoing';
            var maxResults = options.maxResults || 100;

            if (!this._validateDepth(maxDepth)) {
                return this._createErrorResponse('INVALID_DEPTH', 'Invalid maxDepth: ' + maxDepth);
            }
            if (!this._validateDirection(direction)) {
                return this._createErrorResponse('INVALID_DIRECTION', 'Invalid direction: ' + direction);
            }
            if (!this._validateMaxResults(maxResults)) {
                return this._createErrorResponse('INVALID_MAX_RESULTS', 'Invalid maxResults: ' + maxResults);
            }

            if (options.relationTypes && options.relationTypes.length > 0) {
                for (var i = 0; i < options.relationTypes.length; i++) {
                    if (!this._validateRelationType(options.relationTypes[i])) {
                        return this._createErrorResponse('INVALID_RELATION_TYPE', 'Invalid relation type: ' + options.relationTypes[i]);
                    }
                }
            }

            if (options.entityTypes && options.entityTypes.length > 0) {
                for (var j = 0; j < options.entityTypes.length; j++) {
                    if (!this._validateEntityType(options.entityTypes[j])) {
                        return this._createErrorResponse('INVALID_ENTITY_TYPE', 'Invalid entity type: ' + options.entityTypes[j]);
                    }
                }
            }

            if (!this.hasNode(startId)) {
                return this._createErrorResponse('ENTITY_NOT_FOUND', 'Entity not found: ' + startId);
            }

            var relationTypes = options.relationTypes || [];
            var entityTypes = options.entityTypes || [];
            var includeStart = options.includeStart !== undefined ? options.includeStart : false;
            var includeRelationships = options.includeRelationships !== undefined ? options.includeRelationships : true;
            var includeProvenance = options.includeProvenance !== undefined ? options.includeProvenance : true;

            var visited = {};
            var results = [];
            var queue = [];

            var startNode = this.getNode(startId);

            if (includeStart) {
                results.push({ entity: startNode, depth: 0, path: [startId] });
                visited[startId] = true;
            }

            queue.push({ id: startId, depth: 0, path: [startId] });
            visited[startId] = true;

            while (queue.length > 0 && results.length < maxResults) {
                var current = queue.shift();
                var currentId = current.id;
                var currentDepth = current.depth;
                var currentPath = current.path;

                if (currentDepth >= maxDepth) continue;

                var neighbors = this.getNeighbors(currentId, { direction: direction });
                var neighborList = neighbors.results || [];

                for (var k = 0; k < neighborList.length; k++) {
                    if (results.length >= maxResults) break;

                    var neighbor = neighborList[k];
                    var neighborId = neighbor.entity.id;

                    if (visited[neighborId]) continue;

                    if (entityTypes.length > 0) {
                        var matchedType = false;
                        for (var m = 0; m < entityTypes.length; m++) {
                            if (neighbor.entity.type === entityTypes[m]) {
                                matchedType = true;
                                break;
                            }
                        }
                        if (!matchedType) continue;
                    }

                    if (relationTypes.length > 0) {
                        var matchedRel = false;
                        for (var n = 0; n < relationTypes.length; n++) {
                            if (neighbor.relationship.type === relationTypes[n]) {
                                matchedRel = true;
                                break;
                            }
                        }
                        if (!matchedRel) continue;
                    }

                    visited[neighborId] = true;
                    var newPath = currentPath.concat([neighborId]);

                    var resultItem = {
                        entity: neighbor.entity,
                        depth: currentDepth + 1,
                        path: newPath
                    };

                    if (includeRelationships) {
                        resultItem.relationship = neighbor.relationship;
                        resultItem.direction = neighbor.direction;
                    }

                    if (includeProvenance && neighbor.relationship.provenance) {
                        resultItem.provenance = neighbor.relationship.provenance;
                    }

                    results.push(resultItem);
                    queue.push({ id: neighborId, depth: currentDepth + 1, path: newPath });
                }
            }

            var truncated = results.length >= maxResults || queue.length > 0;

            return {
                success: true,
                results: results,
                count: results.length,
                truncated: truncated,
                metadata: {
                    queryType: 'traverse',
                    startId: startId,
                    maxDepth: maxDepth,
                    direction: direction,
                    visitedCount: Object.keys(visited).length,
                    maxResults: maxResults
                }
            };
        },

        findPath: function(sourceId, targetId, options) {
            options = options || {};
            var maxDepth = options.maxDepth || 3;
            var direction = options.direction || 'outgoing';
            var kg = this;

            if (!this.hasNode(sourceId)) {
                return { success: false, error: 'Source not found: ' + sourceId, path: null };
            }
            if (!this.hasNode(targetId)) {
                return { success: false, error: 'Target not found: ' + targetId, path: null };
            }

            if (sourceId === targetId) {
                return { success: true, path: [sourceId], depth: 0 };
            }

            var visited = {};
            var queue = [{ id: sourceId, path: [sourceId] }];
            visited[sourceId] = true;

            while (queue.length > 0) {
                var current = queue.shift();
                var currentId = current.id;
                var currentPath = current.path;

                if (currentPath.length > maxDepth) continue;

                var neighbors = this.getNeighbors(currentId, { direction: direction });
                var neighborList = neighbors.results || [];

                for (var i = 0; i < neighborList.length; i++) {
                    var neighbor = neighborList[i];
                    var neighborId = neighbor.entity.id;

                    if (visited[neighborId]) continue;

                    var newPath = currentPath.concat([neighborId]);

                    if (neighborId === targetId) {
                        var pathDetails = [];
                        for (var j = 0; j < newPath.length - 1; j++) {
                            var fromId = newPath[j];
                            var toId = newPath[j + 1];
                            var rels = kg.getRelations(fromId);
                            var foundRel = null;
                            for (var k = 0; k < rels.length; k++) {
                                if (rels[k].from === fromId && rels[k].to === toId) {
                                    foundRel = rels[k];
                                    break;
                                }
                            }
                            pathDetails.push({ from: fromId, to: toId, relationship: foundRel });
                        }

                        return {
                            success: true,
                            path: newPath,
                            depth: newPath.length - 1,
                            details: pathDetails,
                            sourceId: sourceId,
                            targetId: targetId
                        };
                    }

                    visited[neighborId] = true;
                    queue.push({ id: neighborId, path: newPath });
                }
            }

            return {
                success: false,
                error: 'No path found within depth ' + maxDepth,
                path: null
            };
        },

        isConnected: function(sourceId, targetId, options) {
            var result = this.findPath(sourceId, targetId, options);
            return {
                connected: result.success,
                path: result.path,
                depth: result.depth || 0,
                error: result.error || null
            };
        },

        getEntitiesByLabel: function(label) {
            if (!label) return [];
            var allNodes = this.getAllNodes();
            var q = label.toLowerCase();
            return allNodes.filter(function(node) {
                return node.title && node.title.toLowerCase() === q;
            });
        },

        searchEntitiesByLabel: function(label) {
            if (!label) return [];
            var allNodes = this.getAllNodes();
            var q = label.toLowerCase();
            return allNodes.filter(function(node) {
                return node.title && node.title.toLowerCase().indexOf(q) !== -1;
            });
        },

        inspectProvenance: function(entityId) {
            var node = this.getNode(entityId);
            if (!node) return null;

            var result = {
                entity: { id: node.id, type: node.type, label: node.title },
                provenance: node.provenance || (node.metadata && node.metadata.provenance) || null,
                source: { sourceType: node.sourceType || null, sourceId: node.sourceId || null },
                relationships: []
            };

            var rels = this.getRelations(entityId);
            rels.forEach(function(rel) {
                result.relationships.push({
                    id: rel.id,
                    type: rel.type,
                    direction: rel.from === entityId ? 'outgoing' : 'incoming',
                    target: rel.from === entityId ? rel.to : rel.from,
                    provenance: rel.provenance || null,
                    confidence: rel.confidence || null
                });
            });

            return result;
        },

        // ============================================================
        // PART 122: 输入验证工具
        // ============================================================
        _validateEntityId: function(entityId) {
            if (!entityId || typeof entityId !== 'string') return false;
            if (entityId.trim() === '') return false;
            return true;
        },

        _validateDirection: function(direction) {
            var valid = ['outgoing', 'incoming', 'both'];
            return valid.indexOf(direction) !== -1;
        },

        _validateDepth: function(depth) {
            if (depth === undefined || depth === null) return true;
            if (typeof depth !== 'number') return false;
            if (depth < 0 || depth > 5) return false;
            return true;
        },

        _validateMaxResults: function(maxResults) {
            if (maxResults === undefined || maxResults === null) return true;
            if (typeof maxResults !== 'number') return false;
            if (maxResults < 1 || maxResults > 500) return false;
            return true;
        },

        _validateRelationType: function(relationType) {
            if (!relationType) return false;
            var validTypes = ['TEACHES', 'REFERENCES', 'CONTAINS', 'RELATES_TO', 'DERIVED_FROM', 'REFLECTS_ON'];
            return validTypes.indexOf(relationType) !== -1;
        },

        _validateEntityType: function(entityType) {
            if (!entityType) return false;
            var validTypes = ['school', 'course', 'module', 'subject', 'lesson', 'note', 'concept'];
            return validTypes.indexOf(entityType) !== -1;
        },

        _createErrorResponse: function(errorCode, message, metadata) {
            return {
                success: false,
                error: { code: errorCode, message: message || 'An error occurred', metadata: metadata || {} },
                results: [],
                count: 0,
                truncated: false
            };
        },

        _createSuccessResponse: function(results, metadata) {
            return {
                success: true,
                results: results || [],
                count: (results || []).length,
                truncated: (metadata && metadata.truncated) || false,
                metadata: metadata || {}
            };
        },

        // ============================================================
        // PART 123: 别名发现
        // ============================================================
        getEntityByAlias: function(alias, entityType) {
            if (!alias) return [];
            var allNodes = this.getAllNodes();
            var q = alias.toLowerCase().trim();
            var results = [];

            allNodes.forEach(function(node) {
                var aliases = (node.metadata && node.metadata.aliases) || [];
                if (Array.isArray(aliases)) {
                    var matched = aliases.some(function(a) {
                        return a.toLowerCase().trim() === q;
                    });
                    if (matched) results.push(node);
                }
            });

            if (entityType) {
                results = results.filter(function(node) {
                    return node.type === entityType || (node.metadata && node.metadata.type === entityType);
                });
            }

            return results;
        },

        discover: function(query, options) {
            options = options || {};
            var kg = this;

            if (!query || typeof query !== 'string' || query.trim() === '') {
                return this._createErrorResponse('INVALID_QUERY', 'Query cannot be empty');
            }

            var trimmedQuery = query.trim();
            var entityType = options.entityType || null;
            var relationType = options.relationType || null;
            var conceptId = options.conceptId || null;
            var includeContext = options.includeContext || false;
            var maxDepth = options.maxDepth || 1;
            var maxResults = options.maxResults || 50;

            if (!this._validateDepth(maxDepth)) {
                return this._createErrorResponse('INVALID_DEPTH', 'Invalid maxDepth: ' + maxDepth);
            }
            if (!this._validateMaxResults(maxResults)) {
                return this._createErrorResponse('INVALID_MAX_RESULTS', 'Invalid maxResults: ' + maxResults);
            }
            if (entityType && !this._validateEntityType(entityType)) {
                return this._createErrorResponse('INVALID_ENTITY_TYPE', 'Invalid entity type: ' + entityType);
            }
            if (relationType && !this._validateRelationType(relationType)) {
                return this._createErrorResponse('INVALID_RELATION_TYPE', 'Invalid relation type: ' + relationType);
            }

            var results = [];
            var matchTypes = [];

            if (this.hasNode(trimmedQuery)) {
                var node = this.getNode(trimmedQuery);
                if (!entityType || node.type === entityType || (node.metadata && node.metadata.type === entityType)) {
                    results.push({ entity: node, matchType: 'ID' });
                    matchTypes.push('ID');
                }
            }

            if (results.length === 0) {
                var labelMatches = this.getEntitiesByLabel(trimmedQuery);
                if (entityType) {
                    labelMatches = labelMatches.filter(function(n) {
                        return n.type === entityType || (n.metadata && n.metadata.type === entityType);
                    });
                }
                labelMatches.forEach(function(node) {
                    results.push({ entity: node, matchType: 'LABEL' });
                });
                if (labelMatches.length > 0) matchTypes.push('LABEL');
            }

            if (results.length === 0) {
                var aliasMatches = this.getEntityByAlias(trimmedQuery, entityType);
                aliasMatches.forEach(function(node) {
                    results.push({ entity: node, matchType: 'ALIAS' });
                });
                if (aliasMatches.length > 0) matchTypes.push('ALIAS');
            }

            if (relationType && results.length > 0) {
                var filteredByRel = [];
                results.forEach(function(result) {
                    var entityId = result.entity.id;
                    var rels = kg.getRelations(entityId);
                    var hasRelation = rels.some(function(rel) { return rel.type === relationType; });
                    if (hasRelation) filteredByRel.push(result);
                });
                results = filteredByRel;
            }

            if (conceptId && results.length > 0) {
                var filteredByConcept = [];
                results.forEach(function(result) {
                    var entityId = result.entity.id;
                    var rels = kg.getRelations(entityId);
                    var hasConcept = rels.some(function(rel) {
                        return rel.to === conceptId || rel.from === conceptId;
                    });
                    if (hasConcept) filteredByConcept.push(result);
                });
                results = filteredByConcept;
            }

            var truncated = results.length > maxResults;
            if (truncated) results = results.slice(0, maxResults);

            var contextResults = results;
            if (includeContext && results.length > 0) {
                contextResults = [];
                results.forEach(function(result) {
                    var entityId = result.entity.id;
                    var neighbors = kg.getNeighbors(entityId, { direction: 'both' });
                    var neighborList = neighbors.results || [];
                    var context = neighborList.slice(0, 20).map(function(n) {
                        return { entity: n.entity, relationship: n.relationship, direction: n.direction };
                    });
                    contextResults.push({
                        entity: result.entity,
                        matchType: result.matchType,
                        context: context
                    });
                });
            }

            return this._createSuccessResponse(contextResults, {
                queryType: 'DISCOVERY',
                query: trimmedQuery,
                entityType: entityType,
                relationType: relationType,
                conceptId: conceptId,
                matchTypes: matchTypes,
                maxResults: maxResults,
                truncated: truncated,
                includeContext: includeContext,
                maxDepth: maxDepth
            });
        },

        discoverConcept: function(query, options) {
            options = options || {};
            options.entityType = 'concept';
            return this.discover(query, options);
        },

        discoverLesson: function(query, options) {
            options = options || {};
            options.entityType = 'lesson';
            return this.discover(query, options);
        },

        discoverNote: function(query, options) {
            options = options || {};
            options.entityType = 'note';
            return this.discover(query, options);
        }
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

    console.log('[KnowledgeGraph] ✅ Module loaded (v2.0.1)');

})();
