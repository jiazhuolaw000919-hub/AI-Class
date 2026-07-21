/**
 * Runtime Reality Health
 * Generates reality health reports.
 * Developer only.
 */

import { collectAll } from './runtimeRealityCollector.js';
import { validateManifestVsRuntime } from './runtimeRealityValidator.js';
import { getEngineMetadata } from './engineDiscoveryManifest.js';

export function generateHealthReport() {
  var runtime = collectAll();
  var validation = validateManifestVsRuntime();
  
  var declaredCount = validation.results.declared.engines.length || 0;
  var runtimeCount = runtime.engines.total || 0;
  var matches = validation.results.matches.engines.length || 0;
  var missing = validation.results.missing.engines.length || 0;
  var unknown = validation.results.unknown.engines.length || 0;
  
  // Calculate reality score
  var totalExpected = declaredCount + unknown;
  var realityScore = totalExpected > 0 ? Math.round((matches / totalExpected) * 100) : 0;
  
  // Runtime completeness
  var expectedItems = [
    { label: 'engines', value: runtime.engines.total, target: Math.max(declaredCount, runtimeCount) },
    { label: 'modules', value: runtime.modules.total, target: runtime.modules.total },
    { label: 'domains', value: runtime.domains.total, target: runtime.domains.total },
    { label: 'features', value: runtime.features.total, target: runtime.features.total }
  ];
  
  var completenessScore = 0;
  var completedItems = 0;
  for (var i = 0; i < expectedItems.length; i++) {
    var item = expectedItems[i];
    if (item.target > 0 && item.value > 0) {
      completenessScore += Math.min((item.value / item.target) * 25, 25);
      completedItems++;
    } else if (item.target === 0) {
      completenessScore += 25;
      completedItems++;
    }
  }
  var completeness = completedItems > 0 ? Math.round((completenessScore / (completedItems * 25)) * 100) : 0;
  
  // Determine status
  var status = 'healthy';
  if (realityScore < 50) status = 'critical';
  else if (realityScore < 80) status = 'needs_attention';
  else if (missing > 0 || unknown > 0) status = 'warnings';
  
  return {
    realityScore: realityScore,
    completeness: completeness + '%',
    completenessScore: completeness,
    declaredEngines: declaredCount,
    runtimeEngines: runtimeCount,
    matches: matches,
    missing: missing,
    unknown: unknown,
    runtime: runtime,
    validation: validation,
    status: status,
    coverage: realityScore + '%',
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧠 System Reality');
  console.log('Status:', report.status.toUpperCase());
  console.log('Reality Score:', report.realityScore + '%');
  console.log('Completeness:', report.completeness);
  console.log('Declared Engines:', report.declaredEngines);
  console.log('Runtime Engines:', report.runtimeEngines);
  console.log('Matches:', report.matches);
  if (report.missing > 0) {
    console.warn('❌ Missing:', report.missing);
  }
  if (report.unknown > 0) {
    console.warn('❓ Unknown:', report.unknown);
  }
  if (report.missing === 0 && report.unknown === 0) {
    console.log('✅ Manifest matches runtime.');
  }
  console.log('Validation Warnings:', report.validation.warningCount);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.runtimeRealityHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ RuntimeRealityHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeRealityHealth = window.runtimeRealityHealth;
  }
}
