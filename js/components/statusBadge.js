/**
 * StatusBadge Component — Part 49.8
 * Reusable status indicator
 */
(function() {
    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.Components = window.LawAIApp.Components || {};
    
    window.LawAIApp.Components.StatusBadge = {
        STATUS_COLORS: {
            HEALTHY: '#22c55e',
            SAFE: '#22c55e',
            ACTIVE: '#22c55e',
            WARNING: '#f59e0b',
            DEGRADED: '#f59e0b',
            CRITICAL: '#ef4444',
            ERROR: '#ef4444',
            BLOCKED: '#ef4444',
            UNKNOWN: '#64748b'
        },
        
        render: function(status, label) {
            var color = this.STATUS_COLORS[status] || '#64748b';
            var text = label || status || '?';
            
            return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;' +
                'background:' + color + '20;color:' + color + ';font-size:10px;font-weight:600;">' +
                text + '</span>';
        }
    };
})();
