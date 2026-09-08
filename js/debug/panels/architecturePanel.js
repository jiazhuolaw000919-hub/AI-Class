// js/debug/panels/architecturePanel.js
// Part 160: Architecture Guardrails DevPanel Panel

(function() {
    'use strict';

    if (window.LawAIApp?.DevPanel?.Panels?.Architecture) {
        console.log('[ArchitecturePanel] Already exists, skipping...');
        return;
    }

    var ArchitecturePanel = {
        id: 'architecture',
        label: '🏛️ Architecture',
        priority: 5,
        
        render: function(container) {
            if (!container) return;
            
            var guardrails = window.LawAIApp?.Architecture?.Guardrails;
            if (!guardrails) {
                container.innerHTML = `
                    <div style="padding:20px;color:#64748b;text-align:center;">
                        <div style="font-size:32px;margin-bottom:8px;">🔧</div>
                        <div>Guardrails not loaded yet.</div>
                        <div style="font-size:12px;margin-top:4px;">Run LawAIApp.Architecture.Guardrails.runAll()</div>
                    </div>
                `;
                return;
            }
            
            var summary = guardrails.getSummary ? guardrails.getSummary() : { total: 0, passed: 0, failed: 0 };
            var results = guardrails.getResults ? guardrails.getResults() : {};
            
            var html = '';
            
            // Header
            var statusColor = summary.criticalViolations > 0 ? '#ef4444' : 
                              summary.highViolations > 0 ? '#f59e0b' : 
                              summary.failed > 0 ? '#f59e0b' : '#22c55e';
            var statusIcon = summary.criticalViolations > 0 ? '🔴' : 
                             summary.highViolations > 0 ? '🟡' : 
                             summary.failed > 0 ? '🟡' : '🟢';
            
            html += `
                <div style="padding:16px;font-family:'Inter',sans-serif;color:#e2e8f0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div>
                            <span style="font-size:18px;font-weight:600;">🏛️ Architecture Guardrails</span>
                            <span style="font-size:11px;color:#64748b;margin-left:10px;">Part 160</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:20px;">${statusIcon}</span>
                            <span style="font-size:13px;font-weight:500;color:${statusColor};">${statusIcon === '🟢' ? 'All Pass' : statusIcon === '🟡' ? 'Warnings' : 'Critical'}</span>
                        </div>
                    </div>
                    
                    <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">
                        <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 16px;border:1px solid rgba(255,255,255,0.04);">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;">Total</div>
                            <div style="font-size:18px;font-weight:600;">${summary.total || 0}</div>
                        </div>
                        <div style="background:rgba(34,197,94,0.06);border-radius:8px;padding:8px 16px;border:1px solid rgba(34,197,94,0.08);">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;">Passed</div>
                            <div style="font-size:18px;font-weight:600;color:#22c55e;">${summary.passed || 0}</div>
                        </div>
                        <div style="background:rgba(239,68,68,0.06);border-radius:8px;padding:8px 16px;border:1px solid rgba(239,68,68,0.08);">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;">Failed</div>
                            <div style="font-size:18px;font-weight:600;color:#ef4444;">${summary.failed || 0}</div>
                        </div>
                        <div style="background:rgba(245,158,11,0.06);border-radius:8px;padding:8px 16px;border:1px solid rgba(245,158,11,0.08);">
                            <div style="font-size:10px;color:#64748b;text-transform:uppercase;">Critical Violations</div>
                            <div style="font-size:18px;font-weight:600;color:#ef4444;">${summary.criticalViolations || 0}</div>
                        </div>
                    </div>
                    
                    <div style="display:flex;flex-direction:column;gap:6px;">
            `;
            
            // 每个规则
            var ruleOrder = ['FIT-001', 'FIT-002', 'FIT-003', 'FIT-004', 'FIT-005', 'FIT-006'];
            var ruleNames = {
                'FIT-001': 'No Cross-Domain Writes',
                'FIT-002': 'No Circular Dependencies',
                'FIT-003': 'Single Authority Per Domain',
                'FIT-004': 'Recommendation → Arbitration',
                'FIT-005': 'LLM Does Not Mutate',
                'FIT-006': 'Historical Decision Immutability'
            };
            
            for (var i = 0; i < ruleOrder.length; i++) {
                var ruleId = ruleOrder[i];
                var result = results[ruleId] || { status: 'UNKNOWN', violations: [] };
                var isPass = result.status === 'PASS';
                var isFail = result.status === 'FAIL';
                var isUnknown = result.status === 'UNKNOWN';
                
                var icon = isPass ? '✅' : isFail ? '❌' : '❓';
                var color = isPass ? '#22c55e' : isFail ? '#ef4444' : '#64748b';
                var bgColor = isPass ? 'rgba(34,197,94,0.04)' : isFail ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)';
                var borderColor = isPass ? 'rgba(34,197,94,0.08)' : isFail ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)';
                
                html += `
                    <div style="background:${bgColor};border-radius:6px;padding:8px 12px;border:1px solid ${borderColor};">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:14px;">${icon}</span>
                                <span style="font-size:12px;font-weight:500;">${ruleId}</span>
                                <span style="font-size:11px;color:#94a3b8;">${ruleNames[ruleId] || ruleId}</span>
                            </div>
                            <span style="font-size:11px;font-weight:500;color:${color};">${result.status || 'UNKNOWN'}</span>
                        </div>
                        ${result.violations && result.violations.length > 0 ? `
                            <div style="margin-top:4px;font-size:10px;color:#ef4444;padding-left:28px;">
                                ${result.violations.map(function(v) { return v.type || v.method || v; }).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            html += `
                    </div>
                    
                    <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.04);display:flex;gap:8px;">
                        <button onclick="LawAIApp.Architecture.Guardrails.runAll(); location.reload();" style="padding:4px 12px;background:rgba(74,158,255,0.1);border:1px solid rgba(74,158,255,0.15);border-radius:4px;color:#4a9eff;font-size:11px;cursor:pointer;font-family:inherit;">
                            🔄 Re-run
                        </button>
                        <span style="font-size:10px;color:#64748b;align-self:center;">
                            Checked at: ${new Date().toISOString().slice(0,19).replace('T', ' ')}
                        </span>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        }
    };

    // 注册到 DevPanel
    if (window.LawAIApp?.DevPanel?.registerPanel) {
        window.LawAIApp.DevPanel.registerPanel(ArchitecturePanel);
    } else {
        // 等待 DevPanel 加载
        var interval = setInterval(function() {
            if (window.LawAIApp?.DevPanel?.registerPanel) {
                window.LawAIApp.DevPanel.registerPanel(ArchitecturePanel);
                clearInterval(interval);
            }
        }, 200);
    }

    console.log('🏛️ ArchitecturePanel loaded (Part 160)');
})();
