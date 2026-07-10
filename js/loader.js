// ================================================================
// loader.js – V5.2.0 - Startup Pipeline (Phase 0.2)
// 启动顺序：Stage 1 Critical → Stage 2 UX → Stage 3 Intelligence → Stage 4 Background
// ================================================================

window.LawAIApp = window.LawAIApp || {};

// ============================================================
// 🚀 STAGE 1: CRITICAL — 立即加载，阻塞渲染（但非常轻量）
// ============================================================
var CRITICAL_ENGINES = [
    "storageEngine.js",      // 存储
    "eventBus.js",           // 事件通信
    "themeEngine.js",        // 主题（立即应用）
    "systemComposer.js",     // UI 渲染
    "app.js"                 // 应用编排
];

// ============================================================
// 📊 STAGE 2: USER EXPERIENCE — 首屏渲染后加载
// ============================================================
var UX_ENGINES = [
    "progressEngine.js",     // 进度数据
    "experienceEngine.js",   // XP 和里程碑
    "recommendationEngine.js" // 推荐
];

// ============================================================
// 🧠 STAGE 3: INTELLIGENCE — 延迟加载
// ============================================================
var INTELLIGENCE_ENGINES = [
    "lessonEngine.js",       // 课程数据
    "memoryEngine.js",       // 复习调度
    "practiceEngine.js",     // 练习引擎
    "reflectionEngine.js",   // 反思引擎
    "aimentorEngine.js",     // AI 导师
    "schoolEngine.js"        // 多学院
];

// ============================================================
// 🔄 STAGE 4: BACKGROUND — 空闲时加载
// ============================================================
var BACKGROUND_ENGINES = [
    "academicRecordEngine.js", // 学术记录
    "certificateEngine.js",    // 证书
    "careerEngine.js",         // 职业发展
    "communityEngine.js",      // 社区
    "executionEngine.js"       // 执行引擎（最后加载）
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
var _stageStatus = {
    critical: false,
    ux: false,
    intelligence: false,
    background: false
};

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
// 🚀 按阶段启动
// ============================================================

// Stage 1: Critical — 立即加载
async function loadStage1() {
    console.log('🟢 Stage 1: Loading critical engines...');
    var startTime = Date.now();
    var results = await Promise.all(CRITICAL_ENGINES.map(function(src) {
        return loadScript(src);
    }));
    var elapsed = Date.now() - startTime;
    var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
    var missing = results.filter(function(r) { return r.status === "missing"; });
    console.log('✅ Stage 1 complete: ' + loaded.length + '/' + CRITICAL_ENGINES.length + ' loaded (' + elapsed + 'ms)');
    _stageStatus.critical = true;
    return results;
}

// Stage 2: UX — 延迟 100ms 后加载
async function loadStage2() {
    console.log('🟡 Stage 2: Loading UX engines...');
    return new Promise(function(resolve) {
        setTimeout(function() {
            Promise.all(UX_ENGINES.map(function(src) {
                return loadScript(src);
            })).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
                var missing = results.filter(function(r) { return r.status === "missing"; });
                console.log('✅ Stage 2 complete: ' + loaded.length + '/' + UX_ENGINES.length + ' loaded');
                _stageStatus.ux = true;
                resolve(results);
            });
        }, 100);
    });
}

// Stage 3: Intelligence — 延迟 500ms 后加载
async function loadStage3() {
    console.log('🔵 Stage 3: Loading Intelligence engines...');
    return new Promise(function(resolve) {
        setTimeout(function() {
            Promise.all(INTELLIGENCE_ENGINES.map(function(src) {
                return loadScript(src);
            })).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
                var missing = results.filter(function(r) { return r.status === "missing"; });
                console.log('✅ Stage 3 complete: ' + loaded.length + '/' + INTELLIGENCE_ENGINES.length + ' loaded');
                _stageStatus.intelligence = true;
                resolve(results);
            });
        }, 500);
    });
}

// Stage 4: Background — 延迟 1000ms 后加载
async function loadStage4() {
    console.log('🟣 Stage 4: Loading Background engines...');
    return new Promise(function(resolve) {
        setTimeout(function() {
            Promise.all(BACKGROUND_ENGINES.map(function(src) {
                return loadScript(src);
            })).then(function(results) {
                var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
                var missing = results.filter(function(r) { return r.status === "missing"; });
                console.log('✅ Stage 4 complete: ' + loaded.length + '/' + BACKGROUND_ENGINES.length + ' loaded');
                _stageStatus.background = true;
                resolve(results);
            });
        }, 1000);
    });
}

// ============================================================
// 主启动
// ============================================================
async function boot() {
    console.log("🚀 Loader V5.2.0 starting (Startup Pipeline)");
    console.log("📂 Base path:", BASE_PATH);

    _bootTimeline.push({ event: 'boot_start', time: Date.now() });

    // Stage 1: Critical（立即执行）
    await loadStage1();

    // 触发 SYSTEM_READY（让 App 和 Router 知道可以渲染了）
    window.__ENGINE_STATUS__ = {
        loaded: [],
        missing: [],
        active: [],
        booted: true,
        safeMode: false,
        timeline: _bootTimeline,
        health: _health,
        stages: _stageStatus
    };
    window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: {
                boot: window.__ENGINE_STATUS__,
                timestamp: Date.now()
            }
        }));
        console.log("✅ System ready for rendering");
    }, 50);

    // Stage 2: UX（延迟 100ms）
    setTimeout(function() {
        loadStage2();
    }, 100);

    // Stage 3: Intelligence（延迟 500ms）
    setTimeout(function() {
        loadStage3();
    }, 500);

    // Stage 4: Background（延迟 1000ms）
    setTimeout(function() {
        loadStage4();
    }, 1000);

    console.log("🚀 Loader pipeline started");
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

console.log("🚀 Loader V5.2.0 ready (Startup Pipeline)");
