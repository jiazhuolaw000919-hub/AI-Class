// bootManager.js
LawAIApp.BootManager = {
  async start() {
    const errors = [];
    LawAIApp.EventBus.emit('BootStarted');

    // 1. 检查引擎依赖
    const missingEngines = LawAIApp.StartupValidator.validate();
    if (missingEngines.length > 0) {
      console.warn('⚠️ Missing engines:', missingEngines);
    }

    // 2. 加载学习包 (Safe Mode: 忽略错误)
    try {
      if (LawAIApp.LearningPack) {
        // 确保 AI 包已安装
        if (!LawAIApp.LPSRegistry.isInstalled('academy_ai')) {
          const result = await LawAIApp.LearningPack.installDefaultPack();
          if (!result.success) errors.push('Default pack install failed: ' + (result.error || result.errors));
        }
      }
    } catch (e) {
      errors.push('Pack loading error: ' + e.message);
    }

    // 3. 构建知识关系图谱 (Phase 38)
    try {
      if (LawAIApp.RelationshipEngine38) {
        LawAIApp.RelationshipEngine38.init();
      }
    } catch (e) {
      errors.push('Graph init error: ' + e.message);
    }

    // 4. 初始化 AI 导师 (确保记忆更新)
    try {
      if (LawAIApp.MentorEngine) {
        // Mentor 已经自启动，这里可触发一次主动检查
        LawAIApp.MentorMemory.refreshStrengths();
      }
    } catch (e) {
      errors.push('Mentor init error: ' + e.message);
    }

    // 5. 构建运行时注册表
    const registry = LawAIApp.RegistryBuilder.build();

    // 6. 恢复进度 (Progress 已在存储中，只需确保其被正确读取)
    try {
      if (LawAIApp.ProgressEngine) {
        // 强制刷新一下进度对象
        LawAIApp.ProgressEngine.getProgress();
      }
    } catch (e) {
      errors.push('Progress restore error: ' + e.message);
    }

    // 7. 生成启动报告
    LawAIApp.BootReport.generate(registry, missingEngines, errors);

    // 8. 发送就绪事件
    LawAIApp.EventBus.emit('DashboardReady');
    console.log('✅ Academy Bootstrap complete');
  }
};
