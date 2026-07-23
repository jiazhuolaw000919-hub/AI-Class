// ================================================================
// loader.js – V5.3.3 - Runtime Boot Bridge Hotfix
// Runtime Core loads BEFORE application engines
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 精简阶段分组
// ============================================================
var STAGES = {
    // 🆕 Runtime Core - MUST load before everything!
    runtime: [
        // Core
        "core/BootManager.js",
        "core/bootPipeline.js",
        "core/bootStageRegistry.js",
        "core/bootStageHandlers.js",
        "core/bootDiagnostics.js",
        "core/bootReporter.js",
        // Observation
        "core/runtimeObservationManifest.js",
        "core/runtimeObservationCollector.js",
        "core/runtimeObservationValidator.js",
        "core/runtimeObservationHealth.js",
        // Metrics
        "core/runtimeMetricsManifest.js",
        "core/runtimeMetricsCollector.js",
        "core/runtimeMetricsValidator.js",
        "core/runtimeMetricsHealth.js",
        // Tracing
        "core/runtimeTraceManifest.js",
        "core/runtimeTraceCollector.js",
        "core/runtimeTraceValidator.js",
        "core/runtimeTraceHealth.js",
        // Performance
        "core/runtimePerformanceManifest.js",
        "core/runtimeMetricRegistry.js",
        "core/runtimePerformanceCollector.js",
        "core/runtimePerformanceStore.js",
        "core/runtimePerformanceAnalyzer.js",
        "core/runtimePerformanceHealth.js",
        "core/runtimePerformanceReport.js",
        "core/runtimePerformanceAPI.js",
        "core/runtimePerformanceDashboard.js",
        // Events
        "core/runtimeEventRegistry.js",
        "core/runtimeEventCollector.js",
        "core/runtimeEventStore.js",
        "core/runtimeEventAnalyzer.js",
        "core/runtimeEventIntelligence.js",
        "core/runtimeEventTimeline.js",
        "core/runtimeEventAPI.js",
        // State Sync
        "core/stateSyncManifest.js",
        "core/stateSchema.js",
        "core/stateRegistry.js",
        "core/stateSyncEngine.js",
        "core/stateConflictResolver.js",
        "core/statePersistence.js",
        "core/stateIntelligence.js",
        "core/runtimeStateIntegration.js"
    ],
    critical: [
        "storageEngine.js",
        "eventBus.js",
        "themeEngine.js",
        "systemComposer.js",
        "app.js"
    ],
    ux: [
        "progressEngine.js",
        "experienceEngine.js",
        "recommendationEngine.js",
        "debug/devPanel.js"
    ],
    intelligence: [
        "lessonEngine.js",
        "memoryEngine.js",
        "practiceEngine.js",
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
// 加载脚本
// ============================================================
function loadScript(src) {
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

            console.log(`[Loader] ⏳ Stage ${name}: Loading...`);

            Promise.all(files.map(loadScript)).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok"; }).length;
                console.log('✅ Stage ' + name + ': ' + loaded + '/' + files.length + ' loaded');

                console.log(`[Loader] ✅ Stage ${name} Ready`);

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
    console.log("🚀 Loader V5.3.3 starting...");

    // 🆕 Load Runtime Core FIRST
    await loadStage('runtime', STAGES.runtime, 0);

    // Then load critical
    await loadStage('critical', STAGES.critical, 0);

    console.log('[Loader] ✅ Runtime Ready');

    var status = {
        loaded: Object.keys(_loadedModules),
        booted: true
    };
    window.LawAIApp.bootStatus = status;
    window.__ENGINE_STATUS__ = status;

    console.log('[Loader] ✅ Composer Ready');

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: { boot: status, timestamp: Date.now() }
        }));

        console.log('[Loader] ✅ Application Ready');
        console.log('[Loader] ✅ Recovery Core Runtime Ready');

        console.log("✅ SYSTEM_READY dispatched");
    }, 50);

    // 异步加载其他阶段
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
    console.log("🚀 Loader pipeline started");
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

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V5.3.3 ready (Runtime Boot Bridge Hotfix)");
