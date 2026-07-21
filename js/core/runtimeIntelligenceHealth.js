/**
 * Runtime Intelligence Health
 * Generates observation health reports.
 * Developer only.
 */

import { OBSERVATION_TARGETS } from './runtimeIntelligenceManifest.js';
import { validateObservation } from './runtimeIntelligenceValidator.js';

export function generateHealthReport(observedSystems = []) {
  const totalTargets = OBSERVATION_TARGETS.length;
  const observedIds = observedSystems.map(s => s.id);
  
  const healthyTargets = OBSERVATION_TARGETS.filter(t => observedIds.includes(t.id));
  const unknownTargets = OBSERVATION_TARGETS.filter(t => !observedIds.includes(t.id));
  
  const coverage = totalTargets > 0
    ? (healthyTargets.length / totalTargets) * 100
    : 0;
  
  const warnings = [];
  for (const obs of observedSystems) {
    const w = validateObservation(obs.id, obs.source, obs.type);
    if (w.length > 0) {
      warnings.push({ target: obs.id, warnings: w });
    }
  }
  
  // Determine status
  let status = 'healthy';
  if (coverage < 50) status = 'critical';
  else if (coverage < 80) status = 'needs_attention';
  else if (warnings.length > 0) status = 'warnings';
  
  return {
    observationCoverage: `${coverage.toFixed(2)}%`,
    observedSystems: healthyTargets.map(t => t.name),
    observedCount: healthyTargets.length,
    totalTargets: totalTargets,
    healthyTargets: healthyTargets.length,
    unknownTargets: unknownTargets.length,
    warnings: warnings,
    status: status,
    coverageScore: Math.round(coverage),
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('⚡ Runtime Intelligence Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Coverage:', report.observationCoverage);
  console.log('Observed Systems:', report.observedSystems.join(', ') || '(none)');
  console.log('Unknown Targets:', report.unknownTargets);
  console.log('Warnings:', report.warnings.length);
  if (report.warnings.length > 0) {
    console.warn('Validation Warnings:');
    report.warnings.forEach(({ target, warnings }) => {
      console.warn(`  ${target}:`, warnings.join('; '));
    });
  } else {
    console.log('✅ All observations valid.');
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeIntelligenceHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: function() {
      // Collect observed systems from existing components
      const observed = [];
      
      try {
        // Check what's available
        const runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
        if (runtimeStatus) {
          observed.push({ id: 'runtime_status', source: 'LawAIApp', type: 'status' });
          observed.push({ id: 'runtime_health', source: 'LawAIApp', type: 'health' });
        }
        
        const lifecycle = LawAIApp.LifecycleHealth || window.lifecycleHealth;
        if (lifecycle) {
          observed.push({ id: 'lifecycle_state', source: 'LawAIApp', type: 'state' });
        }
        
        const registry = LawAIApp.RuntimeRegistry || window.runtimeRegistry;
        if (registry) {
          observed.push({ id: 'registry_modules', source: 'LawAIApp', type: 'modules' });
        }
        
        const engines = LawAIApp.EngineRegistry || window.engineRegistry;
        if (engines) {
          observed.push({ id: 'registry_engines', source: 'LawAIApp', type: 'engines' });
        }
        
        const health = LawAIApp.GovernanceHealth || window.governanceHealth;
        if (health) {
          observed.push({ id: 'health_scores', source: 'LawAIApp', type: 'scores' });
        }
      } catch (e) { /* ignore */ }
      
      return generateHealthReport(observed);
    },
    init: function() {
      console.log('✅ RuntimeIntelligenceHealth ready');
      const report = this.getHealth();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeIntelligenceHealth = {
      generateHealthReport,
      logHealthReport,
      getHealth: window.runtimeIntelligenceHealth.getHealth,
      init: window.runtimeIntelligenceHealth.init
    };
  }
}
