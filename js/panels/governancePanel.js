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
    
        var data = null;
    
        // ── 尝试 _getData ──
        if (typeof this._getData === 'function') {
            try {
                data = this._getData();
            } catch(e) {
                console.warn('[GovernancePanel] _getData error:', e);
            }
        }
    
        // ── 如果 _getData 失败，尝试 fallback ──
        if (!data || !data.hasData) {
            if (typeof this._getDataFallback === 'function') {
                try {
                    data = this._getDataFallback();
                } catch(e) {
                    console.warn('[GovernancePanel] _getDataFallback error:', e);
                }
            }
        }
    
        // ── 如果还是没数据，用空对象 ──
        if (!data) {
            data = {
                policyCount: 0,
                permissionCount: 0,
                validatorCount: 0,
                safetyLocks: 0,
                aiLevel: 'N/A',
                status: 'unknown',
                statusText: 'Unknown',
                statusColor: '#64748b',
                isAvailable: false,
                hasData: false,
                healthScore: 0,
                violations: 0,
                recommendations: [],
                policyStatus: 'unknown',
                permissionStatus: 'unknown',
                validationStatus: 'unknown',
                safetyStatus: 'unknown',
                aiStatus: 'unknown'
            };
        }
    
        container.innerHTML = this._buildHTML(data);
    },
        
        refresh: function(container) {
            if (container) this.render(container);
        },
        
        destroy: function() {}
    });
    
    console.log('[GovernancePanel] Registered');
})();
