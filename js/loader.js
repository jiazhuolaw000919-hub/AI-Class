// ================================================================
// loader.js – V5.3.8 - Runtime Boot Bridge + Explorer Panel
// Runtime Core loads BEFORE application engines
// Supports ES Module loading for Runtime Framework
// Fixed: RuntimeEventCollector pre-creation + Governance module ordering
// Added: ExplorerPanel registration
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 🔥 Part 49 前置 — 确保 RuntimeEventCollector 存在
// ============================================================
(function() {
    if (!window.LawAIApp.RuntimeEventCollector) {
        window.LawAIApp.RuntimeEventCollector = {
            events: [],
            emit: function(event) {
                this.events.push(Object.assign({}, event, { _timestamp: Date.now() }));
                if (this.events.length > 200) this.events = this.events.slice(-100);
            },
            emitEvent: function(event) {
                return this.emit(event);
            },
            getEvents: function() { return this.events; },
            clear: function() { this.events = []; }
        };
        console.log('[Loader] ✅ RuntimeEventCollector pre-created for Part 49');
    } else if (typeof window.LawAIApp.RuntimeEventCollector.emit !== 'function') {
        window.LawAIApp.RuntimeEventCollector.emit = function(event) {
            (this.events = this.events || []).push(Object.assign({}, event, { _timestamp: Date.now() }));
        };
        console.log('[Loader] ✅ RuntimeEventCollector.emit patched');
    }
})();

