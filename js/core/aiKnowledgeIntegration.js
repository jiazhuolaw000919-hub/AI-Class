// ================================================================
// aiKnowledgeIntegration.js — Part 47.6
// AI Knowledge Integration
// Version: v4.7.6
// Status: Architecture Integration
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Knowledge Retrieval, Filtering, Ranking, Packaging, Delivery.
//   Unified bridge between AI Assistant and Knowledge Graph.
//
// ARCHITECTURE POSITION
//   Runtime Data → Knowledge Graph → AI Knowledge Integration → AI Assistant
//
// KNOWLEDGE RETRIEVAL FLOW
//   AI Request → KG Query → Entity Collection → Relationship Expansion
//   → Impact Analysis → Knowledge Package
//
// KNOWLEDGE PACKAGE
//   { entities, relationships, impactAnalysis, graphSummary, confidence, timestamp }
//
// RULES
//   Rule 1: AI 必须优先读取 Knowledge Package
//   Rule 2: Knowledge Package 不得直接修改 Graph
//   Rule 3: Graph 不完整时必须安全降级
//   Rule 4: 所有 Knowledge 必须保留来源
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIKnowledgeIntegration = {
    _version: '4.7.6',
    _ready: false,
    _packageCache: null,
    _cacheTTL: 3000,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Knowledge Integration v' + this._version + ' ready');
        console.log('   📦 Knowledge Package: entities + relationships + impact + summary');
        console.log('   🔍 Flow: Request → Query → Expand → Analyze → Package');
        console.log('   🛡️ Rules: package-first, read-only, safe-degrade, source-tracked');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 55: KNOWLEDGE RETRIEVAL FLOW
    // ============================================================

    /**
     * getKnowledgePackage(entityId, options)
     * Full knowledge retrieval for an entity.
     * Returns a packaged set of entities, relationships, impact, and summary.
     * @param {string} entityId — target entity (null = full graph overview)
     * @param {Object} options — { expandDepth, includeImpact, includeHealth }
     */
    getKnowledgePackage: function(entityId, options) {
        options = options || {};
        var expandDepth = options.expandDepth || 2;
        var includeImpact = options.includeImpact !== false;
        var includeHealth = options.includeHealth !== false;

        // Check cache
        var cacheKey = entityId + '_' + expandDepth;
        if (this._packageCache && this._packageCache.key === cacheKey && (Date.now() - this._packageCache.time) < this._cacheTTL) {
            return this._packageCache.package;
        }

        // Rule 3: safe degrade if graph not available
        var kg = this._getKG();
        var registry = this._getRegistry();
        var relEngine = this._getRelEngine();
        var impactEngine = this._getImpactEngine();
        var analyzer = this._getAnalyzer();

        if (!kg && !relEngine) {
            return this._degradedPackage(entityId, 'Knowledge Graph and Relationship Engine not available');
        }

        var pkg = {
            entities: [],
            relationships: [],
            impactAnalysis: null,
            graphSummary: null,
            confidence: 0,
            sources: [],
            timestamp: new Date().toISOString()
        };

        // ── Step 1: Entity Collection ──
        if (entityId) {
            // Specific entity + its neighborhood
            var node = kg ? kg.getNode(entityId) : null;
            var regEntity = registry ? registry.get(entityId) : null;
            if (node || regEntity) {
                pkg.entities.push(node || { id: entityId, type: (regEntity && regEntity.type) || 'unknown' });
                pkg.sources.push('KnowledgeGraph');
            }

            // Expand: related entities
            var related = kg ? kg.getRelatedNodes(entityId, expandDepth) : [];
            for (var i = 0; i < related.length; i++) {
                pkg.entities.push(related[i]);
            }
        } else {
            // Full graph overview
            if (kg) {
                pkg.entities = kg.getAllNodes();
                pkg.sources.push('KnowledgeGraph');
            } else if (registry) {
                pkg.entities = registry.getActive().map(function(e) {
                    return { id: e.entityId, type: e.type, metadata: { name: e.name, status: e.status } };
                });
                pkg.sources.push('EntityRegistry');
            }
        }

        // ── Step 2: Relationship Expansion ──
        if (relEngine) {
            if (entityId) {
                var outgoing = relEngine.getBySource(entityId);
                var incoming = relEngine.getByTarget(entityId);
                pkg.relationships = outgoing.concat(incoming);
            } else {
                pkg.relationships = relEngine.getActive();
            }
            pkg.sources.push('RelationshipEngine');
        } else if (kg) {
            pkg.relationships = kg.getAllEdges();
            pkg.sources.push('KnowledgeGraph');
        }

        // ── Step 3: Impact Analysis ──
        if (includeImpact && entityId && impactEngine) {
            try {
                pkg.impactAnalysis = impactEngine.getImpactSummary(entityId);
                pkg.sources.push('ImpactAnalysisEngine');
            } catch (e) { /* ignore */ }
        }

        // ── Step 4: Graph Summary ──
        if (includeHealth && analyzer) {
            try {
                var health = entityId ? analyzer.analyzeConnectivity(entityId) : analyzer.analyzeHealth();
                pkg.graphSummary = {
                    health: health.summary,
                    confidence: health.confidence,
                    details: health.details
                };
                pkg.sources.push('KnowledgeGraphAnalyzer');
            } catch (e) { /* ignore */ }
        }

        // ── Calculate overall confidence ──
        pkg.confidence = this._calculatePackageConfidence(pkg);

        // Cache
        this._packageCache = { key: cacheKey, time: Date.now(), package: pkg };

        return pkg;
    },

    /**
     * getEntityKnowledge(entityId)
     * Deep knowledge about a single entity: entity + relationships + impact + deps.
     */
    getEntityKnowledge: function(entityId) {
        var pkg = this.getKnowledgePackage(entityId, { expandDepth: 3, includeImpact: true, includeHealth: true });
        var relEngine = this._getRelEngine();
        var impactEngine = this._getImpactEngine();
        var analyzer = this._getAnalyzer();

        // Enrich with dependency and impact analysis
        var enriched = {
            package: pkg,
            dependency: analyzer ? analyzer.analyzeDependencies(entityId) : null,
            impact: impactEngine ? impactEngine.getImpactSummary(entityId) : null,
            connectivity: analyzer ? analyzer.analyzeConnectivity(entityId) : null
        };

        return enriched;
    },

    /**
     * getGraphOverview()
     * Full graph overview — all entities, relationships, patterns, health.
     */
    getGraphOverview: function() {
        var pkg = this.getKnowledgePackage(null, { includeImpact: false, includeHealth: true });
        var analyzer = this._getAnalyzer();

        return {
            package: pkg,
            patterns: analyzer ? analyzer.detectPatterns() : null,
            health: analyzer ? analyzer.analyzeHealth() : null,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * queryKnowledge(query)
     * Answers an AI query by traversing the Knowledge Graph.
     * Used by AI Runtime Interaction (Part 46.6).
     * @param {Object} query — { entityId, intent: 'deps'|'impact'|'overview'|'connectivity' }
     */
    queryKnowledge: function(query) {
        if (!query || !query.entityId) {
            return this.getGraphOverview();
        }

        switch (query.intent) {
            case 'deps':
                return {
                    entity: query.entityId,
                    knowledge: this.getEntityKnowledge(query.entityId),
                    type: 'dependency'
                };

            case 'impact':
                var impactEngine = this._getImpactEngine();
                return {
                    entity: query.entityId,
                    impact: impactEngine ? impactEngine.analyzeImpact(query.entityId, query.depth || 4) : null,
                    type: 'impact'
                };

            case 'connectivity':
                var analyzer = this._getAnalyzer();
                return {
                    entity: query.entityId,
                    connectivity: analyzer ? analyzer.analyzeConnectivity(query.entityId) : null,
                    type: 'connectivity'
                };

            case 'overview':
            default:
                return {
                    entity: query.entityId,
                    knowledge: this.getEntityKnowledge(query.entityId),
                    type: 'overview'
                };
        }
    },

    // ============================================================
    // KNOWLEDGE RANKING & FILTERING
    // ============================================================

    /**
     * filterByConfidence(knowledgePackage, minConfidence)
     * Filters entities and relationships by confidence threshold.
     */
    filterByConfidence: function(knowledgePackage, minConfidence) {
        minConfidence = minConfidence || 0.5;
        var filtered = JSON.parse(JSON.stringify(knowledgePackage));

        if (filtered.relationships) {
            filtered.relationships = filtered.relationships.filter(function(r) {
                return (r.confidence || 0.5) >= minConfidence;
            });
        }

        return filtered;
    },

    /**
     * rankByRelevance(knowledgePackage, entityId)
     * Ranks entities by relevance to the target entity.
     * Closer entities (fewer hops) rank higher.
     */
    rankByRelevance: function(knowledgePackage, entityId) {
        if (!knowledgePackage.relationships) return knowledgePackage;

        // Build distance map
        var distances = {};
        distances[entityId] = 0;

        // Simple BFS to calculate distances
        var changed = true;
        var iter = 0;
        while (changed && iter < 10) {
            changed = false;
            iter++;
            for (var i = 0; i < knowledgePackage.relationships.length; i++) {
                var r = knowledgePackage.relationships[i];
                var src = r.sourceEntity || r.source;
                var tgt = r.targetEntity || r.target;
                if (distances[src] !== undefined && distances[tgt] === undefined) {
                    distances[tgt] = distances[src] + 1;
                    changed = true;
                }
                if (distances[tgt] !== undefined && distances[src] === undefined) {
                    distances[src] = distances[tgt] + 1;
                    changed = true;
                }
            }
        }

        // Tag entities with distance
        if (knowledgePackage.entities) {
            for (var i = 0; i < knowledgePackage.entities.length; i++) {
                var e = knowledgePackage.entities[i];
                e._distance = distances[e.id] !== undefined ? distances[e.id] : 999;
            }
            knowledgePackage.entities.sort(function(a, b) { return (a._distance || 999) - (b._distance || 999); });
        }

        return knowledgePackage;
    },

    // ============================================================
    // PACKAGE CONFIDENCE
    // ============================================================

    _calculatePackageConfidence: function(pkg) {
        var factors = 0;
        var total = 0;

        if (pkg.entities.length > 0) { factors++; total += 0.9; }
        if (pkg.relationships.length > 0) { factors++; total += 0.85; }
        if (pkg.impactAnalysis) { factors++; total += 0.8; }
        if (pkg.graphSummary && pkg.graphSummary.confidence) { factors++; total += pkg.graphSummary.confidence; }

        return factors > 0 ? Math.round((total / factors) * 100) / 100 : 0.3;
    },

    // ============================================================
    // DEGRADED PACKAGE (Rule 3)
    // ============================================================

    _degradedPackage: function(entityId, reason) {
        return {
            entities: entityId ? [{ id: entityId, type: 'unknown' }] : [],
            relationships: [],
            impactAnalysis: null,
            graphSummary: { health: 'Knowledge Graph unavailable: ' + reason, confidence: 0.1 },
            confidence: 0.1,
            sources: ['degraded'],
            degraded: true,
            degradeReason: reason,
            timestamp: new Date().toISOString()
        };
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getKG: function() { return LawAIApp.RuntimeKnowledgeGraph || null; },
    _getRegistry: function() { return LawAIApp.RuntimeEntityRegistry || null; },
    _getRelEngine: function() { return LawAIApp.RuntimeRelationshipEngine || null; },
    _getImpactEngine: function() { return LawAIApp.ImpactAnalysisEngine || null; },
    _getAnalyzer: function() { return LawAIApp.KnowledgeGraphAnalyzer || null; },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            kgAvailable: !!this._getKG(),
            registryAvailable: !!this._getRegistry(),
            relEngineAvailable: !!this._getRelEngine(),
            impactAvailable: !!this._getImpactEngine(),
            analyzerAvailable: !!this._getAnalyzer()
        };
    }
};

// ── Auto-init ──
LawAIApp.AIKnowledgeIntegration.init();

console.log('🧠 AI Knowledge Integration — Part 47.6 Complete');
console.log('   ✅ Knowledge Retrieval: getKnowledgePackage(), getEntityKnowledge(), getGraphOverview()');
console.log('   ✅ Query Flow: Request → Query → Expand → Analyze → Package');
console.log('   ✅ Ranking & Filtering: filterByConfidence(), rankByRelevance()');
console.log('   ✅ Knowledge Package: entities + relationships + impact + summary');
console.log('   ✅ Rules: package-first, read-only, safe-degrade, source-tracked');
console.log('   ✅ Ready for Part 47.7 — Knowledge Graph Dashboard & DevPanel');
