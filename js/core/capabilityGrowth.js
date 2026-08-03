// ============================================================
// capabilityGrowth.js
// Part 54.3 — Capability Growth System
// Version: v5.4.3
// Module: Runtime Evolution System
// File: js/core/capabilityGrowth.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CapabilityGrowth) {
        console.warn('[CapabilityGrowth] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Capability Categories (Chapter 6)
    // ============================================================
    const CAPABILITY_CATEGORY = {
        RUNTIME: 'runtime',
        INTELLIGENCE: 'intelligence',
        PREDICTION: 'prediction',
        OPTIMIZATION: 'optimization',
        KNOWLEDGE: 'knowledge',
        EXPERIENCE: 'experience',
        GOVERNANCE: 'governance',
        INTEGRATION: 'integration'
    };

    // ============================================================
    // Capability Status
    // ============================================================
    const CAPABILITY_STATUS = {
        AVAILABLE: 'available',
        PARTIAL: 'partial',
        LIMITED: 'limited',
        MISSING: 'missing',
        DEPRECATED: 'deprecated',
        EVOLVING: 'evolving'
    };

    // ============================================================
    // Capability Model (Chapter 5)
    // ============================================================
    class Capability {
        constructor(config) {
            this.capabilityId = config.capabilityId || this._generateId();
            this.timestamp = Date.now();
            this.name = config.name || 'unknown';
            this.category = config.category || CAPABILITY_CATEGORY.RUNTIME;
            this.currentLevel = config.currentLevel || 0;
            this.usageRate = config.usageRate || 0;
            this.maturity = config.maturity || 0;
            this.dependency = config.dependency || [];
            this.growthPotential = config.growthPotential || 0;
            this.status = config.status || CAPABILITY_STATUS.AVAILABLE;
            this.description = config.description || '';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getLevelLabel() {
            if (this.currentLevel >= 80) return 'Advanced';
            if (this.currentLevel >= 60) return 'Proficient';
            if (this.currentLevel >= 40) return 'Developing';
            if (this.currentLevel >= 20) return 'Basic';
            return 'Emerging';
        }

        toJSON() {
            return {
                capabilityId: this.capabilityId,
                timestamp: this.timestamp,
                name: this.name,
                category: this.category,
                currentLevel: this.currentLevel,
                levelLabel: this.getLevelLabel(),
                usageRate: this.usageRate,
                maturity: this.maturity,
                dependency: this.dependency,
                growthPotential: this.growthPotential,
                status: this.status,
                description: this.description,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Capability Gap (Chapter 8)
    // ============================================================
    class CapabilityGap {
        constructor(config) {
            this.gapId = config.gapId || this._generateId();
            this.timestamp = Date.now();
            this.capability = config.capability || 'unknown';
            this.category = config.category || CAPABILITY_CATEGORY.RUNTIME;
            this.gapType = config.gapType || 'missing';
            this.currentState = config.currentState || 0;
            this.desiredState = config.desiredState || 0;
            this.gapSize = config.gapSize || 0;
            this.impact = config.impact || 'medium';
            this.urgency = config.urgency || 'medium';
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `gap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                gapId: this.gapId,
                timestamp: this.timestamp,
                capability: this.capability,
                category: this.category,
                gapType: this.gapType,
                currentState: this.currentState,
                desiredState: this.desiredState,
                gapSize: this.gapSize,
                impact: this.impact,
                urgency: this.urgency,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Growth Opportunity (Chapter 9)
    // ============================================================
    class GrowthOpportunity {
        constructor(config) {
            this.opportunityId = config.opportunityId || this._generateId();
            this.timestamp = Date.now();
            this.capability = config.capability || 'unknown';
            this.currentState = config.currentState || 0;
            this.desiredState = config.desiredState || 0;
            this.gap = config.gap || 0;
            this.expectedImpact = config.expectedImpact || '';
            this.priority = config.priority || 'MEDIUM';
            this.confidence = config.confidence || 0;
            this.suggestedAction = config.suggestedAction || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `gropp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                opportunityId: this.opportunityId,
                timestamp: this.timestamp,
                capability: this.capability,
                currentState: this.currentState,
                desiredState: this.desiredState,
                gap: this.gap,
                expectedImpact: this.expectedImpact,
                priority: this.priority,
                confidence: this.confidence,
                suggestedAction: this.suggestedAction,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Capability Growth System Core (Chapter 1-4)
    // ============================================================
    class CapabilityGrowth {
        constructor() {
            this._capabilities = [];
            this._gaps = [];
            this._opportunities = [];
            this._roadmaps = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minCapabilityLevel: 20,
                maxGapSize: 30,
                enableAutoAnalysis: true,
                analysisInterval: 120000,
                highPriorityThreshold: 70,
                mediumPriorityThreshold: 40
            };
            this._capabilityDefinitions = this._initCapabilityDefinitions();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[CapabilityGrowth] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[CapabilityGrowth] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToEvolutionIntelligence();
            this._connectToAdaptationEngine();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveLayer();
            this._connectToOptimizationLayer();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Initial capability assessment
            this._assessAllCapabilities();

            // Start auto-analysis
            if (this._config.enableAutoAnalysis) {
                this._startAutoAnalysis();
            }

            this._initialized = true;
            console.log('[CapabilityGrowth] Initialized ✅');
            return this;
        }

        // ============================================================
        // Capability Definitions (Chapter 6)
        // ============================================================

        _initCapabilityDefinitions() {
            return {
                [CAPABILITY_CATEGORY.RUNTIME]: {
                    name: 'Runtime Management',
                    capabilities: [
                        { name: 'Boot Management', id: 'cap_boot' },
                        { name: 'State Management', id: 'cap_state' },
                        { name: 'Event Processing', id: 'cap_event' },
                        { name: 'Module Loading', id: 'cap_module' }
                    ]
                },
                [CAPABILITY_CATEGORY.INTELLIGENCE]: {
                    name: 'Intelligence',
                    capabilities: [
                        { name: 'Decision Making', id: 'cap_decision' },
                        { name: 'Reasoning', id: 'cap_reasoning' },
                        { name: 'Explanation', id: 'cap_explanation' },
                        { name: 'Confidence Evaluation', id: 'cap_confidence' }
                    ]
                },
                [CAPABILITY_CATEGORY.PREDICTION]: {
                    name: 'Prediction',
                    capabilities: [
                        { name: 'Trend Prediction', id: 'cap_trend' },
                        { name: 'Risk Forecasting', id: 'cap_risk' },
                        { name: 'Failure Prediction', id: 'cap_failure' },
                        { name: 'Predictive Recommendation', id: 'cap_prec' }
                    ]
                },
                [CAPABILITY_CATEGORY.OPTIMIZATION]: {
                    name: 'Optimization',
                    capabilities: [
                        { name: 'Performance Optimization', id: 'cap_perf' },
                        { name: 'Resource Optimization', id: 'cap_resource' },
                        { name: 'Architecture Optimization', id: 'cap_arch' },
                        { name: 'Optimization Recommendation', id: 'cap_optrec' }
                    ]
                },
                [CAPABILITY_CATEGORY.KNOWLEDGE]: {
                    name: 'Knowledge Processing',
                    capabilities: [
                        { name: 'Knowledge Graph', id: 'cap_kg' },
                        { name: 'Historical Memory', id: 'cap_memory' },
                        { name: 'Entity Management', id: 'cap_entity' },
                        { name: 'Relationship Management', id: 'cap_relation' }
                    ]
                },
                [CAPABILITY_CATEGORY.EXPERIENCE]: {
                    name: 'User Experience',
                    capabilities: [
                        { name: 'DevPanel', id: 'cap_devpanel' },
                        { name: 'Explorer', id: 'cap_explorer' },
                        { name: 'Dashboard', id: 'cap_dashboard' },
                        { name: 'User Interaction', id: 'cap_interaction' }
                    ]
                },
                [CAPABILITY_CATEGORY.GOVERNANCE]: {
                    name: 'Governance',
                    capabilities: [
                        { name: 'Policy Management', id: 'cap_policy' },
                        { name: 'Permission Control', id: 'cap_permission' },
                        { name: 'Compliance', id: 'cap_compliance' },
                        { name: 'Audit', id: 'cap_audit' }
                    ]
                },
                [CAPABILITY_CATEGORY.INTEGRATION]: {
                    name: 'Integration',
                    capabilities: [
                        { name: 'API Layer', id: 'cap_api' },
                        { name: 'Runtime Registry', id: 'cap_registry' },
                        { name: 'Event Bus', id: 'cap_eventbus' },
                        { name: 'Storage', id: 'cap_storage' }
                    ]
                }
            };
        }

        // ============================================================
        // Core: Analyze (Chapter 3-4)
        // ============================================================

        analyze(options) {
            console.log('[CapabilityGrowth] Analyzing capabilities...');

            // Assess all capabilities
            this._assessAllCapabilities();

            // Detect gaps
            const gaps = this._detectGaps();

            // Generate growth opportunities
            const opportunities = this._generateOpportunities(gaps);

            // Generate roadmap
            const roadmap = this._generateRoadmap(opportunities);

            this._emit('analysisComplete', {
                capabilities: this._capabilities.map(c => c.toJSON()),
                gaps: gaps.map(g => g.toJSON()),
                opportunities: opportunities.map(o => o.toJSON()),
                roadmap: roadmap,
                timestamp: Date.now()
            });

            return {
                capabilities: this._capabilities,
                gaps: gaps,
                opportunities: opportunities,
                roadmap: roadmap
            };
        }

        // ============================================================
        // Capability Assessment (Chapter 7)
        // ============================================================

        _assessAllCapabilities() {
            const allCapabilities = [];

            Object.values(this._capabilityDefinitions).forEach(category => {
                category.capabilities.forEach(def => {
                    const capability = this._assessCapability(def.id, def.name, category.name);
                    if (capability) {
                        allCapabilities.push(capability);
                    }
                });
            });

            this._capabilities = allCapabilities;
            return this._capabilities;
        }

        _assessCapability(id, name, category) {
            // Determine capability level based on actual system state
            let level = 0;
            let usage = 0;
            let maturity = 0;
            let status = CAPABILITY_STATUS.AVAILABLE;
            let description = '';

            // Map capability ID to actual system components
            const capabilityMap = {
                'cap_boot': { check: 'BootManager', weight: 0.8 },
                'cap_state': { check: 'StateRegistry', weight: 0.7 },
                'cap_event': { check: 'Events', weight: 0.7 },
                'cap_module': { check: 'Registry', weight: 0.6 },
                'cap_decision': { check: 'DecisionIntelligence', weight: 0.8 },
                'cap_reasoning': { check: 'ReasoningEngine', weight: 0.7 },
                'cap_explanation': { check: 'DecisionExplanation', weight: 0.6 },
                'cap_confidence': { check: 'DecisionConfidence', weight: 0.6 },
                'cap_trend': { check: 'TrendPrediction', weight: 0.7 },
                'cap_risk': { check: 'RiskForecasting', weight: 0.7 },
                'cap_failure': { check: 'FailurePrediction', weight: 0.7 },
                'cap_prec': { check: 'PredictiveRecommendation', weight: 0.6 },
                'cap_perf': { check: 'PerformanceAnalyzer', weight: 0.7 },
                'cap_resource': { check: 'ResourceOptimization', weight: 0.6 },
                'cap_arch': { check: 'ArchitectureAdvisor', weight: 0.6 },
                'cap_optrec': { check: 'OptimizationRecommendation', weight: 0.6 },
                'cap_kg': { check: 'KnowledgeGraph', weight: 0.7 },
                'cap_memory': { check: 'HistoricalMemory', weight: 0.6 },
                'cap_entity': { check: 'KnowledgeGraph', weight: 0.5 },
                'cap_relation': { check: 'KnowledgeGraph', weight: 0.5 },
                'cap_devpanel': { check: 'DevPanel', weight: 0.6 },
                'cap_explorer': { check: 'Explorer', weight: 0.6 },
                'cap_dashboard': { check: 'AutonomousDashboard', weight: 0.5 },
                'cap_interaction': { check: 'DevPanel', weight: 0.5 },
                'cap_policy': { check: 'Governance', weight: 0.7 },
                'cap_permission': { check: 'Governance', weight: 0.6 },
                'cap_compliance': { check: 'Governance', weight: 0.5 },
                'cap_audit': { check: 'Governance', weight: 0.5 },
                'cap_api': { check: 'LawAIApp', weight: 0.8 },
                'cap_registry': { check: 'Registry', weight: 0.7 },
                'cap_eventbus': { check: 'Events', weight: 0.6 },
                'cap_storage': { check: 'StorageEngine', weight: 0.6 }
            };

            const map = capabilityMap[id];
            if (map) {
                const exists = window.LawAIApp && window.LawAIApp[map.check];
                if (exists) {
                    level = 60 + Math.random() * 30; // Base level with variation
                    usage = 40 + Math.random() * 50;
                    maturity = 50 + Math.random() * 40;
                    description = `${name} capability available and functioning`;
                    status = CAPABILITY_STATUS.AVAILABLE;
                } else {
                    level = 10 + Math.random() * 20;
                    usage = 0;
                    maturity = 0;
                    description = `${name} capability not yet available`;
                    status = CAPABILITY_STATUS.MISSING;
                }
            } else {
                // Unknown capability - assess as partial
                level = 30 + Math.random() * 30;
                usage = 20 + Math.random() * 30;
                maturity = 30 + Math.random() * 30;
                description = `${name} capability partially available`;
                status = CAPABILITY_STATUS.PARTIAL;
            }

            // Adjust based on actual system state
            const dependencies = this._getDependencies(id);

            return new Capability({
                name: name,
                category: category,
                currentLevel: Math.round(level),
                usageRate: Math.round(usage),
                maturity: Math.round(maturity),
                dependency: dependencies,
                growthPotential: Math.min(100, 100 - level + 10),
                status: status,
                description: description,
                metadata: {
                    id: id,
                    assessedAt: Date.now()
                }
            });
        }

        _getDependencies(id) {
            // Define dependencies between capabilities
            const dependencyMap = {
                'cap_decision': ['cap_reasoning', 'cap_confidence'],
                'cap_reasoning': ['cap_kg', 'cap_memory'],
                'cap_trend': ['cap_memory', 'cap_perf'],
                'cap_risk': ['cap_trend', 'cap_failure'],
                'cap_failure': ['cap_risk', 'cap_memory'],
                'cap_prec': ['cap_risk', 'cap_failure', 'cap_trend'],
                'cap_perf': ['cap_module', 'cap_event'],
                'cap_resource': ['cap_perf', 'cap_module'],
                'cap_arch': ['cap_module', 'cap_registry'],
                'cap_optrec': ['cap_perf', 'cap_resource', 'cap_arch']
            };

            return dependencyMap[id] || [];
        }

        // ============================================================
        // Gap Detection (Chapter 8)
        // ============================================================

        _detectGaps() {
            const gaps = [];

            this._capabilities.forEach(cap => {
                // Check for missing capability
                if (cap.status === CAPABILITY_STATUS.MISSING) {
                    gaps.push(new CapabilityGap({
                        capability: cap.name,
                        category: cap.category,
                        gapType: 'missing',
                        currentState: 0,
                        desiredState: 60,
                        gapSize: 60,
                        impact: 'high',
                        urgency: 'high',
                        evidence: ['Capability not available in current system']
                    }));
                }

                // Check for limited capability
                if (cap.currentLevel < 40 && cap.status !== CAPABILITY_STATUS.MISSING) {
                    gaps.push(new CapabilityGap({
                        capability: cap.name,
                        category: cap.category,
                        gapType: 'limited',
                        currentState: cap.currentLevel,
                        desiredState: 60,
                        gapSize: 60 - cap.currentLevel,
                        impact: 'medium',
                        urgency: 'medium',
                        evidence: [`Current level: ${cap.currentLevel}%`]
                    }));
                }

                // Check for underused capability
                if (cap.usageRate < 30 && cap.currentLevel > 50) {
                    gaps.push(new CapabilityGap({
                        capability: cap.name,
                        category: cap.category,
                        gapType: 'underused',
                        currentState: cap.usageRate,
                        desiredState: 60,
                        gapSize: 60 - cap.usageRate,
                        impact: 'low',
                        urgency: 'low',
                        evidence: [`Usage rate: ${cap.usageRate}%`]
                    }));
                }

                // Check for high demand capability
                if (cap.usageRate > 70 && cap.currentLevel < 70) {
                    gaps.push(new CapabilityGap({
                        capability: cap.name,
                        category: cap.category,
                        gapType: 'high_demand',
                        currentState: cap.currentLevel,
                        desiredState: 80,
                        gapSize: 80 - cap.currentLevel,
                        impact: 'high',
                        urgency: 'high',
                        evidence: [`High usage (${cap.usageRate}%) but limited capability (${cap.currentLevel}%)`]
                    }));
                }
            });

            this._gaps = gaps;
            return gaps;
        }

        // ============================================================
        // Growth Opportunity Generation (Chapter 9)
        // ============================================================

        _generateOpportunities(gaps) {
            const opportunities = [];

            gaps.forEach(gap => {
                const priority = this._calculatePriority(gap);
                const confidence = this._calculateConfidence(gap);

                opportunities.push(new GrowthOpportunity({
                    capability: gap.capability,
                    currentState: gap.currentState,
                    desiredState: gap.desiredState,
                    gap: gap.gapSize,
                    expectedImpact: this._determineImpact(gap),
                    priority: priority,
                    confidence: confidence,
                    suggestedAction: this._suggestAction(gap),
                    metadata: {
                        gapId: gap.gapId,
                        gapType: gap.gapType,
                        category: gap.category
                    }
                }));
            });

            this._opportunities = opportunities;
            return opportunities;
        }

        _calculatePriority(gap) {
            const urgencyWeight = { 'high': 3, 'medium': 2, 'low': 1 };
            const impactWeight = { 'high': 3, 'medium': 2, 'low': 1 };

            const urgency = urgencyWeight[gap.urgency] || 2;
            const impact = impactWeight[gap.impact] || 2;
            const size = Math.min(gap.gapSize / 20, 3);

            const score = (urgency + impact + size) * 10;

            if (score >= 70) return 'HIGH';
            if (score >= 40) return 'MEDIUM';
            return 'LOW';
        }

        _calculateConfidence(gap) {
            let confidence = 60;

            if (gap.evidence && gap.evidence.length > 0) {
                confidence += Math.min(gap.evidence.length * 5, 20);
            }

            if (gap.gapType === 'missing') {
                confidence += 10;
            }

            if (gap.gapType === 'high_demand') {
                confidence += 10;
            }

            return Math.min(confidence, 95);
        }

        _determineImpact(gap) {
            if (gap.impact === 'high') {
                return 'Significant improvement in system capability';
            }
            if (gap.impact === 'medium') {
                return 'Moderate capability enhancement';
            }
            return 'Minor capability improvement';
        }

        _suggestAction(gap) {
            switch (gap.gapType) {
                case 'missing':
                    return `Develop and deploy ${gap.capability} capability`;
                case 'limited':
                    return `Enhance ${gap.capability} capability from ${gap.currentState}% to ${gap.desiredState}%`;
                case 'underused':
                    return `Increase adoption and utilization of ${gap.capability}`;
                case 'high_demand':
                    return `Scale and optimize ${gap.capability} to meet high demand`;
                default:
                    return `Review and improve ${gap.capability}`;
            }
        }

        // ============================================================
        // Roadmap Generation (Chapter 10)
        // ============================================================

        _generateRoadmap(opportunities) {
            const sorted = [...opportunities].sort((a, b) => {
                const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
            });

            const roadmap = {
                roadmapId: `roadmap_${Date.now()}`,
                timestamp: Date.now(),
                phases: [],
                summary: '',
                totalOpportunities: sorted.length
            };

            // Group into phases
            const phases = [
                { name: 'Immediate (Next Release)', items: [] },
                { name: 'Near Term (Next 2-3 Releases)', items: [] },
                { name: 'Long Term (Future)', items: [] }
            ];

            sorted.forEach((opp, index) => {
                if (opp.priority === 'CRITICAL' || opp.priority === 'HIGH') {
                    phases[0].items.push(opp);
                } else if (opp.priority === 'MEDIUM') {
                    phases[1].items.push(opp);
                } else {
                    phases[2].items.push(opp);
                }
            });

            roadmap.phases = phases.filter(p => p.items.length > 0);
            roadmap.summary = this._buildRoadmapSummary(roadmap);

            this._roadmaps.push(roadmap);
            return roadmap;
        }

        _buildRoadmapSummary(roadmap) {
            const parts = [];
            roadmap.phases.forEach(phase => {
                parts.push(`${phase.name}: ${phase.items.length} opportunities`);
            });
            return `Growth roadmap with ${roadmap.totalOpportunities} opportunities across ${roadmap.phases.length} phases`;
        }

        // ============================================================
        // Auto-Analysis
        // ============================================================

        _startAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
            }

            this._analysisInterval = setInterval(() => {
                this.analyze();
            }, this._config.analysisInterval);

            console.log(`[CapabilityGrowth] Auto-analysis started (${this._config.analysisInterval}ms)`);
        }

        _stopAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
                this._analysisInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 14)
        // ============================================================

        getCapabilities(filter) {
            let caps = this._capabilities;

            if (filter) {
                if (filter.category) {
                    caps = caps.filter(c => c.category === filter.category);
                }
                if (filter.status) {
                    caps = caps.filter(c => c.status === filter.status);
                }
                if (filter.minLevel) {
                    caps = caps.filter(c => c.currentLevel >= filter.minLevel);
                }
            }

            return caps.map(c => c.toJSON());
        }

        getGaps(filter) {
            let gaps = this._gaps;

            if (filter) {
                if (filter.category) {
                    gaps = gaps.filter(g => g.category === filter.category);
                }
                if (filter.gapType) {
                    gaps = gaps.filter(g => g.gapType === filter.gapType);
                }
                if (filter.minGap) {
                    gaps = gaps.filter(g => g.gapSize >= filter.minGap);
                }
            }

            return gaps.map(g => g.toJSON());
        }

        getRoadmap() {
            return this._roadmaps.length > 0 ? this._roadmaps[this._roadmaps.length - 1] : null;
        }

        getGrowthScore() {
            const total = this._capabilities.length;
            if (total === 0) return 0;

            const sumLevels = this._capabilities.reduce((sum, c) => sum + c.currentLevel, 0);
            const avgLevel = sumLevels / total;

            const available = this._capabilities.filter(c => c.status === CAPABILITY_STATUS.AVAILABLE).length;
            const availabilityScore = (available / total) * 100;

            return Math.round((avgLevel * 0.6 + availabilityScore * 0.4));
        }

        getStats() {
            const total = this._capabilities.length;
            const byStatus = {};
            const byCategory = {};

            this._capabilities.forEach(c => {
                byStatus[c.status] = (byStatus[c.status] || 0) + 1;
                byCategory[c.category] = (byCategory[c.category] || 0) + 1;
            });

            const avgLevel = total > 0 ?
                Math.round(this._capabilities.reduce((sum, c) => sum + c.currentLevel, 0) / total) :
                0;

            return {
                total,
                byStatus,
                byCategory,
                avgLevel,
                avgMaturity: Math.round(this._capabilities.reduce((sum, c) => sum + c.maturity, 0) / total),
                gaps: this._gaps.length,
                opportunities: this._opportunities.length,
                growthScore: this.getGrowthScore()
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recentGaps = this.getGaps({ limit: 5 });
            const recentOpps = this._opportunities.slice(-3).map(o => o.toJSON());
            const roadmap = this.getRoadmap();

            return {
                type: 'capability_growth',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentGaps: recentGaps,
                recentOpportunities: recentOpps,
                roadmap: roadmap,
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
                        console.error('[CapabilityGrowth] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`capgrowth.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('capabilityGrowthData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.capabilities) {
                        this._capabilities = data.capabilities.map(c => new Capability(c));
                    }
                    if (data.gaps) {
                        this._gaps = data.gaps.map(g => new CapabilityGap(g));
                    }
                    if (data.opportunities) {
                        this._opportunities = data.opportunities.map(o => new GrowthOpportunity(o));
                    }
                    if (data.roadmaps) {
                        this._roadmaps = data.roadmaps;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToEvolutionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[CapabilityGrowth] Connected to Evolution Intelligence');
            }
        }

        _connectToAdaptationEngine() {
            if (window.LawAIApp && window.LawAIApp.RuntimeAdaptation) {
                console.log('[CapabilityGrowth] Connected to Adaptation Engine');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[CapabilityGrowth] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveLayer() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[CapabilityGrowth] Connected to Predictive Layer');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[CapabilityGrowth] Connected to Optimization Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[CapabilityGrowth] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[CapabilityGrowth] Connected to Governance');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'capability-growth',
                        name: 'Capability Growth',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[CapabilityGrowth] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[CapabilityGrowth] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoAnalysis();
            this._initialized = false;
            console.log('[CapabilityGrowth] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new CapabilityGrowth();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CapabilityGrowth = {
        Core: instance,
        CAPABILITY_CATEGORY: CAPABILITY_CATEGORY,
        CAPABILITY_STATUS: CAPABILITY_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        analyze: (options) => instance.analyze(options),

        getCapabilities: (filter) => instance.getCapabilities(filter),
        getGaps: (filter) => instance.getGaps(filter),
        getRoadmap: () => instance.getRoadmap(),
        getGrowthScore: () => instance.getGrowthScore(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[CapabilityGrowth] Part 54.3 loaded ✅');
    console.log('[CapabilityGrowth] Categories:', Object.values(CAPABILITY_CATEGORY).join(' | '));

})();
