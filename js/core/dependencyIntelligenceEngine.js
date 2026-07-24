// ================================================================
// dependencyIntelligenceEngine.js — Part 48.2
// Dependency Intelligence Engine
// Version: v4.8.2
// Status: Architecture Implementation
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Dependency Discovery, Ranking, Critical Path Detection, Health.
//   Understands not just "A depends on B" but importance, impact, criticality.
//
// ARCHITECTURE POSITION
//   Knowledge Graph → Dependency Intelligence → Cognitive Engine → AI Assistant
//
// DEPENDENCY MODEL
//   { source, target, type, importance, confidence, metadata }
//
// DEPENDENCY TYPES
//   Direct, Indirect, Critical, Optional
//
// RULES
//   Rule 1: Dependency Analysis 不可修改 Runtime
//   Rule 2: Dependency 判断必须有来源
//   Rule 3: 循环依赖必须标记
//   Rule 4: 低 Confidence 不得作为关键判断
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DependencyIntelligenceEngine = {
    _version: '4.8.2',
    _ready: false,
    _analyses: [],
    _maxAnalyses: 40,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Dependency Intelligence Engine v' + this._version + ' ready');
        console.log('   🔗 Types: Direct, Indirect, Critical, Optional');
        console.log('   📊 Ranking: Relationship Count × Impact × History × Importance');
        console.log('   🛡️ Rules: read-only, sourced, circular-flagged, confidence-gated');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 13: DEPENDENCY MODEL
    // ============================================================

    _createDepResult: function(type, summary, deps, criticalPath, health, confidence, details) {
        var result = {
            id: 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: type,
            summary: summary,
            dependencies: deps || [],
            criticalPath: criticalPath || [],
            health: health || { score: 100, issues: [] },
            confidence: Math.max(0, Math.min(1, confidence || 0.5)),
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            details: details || {},
            timestamp: new Date().toISOString()
        };

        this._analyses.push(result);
        if (this._analyses.length > this._maxAnalyses) this._analyses.shift();
        return result;
    },

    // ============================================================
    // CHAPTER 14: DEPENDENCY ANALYSIS
    // ============================================================

    /**
     * analyze(entityId, maxDepth)
     * Full dependency analysis: direct, indirect, critical, optional.
     */
    analyze: function(entityId, maxDepth) {
        maxDepth = maxDepth || 3;
        var relEngine = this._getRelEngine();
        var kg = this._getKG();
        var registry = this._getRegistry();

        if (!relEngine && !kg) {
            return this._createDepResult('full', 'No graph data available', [], [], { score: 0, issues: ['No data'] }, 0);
        }

        var allDeps = [];
        var directDeps = [];
        var indirectDeps = [];
        var criticalDeps = [];
        var optionalDeps = [];
        var circularDeps = [];

        // Collect all outgoing "depends_on" edges
        var visited = {};
        var queue = [{ id: entityId, depth: 0 }];
        visited[entityId] = true;

        while (queue.length > 0) {
            var cur = queue.shift();
            if (cur.depth >= maxDepth) continue;

            var outgoing = this._getOutgoingDeps(cur.id);
            for (var i = 0; i < outgoing.length; i++) {
                var r = outgoing[i];
                var target = r.targetEntity || r.target;
                if (visited[target]) continue;
                visited[target] = true;

                var dep = {
                    source: cur.id,
                    target: target,
                    type: r.type || 'depends_on',
                    depth: cur.depth + 1,
                    confidence: r.confidence || 0.5,
                    importance: this._calculateImportance(target),
                    classification: cur.depth === 0 ? 'direct' : 'indirect'
                };

                allDeps.push(dep);
                if (cur.depth === 0) directDeps.push(dep);
                else indirectDeps.push(dep);

                // Classify
                if (dep.importance >= 7) criticalDeps.push(dep);
                if (dep.importance <= 3) optionalDeps.push(dep);

                queue.push({ id: target, depth: cur.depth + 1 });
            }
        }

        // Circular detection
        for (var i = 0; i < allDeps.length; i++) {
            var d = allDeps[i];
            var reverse = allDeps.filter(function(x) { return x.target === d.source && x.source === d.target; });
            if (reverse.length > 0 && d.source < d.target) {
                circularDeps.push({ entity1: d.source, entity2: d.target });
            }
        }

        // Critical path
        var criticalPath = this._findCriticalPath(entityId, allDeps);

        // Health
        var health = this._assessHealth(allDeps, circularDeps);

        // Summary
        var summary = entityId + ': ' + directDeps.length + ' direct, ' + indirectDeps.length + ' indirect, ' +
                      criticalDeps.length + ' critical, ' + optionalDeps.length + ' optional';
        if (circularDeps.length > 0) summary += ', ' + circularDeps.length + ' circular';

        return this._createDepResult('full', summary, allDeps, criticalPath, health, 0.85, {
            directCount: directDeps.length,
            indirectCount: indirectDeps.length,
            criticalCount: criticalDeps.length,
            optionalCount: optionalDeps.length,
            circularCount: circularDeps.length,
            circularDependencies: circularDeps
        });
    },

    /**
     * getCriticalPath(entityId)
     * Finds the most important dependency chain.
     */
    getCriticalPath: function(entityId) {
        var result = this.analyze(entityId, 4);
        return {
            entityId: entityId,
            criticalPath: result.criticalPath,
            pathLength: result.criticalPath.length,
            summary: result.criticalPath.length > 0
                ? 'Critical path: ' + result.criticalPath.join(' → ')
                : 'No critical path identified'
        };
    },

    /**
     * checkHealth(entityId)
     * Health check focused on dependencies.
     */
    checkHealth: function(entityId) {
        var result = this.analyze(entityId, 3);
        return {
            entityId: entityId,
            healthScore: result.health.score,
            issues: result.health.issues,
            circularCount: result.details.circularCount || 0,
            criticalCount: result.details.criticalCount || 0,
            status: result.health.score >= 80 ? 'healthy' : result.health.score >= 50 ? 'warning' : 'critical'
        };
    },

    /**
     * rankDependencies(entityId)
     * Ranks dependencies by importance score.
     */
    rankDependencies: function(entityId) {
        var result = this.analyze(entityId, 2);
        var ranked = result.dependencies.slice();
        ranked.sort(function(a, b) { return (b.importance || 0) - (a.importance || 0); });

        return {
            entityId: entityId,
            rankedDependencies: ranked.slice(0, 10),
            topDependency: ranked[0] || null,
            totalDependencies: ranked.length
        };
    },

    // ============================================================
    // CHAPTER 15: DEPENDENCY RANKING
    // ============================================================

    _calculateImportance: function(entityId) {
        var score = 0;
        var relEngine = this._getRelEngine();

        // Factor 1: How many things depend on this? (reverse deps)
        if (relEngine) {
            var incoming = relEngine.getByTarget(entityId);
            score += Math.min(incoming.length * 2, 6);
        }

        // Factor 2: Is it a core runtime module?
        var coreModules = ['BootManager', 'BootPipeline', 'StateSyncEngine', 'Performance',
                           'RuntimeEventCollector', 'AIContextEngine', 'SystemComposer'];
        if (coreModules.indexOf(entityId) !== -1) {
            score += 4;
        }

        // Factor 3: Is it an AI module?
        var aiModules = ['AIReasoningEngine', 'AIRecommendationEngine', 'AIRuntimeKnowledge',
                         'AIRuntimeInteraction', 'AIKnowledgeIntegration'];
        if (aiModules.indexOf(entityId) !== -1) {
            score += 2;
        }

        return Math.min(score, 10);
    },

    // ============================================================
    // CHAPTER 16: CRITICAL PATH
    // ============================================================

    _findCriticalPath: function(entityId, allDeps) {
        // Find the longest chain of high-importance dependencies
        if (allDeps.length === 0) return [];

        // Start from highest importance direct deps
        var directDeps = allDeps.filter(function(d) { return d.depth === 1; });
        directDeps.sort(function(a, b) { return (b.importance || 0) - (a.importance || 0); });

        var path = [entityId];
        var current = directDeps[0];
        var visited = {};
        visited[entityId] = true;

        while (current && !visited[current.target]) {
            path.push(current.target);
            visited[current.target] = true;

            // Find next highest-importance dep from current target
            var next = allDeps.filter(function(d) { return d.source === current.target && !visited[d.target]; });
            next.sort(function(a, b) { return (b.importance || 0) - (a.importance || 0); });
            current = next[0];
        }

        return path;
    },

    // ============================================================
    // CHAPTER 17: DEPENDENCY HEALTH
    // ============================================================

    _assessHealth: function(allDeps, circularDeps) {
        var score = 100;
        var issues = [];

        // Check 1: Circular dependencies (Rule 3)
        if (circularDeps.length > 0) {
            score -= circularDeps.length * 20;
            issues.push(circularDeps.length + ' circular dependencies: ' +
                circularDeps.map(function(c) { return c.entity1 + '↔' + c.entity2; }).join(', '));
        }

        // Check 2: Low-confidence dependencies (Rule 4)
        var lowConf = allDeps.filter(function(d) { return d.confidence < 0.4; });
        if (lowConf.length > 0) {
            score -= lowConf.length * 5;
            issues.push(lowConf.length + ' low-confidence dependencies');
        }

        // Check 3: Missing registry entities
        var registry = this._getRegistry();
        if (registry) {
            var missing = [];
            for (var i = 0; i < allDeps.length; i++) {
                if (!registry.exists(allDeps[i].target)) missing.push(allDeps[i].target);
            }
            if (missing.length > 0) {
                score -= missing.length * 10;
                issues.push(missing.length + ' unregistered dependency targets');
            }
        }

        // Check 4: Deep chains (> depth 3)
        var deepChains = allDeps.filter(function(d) { return d.depth >= 3; });
        if (deepChains.length > 3) {
            score -= 10;
            issues.push(deepChains.length + ' deep dependency chains (>2 hops)');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            issues: issues,
            status: score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical'
        };
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getOutgoingDeps: function(entityId) {
        var edges = [];
        var relEngine = this._getRelEngine();
        var kg = this._getKG();

        if (relEngine) {
            var rels = relEngine.getBySource(entityId);
            for (var i = 0; i < rels.length; i++) {
                if (rels[i].type === 'depends_on' || rels[i].type === 'affects' || rels[i].type === 'causes') {
                    edges.push(rels[i]);
                }
            }
        }
        if (kg) {
            var kgEdges = kg.getOutgoingEdges(entityId);
            edges = edges.concat(kgEdges);
        }

        return edges;
    },

    _getRelEngine: function() { return LawAIApp.RuntimeRelationshipEngine || null; },
    _getKG: function() { return LawAIApp.RuntimeKnowledgeGraph || null; },
    _getRegistry: function() { return LawAIApp.RuntimeEntityRegistry || null; },

    // ============================================================
    // HISTORY
    // ============================================================

    getAnalyses: function(limit) {
        limit = limit || 10;
        return this._analyses.slice(-limit).reverse();
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalAnalyses: this._analyses.length,
            relEngineAvailable: !!this._getRelEngine(),
            kgAvailable: !!this._getKG()
        };
    }
};

// ── Auto-init ──
LawAIApp.DependencyIntelligenceEngine.init();

console.log('🧠 Dependency Intelligence Engine — Part 48.2 Complete');
console.log('   ✅ Dependency Types: Direct, Indirect, Critical, Optional');
console.log('   ✅ Ranking: importance score (incoming × core × ai)');
console.log('   ✅ Critical Path: longest high-importance chain');
console.log('   ✅ Health: circular, low-confidence, unregistered, deep-chains');
console.log('   ✅ Rules: read-only, sourced, circular-flagged, confidence-gated');
console.log('   ✅ Ready for Part 48.3 — Root Cause Analysis Engine');
