/**
 * State Intelligence
 * Runtime State Intelligence Layer
 * Part 45.6 - State Intelligence Layer
 */

// ============================================================
// INTELLIGENCE STATE
// ============================================================

var _insightCache = null;
var _isInitialized = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getEngine() {
    return LawAIApp.StateSyncEngine || window.stateSyncEngine;
}

function getPersistence() {
    return LawAIApp.StatePersistence || window.statePersistence;
}

function getRegistry() {
    return LawAIApp.StateRegistry || window.stateRegistry;
}

function getManifest() {
    return LawAIApp.StateSyncManifest || window.stateSyncManifest;
}

function isDebugMode() {
    try {
        var manifest = getManifest();
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
            console.warn('[State Intelligence] Error:', e.message);
        }
        return fallback !== undefined ? fallback : null;
    }
}

function generateInsightId() {
    var timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    var random = Math.random().toString(36).substring(2, 6);
    return 'insight_' + timestamp + '_' + random;
}

// ============================================================
// STATE ANALYSIS
// ============================================================

export function analyzeState(stateId) {
    var engine = getEngine();
    if (!engine) {
        return { success: false, error: 'Engine not available' };
    }

    var currentValue = safeCall(function() {
        if (typeof engine.get === 'function') {
            return engine.get(stateId);
        }
        return null;
    }, null);

    if (currentValue === null || currentValue === undefined) {
        return { success: false, error: 'State not found: ' + stateId };
    }

    var history = safeCall(function() {
        if (typeof engine.getHistory === 'function') {
            return engine.getHistory(stateId, 20);
        }
        return [];
    }, []);

    // Analyze state
    var analysis = {
        stateId: stateId,
        currentValue: currentValue,
        historyCount: history.length,
        changes: history.length > 0 ? history.length : 0,
        lastChange: history.length > 0 ? history[history.length - 1] : null
    };

    // Detect patterns
    var patterns = detectPatterns(stateId, history);
    analysis.patterns = patterns;

    // Detect anomalies
    var anomalies = detectAnomalies(stateId, currentValue, history);
    analysis.anomalies = anomalies;

    if (isDebugMode()) {
        console.log('[State Intelligence] Analysis complete for:', stateId);
        console.log('[State Intelligence] Patterns:', patterns.length, 'Anomalies:', anomalies.length);
    }

    return {
        success: true,
        analysis: analysis
    };
}

// ============================================================
// PATTERN DETECTION
// ============================================================

function detectPatterns(stateId, history) {
    var patterns = [];

    if (!history || history.length < 3) {
        return patterns;
    }

    // Pattern 1: Repeated changes (same value appears multiple times)
    var valueCounts = {};
    for (var i = 0; i < history.length; i++) {
        var h = history[i];
        var key = JSON.stringify(h.newValue);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
    }

    for (var key in valueCounts) {
        if (valueCounts.hasOwnProperty(key) && valueCounts[key] > 2) {
            var value = JSON.parse(key);
            var values = Object.values(value);
            var firstValue = values.length > 0 ? values[0] : 'unknown';
            patterns.push({
                type: 'repeated_value',
                value: firstValue,
                count: valueCounts[key],
                confidence: Math.min(80 + valueCounts[key] * 5, 98)
            });
        }
    }

    // Pattern 2: Frequent changes (state changes often)
    if (history.length > 5) {
        patterns.push({
            type: 'frequent_changes',
            count: history.length,
            confidence: Math.min(70 + history.length * 2, 95)
        });
    }

    // Pattern 3: Stable state (no changes for a while)
    var lastChange = history[history.length - 1];
    if (lastChange) {
        var timeSince = new Date() - new Date(lastChange.timestamp);
        if (timeSince > 5 * 60 * 1000) { // 5 minutes
            patterns.push({
                type: 'stable_state',
                duration: Math.round(timeSince / 60000) + ' minutes',
                confidence: 80
            });
        }
    }

    return patterns;
}

// ============================================================
// ANOMALY DETECTION
// ============================================================

