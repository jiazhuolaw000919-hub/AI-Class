/**
 * Engine Discovery Health
 * Generates discovery health reports.
 * Developer only.
 */

import { ENGINE_METADATA } from './engineDiscoveryManifest.js';
import { validateEngineMetadata } from './engineDiscoveryValidator.js';

export function generateHealthReport() {
  const totalEngines = ENGINE_METADATA.length;
  
  // Count by domain
  const domainCount = {};
  const categoryCount = {};
  const capabilitySet = new Set();
  let enginesWithCapabilities = 0;
  
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const e = ENGINE_METADATA[i];
    
    domainCount[e.domain] = (domainCount[e.domain] || 0) + 1;
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    
    if (e.capabilities && e.capabilities.length > 0) {
      enginesWithCapabilities++;
      for (let j = 0; j < e.capabilities.length; j++) {
        capabilitySet.add(e.capabilities[j]);
      }
    }
  }
  
  // Missing metadata
  let missingDescription = 0;
  let missingVersion = 0;
  let missingCapabilities = 0;
  
  for (let i = 0; i < ENGINE_METADATA.length; i++) {
    const e = ENGINE_METADATA[i];
    if (!e.description || e.description.trim() === '') missingDescription++;
    if (!e.version || e.version.trim() === '') missingVersion++;
    if (!e.capabilities || e.capabilities.length === 0) missingCapabilities++;
  }
  
  // Validation warnings
  const validationWarnings = validateEngineMetadata();
  
  // Coverage
  const coverage = totalEngines > 0 ? (enginesWithCapabilities / totalEngines) * 100 : 0;
  
  // Determine status
  let status = 'healthy';
  if (coverage < 50) status = 'critical';
  else if (coverage < 80) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  
  return {
    totalEngines: totalEngines,
    domains: Object.keys(domainCount),
    domainCount: domainCount,
    categories: Object.keys(categoryCount),
    categoryCount: categoryCount,
    totalCapabilities: capabilitySet.size,
    enginesWithCapabilities: enginesWithCapabilities,
    coverage: `${coverage.toFixed(2)}%`,
    coverageScore: Math.round(coverage),
    missingDescription: missingDescription,
    missingVersion: missingVersion,
    missingCapabilities: missingCapabilities,
    totalMissing: missingDescription + missingVersion + missingCapabilities,
    validationWarnings: validationWarnings.length,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🔍 Engine Discovery Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Total Engines:', report.totalEngines);
  console.log('Domains:', report.domains.join(', ') || '(none)');
  console.log('Categories:', report.categories.join(', ') || '(none)');
  console.log('Total Capabilities:', report.totalCapabilities);
  console.log('Coverage:', report.coverage);
  console.log('Engines with Capabilities:', report.enginesWithCapabilities + '/' + report.totalEngines);
  if (report.totalMissing > 0) {
    console.warn('⚠️ Missing Metadata:');
    if (report.missingDescription > 0) console.warn('  - Missing description:', report.missingDescription);
    if (report.missingVersion > 0) console.warn('  - Missing version:', report.missingVersion);
    if (report.missingCapabilities > 0) console.warn('  - Missing capabilities:', report.missingCapabilities);
  } else {
    console.log('✅ All metadata complete.');
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.engineDiscoveryHealth = {
    generateHealthReport,
    logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ EngineDiscoveryHealth ready');
      const report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.EngineDiscoveryHealth = window.engineDiscoveryHealth;
  }
}
