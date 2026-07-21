/**
 * Boot Panel
 * Displays boot orchestration information.
 * Read only – never controls application.
 */

import { generateHealthReport } from '../../core/bootHealth.js';
import { getBootPhases } from '../../core/bootSequenceManifest.js';
import { getOverallStatus } from '../../core/bootCoordinator.js';

export function render(container, refreshInterval) {
  refreshInterval = refreshInterval || 15000;
  if (!container) return;
  
  container.innerHTML = 
    '<div id="boot-panel-content">' +
      '<div style="margin-bottom:8px;font-weight:bold;color:#f59e0b;">🚀 Boot Orchestration</div>' +
      '<div id="bp-status" style="font-size:12px;color:#94a3b8;">Loading...</div>' +
      '<div id="bp-details" style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.6;"></div>' +
      '<div id="bp-health" style="font-size:10px;color:#475569;margin-top:4px;"></div>' +
    '</div>';
  
  function update() {
    try {
      var report = generateHealthReport();
      var phases = getBootPhases();
      var status = getOverallStatus();
      
      var statusEl = document.getElementById('bp-status');
      var detailsEl = document.getElementById('bp-details');
      var healthEl = document.getElementById('bp-health');
      
      if (statusEl) {
        var color = report.status === 'healthy' ? '#22c55e' :
                    report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        statusEl.innerHTML = 
          'Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Phases: ' + report.completedPhases + '/' + report.totalPhases +
          ' | Boot: ' + report.bootStatus;
      }
      
      if (detailsEl) {
        var phaseNames = phases.map(function(p) { return p.name; });
        detailsEl.innerHTML =
          '<div>Phases: ' + phaseNames.join(' → ') + '</div>' +
          '<div>Completed: ' + report.completedPhases + ' | Failed: ' + report.failedPhases + ' | Remaining: ' + report.remainingPhases + '</div>' +
          (report.currentPhase ? '<div>Current: ' + report.currentPhase + '</div>' : '<div>✅ No active phase</div>') +
          (report.failedPhases > 0 ? '<div style="color:#ef4444;">❌ ' + report.failedPhases + ' phases failed</div>' : '');
      }
      
      if (healthEl) {
        var color = report.status === 'healthy' ? '#22c55e' :
                    report.status === 'warnings' ? '#f59e0b' : '#ef4444';
        healthEl.innerHTML =
          'Coverage: ' + report.coverage +
          ' | Stability: ' + report.stabilityScore + '%' +
          ' | Status: <span style="color:' + color + ';">' + report.status.toUpperCase() + '</span>' +
          ' | Warnings: ' + report.validationWarnings;
      }
    } catch (err) {
      var statusEl = document.getElementById('bp-status');
      if (statusEl) {
        statusEl.innerHTML = '⚠️ Error loading boot info: ' + err.message;
      }
    }
  }
  
  update();
  var intervalId = setInterval(update, refreshInterval);
  
  return function destroy() {
    clearInterval(intervalId);
    container.innerHTML = '';
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootPanel = { render: render };
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootPanel = { render: render };
  }
}
