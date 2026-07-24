/**
 * Governance Panel — Part 49.8
 * First migrated panel: displays Governance Layer summary
 */
(function() {
    if (!window.LawAIApp.PanelRegistry) {
        console.warn('[GovernancePanel] PanelRegistry not ready, deferring...');
        return;
    }
    
    window.LawAIApp.PanelRegistry.register({
        id: 'governance',
        name: 'Governance',
        icon: '🏛️',
        order: 49,
        
        render: function(container) {
            if (!container) return;
            
            var html = '<div style="font-weight:bold;color:#22c55e;font-size:11px;cursor:pointer;" ' +
                'onclick="window.LawAIApp._openGovernanceDashboard()" title="Click for full dashboard">🏛️ Governance 🔗</div>';
            
            var policy = window.LawAIApp.Policy;
            var perm = window.LawAIApp.Permissions;
            var valid = window.LawAIApp.Validation;
            var safety = window.LawAIApp.Safety;
            var aiGov = window.LawAIApp.AIGovernance;
            
            html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:4px;font-size:10px;">';
            
            if (policy && policy.getHealth) {
                try {
                    var ph = policy.getHealth();
                    html += '<span style="padding:2px 6px;border-radius:8px;background:#22c55e15;color:#22c55e;">📋 ' + (ph.activePolicies || 0) + '</span>';
                } catch(e) {}
            }
            
            if (perm && perm.getHealth) {
                try {
                    var pmh = perm.getHealth();
                    html += '<span style="padding:2px 6px;border-radius:8px;background:#3b82f615;color:#3b82f6;">🔑 ' + (pmh.activePermissions || 0) + '</span>';
                } catch(e) {}
            }
            
            if (valid && valid.getHealth) {
                try {
                    var vh = valid.getHealth();
                    html += '<span style="padding:2px 6px;border-radius:8px;background:#8b5cf615;color:#8b5cf6;">✅ ' + (vh.validators || 0) + '</span>';
                } catch(e) {}
            }
            
            if (safety && safety.getHealth) {
                try {
                    var sh = safety.getHealth();
                    var color = sh.status === 'SAFE' ? '#22c55e' : '#ef4444';
                    html += '<span style="padding:2px 6px;border-radius:8px;background:' + color + '15;color:' + color + ';">🛡️ ' + (sh.activeLocks || 0) + '🔒</span>';
                } catch(e) {}
            }
            
            if (aiGov && aiGov.getAILevel) {
                try {
                    var ai = aiGov.getAILevel();
                    html += '<span style="padding:2px 6px;border-radius:8px;background:#a855f715;color:#a855f7;">🤖 ' + (ai.name || '?') + '</span>';
                } catch(e) {}
            }
            
            html += '</div>';
            
            container.innerHTML = html;
        },
        
        refresh: function(container) {
            if (container) this.render(container);
        },
        
        destroy: function() {}
    });
    
    console.log('[GovernancePanel] Registered');
})();
