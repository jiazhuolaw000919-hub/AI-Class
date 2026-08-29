// js/debug/panels/decisionPanel.js
// Part 54 — Decision Panel (DevPanel Integration)
// Law AI Academy Developer Bible
//
// PURPOSE: Display Decision Experience state in DevPanel
// DATA: Read-only from DecisionExperience

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.DecisionPanel) {
        console.warn('[DecisionPanel] Already registered, skipping...');
        return;
    }

    var DecisionPanel = {
        _container: null,
        _refreshInterval: null,
        _visible: false,

        // ============================================================
        // PANEL CONTRACT
        // ============================================================

        render: function(container) {
            this._container = container;
            this._visible = true;
            this._renderContent(container);

            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
            this._refreshInterval = setInterval(function() {
                if (DecisionPanel._visible) {
                    DecisionPanel._refreshContent();
                }
            }, 5000);

            console.log('[DecisionPanel] ✅ Rendered');
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
            console.log('[DecisionPanel] 🧹 Destroyed');
        },

        isVisible: function() {
            return this._visible;
        },

        // ============================================================
        // RENDER
        // ============================================================

        _refreshContent: function() {
            if (this._container) {
                this._renderContent(this._container);
            }
        },

        _renderContent: function(container) {
            var de = window.LawAIApp?.DecisionExperience;
            var model = window.LawAIApp?.DecisionOptionModel;
            var authority = window.LawAIApp?.DecisionAuthority;
            var primacy = window.LawAIApp?.DecisionPrimacy;

            if (!de || !de.initialized) {
                container.innerHTML = this._getErrorHTML('DecisionExperience not initialized');
                return;
            }

            // 获取数据
            var status = de.getStatus ? de.getStatus() : { optionCount: 0, historyCount: 0 };
            var context = de._context || null;
            var options = de.getOptions ? de.getOptions({ includeDismissed: false, maxCount: 10 }) : [];
            var primary = de.getPrimaryOption ? de.getPrimaryOption() : null;
            var history = de.getHistory ? de.getHistory(5) : [];

            // 获取权威/优先级信息
            var authorityInfo = {};
            if (authority) {
                for (var i = 0; i < options.length; i++) {
                    var opt = options[i];
                    var level = authority.getAuthorityLevel(opt, context);
                    authorityInfo[opt.id] = {
                        level: level,
                        label: authority.getAuthorityLabel(opt, context),
                        isPrimary: primary && primary.id === opt.id
                    };
                }
            }

            var html = this._buildHTML(status, options, primary, history, authorityInfo, context);
            container.innerHTML = html;
        },

        // ============================================================
        // HTML BUILDERS
        // ============================================================

        _buildHTML: function(status, options, primary, history, authorityInfo, context) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(74,158,255,0.04);border-radius:8px;border-left:2px solid #4a9eff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🎯 Decision Experience</span>
                        <span style="font-size:9px;color:${status.initialized ? '#4ade80' : '#f87171'};">
                            ${status.initialized ? '✅ Active' : '⏳ Loading'}
                        </span>
                    </div>

                    <!-- Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Options', status.optionCount || 0, '#4a9eff')}
                        ${this._statCard('History', status.historyCount || 0, '#8b5cf6')}
                        ${this._statCard('Dismissed', status.dismissedCount || 0, '#64748b')}
                        ${this._statCard('Primary', primary ? '✅' : '⏳', primary ? '#22c55e' : '#f59e0b')}
                    </div>

                    <!-- Primary Option -->
                    ${primary ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">⭐ Primary Action</div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;padding:3px 6px;background:rgba(74,158,255,0.08);border-radius:4px;">
                                <span style="color:#e2e8f0;">${primary.title || 'Unknown'}</span>
                                <span style="color:#4a9eff;">${primary.type || 'ACTION'}</span>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Options List -->
                    ${options.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">📋 Options (${options.length})</div>
                            ${options.slice(0, 5).map(function(opt) {
                                var auth = authorityInfo[opt.id] || { label: 'Unknown', isPrimary: false };
                                var isPrimary = auth.isPrimary || (primary && primary.id === opt.id);
                                var color = isPrimary ? '#4a9eff' : '#64748b';
                                var border = isPrimary ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.04)';
                                return `
                                    <div style="display:flex;justify-content:space-between;font-size:9px;padding:2px 4px;border-bottom:1px solid ${border};">
                                        <span style="color:#e2e8f0;">${opt.title || 'Untitled'}</span>
                                        <span style="color:${color};">${isPrimary ? '⭐' : ''} ${opt.type || 'UNKNOWN'}</span>
                                    </div>
                                `;
                            }).join('')}
                            ${options.length > 5 ? `<div style="font-size:8px;color:#475569;text-align:right;">+${options.length - 5} more</div>` : ''}
                        </div>
                    ` : ''}

                    <!-- History -->
                    ${history.length > 0 ? `
                        <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:9px;color:#475569;margin-bottom:4px;">📜 Recent History</div>
                            ${history.slice(0, 3).map(function(h) {
                                var state = h.state || 'SELECTED';
                                var color = state === 'SELECTED' ? '#4a9eff' : state === 'SKIPPED' ? '#64748b' : '#f59e0b';
                                var time = new Date(h.timestamp).toLocaleTimeString();
                                return `
                                    <div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                        <span style="color:#94a3b8;">${h.optionId || 'unknown'}</span>
                                        <span style="color:${color};">${state} ${time}</span>
                                    </div>
                                `;
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
        },

        _getErrorHTML: function(message) {
            return `
                <div style="margin-bottom:8px;padding:8px 12px;background:rgba(239,68,68,0.04);border-radius:8px;border-left:2px solid #ef4444;">
                    <div style="font-size:11px;color:#94a3b8;font-weight:600;">⚠️ Decision</div>
                    <div style="font-size:9px;color:#ef4444;margin-top:4px;">${message}</div>
                </div>
            `;
        }
    };

    // ============================================================
    // REGISTER WITH DEVPANEL
    // ============================================================

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.DecisionPanel = DecisionPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'decision',
                DecisionPanel,
                'decision-panel-placeholder',
                500
            );
            console.log('[DecisionPanel] ✅ Registered with DevPanel');
        } else {
            console.log('[DecisionPanel] DevPanel not ready, will register later');
        }
    }, 150);

    console.log('[DecisionPanel] Part 54 loaded ✅');

})();
