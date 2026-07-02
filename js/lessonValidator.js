// lessonValidator.js
LawAIApp.LessonValidator = {
  // 校验单个 lesson 对象
  validate(lesson) {
    return LawAIApp.LessonModel.validate(lesson);
  },

  // 校验完整性：是否有有效父级
  validateParentIntegrity(lesson) {
    const errors = [];
    // 检查 academy 是否存在
    const academy = LawAIApp.AcademyData.getAcademyById(lesson.academyId);
    if (!academy) errors.push(`Academy ${lesson.academyId} not found`);
    // 检查 course 是否存在
    const course = LawAIApp.CourseData.getById(lesson.courseId);
    if (!course) errors.push(`Course ${lesson.courseId} not found`);
    // 检查 module 是否存在
    const module = LawAIApp.ModuleData.getById(lesson.moduleId);
    if (!module) errors.push(`Module ${lesson.moduleId} not found`);
    // 检查 category
    const category = LawAIApp.CategoryData.getById(lesson.categoryId);
    if (!category) errors.push(`Category ${lesson.categoryId} not found`);
    return errors;
  },

  // 检查同一 module 内是否有重复 order
  checkDuplicateOrder(lesson, allLessons) {
    const sameModule = allLessons.filter(l => l.moduleId === lesson.moduleId && l.id !== lesson.id);
    return sameModule.some(l => l.order === lesson.order) ? 'Duplicate order within module' : null;
  }
};
