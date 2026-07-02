// moduleModel.js
LawAIApp.ModuleModel = {
  schema: {
    id: { required: true, type: 'string', example: 'module_prompt_basics' },
    courseId: { required: true, type: 'string' },
    academyId: { required: true, type: 'string' },
    categoryId: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    shortName: { required: true, type: 'string' },
    description: { required: true, type: 'string' },
    icon: { required: false, type: 'string', default: '📦' },
    themeColor: { required: false, type: 'string', default: '#3b82f6' },
    difficulty: { required: true, type: 'string', enum: ['Beginner','Intermediate','Advanced','Expert'] },
    difficultyScore: { required: false, type: 'number', default: 10 },
    status: { required: true, type: 'string', enum: ['draft','review','published','locked','deprecated'] },
    enabled: { required: true, type: 'boolean' },
    order: { required: true, type: 'number' },
    estimatedMinutes: { required: false, type: 'number', default: 0 },
    estimatedLessons: { required: false, type: 'number', default: 0 },
    estimatedXP: { required: false, type: 'number', default: 0 },
    learningObjectives: { required: false, type: 'object', default: [] },
    skillsEarned: { required: false, type: 'object', default: [] },
    prerequisites: { required: false, type: 'object', default: [] },
    recommendedNext: { required: false, type: 'object', default: [] },
    tags: { required: false, type: 'object', default: [] },
    coverImage: { required: false, type: 'string', default: '' },
    bannerImage: { required: false, type: 'string', default: '' },
    progress: { required: false, type: 'number', default: 0 },
    completedLessons: { required: false, type: 'number', default: 0 },
    completionRule: { required: false, type: 'string', default: 'complete_all_lessons' }, // or 'pass_quiz', etc.
    favorite: { required: false, type: 'boolean', default: false },
    bookmark: { required: false, type: 'boolean', default: false },
    lastOpened: { required: false, type: 'string', default: null },
    createdAt: { required: false, type: 'string', default: new Date().toISOString() },
    updatedAt: { required: false, type: 'string', default: new Date().toISOString() },
    version: { required: false, type: 'string', default: '1.0' }
  },

  validate(module) {
    const errors = [];
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && (module[key] === undefined || module[key] === null)) {
        errors.push(`${key} is required`);
      } else if (module[key] !== undefined) {
        if (rule.enum && !rule.enum.includes(module[key])) {
          errors.push(`${key} must be one of ${rule.enum.join(', ')}`);
        }
        if (rule.type === 'number' && typeof module[key] !== 'number') {
          errors.push(`${key} must be a number`);
        }
      }
    });
    return errors;
  }
};
