// packManager.js
LawAIApp.PackManager = {
  // 获取所有可用包（内置 + 已安装）
  getAvailablePacks() {
    const builtIn = [
      {
        packId: 'pack_ai_foundation',
        title: 'AI Foundation Pack',
        description: 'Core AI learning path.',
        version: '1.0.0',
        author: 'Law Academy',
        academyIds: ['academy_ai'],
        courseIds: ['course_ai_foundation','course_prompt_engineering'],
        moduleIds: [],
        lessonIds: [], // 自动从 course 推断
        resourceIds: [],
        theme: null,
        icon: '🤖',
        language: 'English',
        license: 'Internal',
        status: 'active',
        type: 'foundation'
      }
    ];
    const installed = LawAIApp.PackRegistry.getInstalled();
    // 合并，已安装的优先显示
    return builtIn.concat(installed.filter(p => !builtIn.find(b => b.packId === p.packId)));
  },

  // 安装一个新包
  installPack(packDef) {
    return LawAIApp.PackInstaller.install(packDef);
  },

  // 卸载
  uninstallPack(packId) {
    return LawAIApp.PackInstaller.uninstall(packId);
  },

  // 更新包（重新安装）
  updatePack(packId, newPackDef) {
    this.uninstallPack(packId);
    return this.installPack(newPackDef);
  }
};
