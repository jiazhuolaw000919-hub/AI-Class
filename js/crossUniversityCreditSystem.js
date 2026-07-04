// ===========================================
// crossUniversityCreditSystem.js
// 跨大学学分系统：支持课程、技能、证书在不同大学间转移和互认
// ===========================================
LawAIApp.CrossUniversityCreditSystem = {
  _transcripts: {},

  // 为学生创建全球成绩单
  createGlobalTranscript(studentId) {
    const transcript = {
      studentId,
      earnedCredits: [],
      transferredCredits: [],
      gpa: 4.0,
      lastUpdated: new Date().toISOString()
    };
    this._transcripts[studentId] = transcript;
    return transcript;
  },

  // 记录本地获得的学分
  recordCredit(studentId, skillId, courseId, score) {
    if (!this._transcripts[studentId]) this.createGlobalTranscript(studentId);
    this._transcripts[studentId].earnedCredits.push({
      skillId,
      courseId,
      score,
      earnedAt: new Date().toISOString()
    });
  },

  // 模拟接收来自其他大学的转学分
  transferCredit(studentId, skillId, externalUniversity, score) {
    if (!this._transcripts[studentId]) this.createGlobalTranscript(studentId);
    this._transcripts[studentId].transferredCredits.push({
      skillId,
      fromUniversity: externalUniversity,
      score,
      transferredAt: new Date().toISOString()
    });
  },

  // 检查是否满足某个技能的最低要求（用于学分互认）
  hasSufficientCredit(studentId, skillId, minScore = 70) {
    const t = this._transcripts[studentId];
    if (!t) return false;
    const allCredits = [...t.earnedCredits, ...t.transferredCredits];
    return allCredits.some(c => c.skillId === skillId && c.score >= minScore);
  }
};
