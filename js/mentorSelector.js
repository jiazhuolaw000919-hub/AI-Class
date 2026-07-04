// ===========================================
// mentorSelector.js
// 导师选择器：切换、获取当前导师，推荐导师
// ===========================================
LawAIApp.MentorSelector = {
  _currentKey: 'current_mentor',

  // 设置当前导师
  setMentor(userId, mentorId) {
    const mentors = LawAIApp.MentorProfiles.getAllMentors();
    if (!mentors.find(m => m.id === mentorId)) return false;
    LawAIApp.StorageEngine.set(`${this._currentKey}_${userId}`, mentorId);
    LawAIApp.EventBus.emit('MentorChanged', { userId, mentorId });
    return true;
  },

  // 获取当前导师
  getCurrentMentor(userId) {
    const id = LawAIApp.StorageEngine.get(`${this._currentKey}_${userId}`, 'coach');
    return LawAIApp.MentorProfiles.getMentor(id);
  },

  // 基于用户特征推荐导师（简单：根据技能水平）
  recommendMentor(userId) {
    const user = LawAIApp.AuthService.getCurrentUser();
    if (!user) return 'coach';

    // 如果等级 > 5，推荐 CTO 或 Builder；否则 Professor 或 Coach
    if (user.level > 5) {
      return user.xp > 1500 ? 'cto' : 'builder';
    } else {
      return user.xp < 500 ? 'professor' : 'coach';
    }
  }
};
