// ============================================================
// cognitivePanel.js
// Part 49.8.5 — Extract Cognitive Panel
// Version: v4.9.8.5
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Cognitive Panel
 * 
 * 职责：
 * - render(container) — 渲染 Cognitive UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 必须通过 Cognitive API
 * - 禁止重新执行分析
 * - 不得修改 Governance
 */
LawAIApp.Debug.Panels.CognitivePanel = {
    _container: null,
    _visible: false,
    _refreshInterval: null,
    _data: null,
    _eventUnsubscribers: [],

    // ============================================================
    // PANEL CONTRACT
    // ============================================================

    render: function(container) {
        if (!container) {
            console.warn('[CognitivePanel] No container provided');
            return this;
        }

        this._container = container;
        this._visible = true;
        this._data = this._getData();
        container.innerHTML = this._buildHTML(this._data);
        this._bindEvents();
        this._startAutoRefresh();
        return this;
    },

    refresh: function() {
        if (!this._visible || !this._container) return;
        try {
            this._data = this._getData();
            this._updateUI(this._data);
        } catch (err) {
            console.warn('[CognitivePanel] Refresh failed:', err);
        }
    },

    destroy: function() {
        this._visible = false;
        this._stopAutoRefresh();
        this._unbindEvents();
        if (this._container) {
            this._container.innerHTML = '';
            this._container = null;
        }
        this._data = null;
    },

    isVisible: function() {
        return this._visible;
    },

    // ============================================================
    // COGNITIVE API — 必须通过 Cognitive API
    // ============================================================

    _getData: function() {
        var info = {
            status: 'unknown',
            statusText: 'Unknown',
            statusColor: '#64748b',
            confidence: 0,
            coverage: 0,
            hasData: false,
            isAvailable: false,
            insightCount: 0,
            predictionCount: 0,
            decisions: [],
            insights: [],
            predictions: [],
            rootCauses: [],
            aiLevel: 'N/A',
            recommendations: []
        };

        try {
            // ── Cognitive Engine ──
            var cognitive = LawAIApp.CognitiveEngine || window.cognitiveEngine;
            if (cognitive) {
                info.isAvailable = true;
                
                if (typeof cognitive.getStatus === 'function') {
                    var status = cognitive.getStatus();
                    if (status) {
                        info.status = status.state || 'unknown';
                        info.confidence = status.confidence || 0;
                        info.coverage = status.coverage || 0;
                        info.hasData = (status.insightCount || 0) > 0 || (status.predictionCount || 0) > 0;
                        info.insightCount = status.insightCount || 0;
                        info.predictionCount = status.predictionCount || 0;
                    }
                }

                if (typeof cognitive.getInsights === 'function') {
                    var insights = cognitive.getInsights();
                    if (insights && insights.length > 0) {
                        info.insights = insights.slice(0, 5);
                        info.hasData = true;
                    }
                }

                if (typeof cognitive.getPredictions === 'function') {
                    var predictions = cognitive.getPredictions();
                    if (predictions && predictions.length > 0) {
                        info.predictions = predictions.slice(0, 3);
                    }
                }

                if (typeof cognitive.getDecisions === 'function') {
                    var decisions = cognitive.getDecisions();
                    if (decisions && decisions.length > 0) {
                        info.decisions = decisions.slice(0, 5);
                    }
                }

                if (typeof cognitive.getRootCauses === 'function') {
                    var rootCauses = cognitive.getRootCauses();
                    if (rootCauses && rootCauses.length > 0) {
                        info.rootCauses = rootCauses.slice(0, 3);
                    }
                }
            }

            // ── AI Governance Level ──
            try {
                var aiGov = LawAIApp.AIGovernance || window.LawAIApp?.AIGovernance;
                if (aiGov && typeof aiGov.getAILevel === 'function') {
                    var ai = aiGov.getAILevel();
                    info.aiLevel = ai.name || 'N/A';
                    info.isAvailable = true;
                }
            } catch (e) { /* ignore */ }

            // ── Status Color ──
            if (info.confidence >= 80) {
                info.statusColor = '#22c55e';
                info.statusText = 'High Confidence';
            } else if (info.confidence >= 50) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Medium Confidence';
            } else if (info.confidence > 0) {
                info.statusColor = '#ef4444';
                info.statusText = 'Low Confidence';
            } else if (info.isAvailable) {
                info.statusColor = '#64748b';
                info.statusText = 'Idle';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[CognitivePanel] Could not get cognitive data:', err);
        }

        return info;
    },

    // ============================================================
    // UI RENDERING
    // ============================================================

    _buildHTML: function(data) {
        var statusColor = data.statusColor || '#64748b';
        var statusText = data.statusText || 'Unknown';

        return `
            <div id="cognitive-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Cognitive Engine</span>
                    <span style="font-size:10px;color:${data.confidence >= 80 ? '#22c55e' : '#f59e0b'};">${data.confidence}%</span>
                </div>
                
                ${data.isAvailable && data.hasData ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Confidence: ${data.confidence}%</span>
                    <span>Coverage: ${data.coverage}%</span>
                    <span>AI Level: ${data.aiLevel}</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Insights: ${data.insightCount}</span>
                    <span>Predictions: ${data.predictionCount}</span>
                    ${data.decisions.length > 0 ? `<span>Decisions: ${data.decisions.length}</span>` : ''}
                </div>
                
                <!-- Insights Preview -->
                ${data.insights.length > 0 ? `
                    <div style="margin-top:3px;font-size:8px;color:#8b5cf6;max-height:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        💡 ${data.insights[0].summary || data.insights[0].type || 'Insight available'}
                        ${data.insights.length > 1 ? ' (+' + (data.insights.length - 1) + ' more)' : ''}
                    </div>
                ` : ''}
                
                <!-- Root Causes -->
                ${data.rootCauses.length > 0 ? `
                    <div style="margin-top:2px;font-size:8px;color:#f59e0b;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        🔍 Root Causes: ${data.rootCauses.slice(0, 2).join(', ')}${data.rootCauses.length > 2 ? '...' : ''}
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ${data.isAvailable ? '⏳ No cognitive data available yet...' : '⚠️ Cognitive engine not available'}
                </div>
                `}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="cognitive-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.CognitivePanel._handleRefresh()">
                        🔄 refresh
                    </span>
                </div>
            </div>
        `;
    },

    _updateUI: function(data) {
        if (!this._container) return;
        this._container.innerHTML = this._buildHTML(data);
    },

    // ============================================================
    // EVENT BINDING
    // ============================================================

    _bindEvents: function() {
        if (!this._container) return;

        try {
            var cognitive = LawAIApp.CognitiveEngine || window.cognitiveEngine;
            if (cognitive && typeof cognitive.on === 'function') {
                var unsub = cognitive.on('insight.generated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
                
                var unsubPred = cognitive.on('prediction.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubPred);
            }
        } catch (err) { /* ignore */ }

        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('cognitive.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) { /* ignore */ }
    },

    _unbindEvents: function() {
        this._eventUnsubscribers.forEach(function(unsub) {
            if (typeof unsub === 'function') {
                try { unsub(); } catch (e) { /* ignore */ }
            }
        });
        this._eventUnsubscribers = [];
    },

    _handleRefresh: function() {
        this.refresh();
    },

    // ============================================================
    // AUTO REFRESH
    // ============================================================

    _startAutoRefresh: function() {
        if (this._refreshInterval) return;
        this._refreshInterval = setInterval(function() {
            this.refresh();
        }.bind(this), 5000);
    },

    _stopAutoRefresh: function() {
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = null;
        }
    },

    // ============================================================
    // UTILITY
    // ============================================================

    _formatTimestamp: function(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
};

console.log('✅ [Part 49.8.5] CognitivePanel loaded');
