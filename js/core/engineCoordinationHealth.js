/**
 * Engine Coordination Health
 * Generates coordination health reports.
 * Developer only.
 */

import { ENGINE_COORDINATION_MAP } from './engineCoordinationManifest.js';
import { validateAllRelationships } from './engineCoordinationValidator.js';

export function generateHealthReport() {
  const totalEngines = ENGINE_COORDINATION_MAP.length;
  const connectedEngines = ENGINE_COORDINATION_MAP.filter(e => e.connected.length > 0);
  const disconnectedEngines = ENGINE_COORDINATION_MAP.filter(e => e.connected.length === 0);
  
  // Count total relationships
  let totalRelationships = 0;
  for (let i = 0; i < ENGINE_COORDINATION_MAP.length; i++) {
    totalRelationships += ENGINE_COORDINATION_MAP[i].connected.length;
  }
  
  // Count unique relationships
  const relationshipSet = new Set();
  for (let i = 0; i < ENGINE_COORDINATION_MAP.length; i++) {
    const e = ENGINE_COORDINATION_MAP[i];
    for (let j = 0; j < e.connected.length; j++) {
      relationshipSet.add(`${e.engine}->${e.connected[j]}`);
    }
  }
  const uniqueRelationships = relationshipSet.size;
  
  // Detect circular relationships
  const circular = [];
  for (let i = 0; i < ENGINE_COORDINATION_MAP.length; i++) {
    const e = ENGINE_COORDINATION_MAP[i];
    for (let j = 0; j < e.connected.length; j++) {
      const connected = e.connected[j];
      // Check if connected engine references back
      const reverse = ENGINE_COORDINATION_MAP.find(r => 
        r.engine === connected && r.connected.includes(e.engine)
      );
      if (reverse) {
        circular.push(`${e.engine} <-> ${connected}`);
      }
    }
  }
  
  // Remove duplicates from circular
  const uniqueCircular = [...new Set(circular)];
  
  // Validation results
  const validationResults = validateAllRelationships();
  const warningCount = Object.keys(validationResults).reduce((acc, key) => {
    return acc + validationResults[key].length;
  }, 0);
  
  const coverage = totalEngines > 0 
    ? (connectedEngines.length / totalEngines) * 100 
    : 0;
  
  // Determine status
  let status = 'healthy';
  if (coverage < 50) status = 'critical';
  else if (coverage < 80) status = 'needs_attention';
  else if (uniqueCircular.length > 0) status = 'warnings';
  else if (warningCount > 0) status = 'warnings';
  
  return {
    totalEngines: totalEngines,
    connectedEngines: connectedEngines.length,
    disconnectedEngines: disconnectedEngines.length,
    totalRelationships: totalRelationships,
    uniqueRelationships: uniqueRelationships,
    circularRelationships: uniqueCircular,
    circularCount: uniqueCircular.length,
    validationWarnings: warningCount,
    coverage: `${coverage.toFixed(2)}%`,
    coverageScore: Math.round(coverage),
    status: status,
    orphanEngines: disconnectedEngines.map(e => e.engine),
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🤝 Engine Coordination Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Coverage:', report.coverage);
  console.log('Connected Engines:', report.connectedEngines + '/' + report.totalEngines);
  console.log('Disconnected Engines:', report.disconnectedEngines);
  console.log('Total Relationships:', report.totalRelationships);
  console.log('Unique Relationships:', report.uniqueRelationships);
  if (report.circularCount > 0) {
    console.warn('Circular Relationships:', report.circularCount);
    report.circularRelationships.forEach(function(c) {
      console.warn('  ⚠️', c);
    });
  } else {
    console.log('✅ No circular relationships');
  }
  console.log('Validation Warnings:', report.validationWarnings);
  if (report.orphanEngines.length > 0) {
    console.warn('Orphan Engines:', report.orphanEngines.join(', '));
  }
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineCoordinationHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ EngineCoordinationHealth ready');
      const report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineCoordinationHealth = window.engineCoordinationHealth;
  }
}
