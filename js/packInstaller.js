// packInstaller.js
LawAIApp.PackInstaller = {
  // 安装一个包（注册 academy、课程等）
  install(pack) {
    // 1. 验证
    const errors = LawAIApp.PackValidator.validateManifest(pack);
    if (errors.length > 0) {
      LawAIApp.EventBus.emit('PackFailed', { packId: pack.packId, errors });
      return { success: false, errors };
    }

    // 2. 检查依赖（如果有）
    const installedIds = LawAIApp.PackRegistry.getInstalled().map(p => p.packId);
    const depsMissing = LawAIApp.PackValidator.checkDependencies(pack, installedIds);
    if (depsMissing.length > 0) {
      LawAIApp.EventBus.emit('PackFailed', { packId: pack.packId, errors: [`Missing dependencies: ${depsMissing.join(',')}`] });
      return { success: false, errors: [`Missing dependencies: ${depsMissing.join(',')}`] };
    }

    // 3. 注册 Academy（如果包含 academyIds，则确保它们在 academyData 中且状态正确）
    if (pack.academyIds) {
      pack.academyIds.forEach(aid => {
        const academy = LawAIApp.AcademyData.getAcademyById(aid);
        if (academy) {
          // 启用 Academy
          academy.enabled = true;
          academy.status = 'active';
          // 更新存储
          LawAIApp.AcademyStorage._saveAll(LawAIApp.AcademyData.academies);
        }
      });
    }

    // 4. 类似注册课程、模块、资源等（可扩展）
    // 这里简单处理：如果包带有 courseIds，则将它们启用（courseData 中 enabled = true）
    if (pack.courseIds) {
      pack.courseIds.forEach(cid => {
        const course = LawAIApp.CourseData.getById(cid);
        if (course) course.enabled = true;
      });
      LawAIApp.CourseStorage._saveAll(LawAIApp.CourseData.courses);
    }

    // 5. 注册到已安装列表
    LawAIApp.PackRegistry.register(pack);

    return { success: true };
  },

  // 卸载包
  uninstall(packId) {
    const pack = LawAIApp.PackRegistry.getInstalled().find(p => p.packId === packId);
    if (!pack) return false;

    // 停用相关 academy
    if (pack.academyIds) {
      pack.academyIds.forEach(aid => {
        const academy = LawAIApp.AcademyData.getAcademyById(aid);
        if (academy) {
          academy.enabled = false;
          academy.status = 'locked';
        }
      });
      LawAIApp.AcademyStorage._saveAll(LawAIApp.AcademyData.academies);
    }

    LawAIApp.PackRegistry.remove(packId);
    return true;
  }
};
