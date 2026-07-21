/**
 * Engine Communication Panel
 * Separate UI for Engine Communication.
 * Read only – never controls application.
 */

import { generateHealthReport } from '../core/engineCommunicationHealth.js';
import { list } from '../core/engineCommunicationRegistry.js';

export function render(container, refreshInterval) {
  refreshInterval = refreshInterval || 15000;
  if (!container) return;
  
  container.innerHTML = 
    '<div id="engine-communication-content">' +
      '<div style="margin-bottom:8px;font-weight:bold;color:#06b6d4;">🌐 Engine Communication</div>' +
      '<div id="ec-status" style="font-size:12px;color:#94a3b8;">Loading...</div>' +
      '<div id="ec-details" style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.6;"></div>' +
      '<div id="ec-health" style="font-size:10px;color:#475569;margin-top:4px;"></div>' +
    '</div>';
  
  function update() {
    try {
      const report = generateHealthReport();
      const contracts = list();
      
      const statusEl = document.getElementById('ec-status');
      const detailsEl = document.getElementById('ec-details');
      const healthEl = document.getElementById('ec-health');
      
      if (statusEl) {
        const color = report.status === 'healthy' ? '#22c55e' :
                      report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        statusEl.innerHTML = 
          'Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Contracts: ' + report.totalContracts;
      }
      
      if (detailsEl) {
        detailsEl.innerHTML =
          '<div>Sources: ' + report.uniqueSources + ' | Targets: ' + report.uniqueTargets + '</div>' +
          '<div>Active: ' + report.activeContracts + ' | Deprecated: ' + report.deprecatedContracts + ' | Experimental: ' + report.experimentalContracts + '</div>' +
          '<div>Message Types: ' + (report.messageTypes.length > 0 ? report.messageTypes.slice(0, 4).join(', ') + (report.messageTypes.length > 4 ? '...' : '') : 'None') + '</div>' +
          (report.invalidContracts > 0 ? '<div style="color:#ef4444;">❌ Invalid: ' + report.invalidContracts + '</div>' : '<div>✅ All contracts valid</div>');
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
      const statusEl = document.getElementById('ec-status');
      if (statusEl) {
        statusEl.innerHTML = '⚠️ Error loading communication: ' + err.message;
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
  window.engineCommunicationPanel = { render: render };
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCommunicationPanel = { render: render };
  }
}
