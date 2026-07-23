/**
 * Runtime Event Intelligence Engine
 * Runtime Event Intelligence Engine
 * Part 44.6 - Runtime Event Intelligence Engine
 */

// ============================================================
// INTELLIGENCE STATE
// ============================================================

var _insightCache = null;
var _isInitialized = false;
var _recommendationIdCounter = 0;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAnalyzer() {
  return LawAIApp.RuntimeEventAnalyzer || window.runtimeEventAnalyzer;
}

function getStore() {
  return LawAIApp.RuntimeEventStore || window.runtimeEventStore;
}

function getRegistry() {
  return LawAIApp.RuntimeEventRegistry || window.runtimeEventRegistry;
}

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (e) {
    if (isDebugMode()) {
      console.warn('[Event Intelligence] Error:', e.message);
    }
    return fallback !== undefined ? fallback : null;
  }
}

function getEventName(eventId) {
  var registry = getRegistry();
  if (!registry) return eventId;
  var def = safeCall(function() {
    if (typeof registry.get === 'function') {
      return registry.get(eventId);
    }
    return null;
  }, null);
  return def ? def.name : eventId;
}

function generateInsightId() {
  var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  var random = Math.random().toString(36).substring(2, 6);
  return 'insight_' + timestamp + '_' + random;
}

function generateRecommendationId() {
  _recommendationIdCounter++;
  return 'rec_' + _recommendationIdCounter;
}

// ============================================================
// INSIGHT GENERATION
// ============================================================

