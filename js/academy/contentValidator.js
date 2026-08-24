// ============================================================
// contentValidator.js
// S4 Content Validator — Course / Subject / Lesson Contract
// Location: js/academy/contentValidator.js
// ============================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ContentValidator = {

    // ============================================================
    // 原有方法：基本字段验证
    // ============================================================
    validate: function(contentObj) {
        var errors = [];
        var required = ['contentId', 'academyId', 'type', 'status'];
        for (var i = 0; i < required.length; i++) {
            var f = required[i];
            if (!contentObj[f]) errors.push('Missing required field: ' + f);
        }
        var validTypes = ['lesson', 'quiz', 'practice', 'project', 'resource', 'glossary', 'faq', 'challenge', 'case_study', 'reference'];
        if (contentObj.type && validTypes.indexOf(contentObj.type) === -1) {
            errors.push('Invalid type: ' + contentObj.type);
        }
        var validStatuses = ['draft', 'review', 'qa', 'published', 'deprecated', 'archived'];
        if (contentObj.status && validStatuses.indexOf(contentObj.status) === -1) {
            errors.push('Invalid status: ' + contentObj.status);
        }
        return errors;
    },

    // 检查引用的完整性（如 courseId, lessonId 是否存在）
    validateReferences: function(contentObj) {
        var errors = [];
        if (contentObj.academyId && !LawAIApp.AcademyData?.getAcademyById?.(contentObj.academyId)) {
            errors.push('Academy ' + contentObj.academyId + ' not found');
        }
        if (contentObj.courseId && !LawAIApp.CourseData?.getById?.(contentObj.courseId)) {
            errors.push('Course ' + contentObj.courseId + ' not found');
        }
        if (contentObj.moduleId && !LawAIApp.ModuleData?.getById?.(contentObj.moduleId)) {
            errors.push('Module ' + contentObj.moduleId + ' not found');
        }
        if (contentObj.lessonId) {
            var lesson = LawAIApp.LessonEngine?.getLessonByDay?.(parseInt(contentObj.lessonId.split('-')[1]));
            if (!lesson) errors.push('Lesson ' + contentObj.lessonId + ' not found');
        }
        return errors;
    },

    // 检查唯一性（同一内容ID只能有一个）
    isUnique: function(contentId) {
        return !LawAIApp.ContentRegistry?.get?.(contentId);
    },

    // 完整验证并返回结果
    fullCheck: function(contentObj) {
        var basic = this.validate(contentObj);
        var refs = this.validateReferences(contentObj);
        var unique = this.isUnique(contentObj.contentId);
        if (!unique) basic.push('Duplicate contentId');
        var allErrors = basic.concat(refs);
        LawAIApp.EventBus?.emit?.('ContentValidated', { contentId: contentObj.contentId, errors: allErrors });
        return { valid: allErrors.length === 0, errors: allErrors };
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
        } else if (!course.schoolId.startsWith('school-')) {
            warnings.push({ field: 'schoolId', message: 'schoolId should start with "school-"' });
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

    // ============================================================
    // ═══ Part 9: 验证 Subject（基于 Schema） ═══
    // ============================================================
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

        if (subject.difficulty) {
            var validDifficulties = ['foundation', 'beginner', 'intermediate', 'advanced', 'expert', 'mixed'];
            if (validDifficulties.indexOf(subject.difficulty) === -1) {
                warnings.push({ field: 'difficulty', message: 'Invalid difficulty value: ' + subject.difficulty });
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            subjectId: subject.id || 'unknown'
        };
    },

    // ============================================================
    // ═══ Part 5: 验证 Lesson（基于 Schema） ═══
    // ============================================================
    validateLesson: function(lesson) {
        var errors = [];
        var warnings = [];

        // ── 1. 必需字段 ──
        if (!lesson.id) {
            errors.push({ field: 'id', message: 'Lesson id is required' });
        } else if (!lesson.id.startsWith('lesson-')) {
            warnings.push({ field: 'id', message: 'Lesson id should start with "lesson-"' });
        }

        if (!lesson.title) {
            errors.push({ field: 'title', message: 'Lesson title is required' });
        }

        if (!lesson.subjectId) {
            errors.push({ field: 'subjectId', message: 'subjectId is required' });
        } else if (!lesson.subjectId.startsWith('subject-')) {
            warnings.push({ field: 'subjectId', message: 'subjectId should start with "subject-"' });
        }

        if (!lesson.version) {
            errors.push({ field: 'version', message: 'Lesson version is required' });
        } else if (!/^\d+\.\d+\.\d+$/.test(lesson.version)) {
            errors.push({ field: 'version', message: 'Version must follow semantic versioning' });
        }

        // ── 2. 可选字段验证 ──
        if (lesson.estimatedMinutes !== undefined && typeof lesson.estimatedMinutes !== 'number') {
            errors.push({ field: 'estimatedMinutes', message: 'estimatedMinutes must be a number' });
        }

        if (lesson.difficulty) {
            var validDifficulties = ['foundation', 'beginner', 'intermediate', 'advanced', 'expert', 'mixed'];
            if (validDifficulties.indexOf(lesson.difficulty) === -1) {
                warnings.push({ field: 'difficulty', message: 'Invalid difficulty value: ' + lesson.difficulty });
            }
        }

        // ── 3. 验证 sections ──
        if (lesson.sections) {
            if (!Array.isArray(lesson.sections)) {
                errors.push({ field: 'sections', message: 'sections must be an array' });
            } else {
                var validSectionTypes = ['foundation', 'core', 'intermediate', 'advanced', 'expert', 'application', 'practice', 'summary'];
                for (var i = 0; i < lesson.sections.length; i++) {
                    var section = lesson.sections[i];
                    if (!section.id) {
                        warnings.push({ field: 'sections[' + i + ']', message: 'Section missing id' });
                    }
                    if (!section.type) {
                        errors.push({ field: 'sections[' + i + ']', message: 'Section missing type' });
                    } else if (validSectionTypes.indexOf(section.type) === -1) {
                        warnings.push({ field: 'sections[' + i + ']', message: 'Invalid section type: ' + section.type });
                    }
                }
            }
        }

        // ── 4. 验证 video ──
        if (lesson.video) {
            if (typeof lesson.video !== 'object') {
                errors.push({ field: 'video', message: 'video must be an object or null' });
            } else {
                if (!lesson.video.provider) {
                    warnings.push({ field: 'video.provider', message: 'Video provider missing' });
                }
                if (!lesson.video.url) {
                    warnings.push({ field: 'video.url', message: 'Video URL missing' });
                }
            }
        }

        // ── 5. 验证 flashcards ──
        if (lesson.flashcards) {
            if (!Array.isArray(lesson.flashcards)) {
                errors.push({ field: 'flashcards', message: 'flashcards must be an array' });
            } else {
                for (var j = 0; j < lesson.flashcards.length; j++) {
                    var fc = lesson.flashcards[j];
                    if (!fc.front) {
                        errors.push({ field: 'flashcards[' + j + ']', message: 'Flashcard missing front' });
                    }
                    if (!fc.back) {
                        errors.push({ field: 'flashcards[' + j + ']', message: 'Flashcard missing back' });
                    }
                }
            }
        }

        // ── 6. 验证 practice ──
        if (lesson.practice) {
            if (typeof lesson.practice !== 'object') {
                errors.push({ field: 'practice', message: 'practice must be an object' });
            } else {
                if (lesson.practice.items && !Array.isArray(lesson.practice.items)) {
                    errors.push({ field: 'practice.items', message: 'practice.items must be an array' });
                }
            }
        }

        // ── 7. 验证 aiTools ──
        if (lesson.aiTools) {
            if (!Array.isArray(lesson.aiTools)) {
                errors.push({ field: 'aiTools', message: 'aiTools must be an array' });
            }
        }

        // ── 8. 验证 relatedLessons ──
        if (lesson.relatedLessons) {
            if (!Array.isArray(lesson.relatedLessons)) {
                errors.push({ field: 'relatedLessons', message: 'relatedLessons must be an array' });
            }
        }

        // ── 9. 验证 resources ──
        if (lesson.resources) {
            if (!Array.isArray(lesson.resources)) {
                errors.push({ field: 'resources', message: 'resources must be an array' });
            }
        }

        // ── 10. 检查 moduleId（允许 null） ──
        if (lesson.moduleId !== undefined && lesson.moduleId !== null && typeof lesson.moduleId !== 'string') {
            warnings.push({ field: 'moduleId', message: 'moduleId should be string or null' });
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            lessonId: lesson.id || 'unknown'
        };
    },

            /**
         * ═══ Part 26: 验证 Lesson 体验完整性 ═══
         * 检查 Lesson 是否包含足够的学习体验元素
         * 仅警告，不阻断（因为不是所有 Lesson 都需要所有元素）
         */
        validateLessonExperience: function(lesson) {
            var warnings = [];
            var info = [];

            if (!lesson.estimatedMinutes && lesson.estimatedMinutes !== 0) {
                warnings.push({ field: 'estimatedMinutes', message: 'No estimated time provided' });
            } else if (lesson.estimatedMinutes < 5) {
                warnings.push({ field: 'estimatedMinutes', message: 'Very short lesson: ' + lesson.estimatedMinutes + ' min' });
            }

            if (!lesson.learningObjectives || lesson.learningObjectives.length === 0) {
                warnings.push({ field: 'learningObjectives', message: 'No learning objectives defined' });
            }

            if (!lesson.sections || lesson.sections.length === 0) {
                warnings.push({ field: 'sections', message: 'No content sections found' });
            }

            if (lesson.video && typeof lesson.video === 'object') {
                if (!lesson.video.url) {
                    warnings.push({ field: 'video.url', message: 'Video enabled but URL missing' });
                } else {
                    info.push({ field: 'video', message: 'Video content present' });
                }
            }

            if (lesson.practice && lesson.practice.enabled) {
                if (!lesson.practice.items || lesson.practice.items.length === 0) {
                    warnings.push({ field: 'practice.items', message: 'Practice enabled but no items found' });
                } else {
                    info.push({ field: 'practice', message: 'Practice content present (' + lesson.practice.items.length + ' items)' });
                }
            }

            if (lesson.flashcards && lesson.flashcards.length > 0) {
                info.push({ field: 'flashcards', message: 'Flashcards present (' + lesson.flashcards.length + ' cards)' });
            }

            if (lesson.notes && lesson.notes.keyPoints && lesson.notes.keyPoints.length > 0) {
                info.push({ field: 'notes', message: 'Notes present (' + lesson.notes.keyPoints.length + ' key points)' });
            }

            if (lesson.quiz && lesson.quiz.length > 0) {
                info.push({ field: 'quiz', message: 'Quiz present (' + lesson.quiz.length + ' questions)' });
            }

            if (lesson.aiTools && lesson.aiTools.length > 0) {
                info.push({ field: 'aiTools', message: 'AI tools recommended (' + lesson.aiTools.length + ' providers)' });
            }

            return {
                lessonId: lesson.id || 'unknown',
                valid: true, // 不阻断，仅报告
                warnings: warnings,
                info: info,
                hasVideo: !!(lesson.video && lesson.video.url),
                hasPractice: !!(lesson.practice && lesson.practice.enabled && lesson.practice.items && lesson.practice.items.length > 0),
                hasFlashcards: !!(lesson.flashcards && lesson.flashcards.length > 0),
                hasNotes: !!(lesson.notes && lesson.notes.keyPoints && lesson.notes.keyPoints.length > 0),
                hasQuiz: !!(lesson.quiz && lesson.quiz.length > 0),
                hasAITools: !!(lesson.aiTools && lesson.aiTools.length > 0),
                hasSections: !!(lesson.sections && lesson.sections.length > 0)
            };
        },

    // ============================================================
    // ═══ Part 9: 验证完整层级（Course → Subject → Lesson） ═══
    // ============================================================
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

        // 检查引用完整性：Course → Subjects
        if (course.subjects) {
            for (var k = 0; k < course.subjects.length; k++) {
                var subjectId = course.subjects[k];
                var found = false;
                for (var s = 0; s < subjects.length; s++) {
                    if (subjects[s].id === subjectId) { found = true; break; }
                }
                if (!found) {
                    results.warnings.push({ level: 'course', message: 'Course references subject not found: ' + subjectId });
                }
            }
        }

        // 检查引用完整性：Subject → Lessons
        for (var l = 0; l < subjects.length; l++) {
            var subject = subjects[l];
            if (subject.lessons) {
                for (var m = 0; m < subject.lessons.length; m++) {
                    var lessonId = subject.lessons[m];
                    var found = false;
                    for (var ls = 0; ls < lessons.length; ls++) {
                        if (lessons[ls].id === lessonId) { found = true; break; }
                    }
                    if (!found) {
                        results.warnings.push({ level: 'subject', id: subject.id, message: 'Subject references lesson not found: ' + lessonId });
                    }
                }
            }
        }

        // 检查引用完整性：Lesson → Subject 反向检查
        for (var n = 0; n < lessons.length; n++) {
            var lesson = lessons[n];
            if (lesson.subjectId) {
                var found = false;
                for (var s2 = 0; s2 < subjects.length; s2++) {
                    if (subjects[s2].id === lesson.subjectId) { found = true; break; }
                }
                if (!found) {
                    results.warnings.push({ level: 'lesson', id: lesson.id, message: 'Lesson references subject not found: ' + lesson.subjectId });
                }
            }
        }

        return results;
    },

        /**
         * ═══ Part 22: 验证生成请求 ═══
         */
        validateGenerationRequest: function(request) {
            var errors = [];
            var warnings = [];

            if (!request.topic) {
                errors.push({ field: 'topic', message: 'Topic is required' });
            }

            if (request.level && !['beginner', 'intermediate', 'advanced', 'adaptive'].includes(request.level)) {
                warnings.push({ field: 'level', message: 'Invalid level value: ' + request.level });
            }

            if (request.style && !['practical', 'theoretical', 'mixed'].includes(request.style)) {
                warnings.push({ field: 'style', message: 'Invalid style value: ' + request.style });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        },

        /**
         * ═══ Part 22: 验证课程蓝图 ═══
         */
        validateCourseBlueprint: function(blueprint) {
            var errors = [];
            var warnings = [];

            if (!blueprint.id) {
                errors.push({ field: 'id', message: 'Course ID is required' });
            } else if (!blueprint.id.startsWith('course-')) {
                warnings.push({ field: 'id', message: 'Course ID should start with "course-"' });
            }

            if (!blueprint.title) {
                errors.push({ field: 'title', message: 'Course title is required' });
            }

            if (!blueprint.schoolId) {
                errors.push({ field: 'schoolId', message: 'School ID is required' });
            } else if (!['school-business', 'school-art', 'school-science'].includes(blueprint.schoolId)) {
                warnings.push({ field: 'schoolId', message: 'School ID should be school-business, school-art, or school-science' });
            }

            if (!blueprint.version) {
                errors.push({ field: 'version', message: 'Version is required' });
            }

            if (blueprint.subjects && !Array.isArray(blueprint.subjects)) {
                errors.push({ field: 'subjects', message: 'subjects must be an array' });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                blueprintId: blueprint.id || 'unknown'
            };
        },

        /**
         * ═══ Part 22: 验证完整生成蓝图 ═══
         */
        validateGenerationBlueprint: function(blueprint) {
            var results = {
                request: this.validateGenerationRequest(blueprint.request || {}),
                course: this.validateCourseBlueprint(blueprint.course || {}),
                subjects: [],
                valid: true,
                errors: [],
                warnings: []
            };

            // 验证 Course
            if (!results.course.valid) {
                results.valid = false;
                results.errors.push({ level: 'course', errors: results.course.errors });
            }

            // 验证 Subjects
            if (blueprint.subjects && Array.isArray(blueprint.subjects)) {
                for (var i = 0; i < blueprint.subjects.length; i++) {
                    var subject = blueprint.subjects[i];
                    var subjectResult = this.validateSubject(subject);
                    results.subjects.push(subjectResult);
                    if (!subjectResult.valid) {
                        results.valid = false;
                        results.errors.push({ level: 'subject', id: subject.id, errors: subjectResult.errors });
                    }
                }
            }

            // 验证 Lessons（如果有）
            if (blueprint.subjects) {
                for (var j = 0; j < blueprint.subjects.length; j++) {
                    var subj = blueprint.subjects[j];
                    if (subj.lessons && Array.isArray(subj.lessons)) {
                        for (var k = 0; k < subj.lessons.length; k++) {
                            var lesson = subj.lessons[k];
                            var lessonResult = this.validateLesson(lesson);
                            if (!lessonResult.valid) {
                                results.valid = false;
                                results.errors.push({ level: 'lesson', id: lesson.id, errors: lessonResult.errors });
                            }
                        }
                    }
                }
            }

            return results;
        },

    // ============================================================
    // ═══ 批量验证 ═══
    // ============================================================
    validateLessons: function(lessons) {
        if (!Array.isArray(lessons)) {
            return { valid: false, errors: ['Lessons must be an array'], results: [] };
        }

        var results = [];
        var hasErrors = false;

        for (var i = 0; i < lessons.length; i++) {
            var result = this.validateLesson(lessons[i]);
            results.push(result);
            if (!result.valid) hasErrors = true;
        }

        return {
            valid: !hasErrors,
            total: lessons.length,
            validCount: 0,
            invalidCount: 0,
            results: results
        };
    }
};

console.log('[ContentValidator] ✅ S4 Course/Subject/Lesson Validator ready');
