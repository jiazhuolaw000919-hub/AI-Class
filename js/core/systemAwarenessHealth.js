/**
 * System Awareness Health
 * Generates system awareness health reports.
 * Developer only.
 */

import { AWARENESS_SOURCES } from './systemAwarenessManifest.js';
import { validateAwareness } from './systemAwarenessValidator.js';
import { collectAll } from './systemAwarenessCollector.js';

export function generateHealthReport() {
  var sources = AWARENESS_SOURCES;
  var activeSources = sources.filter(function(s) { return s.status === 'active'; });
  
  // Collect actual data
  var data = collectAll();
  
  // Calculate health score from actual data
  var healthScore = 0;
  var components = 0;
  
  if (data.runtime && data.runtime.ready !== undefined) {
    healthScore += data.runtime.ready ? 20 : 0;
    components++;
  }
  if (data.engine && data.engine.total > 0) {
    healthScore += Math.min((data.engine.active / (data.engine.total || 1)) * 20, 20);
    components++;
  }
  if (data.domain && data.domain.populated > 0) {
    healthScore += Math.min((data.domain.populated / (data.domain.total || 1)) * 20, 20);
    components++;
  }
  if (data.capability && data.capability.coverage > 0) {
    healthScore += Math.min((data.capability.coverage / 100) * 20, 20);
    components++;
  }
  if (data.health && data.health.overall > 0) {
    healthScore += Math.min((data.health.overall / 100) * 20, 20);
    components++;
  }
  
  // If no components, set default
  var finalScore = components > 0 ? Math.round((healthScore / (components * 20)) * 100) : 0;
  
  // Validation warnings
  var validationWarnings = validateAwareness();
  
  // Determine status
  var status = 'healthy';
  if (finalScore < 30) status = 'critical';
  else if (finalScore < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  
  // Determine known vs unknown systems
  var knownSystems = 0;
  var unknownSystems = 0;
  
  try {
    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
      var known = ['RuntimeStatus', 'RuntimeKernel', 'EngineRegistry', 'DomainRegistry', 'CapabilityHealth', 'RuntimeHealth', 'LifecycleHealth', 'GovernanceHealth'];
      for (var i = 0; i < known.length; i++) {
        if (LawAIApp[known[i]]) knownSystems++;
        else unknownSystems++;
      }
    }
  } catch (err) {
    unknownSystems = 5;
  }
  
  return {
    coverage: finalScore + '%',
    coverageScore: finalScore,
    knownSystems: knownSystems,
    unknownSystems: unknownSystems,
    totalSources: sources.length,
    activeSources: activeSources.length,
    validationWarnings: validationWarnings.length,
    status: status,
    runtime: data.runtime,
    engine: data.engine,
    domain: data.domain,
    capability: data.capability,
    health: data.health,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧠 System Awareness Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Coverage:', report.coverage);
  console.log('Known Systems:', report.knownSystems + '/' + (report.knownSystems + report.unknownSystems));
  console.log('Active Sources:', report.activeSources + '/' + report.totalSources);
  console.log('Runtime:', report.runtime.status + ' | ' + report.runtime.version);
  console.log('Engine:', report.engine.active + '/' + report.engine.total);
  console.log('Domain:', report.domain.populated + '/' + report.domain.total);
  console.log('Capability:', report.capability.defined + '/' + report.capability.total + ' (' + report.capability.coverage + '%)');
  console.log('Health:', report.health.overall + '%');
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAwarenessHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemAwarenessHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAwarenessHealth = window.systemAwarenessHealth;
  }
}
