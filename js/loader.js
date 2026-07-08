window.LawAIApp = window.LawAIApp || {};

// ===========================================
// 核心引擎（必须优先加载）
// ===========================================
var CORE_ENGINES = [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js",
    "progressEngine.js",  // ← 新增！SystemComposer 依赖它
    "systemComposer.js",
    "app.js"
];

// ===========================================
// 加载脚本
// ===========================================
function loadScript(src) {
    return new Promise(function(resolve) {
        var existing = document.querySelector('script[src="js/' + src + '"]');
        if (existing) {
            resolve({ file: src, status: "ok", cached: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "js/" + src;

        script.onload = function() {
            resolve({ file: src, status: "ok" });
        };

        script.onerror = function() {
            console.warn("⚠️ Failed to load:", src);
            resolve({ file: src, status: "missing" });
        };

        document.head.appendChild(script);
    });
}

// ===========================================
// 按需加载模块
// ===========================================
LawAIApp.require = function(moduleName) {
    var fileName = moduleName + '.js';
    return loadScript(fileName);
};

// ===========================================
// 启动
// ===========================================
async function boot() {
    console.log("🚀 Loader V4.2 starting (core + progress)");
    console.log("📦 Loading " + CORE_ENGINES.length + " core modules...");

    var results = await Promise.all(CORE_ENGINES.map(function(src) {
        return loadScript(src);
    }));

    var loaded = results.filter(function(r) { return r.status === "ok" || r.status === "cached"; });
    var missing = results.filter(function(r) { return r.status === "missing"; });

    console.log("✅ " + loaded.length + "/" + CORE_ENGINES.length + " core modules loaded");

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
        console.log("✅ System ready");
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

console.log("🚀 Loader V4.2 ready");
