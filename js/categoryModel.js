// categoryModel.js
LawAIApp.CategoryModel = {
  schema: {
    id: { required: true, type: 'string', example: 'cat_ai' },
    name: { required: true, type: 'string' },
    displayName: { required: true, type: 'string' },
    description: { required: false, type: 'string', default: '' },
    icon: { required: false, type: 'string', default: '📚' },
    color: { required: false, type: 'string', default: '#3b82f6' },
    parentCategory: { required: false, type: 'string', default: null },
    order: { required: true, type: 'number' },
    enabled: { required: true, type: 'boolean' },
    status: { required: true, type: 'string', enum: ['active','comingSoon','hidden','deprecated'] },
    createdAt: { required: false, type: 'string', default: new Date().toISOString() },
    updatedAt: { required: false, type: 'string', default: new Date().toISOString() }
  },

  validate(cat) {
    const errors = [];
    Object.entries(this.schema).forEach(([key, rule]) => {
      if (rule.required && (cat[key] === undefined || cat[key] === null)) {
        errors.push(`${key} is required`);
      } else if (cat[key] !== undefined) {
        if (rule.enum && !rule.enum.includes(cat[key])) {
          errors.push(`${key} must be one of ${rule.enum.join(', ')}`);
        }
        if (rule.type === 'number' && typeof cat[key] !== 'number') {
          errors.push(`${key} must be a number`);
        }
      }
    });
    return errors;
  }
};
