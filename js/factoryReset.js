// factoryReset.js
LawAIApp.FactoryReset = {
  // 执行完整工厂重置
  async execute() {
    const confirmed = confirm(
      '⚠️ This will permanently delete ALL your learning data.\n\n' +
      'This includes: progress, XP, streaks, notes, bookmarks, settings, achievements, projects, second brain entries, and more.\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Do you want to continue?'
    );
    if (!confirmed) return false;

    // 备份当前主题设置（如果用户想保留）
    const currentTheme = LawAIApp.StorageEngine.get('current_theme', 'dark_default');

    // 获取所有 LawAI 相关的 LocalStorage 键
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lawai_')) {
        keysToRemove.push(key);
      }
    }

    // 清除所有数据
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 保留主题偏好（如果用户希望）
    LawAIApp.StorageEngine.set('current_theme', currentTheme);
    LawAIApp.StorageEngine.set('darkMode', true); // 默认暗色

    // 重新加载应用
    setTimeout(() => {
      location.reload();
    }, 500);

    return true;
  },

  // 导出数据备份
  exportBackup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lawai_')) {
        backup[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `law-ai-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    LawAIApp.Toast?.show('Backup exported successfully', 'success');
  },

  // 导入数据备份
  importBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const backup = JSON.parse(e.target.result);
        Object.entries(backup).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        LawAIApp.Toast?.show('Backup imported. Reloading...', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        LawAIApp.Toast?.show('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  }
};
