// courseModel.js
LawAIApp.CourseModel = {
  schema: {
    id: { required: true, type: 'string', example: 'course_prompt_engineering' },
    academyId: { required: true, type: 'string' },
    categoryId: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    shortName: { required: true, type: 'string' },
    description: { required: true, type: 'string' },
    thumbnail: { required: false, type: 'string', default: '' },
    banner: { required: false, type: 'string', default: '' },
    icon: { required: false, type: 'string', default: '📘' },
    themeColor: { required: false, type: 'string', default: '#3b82f6' },
    difficulty: { required: true, type: 'string', enum: ['Beginner','Intermediate','Advanced','Expert'] },
    difficultyScore: { required: false, type: 'number', default: 10 },
    status: { required: true, type: 'string', enum: ['active','locked','comingSoon','completed','deprecated'] },
    enabled: { required: true, type: 'boolean' },
    order: { required: true, type: 'number' },
    estimatedHours: { required: false, type: 'number', default: 0 },
    estimatedLessons: { required: false, type: 'number', default: 0 },
    estimatedXP: { required: false, type: 'number', default: 0 },
    learningObjectives: { required: false, type: 'object', default: [] },
    prerequisites: { required: false, type: 'object', default: [] },
    recommendedNext: { required: false, type: 'object', default: [] },
    tags: { required: false, type: 'object', default: [] },
    officialResources: { required: false, type: 'object', default: [] },
    author: { required: false, type: 'string', default: 'Law Academy' },
    version: { required: false, type: 'string', default: '1.0' },
    language: { required: false, type: 'string', default: 'English' },
    progress: { required: false, type: 'number', default: 0 },
    completedLessons: { required: false, type: 'number', default: 0 },
    favorite: { required: false, type: 'boolean', default: false },
    bookmark: { required: false, type: 'boolean', default: false },
    lastOpened: { required: false, type: 'string', default: null },
    createdAt: { required: false, type: 'string', default: new Date().toISOString() },
    updatedAt: { required: false, type: 'string', default: new Date().toISOString() }
  },

  validate(course) {
    const errors = [];
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && (course[key] === undefined || course[key] === null)) {
        errors.push(`${key} is required`);
      } else if (course[key] !== undefined) {
        if (rule.enum && !rule.enum.includes(course[key])) {
          errors.push(`${key} must be one of ${rule.enum.join(', ')}`);
        }
        if (rule.type === 'number' && typeof course[key] !== 'number') {
          errors.push(`${key} must be a number`);
        }
      }
    });
    return errors;
  }
};
