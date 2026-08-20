// js/academy/contentValidator.js
// S4 扩展 — Lesson Contract 验证

(function() {
    'use strict';

    if (!window.LawAIApp) window.LawAIApp = {};

    // ============================================================
    // ContentValidator — S4 扩展
    // ============================================================
    const ContentValidator = {
        _schema: null,

        /**
         * 加载 Lesson Schema
         */
        loadSchema: async function() {
            if (this._schema) return this._schema;
            try {
                const resp = await fetch('/content/schema/lesson.schema.json');
                if (resp.ok) {
                    this._schema = await resp.json();
                    console.log('[ContentValidator] Schema loaded');
                    return this._schema;
                }
            } catch (e) {
                console.warn('[ContentValidator] Could not load schema, using embedded validation');
            }
            return null;
        },

        /**
         * 验证单个 Lesson
         */
        validateLesson: function(lesson) {
            const errors = [];
            const warnings = [];

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
                errors.push({ field: 'version', message: 'Version must follow semantic versioning (e.g., 1.0.0)' });
            }

            // ── 2. 可选字段验证 ──
            if (lesson.estimatedMinutes !== undefined && typeof lesson.estimatedMinutes !== 'number') {
                errors.push({ field: 'estimatedMinutes', message: 'estimatedMinutes must be a number' });
            }

            if (lesson.difficulty) {
                const validDifficulties = ['foundation', 'beginner', 'intermediate', 'advanced', 'expert', 'mixed'];
                if (!validDifficulties.includes(lesson.difficulty)) {
                    warnings.push({ field: 'difficulty', message: 'Invalid difficulty value: ' + lesson.difficulty });
                }
            }

            // ── 3. 验证 sections ──
            if (lesson.sections) {
                if (!Array.isArray(lesson.sections)) {
                    errors.push({ field: 'sections', message: 'sections must be an array' });
                } else {
                    const validTypes = ['foundation', 'core', 'intermediate', 'advanced', 'expert', 'application', 'practice', 'summary'];
                    for (let i = 0; i < lesson.sections.length; i++) {
                        const section = lesson.sections[i];
                        if (!section.id) {
                            warnings.push({ field: 'sections[' + i + ']', message: 'Section missing id' });
                        }
                        if (!section.type) {
                            errors.push({ field: 'sections[' + i + ']', message: 'Section missing type' });
                        } else if (!validTypes.includes(section.type)) {
                            warnings.push({ field: 'sections[' + i + ']', message: 'Invalid section type: ' + section.type });
                        }
                        if (!section.title) {
                            warnings.push({ field: 'sections[' + i + ']', message: 'Section missing title' });
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
                    for (let i = 0; i < lesson.flashcards.length; i++) {
                        const fc = lesson.flashcards[i];
                        if (!fc.id) {
                            warnings.push({ field: 'flashcards[' + i + ']', message: 'Flashcard missing id' });
                        }
                        if (!fc.front) {
                            errors.push({ field: 'flashcards[' + i + ']', message: 'Flashcard missing front' });
                        }
                        if (!fc.back) {
                            errors.push({ field: 'flashcards[' + i + ']', message: 'Flashcard missing back' });
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
                } else {
                    const validProviders = ['chatgpt', 'claude', 'gemini', 'deepseek', 'perplexity', 'copilot', 'grok', 'qwen', 'mistral', 'other'];
                    for (let i = 0; i < lesson.aiTools.length; i++) {
                        const tool = lesson.aiTools[i];
                        if (!tool.provider) {
                            warnings.push({ field: 'aiTools[' + i + ']', message: 'AI tool missing provider' });
                        } else if (!validProviders.includes(tool.provider)) {
                            warnings.push({ field: 'aiTools[' + i + ']', message: 'Unknown AI provider: ' + tool.provider });
                        }
                    }
                }
            }

            // ── 8. 验证 relatedLessons ──
            if (lesson.relatedLessons) {
                if (!Array.isArray(lesson.relatedLessons)) {
                    errors.push({ field: 'relatedLessons', message: 'relatedLessons must be an array' });
                } else {
                    for (let i = 0; i < lesson.relatedLessons.length; i++) {
                        const ref = lesson.relatedLessons[i];
                        if (typeof ref !== 'string' || !ref.startsWith('lesson-')) {
                            warnings.push({ field: 'relatedLessons[' + i + ']', message: 'Invalid related lesson reference: ' + ref });
                        }
                    }
                }
            }

            // ── 9. 验证 resources ──
            if (lesson.resources) {
                if (!Array.isArray(lesson.resources)) {
                    errors.push({ field: 'resources', message: 'resources must be an array' });
                } else {
                    const validTypes = ['documentation', 'article', 'video', 'github', 'paper', 'tool', 'website', 'book', 'dataset'];
                    for (let i = 0; i < lesson.resources.length; i++) {
                        const resource = lesson.resources[i];
                        if (!resource.title) {
                            warnings.push({ field: 'resources[' + i + ']', message: 'Resource missing title' });
                        }
                        if (resource.type && !validTypes.includes(resource.type)) {
                            warnings.push({ field: 'resources[' + i + ']', message: 'Invalid resource type: ' + resource.type });
                        }
                    }
                }
            }

            // ── 10. 检查 moduleId（允许 null，但不允许其他非字符串） ──
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
         * 批量验证 Lessons
         */
        validateLessons: function(lessons) {
            if (!Array.isArray(lessons)) {
                return { valid: false, errors: ['Lessons must be an array'], results: [] };
            }

            const results = [];
            let hasErrors = false;

            for (let i = 0; i < lessons.length; i++) {
                const result = this.validateLesson(lessons[i]);
                results.push(result);
                if (!result.valid) hasErrors = true;
            }

            return {
                valid: !hasErrors,
                total: lessons.length,
                validCount: results.filter(r => r.valid).length,
                invalidCount: results.filter(r => !r.valid).length,
                results: results
            };
        },

        /**
         * 验证 Course → Subject → Lesson 完整层级
         */
        validateHierarchy: function(course, subjects, lessons) {
            const errors = [];
            const warnings = [];

            // 检查 Subject 是否属于 Course
            if (course && course.subjects) {
                for (const subjectId of course.subjects) {
                    const subject = subjects.find(s => s.id === subjectId);
                    if (!subject) {
                        errors.push({
                            level: 'course',
                            message: 'Course references subject not found: ' + subjectId
                        });
                    }
                }
            }

            // 检查 Lesson 是否属于 Subject
            for (const subject of subjects) {
                if (subject.lessons) {
                    for (const lessonId of subject.lessons) {
                        const lesson = lessons.find(l => l.id === lessonId);
                        if (!lesson) {
                            errors.push({
                                level: 'subject',
                                message: 'Subject ' + subject.id + ' references lesson not found: ' + lessonId
                            });
                        } else if (lesson.subjectId !== subject.id) {
                            warnings.push({
                                level: 'lesson',
                                message: 'Lesson ' + lessonId + ' has subjectId ' + lesson.subjectId + ' but is referenced by Subject ' + subject.id
                            });
                        }
                    }
                }
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                totalSubjects: subjects.length,
                totalLessons: lessons.length
            };
        },

        /**
         * 验证 Course 数据
         */
        validateCourse: function(course) {
            const errors = [];
            const warnings = [];

            if (!course.id) {
                errors.push({ field: 'id', message: 'Course id is required' });
            } else if (!course.id.startsWith('course-')) {
                warnings.push({ field: 'id', message: 'Course id should start with "course-"' });
            }

            if (!course.title) {
                errors.push({ field: 'title', message: 'Course title is required' });
            }

            if (!course.school) {
                warnings.push({ field: 'school', message: 'Course school is recommended' });
            } else if (!['business', 'art', 'science'].includes(course.school)) {
                warnings.push({ field: 'school', message: 'Course school should be business, art, or science' });
            }

            if (!course.version) {
                errors.push({ field: 'version', message: 'Course version is required' });
            }

            if (course.subjects && !Array.isArray(course.subjects)) {
                errors.push({ field: 'subjects', message: 'subjects must be an array' });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                courseId: course.id || 'unknown'
            };
        },

        /**
         * 验证 Subject 数据
         */
        validateSubject: function(subject) {
            const errors = [];
            const warnings = [];

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
            }

            if (subject.lessons && !Array.isArray(subject.lessons)) {
                errors.push({ field: 'lessons', message: 'lessons must be an array' });
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                subjectId: subject.id || 'unknown'
            };
        }
    };

    // ============================================================
    // Export
    // ============================================================
    window.LawAIApp.ContentValidator = ContentValidator;

    console.log('[ContentValidator] ✅ S4 Lesson Contract Validator ready');

})();
