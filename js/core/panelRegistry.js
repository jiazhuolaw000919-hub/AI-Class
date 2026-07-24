/**
 * Panel Registry — Part 49.8
 * Central registry for all DevPanel modules
 */
(function() {
    window.LawAIApp = window.LawAIApp || {};
    
    var registry = {
        panels: {},
        
        register: function(panel) {
            if (!panel.id) { console.warn('[PanelRegistry] Panel missing id'); return; }
            if (!panel.render || typeof panel.render !== 'function') { console.warn('[PanelRegistry] Panel "' + panel.id + '" missing render()'); return; }
            
            this.panels[panel.id] = {
                id: panel.id,
                name: panel.name || panel.id,
                icon: panel.icon || '📄',
                order: panel.order || 100,
                render: panel.render,
                refresh: panel.refresh || function() {},
                destroy: panel.destroy || function() {},
                loaded: false
            };
            
            console.log('[PanelRegistry] Registered: ' + panel.id);
        },
        
        get: function(id) { return this.panels[id] || null; },
        
        getAll: function() {
            var self = this;
            return Object.values(this.panels).sort(function(a, b) { return a.order - b.order; });
        },
        
        getByOrder: function() { return this.getAll(); },
        
        count: function() { return Object.keys(this.panels).length; }
    };
    
    window.LawAIApp.PanelRegistry = registry;
    console.log('[PanelRegistry] Ready');
})();
