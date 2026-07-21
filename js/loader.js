// ================================================================
// loader.js – V5.3.2 - Simplified Startup + Profiler + Dependency + Recovery Checkpoints
// 精简阶段结构 + 性能标记 + 依赖追踪 + Recovery 检查点
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 精简阶段分组
// ============================================================
var STAGES = {
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
        "recommendationEngine.js"
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
// 加载脚本（精简 + 依赖追踪）
// ============================================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok" });
    }
    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var engineName = src.replace('.js', '');
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
        // 🔥 通知 Profiler 引擎加载完成
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
            // 🔥 标记当前阶段
            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler._currentCaller = 'Stage_' + name;
                LawAIApp.DevTools.RuntimeProfiler.mark('stage_' + name + '_start');
            }

            // 🔥 RECOVERY: 记录 Runtime 检查点
            console.log(`[Loader] ⏳ Stage ${name}: Loading...`);

            Promise.all(files.map(loadScript)).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok"; }).length;
                console.log('✅ Stage ' + name + ': ' + loaded + '/' + files.length + ' loaded');

                // 🔥 RECOVERY: 阶段完成检查点
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

    // 🔥 RECOVERY: 记录 Runtime Loading 开始
    console.log('[Loader] ⏳ Runtime Loading...');

    console.log("🚀 Loader V5.3.2 starting...");

    await loadStage('critical', STAGES.critical, 0);

    // 🔥 RECOVERY: Runtime Ready 检查点
    console.log('[Loader] ✅ Runtime Ready');

    var status = {
        loaded: Object.keys(_loadedModules),
        booted: true
    };
    window.LawAIApp.bootStatus = status;
    window.__ENGINE_STATUS__ = status;

    // 🔥 RECOVERY: Composer Ready 检查点
    console.log('[Loader] ✅ Composer Ready');

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: { boot: status, timestamp: Date.now() }
        }));

        // 🔥 RECOVERY: Application Ready 检查点
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

console.log("🚀 Loader V5.3.2 ready (simplified + profiler + dependency + recovery)");