// ============================================================
// 精简阶段分组
// ============================================================
var STAGES = {
    // 🆕 Runtime Core - MUST load before everything!
    runtime: [
        // Part 40-42: Observation / Metrics / Tracing
        "core/runtimeObservationManifest.js",
        "core/runtimeObservationCollector.js",
        "core/runtimeObservationValidator.js",
        "core/runtimeObservationHealth.js",
        "core/runtimeMetricsManifest.js",
        "core/runtimeMetricsCollector.js",
        "core/runtimeMetricsValidator.js",
        "core/runtimeMetricsHealth.js",
        "core/runtimeTraceManifest.js",
        "core/runtimeTraceCollector.js",
        "core/runtimeTraceValidator.js",
        "core/runtimeTraceHealth.js",
        
        // Part 43: Performance Framework
        "core/runtimePerformanceManifest.js",
        "core/runtimeMetricRegistry.js",
        "core/runtimePerformanceCollector.js",
        "core/runtimePerformanceStore.js",
        "core/runtimePerformanceAnalyzer.js",
        "core/runtimePerformanceHealth.js",
        "core/runtimePerformanceReport.js",
        "core/runtimePerformanceAPI.js",
        "core/runtimePerformanceDashboard.js",
        
        // Part 44: Event Intelligence
        "core/runtimeEventRegistry.js",
        "core/runtimeEventCollector.js",
        "core/runtimeEventStore.js",
        "core/runtimeEventAnalyzer.js",
        "core/runtimeEventIntelligence.js",
        "core/runtimeEventTimeline.js",
        "core/runtimeEventAPI.js",
        
        // Part 45: State Synchronization
        "core/stateSyncManifest.js",
        "core/stateSchema.js",
        "core/stateRegistry.js",
        "core/stateSyncEngine.js",
        "core/stateConflictResolver.js",
        "core/statePersistence.js",
        "core/stateIntelligence.js",
        "core/runtimeStateIntegration.js",
        
        // Part 39: Boot Core (after state/events are ready)
        "core/bootManager.js",
        "core/bootPipeline.js",
        "core/bootStageRegistry.js",
        "core/bootStageHandlers.js",
        "core/bootDiagnostics.js",
        "core/bootReporter.js",
        
        // Part 46: AI Runtime Assistant
        "core/aiContextEngine.js",
        "core/aiRuntimeKnowledge.js",
        "core/aiReasoningEngine.js",
        "core/aiRecommendationEngine.js",
        "core/aiRuntimeAssistant.js",
        "core/aiRuntimeInteraction.js",
        
        // Part 47: Knowledge Graph
        "core/runtimeKnowledgeGraph.js",
        "core/runtimeEntityRegistry.js",
        "core/runtimeRelationshipEngine.js",
        "core/knowledgeGraphAnalyzer.js",
        "core/impactAnalysisEngine.js",
        "core/aiKnowledgeIntegration.js",
        
        // Part 48: Cognitive Engine
        "core/runtimeCognitiveEngine.js",
        "core/dependencyIntelligenceEngine.js",
        "core/rootCauseAnalysisEngine.js",
        "core/runtimePredictionEngine.js",
        "core/decisionSupportEngine.js",
        "core/aiCognitiveIntegration.js",
        
        // ═══════════════════════════════════════
        // Part 49: Runtime Governance Layer
        // ═══════════════════════════════════════
        "core/runtimeGovernanceFoundation.js",
        "core/runtimePolicyEngine.js",
        "core/runtimePermissionSystem.js",
        "core/runtimeValidationSystem.js",
        "core/runtimeSafetyCompliance.js",
        "core/aiGovernanceIntegration.js",
        "core/unifiedGovernanceDashboard.js",

        // ═══════════════════════════════════════ 🆕 PART 50
        // Part 50: Autonomous Runtime Layer
        // ═══════════════════════════════════════
        "autonomous/autonomousCore.js",
        "autonomous/autonomousLifecycle.js",
        "autonomous/autonomousDecisionEngine.js",
        "autonomous/autonomousRecommendationEngine.js",
        "autonomous/autonomousApprovalBridge.js",
        "autonomous/autonomousActionPlanner.js",
        "autonomous/autonomousDashboard.js",
        "autonomous/autonomousSimulation.js",
        
        // ═══════════════════════════════════════
        // Part 49.8: DevPanel Core + Panels
        // ═══════════════════════════════════════
        "core/panelRegistry.js",
        "core/panelManager.js",
        "core/devPanelCore.js",
        
        // ── DevPanel Panels ──
        "debug/panels/runtimePanel.js",
        "debug/panels/performancePanel.js",
        "debug/panels/metricsPanel.js",
        "debug/panels/eventPanel.js",
        "debug/panels/tracePanel.js",
        "debug/panels/statePanel.js",
        "debug/panels/knowledgePanel.js",
        "debug/panels/cognitivePanel.js",
        "debug/panels/governancePanel.js",
        "debug/panels/explorerPanel.js",
        "debug/details/panelDetailManager.js",
        "debug/details/governanceDashboardLoader.js",
        "debug/panels/autonomousPanel.js",
        "debug/panels/predictivePanel.js",
        "debug/panels/evolutionPanel.js",
        "debug/panels/orchestrationPanel.js",
        "debug/panels/productionPanel.js",
        
        // ── Components ──
        "components/panelCard.js",
        "components/statusBadge.js",
        
        // ═══════════════════════════════════════
        // Part 49.9: Runtime Explorer Layer
        // ═══════════════════════════════════════
        "runtime/runtimeExplorer.js",
        "runtime/runtimeRegistry.js",
        "runtime/runtimeInspector.js",
        "runtime/runtimeSearch.js",
        "runtime/runtimeSnapshot.js",

        // ═══════════════════════════════════════
        // Part 51: Adaptive Decision Loop 🆕
        // ═══════════════════════════════════════
        "core/decisionIntelligence.js",
        "core/historicalMemory.js",
        "core/reasoningEngine.js",
        "core/decisionConfidence.js",
        "core/decisionExplanation.js",
        "core/adaptiveDecisionLoop.js",

        // ═══════════════════════════════════════
        // Part 52.6: Optimization Feedback 🆕
        // ═══════════════════════════════════════
        "core/runtimeOptimization.js",
        "core/optimizationIntelligence.js",
        "core/performanceAnalyzer.js",
        "core/resourceOptimization.js",
        "core/architectureAdvisor.js",
        "core/optimizationRecommendation.js",
        "core/optimizationFeedback.js",

        // ═══════════════════════════════════════
        // Part 53.6: Predictive Feedback 🆕
        // ═══════════════════════════════════════
        "core/predictiveRuntime.js",
        "core/predictiveIntelligence.js",
        "core/trendPrediction.js",
        "core/riskForecasting.js",
        "core/failurePrediction.js",
        "core/predictiveRecommendation.js",
        "core/predictiveFeedback.js",

        // ═══════════════════════════════════════
        // Part 54.6: Evolution Feedback 🆕
        // ═══════════════════════════════════════
        "core/runtimeEvolution.js",
        "core/evolutionIntelligence.js",
        "core/runtimeAdaptation.js",
        "core/capabilityGrowth.js",
        "core/moduleEvolution.js",
        "core/evolutionGovernance.js",
        "core/evolutionFeedback.js",

        // ═══════════════════════════════════════
        // Part 55: AI Orchestration Layer 🆕
        // ═══════════════════════════════════════
        "core/aiOrchestration.js",
        "core/orchestrationIntelligence.js",
        "core/intelligenceCoordination.js",
        "core/multiAgentWorkflow.js",
        "core/intelligencePriority.js",
        "core/orchestrationGovernance.js",
        "core/orchestrationFeedback.js",

        // Part 56.6: Runtime OS Completion 🆕
        // ═══════════════════════════════════════
        "core/runtimeOS.js",
        "core/runtimeOSIntegration.js",
        "core/unifiedRuntimeArchitecture.js",
        "core/intelligenceFederation.js",
        "core/finalGovernanceValidation.js",
        "core/productionReadiness.js",
        "core/runtimeOSCompletion.js"
    ],
    critical: [
        "storageEngine.js",
        "eventBus.js",
        "themeEngine.js",
        "systemComposer.js",
        "app.js"
    ],
    ux: [
        "experienceComposer.js",
        "experienceEngine.js",
        "progressEngine.js",
        "recommendationEngine.js",
        "debug/devPanel.js",
        "debug/devPanelAIAssistant.js",
        "debug/devPanelKnowledgeGraph.js",
        "debug/devPanelCognitive.js"
    ],
    intelligence: [
        "academy/lessonEngine.js",
        "memoryEngine.js",
        "academy/practiceEngine.js",
        "reflectionEngine.js",
        "AIMentorEngine.js",
        "schoolEngine.js"
    ],
    background: [
        "academicRecordEngine.js",
        "certificateEngine.js",
        "careerEngine.js",
        "communityEngine.js",
        "executionEngine.js"
    ]
};