function generateInsight(type, severity, confidence, summary, recommendation, metadata) {
  return {
    id: generateInsightId(),
    type: type,
    severity: severity || 'info',
    confidence: confidence || 0,
    summary: summary || '',
    recommendation: recommendation || null,
    metadata: metadata || {},
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// DEPENDENCY DISCOVERY
// ============================================================

function discoverDependencies(analysis) {
  var dependencies = [];
  var insights = [];

  if (!analysis || !analysis.relationships || analysis.relationships.length === 0) {
    return { dependencies: [], insights: [] };
  }

  var relationships = analysis.relationships;

  for (var i = 0; i < relationships.length; i++) {
    var rel = relationships[i];
    if (rel.count >= 3) {
      var dependency = {
        from: rel.from,
        fromName: rel.fromName,
        to: rel.to,
        toName: rel.toName,
        count: rel.count,
        strength: Math.min(rel.count * 10, 100)
      };
      dependencies.push(dependency);

      // Generate insight for strong dependencies
      if (rel.count >= 5) {
        insights.push(generateInsight(
          'dependency',
          'info',
          Math.min(rel.count * 10, 98),
          'Strong dependency detected: ' + rel.fromName + ' → ' + rel.toName + ' (' + rel.count + ' occurrences)',
          'Consider optimizing load order or merging these modules.',
          { from: rel.from, to: rel.to, count: rel.count }
        ));
      }
    }
  }

  return { dependencies: dependencies, insights: insights };
}

// ============================================================
// PATTERN INSIGHTS
// ============================================================

function generatePatternInsights(analysis) {
  var insights = [];

  if (!analysis || !analysis.patterns) {
    return insights;
  }

  var patterns = analysis.patterns;

  // Repeated events
  if (patterns.repeated && patterns.repeated.length > 0) {
    for (var i = 0; i < Math.min(patterns.repeated.length, 3); i++) {
      var p = patterns.repeated[i];
      if (p.count > 5) {
        insights.push(generateInsight(
          'repeated_pattern',
          'info',
          Math.min(p.count * 5, 95),
          'Repeated event detected: "' + p.name + '" occurred ' + p.count + ' times',
          'Check if this event is firing too frequently or if it should be batched.',
          { eventId: p.eventId, count: p.count }
        ));
      }
    }
  }

  // Missing events
  if (patterns.missing && patterns.missing.length > 0) {
    for (var i = 0; i < Math.min(patterns.missing.length, 3); i++) {
      var p = patterns.missing[i];
      insights.push(generateInsight(
        'missing_event',
        'warning',
        70,
        'Expected event not found: "' + p.name + '"',
        'Check if this event should have been triggered. It may indicate an issue.',
        { eventId: p.eventId }
      ));
    }
  }

  return insights;
}

// ============================================================
// SEQUENCE INSIGHTS
// ============================================================

function generateSequenceInsights(analysis) {
  var insights = [];

  if (!analysis || !analysis.sequences) {
    return insights;
  }

  var sequences = analysis.sequences;

  // Short sequences
  if (sequences.short && sequences.short.length > 0) {
    for (var i = 0; i < Math.min(sequences.short.length, 3); i++) {
      var seq = sequences.short[i];
      if (seq.occurrences >= 3) {
        var seqNames = seq.sequence.map(function(s) { return s.name; }).join(' → ');
        insights.push(generateInsight(
          'sequence_pattern',
          'info',
          Math.min(seq.occurrences * 15, 95),
          'Repeating sequence detected: ' + seqNames + ' (' + seq.occurrences + ' times)',
          'This sequence occurs regularly. Consider optimizing this workflow.',
          { sequence: seq.sequence.map(function(s) { return s.eventId; }), occurrences: seq.occurrences }
        ));
      }
    }
  }

  return insights;
}

// ============================================================
// RISK DETECTION
// ============================================================

function detectRisks(analysis) {
  var risks = [];
  var insights = [];

  if (!analysis || !analysis.summary) {
    return { risks: [], insights: [] };
  }

  var summary = analysis.summary;

  // Check for high missing events
  if (analysis.patterns && analysis.patterns.missing && analysis.patterns.missing.length > 3) {
    risks.push({
      type: 'missing_events',
      severity: 'warning',
      count: analysis.patterns.missing.length,
      description: 'Multiple expected events are missing'
    });
    insights.push(generateInsight(
      'risk',
      'warning',
      75,
      'Multiple missing events detected: ' + analysis.patterns.missing.length + ' events not found',
      'Review the event flow to ensure all expected events are being triggered.',
      { missingCount: analysis.patterns.missing.length }
    ));
  }

  // Check for event count anomalies
  if (summary.totalEvents > 0) {
    var categories = Object.keys(analysis.statistics.categories || {});
    if (categories.length === 0 && summary.totalEvents > 10) {
      risks.push({
        type: 'uncategorized_events',
        severity: 'info',
        description: 'Events without categories'
      });
    }
  }

  // Check for potential circular dependencies
  if (analysis.relationships && analysis.relationships.length > 5) {
    risks.push({
      type: 'complex_dependencies',
      severity: 'info',
      count: analysis.relationships.length,
      description: 'Multiple event relationships may indicate complex dependencies'
    });
  }

  return { risks: risks, insights: insights };
}

// ============================================================
// RECOMMENDATION ENGINE
// ============================================================

function generateRecommendations(analysis, insights) {
  var recommendations = [];

  // Skip if no analysis
  if (!analysis || !analysis.summary || analysis.summary.totalEvents === 0) {
    return recommendations;
  }

  // Based on insights
  for (var i = 0; i < insights.length; i++) {
    var insight = insights[i];
    if (insight.recommendation) {
      recommendations.push({
        id: generateRecommendationId(),
        insightId: insight.id,
        type: insight.type,
        summary: insight.recommendation,
        confidence: insight.confidence,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Additional recommendations based on analysis
  if (analysis.summary.totalEvents > 100) {
    recommendations.push({
      id: generateRecommendationId(),
      type: 'performance',
      summary: 'High event volume detected. Consider batching events to reduce overhead.',
      confidence: 85,
      timestamp: new Date().toISOString()
    });
  }

  if (analysis.relationships && analysis.relationships.length > 10) {
    recommendations.push({
      id: generateRecommendationId(),
      type: 'architecture',
      summary: 'Complex event relationships detected. Consider simplifying the event flow.',
      confidence: 80,
      timestamp: new Date().toISOString()
    });
  }

  return recommendations;
}

// ============================================================
// CORE API
// ============================================================

export function generate(sessionId) {
  var analyzer = getAnalyzer();
  if (!analyzer) {
    if (isDebugMode()) {
      console.warn('[Event Intelligence] Analyzer not available');
    }
    return getDefaultResult();
  }

  if (isDebugMode()) {
    console.log('[Event Intelligence] Generating insights...');
  }

  // Get analysis
  var analysis = null;
  if (typeof analyzer.analyze === 'function') {
    analysis = safeCall(function() {
      return analyzer.analyze(sessionId);
    }, null);
  }

  if (!analysis || !analysis.summary || analysis.summary.totalEvents === 0) {
    if (isDebugMode()) {
      console.warn('[Event Intelligence] No analysis data available');
    }
    return getDefaultResult();
  }

  // Generate insights
  var allInsights = [];

  // 1. Dependency insights
  var dependencyResult = discoverDependencies(analysis);
  allInsights = allInsights.concat(dependencyResult.insights);

  // 2. Pattern insights
  var patternInsights = generatePatternInsights(analysis);
  allInsights = allInsights.concat(patternInsights);

  // 3. Sequence insights
  var sequenceInsights = generateSequenceInsights(analysis);
  allInsights = allInsights.concat(sequenceInsights);

  // 4. Risk insights
  var riskResult = detectRisks(analysis);
  allInsights = allInsights.concat(riskResult.insights);

  // Generate recommendations
  var recommendations = generateRecommendations(analysis, allInsights);

  // Build result
  var result = {
    insights: allInsights,
    dependencies: dependencyResult.dependencies,
    risks: riskResult.risks,
    recommendations: recommendations,
    summary: {
      totalInsights: allInsights.length,
      totalDependencies: dependencyResult.dependencies.length,
      totalRisks: riskResult.risks.length,
      totalRecommendations: recommendations.length,
      hasData: true
    },
    timestamp: new Date().toISOString()
  };

  _insightCache = result;

  if (isDebugMode()) {
    console.log('[Event Intelligence] Insights Generated:', result.summary.totalInsights);
    console.log('[Event Intelligence] Recommendations:', result.summary.totalRecommendations);
  }

  return result;
}

export function getInsights() {
  if (!_insightCache) {
    generate();
  }
  return _insightCache ? _insightCache.insights : [];
}

export function getRecommendations() {
  if (!_insightCache) {
    generate();
  }
  return _insightCache ? _insightCache.recommendations : [];
}

export function getRisks() {
  if (!_insightCache) {
    generate();
  }
  return _insightCache ? _insightCache.risks : [];
}

export function getDependencies() {
  if (!_insightCache) {
    generate();
  }
  return _insightCache ? _insightCache.dependencies : [];
}

export function getIntelligenceReport() {
  if (!_insightCache) {
    generate();
  }
  if (!_insightCache) {
    return getDefaultResult();
  }
  return _insightCache;
}

export function reset() {
  _insightCache = null;
  _recommendationIdCounter = 0;
  if (isDebugMode()) {
    console.log('[Event Intelligence] Cache reset');
  }
}

function getDefaultResult() {
  return {
    insights: [],
    dependencies: [],
    risks: [],
    recommendations: [],
    summary: {
      totalInsights: 0,
      totalDependencies: 0,
      totalRisks: 0,
      totalRecommendations: 0,
      hasData: false
    },
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initIntelligence() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Event Intelligence] Initialized');
  }

  return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeEventIntelligence = {
    generate: generate,
    getInsights: getInsights,
    getRecommendations: getRecommendations,
    getRisks: getRisks,
    getDependencies: getDependencies,
    getIntelligenceReport: getIntelligenceReport,
    reset: reset,
    init: function() {
      var result = initIntelligence();
      console.log('✅ RuntimeEventIntelligence ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventIntelligence = window.runtimeEventIntelligence;
  }
}
