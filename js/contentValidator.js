// contentValidator.js
LawAIApp.ContentValidator = {
  // 基本字段验证
  validate(contentObj) {
    const errors = [];
    const required = ['contentId', 'academyId', 'type', 'status'];
    required.forEach(f => {
      if (!contentObj[f]) errors.push(`Missing required field: ${f}`);
    });
    const validTypes = ['lesson','quiz','practice','project','resource','glossary','faq','challenge','case_study','reference'];
    if (contentObj.type && !validTypes.includes(contentObj.type)) {
      errors.push(`Invalid type: ${contentObj.type}`);
    }
    const validStatuses = ['draft','review','qa','published','deprecated','archived'];
    if (contentObj.status && !validStatuses.includes(contentObj.status)) {
      errors.push(`Invalid status: ${contentObj.status}`);
    }
    return errors;
  },

  // 检查引用的完整性（如 courseId, lessonId 是否存在）
  validateReferences(contentObj) {
    const errors = [];
    if (contentObj.academyId && !LawAIApp.AcademyData.getAcademyById(contentObj.academyId)) {
      errors.push(`Academy ${contentObj.academyId} not found`);
    }
    if (contentObj.courseId && !LawAIApp.CourseData.getById(contentObj.courseId)) {
      errors.push(`Course ${contentObj.courseId} not found`);
    }
    if (contentObj.moduleId && !LawAIApp.ModuleData.getById(contentObj.moduleId)) {
      errors.push(`Module ${contentObj.moduleId} not found`);
    }
    if (contentObj.lessonId) {
      const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(contentObj.lessonId.split('-')[1]));
      if (!lesson) errors.push(`Lesson ${contentObj.lessonId} not found`);
    }
    return errors;
  },

  // 检查唯一性（同一内容ID只能有一个）
  isUnique(contentId) {
    return !LawAIApp.ContentRegistry.get(contentId);
  },

  // 完整验证并返回结果
  fullCheck(contentObj) {
    const basic = this.validate(contentObj);
    const refs = this.validateReferences(contentObj);
    const unique = this.isUnique(contentObj.contentId);
    if (!unique) basic.push('Duplicate contentId');
    const allErrors = [...basic, ...refs];
    LawAIApp.EventBus.emit('ContentValidated', { contentId: contentObj.contentId, errors: allErrors });
    return { valid: allErrors.length === 0, errors: allErrors };
  }
};
