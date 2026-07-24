// ================================================================
// runtimeKnowledgeGraph.js — Part 47.1
// Knowledge Graph Foundation
// Version: v4.7.1
// Status: Architecture Foundation
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Upgrade Runtime Information from isolated data to a connected
//   knowledge network. Entities + Relationships + Context.
//
// ARCHITECTURE POSITION
//   Runtime Data → Knowledge Graph Layer → AI Knowledge Understanding → Reasoning
//
// GRAPH ELEMENTS
//   Node:  { id, type, metadata }
//   Edge:  { source, target, relationship, confidence }
//
// RELATIONSHIP TYPES
//   depends_on, affects, causes, belongs_to, triggers, influences
//
// RULES
//   Rule 1: Knowledge Graph 只描述关系
//   Rule 2: 不直接修改 Runtime State
//   Rule 3: Relationship 必须有来源
//   Rule 4: Unknown Relationship 必须标记
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeKnowledgeGraph = {
    _version: '4.7.1',
    _ready: false,
    _nodes: {},
    _edges: [],
    _edgeCount: 0,
    _relationshipTypes: ['depends_on', 'affects', 'causes', 'belongs_to', 'triggers', 'influences'],

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        this._initBuiltinNodes();
        this._initBuiltinEdges();
        console.log('🧠 Runtime Knowledge Graph v' + this._version + ' ready');
        console.log('   📊 Nodes: ' + Object.keys(this._nodes).length);
        console.log('   🔗 Edges: ' + this._edgeCount);
        console.log('   🔄 Relationships: ' + this._relationshipTypes.join(', '));
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 6: KNOWLEDGE MODEL — Nodes
    // ============================================================

    /**
     * addNode(id, type, metadata)
     * Registers a Knowledge Node in the graph.
     * @param {string} id — unique node identifier
     * @param {string} type — 'module' | 'event' | 'state' | 'metric' | 'system'
     * @param {Object} metadata — extra context
     * @returns {Object} the node
     */
    addNode: function(id, type, metadata) {
        if (!id || !type) {
            console.warn('[KnowledgeGraph] addNode requires id and type');
            return null;
        }

        if (this._nodes[id]) {
            // Update metadata if node already exists
            if (metadata) {
                for (var key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        this._nodes[id].metadata[key] = metadata[key];
                    }
                }
            }
            return this._nodes[id];
        }

        var node = {
            id: id,
            type: type,
            metadata: metadata || {},
            createdAt: new Date().toISOString()
        };

        this._nodes[id] = node;
        return node;
    },

    /**
     * getNode(id)
     * Returns a node by id.
     */
    getNode: function(id) {
        return this._nodes[id] || null;
    },

    /**
     * getNodesByType(type)
     * Returns all nodes of a given type.
     */
    getNodesByType: function(type) {
        var result = [];
        for (var id in this._nodes) {
            if (this._nodes.hasOwnProperty(id) && this._nodes[id].type === type) {
                result.push(this._nodes[id]);
            }
        }
        return result;
    },

    /**
     * getAllNodes()
     * Returns all nodes.
     */
    getAllNodes: function() {
        var result = [];
        for (var id in this._nodes) {
            if (this._nodes.hasOwnProperty(id)) {
                result.push(this._nodes[id]);
            }
        }
        return result;
    },

    getNodeCount: function() {
        return Object.keys(this._nodes).length;
    },

    // ============================================================
    // CHAPTER 6: KNOWLEDGE MODEL — Edges
    // ============================================================

    /**
     * addEdge(sourceId, targetId, relationship, confidence, metadata)
     * Creates a directed relationship between two nodes.
     * @param {string} sourceId — source node id
     * @param {string} targetId — target node id
     * @param {string} relationship — 'depends_on' | 'affects' | 'causes' | 'belongs_to' | 'triggers' | 'influences'
     * @param {number} confidence — 0.0 to 1.0
     * @param {Object} metadata — extra context (Rule 3: must include source of this knowledge)
     */
    addEdge: function(sourceId, targetId, relationship, confidence, metadata) {
        if (!sourceId || !targetId || !relationship) {
            console.warn('[KnowledgeGraph] addEdge requires source, target, and relationship');
            return null;
        }

        // Validate relationship type
        if (this._relationshipTypes.indexOf(relationship) === -1) {
            console.warn('[KnowledgeGraph] Unknown relationship type: ' + relationship + ' (Rule 4: flagged)');
            metadata = metadata || {};
            metadata._unknownRelationship = true;
        }

        // Ensure nodes exist (auto-create if missing)
        if (!this._nodes[sourceId]) {
            this.addNode(sourceId, 'unknown', { autoCreated: true });
        }
        if (!this._nodes[targetId]) {
            this.addNode(targetId, 'unknown', { autoCreated: true });
        }

        confidence = Math.max(0, Math.min(1, confidence || 0.5));

        var edge = {
            id: 'e_' + (++this._edgeCount) + '_' + Date.now(),
            source: sourceId,
            target: targetId,
            relationship: relationship,
            confidence: confidence,
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            metadata: metadata || {},
            createdAt: new Date().toISOString()
        };

        this._edges.push(edge);
        return edge;
    },

    /**
     * getEdges(sourceId, relationship)
     * Query edges. If sourceId is null, returns all edges.
     */
    getEdges: function(sourceId, relationship) {
        return this._edges.filter(function(e) {
            var sourceMatch = !sourceId || e.source === sourceId;
            var relMatch = !relationship || e.relationship === relationship;
            return sourceMatch && relMatch;
        });
    },

    /**
     * getOutgoingEdges(nodeId)
     * Returns all edges where nodeId is the source.
     */
    getOutgoingEdges: function(nodeId) {
        return this._edges.filter(function(e) { return e.source === nodeId; });
    },

    /**
     * getIncomingEdges(nodeId)
     * Returns all edges where nodeId is the target.
     */
    getIncomingEdges: function(nodeId) {
        return this._edges.filter(function(e) { return e.target === nodeId; });
    },

    /**
     * getRelatedNodes(nodeId, depth)
     * Returns all nodes connected to nodeId within given depth.
     * depth=1: direct neighbors, depth=2: neighbors of neighbors, etc.
     */
    getRelatedNodes: function(nodeId, depth) {
        depth = depth || 1;
        var visited = {};
        var queue = [{ id: nodeId, level: 0 }];
        var related = [];

        visited[nodeId] = true;

        while (queue.length > 0) {
            var current = queue.shift();
            if (current.level > 0) {
                related.push(this._nodes[current.id] || { id: current.id });
            }
            if (current.level >= depth) continue;

            var outgoing = this.getOutgoingEdges(current.id);
            var incoming = this.getIncomingEdges(current.id);

            for (var i = 0; i < outgoing.length; i++) {
                var target = outgoing[i].target;
                if (!visited[target]) {
                    visited[target] = true;
                    queue.push({ id: target, level: current.level + 1 });
                }
            }
            for (var i = 0; i < incoming.length; i++) {
                var source = incoming[i].source;
                if (!visited[source]) {
                    visited[source] = true;
                    queue.push({ id: source, level: current.level + 1 });
                }
            }
        }

        return related;
    },

    getAllEdges: function() {
        return this._edges.slice();
    },

    getEdgeCount: function() {
        return this._edges.length;
    },

    // ============================================================
    // QUERY & INSIGHT
    // ============================================================

    /**
     * query(startNodeId, relationship)
     * Simple graph traversal starting from a node.
     * @returns {Array} matching edges with node data
     */
    query: function(startNodeId, relationship) {
        var edges = this.getEdges(startNodeId, relationship);
        var result = [];

        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            result.push({
                edge: e,
                sourceNode: this._nodes[e.source] || { id: e.source },
                targetNode: this._nodes[e.target] || { id: e.target }
            });
        }

        return result;
    },

    /**
     * getImpactAnalysis(nodeId)
     * What does this node affect? (outgoing edges with 'affects' or 'causes')
     */
    getImpactAnalysis: function(nodeId) {
        var affects = this.getEdges(nodeId, 'affects');
        var causes = this.getEdges(nodeId, 'causes');
        var all = affects.concat(causes);

        return {
            node: this._nodes[nodeId] || { id: nodeId },
            impacts: all.map(function(e) {
                return {
                    target: e.target,
                    relationship: e.relationship,
                    confidence: e.confidence,
                    targetNode: this._nodes[e.target] || { id: e.target }
                };
            }.bind(this)),
            totalImpacts: all.length
        };
    },

    /**
     * getDependencyChain(nodeId)
     * What does this node depend on? (outgoing 'depends_on' edges)
     */
    getDependencyChain: function(nodeId) {
        var deps = this.getEdges(nodeId, 'depends_on');

        return {
            node: this._nodes[nodeId] || { id: nodeId },
            dependencies: deps.map(function(e) {
                return {
                    target: e.target,
                    confidence: e.confidence,
                    targetNode: this._nodes[e.target] || { id: e.target }
                };
            }.bind(this)),
            totalDependencies: deps.length
        };
    },

    /**
     * findPaths(sourceId, targetId, maxDepth)
     * Finds all paths between two nodes up to maxDepth.
     */
    findPaths: function(sourceId, targetId, maxDepth) {
        maxDepth = maxDepth || 3;
        var paths = [];

        function dfs(currentId, visited, path) {
            if (path.length > maxDepth) return;
            if (currentId === targetId && path.length > 0) {
                paths.push(path.slice());
                return;
            }

            var outgoing = this.getOutgoingEdges(currentId);
            for (var i = 0; i < outgoing.length; i++) {
                var next = outgoing[i].target;
                if (visited.indexOf(next) === -1) {
                    dfs.call(this, next, visited.concat([next]), path.concat([outgoing[i]]));
                }
            }
        }

        dfs.call(this, sourceId, [sourceId], []);
        return paths;
    },

    // ============================================================
    // BUILT-IN KNOWLEDGE (Chapter 7: Example)
    // ============================================================

    _initBuiltinNodes: function() {
        // Core Runtime modules
        this.addNode('BootManager', 'module', {
            description: 'Coordinates boot sequence and delegates to BootPipeline',
            layer: 'runtime'
        });
        this.addNode('BootPipeline', 'module', {
            description: 'Executes boot stages in sequence',
            layer: 'runtime'
        });
        this.addNode('Performance', 'module', {
            description: 'Tracks execution metrics across modules',
            layer: 'runtime'
        });
        this.addNode('StateSyncEngine', 'module', {
            description: 'Manages runtime state synchronization',
            layer: 'runtime'
        });
        this.addNode('RuntimeEventCollector', 'module', {
            description: 'Records runtime events for intelligence',
            layer: 'runtime'
        });

        // AI Layer modules
        this.addNode('AIContextEngine', 'module', {
            description: 'Collects and normalizes runtime context',
            layer: 'ai'
        });
        this.addNode('AIRuntimeKnowledge', 'module', {
            description: 'Interprets runtime data into knowledge units',
            layer: 'ai'
        });
        this.addNode('AIReasoningEngine', 'module', {
            description: 'Analyzes and correlates runtime conditions',
            layer: 'ai'
        });
        this.addNode('AIRecommendationEngine', 'module', {
            description: 'Generates prioritized recommendations',
            layer: 'ai'
        });

        // Key states
        this.addNode('runtime.state', 'state', {
            description: 'Current runtime boot state',
            owner: 'Runtime'
        });
        this.addNode('module.state', 'state', {
            description: 'Module loading state',
            owner: 'Runtime'
        });
        this.addNode('BootTime', 'metric', {
            description: 'Total boot duration',
            unit: 'ms'
        });
        this.addNode('PipelineDuration', 'metric', {
            description: 'Pipeline execution duration',
            unit: 'ms'
        });
    },

    _initBuiltinEdges: function() {
        // Boot dependencies
        this.addEdge('BootManager', 'BootPipeline', 'depends_on', 0.95, {
            source: 'architecture',
            description: 'BootManager delegates execution to BootPipeline'
        });
        this.addEdge('BootManager', 'StateSyncEngine', 'depends_on', 0.85, {
            source: 'architecture',
            description: 'BootManager updates runtime state via StateSyncEngine'
        });
        this.addEdge('BootManager', 'Performance', 'depends_on', 0.8, {
            source: 'architecture',
            description: 'BootManager triggers performance tracking'
        });

        // AI dependencies
        this.addEdge('AIContextEngine', 'BootManager', 'depends_on', 0.9, {
            source: 'architecture',
            description: 'Context Engine reads runtime status from BootManager'
        });
        this.addEdge('AIContextEngine', 'StateSyncEngine', 'depends_on', 0.85, {
            source: 'architecture',
            description: 'Context Engine reads state from StateSyncEngine'
        });
        this.addEdge('AIContextEngine', 'Performance', 'depends_on', 0.8, {
            source: 'architecture',
            description: 'Context Engine reads performance data'
        });
        this.addEdge('AIRuntimeKnowledge', 'AIContextEngine', 'depends_on', 0.9, {
            source: 'architecture',
            description: 'Knowledge layer consumes context'
        });
        this.addEdge('AIReasoningEngine', 'AIRuntimeKnowledge', 'depends_on', 0.9, {
            source: 'architecture',
            description: 'Reasoning consumes knowledge units'
        });
        this.addEdge('AIRecommendationEngine', 'AIReasoningEngine', 'depends_on', 0.9, {
            source: 'architecture',
            description: 'Recommendations derived from reasoning'
        });

        // Performance affects
        this.addEdge('Performance', 'BootTime', 'affects', 0.85, {
            source: 'observation',
            description: 'Performance tracking records boot duration'
        });
        this.addEdge('Performance', 'BootManager', 'influences', 0.7, {
            source: 'observation',
            description: 'Performance data may influence boot optimization decisions'
        });

        // State relationships
        this.addEdge('runtime.state', 'BootManager', 'belongs_to', 0.9, {
            source: 'architecture',
            description: 'Runtime state is managed by BootManager'
        });
        this.addEdge('module.state', 'StateSyncEngine', 'belongs_to', 0.85, {
            source: 'architecture',
            description: 'Module state synchronized via StateSyncEngine'
        });

        // Event relationships
        this.addEdge('RuntimeEventCollector', 'runtime.state', 'triggers', 0.8, {
            source: 'architecture',
            description: 'Events trigger state updates'
        });
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            nodeCount: this.getNodeCount(),
            edgeCount: this.getEdgeCount(),
            relationshipTypes: this._relationshipTypes.slice()
        };
    }
};

// ── Auto-init ──
LawAIApp.RuntimeKnowledgeGraph.init();

console.log('🧠 Runtime Knowledge Graph — Part 47.1 Complete');
console.log('   ✅ Node Model: id + type + metadata');
console.log('   ✅ Edge Model: source + target + relationship + confidence');
console.log('   ✅ Relationships: depends_on, affects, causes, belongs_to, triggers, influences');
console.log('   ✅ Built-in: ' + LawAIApp.RuntimeKnowledgeGraph.getNodeCount() + ' nodes, ' + LawAIApp.RuntimeKnowledgeGraph.getEdgeCount() + ' edges');
console.log('   ✅ Rules: describe-only, read-only, evidence-backed, unknown-flagged');
console.log('   ✅ Ready for Part 47.2 — Runtime Entity Registry');
