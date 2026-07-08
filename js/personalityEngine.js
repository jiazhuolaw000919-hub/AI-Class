// ===========================================
// personalityEngine.js
// 人格引擎：整合人格系统和交互模式
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PersonalityEngine = {
  initialized: false,

  init() {
    if (this.initialized) {
      console.log('🔄 PersonalityEngine already initialized');
      return;
    }

    console.log('🧠 PersonalityEngine initializing...');
    this.initialized = true;

    try {
      // 初始化子模块（带防御）
      this._initSubModules();
      
      // 选择初始模式
      this._selectInitialMode();

      console.log('✅ PersonalityEngine initialized successfully');
      return this;

    } catch (err) {
      console.error('❌ PersonalityEngine init failed:', err);
      this.initialized = false;
      return this;
    }
  },

  _initSubModules() {
    // 初始化 PersonalityProfile
    try {
      if (LawAIApp.PersonalityProfile && typeof LawAIApp.PersonalityProfile.init === 'function') {
        LawAIApp.PersonalityProfile.init();
      } else {
        console.warn('⚠️ PersonalityProfile not available');
      }
    } catch (err) {
      console.warn('⚠️ PersonalityProfile init failed:', err);
    }

    // 初始化 PersonalitySwitch
    try {
      if (LawAIApp.PersonalitySwitch && typeof LawAIApp.PersonalitySwitch.init === 'function') {
        LawAIApp.PersonalitySwitch.init();
      } else {
        console.warn('⚠️ PersonalitySwitch not available');
      }
    } catch (err) {
      console.warn('⚠️ PersonalitySwitch init failed:', err);
    }
  },

  _selectInitialMode() {
    try {
      if (LawAIApp.PersonalitySwitch && typeof LawAIApp.PersonalitySwitch.selectMode === 'function') {
        const mode = LawAIApp.PersonalitySwitch.selectMode();
        console.log(`🎯 Initial mode selected: ${mode}`);
      } else {
        console.warn('⚠️ PersonalitySwitch not ready for mode selection');
      }
    } catch (err) {
      console.warn('⚠️ Mode selection failed:', err);
    }
  },

  // 获取当前模式
  getCurrentMode() {
    try {
      if (LawAIApp.PersonalitySwitch && typeof LawAIApp.PersonalitySwitch.getCurrentMode === 'function') {
        return LawAIApp.PersonalitySwitch.getCurrentMode();
      }
      return 'balanced';
    } catch (err) {
      console.warn('⚠️ Failed to get current mode:', err);
      return 'balanced';
    }
  },

  // 获取学习风格
  getLearningStyle() {
    try {
      if (LawAIApp.PersonalityProfile && typeof LawAIApp.PersonalityProfile.getStyleSummary === 'function') {
        return LawAIApp.PersonalityProfile.getStyleSummary();
      }
      return { pace: 'moderate', depth: 50, consistency: 70 };
    } catch (err) {
      console.warn('⚠️ Failed to get learning style:', err);
      return { pace: 'moderate', depth: 50, consistency: 70 };
    }
  },

  // 获取建议
  getRecommendations() {
    try {
      if (LawAIApp.PersonalityProfile && typeof LawAIApp.PersonalityProfile.getRecommendations === 'function') {
        return LawAIApp.PersonalityProfile.getRecommendations();
      }
      return { recommendations: ['Continue learning'] };
    } catch (err) {
      console.warn('⚠️ Failed to get recommendations:', err);
      return { recommendations: ['Continue learning at your own pace'] };
    }
  },

  // 切换模式
  setMode(mode) {
    try {
      if (LawAIApp.PersonalitySwitch && typeof LawAIApp.PersonalitySwitch.setMode === 'function') {
        return LawAIApp.PersonalitySwitch.setMode(mode);
      }
      console.warn('⚠️ PersonalitySwitch not ready');
      return null;
    } catch (err) {
      console.warn('⚠️ Failed to set mode:', err);
      return null;
    }
  },

  // 刷新分析
  refreshAnalysis() {
    try {
      if (LawAIApp.PersonalitySwitch && typeof LawAIApp.PersonalitySwitch.selectMode === 'function') {
        return LawAIApp.PersonalitySwitch.selectMode();
      }
      console.warn('⚠️ PersonalitySwitch not ready');
      return null;
    } catch (err) {
      console.warn('⚠️ Refresh analysis failed:', err);
      return null;
    }
  }
};

// 延迟初始化，确保其他模块已加载
setTimeout(() => {
  try {
    if (LawAIApp.PersonalityEngine && typeof LawAIApp.PersonalityEngine.init === 'function') {
      LawAIApp.PersonalityEngine.init();
    }
  } catch (err) {
    console.warn('⚠️ PersonalityEngine auto-init failed:', err);
  }
}, 1000);

console.log('🧠 PersonalityEngine V1.0 ready');
