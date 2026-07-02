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

  return {
    getAvatar: () => ({ ...avatar }),
    updateAvatar
  };
})();
