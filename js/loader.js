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
// 获取当前脚本的目录路径
// ===========================================
function getBasePath() {
    // 获取当前执行脚本的路径
    var scripts = document.getElementsByTagName('script');
    var currentScript = scripts[scripts.length - 1];
    var src = currentScript.src || '';
    
    // 如果 src 包含 /js/loader.js，提取基础路径
    var match = src.match(/^(.*)\/js\/loader\.js/);
    if (match) {
        return match[1] + '/js/';
    }
    
    // 备用：使用当前页面的路径
    var path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '/js/';
    }
    return 'js/';
}

var BASE_PATH = getBasePath();
console.log('📂 Loader base path:', BASE_PATH);

// ===========================================
// 加载脚本
// ===========================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok", cached: true });
    }

    if (_loadingPromises[src]) {
        return _loadingPromises[src];
    }

    var promise = new Promise(function(resolve) {
        var path = BASE_PATH + src;
        
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
            
            // 尝试备用路径
            var fallbackPaths = [
                '/js/' + src,
                '../js/' + src,
                'js/' + src
            ];
            
            var tried = 0;
            tryNext(fallbackPaths, tried, resolve, src);
        };

        document.head.appendChild(script);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryNext(paths, index, resolve, src) {
    if (index >= paths.length) {
        resolve({ file: src, status: "missing" });
        return;
    }
    
    var path = paths[index];
    console.log('🔄 Trying fallback:', path);
    
    var script = document.createElement("script");
    script.src = path;
    script.onload = function() {
        _loadCache[src] = true;
        resolve({ file: src, status: "ok" });
    };
    script.onerror = function() {
        tryNext(paths, index + 1, resolve, src);
    };
    document.head.appendChild(script);
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
    console.log("🚀 Loader V4.6 starting (auto-detecting path)");
    console.log("📂 Base path:", BASE_PATH);
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

console.log("🚀 Loader V4.6 ready (auto-detecting path)");
