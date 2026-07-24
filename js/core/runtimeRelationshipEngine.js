// ================================================================
// runtimeRelationshipEngine.js — Part 47.3
// Runtime Relationship Engine
// Version: v4.7.3
// Status: Architecture Implementation
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Create, Update, Validate, Remove relationships between Runtime Entities.
//   Core capability of Knowledge Graph.
//
// ARCHITECTURE POSITION
//   Entity Registry → Relationship Engine → Knowledge Graph → AI Reasoning
//
// RELATIONSHIP TYPES
//   depends_on, affects, causes, contains, belongs_to,
//   references, communicates_with, generates
//
// RELATIONSHIP MODEL
//   { relationshipId, sourceEntity, targetEntity, type, confidence, metadata }
//
// LIFECYCLE
//   Created → Validated → Active → Updated → Archived
//
// RULES
//   Rule 1: Source Entity 必须存在
//   Rule 2: Target Entity 必须存在
//   Rule 3: Relationship Type 必须合法
//   Rule 4: 禁止 Duplicate Relationship
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeRelationshipEngine = {
    _version: '4.7.3',
    _ready: false,
    _relationships: {},
    _relationshipCount: 0,
    _lifecycleLog: [],
    _validTypes: ['depends_on', 'affects', 'causes', 'contains', 'belongs_to', 'references', 'communicates_with', 'generates'],

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        this._initBuiltinRelationships();
        console.log('🧠 Runtime Relationship Engine v' + this._version + ' ready');
        console.log('   🔗 Relationships: ' + this.getRelationshipCount());
        console.log('   📂 Types: ' + this._validTypes.join(', '));
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 25: RELATIONSHIP CREATION
    // ============================================================

    /**
     * create(sourceEntity, targetEntity, type, confidence, metadata)
     * Creates a new relationship between two entities.
     * Rules 1-4 enforced during creation.
     * @returns {Object|null} relationship object
     */
    create: function(sourceEntity, targetEntity, type, confidence, metadata) {
        // Rule 1 & 2: validate entities exist
        var registry = this._getRegistry();
        if (registry) {
            var sourceValid = registry.validate(sourceEntity);
            var targetValid = registry.validate(targetEntity);
            if (!sourceValid.valid) {
                console.warn('[RelationshipEngine] Source entity validation failed: ' + sourceValid.error);
                return null;
            }
            if (!targetValid.valid) {
                console.warn('[RelationshipEngine] Target entity validation failed: ' + targetValid.error);
                return null;
            }
        }

        // Rule 3: validate type
        if (!type || this._validTypes.indexOf(type) === -1) {
            console.warn('[RelationshipEngine] Invalid relationship type: ' + type);
            return null;
        }

        // Rule 4: check duplicate
        var dupKey = this._makeKey(sourceEntity, targetEntity, type);
        if (this._relationships[dupKey]) {
            var existing = this._relationships[dupKey];
            if (existing.status === 'active') {
                console.warn('[RelationshipEngine] Duplicate relationship: ' + sourceEntity + ' → ' + targetEntity + ' (' + type + ')');
                // Update instead
                return this.update(existing.relationshipId, { confidence: confidence, metadata: metadata });
            }
        }

        confidence = Math.max(0, Math.min(1, confidence || 0.5));

        var rel = {
            relationshipId: 'rel_' + (++this._relationshipCount) + '_' + Date.now(),
            sourceEntity: sourceEntity,
            targetEntity: targetEntity,
            type: type,
            confidence: confidence,
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            status: 'created',
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this._relationships[dupKey] = rel;
        this._logLifecycle(rel.relationshipId, 'created');

        // Auto-validate
        this.validate(rel.relationshipId);

        // Sync to Knowledge Graph
        this._syncToKG(rel);

        return rel;
    },

    /**
     * validate(relationshipId)
     * Moves relationship from 'created' to 'active' if all checks pass.
     */
    validate: function(relationshipId) {
        var rel = this._findById(relationshipId);
        if (!rel) return false;
        if (rel.status === 'active') return true;

        // Re-check entities
        var registry = this._getRegistry();
        if (registry) {
            if (!registry.exists(rel.sourceEntity) || !registry.exists(rel.targetEntity)) {
                rel.status = 'invalid';
                this._logLifecycle(relationshipId, 'invalidated');
                return false;
            }
        }

        rel.status = 'active';
        rel.updatedAt = new Date().toISOString();
        this._logLifecycle(relationshipId, 'validated');
        this._logLifecycle(relationshipId, 'activated');
        return true;
    },

    /**
     * update(relationshipId, updates)
     * Updates confidence or metadata of an existing relationship.
     */
    update: function(relationshipId, updates) {
        var rel = this._findById(relationshipId);
        if (!rel) {
            console.warn('[RelationshipEngine] Relationship not found: ' + relationshipId);
            return null;
        }

        if (updates.confidence !== undefined) {
            rel.confidence = Math.max(0, Math.min(1, updates.confidence));
            rel.confidenceLevel = rel.confidence >= 0.8 ? 'high' : rel.confidence >= 0.5 ? 'medium' : 'low';
        }

        if (updates.metadata) {
            for (var key in updates.metadata) {
                if (updates.metadata.hasOwnProperty(key)) {
                    rel.metadata[key] = updates.metadata[key];
                }
            }
        }

        rel.status = 'updated';
        rel.updatedAt = new Date().toISOString();
        this._logLifecycle(relationshipId, 'updated');

        // Re-sync to KG
        this._syncToKG(rel);

        return rel;
    },

    /**
     * archive(relationshipId)
     * Soft-deletes a relationship.
     */
    archive: function(relationshipId) {
        var rel = this._findById(relationshipId);
        if (!rel) return false;

        rel.status = 'archived';
        rel.archivedAt = new Date().toISOString();
        rel.updatedAt = new Date().toISOString();
        this._logLifecycle(relationshipId, 'archived');
        return true;
    },

    // ============================================================
    // QUERY
    // ============================================================

    /**
     * get(relationshipId)
     */
    get: function(relationshipId) {
        return this._findById(relationshipId);
    },

    /**
     * getBySource(sourceEntity)
     * Returns all relationships where entity is the source.
     */
    getBySource: function(sourceEntity) {
        var result = [];
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key)) {
                var rel = this._relationships[key];
                if (rel.sourceEntity === sourceEntity && rel.status !== 'archived') {
                    result.push(rel);
                }
            }
        }
        return result;
    },

    /**
     * getByTarget(targetEntity)
     * Returns all relationships where entity is the target.
     */
    getByTarget: function(targetEntity) {
        var result = [];
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key)) {
                var rel = this._relationships[key];
                if (rel.targetEntity === targetEntity && rel.status !== 'archived') {
                    result.push(rel);
                }
            }
        }
        return result;
    },

    /**
     * getByType(type)
     */
    getByType: function(type) {
        var result = [];
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key)) {
                var rel = this._relationships[key];
                if (rel.type === type && rel.status !== 'archived') {
                    result.push(rel);
                }
            }
        }
        return result;
    },

    /**
     * getBetween(source, target)
     * Returns all relationships between two entities.
     */
    getBetween: function(source, target) {
        var result = [];
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key)) {
                var rel = this._relationships[key];
                if (rel.sourceEntity === source && rel.targetEntity === target && rel.status !== 'archived') {
                    result.push(rel);
                }
            }
        }
        return result;
    },

    /**
     * getAll(filterStatus)
     */
    getAll: function(filterStatus) {
        var result = [];
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key)) {
                var rel = this._relationships[key];
                if (!filterStatus || rel.status === filterStatus) {
                    result.push(rel);
                }
            }
        }
        return result;
    },

    /**
     * getActive()
     */
    getActive: function() {
        return this.getAll('active');
    },

    getRelationshipCount: function() {
        var count = 0;
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key) && this._relationships[key].status !== 'archived') {
                count++;
            }
        }
        return count;
    },

    // ============================================================
    // IMPACT & DEPENDENCY ANALYSIS
    // ============================================================

    /**
     * getImpactGraph(entityId, depth)
     * What does this entity impact? (outgoing edges, depth traversal)
     */
    getImpactGraph: function(entityId, depth) {
        depth = depth || 2;
        var visited = {};
        var graph = { nodes: [], edges: [] };

        function traverse(currentId, level) {
            if (level > depth || visited[currentId]) return;
            visited[currentId] = true;
            graph.nodes.push(currentId);

            var outgoing = this.getBySource(currentId);
            for (var i = 0; i < outgoing.length; i++) {
                var rel = outgoing[i];
                graph.edges.push({
                    source: rel.sourceEntity,
                    target: rel.targetEntity,
                    type: rel.type,
                    confidence: rel.confidence
                });
                traverse.call(this, rel.targetEntity, level + 1);
            }
        }

        traverse.call(this, entityId, 1);
        return graph;
    },

    /**
     * getDependencyGraph(entityId, depth)
     * What does this entity depend on? (incoming edges, depth traversal)
     */
    getDependencyGraph: function(entityId, depth) {
        depth = depth || 2;
        var visited = {};
        var graph = { nodes: [], edges: [] };

        function traverse(currentId, level) {
            if (level > depth || visited[currentId]) return;
            visited[currentId] = true;
            graph.nodes.push(currentId);

            var incoming = this.getByTarget(currentId);
            for (var i = 0; i < incoming.length; i++) {
                var rel = incoming[i];
                graph.edges.push({
                    source: rel.sourceEntity,
                    target: rel.targetEntity,
                    type: rel.type,
                    confidence: rel.confidence
                });
                traverse.call(this, rel.sourceEntity, level + 1);
            }
        }

        traverse.call(this, entityId, 1);
        return graph;
    },

    // ============================================================
    // KNOWLEDGE GRAPH SYNC
    // ============================================================

    _syncToKG: function(rel) {
        try {
            var kg = LawAIApp.RuntimeKnowledgeGraph;
            if (kg && typeof kg.addEdge === 'function') {
                kg.addEdge(rel.sourceEntity, rel.targetEntity, rel.type, rel.confidence, {
                    relationshipId: rel.relationshipId,
                    source: 'RelationshipEngine',
                    metadata: rel.metadata
                });
            }
        } catch (e) { /* ignore */ }
    },

    // ============================================================
    // LIFECYCLE
    // ============================================================

    _logLifecycle: function(relationshipId, event) {
        this._lifecycleLog.push({
            relationshipId: relationshipId,
            event: event,
            timestamp: new Date().toISOString()
        });
        if (this._lifecycleLog.length > 500) {
            this._lifecycleLog.shift();
        }
    },

    getLifecycle: function(relationshipId, limit) {
        limit = limit || 20;
        return this._lifecycleLog.filter(function(e) {
            return e.relationshipId === relationshipId;
        }).slice(-limit);
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getRegistry: function() {
        return LawAIApp.RuntimeEntityRegistry || null;
    },

    _makeKey: function(source, target, type) {
        return source + '::' + type + '::' + target;
    },

    _findById: function(relationshipId) {
        for (var key in this._relationships) {
            if (this._relationships.hasOwnProperty(key) && this._relationships[key].relationshipId === relationshipId) {
                return this._relationships[key];
            }
        }
        return null;
    },

    // ============================================================
    // BUILT-IN RELATIONSHIPS
    // ============================================================

    _initBuiltinRelationships: function() {
        var R = this.create.bind(this);

        // Boot chain
        R('BootManager', 'BootPipeline', 'depends_on', 0.95, { description: 'BootManager delegates to BootPipeline' });
        R('BootManager', 'StateSyncEngine', 'depends_on', 0.85, { description: 'BootManager updates runtime state' });
        R('BootManager', 'Performance', 'depends_on', 0.8, { description: 'BootManager triggers performance tracking' });
        R('BootManager', 'RuntimeEventCollector', 'generates', 0.85, { description: 'BootManager emits boot events' });

        // Event chain
        R('RuntimeEventCollector', 'RuntimeEventStore', 'depends_on', 0.9, { description: 'Events stored for analysis' });
        R('RuntimeEventAnalyzer', 'RuntimeEventStore', 'depends_on', 0.85, { description: 'Analyzer reads from store' });
        R('RuntimeEventIntelligence', 'RuntimeEventAnalyzer', 'depends_on', 0.85, { description: 'Intelligence uses analysis results' });
        R('RuntimeEventCollector', 'StateSyncEngine', 'triggers', 0.8, { description: 'Events trigger state updates' });

        // Metrics chain
        R('RuntimeMetricsCollector', 'Performance', 'generates', 0.85, { description: 'Metrics feed performance data' });
        R('Performance', 'RuntimePerformanceAnalyzer', 'depends_on', 0.85, { description: 'Analyzer reads performance data' });

        // AI chain
        R('AIContextEngine', 'BootManager', 'depends_on', 0.9, { description: 'Context reads runtime status' });
        R('AIContextEngine', 'StateSyncEngine', 'depends_on', 0.85, { description: 'Context reads state data' });
        R('AIContextEngine', 'Performance', 'depends_on', 0.8, { description: 'Context reads performance data' });
        R('AIRuntimeKnowledge', 'AIContextEngine', 'depends_on', 0.9, { description: 'Knowledge consumes context' });
        R('AIReasoningEngine', 'AIRuntimeKnowledge', 'depends_on', 0.9, { description: 'Reasoning uses knowledge units' });
        R('AIRecommendationEngine', 'AIReasoningEngine', 'depends_on', 0.9, { description: 'Recommendations from reasoning' });
        R('AIRuntimeInteraction', 'AIContextEngine', 'depends_on', 0.85, { description: 'Interaction reads context' });
        R('AIRuntimeInteraction', 'AIReasoningEngine', 'depends_on', 0.85, { description: 'Interaction uses reasoning' });
        R('AIRuntimeInteraction', 'AIRecommendationEngine', 'depends_on', 0.8, { description: 'Interaction shows recommendations' });

        // Business engine relationships
        R('LessonEngine', 'MemoryEngine', 'depends_on', 0.75, { description: 'Lessons use spaced repetition' });
        R('MemoryEngine', 'ProgressEngine', 'affects', 0.7, { description: 'Memory strength affects progress' });
        R('AIMentorEngine', 'LessonEngine', 'depends_on', 0.75, { description: 'AI mentor references lessons' });
        R('AIMentorEngine', 'ProgressEngine', 'depends_on', 0.7, { description: 'AI mentor checks progress' });

        // State relationships
        R('StateSyncEngine', 'StateRegistry', 'depends_on', 0.9, { description: 'Sync engine reads registry' });
        R('StateConflictResolver', 'StateSyncEngine', 'depends_on', 0.85, { description: 'Conflict resolver monitors sync' });
        R('StatePersistence', 'StateSyncEngine', 'depends_on', 0.8, { description: 'Persistence snapshots sync state' });

        // Observation chain
        R('RuntimeObservationCollector', 'RuntimeMetricsCollector', 'generates', 0.75, { description: 'Observations generate metrics' });
        R('RuntimeObservationCollector', 'RuntimeEventCollector', 'generates', 0.7, { description: 'Observations become events' });
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalRelationships: this.getRelationshipCount(),
            activeRelationships: this.getActive().length,
            typeBreakdown: this._getTypeBreakdown(),
            lifecycleEvents: this._lifecycleLog.length
        };
    },

    _getTypeBreakdown: function() {
        var breakdown = {};
        for (var i = 0; i < this._validTypes.length; i++) {
            breakdown[this._validTypes[i]] = this.getByType(this._validTypes[i]).length;
        }
        return breakdown;
    }
};

// ── Auto-init ──
LawAIApp.RuntimeRelationshipEngine.init();

console.log('🧠 Runtime Relationship Engine — Part 47.3 Complete');
console.log('   ✅ Relationship Model: sourceEntity + targetEntity + type + confidence');
console.log('   ✅ Types: depends_on, affects, causes, contains, belongs_to, references, communicates_with, generates');
console.log('   ✅ Lifecycle: created → validated → active → updated → archived');
console.log('   ✅ Rules: entity-exists, type-valid, no-duplicates');
console.log('   ✅ Built-in: ' + LawAIApp.RuntimeRelationshipEngine.getRelationshipCount() + ' relationships');
console.log('   ✅ Impact & Dependency Graphs: getImpactGraph(), getDependencyGraph()');
console.log('   ✅ Ready for Part 47.4 — Knowledge Graph Analyzer');
