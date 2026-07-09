window.LawAIApp = window.LawAIApp || {};

// ===========================================
// 核心引擎（必须优先加载）
// ===========================================
var CORE_ENGINES = [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js",
    "progressEngine.js",
    "systemComposer.js",
    "app.js"
];

// ===========================================
// 加载缓存
// ===========================================
var _loadCache = {};
var _loadingPromises = {};

// ===========================================
// 加载脚本（使用绝对路径）
// ===========================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok", cached: true });
    }

    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var promise = new Promise(function(resolve) {
        // 直接使用绝对路径 /js/
        var path = '/js/' + src;
        
        var existing = document.querySelector('script[src="' + path + '"]');
        if (existing) {
            _loadCache[src] = true;
            resolve({ file: src, status: "ok", cached: true });
            return;
        }

        var script = document.createElement("script");
        script.src = path;

        script.onload = function() {
            _loadCache[src] = true;
            resolve({ file: src, status: "ok" });
        };

        script.onerror = function() {
            console.warn("⚠️ Failed to load:", src, "from", path);
            resolve({ file: src, status: "missing" });
        };

        document.head.appendChild(script);
    });

    _loadingPromises[src] = promise;
    return promise;
}

// ===========================================
// 按需加载模块
// ===========================================
LawAIApp.require = function(moduleName) {
    var fileName = moduleName + '.js';
    if (_loadCache[fileName]) {
        return Promise.resolve({ file: fileName, status: "ok", cached: true });
    }
    return loadScript(fileName);
};

// ===========================================
// 批量按需加载
// ===========================================
LawAIApp.requireAll = function(moduleNames) {
    return Promise.all(moduleNames.map(function(name) {
        return LawAIApp.require(name);
    }));
};

// ===========================================
// 获取加载状态
// ===========================================
LawAIApp.getLoadStatus = function() {
    return {
        cached: Object.keys(_loadCache),
        loading: Object.keys(_loadingPromises)
    };
};

// ===========================================
// 清除缓存（调试用）
// ===========================================
LawAIApp.clearLoadCache = function() {
    for (var key in _loadCache) {
        delete _loadCache[key];
    }
    for (var key in _loadingPromises) {
        delete _loadingPromises[key];
    }
    console.log('🧹 Load cache cleared');
};

// ===========================================
// 启动
// ===========================================
async function boot() {
    console.log("🚀 Loader V4.5 starting (absolute paths)");
    console.log("📦 Loading " + CORE_ENGINES.length + " core modules...");

    var startTime = Date.now();

    var results = await Promise.all(CORE_ENGINES.map(function(src) {
        return loadScript(src);
    }));

    var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
    var missing = results.filter(function(r) { return r.status === "missing"; });

    var elapsed = Date.now() - startTime;

    console.log("✅ " + loaded.length + "/" + CORE_ENGINES.length + " core modules loaded (" + elapsed + "ms)");

    window.__ENGINE_STATUS__ = {
        loaded: loaded.map(function(r) { return r.file; }),
        missing: missing.map(function(r) { return r.file; }),
        active: [],
        booted: true,
        safeMode: missing.length > 0
    };

    window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

    // 触发系统就绪
    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: {
                boot: window.__ENGINE_STATUS__,
                timestamp: Date.now()
            }
        }));
        console.log("✅ System ready (" + elapsed + "ms)");
        console.log("📌 Other modules load on demand via LawAIApp.require()");
    }, 200);
}

// ===========================================
// 自动启动
// ===========================================
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V4.5 ready (absolute paths)");
