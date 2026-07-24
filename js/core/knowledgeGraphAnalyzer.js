// ================================================================
// knowledgeGraphAnalyzer.js — Part 47.4
// Knowledge Graph Analyzer
// Version: v4.7.4
// Status: Architecture Implementation
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Analyze Runtime Knowledge Graph.
//   Dependency Analysis, Relationship Analysis, Pattern Detection,
//   Impact Discovery, Graph Statistics.
//
// ARCHITECTURE POSITION
//   Knowledge Graph → Graph Analyzer → Analysis Result → AI Reasoning
//
// ANALYSIS TYPES
//   Dependency, Relationship, Connectivity, Pattern, Graph Health
//
// ANALYSIS MODEL
//   { analysisId, type, summary, affectedEntities, confidence, timestamp }
//
// RULES
//   Rule 1: Analyzer 不修改 Graph
//   Rule 2: 所有分析必须可追踪
//   Rule 3: Analysis 必须包含 Confidence
//   Rule 4: 异常 Relationship 必须标记
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeGraphAnalyzer = {
    _version: '4.7.4',
    _ready: false,
    _analyses: [],
    _maxAnalyses: 50,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Knowledge Graph Analyzer v' + this._version + ' ready');
        console.log('   🔍 Types: Dependency, Relationship, Connectivity, Pattern, Health');
        console.log('   🛡️ Rules: read-only, traceable, confidence-rated');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 35: ANALYSIS RESULT FACTORY
    // ============================================================

    _createResult: function(type, summary, affectedEntities, confidence, details) {
        var result = {
            analysisId: 'ana_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: type,
            summary: summary,
            affectedEntities: affectedEntities || [],
            confidence: Math.max(0, Math.min(1, confidence || 0.5)),
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            details: details || {},
            timestamp: new Date().toISOString()
        };

        this._analyses.push(result);
        if (this._analyses.length > this._maxAnalyses) {
            this._analyses.shift();
        }

        return result;
    },

    // ============================================================
    // CHAPTER 36: DEPENDENCY DISCOVERY
    // ============================================================

    /**
     * analyzeDependencies(entityId)
     * Finds direct & indirect dependencies, circular deps, missing deps.
     */
    analyzeDependencies: function(entityId) {
        var kg = this._getKG();
        var relEngine = this._getRelEngine();
        if (!kg) return this._createResult('dependency', 'Knowledge Graph not available', [entityId], 0);

        var directDeps = [];
        var indirectDeps = [];
        var circularDeps = [];
        var missingDeps = [];

        // Direct dependencies from Relationship Engine
        if (relEngine) {
            var deps = relEngine.getBySource(entityId).filter(function(r) { return r.type === 'depends_on'; });
            directDeps = deps.map(function(r) { return r.targetEntity; });

            // Indirect (depth 2)
            for (var i = 0; i < directDeps.length; i++) {
                var subDeps = relEngine.getBySource(directDeps[i]).filter(function(r) { return r.type === 'depends_on'; });
                for (var j = 0; j < subDeps.length; j++) {
                    var subTarget = subDeps[j].targetEntity;
                    if (directDeps.indexOf(subTarget) === -1 && subTarget !== entityId) {
                        indirectDeps.push({ via: directDeps[i], target: subTarget });
                    }
                }
            }
        }

        // Circular: entity depends on something that depends back on it
        for (var i = 0; i < directDeps.length; i++) {
            var backDeps = relEngine ? relEngine.getBySource(directDeps[i]).filter(function(r) { return r.targetEntity === entityId; }) : [];
            if (backDeps.length > 0) {
                circularDeps.push(directDeps[i]);
            }
        }

        // Missing: entities referenced in KG edges but not in Entity Registry
        var registry = LawAIApp.RuntimeEntityRegistry;
        if (registry) {
            var outgoing = kg.getOutgoingEdges(entityId);
            for (var i = 0; i < outgoing.length; i++) {
                if (!registry.exists(outgoing[i].target)) {
                    missingDeps.push(outgoing[i].target);
                }
            }
        }

        var totalIssues = circularDeps.length + missingDeps.length;
        var confidence = directDeps.length > 0 ? 0.85 : 0.5;

        var summary = entityId + ' has ' + directDeps.length + ' direct, ' + indirectDeps.length + ' indirect dependencies';
        if (circularDeps.length > 0) summary += ', ' + circularDeps.length + ' circular';
        if (missingDeps.length > 0) summary += ', ' + missingDeps.length + ' missing';

        return this._createResult('dependency', summary, [entityId].concat(directDeps), confidence, {
            directDependencies: directDeps,
            indirectDependencies: indirectDeps,
            circularDependencies: circularDeps,
            missingDependencies: missingDeps,
            totalIssues: totalIssues
        });
    },

    // ============================================================
    // RELATIONSHIP ANALYSIS
    // ============================================================

    /**
     * analyzeRelationships(entityId)
     * Analyzes all relationship types for an entity.
     */
    analyzeRelationships: function(entityId) {
        var relEngine = this._getRelEngine();
        if (!relEngine) return this._createResult('relationship', 'Relationship Engine not available', [entityId], 0);

        var outgoing = relEngine.getBySource(entityId);
        var incoming = relEngine.getByTarget(entityId);

        var typeCount = {};
        for (var i = 0; i < outgoing.length; i++) {
            var t = outgoing[i].type;
            typeCount[t] = (typeCount[t] || 0) + 1;
        }

        var lowConfEdges = outgoing.filter(function(r) { return r.confidence < 0.5; });
        var highConfEdges = outgoing.filter(function(r) { return r.confidence >= 0.8; });

        var summary = entityId + ': ' + outgoing.length + ' outgoing, ' + incoming.length + ' incoming relationships';
        if (lowConfEdges.length > 0) summary += ', ' + lowConfEdges.length + ' low-confidence';

        return this._createResult('relationship', summary, [entityId], 0.8, {
            outgoingCount: outgoing.length,
            incomingCount: incoming.length,
            typeBreakdown: typeCount,
            lowConfidenceEdges: lowConfEdges.map(function(r) { return r.targetEntity + ' (' + r.type + ')'; }),
            highConfidenceCount: highConfEdges.length
        });
    },

    // ============================================================
    // CONNECTIVITY ANALYSIS
    // ============================================================

    /**
     * analyzeConnectivity(entityId)
     * Checks how well-connected an entity is.
     */
    analyzeConnectivity: function(entityId) {
        var kg = this._getKG();
        if (!kg) return this._createResult('connectivity', 'Knowledge Graph not available', [entityId], 0);

        var related = kg.getRelatedNodes(entityId, 2);
        var directOut = kg.getOutgoingEdges(entityId);
        var directIn = kg.getIncomingEdges(entityId);

        var totalConnections = directOut.length + directIn.length;
        var connectivityScore = Math.min(100, totalConnections * 15);

        var summary;
        if (totalConnections >= 5) {
            summary = entityId + ' is well-connected (' + totalConnections + ' connections, depth-2 reach: ' + related.length + ')';
        } else if (totalConnections > 0) {
            summary = entityId + ' has limited connections (' + totalConnections + '). Consider adding relationships.';
        } else {
            summary = entityId + ' is isolated. No relationships found.';
        }

        return this._createResult('connectivity', summary, [entityId], 0.75, {
            totalConnections: totalConnections,
            outgoing: directOut.length,
            incoming: directIn.length,
            depth2Reach: related.length,
            connectivityScore: connectivityScore,
            isIsolated: totalConnections === 0
        });
    },

    // ============================================================
    // PATTERN DETECTION
    // ============================================================

    /**
     * detectPatterns()
     * Scans the entire graph for repeating patterns.
     */
    detectPatterns: function() {
        var kg = this._getKG();
        var relEngine = this._getRelEngine();
        if (!kg || !relEngine) return this._createResult('pattern', 'Graph data not available', [], 0);

        var patterns = [];
        var allEdges = kg.getAllEdges();

        // Pattern 1: Hub nodes (high connection count)
        var connectionCount = {};
        for (var i = 0; i < allEdges.length; i++) {
            var e = allEdges[i];
            connectionCount[e.source] = (connectionCount[e.source] || 0) + 1;
            connectionCount[e.target] = (connectionCount[e.target] || 0) + 1;
        }

        var hubs = [];
        for (var node in connectionCount) {
            if (connectionCount.hasOwnProperty(node) && connectionCount[node] >= 4) {
                hubs.push({ entity: node, connections: connectionCount[node] });
            }
        }
        hubs.sort(function(a, b) { return b.connections - a.connections; });

        if (hubs.length > 0) {
            patterns.push({
                type: 'hub',
                description: hubs.length + ' hub node(s) detected (>4 connections)',
                hubs: hubs.slice(0, 5)
            });
        }

        // Pattern 2: Chain dependencies (A→B→C)
        var chains = [];
        for (var i = 0; i < allEdges.length; i++) {
            var mid = allEdges[i].target;
            var downstream = allEdges.filter(function(e) { return e.source === mid && e.relationship === 'depends_on'; });
            if (downstream.length > 0) {
                chains.push({
                    chain: allEdges[i].source + ' → ' + mid + ' → ' + downstream[0].target,
                    length: 3
                });
            }
        }

        if (chains.length > 0) {
            patterns.push({
                type: 'chain',
                description: chains.length + ' dependency chain(s) detected',
                chains: chains.slice(0, 5)
            });
        }

        // Pattern 3: Circular references (A→B and B→A)
        var circular = [];
        for (var i = 0; i < allEdges.length; i++) {
            var s = allEdges[i].source;
            var t = allEdges[i].target;
            var reverse = allEdges.filter(function(e) { return e.source === t && e.target === s; });
            if (reverse.length > 0 && s < t) { // prevent duplicate reporting
                circular.push({ entity1: s, entity2: t });
            }
        }

        if (circular.length > 0) {
            patterns.push({
                type: 'circular',
                description: circular.length + ' circular relationship(s) detected',
                circular: circular
            });
        }

        var summary = 'Found ' + patterns.length + ' pattern type(s): ';
        summary += patterns.map(function(p) { return p.type; }).join(', ');

        return this._createResult('pattern', summary, hubs.map(function(h) { return h.entity; }), 0.7, {
            patterns: patterns,
            totalEdgesAnalyzed: allEdges.length
        });
    },

    // ============================================================
    // GRAPH HEALTH ANALYSIS
    // ============================================================

    /**
     * analyzeHealth()
     * Evaluates overall graph health.
     */
    analyzeHealth: function() {
        var kg = this._getKG();
        var registry = LawAIApp.RuntimeEntityRegistry;
        if (!kg) return this._createResult('health', 'Knowledge Graph not available', [], 0);

        var nodes = kg.getAllNodes();
        var edges = kg.getAllEdges();
        var issues = [];

        // Check 1: Orphan nodes (no edges)
        var orphans = [];
        for (var i = 0; i < nodes.length; i++) {
            var nodeId = nodes[i].id;
            var hasEdges = edges.some(function(e) { return e.source === nodeId || e.target === nodeId; });
            if (!hasEdges) orphans.push(nodeId);
        }
        if (orphans.length > 0) {
            issues.push({ type: 'orphan', count: orphans.length, entities: orphans, severity: 'medium' });
        }

        // Check 2: Low-confidence edges
        var lowConfEdges = edges.filter(function(e) { return e.confidence < 0.4; });
        if (lowConfEdges.length > 0) {
            issues.push({ type: 'low_confidence', count: lowConfEdges.length, severity: 'low' });
        }

        // Check 3: Missing registry entities
        if (registry) {
            var unregistered = [];
            for (var i = 0; i < nodes.length; i++) {
                if (!registry.exists(nodes[i].id)) {
                    unregistered.push(nodes[i].id);
                }
            }
            if (unregistered.length > 0) {
                issues.push({ type: 'unregistered', count: unregistered.length, entities: unregistered, severity: 'high' });
            }
        }

        // Check 4: Node-to-edge ratio
        var ratio = nodes.length > 0 ? edges.length / nodes.length : 0;
        if (ratio < 0.5 && nodes.length > 3) {
            issues.push({ type: 'sparse', ratio: ratio.toFixed(2), severity: 'medium' });
        }

        // Score
        var healthScore = 100;
        for (var i = 0; i < issues.length; i++) {
            switch (issues[i].severity) {
                case 'high': healthScore -= 25; break;
                case 'medium': healthScore -= 15; break;
                case 'low': healthScore -= 5; break;
            }
        }
        healthScore = Math.max(0, Math.min(100, healthScore));

        var status = healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'needs_attention' : 'critical';
        var summary = 'Graph Health: ' + healthScore + '% (' + status + '), ' + issues.length + ' issue(s)';

        return this._createResult('health', summary, orphans, 0.85, {
            healthScore: healthScore,
            status: status,
            totalNodes: nodes.length,
            totalEdges: edges.length,
            orphanCount: orphans.length,
            edgeToNodeRatio: ratio.toFixed(2),
            issues: issues
        });
    },

    // ============================================================
    // FULL ANALYSIS
    // ============================================================

    /**
     * analyzeAll(entityId)
     * Runs all analysis types for an entity.
     */
    analyzeAll: function(entityId) {
        return {
            dependency: this.analyzeDependencies(entityId),
            relationship: this.analyzeRelationships(entityId),
            connectivity: this.analyzeConnectivity(entityId),
            patterns: this.detectPatterns(),
            health: this.analyzeHealth(),
            timestamp: new Date().toISOString()
        };
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getKG: function() {
        return LawAIApp.RuntimeKnowledgeGraph || null;
    },

    _getRelEngine: function() {
        return LawAIApp.RuntimeRelationshipEngine || null;
    },

    // ============================================================
    // HISTORY
    // ============================================================

    getAnalyses: function(type, limit) {
        limit = limit || 20;
        var filtered = type ? this._analyses.filter(function(a) { return a.type === type; }) : this._analyses;
        return filtered.slice(-limit).reverse();
    },

    getAnalysisCount: function() {
        return this._analyses.length;
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalAnalyses: this._analyses.length,
            kgAvailable: !!this._getKG(),
            relEngineAvailable: !!this._getRelEngine()
        };
    }
};

// ── Auto-init ──
LawAIApp.KnowledgeGraphAnalyzer.init();

console.log('🧠 Knowledge Graph Analyzer — Part 47.4 Complete');
console.log('   ✅ Dependency Analysis: direct + indirect + circular + missing');
console.log('   ✅ Relationship Analysis: type breakdown + confidence check');
console.log('   ✅ Connectivity Analysis: score + isolation detection');
console.log('   ✅ Pattern Detection: hubs + chains + circular refs');
console.log('   ✅ Graph Health: orphans + confidence + ratio + score');
console.log('   ✅ Rules: read-only, traceable, confidence-rated, anomaly-flagged');
console.log('   ✅ Ready for Part 47.5 — Impact Analysis Engine');
