// ================================================================
// impactAnalysisEngine.js — Part 47.5
// Runtime Impact Analysis Engine
// Version: v4.7.5
// Status: Architecture Implementation
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Impact Discovery, Propagation, Risk Calculation,
//   Dependency Traversal, Affected Entity Collection.
//
// ARCHITECTURE POSITION
//   Knowledge Graph → Impact Analysis Engine → Impact Chain → AI Recommendation
//
// IMPACT MODEL
//   { impactId, sourceEntity, affectedEntities, impactLevel, riskScore, confidence, timestamp }
//
// IMPACT LEVELS
//   Critical > High > Medium > Low > None
//   基于: Relationship Type × Dependency Depth × Historical Analysis
//
// RULES
//   Rule 1: Impact Analysis 不得修改 Knowledge Graph
//   Rule 2: Propagation 必须避免无限循环
//   Rule 3: Analysis 必须记录 Traversal Path
//   Rule 4: Risk Score 必须可解释
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ImpactAnalysisEngine = {
    _version: '4.7.5',
    _ready: false,
    _analyses: [],
    _maxAnalyses: 40,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Impact Analysis Engine v' + this._version + ' ready');
        console.log('   💥 Impact Levels: Critical > High > Medium > Low > None');
        console.log('   🔄 Propagation: Source → Direct → Indirect → Chain → Report');
        console.log('   🛡️ Rules: read-only, no-infinite-loop, path-tracked, risk-explained');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 44: IMPACT RESULT FACTORY
    // ============================================================

    _createImpactResult: function(sourceEntity, affectedEntities, impactLevel, riskScore, confidence, propagationPath, details) {
        var result = {
            impactId: 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            sourceEntity: sourceEntity,
            affectedEntities: affectedEntities || [],
            affectedCount: (affectedEntities || []).length,
            impactLevel: impactLevel,
            riskScore: Math.max(0, Math.min(100, riskScore || 0)),
            confidence: Math.max(0, Math.min(1, confidence || 0.5)),
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            propagationPath: propagationPath || [],
            propagationDepth: (propagationPath || []).length,
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
    // CHAPTER 46: IMPACT PROPAGATION
    // ============================================================

    /**
     * analyzeImpact(sourceEntityId, maxDepth)
     * Traces impact propagation from source through the graph.
     * Returns full impact chain with risk assessment.
     * @param {string} sourceEntityId — starting entity
     * @param {number} maxDepth — max traversal depth (default 4)
     */
    analyzeImpact: function(sourceEntityId, maxDepth) {
        maxDepth = maxDepth || 4;
        var relEngine = this._getRelEngine();
        var kg = this._getKG();

        if (!relEngine && !kg) {
            return this._createImpactResult(sourceEntityId, [], 'none', 0, 0, [], { error: 'No graph data available' });
        }

        // Rule 2: prevent infinite loops with visited set
        var visited = {};
        var affectedEntities = [];
        var propagationPath = [];
        var totalConfidence = 0;
        var edgeCount = 0;

        // BFS-style traversal with depth tracking
        var queue = [{ entityId: sourceEntityId, depth: 0, path: [] }];
        visited[sourceEntityId] = true;

        while (queue.length > 0) {
            var current = queue.shift();
            if (current.depth >= maxDepth) continue;

            var outgoing = this._getOutgoing(current.entityId);

            for (var i = 0; i < outgoing.length; i++) {
                var rel = outgoing[i];
                var target = rel.targetEntity || rel.target;

                if (visited[target]) continue;
                visited[target] = true;

                var newPath = current.path.concat([{
                    from: current.entityId,
                    to: target,
                    type: rel.type || rel.relationship,
                    confidence: rel.confidence || 0.5
                }]);

                affectedEntities.push({
                    entityId: target,
                    depth: current.depth + 1,
                    relationship: rel.type || rel.relationship,
                    confidence: rel.confidence || 0.5
                });

                propagationPath.push({
                    step: propagationPath.length + 1,
                    from: current.entityId,
                    to: target,
                    type: rel.type || rel.relationship,
                    depth: current.depth + 1
                });

                totalConfidence += rel.confidence || 0.5;
                edgeCount++;

                queue.push({ entityId: target, depth: current.depth + 1, path: newPath });
            }
        }

        // Calculate derived metrics
        var avgConfidence = edgeCount > 0 ? totalConfidence / edgeCount : 0;
        var impactLevel = this._calculateImpactLevel(affectedEntities, maxDepth);
        var riskScore = this._calculateRiskScore(affectedEntities, avgConfidence, propagationPath.length);
        var explanation = this._explainRisk(riskScore, impactLevel, affectedEntities.length, propagationPath.length);

        return this._createImpactResult(sourceEntityId, affectedEntities, impactLevel, riskScore, avgConfidence, propagationPath, {
            maxDepth: maxDepth,
            totalEdgesTraversed: edgeCount,
            riskExplanation: explanation
        });
    },

    /**
     * analyzeImpactChain(sourceEntityId, targetEntityId, maxDepth)
     * Finds specific impact paths between two entities.
     */
    analyzeImpactChain: function(sourceEntityId, targetEntityId, maxDepth) {
        maxDepth = maxDepth || 5;
        var kg = this._getKG();
        if (!kg) return this._createImpactResult(sourceEntityId, [], 'none', 0, 0, [], { error: 'KG not available' });

        var paths = kg.findPaths(sourceEntityId, targetEntityId, maxDepth);

        if (paths.length === 0) {
            return this._createImpactResult(sourceEntityId, [], 'none', 0, 0.3, [], {
                targetEntity: targetEntityId,
                message: 'No impact path found between ' + sourceEntityId + ' and ' + targetEntityId
            });
        }

        // Rate each path
        var ratedPaths = paths.map(function(path) {
            var totalConf = 0;
            for (var i = 0; i < path.length; i++) {
                totalConf += path[i].confidence || 0.5;
            }
            var avgConf = path.length > 0 ? totalConf / path.length : 0;
            return {
                path: path,
                length: path.length,
                avgConfidence: avgConf,
                riskScore: Math.round(avgConf * 100)
            };
        });

        ratedPaths.sort(function(a, b) { return b.riskScore - a.riskScore; });

        var bestPath = ratedPaths[0];
        var impactLevel = bestPath.length <= 2 ? 'high' : bestPath.length <= 4 ? 'medium' : 'low';

        return this._createImpactResult(sourceEntityId, [{ entityId: targetEntityId, pathLength: bestPath.length }], impactLevel, bestPath.riskScore, bestPath.avgConfidence, bestPath.path, {
            targetEntity: targetEntityId,
            totalPaths: paths.length,
            shortestPath: bestPath.length,
            allPaths: ratedPaths.slice(0, 3)
        });
    },

    // ============================================================
    // IMPACT LEVEL & RISK CALCULATION (Chapter 45 + 48)
    // ============================================================

    _calculateImpactLevel: function(affectedEntities, maxDepth) {
        if (affectedEntities.length === 0) return 'none';

        var maxDepthReached = 0;
        var highConfCount = 0;

        for (var i = 0; i < affectedEntities.length; i++) {
            if (affectedEntities[i].depth > maxDepthReached) maxDepthReached = affectedEntities[i].depth;
            if (affectedEntities[i].confidence >= 0.8) highConfCount++;
        }

        // Weight: count × depth × confidence
        var score = affectedEntities.length * 10 + maxDepthReached * 15 + highConfCount * 10;

        if (score >= 80) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 25) return 'medium';
        if (score >= 10) return 'low';
        return 'none';
    },

    _calculateRiskScore: function(affectedEntities, avgConfidence, totalSteps) {
        if (affectedEntities.length === 0) return 0;

        // Risk = f(count, avgConfidence, propagationDepth)
        var countFactor = Math.min(affectedEntities.length * 8, 40);
        var confFactor = avgConfidence * 40;
        var depthFactor = Math.min(totalSteps * 5, 20);

        return Math.round(countFactor + confFactor + depthFactor);
    },

    _explainRisk: function(riskScore, impactLevel, affectedCount, totalSteps) {
        var parts = [];
        parts.push('Risk Score: ' + riskScore + '/100');
        parts.push('Impact Level: ' + impactLevel);
        parts.push('Affected Entities: ' + affectedCount);
        parts.push('Propagation Steps: ' + totalSteps);

        if (riskScore >= 70) {
            parts.push('Explanation: High risk due to large blast radius and/or deep propagation chains.');
        } else if (riskScore >= 40) {
            parts.push('Explanation: Moderate risk — impact contained but notable.');
        } else if (riskScore > 0) {
            parts.push('Explanation: Low risk — limited impact scope.');
        } else {
            parts.push('Explanation: No detectable impact.');
        }

        return parts.join(' | ');
    },

    // ============================================================
    // DEPENDENCY TRAVERSAL
    // ============================================================

    /**
     * getAffectedEntities(sourceEntityId, depth)
     * Simple list of all entities affected by source.
     */
    getAffectedEntities: function(sourceEntityId, depth) {
        var result = this.analyzeImpact(sourceEntityId, depth || 3);
        return result.affectedEntities || [];
    },

    /**
     * getImpactSummary(sourceEntityId)
     * Quick summary without full traversal.
     */
    getImpactSummary: function(sourceEntityId) {
        var result = this.analyzeImpact(sourceEntityId, 2);
        return {
            sourceEntity: result.sourceEntity,
            impactLevel: result.impactLevel,
            riskScore: result.riskScore,
            directlyAffected: result.affectedEntities.filter(function(e) { return e.depth === 1; }).length,
            indirectlyAffected: result.affectedEntities.filter(function(e) { return e.depth > 1; }).length,
            totalAffected: result.affectedCount
        };
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getOutgoing: function(entityId) {
        var edges = [];
        var relEngine = this._getRelEngine();
        var kg = this._getKG();

        if (relEngine) {
            var rels = relEngine.getBySource(entityId);
            edges = edges.concat(rels);
        }
        if (kg) {
            var kgEdges = kg.getOutgoingEdges(entityId);
            edges = edges.concat(kgEdges);
        }

        // Deduplicate
        var seen = {};
        var unique = [];
        for (var i = 0; i < edges.length; i++) {
            var key = (edges[i].sourceEntity || edges[i].source) + '→' + (edges[i].targetEntity || edges[i].target) + ':' + (edges[i].type || edges[i].relationship);
            if (!seen[key]) {
                seen[key] = true;
                unique.push(edges[i]);
            }
        }
        return unique;
    },

    _getRelEngine: function() {
        return LawAIApp.RuntimeRelationshipEngine || null;
    },

    _getKG: function() {
        return LawAIApp.RuntimeKnowledgeGraph || null;
    },

    // ============================================================
    // HISTORY
    // ============================================================

    getAnalyses: function(limit) {
        limit = limit || 20;
        return this._analyses.slice(-limit).reverse();
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
            relEngineAvailable: !!this._getRelEngine(),
            kgAvailable: !!this._getKG()
        };
    }
};

// ── Auto-init ──
LawAIApp.ImpactAnalysisEngine.init();

console.log('🧠 Impact Analysis Engine — Part 47.5 Complete');
console.log('   ✅ Impact Propagation: BFS traversal with depth limit + visited guard');
console.log('   ✅ Impact Chain: findPaths between two entities');
console.log('   ✅ Risk Score: count × confidence × depth with explanation');
console.log('   ✅ Impact Levels: Critical > High > Medium > Low > None');
console.log('   ✅ Rules: read-only, infinite-loop-safe, path-tracked, risk-explained');
console.log('   ✅ Ready for Part 47.6 — AI Knowledge Integration');
