// ===========================================
// mentorProfiles.js
// 定义所有可用导师及其教学风格、适应人群
// ===========================================
LawAIApp.MentorProfiles = {
  mentors: {
    builder: {
      id: 'builder',
      name: 'Builder',
      emoji: '🚀',
      style: 'Practical, project-first',
      focus: 'Build fast, learn by doing',
      bestFor: ['Developers', 'Founders', 'Makers'],
      explanationStyle: 'concise',
      examplePreference: 'code/project',
      challengeDifficulty: 1.1,   // 稍难
      feedbackTone: 'direct'
    },
    professor: {
      id: 'professor',
      name: 'Professor',
      emoji: '🎓',
      style: 'Detailed, structured',
      focus: 'Deep understanding, theory, fundamentals',
      bestFor: ['Beginners', 'Academic learners'],
      explanationStyle: 'verbose',
      examplePreference: 'textbook/case study',
      challengeDifficulty: 0.9,   // 稍易
      feedbackTone: 'supportive'
    },
    cto: {
      id: 'cto',
      name: 'CTO',
      emoji: '💼',
      style: 'Architecture, system thinking, product mindset',
      focus: 'Scalability, real-world engineering, decision making',
      bestFor: ['Intermediate', 'Advanced learners'],
      explanationStyle: 'balanced',
      examplePreference: 'architecture/decision',
      challengeDifficulty: 1.2,
      feedbackTone: 'analytical'
    },
    coach: {
      id: 'coach',
      name: 'Coach',
      emoji: '💡',
      style: 'Motivational, supportive, goal-oriented',
      focus: 'Consistency, confidence, daily progress',
      bestFor: ['Habit building', 'Long-term learners'],
      explanationStyle: 'encouraging',
      examplePreference: 'success story',
      challengeDifficulty: 1.0,
      feedbackTone: 'positive'
    }
  },

  getMentor(mentorId) {
    return this.mentors[mentorId] || this.mentors.coach; // 默认 Coach
  },

  getAllMentors() {
    return Object.values(this.mentors);
  }
};
