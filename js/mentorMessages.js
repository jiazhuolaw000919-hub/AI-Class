// mentorMessages.js
LawAIApp.MentorMessages = {
  generateOnStreak(streak) {
    if (streak === 7) return 'One week streak! You’re building a solid habit.';
    if (streak === 30) return '30 days! Incredible dedication.';
    return null;
  },
  generateOnLevelUp(level) {
    return `Level ${level} achieved! Your knowledge is growing fast.`;
  },
  generateOnProjectComplete() {
    return 'Project completed! That’s real-world proof of your skills.';
  },
  generateOnMemoryDrop() {
    return 'Your memory health is declining. Consider a quick review session.';
  }
};
