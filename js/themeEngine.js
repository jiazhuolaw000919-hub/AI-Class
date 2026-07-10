// ================================================================
// themeEngine.js – V2.0.0 - Instant Theme (Phase 0.1.1)
// 主题立即应用，事件监听延迟
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ThemeEngine = (function() {
  // 可解锁的主题包列表
  const themePacks = [
    { id: 'dark_default', name: 'Midnight Blue', unlocked: true, colors: { bg: '#0f172a', card: '#1e293b', primary: '#3b82f6' } },
    { id: 'light_default', name: 'Morning Light', unlocked: true, colors: { bg: '#f8fafc', card: '#ffffff', primary: '#3b82f6' } },
    { id: 'forest', name: 'Forest', unlocked: false, colors: { bg: '#0f2a1d', card: '#1e3b2c', primary: '#22c55e' }, unlockCondition: { level: 10 } },
    { id: 'sunset', name: 'Sunset', unlocked: false, colors: { bg: '#2d1b2e', card: '#3e2a3f', primary: '#f59e0b' }, unlockCondition: { level: 20 } }
  ];

  let currentThemeId = 'dark_default';
  let _initialized = false;

  // ============================================================
  // 立即应用主题（不等待任何东西）
  // ============================================================
  function applyTheme(themeId) {
    const pack = themePacks.find(t => t.id === themeId && t.unlocked);
    if (!pack) return false;
    currentThemeId = themeId;
    LawAIApp.StorageEngine?.set?.('current_theme', themeId);
    // 应用 CSS 变量
    document.documentElement.style.setProperty('--bg', pack.colors.bg);
    document.documentElement.style.setProperty('--card', pack.colors.card);
    document.documentElement.style.setProperty('--primary', pack.colors.primary);
    return true;
  }

  // ============================================================
  // 🔥 关键：立即初始化（不延迟）
  // ============================================================
  function init() {
    if (_initialized) return;
    _initialized = true;

    // 1. 立即：加载保存的主题
    try {
      const saved = LawAIApp.StorageEngine?.get?.('current_theme');
      if (saved) {
        const pack = themePacks.find(t => t.id === saved && t.unlocked);
        if (pack) {
          currentThemeId = saved;
        }
      }
    } catch (e) {
      // 静默失败
    }

    // 2. 立即：应用主题（不阻塞）
    applyTheme(currentThemeId);
    console.log('🎨 ThemeEngine: Theme applied immediately:', currentThemeId);

    // 3. 延迟：绑定事件监听（非关键）
    var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 200); };
    scheduleFn(function() {
      // 监听解锁事件（由 unlockEngine 发出）
      LawAIApp.EventBus?.on?.('ThemeUnlocked', function(data) {
        const pack = themePacks.find(t => t.id === data.themeId);
        if (pack) {
          pack.unlocked = true;
          console.log('🎨 Theme unlocked:', pack.name);
        }
      });
      console.log('🎨 ThemeEngine: Event listeners bound (deferred)');
    });
  }

  // ============================================================
  // 公开 API
  // ============================================================
  function getThemes() {
    return themePacks;
  }

  function getCurrentThemeId() {
    return currentThemeId;
  }

  function getStatus() {
    return {
      name: 'ThemeEngine',
      version: '2.0.0',
      initialized: _initialized,
      currentTheme: currentThemeId,
      totalThemes: themePacks.length,
      unlockedThemes: themePacks.filter(t => t.unlocked).length
    };
  }

  // ============================================================
  // 立即执行初始化
  // ============================================================
  init();

  return { 
    getThemes, 
    getCurrentThemeId, 
    applyTheme, 
    init,
    getStatus
  };
})();

console.log('🎨 ThemeEngine V2.0 loaded (instant theme)');
