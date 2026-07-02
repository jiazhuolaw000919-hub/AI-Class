// academyModel.js
LawAIApp.AcademyModel = {
  // 必须字段及默认值
  schema: {
    id: { required: true, type: 'string', example: 'academy_ai' },
    name: { required: true, type: 'string' },
    shortName: { required: true, type: 'string' },
    description: { required: true, type: 'string' },
    icon: { required: true, type: 'string' },
    coverImage: { required: false, type: 'string', default: '' },
    themeColor: { required: false, type: 'string', default: '#3b82f6' },
    difficulty: { required: true, type: 'string', enum: ['Beginner','Intermediate','Advanced'] },
    category: { required: true, type: 'string', enum: ['Technology','Finance','Health','Automotive','Programming','Education','Other'] },
    status: { required: true, type: 'string', enum: ['active','locked','coming_soon','completed'] },
    enabled: { required: true, type: 'boolean' },
    order: { required: true, type: 'number' },
    estimatedHours: { required: false, type: 'number', default: 0 },
    estimatedLessons: { required: false, type: 'number', default: 0 },
    progress: { required: false, type: 'number', default: 0 }, // %
    completedLessons: { required: false, type: 'number', default: 0 },
    favorite: { required: false, type: 'boolean', default: false },
    bookmark: { required: false, type: 'boolean', default: false },
    lastOpened: { required: false, type: 'string', default: null }, // ISO date
    createdAt: { required: false, type: 'string', default: new Date().toISOString() },
    updatedAt: { required: false, type: 'string', default: new Date().toISOString() }
  },

  validate(academy) {
    const errors = [];
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && (academy[key] === undefined || academy[key] === null)) {
        errors.push(`${key} is required`);
        return;
      }
      if (academy[key] !== undefined && rule.enum && !rule.enum.includes(academy[key])) {
        errors.push(`${key} must be one of ${rule.enum.join(', ')}`);
      }
      if (academy[key] !== undefined && rule.type === 'number' && typeof academy[key] !== 'number') {
        errors.push(`${key} must be a number`);
      }
    });
    return errors;
  },

  createDefault(overrides = {}) {
    const obj = {};
    Object.entries(this.schema).forEach(([key, rule]) => {
      obj[key] = overrides[key] !== undefined ? overrides[key] : rule.default;
      if (rule.required && obj[key] === undefined) {
        obj[key] = rule.example || (rule.type === 'string' ? '' : rule.type === 'number' ? 0 : false);
      }
    });
    return obj;
  }
};