function detectAnomalies(stateId, currentValue, history) {
    var anomalies = [];

    // Check for missing state
    if (currentValue === null || currentValue === undefined) {
        anomalies.push({
            type: 'missing_state',
            severity: 'high',
            description: 'State ' + stateId + ' is missing'
        });
        return anomalies;
    }

    // Check for unexpected values
    var registry = getRegistry();
    if (registry) {
        var stateDef = safeCall(function() {
            if (typeof registry.get === 'function') {
                return registry.get(stateId);
            }
            return null;
        }, null);

        if (stateDef && stateDef.schema) {
            var schema = LawAIApp.StateSchema || window.stateSchema;
            if (schema) {
                var validation = safeCall(function() {
                    if (typeof schema.validate === 'function') {
                        return schema.validate(stateDef.schema, currentValue);
                    }
                    return null;
                }, null);

                if (validation && !validation.valid) {
                    anomalies.push({
                        type: 'schema_violation',
                        severity: 'high',
                        description: 'State ' + stateId + ' violates schema: ' + (validation.errors || []).join('; ')
                    });
                }
            }
        }
    }

    // Check for rapid changes
    if (history && history.length >= 3) {
        var recentChanges = history.slice(-3);
        var timeWindow = 0;
        for (var i = 0; i < recentChanges.length; i++) {
            var ts = new Date(recentChanges[i].timestamp);
            if (i > 0) {
                var prevTs = new Date(recentChanges[i - 1].timestamp);
                timeWindow += ts - prevTs;
            }
        }
        if (timeWindow < 1000 && recentChanges.length >= 3) {
            anomalies.push({
                type: 'rapid_changes',
                severity: 'medium',
                description: 'State ' + stateId + ' changed rapidly (' + recentChanges.length + ' changes in ' + timeWindow + 'ms)'
            });
        }
    }

    // Check for stale state (no changes for a long time)
    if (history && history.length > 0) {
        var lastChange = history[history.length - 1];
        if (lastChange) {
            var timeSince = new Date() - new Date(lastChange.timestamp);
            if (timeSince > 30 * 60 * 1000) { // 30 minutes
                anomalies.push({
                    type: 'stale_state',
                    severity: 'low',
                    description: 'State ' + stateId + ' not updated for ' + Math.round(timeSince / 60000) + ' minutes'
                });
            }
        }
    }

    return anomalies;
}

// ============================================================
// INSIGHT GENERATION
// ============================================================

export function generateInsights(stateId) {
    var analysis = analyzeState(stateId);
    if (!analysis || !analysis.success) {
        return { success: false, error: 'Analysis failed' };
    }

    var insights = [];
    var data = analysis.analysis;

    // Insight 1: State health
    if (data.anomalies.length > 0) {
        insights.push({
            id: generateInsightId(),
            type: 'state_anomaly',
            stateId: stateId,
            summary: 'State ' + stateId + ' has ' + data.anomalies.length + ' anomaly(ies)',
            confidence: 85,
            severity: data.anomalies.some(function(a) { return a.severity === 'high'; }) ? 'high' : 'medium',
            recommendation: 'Review state and resolve anomalies',
            timestamp: new Date().toISOString()
        });
    }

    // Insight 2: State stability
    if (data.patterns.some(function(p) { return p.type === 'stable_state'; })) {
        var stablePattern = data.patterns.find(function(p) { return p.type === 'stable_state'; });
        insights.push({
            id: generateInsightId(),
            type: 'state_stable',
            stateId: stateId,
            summary: 'State ' + stateId + ' is stable (' + stablePattern.duration + ' since last change)',
            confidence: stablePattern.confidence || 80,
            severity: 'low',
            recommendation: null,
            timestamp: new Date().toISOString()
        });
    }

    // Insight 3: Frequent changes
    if (data.patterns.some(function(p) { return p.type === 'frequent_changes'; })) {
        var freqPattern = data.patterns.find(function(p) { return p.type === 'frequent_changes'; });
        insights.push({
            id: generateInsightId(),
            type: 'frequent_changes',
            stateId: stateId,
            summary: 'State ' + stateId + ' changed ' + freqPattern.count + ' times (frequent updates)',
            confidence: freqPattern.confidence || 75,
            severity: 'medium',
            recommendation: 'Consider batching updates to reduce state churn',
            timestamp: new Date().toISOString()
        });
    }

    // Insight 4: Repeated values
    var repeatedPatterns = data.patterns.filter(function(p) { return p.type === 'repeated_value'; });
    for (var i = 0; i < Math.min(repeatedPatterns.length, 3); i++) {
        var p = repeatedPatterns[i];
        insights.push({
            id: generateInsightId(),
            type: 'repeated_value',
            stateId: stateId,
            summary: 'State ' + stateId + ' repeatedly set to value: ' + p.value + ' (' + p.count + ' times)',
            confidence: p.confidence || 70,
            severity: 'low',
            recommendation: 'Check if this value is expected or indicates a pattern',
            timestamp: new Date().toISOString()
        });
    }

    if (isDebugMode()) {
        console.log('[State Intelligence] Generated ' + insights.length + ' insights for:', stateId);
    }

    return {
        success: true,
        stateId: stateId,
        insights: insights,
        count: insights.length,
        timestamp: new Date().toISOString()
    };
}

