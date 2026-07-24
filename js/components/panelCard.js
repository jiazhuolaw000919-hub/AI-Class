/**
 * PanelCard Component — Part 49.8
 * Reusable card component for panel displays
 */
(function() {
    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.Components = window.LawAIApp.Components || {};
    
    window.LawAIApp.Components.PanelCard = {
        render: function(config) {
            var label = config.label || '';
            var value = config.value || '—';
            var color = config.color || '#22c55e';
            var icon = config.icon || '';
            var onClick = config.onClick || null;
            
            var html = '<div style="padding:6px 10px;border-radius:6px;background:' + color + '10;border:1px solid ' + color + '30;' +
                (onClick ? 'cursor:pointer;' : '') + '"' +
                (onClick ? ' onclick="' + onClick + '"' : '') + '>';
            
            if (icon) html += '<span style="margin-right:4px;">' + icon + '</span>';
            html += '<span style="font-size:10px;color:#94a3b8;">' + label + '</span> ';
            html += '<span style="font-weight:600;color:' + color + ';">' + value + '</span>';
            html += '</div>';
            
            return html;
        }
    };
})();
