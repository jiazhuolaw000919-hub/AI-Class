// ============================================================
// moduleEvolution.js
// Part 54.4 — Module Evolution Advisor
// Version: v5.4.4
// Module: Runtime Evolution System
// File: js/core/moduleEvolution.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ModuleEvolution) {
        console.warn('[ModuleEvolution] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Evolution Recommendation Types (Chapter 8)
    // ============================================================
    const RECOMMENDATION_TYPE = {
        UPGRADE: 'upgrade',
        SPLIT: 'split',
        MERGE: 'merge',
        OPTIMIZE: 'optimize',
        DEPRECATE: 'deprecate',
        REPLACE: 'replace'
    };

    // ============================================================
    // Module Health Status
    // ============================================================
    const MODULE_HEALTH = {
        EXCELLENT: 'excellent',
        GOOD: 'good',
        FAIR: 'fair',
        POOR: 'poor',
        CRITICAL: 'critical'
    };

    // ============================================================
    // Module Evolution Model (Chapter 5)
    // ============================================================
    class ModuleEvolution {
        constructor(config) {
            this.moduleId = config.moduleId || this._generateId();
            this.timestamp = Date.now();
            this.moduleName = config.moduleName || 'unknown';
            this.currentState = config.currentState || null;
            this.health = config.health || MODULE_HEALTH.GOOD;
            this.complexity = config.complexity || 0;
            this.usage = config.usage || 0;
            this.dependency = config.dependency || [];
            this.evolutionNeed = config.evolutionNeed || 0;
            this.recommendation = config.recommendation || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `mev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getHealthScore() {
            const healthMap = {
                [MODULE_HEALTH.EXCELLENT]: 90,
                [MODULE_HEALTH.GOOD]: 75,
                [MODULE_HEALTH.FAIR]: 55,
                [MODULE_HEALTH.POOR]: 35,
                [MODULE_HEALTH.CRITICAL]: 15
            };
            return healthMap[this.health] || 50;
        }

        toJSON() {
            return {
                moduleId: this.moduleId,
                timestamp: this.timestamp,
                moduleName: this.moduleName,
                currentState: this.currentState,
                health: this.health,
                healthScore: this.getHealthScore(),
                complexity: this.complexity,
                usage: this.usage,
                dependency: this.dependency,
                evolutionNeed: this.evolutionNeed,
                recommendation: this.recommendation,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Proposal (Chapter 11)
    // ============================================================
    class EvolutionProposal {
        constructor(config) {
            this.proposalId = config.proposalId || this._generateId();
            this.timestamp = Date.now();
            this.targetModule = config.targetModule || 'unknown';
            this.currentProblem = config.currentProblem || '';
            this.suggestedEvolution = config.suggestedEvolution || '';
            this.expectedBenefit = config.expectedBenefit || '';
            this.risk = config.risk || 'MEDIUM';
            this.confidence = config.confidence || 0;
            this.status = config.status || 'PENDING';
            this.affectedModules = config.affectedModules || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `meprop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                proposalId: this.proposalId,
                timestamp: this.timestamp,
                targetModule: this.targetModule,
                currentProblem: this.currentProblem,
                suggestedEvolution: this.suggestedEvolution,
                expectedBenefit: this.expectedBenefit,
                risk: this.risk,
                confidence: this.confidence,
                status: this.status,
                affectedModules: this.affectedModules,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Module Evolution Advisor Core (Chapter 1-4)
    // ============================================================
    class ModuleEvolutionAdvisor {
        constructor() {
            this._modules = [];
            this._proposals = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minUsageThreshold: 10,
                maxComplexityThreshold: 70,
                healthThreshold: 50,
                enableAutoAnalysis: true,
                analysisInterval: 120000,
                criticalThreshold: 80,
                highThreshold: 60,
                mediumThreshold: 40
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ModuleEvolution] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ModuleEvolution] Initializing...');

            // Connect to modules (Chapter 12)
            this._connectToArchitectureAdvisor();
            this._connectToCapabilityGrowth();
            this._connectToKnowledgeGraph();
            this._connectToRuntimeRegistry();
            this._connectToGovernance();
            this._connectToPredictiveRuntime();

            // Register with Explorer (Chapter 13)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Initial analysis
            this._analyzeAllModules();

            // Start auto-analysis
            if (this._config.enableAutoAnalysis) {
                this._startAutoAnalysis();
            }

            this._initialized = true;
            console.log('[ModuleEvolution] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Analyze (Chapter 3-4)
        // ============================================================

        analyze(moduleNames, options) {
            console.log('[ModuleEvolution] Analyzing modules...');

            const targetModules = moduleNames || this._getAllModuleNames();
            const results = [];

            targetModules.forEach(name => {
                const result = this._analyzeModule(name, options);
                if (result) {
                    results.push(result);
                }
            });

            // Generate proposals
            const proposals = this._generateProposals(results);

            this._emit('analysisComplete', {
                modules: results.map(m => m.toJSON()),
                proposals: proposals.map(p => p.toJSON()),
                count: results.length,
                timestamp: Date.now()
            });

            return {
                modules: results,
                proposals: proposals
            };
        }

        analyzeAll(options) {
            return this.analyze(null, options);
        }

        // ============================================================
        // Module Analysis (Chapter 6-7)
        // ============================================================

        _analyzeAllModules() {
            const moduleNames = this._getAllModuleNames();
            const modules = [];

            moduleNames.forEach(name => {
                const result = this._analyzeModule(name);
                if (result) {
                    modules.push(result);
                }
            });

            this._modules = modules;
            return modules;
        }

        _analyzeModule(moduleName, options) {
            const moduleData = this._getModuleData(moduleName);

            if (!moduleData) return null;

            // Assess health (Chapter 6)
            const health = this._assessHealth(moduleData);

            // Assess complexity
            const complexity = this._assessComplexity(moduleData);

            // Assess usage
            const usage = this._assessUsage(moduleData);

            // Assess dependencies
            const dependency = this._assessDependencies(moduleData);

            // Calculate evolution need (Chapter 9)
            const evolutionNeed = this._calculateEvolutionNeed(moduleData, health, complexity, usage);

            // Determine recommendation (Chapter 8)
            const recommendation = this._determineRecommendation(moduleData, health, complexity, usage, evolutionNeed);

            const moduleEvolution = new ModuleEvolution({
                moduleName: moduleName,
                currentState: moduleData,
                health: health.level,
                complexity: complexity.score,
                usage: usage.score,
                dependency: dependency.list,
                evolutionNeed: evolutionNeed,
                recommendation: recommendation,
                metadata: {
                    analyzedAt: Date.now(),
                    healthScore: health.score,
                    complexityScore: complexity.score,
                    usageScore: usage.score
                }
            });

            return moduleEvolution;
        }

        // ============================================================
        // Health Assessment (Chapter 6)
        // ============================================================

        _assessHealth(moduleData) {
            let score = 70;
            let factors = [];

            // Performance factor
            if (moduleData.performance) {
                if (moduleData.performance < 50) {
                    score -= 20;
                    factors.push('poor_performance');
                } else if (moduleData.performance < 70) {
                    score -= 10;
                    factors.push('moderate_performance');
                }
            }

            // Error rate factor
            if (moduleData.errorRate) {
                if (moduleData.errorRate > 10) {
                    score -= 20;
                    factors.push('high_error_rate');
                } else if (moduleData.errorRate > 5) {
                    score -= 10;
                    factors.push('moderate_error_rate');
                }
            }

            // Maintenance factor
            if (moduleData.maintenanceCost) {
                if (moduleData.maintenanceCost > 70) {
                    score -= 15;
                    factors.push('high_maintenance');
                } else if (moduleData.maintenanceCost > 50) {
                    score -= 8;
                    factors.push('moderate_maintenance');
                }
            }

            // Determine level
            let level;
            if (score >= 80) level = MODULE_HEALTH.EXCELLENT;
            else if (score >= 65) level = MODULE_HEALTH.GOOD;
            else if (score >= 50) level = MODULE_HEALTH.FAIR;
            else if (score >= 35) level = MODULE_HEALTH.POOR;
            else level = MODULE_HEALTH.CRITICAL;

            return {
                score: Math.max(0, Math.min(100, score)),
                level: level,
                factors: factors
            };
        }

        // ============================================================
        // Complexity Assessment (Chapter 6)
        // ============================================================

        _assessComplexity(moduleData) {
            let score = 30;
            let factors = [];

            // Dependency count
            if (moduleData.dependencyCount) {
                if (moduleData.dependencyCount > 10) {
                    score += 30;
                    factors.push('many_dependencies');
                } else if (moduleData.dependencyCount > 5) {
                    score += 15;
                    factors.push('moderate_dependencies');
                }
            }

            // Lines of code
            if (moduleData.linesOfCode) {
                if (moduleData.linesOfCode > 1000) {
                    score += 20;
                    factors.push('large_module');
                } else if (moduleData.linesOfCode > 500) {
                    score += 10;
                    factors.push('medium_module');
                }
            }

            // Cyclomatic complexity
            if (moduleData.cyclomaticComplexity) {
                if (moduleData.cyclomaticComplexity > 15) {
                    score += 20;
                    factors.push('high_cyclomatic');
                } else if (moduleData.cyclomaticComplexity > 8) {
                    score += 10;
                    factors.push('moderate_cyclomatic');
                }
            }

            return {
                score: Math.min(100, score),
                factors: factors
            };
        }

        // ============================================================
        // Usage Assessment (Chapter 6)
        // ============================================================

        _assessUsage(moduleData) {
            let score = 50;
            let factors = [];

            // Usage frequency
            if (moduleData.usageFrequency) {
                if (moduleData.usageFrequency > 100) {
                    score += 30;
                    factors.push('high_usage');
                } else if (moduleData.usageFrequency > 50) {
                    score += 15;
                    factors.push('moderate_usage');
                } else if (moduleData.usageFrequency < 10) {
                    score -= 20;
                    factors.push('low_usage');
                }
            }

            // Import count
            if (moduleData.importCount) {
                if (moduleData.importCount > 20) {
                    score += 20;
                    factors.push('widely_imported');
                } else if (moduleData.importCount > 10) {
                    score += 10;
                    factors.push('moderately_imported');
                } else if (moduleData.importCount < 2) {
                    score -= 15;
                    factors.push('rarely_imported');
                }
            }

            return {
                score: Math.max(0, Math.min(100, score)),
                factors: factors
            };
        }

        // ============================================================
        // Dependency Assessment (Chapter 10)
        // ============================================================

        _assessDependencies(moduleData) {
            let list = [];

            if (moduleData.dependencies) {
                list = moduleData.dependencies.map(dep => ({
                    name: dep,
                    type: 'direct'
                }));
            }

            // Add dependents (reverse dependencies)
            if (moduleData.dependents) {
                moduleData.dependents.forEach(dep => {
                    if (!list.find(d => d.name === dep)) {
                        list.push({
                            name: dep,
                            type: 'dependent'
                        });
                    }
                });
            }

            return {
                list: list,
                count: list.length
            };
        }

        // ============================================================
        // Evolution Need Calculation (Chapter 9)
        // ============================================================

        _calculateEvolutionNeed(moduleData, health, complexity, usage) {
            let need = 0;

            // Health factor (0-30)
            const healthScore = 100 - health.score;
            need += healthScore * 0.3;

            // Complexity factor (0-25)
            need += complexity.score * 0.25;

            // Usage factor (0-20) - low usage increases need
            const usageNeed = Math.max(0, 100 - usage.score);
            need += usageNeed * 0.2;

            // Dependency factor (0-15)
            const depCount = moduleData.dependencyCount || 0;
            if (depCount > 10) {
                need += 15;
            } else if (depCount > 5) {
                need += 10;
            } else if (depCount > 3) {
                need += 5;
            }

            // Growth opportunity (0-10)
            if (moduleData.growthPotential) {
                need += moduleData.growthPotential * 0.1;
            }

            return Math.min(100, Math.round(need));
        }

        // ============================================================
        // Recommendation Determination (Chapter 8)
        // ============================================================

        _determineRecommendation(moduleData, health, complexity, usage, evolutionNeed) {
            const recommendations = [];

            // Check for upgrade need
            if (health.score < 50) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.UPGRADE,
                    reason: `Module health is ${health.level} (${health.score}%)`,
                    priority: health.score < 35 ? 'HIGH' : 'MEDIUM'
                });
            }

            // Check for split need
            if (complexity.score > 70 && moduleData.dependencyCount > 5) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.SPLIT,
                    reason: `High complexity (${complexity.score}%) with many dependencies`,
                    priority: complexity.score > 85 ? 'HIGH' : 'MEDIUM'
                });
            }

            // Check for merge need
            if (moduleData.relatedModules && moduleData.relatedModules.length > 0) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.MERGE,
                    reason: `Related modules found: ${moduleData.relatedModules.join(', ')}`,
                    priority: 'MEDIUM'
                });
            }

            // Check for deprecate need
            if (usage.score < 20 && evolutionNeed > 60) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.DEPRECATE,
                    reason: `Low usage (${usage.score}%) with high evolution need`,
                    priority: 'MEDIUM'
                });
            }

            // Check for optimize need
            if (health.score < 70 && complexity.score < 50) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.OPTIMIZE,
                    reason: `Moderate health (${health.score}%) with optimization potential`,
                    priority: 'LOW'
                });
            }

            // Check for replace need
            if (health.score < 40 && usage.score > 60) {
                recommendations.push({
                    type: RECOMMENDATION_TYPE.REPLACE,
                    reason: `Critical health (${health.score}%) with high usage`,
                    priority: 'HIGH'
                });
            }

            // Sort by priority
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

            return recommendations.length > 0 ? recommendations[0] : {
                type: RECOMMENDATION_TYPE.OPTIMIZE,
                reason: 'Module is stable, routine optimization recommended',
                priority: 'LOW'
            };
        }

        // ============================================================
        // Proposal Generation (Chapter 11)
        // ============================================================

        _generateProposals(moduleResults) {
            const proposals = [];

            moduleResults.forEach(module => {
                if (!module.recommendation) return;

                const rec = module.recommendation;

                // Get affected modules (Chapter 10)
                const affected = this._getAffectedModules(module.moduleName);

                const proposal = new EvolutionProposal({
                    targetModule: module.moduleName,
                    currentProblem: rec.reason || 'Module evolution needed',
                    suggestedEvolution: this._getEvolutionDescription(rec.type, module),
                    expectedBenefit: this._getExpectedBenefit(rec.type, module),
                    risk: rec.priority === 'HIGH' ? 'HIGH' : 
                          rec.priority === 'MEDIUM' ? 'MEDIUM' : 'LOW',
                    confidence: 60 + Math.min(20, module.evolutionNeed / 5),
                    affectedModules: affected,
                    metadata: {
                        recommendationType: rec.type,
                        evolutionNeed: module.evolutionNeed,
                        healthScore: module.getHealthScore()
                    }
                });

                proposals.push(proposal);
                this._proposals.push(proposal);
            });

            return proposals;
        }

        _getEvolutionDescription(type, module) {
            const descriptions = {
                [RECOMMENDATION_TYPE.UPGRADE]: `Upgrade ${module.moduleName} to improve health and performance`,
                [RECOMMENDATION_TYPE.SPLIT]: `Split ${module.moduleName} into smaller, focused modules`,
                [RECOMMENDATION_TYPE.MERGE]: `Merge ${module.moduleName} with related modules`,
                [RECOMMENDATION_TYPE.OPTIMIZE]: `Optimize ${module.moduleName} for better performance`,
                [RECOMMENDATION_TYPE.DEPRECATE]: `Deprecate ${module.moduleName} due to low usage and value`,
                [RECOMMENDATION_TYPE.REPLACE]: `Replace ${module.moduleName} with more capable solution`
            };
            return descriptions[type] || `Evolve ${module.moduleName}`;
        }

        _getExpectedBenefit(type, module) {
            const benefits = {
                [RECOMMENDATION_TYPE.UPGRADE]: 'Improved module health and reduced technical debt',
                [RECOMMENDATION_TYPE.SPLIT]: 'Better modularity and reduced complexity',
                [RECOMMENDATION_TYPE.MERGE]: 'Reduced duplication and improved cohesion',
                [RECOMMENDATION_TYPE.OPTIMIZE]: 'Better performance and resource usage',
                [RECOMMENDATION_TYPE.DEPRECATE]: 'Reduced maintenance burden and cleaner codebase',
                [RECOMMENDATION_TYPE.REPLACE]: 'Modern capabilities and better sustainability'
            };
            return benefits[type] || 'Module evolution benefit';
        }

        _getAffectedModules(moduleName) {
            const affected = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        Object.entries(registry).forEach(([name, data]) => {
                            if (data.dependencies && data.dependencies.includes(moduleName)) {
                                affected.push(name);
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return affected;
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getAllModuleNames() {
            const names = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        return Object.keys(registry);
                    }
                }
            } catch (e) { /* ignore */ }

            // Fallback: return core module names
            return [
                'BootManager', 'EventBus', 'StorageEngine', 'ThemeEngine',
                'SystemComposer', 'AIMentorEngine', 'LessonEngine', 'MemoryEngine'
            ];
        }

        _getModuleData(moduleName) {
            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry && registry[moduleName]) {
                        const data = registry[moduleName];
                        return {
                            name: moduleName,
                            performance: data.performance || 70,
                            errorRate: data.errorRate || 2,
                            maintenanceCost: data.maintenanceCost || 40,
                            dependencyCount: data.dependencies ? data.dependencies.length : 0,
                            dependencies: data.dependencies || [],
                            dependents: data.dependents || [],
                            usageFrequency: data.usageFrequency || 50,
                            importCount: data.importCount || 10,
                            linesOfCode: data.linesOfCode || 300,
                            cyclomaticComplexity: data.cyclomaticComplexity || 5,
                            growthPotential: data.growthPotential || 40,
                            relatedModules: data.relatedModules || []
                        };
                    }
                }
            } catch (e) { /* ignore */ }

            // Return synthetic data for unknown modules
            return {
                name: moduleName,
                performance: 60 + Math.random() * 30,
                errorRate: 1 + Math.random() * 5,
                maintenanceCost: 30 + Math.random() * 40,
                dependencyCount: Math.floor(Math.random() * 8),
                dependencies: [],
                dependents: [],
                usageFrequency: 20 + Math.random() * 60,
                importCount: 3 + Math.floor(Math.random() * 15),
                linesOfCode: 200 + Math.floor(Math.random() * 600),
                cyclomaticComplexity: 3 + Math.floor(Math.random() * 10),
                growthPotential: 20 + Math.random() * 50,
                relatedModules: []
            };
        }

        // ============================================================
        // Auto-Analysis
        // ============================================================

        _startAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
            }

            this._analysisInterval = setInterval(() => {
                this.analyzeAll();
            }, this._config.analysisInterval);

            console.log(`[ModuleEvolution] Auto-analysis started (${this._config.analysisInterval}ms)`);
        }

        _stopAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
                this._analysisInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 15)
        // ============================================================

        getModuleHealth(moduleName) {
            const module = this._modules.find(m => m.moduleName === moduleName);
            return module ? module.health : null;
        }

        getEvolutionNeed(moduleName) {
            const module = this._modules.find(m => m.moduleName === moduleName);
            return module ? module.evolutionNeed : 0;
        }

        getProposal(moduleName) {
            const proposal = this._proposals.find(p => p.targetModule === moduleName);
            return proposal ? proposal.toJSON() : null;
        }

        getHistory(limit) {
            return this._history.slice(-(limit || 10)).reverse();
        }

        getStats() {
            const total = this._modules.length;
            const byHealth = {};
            const byRecommendation = {};

            this._modules.forEach(m => {
                byHealth[m.health] = (byHealth[m.health] || 0) + 1;
                if (m.recommendation) {
                    byRecommendation[m.recommendation.type] = (byRecommendation[m.recommendation.type] || 0) + 1;
                }
            });

            const avgHealth = total > 0 ?
                Math.round(this._modules.reduce((sum, m) => sum + m.getHealthScore(), 0) / total) :
                0;

            const avgEvolutionNeed = total > 0 ?
                Math.round(this._modules.reduce((sum, m) => sum + m.evolutionNeed, 0) / total) :
                0;

            return {
                total,
                byHealth,
                byRecommendation,
                avgHealth,
                avgEvolutionNeed,
                proposals: this._proposals.length,
                historyCount: this._history.length,
                modulesNeedingAttention: this._modules.filter(m => 
                    m.evolutionNeed > 60
                ).length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 13)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this._modules.slice(-5).map(m => m.toJSON());
            const proposals = this._proposals.slice(-3).map(p => p.toJSON());

            return {
                type: 'module_evolution',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentModules: recent,
                recentProposals: proposals,
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
                        console.error('[ModuleEvolution] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`moduleevo.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('moduleEvolutionData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.modules) {
                        this._modules = data.modules.map(m => new ModuleEvolution(m));
                    }
                    if (data.proposals) {
                        this._proposals = data.proposals.map(p => new EvolutionProposal(p));
                    }
                    if (data.history) {
                        this._history = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 12)
        // ============================================================

        _connectToArchitectureAdvisor() {
            if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                console.log('[ModuleEvolution] Connected to Architecture Advisor');
            }
        }

        _connectToCapabilityGrowth() {
            if (window.LawAIApp && window.LawAIApp.CapabilityGrowth) {
                console.log('[ModuleEvolution] Connected to Capability Growth');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[ModuleEvolution] Connected to Knowledge Graph');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[ModuleEvolution] Connected to Runtime Registry');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[ModuleEvolution] Connected to Governance');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveRuntime) {
                console.log('[ModuleEvolution] Connected to Predictive Runtime');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'module-evolution',
                        name: 'Module Evolution',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ModuleEvolution] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ModuleEvolution] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoAnalysis();
            this._initialized = false;
            console.log('[ModuleEvolution] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new ModuleEvolutionAdvisor();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ModuleEvolution = {
        Core: instance,
        RECOMMENDATION_TYPE: RECOMMENDATION_TYPE,
        MODULE_HEALTH: MODULE_HEALTH,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        analyze: (moduleNames, options) => instance.analyze(moduleNames, options),
        analyzeAll: (options) => instance.analyzeAll(options),

        getModuleHealth: (moduleName) => instance.getModuleHealth(moduleName),
        getEvolutionNeed: (moduleName) => instance.getEvolutionNeed(moduleName),
        getProposal: (moduleName) => instance.getProposal(moduleName),
        getHistory: (limit) => instance.getHistory(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[ModuleEvolution] Part 54.4 loaded ✅');
    console.log('[ModuleEvolution] Recommendation Types:', Object.values(RECOMMENDATION_TYPE).join(' | '));

})();
