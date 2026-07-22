/**
 * System Decision Engine
 * Generates rule-based decisions from existing observations.
 * Never executes actions.
 */

import { DECISION_RULES, DECISION_TYPES } from './systemDecisionManifest.js';

// Store generated decisions
var _decisions = [];

export function generateDecisions() {
  var observations = collectObservations();
  var decisions = [];
  
  var rules = DECISION_RULES.filter(function(r) { return r.status === 'active'; });
  
  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    var decision = evaluateRule(rule, observations);
    if (decision) {
      decisions.push(decision);
    }
  }
  
  _decisions = decisions;
  
  return {
    timestamp: new Date().toISOString(),
    decisions: decisions,
    count: decisions.length
  };
}

function collectObservations() {
  var observations = {
    healthScore: 100,
    recoveryScore: 100,
    memoryEntries: 0,
    deprecatedEngines: 0,
    circularDependencies: 0,
    runtimeErrors: 0,
    architectureViolations: 0,
    governanceWarnings: 0,
    totalEngines: 0
  };
  
  try {
    // Health score from RuntimeHealth
    var runtimeHealth = LawAIApp.RuntimeHealth || window.runtimeHealth;
    if (runtimeHealth && typeof runtimeHealth.getHealth === 'function') {
      var data = runtimeHealth.getHealth();
      observations.healthScore = data.healthScore || 100;
      observations.runtimeErrors = data.errors || 0;
    }
    
    // Recovery score from RecoveryReport
    var recReport = LawAIApp.RecoveryReport || window.recoveryReport;
    if (recReport && typeof recReport.getReport === 'function') {
      var data = recReport.getReport();
      if (data && data.overall) {
        observations.recoveryScore = data.overall.score || 100;
      }
    }
    
    // Memory entries from SystemMemoryCollector
    var memoryCollector = LawAIApp.SystemMemoryCollector || window.systemMemoryCollector;
    if (memoryCollector && typeof memoryCollector.getHistoryCount === 'function') {
      observations.memoryEntries = memoryCollector.getHistoryCount() || 0;
    }
    
    // Engine health from EngineHealth
    var engineHealth = LawAIApp.EngineHealth || window.engineHealth;
    if (engineHealth && typeof engineHealth.getHealth === 'function') {
      var data = engineHealth.getHealth();
      observations.totalEngines = data.totalEngines || 0;
      observations.deprecatedEngines = data.deprecatedEngines || 0;
    }
    
    // Dependency health
    var depHealth = LawAIApp.DependencyHealth || window.dependencyHealth;
    if (depHealth && typeof depHealth.getHealth === 'function') {
      var data = depHealth.getHealth();
      observations.circularDependencies = data.circularCount || 0;
    }
    
    // Architecture validator
    var archValidator = LawAIApp.ArchitectureValidator || window.architectureValidator;
    if (archValidator) {
      observations.architectureViolations = (archValidator.violations || []).length;
    }
    
    // Governance health
    var govHealth = LawAIApp.GovernanceHealth || window.governanceHealth;
    if (govHealth && typeof govHealth.getHealth === 'function') {
      var data = govHealth.getHealth();
      observations.governanceWarnings = data.warnings || 0;
    }
  } catch (e) { /* ignore */ }
  
  return observations;
}

function evaluateRule(rule, observations) {
  var conditionMet = false;
  var details = '';
  
  switch (rule.id) {
    case 'HEALTH_LOW':
      if (observations.healthScore < 60) {
        conditionMet = true;
        details = 'Health score is ' + observations.healthScore + '% (threshold: 60%)';
      }
      break;
      
    case 'RECOVERY_NEEDED':
      if (observations.recoveryScore < 50) {
        conditionMet = true;
        details = 'Recovery score is ' + observations.recoveryScore + '% (threshold: 50%)';
      }
      break;
      
    case 'MEMORY_HIGH':
      if (observations.memoryEntries > 800) {
        conditionMet = true;
        details = 'Memory entries: ' + observations.memoryEntries + ' (threshold: 800)';
      }
      break;
      
    case 'REGISTRY_DEPRECATED':
      if (observations.totalEngines > 0) {
        var deprecatedPercent = (observations.deprecatedEngines / observations.totalEngines) * 100;
        if (deprecatedPercent > 10) {
          conditionMet = true;
          details = 'Deprecated engines: ' + deprecatedPercent.toFixed(1) + '% (threshold: 10%)';
        }
      }
      break;
      
    case 'DEPENDENCY_CIRCULAR':
      if (observations.circularDependencies > 3) {
        conditionMet = true;
        details = 'Circular dependencies: ' + observations.circularDependencies + ' (threshold: 3)';
      }
      break;
      
    case 'RUNTIME_ERROR':
      if (observations.runtimeErrors > 5) {
        conditionMet = true;
        details = 'Runtime errors: ' + observations.runtimeErrors + ' (threshold: 5)';
      }
      break;
      
    case 'ARCHITECTURE_VIOLATION':
      if (observations.architectureViolations > 5) {
        conditionMet = true;
        details = 'Architecture violations: ' + observations.architectureViolations + ' (threshold: 5)';
      }
      break;
      
    case 'GOVERNANCE_WARNING':
      if (observations.governanceWarnings > 10) {
        conditionMet = true;
        details = 'Governance warnings: ' + observations.governanceWarnings + ' (threshold: 10)';
      }
      break;
      
    default:
      break;
  }
  
  if (conditionMet) {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      decision: rule.decision,
      category: rule.category,
      severity: rule.severity,
      condition: rule.condition,
      details: details,
      timestamp: new Date().toISOString()
    };
  }
  
  return null;
}

export function getDecisions() {
  return _decisions.slice();
}

export function getDecisionsBySeverity(severity) {
  return _decisions.filter(function(d) { return d.severity === severity; });
}

export function getDecisionsByCategory(category) {
  return _decisions.filter(function(d) { return d.category === category; });
}

export function getDecisionCount() {
  return _decisions.length;
}

export function getSummary() {
  var errors = _decisions.filter(function(d) { return d.severity === 'error'; });
  var warnings = _decisions.filter(function(d) { return d.severity === 'warning'; });
  
  return {
    total: _decisions.length,
    errors: errors.length,
    warnings: warnings.length,
    categories: _decisions.map(function(d) { return d.category; }),
    decisionTypes: _decisions.map(function(d) { return d.decision; })
  };
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemDecisionEngine = {
    generateDecisions: generateDecisions,
    getDecisions: getDecisions,
    getDecisionsBySeverity: getDecisionsBySeverity,
    getDecisionsByCategory: getDecisionsByCategory,
    getDecisionCount: getDecisionCount,
    getSummary: getSummary,
    init: function() {
      console.log('✅ SystemDecisionEngine ready');
      var result = generateDecisions();
      console.log('📋 Decisions Generated:', result.count + ' decisions');
      return this;
    }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemDecisionEngine = window.systemDecisionEngine;
  }
}
