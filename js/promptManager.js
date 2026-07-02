// promptManager.js
LawAIApp.PromptManager = {
  templates: {
    lesson_summary: 'Summarize the lesson titled "{{title}}" in 3 bullet points.',
    quiz_generation: 'Create 3 multiple-choice questions about {{topic}}.',
    reflection: 'Ask a reflective question about {{topic}}.',
    review_question: 'Generate a review question for {{lessonTitle}}.',
    mentor_advice: 'Based on progress ({{completed}}/{{total}} lessons, streak {{streak}}), give one piece of learning advice.'
  },

  getTemplate(type) {
    return this.templates[type] || '';
  },

  fillTemplate(type, data) {
    let tmpl = this.getTemplate(type);
    if (!tmpl) return '';
    Object.keys(data).forEach(key => {
      tmpl = tmpl.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi'), data[key]);
    });
    return tmpl;
  }
};
