// ===========================================
// userApi.js
// 用户相关 API：创建、查询、更新 XP
// ===========================================
LawAIApp.UserApi = {
  async createUser(name, email = null) {
    const { data, error } = await LawAIApp.Database.from('users').insert({
      name,
      email,
      xp: 0,
      level: 1,
      streak: 0
    });
    if (error) return { success: false, error };
    // 同步到现有 IdentityEngine
    if (LawAIApp.IdentityEngine && data[0]) {
      LawAIApp.IdentityEngine.update('displayName', data[0].name);
    }
    LawAIApp.EventBus.emit('UserCreated', data[0]);
    return { success: true, user: data[0] };
  },

  async getUser(userId) {
    const { data, error } = await LawAIApp.Database.from('users').eq('id', userId).select();
    return { success: !error, user: data?.[0] || null, error };
  },

  async updateXp(userId, xpAmount) {
    const { data: currentUser } = await this.getUser(userId);
    if (!currentUser) return { success: false, error: 'User not found' };
    const newXp = (currentUser.xp || 0) + xpAmount;
    // 简单等级计算
    const newLevel = Math.floor(newXp / 500) + 1;
    const { error } = await LawAIApp.Database.from('users').update({
      id: userId,
      xp: newXp,
      level: newLevel
    });
    if (error) return { success: false, error };
    LawAIApp.EventBus.emit('UserXpUpdated', { userId, xp: newXp, level: newLevel });
    return { success: true, xp: newXp, level: newLevel };
  }
};
