// lessonModel.js
LawAIApp.LessonModel = {
  schema: {
    id: { required: true, type: 'string', example: 'lesson_001' },
    academyId: { required: true, type: 'string' },
    courseId: { required: true, type: 'string' },
    moduleId: { required: true, type: 'string' },
    categoryId: { required: true, type: 'string' },
    title: { required: true, type: 'string' },
    shortTitle: { required: false, type: 'string', default: '' },
    description: { required: true, type: 'string' },
    version: { required: false, type: 'string', default: '1.0' },
    status: { required: true, type: 'string', enum: ['draft','review','published','deprecated','archived'] },
    enabled: { required: true, type: 'boolean' },
    difficulty: { required: true, type: 'string', enum: ['Beginner','Intermediate','Advanced','Expert'] },
    difficultyScore: { required: false, type: 'number', default: 10 },
    estimatedMinutes: { required: false, type: 'number', default: 0 },
    estimatedXP: { required: false, type: 'number', default: 0 },
    order: { required: true, type: 'number' },
    author: { required: false, type: 'string', default: 'Law Academy' },
    language: { required: false, type: 'string', default: 'English' },
    createdAt: { required: false, type: 'string', default: new Date().toISOString() },
    updatedAt: { required: false, type: 'string', default: new Date().toISOString() }
  },

  validate(lesson) {
    const errors = [];
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && (lesson[key] === undefined || lesson[key] === null)) {
        errors.push(`${key} is required`);
      } else if (lesson[key] !== undefined) {
        if (rule.enum && !rule.enum.includes(lesson[key])) {
          errors.push(`${key} must be one of ${rule.enum.join(', ')}`);
        }
        if (rule.type === 'number' && typeof lesson[key] !== 'number') {
          errors.push(`${key} must be a number`);
        }
      }
    });
    return errors;
  }
};
