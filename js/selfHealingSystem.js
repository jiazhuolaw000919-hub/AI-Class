window.LawAIApp = window.LawAIApp || {};

LawAIApp.SelfHealingSystem = {
  init() {
    console.log("🧬 Self-Healing System activated");

    this.fixEventBus();
    this.fixBootStatus();
    this.watchSystem();
  },

  /**
   * ① EventBus 自动修复
   */
  fixEventBus() {
    if (!LawAIApp.EventBus) {
      console.warn("⚠️ EventBus missing → creating fallback");

      const listeners = {};

      LawAIApp.EventBus = {
        on(event, fn) {
          listeners[event] = listeners[event] || [];
          listeners[event].push(fn);
        },

        emit(event, data) {
          (listeners[event] || []).forEach(fn => fn(data));
        }
      };

      console.log("🧠 EventBus fallback ready");
    }
  },

  /**
   * ② bootStatus 自动修复
   */
  fixBootStatus() {
    if (!LawAIApp.bootStatus) {
      console.warn("⚠️ bootStatus missing → rebuilding");

      LawAIApp.bootStatus = {
        loaded: [],
        missing: [],
        total: 0,
        booted: true,
        safeMode: true,
        healed: true
      };
    }
  },

  /**
   * ③ runtime 监控
   */
  watchSystem() {
    setInterval(() => {
      // EventBus 再保险
      if (!LawAIApp.EventBus?.on) {
        this.fixEventBus();
      }

      // bootStatus 再保险
      if (!LawAIApp.bootStatus) {
        this.fixBootStatus();
      }

    }, 2000);
  }
};
