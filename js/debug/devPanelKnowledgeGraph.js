// ================================================================
// devPanelKnowledgeGraph.js — Part 47.7
// Knowledge Graph Dashboard & DevPanel
// Version: v4.7.7
// Status: Developer Experience Integration
// Layer: Runtime Knowledge Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Visualize Knowledge Graph in DevPanel.
//   Entity Overview, Relationship Map, Graph Health, Impact Analysis.
//
// ARCHITECTURE POSITION
//   Knowledge Graph → Graph API → Dashboard Provider → DevPanel → Developer
//
// DASHBOARD DATA MODEL
//   { entities, relationships, graphStats, impactResults, insights, timestamp }
//
// RULES
//   Rule 1: Dashboard 只读取 Graph API
//   Rule 2: 禁止直接修改 Knowledge Graph
//   Rule 3: Visualization Failure 不得影响 Runtime
//   Rule 4: Debug Data 必须可关闭
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.DevPanelKnowledgeGraph = {
    _version: '4.7.7',
    _ready: false,
    _containerId: 'dev-panel-kg-section',
    _expanded: false,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 DevPanel Knowledge Graph v' + this._version + ' ready');
        console.log('   📊 Views: Entity, Relationship, Impact, Health');
        console.log('   🛡️ Rules: read-only, safe-failure, closeable');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // RENDER (called by DevPanel)
    // ============================================================

    render: function(container) {
        if (!container) {
            container = document.getElementById(this._containerId);
        }
        if (!container) return;

        try {
            var data = this._collectData();
            container.innerHTML = this._buildHTML(data);
        } catch (err) {
            // Rule 3: failure doesn't affect Runtime
            container.innerHTML = this._errorHTML(err.message);
        }
    },

    refresh: function(container) {
        if (!container) {
            container = document.getElementById(this._containerId);
        }
        if (container) this.render(container);
    },

    // ============================================================
    // DATA COLLECTION (Rule 1: read Graph API only)
    // ============================================================

    _collectData: function() {
        var data = {
            entities: [],
            relationships: [],
            graphStats: null,
            impactResults: null,
            health: null,
            insights: [],
            available: false,
            timestamp: new Date().toISOString()
        };

        var kg = LawAIApp.RuntimeKnowledgeGraph;
        var registry = LawAIApp.RuntimeEntityRegistry;
        var relEngine = LawAIApp.RuntimeRelationshipEngine;
        var analyzer = LawAIApp.KnowledgeGraphAnalyzer;
        var impactEngine = LawAIApp.ImpactAnalysisEngine;
        var integration = LawAIApp.AIKnowledgeIntegration;

        data.available = !!(kg || registry);

        // Entities
        if (registry) {
            data.entities = registry.getActive().slice(0, 30);
        } else if (kg) {
            data.entities = kg.getAllNodes().slice(0, 30).map(function(n) {
                return { entityId: n.id, type: n.type, name: (n.metadata && n.metadata.name) || n.id, status: 'active' };
            });
        }

        // Relationships
        if (relEngine) {
            data.relationships = relEngine.getActive().slice(0, 20);
        } else if (kg) {
            data.relationships = kg.getAllEdges().slice(0, 20).map(function(e) {
                return {
                    sourceEntity: e.source, targetEntity: e.target,
                    type: e.relationship, confidence: e.confidence, status: 'active'
                };
            });
        }

        // Graph Stats
        data.graphStats = {
            totalEntities: data.entities.length,
            totalRelationships: data.relationships.length,
            kgNodes: kg ? kg.getNodeCount() : 0,
            kgEdges: kg ? kg.getEdgeCount() : 0,
            registeredEntities: registry ? registry.getEntityCount() : 0,
            activeRelationships: relEngine ? relEngine.getActive().length : 0
        };

        // Health
        if (analyzer) {
            try { data.health = analyzer.analyzeHealth(); } catch (e) { /* ignore */ }
        }

        // Impact (sample: BootManager)
        if (impactEngine) {
            try { data.impactResults = impactEngine.getImpactSummary('BootManager'); } catch (e) { /* ignore */ }
        }

        // Insights
        if (data.health && data.health.details) {
            var issues = data.health.details.issues || [];
            for (var i = 0; i < issues.length; i++) {
                data.insights.push({
                    type: issues[i].type,
                    message: issues[i].count + ' ' + issues[i].type + (issues[i].severity ? ' (' + issues[i].severity + ')' : '')
                });
            }
        }
        if (data.graphStats.kgNodes === 0 && data.graphStats.registeredEntities === 0) {
            data.insights.push({ type: 'warning', message: 'Knowledge Graph is empty. Load Part 47 modules.' });
        }

        return data;
    },

    // ============================================================
    // HTML BUILDERS
    // ============================================================

    _buildHTML: function(data) {
        var sections = [];

        sections.push(this._buildHeader(data));
        sections.push(this._buildStats(data));
        sections.push(this._buildHealth(data));
        sections.push(this._buildImpact(data));

        if (this._expanded) {
            sections.push(this._buildEntities(data));
            sections.push(this._buildRelationships(data));
        }

        sections.push(this._buildFooter(data));

        return sections.join('');
    },

    _buildHeader: function(data) {
        var statusColor = data.available ? '#22c55e' : '#f59e0b';
        var statusText = data.available ? '✅ Active' : '⏳ No Data';

        return '' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Knowledge Graph</span>' +
                '<span style="font-size:10px;color:' + statusColor + ';">' + statusText + '</span>' +
            '</div>';
    },

    _buildStats: function(data) {
        var s = data.graphStats;
        return '' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;font-size:9px;color:#64748b;">' +
                '<span>📦 Entities: ' + Math.max(s.totalEntities, s.kgNodes, s.registeredEntities) + '</span>' +
                '<span>🔗 Relations: ' + Math.max(s.totalRelationships, s.kgEdges, s.activeRelationships) + '</span>' +
            '</div>';
    },

    _buildHealth: function(data) {
        if (!data.health) {
            return '<div style="font-size:9px;color:#475569;margin-bottom:4px;">⏳ Health: Not analyzed</div>';
        }

        var h = data.health;
        var scoreColor = (h.details && h.details.healthScore >= 80) ? '#22c55e' :
                         (h.details && h.details.healthScore >= 50) ? '#f59e0b' : '#ef4444';
        var score = h.details ? h.details.healthScore : 0;

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(139,92,246,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#e2e8f0;">Graph Health: <span style="color:' + scoreColor + ';">' + score + '%</span></div>' +
                (data.insights.length > 0 ? 
                    '<div style="font-size:8px;color:#f59e0b;margin-top:2px;">' + data.insights[0].message + '</div>' : '') +
            '</div>';
    },

    _buildImpact: function(data) {
        if (!data.impactResults) return '';

        var i = data.impactResults;
        var levelColor = i.impactLevel === 'high' ? '#ef4444' : i.impactLevel === 'medium' ? '#f59e0b' : '#22c55e';

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(251,146,60,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#e2e8f0;">💥 Impact (BootManager): ' +
                    '<span style="color:' + levelColor + ';">' + (i.impactLevel || 'none').toUpperCase() + '</span> ' +
                    'Risk: ' + (i.riskScore || 0) + '%</div>' +
                '<div style="font-size:8px;color:#475569;">Affected: ' + (i.totalAffected || 0) + ' entities</div>' +
            '</div>';
    },

    _buildEntities: function(data) {
        if (!data.entities || data.entities.length === 0) return '';

        var rows = '';
        var max = Math.min(data.entities.length, 6);
        for (var i = 0; i < max; i++) {
            var e = data.entities[i];
            var typeColor = e.type === 'ai' ? '#8b5cf6' : e.type === 'runtime' ? '#4a9eff' : e.type === 'module' ? '#22c55e' : '#64748b';
            rows += '' +
                '<div style="font-size:8px;color:#94a3b8;padding:2px 0;display:flex;justify-content:space-between;">' +
                    '<span>' + (e.entityId || e.id || '?') + '</span>' +
                    '<span style="color:' + typeColor + ';">' + (e.type || '?') + '</span>' +
                '</div>';
        }
        if (data.entities.length > max) {
            rows += '<div style="font-size:8px;color:#475569;">+ ' + (data.entities.length - max) + ' more...</div>';
        }

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(255,255,255,0.02);border-radius:4px;">' +
                '<div style="font-size:9px;color:#64748b;font-weight:600;margin-bottom:2px;">📦 Entities</div>' +
                rows +
            '</div>';
    },

    _buildRelationships: function(data) {
        if (!data.relationships || data.relationships.length === 0) return '';

        var rows = '';
        var max = Math.min(data.relationships.length, 4);
        for (var i = 0; i < max; i++) {
            var r = data.relationships[i];
            rows += '' +
                '<div style="font-size:8px;color:#475569;padding:1px 0;">' +
                    (r.sourceEntity || r.source || '?') + ' <span style="color:#f59e0b;">→</span> ' + (r.targetEntity || r.target || '?') +
                    ' <span style="color:#64748b;">(' + (r.type || r.relationship || '?') + ')</span>' +
                '</div>';
        }
        if (data.relationships.length > max) {
            rows += '<div style="font-size:8px;color:#475569;">+ ' + (data.relationships.length - max) + ' more...</div>';
        }

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(255,255,255,0.02);border-radius:4px;">' +
                '<div style="font-size:9px;color:#64748b;font-weight:600;margin-bottom:2px;">🔗 Relationships</div>' +
                rows +
            '</div>';
    },

    _buildFooter: function(data) {
        return '' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">' +
                '<span style="font-size:8px;color:#64748b;cursor:pointer;" onclick="var kg=LawAIApp.Debug.DevPanelKnowledgeGraph;kg._expanded=!kg._expanded;kg.refresh();">' +
                    (this._expanded ? '▲ Collapse' : '▼ Expand') + '</span>' +
                '<span style="font-size:8px;color:#475569;">v' + this._version + '</span>' +
            '</div>';
    },

    _errorHTML: function(msg) {
        return '' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Knowledge Graph</div>' +
            '<div style="font-size:9px;color:#ef4444;">⚠️ Render error</div>' +
            '<div style="font-size:8px;color:#475569;">' + msg + '</div>';
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            expanded: this._expanded
        };
    }
};

// ── Auto-init ──
LawAIApp.Debug.DevPanelKnowledgeGraph.init();

console.log('🧠 Knowledge Graph Dashboard — Part 47.7 Complete');
console.log('   ✅ Entity View: type + status + count');
console.log('   ✅ Relationship View: source → type → target');
console.log('   ✅ Impact View: risk level + affected count');
console.log('   ✅ Graph Health: score + insights');
console.log('   ✅ Expand/Collapse toggle');
console.log('');
console.log('🎉 PART 47 COMPLETE — Runtime Knowledge Graph Framework');
console.log('   ✅ 47.1 Knowledge Graph Foundation');
console.log('   ✅ 47.2 Runtime Entity Registry');
console.log('   ✅ 47.3 Runtime Relationship Engine');
console.log('   ✅ 47.4 Knowledge Graph Analyzer');
console.log('   ✅ 47.5 Impact Analysis Engine');
console.log('   ✅ 47.6 AI Knowledge Integration');
console.log('   ✅ 47.7 Knowledge Graph Dashboard & DevPanel');
console.log('');
console.log('🧠 Runtime Knowledge Intelligence Layer: Fully Operational');