// ============================================================
// 加载缓存
// ============================================================
var _loadCache = {};
var _loadingPromises = {};
var _loadedModules = {};

// ============================================================
// 获取路径
// ============================================================
function getBasePath() {
    var scripts = document.getElementsByTagName('script');
    var src = scripts[scripts.length - 1].src || '';
    var match = src.match(/^(.*)\/js\/loader\.js/);
    if (match) return match[1] + '/js/';
    return window.location.pathname.includes('/pages/') ? '/js/' : 'js/';
}

var BASE_PATH = getBasePath();

// ============================================================
// 🔥 ES Module 加载函数
// ============================================================
function loadModule(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok" });
    }
    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var engineName = src.replace('.js', '').replace(/\//g, '_');
    
    if (LawAIApp.DevTools?.RuntimeProfiler) {
        LawAIApp.DevTools.RuntimeProfiler.registerEngine(engineName);
        var caller = 'Loader';
        if (LawAIApp.DevTools.RuntimeProfiler._currentCaller) {
            caller = LawAIApp.DevTools.RuntimeProfiler._currentCaller;
        }
        LawAIApp.DevTools.RuntimeProfiler.addDependency(caller, engineName);
    }

    var promise = new Promise(function(resolve) {
        // 🔥 路径顺序：先尝试正确的 js/core/ 路径
        var paths = [
            BASE_PATH + src,        // js/core/bootManager.js
            'js/' + src,            // js/core/bootManager.js
            '/' + src,              // /core/bootManager.js
            '../' + src             // ../core/bootManager.js
        ];
        var unique = [];
        for (var i = 0; i < paths.length; i++) {
            if (unique.indexOf(paths[i]) === -1) unique.push(paths[i]);
        }
        
        tryLoadModule(unique, 0, resolve, src, engineName);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryLoadModule(paths, index, resolve, src, engineName) {
    if (index >= paths.length) {
        console.error('❌ Failed to load:', src, '(all paths exhausted)');
        resolve({ file: src, status: "missing" });
        return;
    }
    
    var fullPath = paths[index];
    
    import(fullPath)
        .then(function(module) {
            _loadCache[src] = true;
            _loadedModules[src] = true;
            
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler.engineLoaded(engineName);
            }
            
            console.log('✅ Loaded (ESM):', src);
            resolve({ file: src, status: "ok", module: module });
        })
        .catch(function(err) {
            console.warn('⚠️ ESM load failed:', fullPath, err.message);
            tryLoadLegacy(fullPath, resolve, src, engineName);
        });
}

// ============================================================
// 🔥 传统加载（Fallback）
// ============================================================
function tryLoadLegacy(src, resolve, fileSrc, engineName) {
    var script = document.createElement("script");
    script.src = src;
    script.onload = function() {
        _loadCache[fileSrc] = true;
        _loadedModules[fileSrc] = true;
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.engineLoaded(engineName);
        }
        console.log('✅ Loaded (Legacy):', fileSrc);
        resolve({ file: fileSrc, status: "ok" });
    };
    script.onerror = function() {
        console.error('❌ Legacy load failed:', src);
        resolve({ file: fileSrc, status: "missing" });
    };
    document.head.appendChild(script);
}

// ============================================================
// 🔥 兼容加载
// ============================================================
function loadScript(src) {
    if (src.startsWith('core/')) {
        return loadModule(src);
    }
    
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok" });
    }
    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var engineName = src.replace('.js', '').replace(/\//g, '_');
    if (LawAIApp.DevTools?.RuntimeProfiler) {
        LawAIApp.DevTools.RuntimeProfiler.registerEngine(engineName);
        var caller = 'Loader';
        if (LawAIApp.DevTools.RuntimeProfiler._currentCaller) {
            caller = LawAIApp.DevTools.RuntimeProfiler._currentCaller;
        }
        LawAIApp.DevTools.RuntimeProfiler.addDependency(caller, engineName);
    }

    var promise = new Promise(function(resolve) {
        var paths = [
            '/js/' + src,
            BASE_PATH + src,
            'js/' + src,
            '../js/' + src
        ];
        var unique = [];
        for (var i = 0; i < paths.length; i++) {
            if (unique.indexOf(paths[i]) === -1) unique.push(paths[i]);
        }
        tryLoad(unique, 0, resolve, src, engineName);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryLoad(paths, index, resolve, src, engineName) {
    if (index >= paths.length) {
        console.error('❌ Failed to load:', src);
        resolve({ file: src, status: "missing" });
        return;
    }
    var script = document.createElement("script");
    script.src = paths[index];
    script.onload = function() {
        _loadCache[src] = true;
        _loadedModules[src] = true;
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.engineLoaded(engineName);
        }
        resolve({ file: src, status: "ok" });
    };
    script.onerror = function() {
        tryLoad(paths, index + 1, resolve, src, engineName);
    };
    document.head.appendChild(script);
}

// ============================================================
// 按阶段加载
// ============================================================
function loadStage(name, files, delay) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler._currentCaller = 'Stage_' + name;
                LawAIApp.DevTools.RuntimeProfiler.mark('stage_' + name + '_start');
            }

            console.log('[Loader] ⏳ Stage ' + name + ': Loading ' + files.length + ' files...');

            Promise.all(files.map(loadScript)).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === 'ok'; }).length;
                var missing = results.filter(function(r) { return r.status === 'missing'; });
                
                console.log('✅ Stage ' + name + ': ' + loaded + '/' + files.length + ' loaded');
                
                if (missing.length > 0) {
                    console.warn('⚠️ Stage ' + name + ' missing files:', missing.map(function(r) { return r.file; }));
                }

                console.log('[Loader] ✅ Stage ' + name + ' Ready');

                if (LawAIApp.DevTools?.RuntimeProfiler) {
                    LawAIApp.DevTools.RuntimeProfiler.mark('stage_' + name + '_end');
                    LawAIApp.DevTools.RuntimeProfiler.measure(
                        'stage_' + name,
                        'stage_' + name + '_start',
                        'stage_' + name + '_end'
                    );
                }
                resolve(results);
            });
        }, delay || 0);
    });
}

