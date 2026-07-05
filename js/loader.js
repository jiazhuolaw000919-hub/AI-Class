window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * ENGINE REGISTRY
 * =========================
 */
const ENGINE_REGISTRY = {
  core: ["storageEngine.js", "eventBus.js", "profileEngine.js"],
  learning: ["levelEngine.js", "experienceEngine.js", "learningIntelligence.js"],
  workspace: [
    "workspaceEngine.js",
    "workspaceState.js",
    "workspaceLayout.js",
    "workspaceWidgets.js",
    "workspaceSearch.js"
  ],
  optional: [
    "motionSystem.js",
    "celebrationEngine.js",
    "themeExperience.js",
    "ambientEngine.js",
    "knowledgeNetwork.js",
    "kreEngine.js"
  ]
};

/**
 * =========================
 * BOOT STATE (V3.8 CLEAN)
 * =========================
 */
window.__ENGINE_STATUS__ = {
  loaded: [],
  missing: [],
  total: 0,
  booted: false,
  safeMode: false
};

/**
 * =========================
 * CRITICAL CHECK
 * =========================
 */
const CRITICAL_ENGINES = [
  "profileEngine.js",
  "levelEngine.js",
  "experienceEngine.js",
  "learningIntelligence.js"
];

/**
 * =========================
 * STUB ENGINE
 * =========================
 */
function createStub(name) {
  console.warn(`🧪 Stub engine created: ${name}`);

  const stub = {
    __stub: true,
    name,
    init() {}
  };

  window.LawAIApp?.EngineRegistry?.register?.(name, stub);
}

/**
 * =========================
 * LOAD SCRIPT
 * =========================
 */
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/" + src;

    script.onload = () => {
      console.log("✅ loaded:", src);

      const name = src.replace(".js", "");
      const engine = window.LawAIApp?.[name];

      if (engine) {
        window.LawAIApp.EngineRegistry?.register?.(name, engine);
      }

      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      console.warn("⚠️ missing:", src);
      createStub(src.replace(".js", ""));
      resolve({ file: src, status: "missing" });
    };

    document.head.appendChild(script);
  });
}

/**
 * =========================
 * LOAD GROUP
 * =========================
 */
async function loadGroup(name, list) {
  console.log(`📦 ${name}`);
  return Promise.all(list.map(loadScript));
}

/**
 * =========================
 * BOOT SEQUENCE V3.8
 * =========================
 */
async function boot() {
  console.log("🚀 Loader V3.8 CLEAN START");

  for (const [group, files] of Object.entries(ENGINE_REGISTRY)) {
    const results = await loadGroup(group, files);

    results.forEach(r => {
      if (r.status === "ok") {
        window.__ENGINE_STATUS__.loaded.push(r.file);
      } else {
        window.__ENGINE_STATUS__.missing.push(r.file);
      }
    });
  }

  window.__ENGINE_STATUS__.total =
    window.__ENGINE_STATUS__.loaded.length +
    window.__ENGINE_STATUS__.missing.length;

  window.__ENGINE_STATUS__.booted = true;

  // =========================
  // SAFE MODE LOGIC (FIXED)
  // =========================
  window.__ENGINE_STATUS__.safeMode =
    window.__ENGINE_STATUS__.missing.some(f =>
      CRITICAL_ENGINES.includes(f)
    );

  window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

  console.log("📊 BOOT REPORT");
  console.table(window.__ENGINE_STATUS__);

  /**
   * =========================
   * ORCHESTRATOR SAFE HOOK (FIXED)
   * =========================
   */
  const start = () => {
    window.dispatchEvent(new Event("SYSTEM_READY"));
    window.dispatchEvent(new Event("LAW_APP_READY"));
  };

  setTimeout(start, 0);

  // IMPORTANT: correct orchestrator hook
  if (window.LawAIApp?.SystemOrchestrator?.init) {
    setTimeout(() => window.LawAIApp.SystemOrchestrator.init(), 50);
  }
}

boot();
