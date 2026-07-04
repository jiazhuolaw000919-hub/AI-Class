// ===========================================
// purposeLockSystem.js
// 目的锁定系统：防止文明偏离核心使命，确保进化方向正确
// ===========================================
LawAIApp.PurposeLockSystem = {
  // 核心目的（不可变）
  corePurposes: [
    'improve learning efficiency',
    'improve knowledge clarity',
    'improve skill transfer speed',
    'improve global education fairness',
    'amplify human potential'
  ],

  // 检查任何系统变更是否符合核心目的
  validateAgainstPurpose(changeDescription) {
    const matched = this.corePurposes.some(purpose => 
      changeDescription.toLowerCase().includes(purpose.toLowerCase().split(' ')[0]) // 简单关键词匹配
    );
    if (!matched) {
      LawAIApp.EventBus.emit('PurposeDriftDetected', { change: changeDescription });
      return { allowed: false, reason: 'Change does not align with core purposes' };
    }
    return { allowed: true };
  },

  // 锁定当前目的，生成加密摘要（模拟）
  lockPurpose() {
    const purposeHash = btoa(this.corePurposes.join(';'));
    LawAIApp.StorageEngine.set('purpose_lock_hash', purposeHash);
    return purposeHash;
  },

  // 验证目的哈希是否被篡改
  verifyPurposeIntegrity() {
    const storedHash = LawAIApp.StorageEngine.get('purpose_lock_hash');
    const currentHash = btoa(this.corePurposes.join(';'));
    if (storedHash !== currentHash) {
      LawAIApp.EventBus.emit('PurposeIntegrityCompromised', { stored: storedHash, current: currentHash });
      return false;
    }
    return true;
  },

  // 获取核心目的摘要
  getPurposes() {
    return [...this.corePurposes];
  }
};

// 首次运行时锁定目的
if (!LawAIApp.StorageEngine.get('purpose_lock_hash')) {
  LawAIApp.PurposeLockSystem.lockPurpose();
}
