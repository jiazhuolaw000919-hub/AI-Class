window.LawAIApp = window.LawAIApp || {};

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

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/" + src;

    script.onload = () => {
      console.log(`✅ loaded: ${src}`);
      resolve({ file: src, status: "ok" });
    };

    script.onerror = () => {
      console.warn(`⚠️ missing: ${src}`);
      resolve({ file: src, status: "missing" });
    };

    document.head.appendChild(script);
  });
}

async function loadGroup(name, list) {
  console.log(`\n📦 Loading group: ${name}`);

  const results = [];

  for (const file of list) {
    const res = await loadScript(file);
    results.push(res);
  }

  return results;
}

async function boot() {
  console.log("🚀 LawAI Loader V2 starting...");

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

  window.dispatchEvent(new Event("LAW_APP_READY"));
}

boot();
