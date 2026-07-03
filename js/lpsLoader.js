// lpsLoader.js
LawAIApp.LPSLoader = {
  // 从本地文件系统或 LocalStorage 加载包
  async loadPack(academyId) {
    // 复用已有的 ContentLoader 获取原始数据
    let packData = null;
    try {
      const fetched = await LawAIApp.ContentLoader.fetchPack(academyId);
      if (fetched && fetched.manifest) {
        packData = fetched.manifest;
        // 合并 academy 和 courses 等
        packData.academyId = academyId;
        packData.courses = fetched.courses ? fetched.courses.map(c => c.id) : [];
        packData.lessons = fetched.lessons ? fetched.lessons.map(l => l.lessonId) : [];
      }
    } catch (e) { /* 忽略 */ }

    // 如果 fetch 失败，尝试从 LocalStorage 读取包缓存
    if (!packData) {
      packData = LawAIApp.ContentLoader.loadFromLocalStorage(academyId);
      if (packData && packData.manifest) {
        const m = packData.manifest;
        m.academyId = academyId;
        packData = m;
      }
    }

    if (!packData) return null;

    const manifest = LawAIApp.ManifestReader.parse(packData);
    return manifest;
  },

  // 加载并验证，成功则注册
  async installPack(academyId) {
    const manifest = await this.loadPack(academyId);
    if (!manifest) return { success: false, error: 'Pack not found' };

    const errors = LawAIApp.LPSValidator.validate(manifest);
    if (errors.length > 0) {
      LawAIApp.EventBus.emit('PackValidated', { packId: manifest.packId, errors });
      return { success: false, errors };
    }

    LawAIApp.LPSRegistry.register(manifest);
    LawAIApp.EventBus.emit('PackLoaded', { packId: manifest.packId });
    return { success: true, manifest };
  }
};
