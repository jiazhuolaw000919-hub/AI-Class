window.LawAIApp = window.LawAIApp || {};

LawAIApp.EngineDashboard = {
  render() {
    const status = window.__ENGINE_STATUS__;

    if (!status) return;

    console.log("🧠 ENGINE DASHBOARD");
    console.log("==================");

    console.log("✅ Loaded Engines:");
    status.loaded.forEach(e => console.log("   ✔", e));

    console.log("\n⚠️ Missing Engines:");
    status.missing.forEach(e => console.log("   ❌", e));

    console.log("\n📊 System Health:");
    const health =
      (status.loaded.length / (status.total || 1)) * 100;

    console.log(`   ${health.toFixed(1)}%`);
  }
};
