window.LawAIApp = window.LawAIApp || {};

const ENGINE_LIST = [
  "levelEngine.js",
  "experienceEngine.js",
  "learningIntelligence.js",

  "workspaceEngine.js",
  "storageEngine.js",
  "profileEngine.js",
  "lessonEngine.js",
  "eventBus.js"
];

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "js/" + src;

    s.onload = () => {
      console.log("✅ loaded:", src);
      resolve(true);
    };

    s.onerror = () => {
      console.warn("⚠️ missing:", src);
      resolve(false); // 不 crash
    };

    document.head.appendChild(s);
  });
}

async function boot() {
  console.log("🚀 Loader starting...");

  for (const file of ENGINE_LIST) {
    await loadScript(file);
  }

  console.log("✅ Boot complete");
}

boot();
