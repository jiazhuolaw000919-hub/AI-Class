// ================================================================
// aiRuntimeAssistant.js — Part 46.1
// AI Runtime Assistant Foundation
// Version: v4.6.1
// Status: Architecture Foundation
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Understanding, Analysis, Recommendation.
//   Does NOT modify Runtime State.
//
// SAFETY RULES
//   Rule 1: AI 不直接修改 Runtime State
//   Rule 2: AI 建议必须基于 Runtime Data
//   Rule 3: AI Failure 不影响 Runtime
//   Rule 4: AI Context 必须可追踪
//
// CONTEXT MODEL
//   { runtime, state, events, performance, timestamp }
//
// ARCHITECTURE POSITION
//   Runtime Systems (Performance, Event, State)
//        ↓
//   AI Context Layer  ← this module
//        ↓
//   AI Runtime Assistant
//
// DEPENDENCIES (read-only)
//   BootManager, Performance, Events, StateSyncEngine,
//   RuntimeMetricsCollector, SystemIntelligenceCollector
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIRuntimeAssistant = {
    _version: '4.6.1',
    _ready: false,
    _lastContext: null,
    _contextHistory: [],
    _maxHistory: 50,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    /**
     * Initialize the AI Runtime Assistant.
     * Safe to call multiple times — only initializes once.
     * @returns {Object} this
     */
    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Runtime Assistant v' + this._version + ' ready');
        console.log('   📋 Context: runtime + state + events + performance');
        console.log('   🛡️ Safety: read-only, data-backed, isolated');
        return this;
    },

    /**
     * Check if Assistant is ready.
     * @returns {boolean}
     */
    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 5: CONTEXT MODEL
    // Aggregates all Runtime data into a single AI Context.
    // ============================================================

    /**
     * getContext()
     * Builds unified AI Context from all Runtime data sources.
     * @returns {Object} context — { runtime, state, events, performance, timestamp }
     */
    getContext: function() {
        // Rule 3: entire context build is safe — failures stay inside
        try {
            var context = {
                runtime: this._collectRuntime(),
                state: this._collectState(),
                events: this._collectEvents(),
                performance: this._collectPerformance(),
                timestamp: new Date().toISOString()
            };

            // Rule 4: Context must be traceable
            this._lastContext = context;
            this._contextHistory.push({
                timestamp: context.timestamp,
                summary: this._summarizeContext(context)
            });

            // Keep history bounded
            if (this._contextHistory.length > this._maxHistory) {
                this._contextHistory.shift();
            }

            return context;
        } catch (err) {
            console.warn('[AIRuntimeAssistant] Context build failed:', err.message);
            // Rule 3: Failure不影响Runtime，返回降级context
            return this._fallbackContext(err.message);
        }
    },

    /**
     * Get context history for traceability.
     * @param {number} limit — max entries to return
     * @returns {Array} context history entries
     */
    getContextHistory: function(limit) {
        limit = limit || 10;
        return this._contextHistory.slice(-limit);
    },

    /**
     * Get the last built context.
     * @returns {Object|null}
     */
    getLastContext: function() {
        return this._lastContext;
    },

    // ── Sub-collectors (read-only, safe) ──

    _collectRuntime: function() {
        try {
            var bm = LawAIApp.BootManager || window.bootManager;
            var pipeline = LawAIApp.BootPipeline || window.bootPipeline;

            var result = {
                status: 'unknown',
                booted: false,
                uptime: 0,
                version: 'N/A',
                stagesCompleted: 0,
                stagesTotal: 9,
                pipelineStatus: 'idle',
                totalDuration: null
            };

            if (bm) {
                result.booted = !!(bm._booted || (typeof bm.isBooted === 'function' && bm.isBooted()));
                result.status = result.booted ? 'running' : (bm._booting ? 'booting' : 'idle');
            }

            var perf = LawAIApp.Performance;
            if (perf && perf._bootStartTime) {
                result.uptime = Date.now() - perf._bootStartTime;
            }

            result.version = (LawAIApp.SystemComposer && LawAIApp.SystemComposer.version) || 'V4.5.9';

            if (pipeline && typeof pipeline.getPipelineStatus === 'function') {
                var ps = pipeline.getPipelineStatus();
                result.pipelineStatus = ps.status || 'idle';
                result.totalDuration = ps.totalDuration || null;
                if (ps.completedStages) {
                    result.stagesCompleted = ps.completedStages.length;
                }
            }

            return result;
        } catch (e) {
            return { status: 'error', error: e.message };
        }
    },

    _collectState: function() {
        try {
            var engine = LawAIApp.StateSyncEngine || window.stateSyncEngine;
            var registry = LawAIApp.StateRegistry || window.stateRegistry;
            var resolver = LawAIApp.StateConflictResolver || window.stateConflictResolver;

            var result = {
                states: {},
                stateCount: 0,
                conflicts: 0,
                syncStatus: 'unknown'
            };

            if (engine) {
                if (typeof engine.getAll === 'function') {
                    var all = engine.getAll();
                    if (all) {
                        result.states = all;
                        result.stateCount = Object.keys(all).length;
                    }
                }
                // Check sync status
                if (typeof engine.getHistory === 'function') {
                    var history = engine.getHistory(null, 1);
                    result.syncStatus = (history && history.length > 0) ? 'active' : 'idle';
                }
            }

            if (registry && typeof registry.getAll === 'function') {
                var registered = registry.getAll();
                if (registered) {
                    result.stateCount = Math.max(result.stateCount, registered.length);
                }
            }

            if (resolver && typeof resolver.getConflictCount === 'function') {
                result.conflicts = resolver.getConflictCount() || 0;
            }

            return result;
        } catch (e) {
            return { states: {}, stateCount: 0, conflicts: 0, syncStatus: 'error' };
        }
    },

    _collectEvents: function() {
        try {
            var events = LawAIApp.Events;

            var result = {
                totalEvents: 0,
                sessionCount: 0,
                recentEvents: [],
                insights: [],
                hasData: false
            };

            if (events) {
                if (typeof events.getEventCount === 'function') {
                    result.totalEvents = events.getEventCount() || 0;
                }
                if (typeof events.getSessionCount === 'function') {
                    result.sessionCount = events.getSessionCount() || 0;
                }
                if (typeof events.getTimelineEntries === 'function') {
                    var entries = events.getTimelineEntries();
                    if (entries && entries.length > 0) {
                        result.recentEvents = entries.slice(-5);
                        result.hasData = true;
                    }
                }
                if (typeof events.getInsights === 'function') {
                    var insights = events.getInsights();
                    if (insights && insights.length > 0) {
                        result.insights = insights.slice(0, 3);
                    }
                }
                result.hasData = result.hasData || result.totalEvents > 0;
            }

            return result;
        } catch (e) {
            return { totalEvents: 0, sessionCount: 0, recentEvents: [], insights: [], hasData: false };
        }
    },

    _collectPerformance: function() {
        try {
            var perf = LawAIApp.Performance;

            var result = {
                score: 0,
                status: 'UNKNOWN',
                bootDuration: null,
                totalModules: 0,
                totalRecords: 0,
                warnings: [],
                hasData: false
            };

            if (perf && typeof perf.report === 'function') {
                var report = perf.report();
                if (report) {
                    if (report.health) {
                        result.score = report.health.score || 0;
                        result.status = report.health.status || 'UNKNOWN';
                    }
                    if (report.summary) {
                        result.bootDuration = report.summary.bootDuration || null;
                        result.totalModules = report.summary.totalModules || 0;
                        result.totalRecords = report.summary.totalRecords || 0;
                        result.hasData = report.summary.hasData || false;
                    }
                    if (report.warnings) {
                        result.warnings = report.warnings;
                    }
                }
            }

            return result;
        } catch (e) {
            return { score: 0, status: 'ERROR', bootDuration: null, totalModules: 0, warnings: [], hasData: false };
        }
    },

    // ── Context Summary (for history trace) ──

    _summarizeContext: function(context) {
        return {
            status: context.runtime.status,
            booted: context.runtime.booted,
            performanceScore: context.performance.score,
            eventCount: context.events.totalEvents,
            stateCount: context.state.stateCount,
            conflicts: context.state.conflicts
        };
    },

    // ── Fallback Context (when full build fails) ──

    _fallbackContext: function(error) {
        return {
            runtime: { status: 'error', booted: false, uptime: 0, version: 'N/A', stagesCompleted: 0, stagesTotal: 9, pipelineStatus: 'error', totalDuration: null },
            state: { states: {}, stateCount: 0, conflicts: 0, syncStatus: 'error' },
            events: { totalEvents: 0, sessionCount: 0, recentEvents: [], insights: [], hasData: false },
            performance: { score: 0, status: 'ERROR', bootDuration: null, totalModules: 0, warnings: [], hasData: false },
            timestamp: new Date().toISOString(),
            _fallback: true,
            _error: error
        };
    },

    // ============================================================
    // CHAPTER 6: ASSISTANT CAPABILITY
    // Phase 1: Explanation, Analysis, Recommendation
    // ============================================================

    /**
     * explain()
     * Explains current Runtime state in human-readable form.
     * @returns {Object} { summary, details, health }
     */
    explain: function() {
        var ctx = this.getContext();
        var runtime = ctx.runtime;
        var perf = ctx.performance;
        var events = ctx.events;
        var state = ctx.state;

        var summary = '';
        var details = [];
        var health = 'unknown';

        if (runtime.booted) {
            var uptimeSec = Math.round(runtime.uptime / 1000);
            var uptimeStr = uptimeSec < 120 ? uptimeSec + 's' : Math.round(uptimeSec / 60) + 'min';
            summary = 'Runtime is running. Boot completed successfully.';

            details.push('Pipeline: ' + runtime.stagesCompleted + '/' + runtime.stagesTotal + ' stages completed');
            if (runtime.totalDuration) {
                details.push('Boot duration: ' + runtime.totalDuration + 'ms');
            }
            details.push('Uptime: ' + uptimeStr);

            if (perf.score >= 80) {
                health = 'healthy';
                details.push('Performance score: ' + perf.score + '% (Healthy)');
            } else if (perf.score >= 50) {
                health = 'degraded';
                details.push('Performance score: ' + perf.score + '% (Degraded)');
            } else if (perf.hasData) {
                health = 'poor';
                details.push('Performance score: ' + perf.score + '% (Poor)');
            }

            if (state.conflicts > 0) {
                health = health === 'healthy' ? 'warning' : health;
                details.push('⚠️ State conflicts detected: ' + state.conflicts);
            }

            if (events.totalEvents > 0) {
                details.push('Events recorded: ' + events.totalEvents);
            }

        } else if (runtime.status === 'booting') {
            summary = 'Runtime is currently booting.';
            health = 'transitioning';
            details.push('Pipeline status: ' + runtime.pipelineStatus);
        } else {
            summary = 'Runtime is idle. Boot has not been triggered.';
            health = 'idle';
            details.push('BootManager reports: not booted');
        }

        return {
            summary: summary,
            details: details,
            health: health,
            basedOn: {
                booted: runtime.booted,
                performanceScore: perf.score,
                eventCount: events.totalEvents,
                stateConflicts: state.conflicts,
                timestamp: ctx.timestamp
            }
        };
    },

    /**
     * analyze()
     * Analyzes Runtime for issues.
     * @returns {Object} { issues, severity, context }
     */
    analyze: function() {
        var ctx = this.getContext();
        var issues = [];
        var severity = 'low';

        // Check boot status
        if (!ctx.runtime.booted && ctx.runtime.status !== 'booting') {
            issues.push({
                type: 'boot',
                severity: 'high',
                message: 'Runtime has not booted. BootManager._booted is false.',
                basedOn: 'runtime.booted'
            });
            severity = 'high';
        }

        // Check pipeline completion
        if (ctx.runtime.booted && ctx.runtime.stagesCompleted < ctx.runtime.stagesTotal) {
            issues.push({
                type: 'pipeline',
                severity: 'medium',
                message: 'Pipeline incomplete: ' + ctx.runtime.stagesCompleted + '/' + ctx.runtime.stagesTotal + ' stages completed.',
                basedOn: 'runtime.stagesCompleted'
            });
            if (severity !== 'high') severity = 'medium';
        }

        // Check performance
        if (ctx.performance.hasData && ctx.performance.score < 50) {
            issues.push({
                type: 'performance',
                severity: 'medium',
                message: 'Performance score is low: ' + ctx.performance.score + '%.',
                basedOn: 'performance.score'
            });
            if (severity === 'low') severity = 'medium';
        }

        // Check state conflicts
        if (ctx.state.conflicts > 0) {
            issues.push({
                type: 'state',
                severity: 'medium',
                message: ctx.state.conflicts + ' state conflict(s) detected.',
                basedOn: 'state.conflicts'
            });
            if (severity === 'low') severity = 'medium';
        }

        // Check event activity
        if (ctx.runtime.booted && ctx.events.totalEvents === 0) {
            issues.push({
                type: 'events',
                severity: 'low',
                message: 'No events recorded despite runtime being booted. Event system may not be active.',
                basedOn: 'events.totalEvents'
            });
        }

        // Check performance warnings
        if (ctx.performance.warnings && ctx.performance.warnings.length > 0) {
            issues.push({
                type: 'performance_warnings',
                severity: 'low',
                message: ctx.performance.warnings.length + ' performance warning(s) found.',
                basedOn: 'performance.warnings'
            });
        }

        return {
            issues: issues,
            severity: severity,
            issueCount: issues.length,
            context: this._summarizeContext(ctx)
        };
    },

    /**
     * recommend()
     * Provides optimization recommendations based on Runtime data.
     * @returns {Object} { recommendations, basedOn }
     */
    recommend: function() {
        var analysis = this.analyze();
        var recommendations = [];
        var basedOn = [];

        for (var i = 0; i < analysis.issues.length; i++) {
            var issue = analysis.issues[i];

            switch (issue.type) {
                case 'boot':
                    basedOn.push('runtime.booted');
                    recommendations.push({
                        priority: 'high',
                        action: 'Trigger BootManager.start() to initialize the Runtime.',
                        reason: issue.message
                    });
                    break;

                case 'pipeline':
                    basedOn.push('runtime.stagesCompleted');
                    recommendations.push({
                        priority: 'medium',
                        action: 'Check BootPipeline for failed stages. Run BootDiagnostics to identify the blocked stage.',
                        reason: issue.message
                    });
                    break;

                case 'performance':
                    basedOn.push('performance.score');
                    recommendations.push({
                        priority: 'medium',
                        action: 'Review Performance report for slow modules. Check RuntimePerformanceDashboard for bottlenecks.',
                        reason: issue.message
                    });
                    break;

                case 'state':
                    basedOn.push('state.conflicts');
                    recommendations.push({
                        priority: 'medium',
                        action: 'Run StateConflictResolver to resolve ' + analysis.issues[0].message.split(' ')[0] + ' conflict(s). Check state history for root cause.',
                        reason: issue.message
                    });
                    break;

                case 'events':
                    basedOn.push('events.totalEvents');
                    recommendations.push({
                        priority: 'low',
                        action: 'Verify RuntimeEventCollector is initialized and emitting events. Check Event Registry for registered event types.',
                        reason: issue.message
                    });
                    break;

                case 'performance_warnings':
                    basedOn.push('performance.warnings');
                    recommendations.push({
                        priority: 'low',
                        action: 'Inspect performance warnings in RuntimePerformanceReport for details.',
                        reason: issue.message
                    });
                    break;

                default:
                    recommendations.push({
                        priority: 'low',
                        action: 'Investigate: ' + issue.message,
                        reason: 'Unknown issue type'
                    });
                    break;
            }
        }

        // No issues — give positive reinforcement
        if (recommendations.length === 0) {
            basedOn.push('runtime.booted', 'performance.score', 'state.conflicts', 'events.totalEvents');
            recommendations.push({
                priority: 'none',
                action: 'Runtime is healthy. No action needed. Continue monitoring.',
                reason: 'All systems operational.'
            });
        }

        return {
            recommendations: recommendations,
            basedOn: basedOn,
            totalIssues: analysis.issueCount,
            severity: analysis.severity
        };
    },

    // ============================================================
    // TRACEABILITY (Rule 4)
    // ============================================================

    /**
     * traceContext()
     * Returns a traceable snapshot of the last context analysis.
     * @returns {Object} { context, explanation, analysis, recommendations, timestamp }
     */
    traceContext: function() {
        return {
            context: this._lastContext,
            explanation: this.explain(),
            analysis: this.analyze(),
            recommendations: this.recommend(),
            timestamp: new Date().toISOString(),
            assistantVersion: this._version
        };
    },

    // ============================================================
    // STATUS
    // ============================================================

    /**
     * Get Assistant status.
     * @returns {Object}
     */
    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            contextHistorySize: this._contextHistory.length,
            lastContextTime: this._lastContext ? this._lastContext.timestamp : null
        };
    }
};

// ── Auto-init when loaded ──
LawAIApp.AIRuntimeAssistant.init();

console.log('🧠 AI Runtime Assistant Foundation — Part 46.1 Complete');
console.log('   ✅ Context Model: runtime + state + events + performance');
console.log('   ✅ Capabilities: explain, analyze, recommend');
console.log('   ✅ Safety Rules: read-only, data-backed, isolated, traceable');
console.log('   ✅ Ready for Part 46.2 — AI Context Engine');
