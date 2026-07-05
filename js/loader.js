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
 * BOOT STATE (NEW - V3.1)
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
 * SAFE SCRIPT LOADER
 * =========================
 */
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/" + src;

    script.onload = () => {
      console.log(`✅ loaded: ${src}`);

      // 🔥 SAFE AUTO REGISTER (FIXED)
      try {
        const engineName = src.replace(".js", "");

        if (
          window.LawAIApp?.EngineRegistry?.register &&
          window.LawAIApp[engineName]
        ) {
          window.LawAIApp.EngineRegistry.register(
            engineName,
            window.LawAIApp[engineName]
          );
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
 * LOAD GROUP
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
 * SAFE BOOT SEQUENCE (FIXED)
 * =========================
 */
async function boot() {
  console.log("🚀 LawAI Loader V3.1 starting...");

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

  console.log("\n📊 BOOT REPORT:");
  console.table(window.__ENGINE_STATUS__);

  // 🔥 NEW: mark registry ready BEFORE event
  window.__ENGINE_STATUS__.booted = true;

  window.LawAIApp.bootStatus = window.__ENGINE_STATUS__;

  // 🧠 SAFETY CHECK BEFORE STARTING APP
  const BusReady = !!window.LawAIApp?.EventBus;

  if (!BusReady) {
    console.warn("⚠️ EventBus not ready yet - delaying app start");
    setTimeout(() => {
      window.dispatchEvent(new Event("LAW_APP_READY"));
    }, 200);
  } else {
    window.dispatchEvent(new Event("LAW_APP_READY"));
  }
}

boot();

/**
 * =========================
 * LEGACY COMPAT (UNCHANGED)
 * =========================
 */
async function loadEngine(file, name) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "js/" + file;

    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}
