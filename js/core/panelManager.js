/**
 * Panel Manager — Part 49.8
 * Manages panel lifecycle: init → render → refresh → destroy
 */
(function() {
    window.LawAIApp = window.LawAIApp || {};
    
    var manager = {
        activePanels: {},
        containerEl: null,
        
        init: function(container) {
            this.containerEl = container;
            console.log('[PanelManager] Initialized');
        },
        
        loadPanel: function(panelId) {
            var panel = window.LawAIApp.PanelRegistry.get(panelId);
            if (!panel) {
                console.warn('[PanelManager] Panel not found: ' + panelId);
                return null;
            }
            
            // Rule 3: Panel failure cannot crash DevPanel
            try {
                var sectionEl = document.createElement('div');
                sectionEl.id = 'dev-panel-section-' + panelId;
                sectionEl.style.cssText = 'margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:2px solid #334155;';
                
                panel.render(sectionEl);
                panel.loaded = true;
                
                this.activePanels[panelId] = {
                    panel: panel,
                    el: sectionEl
                };
                
                return sectionEl;
            } catch(e) {
                console.error('[PanelManager] Failed to load panel "' + panelId + '":', e.message);
                var errorEl = document.createElement('div');
                errorEl.style.cssText = 'color:#ef4444;font-size:10px;padding:4px;';
                errorEl.textContent = '⚠️ ' + panel.name + ': ' + e.message;
                return errorEl;
            }
        },
        
        loadAll: function() {
            var self = this;
            var panels = window.LawAIApp.PanelRegistry.getByOrder();
            var fragment = document.createDocumentFragment();
            
            for (var i = 0; i < panels.length; i++) {
                var el = self.loadPanel(panels[i].id);
                if (el) fragment.appendChild(el);
            }
            
            if (this.containerEl) {
                this.containerEl.appendChild(fragment);
            }
            
            console.log('[PanelManager] Loaded ' + Object.keys(this.activePanels).length + ' panels');
        },
        
        refresh: function(panelId) {
            if (panelId) {
                var active = this.activePanels[panelId];
                if (active && active.panel.refresh) {
                    try { active.panel.refresh(active.el); } catch(e) {}
                }
            } else {
                for (var key in this.activePanels) {
                    this.refresh(key);
                }
            }
        },
        
        destroy: function() {
            for (var key in this.activePanels) {
                var active = this.activePanels[key];
                if (active.panel.destroy) {
                    try { active.panel.destroy(); } catch(e) {}
                }
            }
            this.activePanels = {};
            console.log('[PanelManager] All panels destroyed');
        }
    };
    
    window.LawAIApp.PanelManager = manager;
    console.log('[PanelManager] Ready');
})();
