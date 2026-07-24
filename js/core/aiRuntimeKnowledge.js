// ================================================================
// aiRuntimeKnowledge.js — Part 46.3
// Runtime Knowledge Layer
// Version: v4.6.3
// Status: Architecture Implementation
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Interpret, Classify, Relate, Explain Runtime Information.
//   Upgrades Data → Knowledge for AI Assistant consumption.
//
// ARCHITECTURE POSITION
//   Runtime Context → Knowledge Layer → Interpretation → AI Assistant
//
// KNOWLEDGE MODEL
//   { id, category, source, meaning, confidence, timestamp }
//
// KNOWLEDGE CATEGORIES
//   Runtime Knowledge    — 系统行为理解
//   Module Knowledge     — 模块职责理解
//   Performance Knowledge — 性能影响理解
//   State Knowledge      — 状态关系理解
//
// RULES
//   Rule 1: Knowledge 必须有来源
//   Rule 2: Knowledge 不直接修改 Runtime
//   Rule 3: Confidence 必须记录
//   Rule 4: Unknown Information 必须标记
//
// DEPENDENCIES (read-only)
//   AIContextEngine, BootManager, Performance, Events, StateSyncEngine
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIRuntimeKnowledge = {
    _version: '4.6.3',
    _ready: false,
    _knowledgeBase: [],
    _maxKnowledge: 100,
    _confidenceThreshold: 0.3,  // below this = low confidence, flagged

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        this._initModuleKnowledgeBase();
        console.log('🧠 AI Runtime Knowledge v' + this._version + ' ready');
        console.log('   📚 Categories: Runtime, Module, Performance, State');
        console.log('   🔍 Process: Identify → Apply Rule → Generate Meaning');
        console.log('   ✅ Rules: sourced, read-only, confidence-tracked');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 24: KNOWLEDGE MODEL
    // ============================================================

    /**
     * createKnowledgeUnit(category, source, meaning, confidence, metadata)
     * Factory for a standardized Knowledge Unit.
     * @param {string} category — 'runtime' | 'module' | 'performance' | 'state'
     * @param {string} source — what data this comes from
     * @param {string} meaning — human-readable interpretation
     * @param {number} confidence — 0.0 to 1.0
     * @param {Object} metadata — extra context
     * @returns {Object} Knowledge Unit
     */
    createKnowledgeUnit: function(category, source, meaning, confidence, metadata) {
        confidence = Math.max(0, Math.min(1, confidence || 0.5));

        var unit = {
            id: 'k_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            category: category,
            source: source,
            meaning: meaning,
            confidence: confidence,
            confidenceLevel: this._confidenceLevel(confidence),
            timestamp: new Date().toISOString(),
            metadata: metadata || {}
        };

        // Store in knowledge base
        this._knowledgeBase.push(unit);
        if (this._knowledgeBase.length > this._maxKnowledge) {
            this._knowledgeBase.shift();
        }

        return unit;
    },

    // ============================================================
    // CHAPTER 26: KNOWLEDGE PROCESSING
    // Context → Identify → Apply Rule → Generate Meaning
    // ============================================================

    /**
     * interpret(context)
     * Interprets a full Runtime Context into Knowledge Units.
     * @param {Object} context — from AIContextEngine.getFullContext()
     * @returns {Array} Knowledge Units
     */
    interpret: function(context) {
        if (!context) {
            context = this._getContext();
        }

        var knowledgeUnits = [];

        // ── Identify Runtime Patterns ──
        var runtimeKnowledge = this._interpretRuntime(context);
        knowledgeUnits = knowledgeUnits.concat(runtimeKnowledge);

        // ── Identify Performance Patterns ──
        var perfKnowledge = this._interpretPerformance(context);
        knowledgeUnits = knowledgeUnits.concat(perfKnowledge);

        // ── Identify Event Patterns ──
        var eventKnowledge = this._interpretEvents(context);
        knowledgeUnits = knowledgeUnits.concat(eventKnowledge);

        // ── Identify State Patterns ──
        var stateKnowledge = this._interpretStates(context);
        knowledgeUnits = knowledgeUnits.concat(stateKnowledge);

        // ── Cross-source relationship knowledge ──
        var relationKnowledge = this._interpretRelations(context, knowledgeUnits);
        knowledgeUnits = knowledgeUnits.concat(relationKnowledge);

        return knowledgeUnits;
    },

    /**
     * explain(context)
     * Generates human-readable explanation from interpretation.
     * @param {Object} context — from AIContextEngine
     * @returns {Object} { summary, details, knowledgeUnits }
     */
    explain: function(context) {
        var units = this.interpret(context);
        var summary = '';
        var details = [];

        var highConfUnits = units.filter(function(u) { return u.confidence >= 0.6; });
        var lowConfUnits = units.filter(function(u) { return u.confidence < 0.6 && u.confidence >= 0.3; });
        var uncertainUnits = units.filter(function(u) { return u.confidence < 0.3; });

        // Build summary from high-confidence knowledge
        if (highConfUnits.length > 0) {
            var runtimeUnit = highConfUnits.find(function(u) { return u.category === 'runtime'; });
            var perfUnit = highConfUnits.find(function(u) { return u.category === 'performance'; });

            var parts = [];
            if (runtimeUnit) parts.push(runtimeUnit.meaning);
            if (perfUnit && perfUnit.confidence >= 0.7) parts.push(perfUnit.meaning);
            summary = parts.join(' ') || 'Runtime is operating.';
        } else if (units.length > 0) {
            summary = 'Runtime data collected but interpretation confidence is low.';
        } else {
            summary = 'Insufficient data for runtime interpretation.';
        }

        // Build details
        for (var i = 0; i < units.length; i++) {
            var u = units[i];
            details.push({
                category: u.category,
                meaning: u.meaning,
                confidence: u.confidenceLevel,
                source: u.source
            });
        }

        // Flag uncertain knowledge
        if (uncertainUnits.length > 0) {
            details.push({
                category: 'warning',
                meaning: uncertainUnits.length + ' knowledge unit(s) have low confidence. More data needed.',
                confidence: 'low',
                source: 'multiple'
            });
        }

        return {
            summary: summary,
            details: details,
            knowledgeUnits: units,
            totalUnits: units.length,
            highConfidenceCount: highConfUnits.length,
            lowConfidenceCount: lowConfUnits.length + uncertainUnits.length
        };
    },

    // ============================================================
    // INTERPRETATION RULES (Chapter 25: Knowledge Categories)
    // ============================================================

    // ── Runtime Knowledge: 系统行为理解 ──

    _interpretRuntime: function(context) {
        var units = [];
        var rt = context.runtimeStatus || context.runtime || {};

        // Rule: Boot status interpretation
        if (rt.booted) {
            units.push(this.createKnowledgeUnit(
                'runtime',
                'runtimeStatus.booted',
                'Runtime has successfully booted. All core systems are operational.',
                0.95,
                { status: rt.status, version: rt.version }
            ));

            // Pipeline interpretation
            if (rt.pipeline && rt.pipeline.stagesCompleted !== undefined) {
                var completion = rt.pipeline.stagesCompleted / Math.max(rt.pipeline.stagesTotal || 9, 1);
                if (completion >= 1) {
                    units.push(this.createKnowledgeUnit(
                        'runtime',
                        'runtimeStatus.pipeline',
                        'Boot Pipeline completed all stages successfully.',
                        0.95,
                        { stagesCompleted: rt.pipeline.stagesCompleted, stagesTotal: rt.pipeline.stagesTotal }
                    ));
                } else if (completion > 0) {
                    units.push(this.createKnowledgeUnit(
                        'runtime',
                        'runtimeStatus.pipeline',
                        'Boot Pipeline partially complete: ' + rt.pipeline.stagesCompleted + '/' + rt.pipeline.stagesTotal + ' stages.',
                        0.85,
                        { stagesCompleted: rt.pipeline.stagesCompleted, stagesTotal: rt.pipeline.stagesTotal }
                    ));
                }
            }

            // Uptime interpretation
            if (rt.uptime > 60000) {
                units.push(this.createKnowledgeUnit(
                    'runtime',
                    'runtimeStatus.uptime',
                    'Runtime has been stable for over 1 minute. System is settling.',
                    0.75,
                    { uptimeMs: rt.uptime }
                ));
            } else if (rt.uptime > 0) {
                units.push(this.createKnowledgeUnit(
                    'runtime',
                    'runtimeStatus.uptime',
                    'Runtime recently started. Monitoring initial stability.',
                    0.7,
                    { uptimeMs: rt.uptime }
                ));
            }

        } else if (rt.status === 'booting' || rt.booting) {
            units.push(this.createKnowledgeUnit(
                'runtime',
                'runtimeStatus.status',
                'Runtime is currently booting. Systems are initializing.',
                0.9,
                { status: rt.status }
            ));
        } else {
            units.push(this.createKnowledgeUnit(
                'runtime',
                'runtimeStatus.booted',
                'Runtime has not booted. Core systems may not be available.',
                0.9,
                { status: rt.status || 'idle' }
            ));
        }

        return units;
    },

    // ── Performance Knowledge: 性能影响理解 ──

    _interpretPerformance: function(context) {
        var units = [];
        var perf = context.performance || {};

        if (!perf.available && !perf.hasData) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.available',
                'Performance data is not yet available. System may still be initializing.',
                0.7,
                {}
            ));
            return units;
        }

        // Score interpretation
        if (perf.score >= 90) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.score',
                'Performance is excellent. All metrics within optimal range.',
                0.9,
                { score: perf.score }
            ));
        } else if (perf.score >= 70) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.score',
                'Performance is good. Minor optimizations may be available.',
                0.85,
                { score: perf.score }
            ));
        } else if (perf.score >= 40) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.score',
                'Performance is below optimal. Review slow modules for bottlenecks.',
                0.8,
                { score: perf.score }
            ));
        } else if (perf.hasData) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.score',
                'Performance is poor. System may need immediate attention.',
                0.85,
                { score: perf.score }
            ));
        }

        // Boot duration interpretation
        if (perf.bootDuration !== null && perf.bootDuration !== undefined) {
            if (perf.bootDuration > 5000) {
                units.push(this.createKnowledgeUnit(
                    'performance',
                    'performance.bootDuration',
                    'Boot time is high (' + perf.bootDuration + 'ms). Check for slow-loading modules.',
                    0.75,
                    { bootDuration: perf.bootDuration }
                ));
            } else if (perf.bootDuration < 1000) {
                units.push(this.createKnowledgeUnit(
                    'performance',
                    'performance.bootDuration',
                    'Boot time is fast (' + perf.bootDuration + 'ms). Module loading is efficient.',
                    0.8,
                    { bootDuration: perf.bootDuration }
                ));
            }
        }

        // Slowest module interpretation
        if (perf.slowestModule && perf.totalModules > 0) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.slowestModule',
                'Slowest module is "' + perf.slowestModule + '". This may affect overall responsiveness.',
                0.6,
                { slowestModule: perf.slowestModule }
            ));
        }

        // Warning count
        if (perf.warnings && perf.warnings.length > 0) {
            units.push(this.createKnowledgeUnit(
                'performance',
                'performance.warnings',
                perf.warnings.length + ' performance warning(s) detected. Review performance report.',
                0.8,
                { warningCount: perf.warnings.length }
            ));
        }

        return units;
    },

    // ── Event Knowledge: 事件模式理解 ──

    _interpretEvents: function(context) {
        var units = [];
        var events = context.events || {};

        if (!events.available) {
            return units;
        }

        if (!events.hasData) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.hasData',
                'No events have been recorded yet. Event system may still be initializing.',
                0.65,
                {}
            ));
            return units;
        }

        // Event volume interpretation
        if (events.totalEvents >= 20) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.totalEvents',
                'Event system is active with ' + events.totalEvents + ' events recorded.',
                0.9,
                { totalEvents: events.totalEvents }
            ));
        } else if (events.totalEvents > 0) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.totalEvents',
                'Event system is collecting data (' + events.totalEvents + ' events). Building runtime history.',
                0.8,
                { totalEvents: events.totalEvents }
            ));
        }

        // Session interpretation
        if (events.sessionCount > 1) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.sessionCount',
                events.sessionCount + ' sessions detected. Multi-session pattern indicates repeated usage.',
                0.7,
                { sessionCount: events.sessionCount }
            ));
        }

        // Insights available
        if (events.insights && events.insights.length > 0) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.insights',
                events.insights.length + ' event insight(s) available. Event patterns have been identified.',
                0.85,
                { insightCount: events.insights.length }
            ));
        }

        // Risks detected
        if (events.risks && events.risks.length > 0) {
            units.push(this.createKnowledgeUnit(
                'events',
                'events.risks',
                events.risks.length + ' risk(s) identified in event data. Review event risks.',
                0.8,
                { riskCount: events.risks.length }
            ));
        }

        return units;
    },

    // ── State Knowledge: 状态关系理解 ──

    _interpretStates: function(context) {
        var units = [];
        var states = context.states || {};

        if (!states.available) {
            return units;
        }

        // State count
        if (states.totalStates > 0) {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.totalStates',
                states.totalStates + ' state(s) registered. State management is operational.',
                0.9,
                { totalStates: states.totalStates }
            ));
        } else {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.totalStates',
                'No states registered. State system may not be initialized.',
                0.7,
                {}
            ));
            return units;
        }

        // Sync status
        if (states.syncStatus === 'active') {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.syncStatus',
                'State synchronization is active. Runtime state is being tracked.',
                0.85,
                { syncStatus: states.syncStatus }
            ));
        } else if (states.syncStatus === 'idle') {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.syncStatus',
                'State sync is idle. No recent state changes detected.',
                0.7,
                { syncStatus: states.syncStatus }
            ));
        }

        // Conflict interpretation
        if (states.conflictCount > 0) {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.conflictCount',
                states.conflictCount + ' state conflict(s) exist. Data consistency may be affected.',
                0.85,
                { conflictCount: states.conflictCount }
            ));
        }

        // Runtime ready state
        if (states.runtimeState) {
            if (states.runtimeState.ready) {
                units.push(this.createKnowledgeUnit(
                    'state',
                    'states.runtimeState',
                    'Runtime state reports ready. All core modules are initialized.',
                    0.9,
                    { runtimeReady: true }
                ));
            } else {
                units.push(this.createKnowledgeUnit(
                    'state',
                    'states.runtimeState',
                    'Runtime state reports not ready. Some modules may still be loading.',
                    0.8,
                    { runtimeReady: false, runtimeStatus: states.runtimeState.status }
                ));
            }
        }

        // Snapshot history
        if (states.snapshotCount > 0) {
            units.push(this.createKnowledgeUnit(
                'state',
                'states.snapshotCount',
                states.snapshotCount + ' state snapshot(s) preserved. History is being maintained.',
                0.75,
                { snapshotCount: states.snapshotCount }
            ));
        }

        return units;
    },

    // ── Cross-Source Relations (知识关联) ──

    _interpretRelations: function(context, existingUnits) {
        var units = [];

        // Relation: Boot completion → Performance score available
        var rtBooted = context.runtimeStatus && context.runtimeStatus.booted;
        var perfHasData = context.performance && context.performance.hasData;

        if (rtBooted && perfHasData && context.performance.score >= 80) {
            units.push(this.createKnowledgeUnit(
                'relation',
                'runtime+performance',
                'Successful boot correlates with healthy performance metrics.',
                0.75,
                { relatedSources: ['runtimeStatus', 'performance'] }
            ));
        }

        // Relation: Events + States correlation
        var hasEvents = context.events && context.events.hasData;
        var hasStates = context.states && context.states.totalStates > 0;

        if (hasEvents && hasStates) {
            units.push(this.createKnowledgeUnit(
                'relation',
                'events+states',
                'Event and state systems are both active. Runtime observability is comprehensive.',
                0.8,
                { relatedSources: ['events', 'states'] }
            ));
        }

        // Relation: Low performance + warnings → attention needed
        var perfScore = context.performance && context.performance.score;
        var perfWarnings = context.performance && context.performance.warnings;

        if (perfScore !== undefined && perfScore < 50 && perfWarnings && perfWarnings.length > 0) {
            units.push(this.createKnowledgeUnit(
                'relation',
                'performance+warnings',
                'Low performance score (' + perfScore + '%) combined with ' + perfWarnings.length + ' warning(s) suggests system needs optimization.',
                0.8,
                { score: perfScore, warningCount: perfWarnings.length }
            ));
        }

        // Relation: State conflicts + runtime not ready
        var stateConflicts = context.states && context.states.conflictCount;
        var rtReady = context.states && context.states.runtimeState && context.states.runtimeState.ready;

        if (stateConflicts > 0 && !rtReady) {
            units.push(this.createKnowledgeUnit(
                'relation',
                'states+runtime',
                'State conflicts (' + stateConflicts + ') may be preventing runtime from reaching ready state.',
                0.65,
                { conflicts: stateConflicts, runtimeReady: false }
            ));
        }

        return units;
    },

    // ============================================================
    // MODULE KNOWLEDGE BASE (static — maps module names to meaning)
    // ============================================================

    _moduleKnowledge: {},

    _initModuleKnowledgeBase: function() {
        this._moduleKnowledge = {
            'BootManager': {
                category: 'runtime',
                role: 'Boot Coordinator',
                description: 'Coordinates the boot sequence and delegates to BootPipeline.',
                impacts: ['System startup', 'Runtime readiness']
            },
            'BootPipeline': {
                category: 'runtime',
                role: 'Pipeline Executor',
                description: 'Executes boot stages in sequence with observability.',
                impacts: ['Boot order', 'Stage validation']
            },
            'Performance': {
                category: 'performance',
                role: 'Performance Tracker',
                description: 'Tracks execution metrics across modules.',
                impacts: ['System responsiveness', 'Bottleneck detection']
            },
            'StateSyncEngine': {
                category: 'state',
                role: 'State Synchronizer',
                description: 'Manages runtime state consistency and synchronization.',
                impacts: ['Data consistency', 'Module coordination']
            },
            'RuntimeEventCollector': {
                category: 'events',
                role: 'Event Recorder',
                description: 'Records runtime events for analysis and intelligence.',
                impacts: ['Observability', 'Historical analysis']
            }
        };
    },

    /**
     * interpretModule(moduleName)
     * Returns knowledge about a specific module.
     * @param {string} moduleName
     * @returns {Object|null} Knowledge Unit
     */
    interpretModule: function(moduleName) {
        var mod = this._moduleKnowledge[moduleName];
        if (!mod) {
            return this.createKnowledgeUnit(
                'module',
                'module.unknown',
                'Module "' + moduleName + '" is not recognized. No knowledge available.',
                0.2,
                { moduleName: moduleName }
            );
        }

        return this.createKnowledgeUnit(
            'module',
            'module.' + moduleName,
            mod.role + ': ' + mod.description,
            0.9,
            { moduleName: moduleName, role: mod.role, impacts: mod.impacts }
        );
    },

    /**
     * getModuleImpact(moduleName)
     * Returns what systems are impacted by a module.
     * @param {string} moduleName
     * @returns {Array} Impact descriptions
     */
    getModuleImpact: function(moduleName) {
        var mod = this._moduleKnowledge[moduleName];
        return mod ? mod.impacts : ['Unknown impact'];
    },

    // ============================================================
    // KNOWLEDGE BASE QUERY
    // ============================================================

    /**
     * queryKnowledge(category, minConfidence)
     * Queries the knowledge base for units matching criteria.
     * @param {string} category — filter by category, or null for all
     * @param {number} minConfidence — minimum confidence threshold
     * @returns {Array} Matching Knowledge Units
     */
    queryKnowledge: function(category, minConfidence) {
        minConfidence = minConfidence || 0;
        return this._knowledgeBase.filter(function(unit) {
            var catMatch = !category || unit.category === category;
            var confMatch = unit.confidence >= minConfidence;
            return catMatch && confMatch;
        });
    },

    /**
     * getLatestKnowledge(limit)
     * Returns the most recent knowledge units.
     * @param {number} limit
     * @returns {Array}
     */
    getLatestKnowledge: function(limit) {
        limit = limit || 10;
        return this._knowledgeBase.slice(-limit).reverse();
    },

    /**
     * getKnowledgeBaseSize()
     * @returns {number}
     */
    getKnowledgeBaseSize: function() {
        return this._knowledgeBase.length;
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

        // Fallback: minimal context
        var bm = LawAIApp.BootManager || window.bootManager;
        return {
            runtimeStatus: {
                status: (bm && bm._booted) ? 'running' : 'idle',
                booted: !!(bm && bm._booted),
                booting: !!(bm && bm._booting),
                uptime: 0,
                version: 'N/A',
                pipeline: { status: 'idle', stagesCompleted: 0, stagesTotal: 9, totalDuration: null, currentStage: null }
            },
            performance: { available: false, hasData: false, score: 0, bootDuration: null, totalModules: 0, warnings: [] },
            events: { available: false, hasData: false, totalEvents: 0, sessionCount: 0, recentEvents: [], insights: [], risks: [] },
            states: { available: false, totalStates: 0, states: [], syncStatus: 'unknown', conflictCount: 0, runtimeState: null },
            timestamp: new Date().toISOString()
        };
    },

    _confidenceLevel: function(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.5) return 'medium';
        if (confidence >= 0.3) return 'low';
        return 'uncertain';
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            knowledgeBaseSize: this._knowledgeBase.length,
            moduleKnowledgeCount: Object.keys(this._moduleKnowledge).length,
            confidenceThreshold: this._confidenceThreshold
        };
    }
};

// ── Auto-init ──
LawAIApp.AIRuntimeKnowledge.init();

console.log('🧠 AI Runtime Knowledge Layer — Part 46.3 Complete');
console.log('   ✅ Knowledge Model: id + category + source + meaning + confidence');
console.log('   ✅ Categories: Runtime, Module, Performance, State, Relation');
console.log('   ✅ Process: Context → Identify Pattern → Apply Rule → Generate Meaning');
console.log('   ✅ Rules: sourced, read-only, confidence-tracked, unknown-flagged');
console.log('   ✅ Module Knowledge Base: ' + Object.keys(LawAIApp.AIRuntimeKnowledge._moduleKnowledge).length + ' modules');
console.log('   ✅ Ready for Part 46.4 — AI Reasoning Engine');
