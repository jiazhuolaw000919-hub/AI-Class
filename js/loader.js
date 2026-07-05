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
  safeMode: false,
  active: []   // 🔥 NEW: runtime active engines
};

const CRITICAL_ENGINES = [
  "profileEngine.js",
  "levelEngine.js",
  "experienceEngine.js",
  "learningIntelligence.js"
];

/**
 * =========================
 * ENGINE ACTIVATION LAYER (🔥 NEW CORE FIX)
 * =========================
 */
function activateEngine(name, engine) {
  if (!engine) return;

  try {
    // init lifecycle
    if (typeof engine.init === "function") {
      engine.init();
    }

    // start lifecycle (optional)
    if (typeof engine.start === "function") {
      engine.start();
    }

    window.__ENGINE_STATUS__.active.push(name);

    console.log(`⚡ activated: ${name}`);
  } catch (e) {
    console.warn(`⚠️ activation failed: ${name}`, e);
  }
}

/**
 * =========================
 * STUB ENGINE
 * =========================
 */
function createStub(name) {
  const stub = {
    __stub: true,
    name,
    init() {
      console.warn(`⚠️ stub running: ${name}`);
    }
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

      // register
      if (engine) {
        window.LawAIApp.EngineRegistry?.register?.(name, engine);

        // 🔥 NEW: AUTO ACTIVATE
        activateEngine(name, engine);
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
 * BOOT SEQUENCE V3.9.7
 * =========================
 */
async function boot() {
  console.log("🚀 Loader V3.9.7 starting");

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

  // 🔥 CRITICAL FIX: expose full runtime state
  window.LawAIApp.bootStatus = boot;

  console.log("📊 BOOT REPORT");
  console.table(boot);

  // SYSTEM READY
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("SYSTEM_READY", {
        detail: {
          boot,
          active: boot.active
        }
      })
    );
  }, 0);

  // orchestrator hook
  setTimeout(() => {
    window.LawAIApp?.SystemOrchestrator?.init?.();
  }, 50);
}

// 🔥 V3.9.8 UI ACTIVATION HOOK
setTimeout(() => {
  if (window.LawAIApp?.SystemComposer?.init) {
    window.LawAIApp.SystemComposer.init(window.__ENGINE_STATUS__);
  }
}, 50);

// 🔥 V3.9.9 SELF HEALING START
if (window.LawAIApp?.SelfHealingSystem?.init) {
  window.LawAIApp.SelfHealingSystem.init();
}

if (window.LawAIApp?.EngineActivationSystem?.init) {
  setTimeout(() => window.LawAIApp.EngineActivationSystem.init(), 100);
}

if (window.LawAIApp?.SystemOrchestrator?.init) {
  setTimeout(() => {
    window.LawAIApp.SystemOrchestrator.init();
  }, 50);
}

boot();

