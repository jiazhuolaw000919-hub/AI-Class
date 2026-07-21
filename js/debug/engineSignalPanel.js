/**
 * Engine Signal Panel
 * Separate UI for Engine Signals.
 * Read only – never controls application.
 */

import { generateHealthReport } from '../core/engineSignalHealth.js';
import { list } from '../core/engineSignalRegistry.js';

export function render(container, refreshInterval) {
  refreshInterval = refreshInterval || 15000;
  if (!container) return;
  
  container.innerHTML = 
    '<div id="engine-signal-content">' +
      '<div style="margin-bottom:8px;font-weight:bold;color:#8b5cf6;">📡 Engine Signals</div>' +
      '<div id="es-status" style="font-size:12px;color:#94a3b8;">Loading...</div>' +
      '<div id="es-details" style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.6;"></div>' +
      '<div id="es-health" style="font-size:10px;color:#475569;margin-top:4px;"></div>' +
    '</div>';
  
  function update() {
    try {
      const report = generateHealthReport();
      const signals = list();
      
      const statusEl = document.getElementById('es-status');
      const detailsEl = document.getElementById('es-details');
      const healthEl = document.getElementById('es-health');
      
      if (statusEl) {
        const color = report.status === 'healthy' ? '#22c55e' :
                      report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        statusEl.innerHTML = 
          'Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Signals: ' + report.totalSignals;
      }
      
      if (detailsEl) {
        detailsEl.innerHTML =
          '<div>Types: ' + report.types.join(', ') + '</div>' +
          '<div>Severities: ' + report.severities.join(', ') + '</div>' +
          '<div>Sources: ' + report.sources.join(', ') + '</div>' +
          (report.totalMissing > 0 ? '<div style="color:#f59e0b;">⚠️ Missing metadata: ' + report.totalMissing + '</div>' : '<div>✅ All signal metadata complete</div>');
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
      const statusEl = document.getElementById('es-status');
      if (statusEl) {
        statusEl.innerHTML = '⚠️ Error loading signals: ' + err.message;
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
  window.engineSignalPanel = { render: render };
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineSignalPanel = { render: render };
  }
}
