// themeEngine.js
LawAIApp.ThemeEngine = (function() {
  // 可解锁的主题包列表
  const themePacks = [
    { id: 'dark_default', name: 'Midnight Blue', unlocked: true, colors: { bg: '#0f172a', card: '#1e293b', primary: '#3b82f6' } },
    { id: 'light_default', name: 'Morning Light', unlocked: true, colors: { bg: '#f8fafc', card: '#ffffff', primary: '#3b82f6' } },
    { id: 'forest', name: 'Forest', unlocked: false, colors: { bg: '#0f2a1d', card: '#1e3b2c', primary: '#22c55e' }, unlockCondition: { level: 10 } },
    { id: 'sunset', name: 'Sunset', unlocked: false, colors: { bg: '#2d1b2e', card: '#3e2a3f', primary: '#f59e0b' }, unlockCondition: { level: 20 } }
  ];

  let currentThemeId = LawAIApp.StorageEngine.get('current_theme', 'dark_default');

  function getThemes() {
    return themePacks;
  }

  function getCurrentThemeId() {
    return currentThemeId;
  }

  function applyTheme(themeId) {
    const pack = themePacks.find(t => t.id === themeId && t.unlocked);
    if (!pack) return false;
    currentThemeId = themeId;
    LawAIApp.StorageEngine.set('current_theme', themeId);
    // 应用 CSS 变量
    document.documentElement.style.setProperty('--bg', pack.colors.bg);
    document.documentElement.style.setProperty('--card', pack.colors.card);
    document.documentElement.style.setProperty('--primary', pack.colors.primary);
    LawAIApp.EventBus.emit('ThemeChanged', { themeId });
    return true;
  }

  // 监听解锁事件（由 unlockEngine 发出）
  LawAIApp.EventBus.on('ThemeUnlocked', (data) => {
    const pack = themePacks.find(t => t.id === data.themeId);
    if (pack) pack.unlocked = true;
  });

  // 初始化时尝试解锁默认主题（暗色/亮色始终可用）
  function init() {
    applyTheme(currentThemeId);
  }

  init();

  return { getThemes, getCurrentThemeId, applyTheme, init };
})();
