// packEngine.js
LawAIApp.PackEngine = (function() {
  // 初始化：确保内置包已安装（如果尚未注册）
  function seedBuiltInPacks() {
    const builtInPackIds = ['pack_ai_foundation'];
    builtInPackIds.forEach(packId => {
      if (!LawAIApp.PackRegistry.isInstalled(packId)) {
        const pack = LawAIApp.PackManager.getAvailablePacks().find(p => p.packId === packId);
        if (pack) LawAIApp.PackInstaller.install(pack);
      }
    });
  }

  // 监听应用启动
  LawAIApp.EventBus.on('AppReady', seedBuiltInPacks); // 假设有 AppReady 事件，否则直接在 init 调用
  seedBuiltInPacks(); // 直接执行一次

  return {
    getAvailable: LawAIApp.PackManager.getAvailablePacks,
    install: LawAIApp.PackManager.installPack,
    uninstall: LawAIApp.PackManager.uninstallPack,
    update: LawAIApp.PackManager.updatePack,
    validate: LawAIApp.PackValidator.validateManifest
  };
})();
