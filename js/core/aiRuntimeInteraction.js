// ================================================================
// aiRuntimeInteraction.js — Part 46.6
// AI Runtime Interaction Layer
// Version: v4.6.6
// Status: Architecture Implementation
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Receive Query, Understand Intent, Collect Context, Generate Response.
//   Developer ↔ AI Assistant interaction bridge.
//
// ARCHITECTURE POSITION
//   Developer → AI Interaction Layer → AI Assistant → Runtime Intelligence
//
// QUERY TYPES
//   Runtime     — "Current runtime status?"
//   Diagnostic  — "Why is boot slow?"
//   Performance — "Which module is slow?"
//   State       — "What changed today?"
//
// RESPONSE MODEL
//   { answer, evidence, confidence, timestamp }
//
// EXPLAINABILITY
//   Every response includes: Reason + Evidence + Confidence
//
// RULES
//   Rule 1: AI Interaction 不修改 Runtime
//   Rule 2: Response 必须基于 Context
//   Rule 3: Unknown 信息必须说明
//   Rule 4: Interaction Failure 不影响 Runtime
//
// DEPENDENCIES (read-only)
//   AIContextEngine, AIRuntimeKnowledge, AIReasoningEngine,
//   AIRecommendationEngine
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIRuntimeInteraction = {
    _version: '4.6.6',
    _ready: false,
    _queryHistory: [],
    _maxQueryHistory: 30,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Runtime Interaction v' + this._version + ' ready');
        console.log('   💬 Queries: Runtime, Diagnostic, Performance, State');
        console.log('   🔍 Flow: Intent → Context → Reasoning → Response');
        console.log('   🛡️ Safety: read-only, evidence-backed, unknown-honest');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 58: QUERY FLOW
    // Intent Detection → Context Collection → Reasoning → Response
    // ============================================================

    /**
     * query(rawQuery)
     * Main entry point. Takes a developer query and returns AI response.
     * @param {string} rawQuery — natural language query from developer
     * @returns {Object} { answer, evidence, confidence, timestamp, intent }
     */
    query: function(rawQuery) {
        // Rule 4: entire flow wrapped in safe execution
        try {
            var intent = this._detectIntent(rawQuery);
            var context = this._getContext();
            var knowledge = this._getKnowledge(context);
            var reasoning = this._getReasoning(context, knowledge);
            var recommendations = this._getRecommendations(reasoning, context);

            var response = this._generateResponse(intent, context, knowledge, reasoning, recommendations, rawQuery);

            // Log query
            this._queryHistory.push({
                query: rawQuery,
                intent: intent,
                response: response,
                timestamp: new Date().toISOString()
            });
            if (this._queryHistory.length > this._maxQueryHistory) {
                this._queryHistory.shift();
            }

            return response;

        } catch (err) {
            // Rule 4: failure doesn't affect Runtime
            console.warn('[AIRuntimeInteraction] Query failed:', err.message);
            return this._fallbackResponse(rawQuery, err.message);
        }
    },

    /**
     * quickStatus()
     * Shortcut for the most common query: "What's the runtime status?"
     * @returns {Object} response
     */
    quickStatus: function() {
        return this.query('runtime status');
    },

    /**
     * quickDiagnostic()
     * Shortcut: "Any problems?"
     * @returns {Object} response
     */
    quickDiagnostic: function() {
        return this.query('any problems');
    },

    /**
     * quickPerformance()
     * Shortcut: "How's performance?"
     * @returns {Object} response
     */
    quickPerformance: function() {
        return this.query('performance');
    },

    // ============================================================
    // CHAPTER 57: INTENT DETECTION
    // ============================================================

    _detectIntent: function(rawQuery) {
        var q = (rawQuery || '').toLowerCase().trim();

        // Intent: Runtime Status
        if (this._matchAny(q, ['status', 'runtime', 'how is', 'what is', 'state of', 'health', 'ready', 'booted'])) {
            return { type: 'runtime', confidence: 0.85 };
        }

        // Intent: Diagnostic / Problems
        if (this._matchAny(q, ['problem', 'issue', 'error', 'wrong', 'fail', 'broken', 'why', 'diagnos', 'bug', 'not working'])) {
            return { type: 'diagnostic', confidence: 0.85 };
        }

        // Intent: Performance
        if (this._matchAny(q, ['performance', 'slow', 'fast', 'speed', 'bottleneck', 'module', 'boot time', 'duration', 'optimize'])) {
            return { type: 'performance', confidence: 0.85 };
        }

        // Intent: State
        if (this._matchAny(q, ['state', 'changed', 'sync', 'conflict', 'snapshot', 'history', 'data'])) {
            return { type: 'state', confidence: 0.8 };
        }

        // Intent: Recommendation
        if (this._matchAny(q, ['recommend', 'suggest', 'improve', 'fix', 'action', 'what should', 'how to', 'next'])) {
            return { type: 'recommendation', confidence: 0.8 };
        }

        // Intent: Events
        if (this._matchAny(q, ['event', 'happened', 'recent', 'timeline', 'activity', 'log'])) {
            return { type: 'events', confidence: 0.75 };
        }

        // Default: try to answer from all sources
        return { type: 'general', confidence: 0.5 };
    },

    _matchAny: function(query, keywords) {
        for (var i = 0; i < keywords.length; i++) {
            if (query.indexOf(keywords[i]) !== -1) return true;
        }
        return false;
    },

    // ============================================================
    // CHAPTER 59-60: RESPONSE GENERATION + EXPLAINABILITY
    // ============================================================

    _generateResponse: function(intent, context, knowledge, reasoning, recommendations, rawQuery) {
        switch (intent.type) {
            case 'runtime':
                return this._respondRuntime(context, knowledge);
            case 'diagnostic':
                return this._respondDiagnostic(context, reasoning);
            case 'performance':
                return this._respondPerformance(context, reasoning);
            case 'state':
                return this._respondState(context, knowledge);
            case 'recommendation':
                return this._respondRecommendation(recommendations);
            case 'events':
                return this._respondEvents(context);
            default:
                return this._respondGeneral(context, reasoning, recommendations);
        }
    },

    // ── Runtime Response ──

    _respondRuntime: function(context, knowledge) {
        var rt = context.runtimeStatus || context.runtime || {};
        var evidence = [];
        var answerParts = [];

        if (rt.booted) {
            var uptimeDisplay = rt.uptime > 0
                ? this._formatDuration(rt.uptime)
                : 'unknown duration';
            answerParts.push('Runtime is running. Uptime: ' + uptimeDisplay + '.');
            evidence.push('runtimeStatus.booted=true');

            if (rt.pipeline && rt.pipeline.stagesCompleted !== undefined) {
                answerParts.push('Pipeline: ' + rt.pipeline.stagesCompleted + '/' + rt.pipeline.stagesTotal + ' stages completed.');
                evidence.push('pipeline.stagesCompleted=' + rt.pipeline.stagesCompleted);
            }

            if (rt.pipeline && rt.pipeline.totalDuration) {
                answerParts.push('Boot duration: ' + rt.pipeline.totalDuration + 'ms.');
                evidence.push('pipeline.totalDuration=' + rt.pipeline.totalDuration);
            }

            if (rt.version && rt.version !== 'N/A') {
                answerParts.push('Version: ' + rt.version + '.');
                evidence.push('runtimeStatus.version=' + rt.version);
            }

        } else if (rt.booting) {
            answerParts.push('Runtime is currently booting. Pipeline is in progress.');
            evidence.push('runtimeStatus.booting=true');
        } else {
            answerParts.push('Runtime has not booted. Core systems are not yet initialized.');
            evidence.push('runtimeStatus.booted=false');
        }

        return {
            answer: answerParts.join(' '),
            evidence: evidence,
            confidence: rt.booted ? 0.95 : 0.9,
            intent: 'runtime',
            timestamp: new Date().toISOString()
        };
    },

    // ── Diagnostic Response ──

    _respondDiagnostic: function(context, reasoning) {
        if (!reasoning || !reasoning.diagnostic) {
            return {
                answer: 'No diagnostic data available. Reasoning engine may not have run yet.',
                evidence: [],
                confidence: 0.4,
                intent: 'diagnostic',
                timestamp: new Date().toISOString()
            };
        }

        var issues = reasoning.diagnostic || [];
        var evidence = [];

        if (issues.length === 0) {
            return {
                answer: 'No issues detected. Runtime appears healthy based on current analysis.',
                evidence: ['reasoning.diagnostic.length=0'],
                confidence: 0.8,
                intent: 'diagnostic',
                timestamp: new Date().toISOString()
            };
        }

        var answerParts = [];
        answerParts.push('Found ' + issues.length + ' potential issue(s):');

        for (var i = 0; i < Math.min(issues, 5); i++) {
            var issue = issues[i];
            answerParts.push('• ' + issue.problem);
            if (issue.possibleCause && issue.possibleCause.indexOf('Could not be determined') === -1) {
                answerParts.push('  Likely cause: ' + issue.possibleCause);
            }
            evidence.push('reasoning.diagnostic[' + i + '].problem=' + issue.problem);
        }

        if (issues.length > 5) {
            answerParts.push('... and ' + (issues.length - 5) + ' more.');
        }

        var highConfIssues = issues.filter(function(i) { return i.confidence >= 0.8; });
        var confidence = highConfIssues.length > 0 ? 0.85 : 0.7;

        return {
            answer: answerParts.join('\n'),
            evidence: evidence,
            confidence: confidence,
            intent: 'diagnostic',
            timestamp: new Date().toISOString()
        };
    },

    // ── Performance Response ──

    _respondPerformance: function(context, reasoning) {
        var perf = context.performance || {};
        var evidence = [];
        var answerParts = [];

        if (!perf.available && !perf.hasData) {
            return {
                answer: 'Performance data is not yet available. System may still be initializing. Check back after boot completes.',
                evidence: ['performance.available=false'],
                confidence: 0.7,
                intent: 'performance',
                timestamp: new Date().toISOString()
            };
        }

        if (perf.hasData) {
            answerParts.push('Performance score: ' + perf.score + '% (' + (perf.label || perf.status || 'Unknown') + ').');
            evidence.push('performance.score=' + perf.score);

            if (perf.bootDuration) {
                answerParts.push('Boot duration: ' + perf.bootDuration + 'ms.');
                evidence.push('performance.bootDuration=' + perf.bootDuration);
            }

            if (perf.slowestModule) {
                answerParts.push('Slowest module: ' + perf.slowestModule + '.');
                evidence.push('performance.slowestModule=' + perf.slowestModule);
            }

            if (perf.fastestModule) {
                answerParts.push('Fastest module: ' + perf.fastestModule + '.');
            }

            if (perf.totalModules > 0) {
                answerParts.push(perf.totalModules + ' modules tracked.');
                evidence.push('performance.totalModules=' + perf.totalModules);
            }

            if (perf.warnings && perf.warnings.length > 0) {
                answerParts.push(perf.warnings.length + ' warning(s) present.');
                evidence.push('performance.warnings.count=' + perf.warnings.length);
            }

        } else {
            answerParts.push('Performance framework is available but no data has been collected yet.');
        }

        return {
            answer: answerParts.join(' '),
            evidence: evidence,
            confidence: perf.hasData ? 0.9 : 0.6,
            intent: 'performance',
            timestamp: new Date().toISOString()
        };
    },

    // ── State Response ──

    _respondState: function(context, knowledge) {
        var states = context.states || {};
        var evidence = [];
        var answerParts = [];

        if (!states.available) {
            return {
                answer: 'State system is not available. StateSyncEngine may not be initialized.',
                evidence: ['states.available=false'],
                confidence: 0.7,
                intent: 'state',
                timestamp: new Date().toISOString()
            };
        }

        answerParts.push(states.totalStates + ' state(s) registered.');
        evidence.push('states.totalStates=' + states.totalStates);

        if (states.syncStatus) {
            answerParts.push('Sync status: ' + states.syncStatus + '.');
            evidence.push('states.syncStatus=' + states.syncStatus);
        }

        if (states.conflictCount > 0) {
            answerParts.push('⚠️ ' + states.conflictCount + ' conflict(s) detected.');
            evidence.push('states.conflictCount=' + states.conflictCount);
        } else {
            answerParts.push('No state conflicts.');
        }

        if (states.snapshotCount > 0) {
            answerParts.push(states.snapshotCount + ' snapshot(s) preserved.');
            evidence.push('states.snapshotCount=' + states.snapshotCount);
        }

        if (states.runtimeState) {
            answerParts.push('Runtime state: ' + (states.runtimeState.ready ? 'ready' : 'not ready') + '.');
            evidence.push('states.runtimeState.ready=' + states.runtimeState.ready);
        }

        return {
            answer: answerParts.join(' '),
            evidence: evidence,
            confidence: 0.85,
            intent: 'state',
            timestamp: new Date().toISOString()
        };
    },

    // ── Recommendation Response ──

    _respondRecommendation: function(recommendations) {
        if (!recommendations || !recommendations.recommendations) {
            return {
                answer: 'No recommendations available. Run a full analysis first.',
                evidence: [],
                confidence: 0.3,
                intent: 'recommendation',
                timestamp: new Date().toISOString()
            };
        }

        var recs = recommendations.recommendations || [];
        var evidence = [];
        var answerParts = [];

        if (recs.length === 0) {
            return {
                answer: 'No recommendations needed. System is operating optimally.',
                evidence: ['recommendations.length=0'],
                confidence: 0.85,
                intent: 'recommendation',
                timestamp: new Date().toISOString()
            };
        }

        answerParts.push(recs.length + ' recommendation(s) available:');

        var critical = recs.filter(function(r) { return r.priority === 'critical'; });
        var high = recs.filter(function(r) { return r.priority === 'high'; });

        var displayRecs = critical.concat(high).concat(recs).slice(0, 5);

        for (var i = 0; i < displayRecs.length; i++) {
            var r = displayRecs[i];
            var prefix = r.priority === 'critical' ? '🔴' : r.priority === 'high' ? '🟠' : r.priority === 'medium' ? '🟡' : '🟢';
            answerParts.push(prefix + ' [' + r.priority.toUpperCase() + '] ' + r.suggestion);
            if (r.tentative) {
                answerParts.push('  (Tentative — low confidence: ' + Math.round(r.confidence * 100) + '%)');
            }
            evidence.push('recommendation.' + r.id + '.priority=' + r.priority);
        }

        return {
            answer: answerParts.join('\n'),
            evidence: evidence,
            confidence: critical.length > 0 ? 0.9 : 0.75,
            intent: 'recommendation',
            timestamp: new Date().toISOString()
        };
    },

    // ── Events Response ──

    _respondEvents: function(context) {
        var events = context.events || {};
        var evidence = [];
        var answerParts = [];

        if (!events.available) {
            return {
                answer: 'Event system is not available.',
                evidence: ['events.available=false'],
                confidence: 0.7,
                intent: 'events',
                timestamp: new Date().toISOString()
            };
        }

        if (!events.hasData) {
            return {
                answer: 'No events recorded yet. Event system may still be initializing.',
                evidence: ['events.hasData=false'],
                confidence: 0.6,
                intent: 'events',
                timestamp: new Date().toISOString()
            };
        }

        answerParts.push(events.totalEvents + ' event(s) recorded across ' + (events.sessionCount || 1) + ' session(s).');
        evidence.push('events.totalEvents=' + events.totalEvents);

        if (events.recentEvents && events.recentEvents.length > 0) {
            answerParts.push('Recent events:');
            var recent = events.recentEvents.slice(-3);
            for (var i = 0; i < recent.length; i++) {
                var e = recent[i];
                var name = e.eventName || e.eventId || e.type || 'unknown';
                answerParts.push('• ' + name);
            }
            evidence.push('events.recentEvents.length=' + events.recentEvents.length);
        }

        if (events.insights && events.insights.length > 0) {
            answerParts.push(events.insights.length + ' insight(s) available.');
            evidence.push('events.insights.length=' + events.insights.length);
        }

        return {
            answer: answerParts.join('\n'),
            evidence: evidence,
            confidence: 0.85,
            intent: 'events',
            timestamp: new Date().toISOString()
        };
    },

    // ── General Response (fallback for unrecognized intents) ──

    _respondGeneral: function(context, reasoning, recommendations) {
        var rt = context.runtimeStatus || context.runtime || {};
        var answerParts = [];
        var evidence = [];

        // Summary of everything
        answerParts.push('Here is a full runtime overview:');

        if (rt.booted) {
            answerParts.push('• Status: Running (booted)');
            evidence.push('runtimeStatus.booted=true');
        } else if (rt.booting) {
            answerParts.push('• Status: Booting');
            evidence.push('runtimeStatus.booting=true');
        } else {
            answerParts.push('• Status: Idle (not booted)');
            evidence.push('runtimeStatus.booted=false');
        }

        var perf = context.performance || {};
        if (perf.hasData) {
            answerParts.push('• Performance: ' + perf.score + '%');
            evidence.push('performance.score=' + perf.score);
        } else {
            answerParts.push('• Performance: No data yet');
        }

        var events = context.events || {};
        answerParts.push('• Events: ' + (events.totalEvents || 0) + ' recorded');
        evidence.push('events.totalEvents=' + (events.totalEvents || 0));

        var states = context.states || {};
        answerParts.push('• States: ' + (states.totalStates || 0) + ' registered, ' + (states.conflictCount || 0) + ' conflicts');

        if (recommendations && recommendations.recommendations && recommendations.recommendations.length > 0) {
            var criticalRecs = recommendations.recommendations.filter(function(r) { return r.priority === 'critical' || r.priority === 'high'; });
            if (criticalRecs.length > 0) {
                answerParts.push('• ⚠️ ' + criticalRecs.length + ' high-priority recommendation(s)');
            }
        }

        return {
            answer: answerParts.join('\n'),
            evidence: evidence,
            confidence: 0.65,
            intent: 'general',
            timestamp: new Date().toISOString()
        };
    },

    // ============================================================
    // FALLBACK (Rule 3: Unknown 必须说明)
    // ============================================================

    _fallbackResponse: function(rawQuery, error) {
        return {
            answer: 'Unable to process query: "' + (rawQuery || '').substring(0, 100) + '". An internal error occurred: ' + error + '. This does not affect Runtime operation.',
            evidence: ['interaction.error=' + error],
            confidence: 0.1,
            intent: 'error',
            timestamp: new Date().toISOString()
        };
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getContext: function() {
        try {
            if (LawAIApp.AIContextEngine && typeof LawAIApp.AIContextEngine.getFullContext === 'function') {
                return LawAIApp.AIContextEngine.getFullContext();
            }
        } catch (e) { /* ignore */ }
        return this._emptyContext();
    },

    _getKnowledge: function(context) {
        try {
            if (LawAIApp.AIRuntimeKnowledge && typeof LawAIApp.AIRuntimeKnowledge.interpret === 'function') {
                return LawAIApp.AIRuntimeKnowledge.interpret(context);
            }
        } catch (e) { /* ignore */ }
        return [];
    },

    _getReasoning: function(context, knowledge) {
        try {
            if (LawAIApp.AIReasoningEngine && typeof LawAIApp.AIReasoningEngine.reason === 'function') {
                return LawAIApp.AIReasoningEngine.reason(context, knowledge);
            }
        } catch (e) { /* ignore */ }
        return { diagnostic: [], performance: [], state: [], predictive: [], summary: { severity: 'none' }, totalFindings: 0 };
    },

    _getRecommendations: function(reasoning, context) {
        try {
            if (LawAIApp.AIRecommendationEngine && typeof LawAIApp.AIRecommendationEngine.recommend === 'function') {
                return LawAIApp.AIRecommendationEngine.recommend(reasoning, context);
            }
        } catch (e) { /* ignore */ }
        return { recommendations: [], summary: { message: 'No recommendations available.' } };
    },

    _emptyContext: function() {
        return {
            runtimeStatus: { status: 'idle', booted: false, booting: false, uptime: 0, version: 'N/A', pipeline: { status: 'idle', stagesCompleted: 0, stagesTotal: 9, totalDuration: null, currentStage: null } },
            performance: { available: false, hasData: false, score: 0, bootDuration: null, totalModules: 0, warnings: [] },
            events: { available: false, hasData: false, totalEvents: 0, sessionCount: 0, recentEvents: [], insights: [], risks: [] },
            states: { available: false, totalStates: 0, states: [], syncStatus: 'unknown', conflictCount: 0, runtimeState: null },
            timestamp: new Date().toISOString()
        };
    },

    _formatDuration: function(ms) {
        if (!ms || ms <= 0) return '0s';
        var sec = Math.round(ms / 1000);
        if (sec < 120) return sec + 's';
        var min = Math.round(sec / 60);
        if (min < 120) return min + 'min';
        return Math.round(min / 60) + 'h';
    },

    // ============================================================
    // HISTORY
    // ============================================================

    getQueryHistory: function(limit) {
        limit = limit || 10;
        return this._queryHistory.slice(-limit).reverse();
    },

    getQueryHistorySize: function() {
        return this._queryHistory.length;
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            queryHistorySize: this._queryHistory.length
        };
    }
};

// ── Auto-init ──
LawAIApp.AIRuntimeInteraction.init();

console.log('🧠 AI Runtime Interaction — Part 46.6 Complete');
console.log('   ✅ Query Processing: Intent Detection + Context + Reasoning + Response');
console.log('   ✅ Query Types: Runtime, Diagnostic, Performance, State, Events, Recommendation');
console.log('   ✅ Shortcuts: quickStatus(), quickDiagnostic(), quickPerformance()');
console.log('   ✅ Explainability: Answer + Evidence + Confidence on every response');
console.log('   ✅ Safety: read-only, evidence-backed, unknown-honest, failure-isolated');
console.log('   ✅ Ready for Part 46.7 — DevPanel AI Assistant');