// ============================================================
// BULK INTELLIGENCE
// ============================================================

export function generateAllInsights() {
    var registry = getRegistry();
    if (!registry) {
        return { success: false, error: 'Registry not available' };
    }

    var states = safeCall(function() {
        if (typeof registry.getAll === 'function') {
            return registry.getAll();
        }
        return [];
    }, []);

    var allInsights = [];
    var totalAnalyzed = 0;

    for (var i = 0; i < states.length; i++) {
        var state = states[i];
        if (state.enabled) {
            var result = generateInsights(state.id);
            if (result.success && result.insights.length > 0) {
                allInsights = allInsights.concat(result.insights);
                totalAnalyzed++;
            }
        }
    }

    if (isDebugMode()) {
        console.log('[State Intelligence] Generated ' + allInsights.length + ' insights from ' + totalAnalyzed + ' states');
    }

    _insightCache = {
        insights: allInsights,
        total: allInsights.length,
        statesAnalyzed: totalAnalyzed,
        timestamp: new Date().toISOString()
    };

    return {
        success: true,
        insights: allInsights,
        count: allInsights.length,
        statesAnalyzed: totalAnalyzed,
        timestamp: new Date().toISOString()
    };
}

// ============================================================
// RECOMMENDATIONS
// ============================================================

export function getRecommendations() {
    var insights = getInsights();
    var recommendations = [];

    for (var i = 0; i < insights.length; i++) {
        if (insights[i].recommendation) {
            recommendations.push({
                insightId: insights[i].id,
                stateId: insights[i].stateId,
                type: insights[i].type,
                recommendation: insights[i].recommendation,
                severity: insights[i].severity || 'medium',
                confidence: insights[i].confidence || 70,
                timestamp: insights[i].timestamp
            });
        }
    }

    return recommendations;
}

// ============================================================
// QUERY API
// ============================================================

export function getInsights() {
    if (!_insightCache) {
        generateAllInsights();
    }
    return _insightCache ? _insightCache.insights : [];
}

export function getInsightsByState(stateId) {
    var insights = getInsights();
    return insights.filter(function(i) { return i.stateId === stateId; });
}

export function getInsightsByType(type) {
    var insights = getInsights();
    return insights.filter(function(i) { return i.type === type; });
}

export function getInsightsBySeverity(severity) {
    var insights = getInsights();
    return insights.filter(function(i) { return i.severity === severity; });
}

export function getInsightCount() {
    var insights = getInsights();
    return insights.length;
}

export function getSummary() {
    var insights = getInsights();

    return {
        totalInsights: insights.length,
        highSeverity: insights.filter(function(i) { return i.severity === 'high'; }).length,
        mediumSeverity: insights.filter(function(i) { return i.severity === 'medium'; }).length,
        lowSeverity: insights.filter(function(i) { return i.severity === 'low'; }).length,
        types: insights.reduce(function(acc, i) {
            acc[i.type] = (acc[i.type] || 0) + 1;
            return acc;
        }, {}),
        timestamp: new Date().toISOString()
    };
}

export function reset() {
    _insightCache = null;
    if (isDebugMode()) {
        console.log('[State Intelligence] Cache reset');
    }
}

// ============================================================
// INITIALIZATION
// ============================================================

export function initIntelligence() {
    if (_isInitialized) {
        return { success: true, status: 'already_initialized' };
    }

    // Generate initial insights on boot
    generateAllInsights();

    _isInitialized = true;

    if (isDebugMode()) {
        console.log('[State Intelligence] Initialized');
        var summary = getSummary();
        console.log('[State Intelligence] Insights:', summary.totalInsights);
    }

    return { success: true, status: 'initialized' };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
    window.stateIntelligence = {
        analyzeState: analyzeState,
        generateInsights: generateInsights,
        generateAllInsights: generateAllInsights,
        getInsights: getInsights,
        getInsightsByState: getInsightsByState,
        getInsightsByType: getInsightsByType,
        getInsightsBySeverity: getInsightsBySeverity,
        getInsightCount: getInsightCount,
        getRecommendations: getRecommendations,
        getSummary: getSummary,
        reset: reset,
        init: function() {
            var result = initIntelligence();
            console.log('✅ StateIntelligence ready');
            return this;
        }
    };

    if (typeof LawAIApp !== 'undefined' && LawAIApp) {
        LawAIApp.StateIntelligence = window.stateIntelligence;
    }
}
