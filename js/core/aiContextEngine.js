// ================================================================
// aiContextEngine.js — Part 46.2
// AI Context Engine
// Version: v4.6.2
// Status: Architecture Implementation
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Collect, Normalize, Combine, Provide Runtime Information.
//   Unified Context for AI Assistant consumption.
//
// ARCHITECTURE POSITION
//   Runtime Systems (Performance, Event, State)
//        ↓
//   AI Context Engine  ← this module
//        ↓
//   AI Assistant
//
// CONTEXT MODEL
//   { runtimeStatus, performance, events, states, timestamp }
//
// RULES
//   Rule 1: Context 必须来源于 Runtime Data
//   Rule 2: Context 不允许直接修改 Source
//   Rule 3: Context 必须包含 Timestamp
//   Rule 4: Missing Data 必须安全处理
//
// CONTEXT TYPES
//   Full Context     — 完整 Runtime 状态
//   Focused Context  — 指定 Module Context
//   Historical Context — 过去 Runtime 状态快照
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIContextEngine = {
    _version: '4.6.2',
    _ready: false,
    _contextCache: null,
    _cacheTimestamp: null,
    _cacheTTL: 2000,  // 2 second cache before re-collecting
    _history: [],
    _maxHistory: 30,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Context Engine v' + this._version + ' ready');
        console.log('   📋 Sources: Performance, Events, State');
        console.log('   📦 Types: Full, Focused, Historical');
        console.log('   🛡️ Rules: data-sourced, read-only, timestamped, safe');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 15: CONTEXT GENERATION FLOW
    // Request → Collect → Normalize → Build → Return
    // ============================================================

    /**
     * getFullContext(forceRefresh)
     * Returns complete Runtime Context with all sources.
     * Uses cache within TTL unless forceRefresh=true.
     * @param {boolean} forceRefresh — bypass cache
     * @returns {Object} Full Context
     */
    getFullContext: function(forceRefresh) {
        // Return cached context if still valid
        if (!forceRefresh && this._isCacheValid()) {
            return this._contextCache;
        }

        try {
            var context = this._buildFullContext();
            this._cacheContext(context);
            return context;
        } catch (err) {
            console.warn('[AIContextEngine] Full context build failed:', err.message);
            return this._fallbackContext(err.message);
        }
    },

    /**
     * getFocusedContext(moduleName)
     * Returns context focused on a specific module.
     * @param {string} moduleName — 'performance' | 'events' | 'state'
     * @returns {Object} Focused Context
     */
    getFocusedContext: function(moduleName) {
        var full = this.getFullContext();
        var timestamp = new Date().toISOString();

        switch (moduleName) {
            case 'performance':
                return {
                    type: 'focused',
                    module: 'performance',
                    data: full.performance,
                    timestamp: timestamp
                };

            case 'events':
                return {
                    type: 'focused',
                    module: 'events',
                    data: full.events,
                    timestamp: timestamp
                };

            case 'state':
                return {
                    type: 'focused',
                    module: 'state',
                    data: full.states,
                    timestamp: timestamp
                };

            case 'runtime':
                return {
                    type: 'focused',
                    module: 'runtime',
                    data: full.runtimeStatus,
                    timestamp: timestamp
                };

            default:
                return {
                    type: 'focused',
                    module: moduleName,
                    data: null,
                    error: 'Unknown module: ' + moduleName,
                    timestamp: timestamp
                };
        }
    },

    /**
     * getHistoricalContext(index)
     * Returns a past context snapshot from history.
     * @param {number} index — 0 = most recent, 1 = previous, etc.
     * @returns {Object|null} Historical Context
     */
    getHistoricalContext: function(index) {
        if (typeof index !== 'number') index = 0;
        if (index >= this._history.length) return null;
        return this._history[this._history.length - 1 - index];
    },

    /**
     * getHistorySize()
     * Returns number of stored context snapshots.
     * @returns {number}
     */
    getHistorySize: function() {
        return this._history.length;
    },

    /**
     * refresh()
     * Force-refresh the context cache.
     * @returns {Object} Fresh Full Context
     */
    refresh: function() {
        return this.getFullContext(true);
    },

    // ============================================================
    // CHAPTER 14: CONTEXT MODEL — Builders
    // ============================================================

    _buildFullContext: function() {
        return {
            runtimeStatus: this._collectRuntimeStatus(),
            performance: this._collectPerformance(),
            events: this._collectEvents(),
            states: this._collectStates(),
            timestamp: new Date().toISOString()
        };
    },

    // ── Runtime Status Collector ──

    _collectRuntimeStatus: function() {
        try {
            var bm = LawAIApp.BootManager || window.bootManager;
            var pipeline = LawAIApp.BootPipeline || window.bootPipeline;

            var status = {
                status: 'unknown',
                booted: false,
                booting: false,
                uptime: 0,
                version: 'N/A',
                pipeline: {
                    status: 'idle',
                    stagesCompleted: 0,
                    stagesTotal: 9,
                    totalDuration: null,
                    currentStage: null
                }
            };

            if (bm) {
                status.booted = !!(bm._booted || (typeof bm.isBooted === 'function' && bm.isBooted()));
                status.booting = !!bm._booting;
                status.status = status.booted ? 'running' : (status.booting ? 'booting' : 'idle');
            }

            var perf = LawAIApp.Performance;
            if (perf && perf._bootStartTime) {
                status.uptime = Date.now() - perf._bootStartTime;
            }

            status.version = (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) || 'V4.5.9';

            if (pipeline && typeof pipeline.getPipelineStatus === 'function') {
                var ps = pipeline.getPipelineStatus();
                status.pipeline.status = ps.status || 'idle';
                status.pipeline.totalDuration = ps.totalDuration || null;
                status.pipeline.currentStage = ps.currentStage || null;
                if (ps.completedStages) {
                    status.pipeline.stagesCompleted = ps.completedStages.length;
                }
            }

            return status;
        } catch (e) {
            return { status: 'error', error: e.message, booted: false, booting: false, uptime: 0, version: 'N/A', pipeline: { status: 'error', stagesCompleted: 0, stagesTotal: 9, totalDuration: null, currentStage: null } };
        }
    },

    // ── Performance Collector ──

    _collectPerformance: function() {
        try {
            var perf = LawAIApp.Performance;

            var result = {
                available: false,
                hasData: false,
                score: 0,
                status: 'UNKNOWN',
                label: 'Unknown',
                bootDuration: null,
                averageDuration: null,
                slowestModule: null,
                fastestModule: null,
                totalModules: 0,
                totalRecords: 0,
                warnings: []
            };

            if (perf) {
                result.available = true;

                if (typeof perf.report === 'function') {
                    var report = perf.report();
                    if (report) {
                        result.hasData = !!(report.summary && report.summary.hasData);

                        if (report.health) {
                            result.score = report.health.score || 0;
                            result.status = report.health.status || 'UNKNOWN';
                            result.label = report.health.label || 'Unknown';
                        }

                        if (report.summary) {
                            result.bootDuration = report.summary.bootDuration || null;
                            result.averageDuration = report.summary.averageDuration || null;
                            result.slowestModule = report.summary.slowestModule || null;
                            result.fastestModule = report.summary.fastestModule || null;
                            result.totalModules = report.summary.totalModules || 0;
                            result.totalRecords = report.summary.totalRecords || 0;
                        }

                        if (report.warnings) {
                            result.warnings = report.warnings;
                        }
                    }
                }

                // Fallback: health check
                if (!result.hasData && typeof perf.health === 'function') {
                    var health = perf.health();
                    if (health) {
                        result.score = health.score || 0;
                        result.status = health.status || 'UNKNOWN';
                    }
                }
            }

            return result;
        } catch (e) {
            return { available: false, hasData: false, score: 0, status: 'ERROR', label: 'Error', bootDuration: null, averageDuration: null, slowestModule: null, fastestModule: null, totalModules: 0, totalRecords: 0, warnings: [] };
        }
    },

    // ── Events Collector ──

    _collectEvents: function() {
        try {
            var events = LawAIApp.Events;

            var result = {
                available: false,
                hasData: false,
                totalEvents: 0,
                sessionCount: 0,
                recentEvents: [],
                categories: {},
                sources: {},
                insights: [],
                recommendations: [],
                risks: []
            };

            if (events) {
                result.available = true;

                if (typeof events.getEventCount === 'function') {
                    result.totalEvents = events.getEventCount() || 0;
                }
                if (typeof events.getSessionCount === 'function') {
                    result.sessionCount = events.getSessionCount() || 0;
                }
                if (typeof events.getStatistics === 'function') {
                    var stats = events.getStatistics();
                    if (stats) {
                        result.categories = stats.categories || {};
                        result.sources = stats.sources || {};
                        result.hasData = (stats.total || 0) > 0;
                    }
                }
                if (typeof events.getTimelineEntries === 'function') {
                    var entries = events.getTimelineEntries();
                    if (entries && entries.length > 0) {
                        result.recentEvents = entries.slice(-10);
                        result.hasData = true;
                    }
                }
                if (typeof events.getInsights === 'function') {
                    var insights = events.getInsights();
                    if (insights) result.insights = insights.slice(0, 5);
                }
                if (typeof events.getRecommendations === 'function') {
                    var recs = events.getRecommendations();
                    if (recs) result.recommendations = recs.slice(0, 5);
                }
                if (typeof events.getRisks === 'function') {
                    var risks = events.getRisks();
                    if (risks) result.risks = risks;
                }
            }

            return result;
        } catch (e) {
            return { available: false, hasData: false, totalEvents: 0, sessionCount: 0, recentEvents: [], categories: {}, sources: {}, insights: [], recommendations: [], risks: [] };
        }
    },

    // ── States Collector ──

    _collectStates: function() {
        try {
            var registry = LawAIApp.StateRegistry || window.stateRegistry;
            var engine = LawAIApp.StateSyncEngine || window.stateSyncEngine;
            var resolver = LawAIApp.StateConflictResolver || window.stateConflictResolver;
            var persistence = LawAIApp.StatePersistence || window.statePersistence;

            var result = {
                available: false,
                totalStates: 0,
                states: [],
                syncStatus: 'unknown',
                conflictCount: 0,
                snapshotCount: 0,
                runtimeState: null
            };

            if (registry) {
                result.available = true;
                if (typeof registry.getAll === 'function') {
                    var all = registry.getAll();
                    if (all) {
                        result.states = all.slice(0, 20);
                        result.totalStates = all.length;
                    }
                }
            }

            if (engine) {
                result.available = true;
                if (typeof engine.getHistory === 'function') {
                    var history = engine.getHistory(null, 1);
                    result.syncStatus = (history && history.length > 0) ? 'active' : 'idle';
                }
            }

            if (resolver && typeof resolver.getConflictCount === 'function') {
                result.conflictCount = resolver.getConflictCount() || 0;
            }

            if (persistence && typeof persistence.getStats === 'function') {
                var stats = persistence.getStats();
                if (stats) {
                    result.snapshotCount = stats.totalSnapshots || 0;
                }
            }

            // Runtime state integration
            var integration = LawAIApp.RuntimeStateIntegration || window.runtimeStateIntegration;
            if (integration && typeof integration.getUnifiedState === 'function') {
                var unified = integration.getUnifiedState();
                if (unified && unified.success) {
                    result.runtimeState = {
                        status: unified.runtime ? unified.runtime.status : 'unknown',
                        ready: unified.runtime ? unified.runtime.ready : false
                    };
                }
            }

            return result;
        } catch (e) {
            return { available: false, totalStates: 0, states: [], syncStatus: 'error', conflictCount: 0, snapshotCount: 0, runtimeState: null };
        }
    },

    // ============================================================
    // CACHE MANAGEMENT
    // ============================================================

    _isCacheValid: function() {
        if (!this._contextCache || !this._cacheTimestamp) return false;
        return (Date.now() - this._cacheTimestamp) < this._cacheTTL;
    },

    _cacheContext: function(context) {
        this._contextCache = context;
        this._cacheTimestamp = Date.now();

        // Store in history for Historical Context
        this._history.push({
            context: context,
            timestamp: context.timestamp,
            summary: {
                status: context.runtimeStatus.status,
                booted: context.runtimeStatus.booted,
                performanceScore: context.performance.score,
                eventCount: context.events.totalEvents,
                stateCount: context.states.totalStates
            }
        });

        // Bound history
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    },

    /**
     * Invalidate cache — forces next getFullContext() to re-collect.
     */
    invalidateCache: function() {
        this._cacheTimestamp = null;
    },

    // ============================================================
    // FALLBACK (Rule 4: Missing Data 安全处理)
    // ============================================================

    _fallbackContext: function(error) {
        return {
            runtimeStatus: { status: 'error', booted: false, booting: false, uptime: 0, version: 'N/A', pipeline: { status: 'error', stagesCompleted: 0, stagesTotal: 9, totalDuration: null, currentStage: null } },
            performance: { available: false, hasData: false, score: 0, status: 'ERROR', label: 'Error', bootDuration: null, averageDuration: null, slowestModule: null, fastestModule: null, totalModules: 0, totalRecords: 0, warnings: [] },
            events: { available: false, hasData: false, totalEvents: 0, sessionCount: 0, recentEvents: [], categories: {}, sources: {}, insights: [], recommendations: [], risks: [] },
            states: { available: false, totalStates: 0, states: [], syncStatus: 'error', conflictCount: 0, snapshotCount: 0, runtimeState: null },
            timestamp: new Date().toISOString(),
            _fallback: true,
            _error: error
        };
    },

    // ============================================================
    // NORMALIZATION (Chapter 12)
    // Ensures consistent format across all sources.
    // ============================================================

    /**
     * normalize(sourceData, schema)
     * Normalizes raw data to a standard format based on schema.
     * @param {Object} sourceData — raw data from collector
     * @param {string} schema — 'runtime' | 'performance' | 'events' | 'states'
     * @returns {Object} Normalized data
     */
    normalize: function(sourceData, schema) {
        if (!sourceData) return null;

        try {
            switch (schema) {
                case 'runtime':
                    return {
                        status: sourceData.status || 'unknown',
                        booted: !!sourceData.booted,
                        uptimeMs: sourceData.uptime || 0,
                        uptimeDisplay: this._formatUptime(sourceData.uptime || 0),
                        version: sourceData.version || 'N/A',
                        pipelineProgress: (sourceData.pipeline && sourceData.pipeline.stagesCompleted !== undefined)
                            ? sourceData.pipeline.stagesCompleted + '/' + sourceData.pipeline.stagesTotal
                            : '0/9'
                    };

                case 'performance':
                    return {
                        score: sourceData.score || 0,
                        grade: this._scoreToGrade(sourceData.score || 0),
                        hasData: !!sourceData.hasData,
                        bootDurationMs: sourceData.bootDuration || null,
                        moduleCount: sourceData.totalModules || 0,
                        warningCount: (sourceData.warnings && sourceData.warnings.length) || 0
                    };

                case 'events':
                    return {
                        total: sourceData.totalEvents || 0,
                        sessions: sourceData.sessionCount || 0,
                        hasRecent: (sourceData.recentEvents && sourceData.recentEvents.length > 0),
                        categoryCount: Object.keys(sourceData.categories || {}).length,
                        hasInsights: (sourceData.insights && sourceData.insights.length > 0)
                    };

                case 'states':
                    return {
                        total: sourceData.totalStates || 0,
                        conflicts: sourceData.conflictCount || 0,
                        snapshots: sourceData.snapshotCount || 0,
                        syncActive: sourceData.syncStatus === 'active',
                        runtimeReady: !!(sourceData.runtimeState && sourceData.runtimeState.ready)
                    };

                default:
                    return sourceData;
            }
        } catch (e) {
            return sourceData;
        }
    },

    /**
     * getNormalizedContext()
     * Returns full context with all sources normalized.
     * @param {boolean} forceRefresh
     * @returns {Object} Normalized Full Context
     */
    getNormalizedContext: function(forceRefresh) {
        var raw = this.getFullContext(forceRefresh);
        return {
            runtime: this.normalize(raw.runtimeStatus, 'runtime'),
            performance: this.normalize(raw.performance, 'performance'),
            events: this.normalize(raw.events, 'events'),
            states: this.normalize(raw.states, 'states'),
            timestamp: raw.timestamp
        };
    },

    // ── Helpers ──

    _formatUptime: function(ms) {
        if (!ms || ms <= 0) return '0s';
        var sec = Math.round(ms / 1000);
        if (sec < 120) return sec + 's';
        var min = Math.round(sec / 60);
        if (min < 120) return min + 'min';
        return Math.round(min / 60) + 'h';
    },

    _scoreToGrade: function(score) {
        if (score >= 90) return 'A';
        if (score >= 75) return 'B';
        if (score >= 50) return 'C';
        if (score >= 25) return 'D';
        return 'F';
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            cacheValid: this._isCacheValid(),
            historySize: this._history.length,
            lastContextTime: this._cacheTimestamp ? new Date(this._cacheTimestamp).toISOString() : null
        };
    }
};

// ── Auto-init ──
LawAIApp.AIContextEngine.init();

console.log('🧠 AI Context Engine — Part 46.2 Complete');
console.log('   ✅ Full Context: runtimeStatus + performance + events + states');
console.log('   ✅ Focused Context: per-module extraction');
console.log('   ✅ Historical Context: ' + LawAIApp.AIContextEngine._maxHistory + ' snapshots');
console.log('   ✅ Normalization: runtime, performance, events, states');
console.log('   ✅ Rules: data-sourced, read-only, timestamped, safe-fallback');
console.log('   ✅ Ready for Part 46.3 — Runtime Knowledge Layer');
