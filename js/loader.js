// ================================================================
// loader.js – V5.1.0 Runtime Recovery
// 启动顺序：Critical 引擎立即加载，Background 引擎在渲染后加载
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 🚀 关键引擎（必须优先加载，阻塞渲染）
// ============================================================
var CRITICAL_ENGINES = [
    "storageEngine.js",      // 存储
    "eventBus.js",           // 事件通信
    "systemComposer.js",     // UI 渲染
    "app.js"                 // 应用编排
];

// ============================================================
// 🔄 后台引擎（渲染后加载，不阻塞 UI）
// ============================================================
var BACKGROUND_ENGINES = [
    "profileEngine.js",
    "progressEngine.js",
    "lessonEngine.js",
    "memoryEngine.js",
    "practiceEngine.js",
    "reflectionEngine.js",
    "experienceEngine.js",
    "schoolEngine.js",
    "academicRecordEngine.js",
    "certificateEngine.js",
    "careerEngine.js",
    "communityEngine.js",
    "recommendationEngine.js"
];

// ============================================================
// 加载缓存
// ============================================================
var _loadCache = {};
var _loadingPromises = {};
var _bootTimeline = [];
var _health = { healthy: true, errors: [], warnings: [] };
var _loadedModules = {};
var _missingModules = [];

// ============================================================
// 获取当前脚本的目录路径
// ============================================================
function getBasePath() {
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var src = currentScript.src || '';
    
    var match = src.match(/^(.*)\/js\/loader\.js/);
    if (match) {
        return match[1] + '/js/';
    }
    
    var path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '/js/';
    }
    return 'js/';
}

var BASE_PATH = getBasePath();
console.log('📂 Loader base path:', BASE_PATH);

// ============================================================
// 加载脚本
// ============================================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok", cached: true });
    }

    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var promise = new Promise(function(resolve) {
        var pathsToTry = [
            '/js/' + src,
            BASE_PATH + src,
            'js/' + src,
            '../js/' + src
        ];
        
        var uniquePaths = [];
        for (var i = 0; i < pathsToTry.length; i++) {
            if (uniquePaths.indexOf(pathsToTry[i]) === -1) {
                uniquePaths.push(pathsToTry[i]);
            }
        }
        
        tryLoadPaths(uniquePaths, 0, resolve, src);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryLoadPaths(paths, index, resolve, src) {
    if (index >= paths.length) {
        _missingModules.push(src);
        _health.warnings.push('Module not found: ' + src);
        resolve({ file: src, status: "missing" });
        return;
    }
    
    var path = paths[index];
    console.log('🔄 Trying path:', path);
    
    var script = document.createElement("script");
    script.src = path;
    script.onload = function() {
        _loadCache[src] = true;
        _loadedModules[src] = { loaded: true, time: Date.now() };
        console.log('✅ Loaded:', src, 'from', path);
        resolve({ file: src, status: "ok" });
    };
    script.onerror = function() {
        console.warn('⚠️ Failed:', path);
        tryLoadPaths(paths, index + 1, resolve, src);
    };
    document.head.appendChild(script);
}

// ============================================================
// 🚀 启动关键引擎
// ============================================================
async function bootCritical() {
    console.log("🚀 Loader V5.1.0 starting (Critical only)");
    console.log("📂 Base path:", BASE_PATH);
    console.log("📦 Loading " + CRITICAL_ENGINES.length + " critical modules...");

    var startTime = Date.now();
    _bootTimeline.push({ event: 'boot_start', time: startTime });

    var results = await Promise.all(CRITICAL_ENGINES.map(function(src) {
        return loadScript(src);
    }));

    var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
    var missing = results.filter(function(r) { return r.status === "missing"; });

    var elapsed = Date.now() - startTime;
    _bootTimeline.push({ event: 'critical_boot_complete', time: Date.now() });

    console.log("✅ " + loaded.length + "/" + CRITICAL_ENGINES.length + " critical modules loaded (" + elapsed + "ms)");

    window.__ENGINE_STATUS__ = {
        loaded: loaded.map(function(r) { return r.file; }),
        missing: missing.map(function(r) { return r.file; }),
        active: [],
        booted: true,
        safeMode: missing.length > 0,
        timeline: _bootTimeline,
        health: _health
    };

    window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;
    _health.healthy = missing.length === 0;

    // 触发 SYSTEM_READY，让 App 开始渲染
    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: {
                boot: window.__ENGINE_STATUS__,
                timestamp: Date.now()
            }
        }));
        console.log("✅ System ready for rendering (" + elapsed + "ms)");
    }, 50);

    // ============================================================
    // 🔄 后台加载其余引擎（不阻塞渲染）
    // ============================================================
    setTimeout(function() {
        console.log("📦 Loading " + BACKGROUND_ENGINES.length + " background engines...");
        Promise.all(BACKGROUND_ENGINES.map(function(src) {
            return loadScript(src);
        })).then(function(results) {
            var bgLoaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
            var bgMissing = results.filter(function(r) { return r.status === "missing"; });
            console.log("✅ " + bgLoaded.length + "/" + BACKGROUND_ENGINES.length + " background engines loaded");
            if (bgMissing.length > 0) {
                console.warn("⚠️ Background engines missing:", bgMissing.map(function(r) { return r.file; }));
            }
            window.__ENGINE_STATUS__.backgroundLoaded = bgLoaded.map(function(r) { return r.file; });
            window.__ENGINE_STATUS__.backgroundMissing = bgMissing.map(function(r) { return r.file; });
            window.dispatchEvent(new CustomEvent("BACKGROUND_LOADED", {
                detail: {
                    loaded: bgLoaded.map(function(r) { return r.file; }),
                    missing: bgMissing.map(function(r) { return r.file; })
                }
            }));
        });
    }, 300);
}

// ============================================================
// 自动启动
// ============================================================
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(bootCritical, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(bootCritical, 50);
    });
}

console.log("🚀 Loader V5.1.0 ready (Runtime Recovery)");