// ============================================================
// 主启动
// ============================================================
async function boot() {
    if (LawAIApp.DevTools?.RuntimeProfiler) {
        LawAIApp.DevTools.RuntimeProfiler.mark('loader_boot_start');
    }

    console.log('[Loader] ⏳ Runtime Loading...');
    console.log('🚀 Loader V5.3.8 starting...');
    console.log('[Loader] ✅ RuntimeEventCollector ready:', !!window.LawAIApp.RuntimeEventCollector?.emit);

    await loadStage('runtime', STAGES.runtime, 0);
    await loadStage('critical', STAGES.critical, 0);

    console.log('[Loader] ✅ Runtime Ready');

    var status = {
        loaded: Object.keys(_loadedModules),
        booted: true
    };
    window.LawAIApp.bootStatus = status;
    window.__ENGINE_STATUS__ = status;

    console.log('[Loader] ✅ Composer Ready');

    // ── 🔥 延迟初始化 DevPanel (确保所有 Panel 已加载) ──
    // ── 🔥 延迟初始化 DevPanel (确保所有 Panel 已加载) ──
    setTimeout(function() {
        if (window.LawAIApp.Debug && window.LawAIApp.Debug.DevPanel) {
            if (typeof window.LawAIApp.Debug.DevPanel.init === 'function') {
                window.LawAIApp.Debug.DevPanel.init();
                console.log('[Loader] ✅ DevPanel initialized after all panels loaded');
            } else {
                console.warn('[Loader] ⚠️ DevPanel.init not ready, retrying in 500ms...');
                // 重试一次 (延迟增加)
                setTimeout(function() {
                    if (window.LawAIApp.Debug && window.LawAIApp.Debug.DevPanel) {
                        if (typeof window.LawAIApp.Debug.DevPanel.init === 'function') {
                            window.LawAIApp.Debug.DevPanel.init();
                            console.log('[Loader] ✅ DevPanel initialized (retry)');
                        } else {
                            console.warn('[Loader] ❌ DevPanel.init still not available after retry');
                            // 再试最后一次 (延迟更长)
                            setTimeout(function() {
                                if (window.LawAIApp.Debug && window.LawAIApp.Debug.DevPanel) {
                                    if (typeof window.LawAIApp.Debug.DevPanel.init === 'function') {
                                        window.LawAIApp.Debug.DevPanel.init();
                                        console.log('[Loader] ✅ DevPanel initialized (final retry)');
                                    } else {
                                        console.warn('[Loader] ❌ DevPanel.init still not available, giving up');
                                    }
                                }
                            }, 500);
                        }
                    }
                }, 500);  // 从 300ms 增加到 500ms
            }
        } else {
            console.warn('[Loader] ⚠️ DevPanel not available');
        }
    }, 200);

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent('SYSTEM_READY', {
            detail: { boot: status, timestamp: Date.now() }
        }));

        console.log('[Loader] ✅ Application Ready');
        console.log('[Loader] ✅ Recovery Core Runtime Ready');
        console.log('✅ SYSTEM_READY dispatched');
    }, 50);

    loadStage('ux', STAGES.ux, 100);
    loadStage('intelligence', STAGES.intelligence, 500);
    loadStage('background', STAGES.background, 1000);

    if (LawAIApp.DevTools?.RuntimeProfiler) {
        LawAIApp.DevTools.RuntimeProfiler.mark('loader_boot_end');
        LawAIApp.DevTools.RuntimeProfiler.measure(
            'loader_boot_total',
            'loader_boot_start',
            'loader_boot_end'
        );
    }
    console.log('🚀 Loader pipeline started');
}

// ============================================================
// 按需加载 API
// ============================================================
LawAIApp.require = function(moduleName) {
    return loadScript(moduleName + '.js');
};

LawAIApp.requireAll = function(modules) {
    return Promise.all(modules.map(function(name) {
        return LawAIApp.require(name);
    }));
};

LawAIApp.getLoadStatus = function() {
    return {
        loaded: Object.keys(_loadedModules),
        loading: Object.keys(_loadingPromises)
    };
};

// ============================================================
// 🔥 启动
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 50);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(boot, 50);
    });
}

console.log('🚀 Loader V5.3.8 ready (Part 49 Governance + Explorer Panel)');
