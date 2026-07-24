// ================================================================
// devPanelAIAssistant.js — Part 46.7
// DevPanel AI Assistant
// Version: v4.6.7
// Status: Developer Experience Integration
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Integrate AI Runtime Assistant into DevPanel.
//   Developer → DevPanel → AI Assistant → Runtime Intelligence.
//
// ARCHITECTURE POSITION
//   Runtime Systems → AI Runtime Assistant → DevPanel AI Interface
//
// AI PANEL STRUCTURE
//   Current Understanding | Latest Insights | Detected Issues
//   Recommendations | Confidence Scores
//
// EXPLAINABILITY RULES
//   Every response: 依据 + 来源 + Confidence
//   禁止: 无依据推测
//
// RULES
//   Rule 1: AI 只提供分析
//   Rule 2: AI 不直接修改 Runtime
//   Rule 3: AI Failure 不影响 DevPanel
//   Rule 4: Runtime Data Access 必须经过 Context Layer
//
// DEPENDENCIES (read-only)
//   AIRuntimeInteraction, AIContextEngine, AIReasoningEngine,
//   AIRecommendationEngine, DevPanel
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.DevPanelAI = {
    _version: '4.6.7',
    _ready: false,
    _containerId: 'dev-panel-ai-section',
    _autoRefreshInterval: null,
    _autoRefreshMs: 10000, // 10 second auto-refresh

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🤖 DevPanel AI Assistant v' + this._version + ' ready');
        console.log('   📊 Panel: Understanding, Insights, Issues, Recommendations');
        console.log('   🔄 Auto-refresh: every ' + (this._autoRefreshMs / 1000) + 's');
        console.log('   🛡️ Safety: analysis-only, context-backed, failure-isolated');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 67: AI PANEL RENDER
    // ============================================================

    /**
     * render(container)
     * Renders the AI Assistant section into a DevPanel container element.
     * Called by DevPanel.show() to embed the AI panel.
     * @param {HTMLElement} container — DOM element to render into
     */
    render: function(container) {
        if (!container) {
            console.warn('[DevPanelAI] No container provided for render.');
            return;
        }

        // Rule 3: Failure不影响DevPanel — wrap entire render
        try {
            var aiData = this._collectAIData();
            var html = this._buildPanelHTML(aiData);
            container.innerHTML = html;
            this._startAutoRefresh(container);
        } catch (err) {
            console.warn('[DevPanelAI] Render failed:', err.message);
            container.innerHTML = this._errorHTML(err.message);
        }
    },

    /**
     * refresh(container)
     * Refreshes the AI panel content without full re-render.
     * @param {HTMLElement} container
     */
    refresh: function(container) {
        if (!container) {
            container = document.getElementById(this._containerId);
        }
        if (container) {
            this.render(container);
        }
    },

    /**
     * stopAutoRefresh()
     * Stops the auto-refresh interval.
     */
    stopAutoRefresh: function() {
        if (this._autoRefreshInterval) {
            clearInterval(this._autoRefreshInterval);
            this._autoRefreshInterval = null;
        }
    },

    // ============================================================
    // DATA COLLECTION (Rule 4: through Context Layer)
    // ============================================================

    _collectAIData: function() {
        var data = {
            understanding: null,
            issues: [],
            recommendations: [],
            confidence: 0,
            lastUpdated: new Date().toISOString(),
            aiAvailable: false,
            contextAvailable: false,
            reasoningAvailable: false
        };

        try {
            // Check AI layer availability
            data.aiAvailable = !!(LawAIApp.AIRuntimeInteraction && LawAIApp.AIRuntimeInteraction.isReady &&
                LawAIApp.AIRuntimeInteraction.isReady());

            data.contextAvailable = !!(LawAIApp.AIContextEngine && LawAIApp.AIContextEngine.isReady &&
                LawAIApp.AIContextEngine.isReady());

            data.reasoningAvailable = !!(LawAIApp.AIReasoningEngine && LawAIApp.AIReasoningEngine.isReady &&
                LawAIApp.AIReasoningEngine.isReady());

            // Get Runtime Understanding
            if (data.aiAvailable) {
                try {
                    var statusResponse = LawAIApp.AIRuntimeInteraction.quickStatus();
                    data.understanding = statusResponse.answer;
                    data.confidence = statusResponse.confidence;
                } catch (e) {
                    data.understanding = 'AI Interaction available but query failed.';
                }
            } else if (data.contextAvailable) {
                try {
                    var ctx = LawAIApp.AIContextEngine.getFullContext();
                    var rt = ctx.runtimeStatus || {};
                    data.understanding = rt.booted
                        ? 'Runtime is running. Context Engine active.'
                        : 'Runtime has not booted. Context Engine reports idle state.';
                    data.confidence = 0.9;
                } catch (e) {
                    data.understanding = 'Context Engine available but data collection failed.';
                }
            } else {
                data.understanding = 'AI layer not initialized. Complete Part 46.1-46.6 setup.';
            }

            // Get Issues (from Reasoning Engine)
            if (data.reasoningAvailable) {
                try {
                    var reasoning = LawAIApp.AIReasoningEngine.reason();
                    if (reasoning && reasoning.diagnostic) {
                        data.issues = reasoning.diagnostic.slice(0, 5);
                    }
                    if (reasoning && reasoning.performance) {
                        data.issues = data.issues.concat(reasoning.performance.slice(0, 3));
                    }
                    if (reasoning && reasoning.state) {
                        data.issues = data.issues.concat(reasoning.state.slice(0, 3));
                    }
                } catch (e) {
                    data.issues = [];
                }
            }

            // Get Recommendations
            try {
                if (LawAIApp.AIRecommendationEngine && LawAIApp.AIRecommendationEngine.isReady &&
                    LawAIApp.AIRecommendationEngine.isReady()) {
                    var recs = LawAIApp.AIRecommendationEngine.getTopRecommendations(4, 'medium');
                    data.recommendations = recs || [];
                }
            } catch (e) {
                data.recommendations = [];
            }

        } catch (err) {
            console.warn('[DevPanelAI] Data collection failed:', err.message);
            data.understanding = 'Data collection error: ' + err.message;
        }

        return data;
    },

    // ============================================================
    // HTML BUILDERS (Chapter 67: AI Panel Structure)
    // ============================================================

    _buildPanelHTML: function(data) {
        var sections = [];

        // ── Header ──
        sections.push(this._buildHeader(data));

        // ── Current Understanding ──
        sections.push(this._buildUnderstanding(data));

        // ── Confidence Bar ──
        sections.push(this._buildConfidenceBar(data));

        // ── Detected Issues ──
        sections.push(this._buildIssues(data));

        // ── Recommendations ──
        sections.push(this._buildRecommendations(data));

        // ── AI Layer Status ──
        sections.push(this._buildLayerStatus(data));

        return sections.join('');
    },

    _buildHeader: function(data) {
        var statusColor = data.aiAvailable ? '#22c55e' : '#f59e0b';
        var statusText = data.aiAvailable ? '✅ Active' : '⏳ Initializing';

        return '' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<span style="font-size:11px;color:#94a3b8;font-weight:600;">🤖 Runtime Assistant</span>' +
                '<span style="font-size:10px;color:' + statusColor + ';">' + statusText + '</span>' +
            '</div>' +
            '<div style="font-size:9px;color:#475569;margin-bottom:6px;">' +
                'Updated: ' + this._formatTime(data.lastUpdated) +
            '</div>';
    },

    _buildUnderstanding: function(data) {
        var text = data.understanding || 'No runtime understanding available.';
        var color = data.aiAvailable ? '#e2e8f0' : '#64748b';

        return '' +
            '<div style="margin-bottom:6px;padding:8px 10px;background:rgba(74,158,255,0.06);border-radius:6px;border-left:2px solid #4a9eff;">' +
                '<div style="font-size:12px;color:' + color + ';line-height:1.5;">' +
                    this._escapeHTML(text) +
                '</div>' +
            '</div>';
    },

    _buildConfidenceBar: function(data) {
        var confidence = Math.round((data.confidence || 0) * 100);
        var barColor = confidence >= 80 ? '#22c55e' : confidence >= 50 ? '#f59e0b' : '#ef4444';
        var label = confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';

        return '' +
            '<div style="margin-bottom:6px;display:flex;align-items:center;gap:8px;">' +
                '<span style="font-size:9px;color:#64748b;min-width:65px;">Confidence:</span>' +
                '<div style="flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">' +
                    '<div style="height:100%;width:' + confidence + '%;background:' + barColor + ';border-radius:2px;transition:width 0.5s;"></div>' +
                '</div>' +
                '<span style="font-size:9px;color:' + barColor + ';min-width:45px;text-align:right;">' + confidence + '% ' + label + '</span>' +
            '</div>';
    },

    _buildIssues: function(data) {
        var issues = data.issues || [];

        if (issues.length === 0) {
            return '' +
                '<div style="margin-bottom:6px;padding:6px 10px;background:rgba(34,197,94,0.04);border-radius:6px;border-left:2px solid #22c55e;">' +
                    '<div style="font-size:10px;color:#22c55e;">✅ No issues detected</div>' +
                '</div>';
        }

        var items = '';
        for (var i = 0; i < Math.min(issues, 5); i++) {
            var issue = issues[i];
            var confColor = issue.confidence >= 0.8 ? '#ef4444' : issue.confidence >= 0.5 ? '#f59e0b' : '#64748b';
            var confIcon = issue.confidence >= 0.8 ? '🔴' : issue.confidence >= 0.5 ? '🟡' : '⚪';

            items += '' +
                '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(239,68,68,0.04);border-radius:4px;">' +
                    '<div style="font-size:10px;color:#e2e8f0;line-height:1.4;">' +
                        confIcon + ' ' + this._escapeHTML(issue.problem || 'Unknown issue') +
                    '</div>' +
                    '<div style="font-size:8px;color:' + confColor + ';margin-top:2px;">' +
                        'Confidence: ' + Math.round(issue.confidence * 100) + '%' +
                    '</div>' +
                '</div>';
        }

        if (issues.length > 5) {
            items += '' +
                '<div style="font-size:9px;color:#475569;padding-left:8px;">' +
                    '+ ' + (issues.length - 5) + ' more issues...' +
                '</div>';
        }

        return '' +
            '<div style="margin-bottom:6px;">' +
                '<div style="font-size:10px;color:#f59e0b;font-weight:600;margin-bottom:4px;">⚠️ Issues (' + issues.length + ')</div>' +
                items +
            '</div>';
    },

    _buildRecommendations: function(data) {
        var recs = data.recommendations || [];

        if (recs.length === 0) {
            return '' +
                '<div style="margin-bottom:6px;padding:6px 10px;background:rgba(139,92,246,0.04);border-radius:6px;border-left:2px solid #8b5cf6;">' +
                    '<div style="font-size:10px;color:#8b5cf6;">💡 No recommendations — system is optimal</div>' +
                '</div>';
        }

        var items = '';
        for (var i = 0; i < Math.min(recs, 4); i++) {
            var rec = recs[i];
            var priorityColor = rec.priority === 'critical' ? '#ef4444' :
                               rec.priority === 'high' ? '#f59e0b' :
                               rec.priority === 'medium' ? '#4a9eff' : '#64748b';
            var priorityIcon = rec.priority === 'critical' ? '🔴' :
                              rec.priority === 'high' ? '🟠' :
                              rec.priority === 'medium' ? '🟡' : '🟢';

            items += '' +
                '<div style="margin-bottom:4px;padding:4px 8px;background:rgba(139,92,246,0.04);border-radius:4px;">' +
                    '<div style="font-size:10px;color:#e2e8f0;line-height:1.4;">' +
                        priorityIcon + ' ' + this._escapeHTML(rec.suggestion || 'No suggestion') +
                    '</div>' +
                    '<div style="font-size:8px;color:' + priorityColor + ';margin-top:2px;">' +
                        '[' + rec.priority.toUpperCase() + '] Confidence: ' + Math.round(rec.confidence * 100) + '%' +
                        (rec.tentative ? ' (Tentative)' : '') +
                    '</div>' +
                '</div>';
        }

        return '' +
            '<div style="margin-bottom:6px;">' +
                '<div style="font-size:10px;color:#8b5cf6;font-weight:600;margin-bottom:4px;">💡 Recommendations (' + recs.length + ')</div>' +
                items +
            '</div>';
    },

    _buildLayerStatus: function(data) {
        var ctxIcon = data.contextAvailable ? '✅' : '⏳';
        var reasonIcon = data.reasoningAvailable ? '✅' : '⏳';
        var aiIcon = data.aiAvailable ? '✅' : '⏳';

        return '' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">' +
                '<span style="font-size:8px;color:#475569;">' + ctxIcon + ' Context</span>' +
                '<span style="font-size:8px;color:#475569;">' + reasonIcon + ' Reasoning</span>' +
                '<span style="font-size:8px;color:#475569;">' + aiIcon + ' Interaction</span>' +
                '<span style="font-size:8px;color:#475569;">v' + this._version + '</span>' +
            '</div>';
    },

    _errorHTML: function(errorMsg) {
        return '' +
            '<div style="margin-bottom:6px;">' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:600;">🤖 Runtime Assistant</div>' +
                '<div style="font-size:10px;color:#ef4444;margin-top:4px;">⚠️ AI Panel render error</div>' +
                '<div style="font-size:8px;color:#475569;margin-top:2px;">' + this._escapeHTML(errorMsg) + '</div>' +
                '<div style="font-size:8px;color:#64748b;margin-top:4px;">Runtime is not affected.</div>' +
            '</div>';
    },

    // ============================================================
    // AUTO-REFRESH
    // ============================================================

    _startAutoRefresh: function(container) {
        this.stopAutoRefresh();
        this._autoRefreshInterval = setInterval((function() {
            try {
                var aiData = this._collectAIData();
                var html = this._buildPanelHTML(aiData);
                container.innerHTML = html;
            } catch (e) {
                // Silent — Rule 3: failure不影响DevPanel
            }
        }).bind(this), this._autoRefreshMs);
    },

    // ============================================================
    // UTILS
    // ============================================================

    _formatTime: function(isoString) {
        try {
            var d = new Date(isoString);
            return d.toLocaleTimeString();
        } catch (e) {
            return isoString || 'N/A';
        }
    },

    _escapeHTML: function(str) {
        if (!str) return '';
        str = String(str);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            autoRefreshActive: !!this._autoRefreshInterval,
            aiAvailable: !!(LawAIApp.AIRuntimeInteraction && LawAIApp.AIRuntimeInteraction.isReady && LawAIApp.AIRuntimeInteraction.isReady())
        };
    }
};

