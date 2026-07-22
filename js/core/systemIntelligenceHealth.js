/**
 * System Intelligence Health
 * Generates intelligence health reports.
 * Developer only.
 */

import { INTELLIGENCE_DOMAINS } from './systemIntelligenceManifest.js';
import { collectAll } from './systemIntelligenceCollector.js';
import { validateIntelligence } from './systemIntelligenceValidator.js';

export function generateHealthReport() {
  var domains = INTELLIGENCE_DOMAINS;
  var activeDomains = domains.filter(function(d) { return d.status === 'active'; });

  var collected = collectAll();
  var aggregated = collected.aggregated;

  // Check which domains are actually providing data
  var healthySources = 0;
  var missingSources = 0;
  var sourceDetails = [];

  for (var i = 0; i < domains.length; i++) {
    var d = domains[i];
    var domainData = collected.domains[d.id] || {};
    var isHealthy = domainData.score !== undefined && domainData.score !== null && domainData.score > 0;

    if (isHealthy) {
      healthySources++;
    } else {
      missingSources++;
    }

    sourceDetails.push({
      id: d.id,
      name: d.name,
      healthy: isHealthy,
      score: domainData.score || 0,
      warnings: domainData.warnings || 0,
      violations: domainData.violations || 0
    });
  }

  // Calculate coverage
  var totalDomains = domains.length;
  var coverage = totalDomains > 0 ? Math.round((healthySources / totalDomains) * 100) : 0;

  // Confidence score (weighted by coverage and average health)
  var avgHealth = aggregated.totalHealthScore || 0;
  var confidence = Math.round((coverage * 0.6) + (avgHealth * 0.4));

  // Validation warnings
  var validationWarnings = validateIntelligence();

  // Detect anomalies
  var anomalies = [];
  for (var i = 0; i < sourceDetails.length; i++) {
    var s = sourceDetails[i];
    if (s.warnings > 10) {
      anomalies.push({ source: s.name, issue: 'High warning count: ' + s.warnings });
    }
    if (s.violations > 5) {
      anomalies.push({ source: s.name, issue: 'High violation count: ' + s.violations });
    }
    if (s.score < 50 && s.score > 0) {
      anomalies.push({ source: s.name, issue: 'Low health score: ' + s.score + '%' });
    }
  }

  // Determine status
  var status = 'healthy';
  if (confidence < 30) status = 'critical';
  else if (confidence < 60) status = 'needs_attention';
  else if (validationWarnings.length > 0) status = 'warnings';
  else if (anomalies.length > 0) status = 'warnings';

  return {
    totalSources: totalDomains,
    activeSources: activeDomains.length,
    healthySources: healthySources,
    missingSources: missingSources,
    coverage: coverage + '%',
    coverageScore: coverage,
    confidenceScore: confidence,
    avgHealthScore: aggregated.totalHealthScore || 0,
    totalWarnings: aggregated.totalWarnings || 0,
    totalViolations: aggregated.totalViolations || 0,
    anomalies: anomalies,
    anomalyCount: anomalies.length,
    validationWarnings: validationWarnings.length,
    sourceDetails: sourceDetails,
    status: status,
    timestamp: new Date().toISOString()
  };
}

export function logHealthReport(report) {
  console.group('🧠 System Intelligence Health');
  console.log('Status:', report.status.toUpperCase());
  console.log('Coverage:', report.coverage);
  console.log('Confidence:', report.confidenceScore + '%');
  console.log('Avg Health Score:', report.avgHealthScore + '%');
  console.log('Sources:', report.healthySources + '/' + report.totalSources);
  if (report.missingSources > 0) {
    console.warn('⚠️ Missing Sources:', report.missingSources);
  }
  if (report.anomalyCount > 0) {
    console.warn('⚠️ Anomalies Detected:', report.anomalyCount);
    report.anomalies.forEach(function(a) {
      console.warn('  - ' + a.source + ':', a.issue);
    });
  } else {
    console.log('✅ No anomalies detected.');
  }
  console.log('Validation Warnings:', report.validationWarnings);
  console.groupEnd();
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntelligenceHealth = {
    generateHealthReport: generateHealthReport,
    logHealthReport: logHealthReport,
    getHealth: generateHealthReport,
    init: function() {
      console.log('✅ SystemIntelligenceHealth ready');
      var report = generateHealthReport();
      logHealthReport(report);
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntelligenceHealth = window.systemIntelligenceHealth;
  }
}
