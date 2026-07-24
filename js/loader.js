// ================================================================
// loader.js – V5.3.4 - Runtime Boot Bridge Hotfix (ES Module Support)
// Runtime Core loads BEFORE application engines
// Supports ES Module loading for Runtime Framework
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 精简阶段分组
// ============================================================
var STAGES = {
    // 🆕 Runtime Core - MUST load before everything!
    // 使用 ES Module 动态导入
    runtime: [
        // Core
        "core/bootManager.js",
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
// 🔥 ES Module 加载函数（支持 import/export）
// ============================================================
function loadModule(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok" });
    }
    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var engineName = src.replace('.js', '').replace(/\//g, '_');
    
    // 🔥 注册引擎并记录依赖
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
            '/' + src,
            BASE_PATH + src,
            'js/' + src,
            '../' + src
        ];
        var unique = [];
        for (var i = 0; i < paths.length; i++) {
            if (unique.indexOf(paths[i]) === -1) unique.push(paths[i]);
        }
        
        // 🔥 使用 ES Module 方式加载
        tryLoadModule(unique, 0, resolve, src, engineName);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryLoadModule(paths, index, resolve, src, engineName) {
    if (index >= paths.length) {
        resolve({ file: src, status: "missing" });
        return;
    }
    
    var fullPath = paths[index];
    
    // 🔥 使用 import() 动态加载 ES Module
    import(fullPath)
        .then(function(module) {
            _loadCache[src] = true;
            _loadedModules[src] = true;
            
            // 🔥 通知 Profiler 引擎加载完成
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler.engineLoaded(engineName);
            }
            
            console.log('✅ Loaded (ESM):', src);
            resolve({ file: src, status: "ok", module: module });
        })
        .catch(function(err) {
            console.warn('⚠️ ESM load failed:', fullPath, err.message);
            // 如果 import 失败，尝试传统方式加载
            tryLoadLegacy(fullPath, resolve, src, engineName);
        });
}

// ============================================================
// 🔥 传统加载（Fallback for non-ESM files）
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
        resolve({ file: fileSrc, status: "ok" });
    };
    script.onerror = function() {
        resolve({ file: fileSrc, status: "missing" });
    };
    document.head.appendChild(script);
}

// ============================================================
// 🔥 兼容加载：自动检测 ES Module 或传统 script
// ============================================================
function loadScript(src) {
    // 对于 core/ 目录下的文件，使用 ES Module 加载
    if (src.startsWith('core/')) {
        return loadModule(src);
    }
    
    // 其他文件使用传统方式
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

            console.log(`[Loader] ⏳ Stage ${name}: Loading ${files.length} files...`);

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
    console.log("🚀 Loader V5.3.4 starting...");

    // 🆕 Load Runtime Core FIRST (ES Module)
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

// ============================================================
// 🔥 启动
// ============================================================
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V5.3.4 ready (Runtime Boot Bridge Hotfix - ES Module Support)"); 
