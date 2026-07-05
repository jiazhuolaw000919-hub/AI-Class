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
 * BOOT STATE
 * =========================
 */
window.__ENGINE_STATUS__ = {
  loaded: [],
  missing: [],
  total: 0,
  booted: false,
  safeMode: false
};

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
      const name = src.replace(".js", "");
      const engine = window.LawAIApp?.[name];

      if (engine) {
        window.LawAIApp.EngineRegistry?.register?.(name, engine);
      }

      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      const name = src.replace(".js", "");
      createStub(name);
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
 * BOOT SEQUENCE V3.9
 * =========================
 */
async function boot() {
  console.log("🚀 Loader V3.9 starting");

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

  const boot = window.__ENGINE_STATUS__;

  boot.total = boot.loaded.length + boot.missing.length;
  boot.booted = true;

  boot.safeMode = boot.missing.some(f =>
    CRITICAL_ENGINES.includes(f)
  );

  console.log("📊 BOOT REPORT");
  console.table(boot);

  /**
   * 🔥 V3.9 FIX: CENTRAL STATE SYNC
   */
  if (window.LawAIApp?.SystemState?.setBoot) {
    window.LawAIApp.SystemState.setBoot(boot);
  } else {
    window.LawAIApp.bootStatus = boot;
  }

  const payload = {
    boot,
    timestamp: Date.now(),
    safeMode: boot.safeMode
  };

  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("SYSTEM_READY", { detail: payload })
    );
  }, 0);

  if (window.LawAIApp?.SystemOrchestrator?.init) {
    setTimeout(() => window.LawAIApp.SystemOrchestrator.init(), 50);
  }
}

if (window.LawAIApp?.SelfHealingSystem?.init) {
  window.LawAIApp.SelfHealingSystem.init();
}

boot();

