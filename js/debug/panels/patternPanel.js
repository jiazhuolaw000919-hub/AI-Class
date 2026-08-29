// js/debug/panels/patternPanel.js
// Part 59 — Pattern Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.PatternPanel) {
        console.warn('[PatternPanel] Already registered, skipping...');
        return;
    }

    var PatternPanel = {
        _container: null,
        _refreshInterval: null,
        _visible: false,

        render: function(container) {
            this._container = container;
            this._visible = true;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                if (PatternPanel._visible) {
                    PatternPanel._refreshContent();
                }
            }, 8000);

            console.log('[PatternPanel] ✅ Rendered');
        },

        refresh: function() {
            if (this._visible && this._container) {
                this._renderContent(this._container);
            }
        },

        destroy: function() {
            this._visible = false;
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
                this._refreshInterval = null;
            }
            this._container = null;
            console.log('[PatternPanel] 🧹 Destroyed');
        },

        isVisible: function() {
            return this._visible;
        },

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        _renderContent: function(container) {
            var detector = window.LawAIApp?.PatternDetector;
            var explainer = window.LawAIApp?.PatternExplainer;

            var stats = detector ? detector.getStats() : { total: 0 };
            var patterns = detector ? detector.getPatterns({ limit: 5 }) : [];

            var html = this._buildHTML(stats, patterns, explainer);
            container.innerHTML = html;
        },

        _buildHTML: function(stats, patterns, explainer) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(251,191,36,0.04);border-radius:8px;border-left:2px solid #f59e0b;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">📊 Learning Patterns</span>
                        <span style="font-size:9px;color:${stats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Patterns', stats.total || 0, '#f59e0b')}
                        ${this._statCard('Active', stats.active || 0, '#4ade80')}
                        ${this._statCard('Dismissed', stats.dismissed || 0, '#64748b')}
                        ${this._statCard('Categories', Object.keys(stats.byCategory || {}).length || 0, '#8b5cf6')}
                    </div>

                    <!-- Category Breakdown -->
                    ${Object.keys(stats.byCategory || {}).length > 0 ? `
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;font-size:8px;color:#475569;">
                            ${Object.keys(stats.byCategory).map(function(cat) {
                                return `<span style="background:rgba(255,255,255,0.04);padding:1px 8px;border-radius:8px;">${cat}: ${stats.byCategory[cat]}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Pattern List -->
                    ${patterns.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Active Patterns</div>
                            ${patterns.slice(0, 3).map(function(p) {
                                var time = new Date(p.timestamp).toLocaleDateString();
                                var statusColor = p.status === 'ACTIVE' ? '#4ade80' : 
                                                 p.status === 'VIEWED' ? '#f59e0b' : '#64748b';
                                var strengthColor = p.strength === 'STRONG' ? '#4ade80' : 
                                                   p.strength === 'MODERATE' ? '#f59e0b' : '#94a3b8';
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${p.title || 'Pattern'}</span>
                                    <span style="color:${strengthColor};">${p.strength || 'WEAK'}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;

            return html;
        },

        _statCard: function(label, value, color) {
            return `
                <div style="text-align:center;padding:4px;background:rgba(255,255,255,0.02);border-radius:4px;">
                    <div style="font-size:14px;font-weight:700;color:${color};">${value}</div>
                    <div style="font-size:7px;color:#475569;text-transform:uppercase;">${label}</div>
                </div>
            `;
        }
    };

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.PatternPanel = PatternPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'pattern',
                PatternPanel,
                'pattern-panel-placeholder',
                700
            );
            console.log('[PatternPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[PatternPanel] Part 59 loaded ✅');

})();
