// js/debug/panels/epistemicPanel.js
// Part 60 — Epistemic Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.EpistemicPanel) {
        console.warn('[EpistemicPanel] Already registered, skipping...');
        return;
    }

    var EpistemicPanel = {
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
                if (EpistemicPanel._visible) {
                    EpistemicPanel._refreshContent();
                }
            }, 8000);

            console.log('[EpistemicPanel] ✅ Rendered');
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
            console.log('[EpistemicPanel] 🧹 Destroyed');
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
            var epistemic = window.LawAIApp?.EpistemicStatus;
            var distinguisher = window.LawAIApp?.SourceDistinguisher;
            var literacy = window.LawAIApp?.AILiteracyHelper;

            var html = this._buildHTML(epistemic, distinguisher, literacy);
            container.innerHTML = html;
        },

        _buildHTML: function(epistemic, distinguisher, literacy) {
            var html = '';

            var statusTypes = epistemic ? Object.keys(epistemic.TYPES || {}).map(function(key) {
                return { key: key, label: epistemic.LABELS[key] };
            }) : [];

            var sourceTypes = distinguisher ? Object.keys(distinguisher.SOURCES || {}).map(function(key) {
                return { key: key, label: distinguisher.getLabel(key) };
            }) : [];

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(236,72,153,0.04);border-radius:8px;border-left:2px solid #ec4899;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Epistemic Judgment</span>
                        <span style="font-size:9px;color:#4ade80;">✅ Active</span>
                    </div>

                    <!-- Epistemic Status Types -->
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">
                        ${statusTypes.map(function(s) {
                            var color = epistemic ? epistemic.COLORS[s.key] : '#64748b';
                            var icon = epistemic ? epistemic.ICONS[s.key] : '❓';
                            return `<span style="font-size:8px;background:${color}20;color:${color};padding:1px 8px;border-radius:8px;">${icon} ${s.label}</span>`;
                        }).join('')}
                    </div>

                    <!-- Source Types -->
                    ${sourceTypes.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Source Types</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                                ${sourceTypes.map(function(s) {
                                    var color = distinguisher ? distinguisher.getColor(s.key) : '#64748b';
                                    return `<span style="font-size:8px;background:${color}20;color:${color};padding:1px 8px;border-radius:8px;">${s.label}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- AI Literacy Skills -->
                    ${literacy ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">AI Literacy</div>
                            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                                ${literacy.getSkills().slice(0, 6).map(function(s) {
                                    return `<span style="font-size:7px;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;color:#94a3b8;">${s.label}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Timestamp -->
                    <div style="font-size:8px;color:#334155;text-align:right;margin-top:4px;">
                        ⚡ Read-Only | ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;

            return html;
        }
    };

    if (!window.LawAIApp) window.LawAIApp = {};
    if (!window.LawAIApp.Debug) window.LawAIApp.Debug = {};
    if (!window.LawAIApp.Debug.Panels) window.LawAIApp.Debug.Panels = {};

    window.LawAIApp.Debug.Panels.EpistemicPanel = EpistemicPanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'epistemic',
                EpistemicPanel,
                'epistemic-panel-placeholder',
                750
            );
            console.log('[EpistemicPanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[EpistemicPanel] Part 60 loaded ✅');

})();
