/**
 * Engine Discovery Panel
 * Separate UI for Engine Discovery.
 * Read only – never controls application.
 */

import { generateHealthReport } from '../core/engineDiscoveryHealth.js';
import { list } from '../core/engineDiscovery.js';

export function render(container, refreshInterval) {
  refreshInterval = refreshInterval || 15000;
  if (!container) return;
  
  container.innerHTML = 
    '<div id="engine-discovery-content">' +
      '<div style="margin-bottom:8px;font-weight:bold;color:#f59e0b;">🔍 Engine Discovery</div>' +
      '<div id="ed-status" style="font-size:12px;color:#94a3b8;">Loading...</div>' +
      '<div id="ed-details" style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.6;"></div>' +
      '<div id="ed-health" style="font-size:10px;color:#475569;margin-top:4px;"></div>' +
    '</div>';
  
  function update() {
    try {
      const report = generateHealthReport();
      const allEngines = list();
      
      const statusEl = document.getElementById('ed-status');
      const detailsEl = document.getElementById('ed-details');
      const healthEl = document.getElementById('ed-health');
      
      if (statusEl) {
        const color = report.status === 'healthy' ? '#22c55e' :
                      report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        statusEl.innerHTML = 
          'Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Engines: ' + report.totalEngines;
      }
      
      if (detailsEl) {
        detailsEl.innerHTML =
          '<div>Domains: ' + report.domains.join(', ') + '</div>' +
          '<div>Categories: ' + report.categories.join(', ') + '</div>' +
          '<div>Capabilities: ' + report.totalCapabilities + ' | Coverage: ' + report.coverage + '</div>' +
          (report.totalMissing > 0 ? '<div style="color:#f59e0b;">⚠️ Missing metadata: ' + report.totalMissing + '</div>' : '<div>✅ All metadata complete</div>');
      }
      
      if (healthEl) {
        const color = report.status === 'healthy' ? '#22c55e' :
                      report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        healthEl.innerHTML =
          'Coverage: ' + report.coverage +
          ' | Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Warnings: ' + report.validationWarnings;
      }
    } catch (err) {
      const statusEl = document.getElementById('ed-status');
      if (statusEl) {
        statusEl.innerHTML = '⚠️ Error loading discovery: ' + err.message;
      }
    }
  }
  
  update();
  const intervalId = setInterval(update, refreshInterval);
  
  return function destroy() {
    clearInterval(intervalId);
    container.innerHTML = '';
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineDiscoveryPanel = { render: render };
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineDiscoveryPanel = { render: render };
  }
}
