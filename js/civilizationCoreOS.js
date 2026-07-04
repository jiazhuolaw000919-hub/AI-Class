// ===========================================
// civilizationCoreOS.js
// 文明核心操作系统：统一启动入口，初始化所有子系统
// ===========================================
LawAIApp.CivilizationCoreOS = {
  subsystems: [
    'LearningGraphEngine',
    'CurriculumFactoryEngine',
    'UniversityDeploymentEngine',
    'GlobalEducationNetworkEngine',
    'EducationGovernanceAuthority',
    'CivilizationIdentityCore',
    'CivilizationMotivationCore',
    'AIConsciousnessLayer',
    'PerformanceEvaluationEngine',
    'SelfImprovementEngine'
  ],

  // 检查所有子系统是否已加载
  checkSubsystems() {
    const missing = [];
    this.subsystems.forEach(name => {
      if (!LawAIApp[name]) {
        missing.push(name);
      }
    });
    if (missing.length > 0) {
      console.warn('[CivOS] Missing subsystems:', missing);
      return false;
    }
    console.log('[CivOS] All subsystems verified.');
    return true;
  },

  // 启动文明操作系统
  boot() {
    console.log('[CivOS] Booting AI Education Civilization...');
    if (!this.checkSubsystems()) {
      console.warn('[CivOS] Boot aborted due to missing subsystems.');
      return false;
    }

    // 1. 确保治理层已启动
    if (LawAIApp.EducationGovernanceAuthority && !LawAIApp.StorageEngine.get('aega_initialized')) {
      LawAIApp.EducationGovernanceAuthority.init();
      LawAIApp.StorageEngine.set('aega_initialized', true);
    }

    // 2. 激活意识层（如果尚未激活）
    if (LawAIApp.AIConsciousnessLayer && !LawAIApp.StorageEngine.get('consciousness_active')) {
      LawAIApp.AIConsciousnessLayer.init();
      LawAIApp.StorageEngine.set('consciousness_active', true);
    }

    // 3. 启动进化驱动引擎
    if (LawAIApp.EvolutionDriveEngine && !LawAIApp.EvolutionDriveEngine._started) {
      LawAIApp.EvolutionDriveEngine.start();
      LawAIApp.EvolutionDriveEngine._started = true;
    }

    // 4. 启动无限学习循环
    if (LawAIApp.InfiniteLearningEngine) {
      LawAIApp.InfiniteLearningEngine.start();
    }

    // 5. 启动全球运行时
    if (LawAIApp.GlobalEducationRuntime) {
      LawAIApp.GlobalEducationRuntime.start();
    }

    // 6. 标记系统为完全激活
    LawAIApp.StorageEngine.set('civilization_mode', 'singularity');

    LawAIApp.EventBus.emit('CivilizationBootComplete', {
      timestamp: new Date().toISOString(),
      mode: 'singularity'
    });

    console.log('[CivOS] AI Education Civilization is now fully operational.');
    return true;
  },

  // 获取系统状态快照
  getSystemSnapshot() {
    return {
      mode: LawAIApp.StorageEngine.get('civilization_mode', 'initializing'),
      subsystems: this.subsystems.map(name => ({
        name,
        available: !!LawAIApp[name]
      })),
      bootTimestamp: LawAIApp.StorageEngine.get('boot_timestamp')
    };
  }
};
