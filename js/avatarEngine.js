// avatarEngine.js
LawAIApp.AvatarEngine = (function() {
  let avatar = LawAIApp.StorageEngine.get('avatar_data', {
    base: 'default',
    border: null,
    frame: null,
    effect: null
  });

  function save() {
    LawAIApp.StorageEngine.set('avatar_data', avatar);
  }

  function updateAvatar(property, value) {
    avatar[property] = value;
    save();
    LawAIApp.EventBus.emit('AvatarUpdated', avatar);
  }

  // 监听解锁事件自动装备边框
  LawAIApp.EventBus.on('AvatarUnlocked', (data) => {
    if (data.id === 'avatar_bronze_border') updateAvatar('border', 'bronze');
    else if (data.id === 'avatar_silver_border') updateAvatar('border', 'silver');
  });

  // ============================================================
  // 🔥 Bible Part 52: Border CSS 映射
  // ============================================================
  function getBorderStyle() {
    var borders = {
      bronze: 'box-shadow:0 0 0 2px #cd7f32, 0 0 8px rgba(205,127,50,0.4);',
      silver: 'box-shadow:0 0 0 2px #c0c0c0, 0 0 8px rgba(192,192,192,0.4);',
      gold:   'box-shadow:0 0 0 3px #ffd700, 0 0 12px rgba(255,215,0,0.5);',
      streak_7: 'box-shadow:0 0 0 3px #ef4444, 0 0 12px rgba(239,68,68,0.4);',
      streak_30: 'box-shadow:0 0 0 3px #f59e0b, 0 0 12px rgba(245,158,11,0.4);'
    };
    return borders[avatar.border] || '';
  }

  return {
    getAvatar: () => ({ ...avatar }),
    updateAvatar,
    getBorderStyle
  };
})();
