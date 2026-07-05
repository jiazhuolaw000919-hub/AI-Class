window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * ENGINE REGISTRY (UNCHANGED)
 * =========================
 */
const ENGINE_REGISTRY = {
  core: [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js"
  ],

  learning: [
    "levelEngine.js",
    "experienceEngine.js",
    "learningIntelligence.js"
  ],

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
 * ENGINE HEALTH (V3.2 + V3.3)
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
 * AUTO HEAL (V3.3)
 * =========================
 */
function createStub(name) {
  console.warn(`🧪 Auto-stub created: ${name}`);

  const stub = {
    __stub: true,
    name,
    init() {
      console.log(`⚠️ Stub running: ${name}`);
    }
  };

  if (window.LawAIApp.EngineRegistry) {
    window.LawAIApp.EngineRegistry.register(name, stub);
  }
}

/**
 * =========================
 * DASHBOARD (V3.2)
 * =========================
 */
function renderDashboard() {
  const s = window.__ENGINE_STATUS__;
  const total = s.loaded.length + s.missing.length;
  const health = total ? (s.loaded.length / total * 100).toFixed(1) : 0;

  console.log("\n🧠 ENGINE DASHBOARD");
  console.log("===================");
  console.log("✔ Loaded:", s.loaded.length);
  console.log("❌ Missing:", s.missing.length);
  console.log("📊 Health:", health + "%");
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
      console.log("✅", src);

      try {
        const name = src.replace(".js", "");

        if (window.LawAIApp?.EngineRegistry?.register &&
            window.LawAIApp[name]) {
          window.LawAIApp.EngineRegistry.register(name, window.LawAIApp[name]);
        }

      } catch (e) {}

      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      console.warn("⚠️ missing:", src);

      // 🔥 V3.3 AUTO HEAL
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
  console.log(`\n📦 ${name}`);

  const res = [];

  for (const f of list) {
    res.push(await loadScript(f));
  }

  return res;
}

/**
 * =========================
 * BOOT (V3.2 + V3.3 SAFE)
 * =========================
 */
async function boot() {
  console.log("🚀 Loader V3.2 + V3.3");

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

  window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

  // 🔥 V3.2 DASHBOARD
  renderDashboard();

  // 🧠 SAFE EVENT START
  const startApp = () => {
    window.dispatchEvent(new Event("LAW_APP_READY"));
  };

  if (window.LawAIApp?.EventBus) {
    startApp();
  } else {
    console.warn("⚠️ EventBus missing → delayed boot");
    setTimeout(startApp, 200);
  }
}

boot();

/**
 * =========================
 * LEGACY (KEEP SAFE)
 * =========================
 */
async function loadEngine(file, name) {
  return new Promise((r) => {
    const s = document.createElement("script");
    s.src = "js/" + file;

    s.onload = () => r(true);
    s.onerror = () => r(false);
    document.head.appendChild(s);
  });
}
