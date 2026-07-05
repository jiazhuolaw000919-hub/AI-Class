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
 * SAFE SCRIPT LOADER
 * =========================
 */
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/" + src;

    script.onload = () => {
      console.log(`✅ loaded: ${src}`);

      // 🔥 V3 ADDITION: auto-register if engine exposes itself
      try {
        const engineName = src.replace(".js", "");

        if (window.LawAIApp?.EngineRegistry?.register) {
          const maybeEngine = window.LawAIApp[engineName];

          if (maybeEngine) {
            window.LawAIApp.EngineRegistry.register(engineName, maybeEngine);
          }
        }
      } catch (e) {
        console.warn(`⚠️ registry hook failed: ${src}`, e);
      }

      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      console.warn(`⚠️ missing: ${src}`);
      resolve({ file: src, status: "missing" });
    };

    document.head.appendChild(script);
  });
}

/**
 * =========================
 * LOAD GROUP (UNCHANGED LOGIC)
 * =========================
 */
async function loadGroup(name, list) {
  console.log(`\n📦 Loading group: ${name}`);

  const results = [];

  for (const file of list) {
    const res = await loadScript(file);
    results.push(res);
  }

  return results;
}

/**
 * =========================
 * BOOT SEQUENCE
 * =========================
 */
async function boot() {
  console.log("🚀 LawAI Loader V3 starting...");

  window.__ENGINE_STATUS__ = {
    loaded: [],
    missing: []
  };

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

  console.log("\n📊 BOOT REPORT:");
  console.log("Loaded:", window.__ENGINE_STATUS__.loaded.length);
  console.log("Missing:", window.__ENGINE_STATUS__.missing.length);
  console.table(window.__ENGINE_STATUS__);

  // 🔥 V3 UPGRADE: safe readiness signal
  window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

  window.dispatchEvent(new Event("LAW_APP_READY"));
}

boot();

/**
 * =========================
 * LEGACY COMPAT FUNCTION
 * =========================
 * (KEEP THIS so old engines won't break)
 */
async function loadEngine(file, name) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "js/" + file;

    s.onload = () => {
      console.log(`✅ loaded: ${file}`);
      resolve(true);
    };

    s.onerror = () => {
      console.warn(`⚠️ missing: ${file}`);
      resolve(false);
    };

    document.head.appendChild(s);
  });
}
