// ================================================================
// runtimeEntityRegistry.js — Part 47.2
// Runtime Entity Registry
// Version: v4.7.2
// Status: Architecture Implementation
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Unified management of Runtime Entities.
//   Single source of truth for Knowledge Graph nodes.
//   Registration, Discovery, Lookup, Validation.
//
// ARCHITECTURE POSITION
//   Runtime Objects → Entity Registry → Knowledge Graph → AI Reasoning
//
// ENTITY CATEGORIES
//   runtime, module, event, state, performance, ai
//
// ENTITY MODEL
//   { entityId, type, name, status, metadata }
//
// LIFECYCLE
//   Created → Registered → Active → Updated → Archived
//
// RULES
//   Rule 1: 每个 Entity 必须拥有唯一 ID
//   Rule 2: Entity Type 必须明确
//   Rule 3: Entity 生命周期必须可追踪
//   Rule 4: 重复注册必须安全处理
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeEntityRegistry = {
    _version: '4.7.2',
    _ready: false,
    _entities: {},
    _lifecycleLog: [],
    _validTypes: ['runtime', 'module', 'event', 'state', 'performance', 'ai', 'system'],

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        this._registerBuiltinEntities();
        console.log('🧠 Runtime Entity Registry v' + this._version + ' ready');
        console.log('   📋 Entities: ' + this.getEntityCount());
        console.log('   📂 Types: ' + this._validTypes.join(', '));
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 15: ENTITY REGISTRATION
    // ============================================================

    /**
     * register(entityId, type, name, metadata)
     * Registers a new entity or updates an existing one.
     * Rule 4: duplicate registration is safe (merge metadata).
     * @param {string} entityId — unique identifier
     * @param {string} type — 'runtime' | 'module' | 'event' | 'state' | 'performance' | 'ai' | 'system'
     * @param {string} name — human-readable name
     * @param {Object} metadata — extra context
     * @returns {Object} registered entity
     */
    register: function(entityId, type, name, metadata) {
        if (!entityId) {
            console.warn('[EntityRegistry] register() requires entityId');
            return null;
        }

        // Rule 2: validate type
        if (!type || this._validTypes.indexOf(type) === -1) {
            console.warn('[EntityRegistry] Invalid type: ' + type + ' for entity: ' + entityId);
            type = 'system'; // fallback
        }

        name = name || entityId;

        // Rule 4: duplicate registration — update instead
        if (this._entities[entityId]) {
            var existing = this._entities[entityId];
            existing.name = name;
            if (existing.status === 'archived') {
                existing.status = 'active';
                this._logLifecycle(entityId, 'reactivated');
            } else {
                existing.status = 'updated';
                this._logLifecycle(entityId, 'updated');
            }
            if (metadata) {
                for (var key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        existing.metadata[key] = metadata[key];
                    }
                }
            }
            existing.updatedAt = new Date().toISOString();
            return existing;
        }

        // New entity
        var entity = {
            entityId: entityId,
            type: type,
            name: name,
            status: 'registered',
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this._entities[entityId] = entity;
        this._logLifecycle(entityId, 'created');
        this._logLifecycle(entityId, 'registered');

        return entity;
    },

    /**
     * activate(entityId)
     * Moves entity from 'registered' to 'active'.
     */
    activate: function(entityId) {
        var entity = this._entities[entityId];
        if (!entity) {
            console.warn('[EntityRegistry] Entity not found: ' + entityId);
            return false;
        }
        if (entity.status === 'active') return true;

        entity.status = 'active';
        entity.updatedAt = new Date().toISOString();
        this._logLifecycle(entityId, 'activated');
        return true;
    },

    /**
     * archive(entityId)
     * Archives an entity (soft delete).
     */
    archive: function(entityId) {
        var entity = this._entities[entityId];
        if (!entity) return false;
        if (entity.status === 'archived') return true;

        entity.status = 'archived';
        entity.archivedAt = new Date().toISOString();
        entity.updatedAt = new Date().toISOString();
        this._logLifecycle(entityId, 'archived');
        return true;
    },

    // ============================================================
    // CHAPTER 13: ENTITY LOOKUP & DISCOVERY
    // ============================================================

    /**
     * get(entityId)
     * Returns entity by id.
     */
    get: function(entityId) {
        return this._entities[entityId] || null;
    },

    /**
     * getAll(filterStatus)
     * Returns all entities, optionally filtered by status.
     */
    getAll: function(filterStatus) {
        var result = [];
        for (var id in this._entities) {
            if (this._entities.hasOwnProperty(id)) {
                if (!filterStatus || this._entities[id].status === filterStatus) {
                    result.push(this._entities[id]);
                }
            }
        }
        return result;
    },

    /**
     * getByType(type)
     * Returns entities of a specific type.
     */
    getByType: function(type) {
        var result = [];
        for (var id in this._entities) {
            if (this._entities.hasOwnProperty(id) && this._entities[id].type === type) {
                result.push(this._entities[id]);
            }
        }
        return result;
    },

    /**
     * getActive()
     * Returns all active entities.
     */
    getActive: function() {
        return this.getAll('active');
    },

    /**
     * getArchived()
     * Returns all archived entities.
     */
    getArchived: function() {
        return this.getAll('archived');
    },

    /**
     * exists(entityId)
     * Checks if an entity is registered and active.
     */
    exists: function(entityId) {
        var entity = this._entities[entityId];
        return !!(entity && entity.status !== 'archived');
    },

    getEntityCount: function() {
        return Object.keys(this._entities).length;
    },

    getActiveCount: function() {
        return this.getActive().length;
    },

    // ============================================================
    // CHAPTER 16: VALIDATION
    // ============================================================

    /**
     * validate(entityId, expectedType)
     * Validates that an entity exists, is active, and matches type.
     * Used by Knowledge Graph before creating edges (Part 47.1 Rule: 禁止引用未知对象).
     */
    validate: function(entityId, expectedType) {
        var entity = this._entities[entityId];
        if (!entity) {
            return { valid: false, error: 'Entity not found: ' + entityId };
        }
        if (entity.status === 'archived') {
            return { valid: false, error: 'Entity is archived: ' + entityId };
        }
        if (expectedType && entity.type !== expectedType) {
            return { valid: false, error: 'Type mismatch: expected ' + expectedType + ', got ' + entity.type };
        }
        return { valid: true, entity: entity };
    },

    /**
     * validateAll()
     * Validates all registered entities and returns issues.
     */
    validateAll: function() {
        var issues = [];
        for (var id in this._entities) {
            if (this._entities.hasOwnProperty(id)) {
                var entity = this._entities[id];
                if (!entity.type || this._validTypes.indexOf(entity.type) === -1) {
                    issues.push({ entityId: id, issue: 'Invalid type: ' + entity.type });
                }
                if (!entity.name) {
                    issues.push({ entityId: id, issue: 'Missing name' });
                }
            }
        }
        return { valid: issues.length === 0, issues: issues, totalEntities: this.getEntityCount() };
    },

    // ============================================================
    // CHAPTER 17: LIFECYCLE TRACKING
    // ============================================================

    _logLifecycle: function(entityId, event) {
        this._lifecycleLog.push({
            entityId: entityId,
            event: event,
            timestamp: new Date().toISOString()
        });
        // Keep log bounded
        if (this._lifecycleLog.length > 500) {
            this._lifecycleLog.shift();
        }
    },

    /**
     * getLifecycle(entityId, limit)
     * Returns lifecycle events for an entity.
     */
    getLifecycle: function(entityId, limit) {
        limit = limit || 20;
        var events = this._lifecycleLog.filter(function(e) {
            return e.entityId === entityId;
        });
        return events.slice(-limit);
    },

    /**
     * getLifecycleSummary(entityId)
     * Returns lifecycle summary for an entity.
     */
    getLifecycleSummary: function(entityId) {
        var events = this.getLifecycle(entityId, 100);
        if (events.length === 0) return null;

        return {
            entityId: entityId,
            created: events[0].timestamp,
            lastEvent: events[events.length - 1].event,
            lastEventTime: events[events.length - 1].timestamp,
            totalEvents: events.length,
            currentStatus: this._entities[entityId] ? this._entities[entityId].status : 'unknown'
        };
    },

    // ============================================================
    // CHAPTER 18: KNOWLEDGE GRAPH INTEGRATION
    // ============================================================

    /**
     * syncToKnowledgeGraph()
     * Syncs active entities to Knowledge Graph as nodes.
     * Ensures all KG nodes reference registered entities.
     */
    syncToKnowledgeGraph: function() {
        var kg = LawAIApp.RuntimeKnowledgeGraph;
        if (!kg || typeof kg.addNode !== 'function') {
            return { success: false, error: 'Knowledge Graph not available' };
        }

        var synced = 0;
        var active = this.getActive();
        for (var i = 0; i < active.length; i++) {
            var entity = active[i];
            kg.addNode(entity.entityId, entity.type, {
                name: entity.name,
                status: entity.status,
                registryEntity: true
            });
            synced++;
        }

        return { success: true, synced: synced };
    },

    // ============================================================
    // BUILT-IN ENTITIES
    // ============================================================

    _registerBuiltinEntities: function() {
        // Runtime entities
        this.register('BootManager', 'runtime', 'Boot Manager', {
            description: 'Coordinates boot sequence', version: 'V4.5.7'
        });
        this.register('BootPipeline', 'runtime', 'Boot Pipeline', {
            description: 'Executes boot stages', version: '1.0'
        });
        this.register('RuntimeObservationCollector', 'runtime', 'Observation Collector', {
            description: 'Collects runtime observations'
        });
        this.register('RuntimeMetricsCollector', 'runtime', 'Metrics Collector', {
            description: 'Collects runtime metrics'
        });
        this.register('RuntimeTraceCollector', 'runtime', 'Trace Collector', {
            description: 'Collects runtime traces'
        });
        this.register('RuntimeEventCollector', 'runtime', 'Event Collector', {
            description: 'Collects runtime events'
        });

        // State entities
        this.register('StateSyncEngine', 'state', 'State Sync Engine', {
            description: 'Synchronizes runtime state'
        });
        this.register('StateRegistry', 'state', 'State Registry', {
            description: 'State definition registry'
        });
        this.register('StateConflictResolver', 'state', 'Conflict Resolver', {
            description: 'Resolves state conflicts'
        });
        this.register('StatePersistence', 'state', 'State Persistence', {
            description: 'Persists state snapshots'
        });

        // Performance entities
        this.register('Performance', 'performance', 'Performance Framework', {
            description: 'Tracks execution metrics'
        });
        this.register('RuntimePerformanceCollector', 'performance', 'Performance Collector', {
            description: 'Collects performance data'
        });
        this.register('RuntimePerformanceAnalyzer', 'performance', 'Performance Analyzer', {
            description: 'Analyzes performance data'
        });

        // Event entities
        this.register('RuntimeEventRegistry', 'event', 'Event Registry', {
            description: 'Event type registry'
        });
        this.register('RuntimeEventStore', 'event', 'Event Store', {
            description: 'Stores event records'
        });
        this.register('RuntimeEventAnalyzer', 'event', 'Event Analyzer', {
            description: 'Analyzes event patterns'
        });
        this.register('RuntimeEventIntelligence', 'event', 'Event Intelligence', {
            description: 'Event intelligence engine'
        });
        this.register('RuntimeEventTimeline', 'event', 'Event Timeline', {
            description: 'Event timeline view'
        });

        // AI entities
        this.register('AIContextEngine', 'ai', 'AI Context Engine', {
            description: 'Context aggregation engine', version: '4.6.2'
        });
        this.register('AIRuntimeKnowledge', 'ai', 'AI Runtime Knowledge', {
            description: 'Knowledge interpretation layer', version: '4.6.3'
        });
        this.register('AIReasoningEngine', 'ai', 'AI Reasoning Engine', {
            description: 'Runtime reasoning engine', version: '4.6.4'
        });
        this.register('AIRecommendationEngine', 'ai', 'AI Recommendation Engine', {
            description: 'Recommendation generation', version: '4.6.5'
        });
        this.register('AIRuntimeInteraction', 'ai', 'AI Runtime Interaction', {
            description: 'Developer interaction layer', version: '4.6.6'
        });

        // Module entities (business engines)
        this.register('SystemComposer', 'module', 'System Composer', {
            description: 'UI composition engine'
        });
        this.register('LessonEngine', 'module', 'Lesson Engine', {
            description: 'Lesson management'
        });
        this.register('MemoryEngine', 'module', 'Memory Engine', {
            description: 'Spaced repetition memory'
        });
        this.register('ProgressEngine', 'module', 'Progress Engine', {
            description: 'Learning progress tracking'
        });
        this.register('AIMentorEngine', 'module', 'AI Mentor Engine', {
            description: 'AI mentorship for learners'
        });

        // Activate all built-in entities
        var all = this.getAll('registered');
        for (var i = 0; i < all.length; i++) {
            this.activate(all[i].entityId);
        }
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalEntities: this.getEntityCount(),
            activeEntities: this.getActiveCount(),
            archivedEntities: this.getArchived().length,
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
LawAIApp.RuntimeEntityRegistry.init();

console.log('🧠 Runtime Entity Registry — Part 47.2 Complete');
console.log('   ✅ Entity Model: entityId + type + name + status + metadata');
console.log('   ✅ Lifecycle: created → registered → active → updated → archived');
console.log('   ✅ Built-in: ' + LawAIApp.RuntimeEntityRegistry.getEntityCount() + ' entities across ' + LawAIApp.RuntimeEntityRegistry._validTypes.length + ' types');
console.log('   ✅ Rules: unique-id, typed, trackable, safe-duplicate');
console.log('   ✅ Knowledge Graph Integration: syncToKnowledgeGraph()');
console.log('   ✅ Ready for Part 47.3 — Relationship Engine');
