// ================================================================
// loader.js – V5.3.0 - Simplified Startup (Phase 0.3)
// 精简阶段结构，减少冗余日志
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
    ],
    intelligence: [
        "lessonEngine.js",
        "memoryEngine.js",
        "practiceEngine.js",
        "reflectionEngine.js",
        "aimentorEngine.js",
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
// 加载脚本（精简）
// ============================================================
function loadScript(src) {
    if (_loadCache[src]) {
        return Promise.resolve({ file: src, status: "ok" });
    }
    if (_loadingPromises[src]) {
        return _loadingPromises[src];
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
        tryLoad(unique, 0, resolve, src);
    });

    _loadingPromises[src] = promise;
    return promise;
}

function tryLoad(paths, index, resolve, src) {
    if (index >= paths.length) {
        resolve({ file: src, status: "missing" });
        return;
    }
    var script = document.createElement("script");
    script.src = paths[index];
    script.onload = function() {
        _loadCache[src] = true;
        _loadedModules[src] = true;
        resolve({ file: src, status: "ok" });
    };
    script.onerror = function() {
        tryLoad(paths, index + 1, resolve, src);
    };
    document.head.appendChild(script);
}

// ============================================================
// 按阶段加载
// ============================================================
function loadStage(name, files, delay) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            Promise.all(files.map(loadScript)).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok"; }).length;
                console.log('✅ Stage ' + name + ': ' + loaded + '/' + files.length + ' loaded');
                resolve(results);
            });
        }, delay || 0);
    });
}

// ============================================================
// 主启动
// ============================================================
async function boot() {
    console.log("🚀 Loader V5.3.0 starting...");

    // Stage 1: Critical — 立即加载
    var critical = await loadStage('critical', STAGES.critical, 0);

    // 触发 SYSTEM_READY
    var status = {
        loaded: Object.keys(_loadedModules),
        booted: true
    };
    window.LawAIApp.bootStatus = status;
    window.__ENGINE_STATUS__ = status;

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: { boot: status, timestamp: Date.now() }
        }));
        console.log("✅ SYSTEM_READY dispatched");
    }, 50);

    // Stage 2: UX — 100ms
    loadStage('ux', STAGES.ux, 100);

    // Stage 3: Intelligence — 500ms
    loadStage('intelligence', STAGES.intelligence, 500);

    // Stage 4: Background — 1000ms
    loadStage('background', STAGES.background, 1000);

    console.log("🚀 Loader pipeline started");
}

// ============================================================
// 按需加载 API（保留）
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
// 自动启动
// ============================================================
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V5.3.0 ready (simplified)");
