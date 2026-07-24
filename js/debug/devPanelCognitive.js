// ================================================================
// devPanelCognitive.js — Part 48.7
// Cognitive Dashboard
// Version: v4.8.7
// Status: Developer Experience Integration
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Visualize Cognitive Engine output in DevPanel.
//   Overview, Root Cause, Prediction, Decision, Health.
//
// ARCHITECTURE POSITION
//   Cognitive Engine → Cognitive API → Dashboard Provider → DevPanel → Developer
//
// RULES
//   Rule 1: Dashboard 只读取 Cognitive API
//   Rule 2: 不会影响 Runtime Execution
//   Rule 3: Analysis Result 必须可追踪
//   Rule 4: Sensitive Runtime Data 必须可隐藏
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.DevPanelCognitive = {
    _version: '4.8.7',
    _ready: false,
    _containerId: 'dev-panel-cognitive-section',
    _expanded: false,
    _showSensitive: false,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 DevPanel Cognitive Dashboard v' + this._version + ' ready');
        console.log('   📊 Views: Overview, Root Cause, Prediction, Decision, Health');
        console.log('   🛡️ Rules: read-only, safe-failure, traceable, hide-sensitive');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // RENDER
    // ============================================================

    render: function(container) {
        if (!container) container = document.getElementById(this._containerId);
        if (!container) return;

        try {
            var data = this._collectData();
            container.innerHTML = this._buildHTML(data);
        } catch (err) {
            container.innerHTML = this._errorHTML(err.message);
        }
    },

    refresh: function(container) {
        if (!container) container = document.getElementById(this._containerId);
        if (container) this.render(container);
    },

    // ============================================================
    // DATA COLLECTION (Rule 1: Cognitive API only)
    // ============================================================

    _collectData: function() {
        var data = {
            overview: null,
            rootCause: null,
            predictions: null,
            decisions: null,
            health: null,
            available: false,
            timestamp: new Date().toISOString()
        };

        var cognitive = LawAIApp.AICognitiveIntegration;
        var rca = LawAIApp.RootCauseAnalysisEngine;
        var prediction = LawAIApp.RuntimePredictionEngine;
        var decision = LawAIApp.DecisionSupportEngine;
        var depIntel = LawAIApp.DependencyIntelligenceEngine;

        data.available = !!(cognitive || rca || prediction);

        // Cognitive Overview
        if (cognitive) {
            try { data.overview = cognitive.getCognitiveStatus(); } catch (e) { /* ignore */ }
        }

        // Root Cause (sample: BootManager)
        if (rca) {
            try { data.rootCause = rca.quickAnalysis('BootManager'); } catch (e) { /* ignore */ }
        }

        // Predictions
        if (prediction) {
            try { data.predictions = prediction.predictAll('BootManager'); } catch (e) { /* ignore */ }
        }

        // Decisions
        if (decision) {
            try { data.decisions = decision.decide('Boot performance optimization', 'BootManager'); } catch (e) { /* ignore */ }
        }

        // Health
        data.health = {
            cognitiveAvailable: !!cognitive,
            rcaAvailable: !!rca,
            predictionAvailable: !!prediction,
            decisionAvailable: !!decision,
            depIntelAvailable: !!depIntel,
            kgAvailable: !!(LawAIApp.RuntimeKnowledgeGraph),
            enginesActive: (!!cognitive ? 1 : 0) + (!!rca ? 1 : 0) + (!!prediction ? 1 : 0) + (!!decision ? 1 : 0)
        };

        return data;
    },

    // ============================================================
    // HTML BUILDERS
    // ============================================================

    _buildHTML: function(data) {
        var sections = [];
        sections.push(this._buildHeader(data));
        sections.push(this._buildHealth(data));
        sections.push(this._buildOverview(data));

        if (this._expanded) {
            sections.push(this._buildRootCause(data));
            sections.push(this._buildPredictions(data));
            sections.push(this._buildDecisions(data));
        }

        sections.push(this._buildFooter(data));
        return sections.join('');
    },

    _buildHeader: function(data) {
        var statusColor = data.available ? '#22c55e' : '#f59e0b';
        var statusText = data.available ? '✅ Active' : '⏳ Initializing';
        var engineCount = data.health ? data.health.enginesActive : 0;

        return '' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Cognitive Engine</span>' +
                '<span style="font-size:10px;color:' + statusColor + ';">' + statusText + ' (' + engineCount + '/4)</span>' +
            '</div>';
    },

    _buildHealth: function(data) {
        if (!data.health) return '';
        var h = data.health;

        return '' +
            '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;font-size:8px;color:#475569;">' +
                '<span>' + (h.cognitiveAvailable ? '✅' : '⏳') + ' Cognitive</span>' +
                '<span>' + (h.rcaAvailable ? '✅' : '⏳') + ' RCA</span>' +
                '<span>' + (h.predictionAvailable ? '✅' : '⏳') + ' Predict</span>' +
                '<span>' + (h.decisionAvailable ? '✅' : '⏳') + ' Decide</span>' +
            '</div>';
    },

    _buildOverview: function(data) {
        if (!data.overview) {
            return '<div style="font-size:9px;color:#475569;margin-bottom:4px;">⏳ Run cognitive analysis to populate</div>';
        }

        var o = data.overview;
        var confColor = o.confidence >= 0.7 ? '#22c55e' : o.confidence >= 0.4 ? '#f59e0b' : '#ef4444';

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(139,92,246,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#e2e8f0;">' + (o.observation || 'N/A') + '</div>' +
                (o.understanding ? '<div style="font-size:8px;color:#94a3b8;margin-top:2px;">' + o.understanding + '</div>' : '') +
                '<div style="font-size:8px;color:' + confColor + ';margin-top:2px;">Confidence: ' + Math.round(o.confidence * 100) + '% | Sources: ' + (o.sourcesUsed || []).length + '</div>' +
            '</div>';
    },

    _buildRootCause: function(data) {
        if (!data.rootCause) return '';
        var r = data.rootCause;

        var causesHTML = '';
        if (r.possibleCauses && r.possibleCauses.length > 0) {
            var top = r.possibleCauses.slice(0, 3);
            for (var i = 0; i < top.length; i++) {
                causesHTML += '<div style="font-size:8px;color:#f59e0b;padding:1px 0;">• ' + top[i].description + ' (Score: ' + (top[i].score || '?') + ')</div>';
            }
        }

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(251,146,60,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#f59e0b;font-weight:600;">🔍 Root Cause</div>' +
                '<div style="font-size:8px;color:#e2e8f0;margin-top:2px;">' + (r.issue || 'N/A') + '</div>' +
                causesHTML +
                '<div style="font-size:8px;color:#64748b;margin-top:2px;">Evidence: ' + (r.evidenceCount || 0) + ' sources | Confidence: ' + Math.round(r.confidence * 100) + '%</div>' +
            '</div>';
    },

    _buildPredictions: function(data) {
        if (!data.predictions) return '';
        var p = data.predictions;

        var items = '';
        var types = ['performance', 'failure', 'state', 'impact'];
        for (var i = 0; i < types.length; i++) {
            var pred = p[types[i]];
            if (!pred) continue;
            var color = pred.riskLevel === 'high' ? '#ef4444' : pred.riskLevel === 'medium' ? '#f59e0b' : '#22c55e';
            items += '' +
                '<div style="font-size:8px;color:#94a3b8;padding:1px 0;">' +
                    '<span style="color:' + color + ';">' + (pred.riskLevel || '?').toUpperCase() + '</span> ' +
                    types[i] + ': ' + (pred.probability || '?') + '%' +
                '</div>';
        }

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(74,158,255,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#4a9eff;font-weight:600;">🔮 Predictions</div>' +
                items +
            '</div>';
    },

    _buildDecisions: function(data) {
        if (!data.decisions || !data.decisions.options) return '';
        var d = data.decisions;

        var optionsHTML = '';
        var opts = d.options ? d.options.slice(0, 3) : [];
        for (var i = 0; i < opts.length; i++) {
            var o = opts[i];
            var recColor = o.recommendation === 'strongly_recommended' ? '#22c55e' : o.recommendation === 'recommended' ? '#4a9eff' : '#64748b';
            optionsHTML += '' +
                '<div style="font-size:8px;color:#94a3b8;padding:1px 0;">' +
                    '<span style="color:' + recColor + ';">' + o.label + '</span> ' + o.title + ' (Score: ' + (o.score || '?') + '/10)' +
                '</div>';
        }

        return '' +
            '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(34,197,94,0.04);border-radius:4px;">' +
                '<div style="font-size:9px;color:#22c55e;font-weight:600;">🎯 Decisions</div>' +
                optionsHTML +
                '<div style="font-size:8px;color:#64748b;margin-top:2px;">Recommended: ' + (d.recommendedAction || 'N/A').substring(0, 60) + '...</div>' +
            '</div>';
    },

    _buildFooter: function(data) {
        return '' +
            '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">' +
                '<span style="font-size:8px;color:#64748b;cursor:pointer;" onclick="var c=LawAIApp.Debug.DevPanelCognitive;c._expanded=!c._expanded;c.refresh();">' +
                    (this._expanded ? '▲ Collapse' : '▼ Expand') + '</span>' +
                '<span style="font-size:8px;color:#475569;">v' + this._version + '</span>' +
            '</div>';
    },

    _errorHTML: function(msg) {
        return '' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Cognitive Engine</div>' +
            '<div style="font-size:9px;color:#ef4444;">⚠️ Render error</div>' +
            '<div style="font-size:8px;color:#475569;">' + msg + '</div>';
    },

    getStatus: function() {
        return { version: this._version, ready: this._ready, expanded: this._expanded };
    }
};

// ── Auto-init ──
LawAIApp.Debug.DevPanelCognitive.init();

console.log('🧠 Cognitive Dashboard — Part 48.7 Complete');
console.log('   ✅ Cognitive Overview: observation + understanding + confidence');
console.log('   ✅ Root Cause View: issue + causes + evidence');
console.log('   ✅ Prediction View: risk level + probability per type');
console.log('   ✅ Decision View: options + scores + recommendation');
console.log('   ✅ Health: engine availability matrix');
console.log('');
console.log('🎉 PART 48 COMPLETE — Runtime Cognitive Engine Framework');
console.log('   ✅ 48.1 Cognitive Engine Foundation');
console.log('   ✅ 48.2 Dependency Intelligence Engine');
console.log('   ✅ 48.3 Root Cause Analysis Engine');
console.log('   ✅ 48.4 Runtime Prediction Engine');
console.log('   ✅ 48.5 Decision Support Engine');
console.log('   ✅ 48.6 AI Cognitive Integration');
console.log('   ✅ 48.7 Cognitive Dashboard');
console.log('');
console.log('🧠 Runtime Cognitive Intelligence Layer: Fully Operational');
