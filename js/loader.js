// ================================================================
// loader.js – V5.0 FINAL（路径检测修复版）
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 核心引擎（必须优先加载）
// ============================================================
var CORE_ENGINES = [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js",
    "progressEngine.js",
    "systemComposer.js",
    "app.js"
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
// 获取当前脚本的目录路径（增强版）
// ============================================================
function getBasePath() {
    // 方法1：从当前 script 标签提取
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var src = currentScript.src || '';
    
    var match = src.match(/^(.*)\/js\/loader\.js/);
    if (match) {
        return match[1] + '/js/';
    }
    
    // 方法2：从页面路径推断
    var path = window.location.pathname;
    if (path.includes('/pages/')) {
        // 如果在 /pages/ 下，回到根目录的 /js/
        return '/js/';
    }
    
    // 方法3：默认
    return 'js/';
}

var BASE_PATH = getBasePath();
console.log('📂 Loader base path:', BASE_PATH);

// ============================================================
// 加载脚本（绝对路径优先）
// ============================================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok", cached: true });
    }

    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var promise = new Promise(function(resolve) {
        // 优先尝试绝对路径
        var pathsToTry = [
            '/js/' + src,           // 根目录绝对路径
            BASE_PATH + src,        // 检测到的路径
            'js/' + src,            // 相对路径
            '../js/' + src          // 上级目录
        ];
        
        // 去重
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
// 按需加载模块
// ============================================================
LawAIApp.require = function(moduleName) {
    var fileName = moduleName + '.js';
    if (_loadCache[fileName]) {
        return Promise.resolve({ file: fileName, status: "ok", cached: true });
    }
    return loadScript(fileName);
};

LawAIApp.requireAll = function(moduleNames) {
    return Promise.all(moduleNames.map(function(name) {
        return LawAIApp.require(name);
    }));
};

// ============================================================
// 获取加载状态
// ============================================================
LawAIApp.getLoadStatus = function() {
    return {
        cached: Object.keys(_loadCache),
        loading: Object.keys(_loadingPromises)
    };
};

LawAIApp.clearLoadCache = function() {
    for (var key in _loadCache) {
        delete _loadCache[key];
    }
    for (var key in _loadingPromises) {
        delete _loadingPromises[key];
    }
    console.log('🧹 Load cache cleared');
};

// ============================================================
// 新增：Boot Status
// ============================================================
LawAIApp.getBootStatus = function() {
    var loadedCount = Object.keys(_loadedModules).filter(function(k) {
        return _loadedModules[k].loaded;
    }).length;
    var totalCount = Object.keys(_loadedModules).length;

    return {
        loaded: loadedCount,
        missing: _missingModules.length,
        total: totalCount,
        active: loadedCount > 0,
        booted: _health.healthy,
        safeMode: _health.healthy === false,
        timeline: _bootTimeline.slice(-10),
        health: _health,
        version: '5.0.0',
        loadedModules: Object.keys(_loadedModules).filter(function(k) {
            return _loadedModules[k].loaded;
        }),
        missingModules: _missingModules.slice()
    };
};

// ============================================================
// 启动
// ============================================================
async function boot() {
    console.log("🚀 Loader V5.0 starting (auto-detecting path)");
    console.log("📂 Base path:", BASE_PATH);
    console.log("📦 Loading " + CORE_ENGINES.length + " core modules...");

    var startTime = Date.now();
    _bootTimeline.push({ event: 'boot_start', time: startTime });

    var results = await Promise.all(CORE_ENGINES.map(function(src) {
        return loadScript(src);
    }));

    var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
    var missing = results.filter(function(r) { return r.status === "missing"; });

    var elapsed = Date.now() - startTime;
    _bootTimeline.push({ event: 'boot_complete', time: Date.now() });

    console.log("✅ " + loaded.length + "/" + CORE_ENGINES.length + " core modules loaded (" + elapsed + "ms)");

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

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: {
                boot: window.__ENGINE_STATUS__,
                timestamp: Date.now()
            }
        }));
        console.log("✅ System ready (" + elapsed + "ms)");
    }, 200);
}

// ============================================================
// 自动启动
// ============================================================
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V5.0 ready (auto-detecting path)");