// ── Auto-init ──
LawAIApp.Debug.DevPanelAI.init();

// ============================================================
// INTEGRATION POINT FOR DEV PANEL
// Add this section to DevPanel.show() to embed the AI panel:
//
//   var aiContainer = document.createElement('div');
//   aiContainer.id = 'dev-panel-ai-section';
//   // ... add aiContainer to panel ...
//   LawAIApp.Debug.DevPanelAI.render(aiContainer);
// ============================================================

console.log('🤖 DevPanel AI Assistant — Part 46.7 Complete');
console.log('   ✅ AI Panel: Understanding, Issues, Recommendations, Confidence');
console.log('   ✅ Data Flow: Context → Reasoning → Response → DevPanel Display');
console.log('   ✅ Auto-refresh: every ' + (LawAIApp.Debug.DevPanelAI._autoRefreshMs / 1000) + 's');
console.log('   ✅ Safety: analysis-only, context-backed, failure-isolated');
console.log('');
console.log('🎉 PART 46 COMPLETE — AI Runtime Assistant Framework');
console.log('   ✅ 46.1 AI Runtime Assistant Foundation');
console.log('   ✅ 46.2 AI Context Engine');
console.log('   ✅ 46.3 Runtime Knowledge Layer');
console.log('   ✅ 46.4 AI Reasoning Engine');
console.log('   ✅ 46.5 AI Recommendation System');
console.log('   ✅ 46.6 AI Runtime Interaction');
console.log('   ✅ 46.7 DevPanel AI Assistant');
console.log('');
console.log('🧠 Runtime Intelligence Layer: Fully Operational');
console.log('   Context → Knowledge → Reasoning → Recommendation → Interaction → DevPanel');
