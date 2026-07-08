// ===========================================
// personalitySwitch.js
// 人格切换：根据学习状态动态调整交互模式
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PersonalitySwitch = {
  currentMode: 'balanced',
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('🔄 PersonalitySwitch initialized');
    return this;
  },

  selectMode() {
    console.log('🎯 PersonalitySwitch selecting mode...');
    
    try {
      // 确保 PersonalityProfile 存在
      if (!LawAIApp.PersonalityProfile || typeof LawAIApp.PersonalityProfile.analyzeLearningEvents !== 'function') {
        console.warn('⚠️ PersonalityProfile not ready, using balanced mode');
        this.currentMode = 'balanced';
        return this.currentMode;
      }

      const analysis = LawAIApp.PersonalityProfile.analyzeLearningEvents();
      
      if (!analysis || typeof analysis !== 'object') {
        console.warn('⚠️ Invalid analysis, using balanced mode');
        this.currentMode = 'balanced';
        return this.currentMode;
      }

      // 根据分析结果选择模式
      const pace = analysis.pace || 'moderate';
      const depth = analysis.depth || 50;
      const completionRate = analysis.completionRate || 0;

      if (completionRate < 20) {
        this.currentMode = 'encouraging';
      } else if (pace === 'fast' && depth > 60) {
        this.currentMode = 'challenging';
      } else if (pace === 'slow' || depth < 40) {
        this.currentMode = 'supportive';
      } else {
        this.currentMode = 'balanced';
      }

      console.log(`✅ Mode selected: ${this.currentMode} (pace: ${pace}, depth: ${depth}%)`);
      return this.currentMode;

    } catch (err) {
      console.warn('⚠️ Mode selection failed:', err);
      this.currentMode = 'balanced';
      return this.currentMode;
    }
  },

  getCurrentMode() {
    return this.currentMode || 'balanced';
  },

  // 手动设置模式
  setMode(mode) {
    const validModes = ['balanced', 'encouraging', 'challenging', 'supportive'];
    if (!validModes.includes(mode)) {
      console.warn(`⚠️ Invalid mode: ${mode}, using balanced`);
      this.currentMode = 'balanced';
    } else {
      this.currentMode = mode;
      console.log(`🎯 Mode manually set to: ${mode}`);
    }
    return this.currentMode;
  }
};

// 自动初始化
LawAIApp.PersonalitySwitch.init();

console.log('🔄 PersonalitySwitch V1.0 ready');
