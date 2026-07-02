// packValidator.js
LawAIApp.PackValidator = {
  // 验证包基本结构
  validateManifest(pack) {
    const errors = [];
    const required = ['packId','title','description','version','author','academyIds','courseIds','lessonIds'];
    required.forEach(field => {
      if (!pack[field]) errors.push(`Missing required field: ${field}`);
    });
    if (pack.version && !/^\d+\.\d+\.\d+$/.test(pack.version)) errors.push('Invalid version format');
    if (pack.academyIds && !Array.isArray(pack.academyIds)) errors.push('academyIds must be an array');
    return errors;
  },

  // 检查依赖（requiredPacks）是否满足
  checkDependencies(pack, installedPackIds) {
    const missing = [];
    if (pack.requiredPacks) {
      pack.requiredPacks.forEach(reqId => {
        if (!installedPackIds.includes(reqId)) missing.push(reqId);
      });
    }
    return missing;
  },

  // 检查包内引用的 Academy/Course/Lesson ID 是否存在
  validateReferences(pack, academyData, courseData, lessonData) {
    const errors = [];
    if (pack.academyIds) {
      pack.academyIds.forEach(aid => {
        if (!academyData.getAcademyById(aid)) errors.push(`Academy ${aid} not found`);
      });
    }
    // 类似检查 courseIds, lessonIds (略)
    return errors;
  }
};
