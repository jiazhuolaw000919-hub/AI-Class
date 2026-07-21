/**
 * Engine Signal Health
 * Generates signal health reports.
 * Developer only.
 */

import { OFFICIAL_SIGNALS, SIGNAL_TYPES, SEVERITY_LEVELS } from './engineSignalManifest.js';
import { validateSignals } from './engineSignalValidator.js';

export function generateHealthReport() {
  const totalSignals = OFFICIAL_SIGNALS.length;
  
  // Count by type
  const typeCount = {};
  const severityCount = {};
  const sourceCount = {};
  
  let missingDescription = 0;
  let missingSource = 0;
  let missingVersion = 0;
  
  for (let i = 0; i < OFFICIAL_SIGNALS.length; i++) {
    const s = OFFICIAL_SIGNALS[i];
    
    typeCount[s.type] = (typeCount[s.type] || 0) + 1;
    severityCount[s.severity] = (severityCount[s.severity] || 0) + 1;
    sourceCount[s.source] = (sourceCount[s.source] || 0) + 1;
    
    if (!s.description || s.description.trim() === '') missingDescription++;
    if (!s.source || s.source.trim() === '') missingSource++;
    if (!s.version || s.version.trim() === '') missingVersion++;
  }
  
  // Validation warnings
  const validationWarnings = validateSignals();
  
  // Coverage
  const totalPossibleTypes = SIGNAL_TYPES.length;
  const actualTypes = Object.keys(typeCount).length;
  const coverage = totalPossibleTypes > 0 ? (actualTypes / totalPossibleTypes) * 100 : 0;
  
  // Determine status
  let status = 'healthy';
  if (coverage < 50) status = 'critical';
  else if (coverage < 70) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (missingDescription > 0 || missingSource > 0) status = 'warnings';
  
  return {
    totalSignals: totalSignals,
    types: Object.keys(typeCount),
    typeCount: typeCount,
    severities: Object.keys(severityCount),
    severityCount: severityCount,
    sources: Object.keys(sourceCount),
    sourceCount: sourceCount,
    missingDescription: missingDescription,
    missingSource: missingSource,
    missingVersion: missingVersion,
    totalMissing: missingDescription + missingSource + missingVersion,
    validationWarnings: validationWarnings.length,
    coverage: `${coverage.toFixed(2)}%`,
    coverageScore: Math.round(coverage),
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('📡 Engine Signal Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Signals:', report.totalSignals);
  console.log('Types:', report.types.join(', ') || '(none)');
  console.log('Severities:', report.severities.join(', ') || '(none)');
  console.log('Sources:', report.sources.join(', ') || '(none)');
  console.log('Coverage:', report.coverage);
  if (report.totalMissing > 0) {
    console.warn('⚠️ Missing Metadata:');
    if (report.missingDescription > 0) console.warn('  - Missing description:', report.missingDescription);
    if (report.missingSource > 0) console.warn('  - Missing source:', report.missingSource);
    if (report.missingVersion > 0) console.warn('  - Missing version:', report.missingVersion);
  } else {
    console.log('✅ All signal metadata complete.');
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineSignalHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ EngineSignalHealth ready');
      const report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineSignalHealth = window.engineSignalHealth;
  }
}
