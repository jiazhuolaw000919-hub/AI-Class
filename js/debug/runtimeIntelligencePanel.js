/**
 * Runtime Intelligence Panel
 * Separate UI for Runtime Intelligence.
 * Read only – never controls application.
 */

import { collectAll } from '../core/runtimeIntelligenceCollector.js';
import { generateHealthReport } from '../core/runtimeIntelligenceHealth.js';

export function render(container, refreshInterval = 5000) {
  if (!container) return;
  
  // Build container structure
  container.innerHTML = `
    <div id="runtime-intelligence-content">
      <div style="margin-bottom:8px;font-weight:bold;color:#4a9eff;">⚡ Runtime Intelligence</div>
      <div id="ri-status" style="font-size:12px;color:#94a3b8;">Collecting...</div>
      <div id="ri-details" style="font-size:11px;color:#64748b;margin-top:4px;line-height:1.6;"></div>
      <div id="ri-health" style="font-size:10px;color:#475569;margin-top:4px;"></div>
    </div>
  `;
  
  // Update function
  function update() {
    try {
      const data = collectAll();
      const healthReport = generateHealthReport([
        { id: 'runtime_status', source: 'LawAIApp', type: 'status' },
        { id: 'runtime_health', source: 'LawAIApp', type: 'health' },
        { id: 'registry_modules', source: 'LawAIApp', type: 'modules' },
        { id: 'registry_engines', source: 'LawAIApp', type: 'engines' },
        { id: 'health_scores', source: 'LawAIApp', type: 'scores' }
      ]);
      
      const statusEl = document.getElementById('ri-status');
      const detailsEl = document.getElementById('ri-details');
      const healthEl = document.getElementById('ri-health');
      
      if (statusEl) {
        const runtime = data.runtime;
        const statusColor = runtime.ready ? '#22c55e' : '#f59e0b';
        statusEl.innerHTML = `
          Runtime: <span style="color:${statusColor};">${runtime.status}</span>
          | Uptime: ${runtime.uptime}
          | Version: ${runtime.version}
        `;
      }
      
      if (detailsEl) {
        const registry = data.registry;
        const health = data.health;
        const perf = data.performance;
        
        detailsEl.innerHTML = `
          <div>Engines: ${registry.engines} | Modules: ${registry.modules}</div>
          <div>Health: ${health.scores.runtime || 'N/A'}% | Lifecycle: ${health.scores.lifecycle || 'N/A'}% | Gov: ${health.scores.governance || 'N/A'}%</div>
          ${perf.memory ? `<div>Memory: ${perf.memory.used}MB / ${perf.memory.total}MB</div>` : ''}
          ${perf.loadTime ? `<div>Load Time: ${perf.loadTime}s</div>` : ''}
        `;
      }
      
      if (healthEl) {
        const color = healthReport.status === 'healthy' ? '#22c55e' : 
                      healthReport.status === 'warnings' ? '#f59e0b' : '#ef4444';
        healthEl.innerHTML = `
          Coverage: ${healthReport.observationCoverage}
          | Status: <span style="color:${color};">${healthReport.status.toUpperCase()}</span>
          | Warnings: ${healthReport.warnings.length}
        `;
      }
    } catch (err) {
      const statusEl = document.getElementById('ri-status');
      if (statusEl) {
        statusEl.innerHTML = '⚠️ Error collecting intelligence: ' + err.message;
      }
    }
  }
  
  // Initial update
  update();
  
  // Auto-refresh
  let intervalId = setInterval(update, refreshInterval);
  
  // Return cleanup function
  return function destroy() {
    clearInterval(intervalId);
    container.innerHTML = '';
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeIntelligencePanel = { render };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeIntelligencePanel = { render };
  }
}
