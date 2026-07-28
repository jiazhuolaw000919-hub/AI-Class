// ============================================================
// knowledgePanel.js
// Part 49.8.8 — Knowledge Panel
// Version: v4.9.8.8
// Status: Architecture Restoration
// Module: Developer Experience Layer — Panels
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Knowledge Panel
 * 
 * 职责：
 * - Entities
 * - Relations
 * - Graph Health
 * 
 * 数据来源：
 * - LawAIApp.KnowledgeGraph
 * - LawAIApp.KnowledgeHealth
 */
LawAIApp.Debug.Panels.KnowledgePanel = {
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
            console.warn('[KnowledgePanel] No container provided');
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
            console.warn('[KnowledgePanel] Refresh failed:', err);
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
    // KNOWLEDGE API
    // ============================================================

    _getData: function() {
        var info = {
            status: 'unknown',
            entityCount: 0,
            relationCount: 0,
            coverage: 0,
            healthScore: 0,
            isAvailable: false,
            hasData: false,
            statusColor: '#64748b',
            statusText: 'Unknown',
            topEntities: [],
            relationTypes: [],
            warnings: []
        };

        try {
            // ── Knowledge Graph ──
            var kg = LawAIApp.KnowledgeGraph || window.knowledgeGraph;
            if (kg) {
                info.isAvailable = true;
                
                if (typeof kg.getStats === 'function') {
                    var stats = kg.getStats();
                    if (stats) {
                        info.entityCount = stats.entities || 0;
                        info.relationCount = stats.relations || 0;
                        info.coverage = stats.coverage || 0;
                        info.hasData = (stats.entities || 0) > 0;
                    }
                }

                if (typeof kg.getEntities === 'function') {
                    var entities = kg.getEntities();
                    if (entities && entities.length > 0) {
                        info.topEntities = entities.slice(0, 10).map(function(e) { return e.label || e.id; });
                        info.hasData = true;
                    }
                }

                if (typeof kg.getRelationTypes === 'function') {
                    var types = kg.getRelationTypes();
                    if (types && types.length > 0) {
                        info.relationTypes = types.slice(0, 8);
                    }
                }
            }

            // ── Knowledge Health ──
            try {
                var health = LawAIApp.KnowledgeHealth || window.knowledgeHealth;
                if (health && typeof health.getHealth === 'function') {
                    var data = health.getHealth();
                    if (data) {
                        info.healthScore = data.healthScore || 0;
                        info.status = data.status || 'unknown';
                        info.warnings = data.warnings || [];
                        info.hasData = info.hasData || (data.healthScore > 0);
                    }
                }
            } catch (e) { /* ignore */ }

            // ── Fallback ──
            if (!info.isAvailable) {
                // Check if DevPanelKnowledgeGraph exists (legacy)
                if (LawAIApp.Debug && LawAIApp.Debug.DevPanelKnowledgeGraph) {
                    info.isAvailable = true;
                    info.status = 'legacy';
                    info.statusText = 'Legacy Mode';
                    info.statusColor = '#f59e0b';
                }
            }

            // ── Status Color ──
            if (info.healthScore >= 80) {
                info.statusColor = '#22c55e';
                info.statusText = 'Healthy';
            } else if (info.healthScore >= 50) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Warning';
            } else if (info.isAvailable && info.hasData) {
                info.statusColor = '#64748b';
                info.statusText = 'Idle';
            } else if (info.isAvailable) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Loading';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[KnowledgePanel] Could not get knowledge data:', err);
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
            <div id="knowledge-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Knowledge Graph</span>
                    <span style="font-size:10px;color:${data.healthScore >= 80 ? '#22c55e' : (data.healthScore >= 50 ? '#f59e0b' : '#64748b')};">${data.healthScore}%</span>
                </div>
                
                ${data.isAvailable ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Status: <span style="color:${statusColor};">${data.status}</span></span>
                    <span>Entities: ${data.entityCount}</span>
                    <span>Relations: ${data.relationCount}</span>
                    <span>Coverage: ${data.coverage}%</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    ${data.relationTypes.length > 0 ? `<span>Types: ${data.relationTypes.join(', ')}</span>` : ''}
                </div>
                
                <!-- Top Entities -->
                ${data.topEntities.length > 0 ? `
                    <div style="margin-top:2px;font-size:7px;color:#475569;max-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        🔗 ${data.topEntities.join(', ')}${data.topEntities.length > 10 ? '...' : ''}
                    </div>
                ` : ''}
                
                <!-- Warnings -->
                ${data.warnings && data.warnings.length > 0 ? `
                    <div style="margin-top:2px;font-size:8px;color:#f59e0b;max-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ⚠️ ${data.warnings.slice(0, 2).join('; ')}${data.warnings.length > 2 ? '...' : ''}
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ⚠️ Knowledge Graph not available
                </div>
                <div style="font-size:8px;color:#475569;margin-top:2px;">
                    Knowledge Graph may not be initialized
                </div>
                `}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="knowledge-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.KnowledgePanel._handleRefresh()">
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
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('knowledge.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
                
                var unsubGraph = eventBus.on('graph.updated', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsubGraph);
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

console.log('✅ [Part 49.8.8] KnowledgePanel loaded');
