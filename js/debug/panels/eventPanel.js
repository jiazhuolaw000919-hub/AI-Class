// ============================================================
// eventPanel.js
// Part 49.8.4 — Extract Event Panel
// Version: v4.9.8.4
// Status: Architecture Refactoring
// Module: Developer Experience Layer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Panels = LawAIApp.Debug.Panels || {};

/**
 * Event Panel
 * 
 * 职责：
 * - render(container) — 渲染 Event UI
 * - refresh() — 刷新数据
 * - destroy() — 销毁 Panel
 * - isVisible() — 检查可见状态
 * 
 * 数据来源：
 * - 统一通过 LawAIApp.Events API 获取
 * - 禁止直接读取内部 Store
 * - 禁止重复统计数据
 */
LawAIApp.Debug.Panels.EventPanel = {
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
            console.warn('[EventPanel] No container provided');
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
            console.warn('[EventPanel] Refresh failed:', err);
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
    // EVENT API — 统一通过 LawAIApp.Events
    // ============================================================

    _getData: function() {
        var info = {
            totalEvents: 0,
            sessionCount: 0,
            categories: {},
            sources: {},
            topEvents: [],
            recentEvents: [],
            insights: [],
            recommendations: [],
            risks: [],
            dependencies: [],
            hasData: false,
            isAvailable: false,
            timelineEntries: 0,
            intelligenceReady: false,
            categoryCount: 0,
            sourceCount: 0,
            statusColor: '#64748b',
            statusText: 'Collecting'
        };

        try {
            var events = LawAIApp.Events || window.LawAIApp?.Events;
            if (!events) {
                return info;
            }

            info.isAvailable = true;

            // ── Event Count ──
            if (typeof events.getEventCount === 'function') {
                info.totalEvents = events.getEventCount() || 0;
            }

            // ── Session Count ──
            if (typeof events.getSessionCount === 'function') {
                info.sessionCount = events.getSessionCount() || 0;
            }

            // ── Statistics ──
            if (typeof events.getStatistics === 'function') {
                var stats = events.getStatistics();
                if (stats) {
                    info.categories = stats.categories || {};
                    info.sources = stats.sources || {};
                    info.topEvents = stats.topEvents || [];
                    info.categoryCount = Object.keys(info.categories).length;
                    info.sourceCount = Object.keys(info.sources).length;
                    info.hasData = (stats.total || 0) > 0;
                }
            }

            // ── Timeline Entries ──
            if (typeof events.getTimelineEntries === 'function') {
                var entries = events.getTimelineEntries();
                if (entries && entries.length > 0) {
                    info.timelineEntries = entries.length;
                    info.recentEvents = entries.slice(-10).reverse();
                    info.hasData = true;
                }
            }

            // ── Insights ──
            if (typeof events.getInsights === 'function') {
                var insights = events.getInsights();
                if (insights && insights.length > 0) {
                    info.insights = insights.slice(0, 5);
                    info.intelligenceReady = true;
                }
            }

            // ── Recommendations ──
            if (typeof events.getRecommendations === 'function') {
                var recs = events.getRecommendations();
                if (recs && recs.length > 0) {
                    info.recommendations = recs.slice(0, 3);
                }
            }

            // ── Risks ──
            if (typeof events.getRisks === 'function') {
                var risks = events.getRisks();
                if (risks && risks.length > 0) {
                    info.risks = risks;
                }
            }

            // ── Dependencies ──
            if (typeof events.getDependencies === 'function') {
                var deps = events.getDependencies();
                if (deps && deps.length > 0) {
                    info.dependencies = deps.slice(0, 5);
                }
            }

            // ── Status ──
            if (info.hasData) {
                info.statusColor = '#22c55e';
                info.statusText = 'Active';
            } else if (info.isAvailable) {
                info.statusColor = '#f59e0b';
                info.statusText = 'Collecting';
            } else {
                info.statusColor = '#64748b';
                info.statusText = 'Unavailable';
            }

        } catch (err) {
            console.warn('[EventPanel] Could not get event data:', err);
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
            <div id="event-panel-container" 
                 style="margin-bottom:8px;padding:8px 12px;background:rgba(139,92,246,0.04);border-radius:8px;border-left:2px solid #8b5cf6;">
                
                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Runtime Events</span>
                    <span style="font-size:10px;color:${statusColor};">${data.hasData ? '✅ Active' : '⏳ ' + statusText}</span>
                </div>
                
                ${data.isAvailable && data.hasData ? `
                <!-- Main Info -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:10px;color:#64748b;">
                    <span>Events: ${data.totalEvents}</span>
                    <span>Sessions: ${data.sessionCount}</span>
                    <span>Categories: ${data.categoryCount}</span>
                    <span>Sources: ${data.sourceCount}</span>
                </div>
                
                <!-- Detail Info -->
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                    <span>Timeline: ${data.timelineEntries} entries</span>
                    ${data.insights.length > 0 ? `<span style="color:#8b5cf6;">💡 ${data.insights.length} insights</span>` : ''}
                    ${data.recommendations.length > 0 ? `<span style="color:#4a9eff;">📋 ${data.recommendations.length} recommendations</span>` : ''}
                    ${data.risks.length > 0 ? `<span style="color:#ef4444;">⚠️ ${data.risks.length} risks</span>` : ''}
                </div>
                
                <!-- Recent Events -->
                ${data.recentEvents.length > 0 ? `
                    <div style="margin-top:3px;font-size:8px;color:#475569;max-height:40px;overflow:hidden;">
                        <div style="font-weight:600;color:#64748b;">Latest Events:</div>
                        ${data.recentEvents.slice(0, 4).map(function(e) {
                            var time = new Date(e.timestamp).toLocaleTimeString();
                            return '<div style="padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + time + ' — ' + (e.eventName || e.eventId) + ' (' + e.source + ')</div>';
                        }).join('')}
                        ${data.recentEvents.length > 4 ? '<div style="padding-left:8px;color:#475569;">+' + (data.recentEvents.length - 4) + ' more...</div>' : ''}
                    </div>
                ` : ''}
                
                <!-- Insights Preview -->
                ${data.insights.length > 0 ? `
                    <div style="margin-top:3px;font-size:8px;color:#8b5cf6;max-height:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        💡 ${data.insights[0].summary || data.insights[0].type}
                        ${data.insights.length > 1 ? ' (+' + (data.insights.length - 1) + ' more)' : ''}
                    </div>
                ` : ''}
                ` : `
                <!-- No Data State -->
                <div style="font-size:10px;color:#64748b;margin-top:4px;">
                    ${data.isAvailable ? '⏳ No events recorded yet...' : '⚠️ Event system not available'}
                </div>
                `}
                
                ${!data.isAvailable ? `
                    <div style="font-size:8px;color:#475569;margin-top:2px;">
                        Event Intelligence not initialized
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px solid rgba(255,255,255,0.04);padding-top:4px;">
                    <span style="font-size:8px;color:#475569;" id="event-last-updated">Updated: ${this._formatTimestamp(Date.now())}</span>
                    <span style="font-size:8px;color:#8b5cf6;cursor:pointer;" 
                          onclick="LawAIApp.Debug.Panels.EventPanel._handleRefresh()">
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
            var events = LawAIApp.Events;
            if (events && typeof events.on === 'function') {
                var unsub = events.on('event.recorded', function() {
                    this.refresh();
                }.bind(this));
                this._eventUnsubscribers.push(unsub);
            }
        } catch (err) { /* ignore */ }

        try {
            var eventBus = LawAIApp.EventBus || window.eventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                var unsub = eventBus.on('runtime.event.recorded', function() {
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

console.log('✅ [Part 49.8.4] EventPanel loaded');
