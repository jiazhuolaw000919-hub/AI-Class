// js/debug/panels/metacognitivePanel.js
// Part 58 — Metacognitive Panel (DevPanel Integration)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Debug &&
        window.LawAIApp.Debug.Panels && window.LawAIApp.Debug.Panels.MetacognitivePanel) {
        console.warn('[MetacognitivePanel] Already registered, skipping...');
        return;
    }

    var MetacognitivePanel = {
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
                if (MetacognitivePanel._visible) {
                    MetacognitivePanel._refreshContent();
                }
            }, 5000);

            console.log('[MetacognitivePanel] ✅ Rendered');
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
            console.log('[MetacognitivePanel] 🧹 Destroyed');
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
            var metacognitive = window.LawAIApp?.MetacognitiveExperience;
            var learnerControl = window.LawAIApp?.LearnerControl;

            var stats = metacognitive ? metacognitive.getStats() : { total: 0 };
            var history = metacognitive ? metacognitive.getHistory(5) : [];
            var assessments = metacognitive ? metacognitive.getSelfAssessments() : [];
            var controlStatus = learnerControl ? learnerControl.getStatus() : { availableOptions: 0 };

            var html = this._buildHTML(stats, history, assessments, controlStatus);
            container.innerHTML = html;
        },

        _buildHTML: function(stats, history, assessments, controlStatus) {
            var html = '';

            html += `
                <div style="margin-bottom:8px;padding:10px 12px;background:rgba(236,72,153,0.04);border-radius:8px;border-left:2px solid #ec4899;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;color:#94a3b8;font-weight:600;">🧠 Metacognitive Experience</span>
                        <span style="font-size:9px;color:${stats.total > 0 ? '#4ade80' : '#64748b'};">
                            ${stats.total > 0 ? '✅ Active' : '⏳ Waiting'}
                        </span>
                    </div>

                    <!-- Quick Stats -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px;">
                        ${this._statCard('Reflections', stats.total || 0, '#ec4899')}
                        ${this._statCard('Micro', stats.byType?.MICRO || 0, '#f472b6')}
                        ${this._statCard('Deep', stats.byType?.DEEP || 0, '#8b5cf6')}
                        ${this._statCard('Self-Assess', stats.byType?.SELF_ASSESSMENT || 0, '#4a9eff')}
                    </div>

                    <!-- Recent Reflections -->
                    ${history.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Recent Reflections</div>
                            ${history.slice(0, 3).map(function(r) {
                                var time = new Date(r.timestamp).toLocaleTimeString();
                                var typeColor = r.type === 'MICRO' ? '#f472b6' : 
                                               r.type === 'DEEP' ? '#8b5cf6' : 
                                               r.type === 'SELF_ASSESSMENT' ? '#4a9eff' : '#94a3b8';
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${r.type || 'unknown'}</span>
                                    <span style="color:${typeColor};">${time}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Self-Assessments -->
                    ${assessments.length > 0 ? `
                        <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:8px;color:#475569;">Self-Assessments</div>
                            ${assessments.slice(0, 2).map(function(a) {
                                return `<div style="display:flex;justify-content:space-between;font-size:8px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.02);">
                                    <span style="color:#94a3b8;">${a.topic || 'topic'}</span>
                                    <span style="color:#4a9eff;">${a.confidenceLabel || a.confidence + '/5'}</span>
                                </div>`;
                            }).join('')}
                        </div>
                    ` : ''}

                    <!-- Learner Control -->
                    <div style="margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.04);">
                        <div style="display:flex;justify-content:space-between;font-size:8px;color:#475569;">
                            <span>🎮 Learner Control</span>
                            <span style="color:#4ade80;">${controlStatus.availableOptions || 0} options available</span>
                        </div>
                    </div>

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

    window.LawAIApp.Debug.Panels.MetacognitivePanel = MetacognitivePanel;

    setTimeout(function() {
        if (window.LawAIApp?.Debug?.DevPanel?.registerPanel) {
            window.LawAIApp.Debug.DevPanel.registerPanel(
                'metacognitive',
                MetacognitivePanel,
                'metacognitive-panel-placeholder',
                650
            );
            console.log('[MetacognitivePanel] ✅ Registered with DevPanel');
        }
    }, 150);

    console.log('[MetacognitivePanel] Part 58 loaded ✅');

})();
