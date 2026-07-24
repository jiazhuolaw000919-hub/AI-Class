/**
 * DevPanel Core — Part 49.8
 * Lightweight container + layout manager
 * Delegates rendering to PanelRegistry + PanelManager
 */
(function() {
    window.LawAIApp = window.LawAIApp || {};
    
    var DevPanelCore = {
        _panel: null,
        _isOpen: false,
        version: 'V4.9.8',
        
        toggle: function() {
            if (this._isOpen) { this.hide(); }
            else { this.show(); }
        },
        
        show: function() {
            if (this._panel) this._panel.remove();
            
            // Create container
            this._panel = document.createElement('div');
            this._panel.id = 'dev-panel-core';
            this._panel.style.cssText = [
                'position:fixed;top:20px;left:20px;z-index:10000;',
                'background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);',
                'border-radius:14px;padding:16px;max-width:400px;max-height:85vh;',
                'overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.8);',
                'color:#e2e8f0;font-family:system-ui,sans-serif;font-size:12px;'
            ].join('');
            
            // Header
            var header = document.createElement('div');
            header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);';
            header.innerHTML = '<span style="font-weight:bold;color:#fff;font-size:14px;">🛠️ DevPanel</span>' +
                '<span style="font-size:10px;color:#64748b;">' + this.version + ' | Panels: ' + (window.LawAIApp.PanelRegistry ? window.LawAIApp.PanelRegistry.count() : 0) + '</span>';
            this._panel.appendChild(header);
            
            // Content area
            var content = document.createElement('div');
            content.id = 'dev-panel-content';
            this._panel.appendChild(content);
            
            // Load panels via PanelManager
            if (window.LawAIApp.PanelManager) {
                window.LawAIApp.PanelManager.init(content);
                window.LawAIApp.PanelManager.loadAll();
            } else {
                content.innerHTML = '<div style="color:#64748b;font-size:11px;">PanelManager not available</div>';
            }
            
            // Footer
            var footer = document.createElement('div');
            footer.style.cssText = 'margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:10px;color:#475569;text-align:center;';
            footer.textContent = 'DevPanel Core V4.9.8 | Ctrl+Shift+L to toggle';
            this._panel.appendChild(footer);
            
            document.body.appendChild(this._panel);
            this._isOpen = true;
        },
        
        hide: function() {
            if (this._panel) { this._panel.remove(); this._panel = null; }
            this._isOpen = false;
        },
        
        refresh: function() {
            if (window.LawAIApp.PanelManager) {
                window.LawAIApp.PanelManager.refresh();
            }
        }
    };
    
    // Keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            DevPanelCore.toggle();
        }
    });
    
    // Export
    window.LawAIApp.DevPanelCore = DevPanelCore;
    window.LawAIApp.Debug = window.LawAIApp.Debug || {};
    window.LawAIApp.Debug.DevPanel = DevPanelCore;
    
    console.log('[DevPanelCore] V4.9.8 Ready — Ctrl+Shift+L to toggle');
})();
