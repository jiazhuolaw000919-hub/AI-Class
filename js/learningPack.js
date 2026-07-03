// learningPack.js
LawAIApp.LearningPack = {
  // 安装一个学习包（通过 academyId）
  async install(academyId) {
    return await LawAIApp.LPSLoader.installPack(academyId);
  },

  // 获取已安装的所有包
  getInstalledPacks() {
    return LawAIApp.LPSRegistry.getInstalledPacks();
  },

  // 获取某个包的详细信息
  getPack(packId) {
    return LawAIApp.LPSRegistry.getInstalledPacks().find(p => p.packId === packId) || null;
  },

  // 卸载包
  uninstall(packId) {
    LawAIApp.LPSRegistry.uninstall(packId);
  },

  // 验证一个包定义
  validate(manifest) {
    return LawAIApp.LPSValidator.validate(manifest);
  },

  // 自动安装默认 AI 学习包
  async installDefaultPack() {
    return await this.install('academy_ai');
  }
};

// 自动在初始化时安装默认包（如果尚未安装）
(async function autoInstallDefaultPack() {
  if (!LawAIApp.LPSRegistry.isInstalled('academy_ai')) {
    const result = await LawAIApp.LearningPack.installDefaultPack();
    if (result.success) {
      console.log('✅ Default AI Learning Pack installed via LPS');
    } else {
      console.warn('⚠️ Failed to install default pack:', result.error || result.errors);
    }
  }
})();
