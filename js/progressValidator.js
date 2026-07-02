// progressValidator.js
LawAIApp.ProgressValidator = {
  validateRecord(record) {
    const errors = [];
    if (!record.lessonId) errors.push('lessonId is required');
    if (!record.academyId) errors.push('academyId is required');
    if (!record.courseId) errors.push('courseId is required');
    if (!record.moduleId) errors.push('moduleId is required');
    if (!record.status) errors.push('status is required');
    else if (!['not_started','in_progress','paused','completed','review_required','archived'].includes(record.status)) {
      errors.push('Invalid status');
    }
    return errors;
  }
};
