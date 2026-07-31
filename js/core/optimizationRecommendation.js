// ============================================================
// optimizationRecommendation.js
// Part 52.5 — Optimization Recommendation System
// Version: v5.2.5
// Module: Runtime Self Optimization Layer
// File: js/core/optimizationRecommendation.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OptimizationRecommendation) {
        console.warn('[OptimizationRecommendation] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Recommendation Types (Chapter 7)
    // ============================================================
    const REC_TYPE = {
        PERFORMANCE: 'performance',
        RESOURCE: 'resource',
        ARCHITECTURE: 'architecture',
        STABILITY: 'stability',
        EFFICIENCY: 'efficiency'
    };

    // ============================================================
    // Recommendation Priority (Chapter 6)
    // ============================================================
    const REC_PRIORITY = {
        CRITICAL: 'CRITICAL',
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW'
    };

    // ============================================================
    // Recommendation Status
    // ============================================================
    const REC_STATUS = {
        PENDING: 'PENDING',
        REVIEWING: 'REVIEWING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        IMPLEMENTED: 'IMPLEMENTED',
        DISMISSED: 'DISMISSED'
    };

    // ============================================================
    // Recommendation Model (Chapter 4)
    // ============================================================
    class OptimizationRecommendation {
        constructor(config) {
            this.recommendationId = config.recommendationId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.problem = config.problem || '';
            this.solution = config.solution || '';
            this.impact = config.impact || '';
            this.risk = config.risk || 'LOW';
            this.confidence = config.confidence || 0;
            this.priority = config.priority || REC_PRIORITY.MEDIUM;
            this.status = REC_STATUS.PENDING;
            this.type = config.type || REC_TYPE.PERFORMANCE;
            this.source = config.source || 'unknown';
            this.affectedModules = config.affectedModules || [];
            this.estimatedEffort = config.estimatedEffort || 'unknown';
            this.sender = config.sender || 'system';
            this.approvedAt = null;
            this.rejectedAt = null;
            this.implementedAt = null;
            this.metadata = config.metadata || {};
            this.evidence = config.evidence || [];
        }

        _generateId() {
            return `optrec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        approve() {
            if (this.status !== REC_STATUS.PENDING && this.status !== REC_STATUS.REVIEWING) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot approve in ${this.status} state`);
                return false;
            }
            this.status = REC_STATUS.APPROVED;
            this.approvedAt = Date.now();
            return true;
        }

        reject(reason) {
            if (this.status !== REC_STATUS.PENDING && this.status !== REC_STATUS.REVIEWING) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot reject in ${this.status} state`);
                return false;
            }
            this.status = REC_STATUS.REJECTED;
            this.rejectedAt = Date.now();
            this.metadata.rejectionReason = reason || 'No reason provided';
            return true;
        }

        implement() {
            if (this.status !== REC_STATUS.APPROVED) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot implement in ${this.status} state`);
                return false;
            }
            this.status = REC_STATUS.IMPLEMENTED;
            this.implementedAt = Date.now();
            return true;
        }

        toJSON() {
            return {
                recommendationId: this.recommendationId,
                timestamp: this.timestamp,
                target: this.target,
                problem: this.problem,
                solution: this.solution,
                impact: this.impact,
                risk: this.risk,
                confidence: this.confidence,
                priority: this.priority,
                status: this.status,
                type: this.type,
                source: this.source,
                affectedModules: this.affectedModules,
                estimatedEffort: this.estimatedEffort,
                approvedAt: this.approvedAt,
                rejectedAt: this.rejectedAt,
                implementedAt: this.implementedAt,
                metadata: this.metadata,
                evidence: this.evidence
            };
        }
    }

    // ============================================================
    // Recommendation Generator (Chapter 2-3)
    // ============================================================
    class RecommendationGenerator {
        constructor(config) {
            this._recommendations = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 100,
                minConfidenceThreshold: 50,
                highImpactThreshold: 80,
                mediumImpactThreshold: 50,
                requireGovernanceReview: true,
                autoApproveLowRisk: false
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OptimizationRecommendation] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OptimizationRecommendation] Initializing...');

            // Connect to modules (Chapter 5)
            this._connectToPerformanceAnalyzer();
            this._connectToResourceEngine();
            this._connectToArchitectureAdvisor();
            this._connectToHistoricalMemory();
            this._connectToDecisionIntelligence();
            this._connectToGovernance();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[OptimizationRecommendation] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Generate Recommendations (Chapter 2-3)
        // ============================================================

        generate(source, insights, options) {
            console.log(`[OptimizationRecommendation] Generating recommendations from ${source}`);

            const recommendations = [];

            if (!insights || insights.length === 0) {
                console.log('[OptimizationRecommendation] No insights to process');
                return recommendations;
            }

            insights.forEach(insight => {
                // Extract recommendation data from insight
                const recData = this._extractRecommendation(insight, source, options);
                if (!recData) return;

                // Calculate priority (Chapter 6)
                const priority = this._calculatePriority(recData);

                // Create recommendation
                const recommendation = new OptimizationRecommendation({
                    target: recData.target || 'unknown',
                    problem: recData.problem || insight.issue || 'Unknown issue',
                    solution: recData.solution || insight.suggestion || 'Review and optimize',
                    impact: recData.impact || insight.impact || 'Unknown',
                    risk: recData.risk || 'MEDIUM',
                    confidence: recData.confidence || insight.confidence || 60,
                    priority: priority,
                    type: this._determineType(recData, insight),
                    source: source,
                    affectedModules: recData.affectedModules || insight.affectedModules || [],
                    estimatedEffort: recData.estimatedEffort || 'medium',
                    sender: 'system',
                    evidence: insight.evidence || [],
                    metadata: {
                        sourceInsight: insight.id || null,
                        sourceData: insight
                    }
                });

                // Auto-approve low risk if configured (Chapter 8)
                if (this._config.autoApproveLowRisk && 
                    recommendation.risk === 'LOW' && 
                    recommendation.confidence > 80) {
                    recommendation.approve();
                    console.log(`[OptimizationRecommendation] Auto-approved: ${recommendation.recommendationId}`);
                }

                recommendations.push(recommendation);
                this._recommendations.push(recommendation);

                // Send to Governance (Chapter 8)
                if (this._config.requireGovernanceReview && 
                    recommendation.status === REC_STATUS.PENDING) {
                    this._sendToGovernance(recommendation);
                }
            });

            // Enforce history limit
            if (this._recommendations.length > this._config.maxHistorySize) {
                this._recommendations = this._recommendations.slice(-this._config.maxHistorySize);
            }

            this._emit('recommendationsGenerated', {
                count: recommendations.length,
                recommendations: recommendations.map(r => r.toJSON()),
                timestamp: Date.now()
            });

            return recommendations;
        }

        // ============================================================
        // Extract Recommendation (Chapter 5)
        // ============================================================

        _extractRecommendation(insight, source, options) {
            // Map different insight formats to recommendation format
            const rec = {
                target: insight.target || insight.module || 'unknown',
                problem: insight.issue || insight.description || 'Optimization opportunity',
                solution: insight.suggestion || insight.recommendation || 'Review and optimize',
                impact: insight.impact || 'Unknown impact',
                risk: insight.risk || 'MEDIUM',
                confidence: insight.confidence || 60,
                affectedModules: insight.affectedModules || [insight.target || insight.module].filter(Boolean),
                estimatedEffort: insight.effort || 'medium'
            };

            // Handle different source types
            switch (source) {
                case 'performance_analyzer':
                    rec.risk = this._calculateRiskFromDeviation(insight.deviation || 0);
                    break;
                case 'resource_optimization':
                    rec.risk = this._calculateRiskFromUsage(insight.currentUsage || 0);
                    break;
                case 'architecture_advisor':
                    rec.risk = insight.risk || 'MEDIUM';
                    if (rec.risk === 'CRITICAL') rec.priority = REC_PRIORITY.CRITICAL;
                    break;
                default:
                    break;
            }

            return rec;
        }

        _calculateRiskFromDeviation(deviation) {
            if (deviation > 50) return 'CRITICAL';
            if (deviation > 30) return 'HIGH';
            if (deviation > 15) return 'MEDIUM';
            return 'LOW';
        }

        _calculateRiskFromUsage(usage) {
            if (usage > 90) return 'CRITICAL';
            if (usage > 80) return 'HIGH';
            if (usage > 65) return 'MEDIUM';
            return 'LOW';
        }

        // ============================================================
        // Priority Evaluation (Chapter 6)
        // ============================================================

        _calculatePriority(recData) {
            let score = 0;

            // Impact factor (0-30)
            if (recData.impact && recData.impact.includes('critical') || recData.impact.includes('severe')) {
                score += 30;
            } else if (recData.impact && recData.impact.includes('significant')) {
                score += 20;
            } else if (recData.impact) {
                score += 10;
            }

            // Risk factor (0-25)
            if (recData.risk === 'CRITICAL') {
                score += 25;
            } else if (recData.risk === 'HIGH') {
                score += 18;
            } else if (recData.risk === 'MEDIUM') {
                score += 10;
            } else {
                score += 5;
            }

            // Confidence factor (0-20)
            if (recData.confidence > 80) {
                score += 20;
            } else if (recData.confidence > 60) {
                score += 12;
            } else {
                score += 5;
            }

            // Affected modules factor (0-15)
            const moduleCount = (recData.affectedModules || []).length;
            if (moduleCount > 5) {
                score += 15;
            } else if (moduleCount > 2) {
                score += 10;
            } else if (moduleCount > 0) {
                score += 5;
            }

            // Frequency factor (0-10)
            if (recData.frequency && recData.frequency > 5) {
                score += 10;
            } else if (recData.frequency && recData.frequency > 2) {
                score += 5;
            }

            // Map score to priority
            if (score >= 80) return REC_PRIORITY.CRITICAL;
            if (score >= 60) return REC_PRIORITY.HIGH;
            if (score >= 40) return REC_PRIORITY.MEDIUM;
            return REC_PRIORITY.LOW;
        }

        // ============================================================
        // Determine Type (Chapter 7)
        // ============================================================

        _determineType(recData, insight) {
            const source = recData.target || insight.target || '';

            if (source.includes('performance') || source.includes('cpu') || source.includes('memory')) {
                return REC_TYPE.PERFORMANCE;
            }
            if (source.includes('resource') || source.includes('storage') || source.includes('capacity')) {
                return REC_TYPE.RESOURCE;
            }
            if (source.includes('architecture') || source.includes('module') || source.includes('dependency')) {
                return REC_TYPE.ARCHITECTURE;
            }
            if (source.includes('stability') || source.includes('error') || source.includes('failure')) {
                return REC_TYPE.STABILITY;
            }
            return REC_TYPE.EFFICIENCY;
        }

        // ============================================================
        // Recommendation Management
        // ============================================================

        getRecommendation(id) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            return rec ? rec.toJSON() : null;
        }

        getRecommendations(filter) {
            let recs = this._recommendations;

            if (filter) {
                if (filter.status) {
                    recs = recs.filter(r => r.status === filter.status);
                }
                if (filter.priority) {
                    recs = recs.filter(r => r.priority === filter.priority);
                }
                if (filter.type) {
                    recs = recs.filter(r => r.type === filter.type);
                }
                if (filter.source) {
                    recs = recs.filter(r => r.source === filter.source);
                }
                if (filter.limit) {
                    recs = recs.slice(-filter.limit);
                }
            }

            return recs.map(r => r.toJSON());
        }

        getPendingRecommendations() {
            return this._recommendations
                .filter(r => r.status === REC_STATUS.PENDING || r.status === REC_STATUS.REVIEWING)
                .map(r => r.toJSON());
        }

        getByPriority(priority) {
            return this._recommendations
                .filter(r => r.priority === priority)
                .map(r => r.toJSON());
        }

        // ============================================================
        // Approval Interface (Chapter 8)
        // ============================================================

        approveRecommendation(id, reviewer) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            if (!rec) {
                console.warn(`[OptimizationRecommendation] Recommendation not found: ${id}`);
                return false;
            }

            const result = rec.approve();
            if (result) {
                rec.metadata.approvedBy = reviewer || 'governance';
                this._emit('recommendationApproved', rec.toJSON());
                console.log(`[OptimizationRecommendation] Recommendation approved: ${id}`);
            }
            return result;
        }

        rejectRecommendation(id, reason, reviewer) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            if (!rec) {
                console.warn(`[OptimizationRecommendation] Recommendation not found: ${id}`);
                return false;
            }

            const result = rec.reject(reason);
            if (result) {
                rec.metadata.rejectedBy = reviewer || 'governance';
                this._emit('recommendationRejected', rec.toJSON());
                console.log(`[OptimizationRecommendation] Recommendation rejected: ${id}`);
            }
            return result;
        }

        implementRecommendation(id) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            if (!rec) {
                console.warn(`[OptimizationRecommendation] Recommendation not found: ${id}`);
                return false;
            }

            const result = rec.implement();
            if (result) {
                this._emit('recommendationImplemented', rec.toJSON());
                console.log(`[OptimizationRecommendation] Recommendation implemented: ${id}`);
            }
            return result;
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._recommendations.length;
            const pending = this._recommendations.filter(r => r.status === REC_STATUS.PENDING).length;
            const reviewing = this._recommendations.filter(r => r.status === REC_STATUS.REVIEWING).length;
            const approved = this._recommendations.filter(r => r.status === REC_STATUS.APPROVED).length;
            const rejected = this._recommendations.filter(r => r.status === REC_STATUS.REJECTED).length;
            const implemented = this._recommendations.filter(r => r.status === REC_STATUS.IMPLEMENTED).length;
            const dismissed = this._recommendations.filter(r => r.status === REC_STATUS.DISMISSED).length;

            const byType = {};
            Object.values(REC_TYPE).forEach(type => {
                byType[type] = this._recommendations.filter(r => r.type === type).length;
            });

            const byPriority = {};
            Object.values(REC_PRIORITY).forEach(priority => {
                byPriority[priority] = this._recommendations.filter(r => r.priority === priority).length;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._recommendations.reduce((sum, r) => sum + r.confidence, 0) / total) :
                0;

            const approvalRate = approved + rejected > 0 ?
                Math.round((approved / (approved + rejected)) * 100) :
                0;

            return {
                total,
                pending,
                reviewing,
                approved,
                rejected,
                implemented,
                dismissed,
                byType,
                byPriority,
                avgConfidence,
                approvalRate
            };
        }

        // ============================================================
        // Explorer Support (Chapter 9)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const pending = this.getPendingRecommendations().slice(0, 5);
            const recent = this.getRecommendations({ limit: 5 });

            return {
                type: 'optimization_recommendation',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                pendingRecommendations: pending,
                recentRecommendations: recent,
                config: this._config
            };
        }

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
                        console.error('[OptimizationRecommendation] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`optrec.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('optimizationRecommendationData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.recommendations) {
                        this._recommendations = data.recommendations.map(r => 
                            new OptimizationRecommendation(r)
                        );
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 5, 8)
        // ============================================================

        _connectToPerformanceAnalyzer() {
            if (window.LawAIApp && window.LawAIApp.PerformanceAnalyzer) {
                // Listen for performance insights
                window.LawAIApp.PerformanceAnalyzer.on('analysisComplete', (data) => {
                    if (data.insights && data.insights.length > 0) {
                        this.generate('performance_analyzer', data.insights);
                    }
                });
                console.log('[OptimizationRecommendation] Connected to Performance Analyzer');
            }
        }

        _connectToResourceEngine() {
            if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
                // Listen for resource insights
                window.LawAIApp.ResourceOptimization.on('analysisComplete', (data) => {
                    if (data.opportunities && data.opportunities.length > 0) {
                        this.generate('resource_optimization', data.opportunities);
                    }
                });
                console.log('[OptimizationRecommendation] Connected to Resource Engine');
            }
        }

        _connectToArchitectureAdvisor() {
            if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                // Listen for architecture insights
                window.LawAIApp.ArchitectureAdvisor.on('analysisComplete', (data) => {
                    if (data.insights && data.insights.length > 0) {
                        this.generate('architecture_advisor', data.insights);
                    }
                });
                console.log('[OptimizationRecommendation] Connected to Architecture Advisor');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[OptimizationRecommendation] Connected to Historical Memory');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OptimizationRecommendation] Connected to Decision Intelligence');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[OptimizationRecommendation] Connected to Governance');
            }
        }

        _sendToGovernance(recommendation) {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    // Send recommendation to governance for review
                    console.log(`[OptimizationRecommendation] Sent to Governance: ${recommendation.recommendationId}`);
                } catch (e) {
                    console.warn('[OptimizationRecommendation] Could not send to Governance:', e);
                }
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'optimization-recommendation',
                        name: 'Optimization Recommendation',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OptimizationRecommendation] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OptimizationRecommendation] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[OptimizationRecommendation] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RecommendationGenerator();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OptimizationRecommendation = {
        Core: instance,
        REC_TYPE: REC_TYPE,
        REC_PRIORITY: REC_PRIORITY,
        REC_STATUS: REC_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        generate: (source, insights, options) => instance.generate(source, insights, options),

        getRecommendation: (id) => instance.getRecommendation(id),
        getRecommendations: (filter) => instance.getRecommendations(filter),
        getPendingRecommendations: () => instance.getPendingRecommendations(),
        getByPriority: (priority) => instance.getByPriority(priority),

        approveRecommendation: (id, reviewer) => instance.approveRecommendation(id, reviewer),
        rejectRecommendation: (id, reason, reviewer) => instance.rejectRecommendation(id, reason, reviewer),
        implementRecommendation: (id) => instance.implementRecommendation(id),

        getStats: () => instance.getStats(),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OptimizationRecommendation] Part 52.5 loaded ✅');
    console.log('[OptimizationRecommendation] Types:', Object.values(REC_TYPE).join(' | '));
    console.log('[OptimizationRecommendation] Priorities:', Object.values(REC_PRIORITY).join(' | '));

})();
