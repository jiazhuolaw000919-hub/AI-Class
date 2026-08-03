// ============================================================
// predictiveRecommendation.js
// Part 53.5 — Predictive Recommendation Engine
// Version: v5.3.5
// Module: Predictive Runtime Layer
// File: js/core/predictiveRecommendation.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PredictiveRecommendation) {
        console.warn('[PredictiveRecommendation] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Recommendation Categories (Chapter 5)
    // ============================================================
    const REC_CATEGORY = {
        PERFORMANCE_PREVENTION: 'performance_prevention',
        ARCHITECTURE_IMPROVEMENT: 'architecture_improvement',
        DEPENDENCY_REDUCTION: 'dependency_reduction',
        RESOURCE_OPTIMIZATION: 'resource_optimization',
        GOVERNANCE_REVIEW: 'governance_review',
        MONITORING_ENHANCEMENT: 'monitoring_enhancement',
        RUNTIME_STABILITY: 'runtime_stability',
        PREDICTIVE_MAINTENANCE: 'predictive_maintenance'
    };

    // ============================================================
    // Queue Levels (Chapter 8)
    // ============================================================
    const QUEUE_LEVEL = {
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
        POSTPONED: 'POSTPONED',
        IMPLEMENTED: 'IMPLEMENTED',
        EXPIRED: 'EXPIRED'
    };

    // ============================================================
    // Recommendation Model (Chapter 6)
    // ============================================================
    class PredictiveRecommendation {
        constructor(config) {
            this.recommendationId = config.recommendationId || this._generateId();
            this.timestamp = Date.now();
            this.category = config.category || REC_CATEGORY.PERFORMANCE_PREVENTION;
            this.target = config.target || 'unknown';
            this.problem = config.problem || '';
            this.recommendation = config.recommendation || '';
            this.expectedBenefit = config.expectedBenefit || null;
            this.estimatedRisk = config.estimatedRisk || 0;
            this.priority = config.priority || QUEUE_LEVEL.MEDIUM;
            this.confidence = config.confidence || 0;
            this.predictionWindow = config.predictionWindow || 'short';
            this.status = REC_STATUS.PENDING;
            this.source = config.source || 'unknown';
            this.affectedModules = config.affectedModules || [];
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `prec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                recommendationId: this.recommendationId,
                timestamp: this.timestamp,
                category: this.category,
                target: this.target,
                problem: this.problem,
                recommendation: this.recommendation,
                expectedBenefit: this.expectedBenefit,
                estimatedRisk: this.estimatedRisk,
                priority: this.priority,
                confidence: this.confidence,
                predictionWindow: this.predictionWindow,
                status: this.status,
                source: this.source,
                affectedModules: this.affectedModules,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Expected Benefit (Chapter 9)
    // ============================================================
    class ExpectedBenefit {
        constructor(config) {
            this.benefitId = config.benefitId || this._generateId();
            this.recommendationId = config.recommendationId || null;
            this.performanceGain = config.performanceGain || 0;
            this.stabilityImprovement = config.stabilityImprovement || 0;
            this.resourceSaving = config.resourceSaving || 0;
            this.riskReduction = config.riskReduction || 0;
            this.maintenanceCostReduction = config.maintenanceCostReduction || 0;
            this.overallScore = config.overallScore || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `ben_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                benefitId: this.benefitId,
                recommendationId: this.recommendationId,
                performanceGain: this.performanceGain,
                stabilityImprovement: this.stabilityImprovement,
                resourceSaving: this.resourceSaving,
                riskReduction: this.riskReduction,
                maintenanceCostReduction: this.maintenanceCostReduction,
                overallScore: this.overallScore,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Predictive Recommendation Engine Core (Chapter 1-4)
    // ============================================================
    class PredictiveRecommendationEngine {
        constructor() {
            this._recommendations = [];
            this._queue = [];
            this._benefits = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxRecommendations: 100,
                maxQueueSize: 50,
                minConfidenceThreshold: 40,
                autoGenerate: true,
                generationInterval: 180000,
                criticalThreshold: 80,
                highThreshold: 60,
                mediumThreshold: 40
            };
            this._generators = this._initGenerators();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[PredictiveRecommendation] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[PredictiveRecommendation] Initializing...');

            // Connect to modules (Chapter 3)
            this._connectToTrendPrediction();
            this._connectToRiskForecast();
            this._connectToFailurePrediction();
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToGovernance();

            // Register with Explorer (Chapter 11)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-generation
            if (this._config.autoGenerate) {
                this._startAutoGeneration();
            }

            this._initialized = true;
            console.log('[PredictiveRecommendation] Initialized ✅');
            return this;
        }

        // ============================================================
        // Generators (Chapter 4)
        // ============================================================

        _initGenerators() {
            return {
                [REC_CATEGORY.PERFORMANCE_PREVENTION]: {
                    name: 'performance_prevention_generator',
                    generate: (options) => this._generatePerformancePrevention(options)
                },
                [REC_CATEGORY.ARCHITECTURE_IMPROVEMENT]: {
                    name: 'architecture_improvement_generator',
                    generate: (options) => this._generateArchitectureImprovement(options)
                },
                [REC_CATEGORY.DEPENDENCY_REDUCTION]: {
                    name: 'dependency_reduction_generator',
                    generate: (options) => this._generateDependencyReduction(options)
                },
                [REC_CATEGORY.RESOURCE_OPTIMIZATION]: {
                    name: 'resource_optimization_generator',
                    generate: (options) => this._generateResourceOptimization(options)
                },
                [REC_CATEGORY.GOVERNANCE_REVIEW]: {
                    name: 'governance_review_generator',
                    generate: (options) => this._generateGovernanceReview(options)
                },
                [REC_CATEGORY.MONITORING_ENHANCEMENT]: {
                    name: 'monitoring_enhancement_generator',
                    generate: (options) => this._generateMonitoringEnhancement(options)
                },
                [REC_CATEGORY.RUNTIME_STABILITY]: {
                    name: 'runtime_stability_generator',
                    generate: (options) => this._generateRuntimeStability(options)
                },
                [REC_CATEGORY.PREDICTIVE_MAINTENANCE]: {
                    name: 'predictive_maintenance_generator',
                    generate: (options) => this._generatePredictiveMaintenance(options)
                }
            };
        }

        // ============================================================
        // Core: Generate (Chapter 3-4)
        // ============================================================

        generate(categories, options) {
            console.log('[PredictiveRecommendation] Generating predictive recommendations...');

            const targetCategories = categories || Object.values(REC_CATEGORY);
            const recommendations = [];

            targetCategories.forEach(category => {
                const generator = this._generators[category];
                if (!generator) {
                    console.warn(`[PredictiveRecommendation] No generator for: ${category}`);
                    return;
                }

                try {
                    const result = generator.generate(options);
                    if (result && result.recommendations) {
                        result.recommendations.forEach(recData => {
                            // Evaluate priority (Chapter 7)
                            const priority = this._evaluatePriority(recData);

                            // Calculate expected benefit (Chapter 9)
                            const benefit = this._calculateBenefit(recData, priority);

                            const recommendation = new PredictiveRecommendation({
                                category: category,
                                target: recData.target || category,
                                problem: recData.problem || 'Potential issue detected',
                                recommendation: recData.recommendation || 'Review and take preventive action',
                                expectedBenefit: benefit ? benefit.toJSON() : null,
                                estimatedRisk: recData.estimatedRisk || 30,
                                priority: priority,
                                confidence: recData.confidence || 60,
                                predictionWindow: recData.predictionWindow || 'short',
                                source: generator.name,
                                affectedModules: recData.affectedModules || [],
                                evidence: recData.evidence || [],
                                metadata: {
                                    source: generator.name,
                                    generatedAt: Date.now()
                                }
                            });

                            // Add to queue (Chapter 8)
                            this._addToQueue(recommendation);

                            recommendations.push(recommendation);
                            this._recommendations.push(recommendation);

                            if (benefit) {
                                this._benefits.push(benefit);
                            }
                        });
                    }
                } catch (e) {
                    console.error(`[PredictiveRecommendation] Generator error (${category}):`, e);
                }
            });

            // Sort queue by priority
            this._sortQueue();

            // Enforce limits
            if (this._recommendations.length > this._config.maxRecommendations) {
                this._recommendations = this._recommendations.slice(-this._config.maxRecommendations);
            }
            if (this._queue.length > this._config.maxQueueSize) {
                this._queue = this._queue.slice(0, this._config.maxQueueSize);
            }

            this._emit('recommendationsGenerated', {
                recommendations: recommendations.map(r => r.toJSON()),
                count: recommendations.length,
                timestamp: Date.now()
            });

            return recommendations;
        }

        generateAll(options) {
            return this.generate(null, options);
        }

        // ============================================================
        // Recommendation Generators (Chapter 5)
        // ============================================================

        _generatePerformancePrevention(options) {
            const recommendations = [];
            const evidence = [];

            try {
                // Get predictions from Trend Prediction
                if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
                    const trends = window.LawAIApp.TrendPrediction.getTrends ?
                        window.LawAIApp.TrendPrediction.getTrends({ limit: 10 }) : null;

                    if (trends) {
                        trends.forEach(trend => {
                            const deltaPercent = trend.deltaPercent || 0;
                            if (deltaPercent > 15) {
                                recommendations.push({
                                    target: trend.target || 'performance',
                                    problem: `${trend.target} is degrading (${deltaPercent}% change)`,
                                    recommendation: `Optimize ${trend.target} to prevent performance collapse`,
                                    estimatedRisk: 35,
                                    confidence: trend.confidence || 60,
                                    predictionWindow: 'short',
                                    evidence: [`${trend.target} trend: ${trend.trendDirection}`]
                                });
                            }
                        });
                    }
                }

                // Get from Risk Forecast
                if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
                    const risks = window.LawAIApp.RiskForecasting.getTopRisks ?
                        window.LawAIApp.RiskForecasting.getTopRisks(5) : null;

                    if (risks) {
                        risks.forEach(risk => {
                            if (risk.category === 'performance' || risk.category === 'resource') {
                                recommendations.push({
                                    target: risk.target,
                                    problem: risk.evidence?.join(' ') || 'Performance risk detected',
                                    recommendation: `Take preventive action: ${risk.recommendation || 'Monitor and optimize'}`,
                                    estimatedRisk: risk.severity === 'CRITICAL' ? 60 : 40,
                                    confidence: risk.confidence || 50,
                                    predictionWindow: 'short',
                                    affectedModules: risk.affectedModules || [],
                                    evidence: risk.evidence || []
                                });
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generateArchitectureImprovement(options) {
            const recommendations = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const insights = window.LawAIApp.ArchitectureAdvisor.getInsights ?
                        window.LawAIApp.ArchitectureAdvisor.getInsights({ limit: 10 }) : null;

                    if (insights) {
                        insights.forEach(insight => {
                            if (insight.area === 'circular' || insight.area === 'complexity') {
                                recommendations.push({
                                    target: 'architecture',
                                    problem: insight.issue || 'Architecture issue detected',
                                    recommendation: insight.suggestion || 'Review and refactor architecture',
                                    estimatedRisk: 40,
                                    confidence: insight.confidence || 55,
                                    predictionWindow: 'long',
                                    affectedModules: insight.affectedModules || [],
                                    evidence: insight.evidence || []
                                });
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generateDependencyReduction(options) {
            const recommendations = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const insights = window.LawAIApp.ArchitectureAdvisor.getInsights ?
                        window.LawAIApp.ArchitectureAdvisor.getInsights({ limit: 10 }) : null;

                    if (insights) {
                        const depIssues = insights.filter(i => i.area === 'dependency');
                        depIssues.forEach(issue => {
                            recommendations.push({
                                target: 'dependency',
                                problem: issue.issue || 'Dependency issue detected',
                                recommendation: issue.suggestion || 'Reduce dependency complexity',
                                estimatedRisk: 30,
                                confidence: issue.confidence || 50,
                                predictionWindow: 'medium',
                                affectedModules: issue.affectedModules || [],
                                evidence: issue.evidence || []
                            });
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generateResourceOptimization(options) {
            const recommendations = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
                    const opportunities = window.LawAIApp.ResourceOptimization.getOpportunities ?
                        window.LawAIApp.ResourceOptimization.getOpportunities({ limit: 5 }) : null;

                    if (opportunities) {
                        opportunities.forEach(opp => {
                            recommendations.push({
                                target: opp.target || 'resource',
                                problem: opp.issue || 'Resource optimization opportunity',
                                recommendation: opp.suggestion || 'Optimize resource usage',
                                estimatedRisk: 25,
                                confidence: opp.confidence || 55,
                                predictionWindow: 'medium',
                                affectedModules: [],
                                evidence: opp.evidence || []
                            });
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generateGovernanceReview(options) {
            const recommendations = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Governance) {
                    const status = window.LawAIApp.Governance.getStatus ?
                        window.LawAIApp.Governance.getStatus() : null;

                    if (status && status.violations > 0) {
                        recommendations.push({
                            target: 'governance',
                            problem: `${status.violations} governance violations detected`,
                            recommendation: 'Review and resolve governance violations',
                            estimatedRisk: 45,
                            confidence: 70,
                            predictionWindow: 'short',
                            evidence: [`Violations: ${status.violations}`]
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generateMonitoringEnhancement(options) {
            const recommendations = [];
            const evidence = [];

            // Check if monitoring gaps exist
            const hasMetrics = window.LawAIApp && window.LawAIApp.Metrics;
            const hasPerformance = window.LawAIApp && window.LawAIApp.Performance;

            if (!hasMetrics || !hasPerformance) {
                recommendations.push({
                    target: 'monitoring',
                    problem: 'Monitoring coverage may be incomplete',
                    recommendation: 'Enhance monitoring with additional metrics and performance tracking',
                    estimatedRisk: 20,
                    confidence: 60,
                    predictionWindow: 'medium',
                    evidence: ['Potential monitoring gaps detected']
                });
            }

            return { recommendations, evidence };
        }

        _generateRuntimeStability(options) {
            const recommendations = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const status = window.LawAIApp.Runtime.getStatus ?
                        window.LawAIApp.Runtime.getStatus() : null;

                    if (status) {
                        if (status.errorRate > 5) {
                            recommendations.push({
                                target: 'runtime_stability',
                                problem: `Error rate at ${status.errorRate}%`,
                                recommendation: 'Investigate and fix runtime errors',
                                estimatedRisk: 50,
                                confidence: 65,
                                predictionWindow: 'short',
                                evidence: [`Error rate: ${status.errorRate}%`]
                            });
                        }

                        if (status.uptime < 95) {
                            recommendations.push({
                                target: 'runtime_uptime',
                                problem: `Uptime at ${status.uptime}%`,
                                recommendation: 'Improve runtime reliability and uptime',
                                estimatedRisk: 55,
                                confidence: 70,
                                predictionWindow: 'short',
                                evidence: [`Uptime: ${status.uptime}%`]
                            });
                        }
                    }
                }

                // Check failure predictions
                if (window.LawAIApp && window.LawAIApp.FailurePrediction) {
                    const failures = window.LawAIApp.FailurePrediction.getFailures ?
                        window.LawAIApp.FailurePrediction.getFailures({ limit: 5 }) : null;

                    if (failures) {
                        failures.forEach(f => {
                            if (f.probability > 60) {
                                recommendations.push({
                                    target: f.target || 'failure_prevention',
                                    problem: `${f.category} failure predicted (${f.probability}% probability)`,
                                    recommendation: f.preventionStrategy || 'Take preventive action',
                                    estimatedRisk: f.severity || 50,
                                    confidence: f.confidence || 55,
                                    predictionWindow: f.expectedTime || 'short',
                                    affectedModules: f.affectedModules || [],
                                    evidence: f.evidence || []
                                });
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        _generatePredictiveMaintenance(options) {
            const recommendations = [];
            const evidence = [];

            // Combine all predictions into maintenance recommendations
            try {
                if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
                    const risks = window.LawAIApp.RiskForecasting.getTopRisks ?
                        window.LawAIApp.RiskForecasting.getTopRisks(3) : null;

                    if (risks && risks.length > 0) {
                        const topRisk = risks[0];
                        recommendations.push({
                            target: 'predictive_maintenance',
                            problem: `Predictive maintenance needed for ${topRisk.target}`,
                            recommendation: `Schedule maintenance to address ${topRisk.category} risk`,
                            estimatedRisk: 35,
                            confidence: topRisk.confidence || 50,
                            predictionWindow: 'medium',
                            affectedModules: topRisk.affectedModules || [],
                            evidence: topRisk.evidence || ['Predictive maintenance recommended']
                        });
                    }
                }

                // If no risks, propose regular maintenance
                if (recommendations.length === 0) {
                    recommendations.push({
                        target: 'predictive_maintenance',
                        problem: 'Regular maintenance recommended',
                        recommendation: 'Perform routine maintenance to prevent future issues',
                        estimatedRisk: 20,
                        confidence: 70,
                        predictionWindow: 'long',
                        evidence: ['Scheduled maintenance based on best practices']
                    });
                }
            } catch (e) { /* ignore */ }

            return { recommendations, evidence };
        }

        // ============================================================
        // Priority Evaluation (Chapter 7)
        // ============================================================

        _evaluatePriority(recData) {
            let score = 0;

            // Risk severity
            if (recData.estimatedRisk > 60) score += 30;
            else if (recData.estimatedRisk > 40) score += 20;
            else if (recData.estimatedRisk > 20) score += 10;

            // Confidence
            if (recData.confidence > 70) score += 25;
            else if (recData.confidence > 50) score += 15;

            // Affected modules
            const moduleCount = recData.affectedModules?.length || 0;
            if (moduleCount > 5) score += 20;
            else if (moduleCount > 2) score += 10;

            // Evidence count
            const evidenceCount = recData.evidence?.length || 0;
            if (evidenceCount > 3) score += 10;
            else if (evidenceCount > 1) score += 5;

            // Prediction window
            if (recData.predictionWindow === 'short') score += 15;
            else if (recData.predictionWindow === 'medium') score += 10;

            // Determine level
            if (score >= this._config.criticalThreshold) return QUEUE_LEVEL.CRITICAL;
            if (score >= this._config.highThreshold) return QUEUE_LEVEL.HIGH;
            if (score >= this._config.mediumThreshold) return QUEUE_LEVEL.MEDIUM;
            return QUEUE_LEVEL.LOW;
        }

        // ============================================================
        // Expected Benefit Analysis (Chapter 9)
        // ============================================================

        _calculateBenefit(recData, priority) {
            const performanceGain = this._estimatePerformanceGain(recData);
            const stabilityImprovement = this._estimateStabilityImprovement(recData);
            const resourceSaving = this._estimateResourceSaving(recData);
            const riskReduction = this._estimateRiskReduction(recData);
            const maintenanceCostReduction = this._estimateMaintenanceCostReduction(recData);

            const overallScore = (
                performanceGain * 0.25 +
                stabilityImprovement * 0.2 +
                resourceSaving * 0.15 +
                riskReduction * 0.25 +
                maintenanceCostReduction * 0.15
            );

            return new ExpectedBenefit({
                recommendationId: recData.target,
                performanceGain: performanceGain,
                stabilityImprovement: stabilityImprovement,
                resourceSaving: resourceSaving,
                riskReduction: riskReduction,
                maintenanceCostReduction: maintenanceCostReduction,
                overallScore: Math.round(overallScore),
                metadata: {
                    priority: priority,
                    timestamp: Date.now()
                }
            });
        }

        _estimatePerformanceGain(recData) {
            const base = 30;
            const confidenceBonus = (recData.confidence || 50) / 100 * 20;
            const riskBonus = (recData.estimatedRisk || 30) / 100 * 20;
            return Math.min(Math.round(base + confidenceBonus + riskBonus), 90);
        }

        _estimateStabilityImprovement(recData) {
            const base = 25;
            const moduleBonus = Math.min((recData.affectedModules?.length || 0) * 3, 20);
            const windowBonus = recData.predictionWindow === 'short' ? 15 : 10;
            return Math.min(Math.round(base + moduleBonus + windowBonus), 85);
        }

        _estimateResourceSaving(recData) {
            const base = 20;
            const priorityBonus = {
                [QUEUE_LEVEL.CRITICAL]: 25,
                [QUEUE_LEVEL.HIGH]: 15,
                [QUEUE_LEVEL.MEDIUM]: 10,
                [QUEUE_LEVEL.LOW]: 5
            };
            return Math.min(Math.round(base + (priorityBonus[recData.priority] || 10)), 80);
        }

        _estimateRiskReduction(recData) {
            return Math.min(Math.round(recData.estimatedRisk || 30), 85);
        }

        _estimateMaintenanceCostReduction(recData) {
            const base = 20;
            const predictionBonus = recData.predictionWindow === 'long' ? 20 : 10;
            return Math.min(Math.round(base + predictionBonus), 75);
        }

        // ============================================================
        // Queue Management (Chapter 8)
        // ============================================================

        _addToQueue(recommendation) {
            const existing = this._queue.find(r => 
                r.target === recommendation.target && 
                r.category === recommendation.category &&
                r.status === REC_STATUS.PENDING
            );

            if (existing) {
                // Update existing if new has higher priority
                if (this._comparePriority(recommendation, existing) > 0) {
                    const index = this._queue.indexOf(existing);
                    this._queue[index] = recommendation;
                }
            } else {
                this._queue.push(recommendation);
            }
        }

        _sortQueue() {
            this._queue.sort((a, b) => {
                return this._comparePriority(b, a);
            });
        }

        _comparePriority(a, b) {
            const priorityOrder = {
                [QUEUE_LEVEL.CRITICAL]: 4,
                [QUEUE_LEVEL.HIGH]: 3,
                [QUEUE_LEVEL.MEDIUM]: 2,
                [QUEUE_LEVEL.LOW]: 1
            };

            const aScore = priorityOrder[a.priority] || 0;
            const bScore = priorityOrder[b.priority] || 0;

            if (aScore !== bScore) return aScore - bScore;

            // If same priority, compare confidence
            return (a.confidence || 0) - (b.confidence || 0);
        }

        getQueue(filter) {
            let queue = this._queue;

            if (filter) {
                if (filter.priority) {
                    queue = queue.filter(r => r.priority === filter.priority);
                }
                if (filter.status) {
                    queue = queue.filter(r => r.status === filter.status);
                }
                if (filter.category) {
                    queue = queue.filter(r => r.category === filter.category);
                }
            }

            return queue.map(r => r.toJSON());
        }

        getTopPriority(limit) {
            return this._queue.slice(0, limit || 5).map(r => r.toJSON());
        }

        // ============================================================
        // Auto-Generation (Chapter 3)
        // ============================================================

        _startAutoGeneration() {
            if (this._generationInterval) {
                clearInterval(this._generationInterval);
            }

            this._generationInterval = setInterval(() => {
                this.generate();
            }, this._config.generationInterval);

            console.log(`[PredictiveRecommendation] Auto-generation started (${this._config.generationInterval}ms)`);
        }

        _stopAutoGeneration() {
            if (this._generationInterval) {
                clearInterval(this._generationInterval);
                this._generationInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 13)
        // ============================================================

        list(filter) {
            let recommendations = this._recommendations;

            if (filter) {
                if (filter.category) {
                    recommendations = recommendations.filter(r => r.category === filter.category);
                }
                if (filter.status) {
                    recommendations = recommendations.filter(r => r.status === filter.status);
                }
                if (filter.priority) {
                    recommendations = recommendations.filter(r => r.priority === filter.priority);
                }
                if (filter.limit) {
                    recommendations = recommendations.slice(-filter.limit);
                }
            }

            return recommendations.map(r => r.toJSON());
        }

        getPriority(id) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            return rec ? rec.priority : null;
        }

        getBenefit(id) {
            const benefit = this._benefits.find(b => b.recommendationId === id);
            return benefit ? benefit.toJSON() : null;
        }

        getHistory(limit) {
            return this._history.slice(-(limit || 20)).reverse();
        }

        getStats() {
            const total = this._recommendations.length;
            const byCategory = {};
            const byStatus = {};
            const byPriority = {};

            this._recommendations.forEach(r => {
                byCategory[r.category] = (byCategory[r.category] || 0) + 1;
                byStatus[r.status] = (byStatus[r.status] || 0) + 1;
                byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._recommendations.reduce((sum, r) => sum + r.confidence, 0) / total) :
                0;

            const avgBenefit = this._benefits.length > 0 ?
                Math.round(this._benefits.reduce((sum, b) => sum + b.overallScore, 0) / this._benefits.length) :
                0;

            return {
                total,
                byCategory,
                byStatus,
                byPriority,
                avgConfidence,
                avgBenefit,
                queueSize: this._queue.length,
                historySize: this._history.length
            };
        }

        // ============================================================
        // Governance Integration (Chapter 10)
        // ============================================================

        submitToGovernance(recommendationId) {
            const rec = this._recommendations.find(r => r.recommendationId === recommendationId);
            if (!rec) return false;

            rec.status = REC_STATUS.REVIEWING;

            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    window.LawAIApp.Governance.submitRecommendation(rec.toJSON());
                    this._emit('submittedToGovernance', rec.toJSON());
                    return true;
                } catch (e) {
                    console.warn('[PredictiveRecommendation] Governance submission failed:', e);
                    return false;
                }
            }

            return false;
        }

        // ============================================================
        // Explorer Support (Chapter 11)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const topQueue = this.getTopPriority(5);
            const recent = this.list({ limit: 5 });

            return {
                type: 'predictive_recommendation',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                topQueue: topQueue,
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
                        console.error('[PredictiveRecommendation] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`precrec.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('predictiveRecommendationData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.recommendations) {
                        this._recommendations = data.recommendations.map(r => new PredictiveRecommendation(r));
                    }
                    if (data.queue) {
                        this._queue = data.queue.map(r => new PredictiveRecommendation(r));
                    }
                    if (data.history) {
                        this._history = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 3)
        // ============================================================

        _connectToTrendPrediction() {
            if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
                console.log('[PredictiveRecommendation] Connected to Trend Prediction');
            }
        }

        _connectToRiskForecast() {
            if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
                console.log('[PredictiveRecommendation] Connected to Risk Forecast');
            }
        }

        _connectToFailurePrediction() {
            if (window.LawAIApp && window.LawAIApp.FailurePrediction) {
                console.log('[PredictiveRecommendation] Connected to Failure Prediction');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[PredictiveRecommendation] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[PredictiveRecommendation] Connected to Optimization Layer');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[PredictiveRecommendation] Connected to Governance');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'predictive-recommendation',
                        name: 'Predictive Recommendation',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[PredictiveRecommendation] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[PredictiveRecommendation] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoGeneration();
            this._initialized = false;
            console.log('[PredictiveRecommendation] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new PredictiveRecommendationEngine();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.PredictiveRecommendation = {
        Core: instance,
        REC_CATEGORY: REC_CATEGORY,
        QUEUE_LEVEL: QUEUE_LEVEL,
        REC_STATUS: REC_STATUS,

        // Public API (Chapter 13)
        initialize: (config) => instance.initialize(config),
        generate: (categories, options) => instance.generate(categories, options),
        generateAll: (options) => instance.generateAll(options),

        list: (filter) => instance.list(filter),
        getPriority: (id) => instance.getPriority(id),
        getBenefit: (id) => instance.getBenefit(id),
        getQueue: (filter) => instance.getQueue(filter),
        getTopPriority: (limit) => instance.getTopPriority(limit),
        getHistory: (limit) => instance.getHistory(limit),
        getStats: () => instance.getStats(),

        submitToGovernance: (id) => instance.submitToGovernance(id),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[PredictiveRecommendation] Part 53.5 loaded ✅');
    console.log('[PredictiveRecommendation] Categories:', Object.values(REC_CATEGORY).join(' | '));
    console.log('[PredictiveRecommendation] Queue Levels:', Object.values(QUEUE_LEVEL).join(' | '));

})();
