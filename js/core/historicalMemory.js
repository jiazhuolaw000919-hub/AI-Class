// ============================================================
// historicalMemory.js
// Part 51.2 — Historical Memory Integration
// Version: v5.1.2
// Module: Decision Intelligence Layer
// File: js/core/historicalMemory.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
        console.warn('[HistoricalMemory] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Memory Sources (Chapter 4)
    // ============================================================
    const MEMORY_SOURCES = {
        PERFORMANCE: 'performance',
        EVENT: 'event',
        DECISION: 'decision',
        RECOMMENDATION: 'recommendation',
        SNAPSHOT: 'snapshot'
    };

    // ============================================================
    // Historical Context Model (Chapter 5)
    // ============================================================
    class HistoricalContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.currentIssue = config.currentIssue || null;
            this.similarCases = config.similarCases || [];
            this.pastSolutions = config.pastSolutions || [];
            this.successRate = config.successRate || 0;
            this.confidence = config.confidence || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `hc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                currentIssue: this.currentIssue,
                similarCases: this.similarCases,
                pastSolutions: this.pastSolutions,
                successRate: this.successRate,
                confidence: this.confidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Memory Record
    // ============================================================
    class MemoryRecord {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.type = config.type || 'event';
            this.source = config.source || MEMORY_SOURCES.EVENT;
            this.timestamp = config.timestamp || Date.now();
            this.data = config.data || {};
            this.outcome = config.outcome || null;
            this.confidence = config.confidence || 0;
            this.tags = config.tags || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                id: this.id,
                type: this.type,
                source: this.source,
                timestamp: this.timestamp,
                data: this.data,
                outcome: this.outcome,
                confidence: this.confidence,
                tags: this.tags,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Pattern Detector (Chapter 6)
    // ============================================================
    class PatternDetector {
        constructor() {
            this._patterns = [];
        }

        detect(records, issue) {
            const patterns = [];

            // Pattern 1: Repeated Issue
            const repeated = this._detectRepeatedIssue(records, issue);
            if (repeated) {
                patterns.push({
                    type: 'repeated_issue',
                    description: repeated.description,
                    count: repeated.count,
                    frequency: repeated.frequency,
                    confidence: repeated.confidence
                });
            }

            // Pattern 2: Performance Trend
            const trend = this._detectPerformanceTrend(records);
            if (trend) {
                patterns.push({
                    type: 'performance_trend',
                    description: trend.description,
                    direction: trend.direction,
                    magnitude: trend.magnitude,
                    confidence: trend.confidence
                });
            }

            // Pattern 3: Failure Pattern
            const failure = this._detectFailurePattern(records);
            if (failure) {
                patterns.push({
                    type: 'failure_pattern',
                    description: failure.description,
                    failureRate: failure.rate,
                    commonCauses: failure.commonCauses,
                    confidence: failure.confidence
                });
            }

            // Pattern 4: Optimization Pattern
            const optimization = this._detectOptimizationPattern(records);
            if (optimization) {
                patterns.push({
                    type: 'optimization_pattern',
                    description: optimization.description,
                    improvement: optimization.improvement,
                    confidence: optimization.confidence
                });
            }

            return patterns;
        }

        _detectRepeatedIssue(records, issue) {
            const relevant = records.filter(r => {
                return r.data && r.data.issue && r.data.issue === issue;
            });

            if (relevant.length < 2) return null;

            const timeSpan = Date.now() - relevant[0].timestamp;
            const frequency = timeSpan > 0 ? (relevant.length / (timeSpan / 86400000)) : relevant.length;

            return {
                description: `Issue occurred ${relevant.length} times`,
                count: relevant.length,
                frequency: Math.round(frequency * 10) / 10,
                confidence: Math.min(100, relevant.length * 20)
            };
        }

        _detectPerformanceTrend(records) {
            const perfRecords = records.filter(r => 
                r.type === 'performance' || r.source === MEMORY_SOURCES.PERFORMANCE
            );

            if (perfRecords.length < 3) return null;

            const values = perfRecords.map(r => r.data.value || 0);
            const first = values[0];
            const last = values[values.length - 1];
            const direction = last > first ? 'increasing' : 'decreasing';
            const magnitude = Math.abs(((last - first) / first) * 100);

            return {
                description: `Performance ${direction} by ${Math.round(magnitude)}%`,
                direction: direction,
                magnitude: Math.round(magnitude),
                confidence: Math.min(100, perfRecords.length * 15)
            };
        }

        _detectFailurePattern(records) {
            const failures = records.filter(r => r.outcome === 'failure');
            const total = records.length;

            if (failures.length < 2 || total < 3) return null;

            const rate = (failures.length / total) * 100;
            const causes = failures.map(r => r.data.cause || 'unknown').filter(Boolean);

            return {
                description: `${Math.round(rate)}% failure rate detected`,
                rate: Math.round(rate),
                commonCauses: causes.slice(0, 3),
                confidence: Math.min(100, failures.length * 25)
            };
        }

        _detectOptimizationPattern(records) {
            const optimizations = records.filter(r => 
                r.tags && r.tags.includes('optimization')
            );

            if (optimizations.length < 2) return null;

            const improvements = optimizations.map(r => r.data.improvement || 0);
            const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;

            return {
                description: `${Math.round(avgImprovement)}% average improvement from optimizations`,
                improvement: Math.round(avgImprovement),
                confidence: Math.min(100, optimizations.length * 20)
            };
        }
    }

    // ============================================================
    // Historical Memory Core (Chapter 1-3)
    // ============================================================
    class HistoricalMemory {
        constructor() {
            this._records = [];
            this._contexts = [];
            this._patterns = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxRecords: 1000,
                retentionDays: 30,
                minSimilarityThreshold: 0.6,
                maxSimilarCases: 10,
                enableAutoLearning: true
            };
            this._patternDetector = new PatternDetector();
            this._similarityCache = {};
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[HistoricalMemory] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[HistoricalMemory] Initializing...');

            // Connect to modules (Chapter 7)
            this._connectToRuntimeSnapshot();
            this._connectToKnowledgeGraph();
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[HistoricalMemory] Initialized ✅');
            return this;
        }

        // ============================================================
        // Memory Operations (Chapter 3)
        // ============================================================

        /**
         * 查询历史记录
         */
        query(filter) {
            let records = this._records;

            if (filter) {
                if (filter.type) {
                    records = records.filter(r => r.type === filter.type);
                }
                if (filter.source) {
                    records = records.filter(r => r.source === filter.source);
                }
                if (filter.tags) {
                    records = records.filter(r => 
                        r.tags && filter.tags.some(t => r.tags.includes(t))
                    );
                }
                if (filter.timeRange) {
                    const { start, end } = filter.timeRange;
                    records = records.filter(r => 
                        r.timestamp >= start && r.timestamp <= end
                    );
                }
                if (filter.outcome) {
                    records = records.filter(r => r.outcome === filter.outcome);
                }
                if (filter.limit) {
                    records = records.slice(-filter.limit);
                }
            }

            return records.map(r => r.toJSON());
        }

        /**
         * 获取历史上下文 (Chapter 5)
         */
        getHistoricalContext(issue, options) {
            console.log(`[HistoricalMemory] Building context for: ${issue}`);

            // Find similar cases
            const similarCases = this._findSimilarCases(issue, options?.limit || this._config.maxSimilarCases);

            // Find past solutions
            const pastSolutions = this._findPastSolutions(similarCases);

            // Calculate success rate
            const successRate = this._calculateSuccessRate(similarCases);

            // Calculate confidence
            const confidence = this._calculateHistoricalConfidence(similarCases, pastSolutions);

            // Build context
            const context = new HistoricalContext({
                currentIssue: issue,
                similarCases: similarCases.map(c => c.toJSON ? c.toJSON() : c),
                pastSolutions: pastSolutions,
                successRate: successRate,
                confidence: confidence,
                metadata: {
                    options: options || {},
                    recordCount: this._records.length,
                    timestamp: Date.now()
                }
            });

            this._contexts.push(context);

            // Detect patterns (Chapter 6)
            const patterns = this._patternDetector.detect(this._records, issue);
            if (patterns.length > 0) {
                this._patterns.push(...patterns);
            }

            this._emit('contextBuilt', context.toJSON());

            return context;
        }

        /**
         * 添加记忆记录
         */
        remember(data) {
            const record = new MemoryRecord({
                type: data.type || 'event',
                source: data.source || MEMORY_SOURCES.EVENT,
                data: data.data || {},
                outcome: data.outcome || null,
                confidence: data.confidence || 0,
                tags: data.tags || [],
                metadata: data.metadata || {}
            });

            this._records.push(record);

            // Enforce max records
            if (this._records.length > this._config.maxRecords) {
                this._records.shift();
            }

            // Auto-learn (Chapter 6)
            if (this._config.enableAutoLearning) {
                this._autoLearn(record);
            }

            this._emit('recordAdded', record.toJSON());
            return record;
        }

        /**
         * 批量添加记忆
         */
        rememberMany(records) {
            const results = [];
            records.forEach(data => {
                results.push(this.remember(data));
            });
            return results;
        }

        // ============================================================
        // Similarity Search (Chapter 3)
        // ============================================================

        _findSimilarCases(issue, limit) {
            const similar = [];

            this._records.forEach(record => {
                const similarity = this._calculateSimilarity(issue, record);
                if (similarity >= this._config.minSimilarityThreshold) {
                    similar.push({
                        record: record,
                        similarity: similarity
                    });
                }
            });

            // Sort by similarity
            similar.sort((a, b) => b.similarity - a.similarity);

            // Return top results
            return similar.slice(0, limit).map(s => s.record);
        }

        _calculateSimilarity(issue, record) {
            let score = 0;
            const data = record.data || {};

            // Exact match
            if (data.issue === issue) {
                score += 50;
            }

            // Tag match
            if (record.tags && record.tags.includes(issue)) {
                score += 30;
            }

            // Partial match
            if (data.issue && data.issue.includes(issue)) {
                score += 20;
            }

            // Type match
            if (record.type === issue) {
                score += 10;
            }

            // Normalize to 0-1
            return Math.min(score / 100, 1);
        }

        _findPastSolutions(similarCases) {
            const solutions = [];

            similarCases.forEach(record => {
                if (record.data && record.data.solution) {
                    solutions.push({
                        solution: record.data.solution,
                        outcome: record.outcome,
                        confidence: record.confidence,
                        timestamp: record.timestamp
                    });
                }
            });

            // Sort by confidence
            solutions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

            return solutions.slice(0, 5);
        }

        _calculateSuccessRate(similarCases) {
            if (similarCases.length === 0) return 0;

            const successful = similarCases.filter(r => r.outcome === 'success');
            return Math.round((successful.length / similarCases.length) * 100);
        }

        _calculateHistoricalConfidence(similarCases, pastSolutions) {
            let confidence = 50;

            // Factor 1: Number of similar cases
            const caseWeight = Math.min(similarCases.length / 5, 1) * 20;
            confidence += caseWeight;

            // Factor 2: Success rate
            const successRate = this._calculateSuccessRate(similarCases);
            const successWeight = (successRate / 100) * 15;
            confidence += successWeight;

            // Factor 3: Solutions available
            const solutionWeight = Math.min(pastSolutions.length / 3, 1) * 15;
            confidence += solutionWeight;

            return Math.min(Math.round(confidence), 100);
        }

        // ============================================================
        // Pattern Detection (Chapter 6)
        // ============================================================

        detectPatterns(records, issue) {
            return this._patternDetector.detect(records || this._records, issue);
        }

        getPatterns(filter) {
            let patterns = this._patterns;

            if (filter) {
                if (filter.type) {
                    patterns = patterns.filter(p => p.type === filter.type);
                }
                if (filter.minConfidence) {
                    patterns = patterns.filter(p => (p.confidence || 0) >= filter.minConfidence);
                }
            }

            return patterns;
        }

        // ============================================================
        // Auto-Learning (Chapter 6)
        // ============================================================

        _autoLearn(record) {
            // Learn from outcomes
            if (record.outcome === 'success' && record.data.solution) {
                this._patterns.push({
                    type: 'successful_solution',
                    description: `Solution worked: ${record.data.solution}`,
                    confidence: record.confidence || 70,
                    timestamp: Date.now()
                });
            }

            if (record.outcome === 'failure' && record.data.cause) {
                this._patterns.push({
                    type: 'failure_cause',
                    description: `Failure cause: ${record.data.cause}`,
                    confidence: record.confidence || 60,
                    timestamp: Date.now()
                });
            }
        }

        // ============================================================
        // Auto-Learning (Chapter 6)
        // ============================================================

        _loadHistoricalData() {
            // Try to load from localStorage
            try {
                const saved = localStorage.getItem('historicalMemoryData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.records) {
                        data.records.forEach(r => {
                            this._records.push(new MemoryRecord(r));
                        });
                        console.log(`[HistoricalMemory] Loaded ${this._records.length} records from storage`);
                    }
                    if (data.patterns) {
                        this._patterns.push(...data.patterns);
                    }
                }
            } catch (e) {
                // ignore
            }

            // Also try to load from Runtime Snapshot
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Snapshot) {
                try {
                    const snapshots = window.LawAIApp.Runtime.Snapshot.getSnapshots ?
                        window.LawAIApp.Runtime.Snapshot.getSnapshots() : [];
                    if (snapshots && snapshots.length > 0) {
                        snapshots.forEach(snapshot => {
                            this.remember({
                                type: 'snapshot',
                                source: MEMORY_SOURCES.SNAPSHOT,
                                data: snapshot,
                                tags: ['snapshot', 'historical']
                            });
                        });
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._records.length;
            const bySource = {};
            const byOutcome = { success: 0, failure: 0, unknown: 0 };

            this._records.forEach(r => {
                bySource[r.source] = (bySource[r.source] || 0) + 1;
                if (r.outcome === 'success') byOutcome.success++;
                else if (r.outcome === 'failure') byOutcome.failure++;
                else byOutcome.unknown++;
            });

            const patternStats = {
                total: this._patterns.length,
                byType: {}
            };

            this._patterns.forEach(p => {
                patternStats.byType[p.type] = (patternStats.byType[p.type] || 0) + 1;
            });

            return {
                total,
                bySource,
                byOutcome,
                patterns: patternStats,
                contexts: this._contexts.length
            };
        },

        // ============================================================
        // Explorer Support (Chapter 9)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.query({ limit: 5 });
            const recentContexts = this._contexts.slice(-5).map(c => c.toJSON());
            const patterns = this.getPatterns({ limit: 5 });

            return {
                type: 'historical_memory',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentRecords: recent,
                recentContexts: recentContexts,
                patterns: patterns,
                config: this._config
            };
        },

        // ============================================================
        // Listeners
        // ============================================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        }

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error('[HistoricalMemory] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`historicalmemory.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 7)
        // ============================================================

        _connectToRuntimeSnapshot() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Snapshot) {
                console.log('[HistoricalMemory] Connected to Runtime Snapshot');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[HistoricalMemory] Connected to Knowledge Graph');
            }
        }

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                // Listen for decisions
                window.LawAIApp.DecisionEngine.on('decisionMade', (decision) => {
                    this.remember({
                        type: 'decision',
                        source: MEMORY_SOURCES.DECISION,
                        data: {
                            issue: decision.trigger,
                            decision: decision.id,
                            recommendation: decision.recommendation
                        },
                        outcome: decision.status === 'COMPLETED' ? 'success' : 'pending',
                        confidence: decision.confidence || 0,
                        tags: ['decision', decision.priority || 'normal']
                    });
                });
                console.log('[HistoricalMemory] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                // Listen for recommendations
                window.LawAIApp.RecommendationEngine.on('recommendationCreated', (rec) => {
                    this.remember({
                        type: 'recommendation',
                        source: MEMORY_SOURCES.RECOMMENDATION,
                        data: {
                            issue: rec.title,
                            solution: rec.recommendation,
                            confidence: rec.confidence
                        },
                        outcome: rec.status === 'APPROVED' ? 'success' : 'pending',
                        confidence: rec.confidence || 0,
                        tags: ['recommendation', rec.type || 'general']
                    });
                });
                console.log('[HistoricalMemory] Connected to Recommendation Engine');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'historical-memory',
                        name: 'Historical Memory',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[HistoricalMemory] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[HistoricalMemory] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new HistoricalMemory();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.HistoricalMemory = {
        Core: instance,
        MEMORY_SOURCES: MEMORY_SOURCES,

        // Public API
        initialize: (config) => instance.initialize(config),
        query: (filter) => instance.query(filter),
        getHistoricalContext: (issue, options) => instance.getHistoricalContext(issue, options),
        remember: (data) => instance.remember(data),
        rememberMany: (records) => instance.rememberMany(records),

        detectPatterns: (records, issue) => instance.detectPatterns(records, issue),
        getPatterns: (filter) => instance.getPatterns(filter),

        getStats: () => instance.getStats(),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[HistoricalMemory] Part 51.2 loaded ✅');
    console.log('[HistoricalMemory] Memory Sources:', Object.values(MEMORY_SOURCES).join(' | '));

})();
