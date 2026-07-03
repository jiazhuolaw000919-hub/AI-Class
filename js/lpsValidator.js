// lpsValidator.js
LawAIApp.LPSValidator = {
  // 验证包清单
  validate(manifest) {
    const errors = [];
    if (!manifest.packId) errors.push('Missing packId');
    if (!manifest.academyId) errors.push('Missing academyId');
    if (!manifest.title) errors.push('Missing title');
    if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) errors.push('Invalid version format');
    // 检查依赖是否已安装
    if (manifest.dependencies && manifest.dependencies.length > 0) {
      const installedPacks = LawAIApp.StorageEngine.get('installed_packs', []); // 使用 Phase 29 的存储键，保持一致
      manifest.dependencies.forEach(depId => {
        if (!installedPacks.find(p => p.packId === depId)) {
          errors.push(`Missing dependency: ${depId}`);
        }
      });
    }
    return errors;
  },

  // 验证内容索引中的引用完整性
  validateContent(manifest, academyData, courseData, lessonData) {
    const errors = [];
    if (manifest.contentIndex.courses) {
      manifest.contentIndex.courses.forEach(cid => {
        if (!courseData.getById(cid)) errors.push(`Course ${cid} not found`);
      });
    }
    if (manifest.contentIndex.lessons) {
      manifest.contentIndex.lessons.forEach(lid => {
        const day = parseInt(lid.split('-')[1]);
        if (!lessonData.getLessonByDay(day)) errors.push(`Lesson ${lid} not found`);
      });
    }
    return errors;
  }
};
