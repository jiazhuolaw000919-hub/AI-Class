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

          /**
         * ═══ Part 9: 验证 Course（基于 Schema） ═══
         */
        validateCourse: function(course) {
            var errors = [];
            var warnings = [];

            if (!course.id) {
                errors.push({ field: 'id', message: 'Course id is required' });
            } else if (!course.id.startsWith('course-')) {
                warnings.push({ field: 'id', message: 'Course id should start with "course-"' });
            }

            if (!course.title) {
                errors.push({ field: 'title', message: 'Course title is required' });
            }

            if (!course.schoolId) {
                errors.push({ field: 'schoolId', message: 'Course schoolId is required' });
            } else if (!['business', 'art', 'science'].includes(course.schoolId)) {
                errors.push({ field: 'schoolId', message: 'schoolId must be business, art, or science' });
            }

            if (!course.version) {
                errors.push({ field: 'version', message: 'Course version is required' });
            } else if (!/^\d+\.\d+\.\d+$/.test(course.version)) {
                errors.push({ field: 'version', message: 'Version must follow semantic versioning' });
            }

            if (course.subjects && !Array.isArray(course.subjects)) {
                errors.push({ field: 'subjects', message: 'subjects must be an array' });
            }

            if (course.difficulty && !['beginner', 'intermediate', 'advanced', 'expert', 'mixed', 'adaptive'].includes(course.difficulty)) {
                warnings.push({ field: 'difficulty', message: 'Invalid difficulty value: ' + course.difficulty });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                courseId: course.id || 'unknown'
            };
        },

        /**
         * ═══ Part 9: 验证 Subject（基于 Schema） ═══
         */
        validateSubject: function(subject) {
            var errors = [];
            var warnings = [];

            if (!subject.id) {
                errors.push({ field: 'id', message: 'Subject id is required' });
            } else if (!subject.id.startsWith('subject-')) {
                warnings.push({ field: 'id', message: 'Subject id should start with "subject-"' });
            }

            if (!subject.title) {
                errors.push({ field: 'title', message: 'Subject title is required' });
            }

            if (!subject.courseId) {
                errors.push({ field: 'courseId', message: 'Subject courseId is required' });
            } else if (!subject.courseId.startsWith('course-')) {
                warnings.push({ field: 'courseId', message: 'Subject courseId should start with "course-"' });
            }

            if (!subject.version) {
                errors.push({ field: 'version', message: 'Subject version is required' });
            } else if (!/^\d+\.\d+\.\d+$/.test(subject.version)) {
                errors.push({ field: 'version', message: 'Version must follow semantic versioning' });
            }

            if (subject.lessons && !Array.isArray(subject.lessons)) {
                errors.push({ field: 'lessons', message: 'lessons must be an array' });
            }

            if (subject.difficulty && !['foundation', 'beginner', 'intermediate', 'advanced', 'expert', 'mixed'].includes(subject.difficulty)) {
                warnings.push({ field: 'difficulty', message: 'Invalid difficulty value: ' + subject.difficulty });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                subjectId: subject.id || 'unknown'
            };
        },

        /**
         * ═══ Part 9: 验证完整层级（Course → Subject → Lesson） ═══
         */
        validateFullHierarchy: function(course, subjects, lessons) {
            var results = {
                course: this.validateCourse(course),
                subjects: [],
                lessons: [],
                valid: true,
                errors: [],
                warnings: []
            };

            // 验证 Course
            if (!results.course.valid) {
                results.valid = false;
                results.errors.push({ level: 'course', errors: results.course.errors });
            }

            // 验证每个 Subject
            for (var i = 0; i < subjects.length; i++) {
                var subjectResult = this.validateSubject(subjects[i]);
                results.subjects.push(subjectResult);
                if (!subjectResult.valid) {
                    results.valid = false;
                    results.errors.push({ level: 'subject', id: subjects[i].id, errors: subjectResult.errors });
                }
            }

            // 验证每个 Lesson
            for (var j = 0; j < lessons.length; j++) {
                var lessonResult = this.validateLesson(lessons[j]);
                results.lessons.push(lessonResult);
                if (!lessonResult.valid) {
                    results.valid = false;
                    results.errors.push({ level: 'lesson', id: lessons[j].id, errors: lessonResult.errors });
                }
            }

            // 检查引用完整性
            // Course → Subjects
            if (course.subjects) {
                for (var k = 0; k < course.subjects.length; k++) {
                    var subjectId = course.subjects[k];
                    var found = subjects.some(function(s) { return s.id === subjectId; });
                    if (!found) {
                        results.warnings.push({ level: 'course', message: 'Course references subject not found: ' + subjectId });
                    }
                }
            }

            // Subject → Lessons
            for (var l = 0; l < subjects.length; l++) {
                var subject = subjects[l];
                if (subject.lessons) {
                    for (var m = 0; m < subject.lessons.length; m++) {
                        var lessonId = subject.lessons[m];
                        var found = lessons.some(function(ls) { return ls.id === lessonId; });
                        if (!found) {
                            results.warnings.push({ level: 'subject', id: subject.id, message: 'Subject references lesson not found: ' + lessonId });
                        }
                    }
                }
            }

            // Lesson → Subject 反向检查
            for (var n = 0; n < lessons.length; n++) {
                var lesson = lessons[n];
                if (lesson.subjectId) {
                    var found = subjects.some(function(s) { return s.id === lesson.subjectId; });
                    if (!found) {
                        results.warnings.push({ level: 'lesson', id: lesson.id, message: 'Lesson references subject not found: ' + lesson.subjectId });
                    }
                }
            }

            return results;
        }

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
