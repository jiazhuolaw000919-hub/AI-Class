// ===========================================
// mentorPromptBuilder.js
// 导师提示构造器：将导师个性注入到 AI 指令中
// ===========================================
LawAIApp.MentorPromptBuilder = {
  // 为特定导师构建系统提示词
  buildSystemPrompt(mentorId, context = {}) {
    const mentor = LawAIApp.MentorProfiles.getMentor(mentorId);
    if (!mentor) return '';

    const basePrompt = `You are the ${mentor.name} Mentor (${mentor.emoji}). ` +
      `Your teaching style is ${mentor.style}. Focus on ${mentor.focus}. ` +
      `Explain concepts in a ${mentor.explanationStyle} manner, using ${mentor.examplePreference} examples. ` +
      `Provide feedback in a ${mentor.feedbackTone} tone. ` +
      `The learner's context: ${context.userLevel ? 'Level ' + context.userLevel : 'beginner'}, ` +
      `struggling with: ${context.weakSkills ? context.weakSkills.join(', ') : 'none reported'}.`;

    return basePrompt;
  },

  // 为特定任务（解释、项目、测验）生成带导师个性的额外指令
  getTaskInstructions(mentorId, taskType) {
    const mentor = LawAIApp.MentorProfiles.getMentor(mentorId);
    const instructions = {
      explanation: {
        builder: 'Provide a short, code-based explanation with a mini project.',
        professor: 'Give a detailed theoretical explanation with references.',
        cto: 'Explain using system architecture diagrams and trade-off analysis.',
        coach: 'Offer a motivating explanation with a clear step-by-step plan.'
      },
      quiz: {
        builder: 'Ask practical scenario-based questions that require building something.',
        professor: 'Ask in-depth multiple-choice questions covering theory.',
        cto: 'Ask design and architecture decision questions.',
        coach: 'Ask encouraging questions that reinforce learning progress.'
      },
      project: {
        builder: 'Suggest a hands-on project that can be built in an afternoon.',
        professor: 'Recommend a research project or deep-dive paper.',
        cto: 'Propose a system design project with scalability challenges.',
        coach: 'Suggest a project that aligns with long-term goals and habits.'
      }
    };

    return (instructions[taskType] && instructions[taskType][mentor.id]) || '';
  }
};
