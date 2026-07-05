window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * ENGINE REGISTRY
 * =========================
 */
const ENGINE_REGISTRY = {
  core: ["storageEngine.js", "eventBus.js", "profileEngine.js"],
  learning: ["levelEngine.js", "experienceEngine.js", "learningIntelligence.js"],
  workspace: ["workspaceEngine.js", "workspaceState.js", "workspaceLayout.js", "workspaceWidgets.js", "workspaceSearch.js"],
  optional: ["motionSystem.js", "celebrationEngine.js", "themeExperience.js", "ambientEngine.js", "knowledgeNetwork.js", "kreEngine.js"]
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
  booted: false
};

/**
 * =========================
 * CRITICAL ENGINES (REAL CORE CHECK)
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
 * STUB ENGINE (SAFE FALLBACK)
 * =========================
 */
function createStub(name) {
  console.warn(`🧪 Stub engine created: ${name}`);

  const stub = {
    __stub: true,
    name,
    init() {
      console.log(`⚠️ stub running: ${name}`);
    }
  };

  if (window.LawAIApp?.EngineRegistry?.register) {
    window.LawAIApp.EngineRegistry.register(name, stub);
  }
}

/**
 * =========================
 * LOAD SCRIPT (SAFE)
 * =========================
 */
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/" + src;

    script.onload = () => {
      console.log("✅ loaded:", src);

      const name = src.replace(".js", "");

      try {
        if (window.LawAIApp?.EngineRegistry?.register &&
            window.LawAIApp[name]) {
          window.LawAIApp.EngineRegistry.register(name, window.LawAIApp[name]);
        }
      } catch (e) {
        console.warn("registry error:", name);
      }

      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      console.warn("⚠️ missing:", src);

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

  const res = [];
  for (const f of list) {
    res.push(await loadScript(f));
  }
  return res;
}

/**
 * =========================
 * BOOT FUNCTION
 * =========================
 */
async function boot() {
  console.log("🚀 Loader V3.5.1 starting...");

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

  window.LawAIApp.bootStatus = structuredClone(window.__ENGINE_STATUS__);

  console.log("📊 BOOT REPORT");
  console.table(window.__ENGINE_STATUS__);

  /**
   * =========================
   * SAFE MODE CHECK (NEW FIX)
   * =========================
   */
  const isCriticalMissing = window.__ENGINE_STATUS__.missing
    .some(f => CRITICAL_ENGINES.includes(f));

  window.LawAIApp.safeMode = isCriticalMissing;

  if (isCriticalMissing) {
    console.warn("🚨 SAFE MODE ACTIVE - Missing core engines");
  }

  /**
   * =========================
   * BOOT GATE (FIXED ORDER)
   * =========================
   */
  const startApp = () => {
    window.dispatchEvent(new Event("LAW_APP_READY"));
  };

  // ensure DOM + scripts settle
  setTimeout(startApp, 0);
}

boot();
