/**
 * System Adaptation Collector
 * Collects adaptation signals from existing intelligence layers.
 * Observation only – no execution.
 */

import { ADAPTATION_SIGNALS } from './systemAdaptationManifest.js';

// Store collected signals
var _signalHistory = [];
var _recommendations = [];

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    signals: [],
    recommendations: [],
    conditions: {},
    patterns: {},
    opportunities: []
  };

  // Collect signals from each intelligence layer
  var signals = collectSignals();
  result.signals = signals;

  // Collect conditions
  var conditions = collectConditions();
  result.conditions = conditions;

  // Collect patterns
  var patterns = collectPatterns();
  result.patterns = patterns;

  // Collect opportunities
  var opportunities = collectOpportunities(signals, conditions, patterns);
  result.opportunities = opportunities;

  // Generate recommendations
  var recommendations = generateRecommendations(signals, conditions, patterns, opportunities);
  result.recommendations = recommendations;
  _recommendations = recommendations;

  // Store signals in history
  for (var i = 0; i < signals.length; i++) {
    _signalHistory.push({
      signal: signals[i],
      timestamp: new Date().toISOString()
    });
  }

  // Trim history
  if (_signalHistory.length > 100) {
    _signalHistory = _signalHistory.slice(-100);
  }

  return result;
}

function collectSignals() {
  var signals = [];
  var allSignals = ADAPTATION_SIGNALS;

  // Check each signal source
  try {
    var awareness = LawAIApp.SystemAwarenessHealth || window.systemAwarenessHealth;
    if (awareness && typeof awareness.getHealth === 'function') {
      signals.push({ id: 'LEARNING_PATTERN', source: 'SystemAwareness', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  try {
    var intelligence = LawAIApp.SystemIntelligenceHealth || window.systemIntelligenceHealth;
    if (intelligence && typeof intelligence.getHealth === 'function') {
      signals.push({ id: 'RUNTIME_CONDITION', source: 'SystemIntelligence', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  try {
    var memory = LawAIApp.SystemMemoryHealth || window.systemMemoryHealth;
    if (memory && typeof memory.getHealth === 'function') {
      signals.push({ id: 'MEMORY_GROWTH', source: 'SystemMemory', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  try {
    var reflection = LawAIApp.SystemReflectionHealth || window.systemReflectionHealth;
    if (reflection && typeof reflection.getHealth === 'function') {
      signals.push({ id: 'REFLECTION_INSIGHT', source: 'SystemReflection', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  try {
    var decision = LawAIApp.SystemDecisionHealth || window.systemDecisionHealth;
    if (decision && typeof decision.getHealth === 'function') {
      signals.push({ id: 'DECISION_TRIGGER', source: 'SystemDecision', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  try {
    var intention = LawAIApp.SystemIntentionHealth || window.systemIntentionHealth;
    if (intention && typeof intention.getHealth === 'function') {
      signals.push({ id: 'INTENTION_SHIFT', source: 'SystemIntention', status: 'active' });
    }
  } catch (e) { /* ignore */ }

  return signals;
}

function collectConditions() {
  var conditions = {};

  try {
    // Runtime condition
    var runtime = LawAIApp.RuntimeHealth || window.runtimeHealth;
    if (runtime && typeof runtime.getHealth === 'function') {
      var data = runtime.getHealth();
      conditions.runtime = {
        status: data.status || 'unknown',
        health: data.healthScore || 0
      };
    }
  } catch (e) { /* ignore */ }

  try {
    // Memory condition
    var memory = LawAIApp.SystemMemoryHealth || window.systemMemoryHealth;
    if (memory && typeof memory.getHealth === 'function') {
      var data = memory.getHealth();
      conditions.memory = {
        entries: data.totalEntries || 0,
        coverage: data.coverageScore || 0
      };
    }
  } catch (e) { /* ignore */ }

  try {
    // Decision condition
    var decision = LawAIApp.SystemDecisionHealth || window.systemDecisionHealth;
    if (decision && typeof decision.getHealth === 'function') {
      var data = decision.getHealth();
      conditions.decision = {
        total: data.totalDecisions || 0,
        errors: data.errors || 0
      };
    }
  } catch (e) { /* ignore */ }

  return conditions;
}

function collectPatterns() {
  var patterns = {};

  try {
    var reflection = LawAIApp.SystemReflectionDashboard || window.systemReflectionDashboard;
    if (reflection && typeof reflection.getTrends === 'function') {
      var trends = reflection.getTrends();
      patterns.trends = trends;
    }
  } catch (e) { /* ignore */ }

  try {
    var memory = LawAIApp.SystemMemoryHealth || window.systemMemoryHealth;
    if (memory && typeof memory.getHealth === 'function') {
      var data = memory.getHealth();
      patterns.memoryGrowth = data.totalEntries > 100 ? 'high' : 'normal';
    }
  } catch (e) { /* ignore */ }

  return patterns;
}

function collectOpportunities(signals, conditions, patterns) {
  var opportunities = [];

  // Check for learning opportunities
  if (signals.some(function(s) { return s.id === 'LEARNING_PATTERN'; })) {
    opportunities.push({
      type: 'LEARNING_ADAPTATION',
      category: 'Learning',
      description: 'Learning patterns detected, opportunity to adapt learning experience'
    });
  }

  // Check for runtime opportunities
  if (signals.some(function(s) { return s.id === 'RUNTIME_CONDITION'; }) && conditions.runtime && conditions.runtime.health < 70) {
    opportunities.push({
      type: 'RUNTIME_ADAPTATION',
      category: 'Runtime',
      description: 'Runtime health below threshold, opportunity for runtime adaptation'
    });
  }

  // Check for memory opportunities
  if (signals.some(function(s) { return s.id === 'MEMORY_GROWTH'; }) && patterns.memoryGrowth === 'high') {
    opportunities.push({
      type: 'EXPERIENCE_ADAPTATION',
      category: 'Experience',
      description: 'High memory growth, opportunity for experience adaptation'
    });
  }

  // Check for performance opportunities
  if (signals.some(function(s) { return s.id === 'DECISION_TRIGGER'; }) && conditions.decision && conditions.decision.errors > 3) {
    opportunities.push({
      type: 'PERFORMANCE_ADAPTATION',
      category: 'Performance',
      description: 'High decision errors, opportunity for performance adaptation'
    });
  }

  return opportunities;
}

function generateRecommendations(signals, conditions, patterns, opportunities) {
  var recommendations = [];

  for (var i = 0; i < opportunities.length; i++) {
    var opp = opportunities[i];
    recommendations.push({
      id: 'REC_' + (i + 1),
      type: opp.type,
      category: opp.category,
      description: opp.description,
      priority: i === 0 ? 'high' : 'medium',
      timestamp: new Date().toISOString()
    });
  }

  return recommendations;
}

export function getRecommendations() {
  return _recommendations.slice();
}

export function getSignalHistory() {
  return _signalHistory.slice();
}

export function getSignalCount() {
  return _signalHistory.length;
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemAdaptationCollector = {
    collectAll: collectAll,
    getRecommendations: getRecommendations,
    getSignalHistory: getSignalHistory,
    getSignalCount: getSignalCount,
    init: function() {
      console.log('✅ SystemAdaptationCollector ready');
      var result = collectAll();
      console.log('📡 Adaptation Signals:', result.signals.length + ' signals, ' + result.recommendations.length + ' recommendations');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemAdaptationCollector = window.systemAdaptationCollector;
  }
}
