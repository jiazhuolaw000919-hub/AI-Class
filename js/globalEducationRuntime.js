// ===========================================
// globalEducationRuntime.js
// 全球教育运行时：持续监控文明状态并触发自适应调整
// ===========================================
LawAIApp.GlobalEducationRuntime = {
  _started: false,

  start() {
    if (this._started) return;
    this._started = true;

    // 每15分钟执行一次全局健康检查与自适应调整
    this._healthInterval = setInterval(() => {
      this.runGlobalHealthCheck();
    }, 900000);

    // 立即执行一次
    this.runGlobalHealthCheck();

    console.log('[GlobalRuntime] Global education runtime started.');
  },

  async runGlobalHealthCheck() {
    const health = LawAIApp.SystemHealthMonitor.getHealthSummary();

    // 如果整体健康低于阈值，触发自动修复
    if (health.overall < 60) {
      console.log('[GlobalRuntime] Health below threshold, initiating auto-repair.');
      await LawAIApp.SelfImprovementEngine?.performSelfHealing();
    }

    // 检查动机水平，如果过低则强化
    const motivation = LawAIApp.CivilizationMotivationCore?.checkMotivation();
    if (motivation < 50) {
      LawAIApp.CivilizationMotivationCore?.reinforceMotivation(20);
    }

    // 同步代理动机
    LawAIApp.AgentMotivationSync?.syncAgentsToMotivation();

    // 检查目的完整性
    LawAIApp.PurposeLockSystem?.verifyPurposeIntegrity();

    // 更新文明身份
    LawAIApp.CivilizationIdentityCore?.refreshSelfState();

    // 发布全局运行时心跳
    LawAIApp.EventBus.emit('GlobalRuntimePulse', {
      health: health.overall,
      motivation,
      timestamp: new Date().toISOString()
    });
  },

  stop() {
    if (this._healthInterval) clearInterval(this._healthInterval);
    this._started = false;
  }
};
