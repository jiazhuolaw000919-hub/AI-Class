// /js/school/SchoolViewModel.js
// Part 166 — School View Model
// v1.0.2 — 修复 buildSubjectDetail 中的 lessonId = [object Object]
//
// ⚠️ v1.0.2 变更:
//   1. buildSubjectDetail 不再调用不存在的 SubjectRegistry.getLessonsBySubject
//      和 CurriculumAuthority.getLessonsBySubject，改为直接从 subject.lessons 读取
//   2. lesson 数组 normalize：字符串 / 对象两种格式都兼容
//   3. lessonId 保证是字符串，永不出现 [object Object]
//   4. course 查找增加 CourseRegistry fallback
//   5. _getSubjects 保持 v1.0.1 行为（SubjectRegistry 优先）

(function() {
    'use strict';

    var SchoolViewModel = {
        version: '1.0.2',

        // ============================================================
        // 🔥 通用：把任意 lesson 数据结构 normalize 成标准对象
        // 兼容：字符串 id / 完整对象 / 缺失字段
        // ============================================================
        _normalizeLesson: function(l, idx) {
            idx = typeof idx === 'number' ? idx : 0;

            // 情况 1: 字符串 → 转成对象
            if (typeof l === 'string') {
                return {
                    id: l,
                    lessonId: l,
                    title: l,
                    name: l,
                    description: '',
                    order: idx + 1,
                    duration: null,
                    type: 'reading'
                };
            }

            // 情况 2: 数字（极端情况）→ 转成字符串 id
            if (typeof l === 'number') {
                var sid = 'lesson-' + l;
                return {
                    id: sid,
                    lessonId: sid,
                    title: 'Lesson ' + l,
                    name: 'Lesson ' + l,
                    description: '',
                    order: idx + 1,
                    duration: null,
                    type: 'reading'
                };
            }

            // 情况 3: null / undefined → 返回空占位
            if (!l || typeof l !== 'object') {
                return {
                    id: 'lesson-unknown-' + (idx + 1),
                    lessonId: 'lesson-unknown-' + (idx + 1),
                    title: 'Untitled Lesson',
                    name: 'Untitled Lesson',
                    description: '',
                    order: idx + 1,
                    duration: null,
                    type: 'reading'
                };
            }

            // 情况 4: 对象 → 提取字段
            var lessonId = l.id || l.lessonId || l.slug || l.file || ('lesson-' + (idx + 1));

            return {
                // 原始对象保留
                _raw: l,
                id: lessonId,
                lessonId: lessonId,
                title: l.title || l.name || ('Lesson ' + (idx + 1)),
                name: l.title || l.name || ('Lesson ' + (idx + 1)),
                description: l.description || '',
                order: l.order !== undefined ? l.order : (idx + 1),
                duration: l.duration || l.estimatedMinutes || null,
                type: l.type || 'reading',
                subjectId: l.subjectId || null,
                courseId: l.courseId || null,
                status: l.status || null
            };
        },

        // ============================================================
        // 🔥 通用：把任意 subject 数据结构 normalize 成标准对象
        // ============================================================
        _normalizeSubject: function(s, idx) {
            idx = typeof idx === 'number' ? idx : 0;

            if (!s) {
                return null;
            }

            // 字符串 → 极简对象
            if (typeof s === 'string') {
                return {
                    id: s,
                    subjectId: s,
                    title: s,
                    name: s,
                    description: '',
                    lessons: []
                };
            }

            if (typeof s !== 'object') {
                return null;
            }

            var rawLessons = Array.isArray(s.lessons) ? s.lessons : [];
            var self = this;
            var normalizedLessons = rawLessons.map(function(l, i) {
                return self._normalizeLesson(l, i);
            });

            var subjectId = s.id || s.subjectId || ('subject-' + (idx + 1));

            return {
                _raw: s,
                id: subjectId,
                subjectId: subjectId,
                courseId: s.courseId || null,
                title: s.title || s.name || ('Subject ' + (idx + 1)),
                name: s.title || s.name || ('Subject ' + (idx + 1)),
                description: s.description || '',
                icon: s.icon || '📖',
                status: s.status || 'published',
                level: s.level || null,
                estimatedHours: s.estimatedHours || null,
                order: s.order !== undefined ? s.order : (idx + 1),
                // 🔥 lessons 统一为对象数组
                lessons: normalizedLessons,
                // 🔥 同时提供一个纯 id 数组，方便下游使用
                lessonIds: normalizedLessons.map(function(l) { return l.id; }),
                learningObjectives: s.learningObjectives || s.objectives || []
            };
        },

        /**
         * 🔥 统一获取 subjects（优先 SubjectRegistry，fallback CurriculumAuthority）
         * v1.0.2: 增加 normalize
         */
        _getSubjects: function(courseId) {
            if (!courseId) return [];

            var raw = [];

            // 1. 优先从 SubjectRegistry 拿
            var sr = window.LawAIApp?.SubjectRegistry;
            if (sr && typeof sr.getSubjectsByCourse === 'function') {
                try {
                    var srSubjects = sr.getSubjectsByCourse(courseId);
                    if (srSubjects && srSubjects.length > 0) {
                        raw = srSubjects;
                    }
                } catch (e) {}
            }

            // 2. Fallback: CurriculumAuthority（兼容旧方法名）
            if (raw.length === 0) {
                var ca = window.LawAIApp?.CurriculumAuthority;
                if (ca) {
                    var fnNames = ['getSubjectsByCourse', 'getSubjectsForCourse', 'getCourseSubjects'];
                    for (var i = 0; i < fnNames.length; i++) {
                        var fn = ca[fnNames[i]];
                        if (typeof fn === 'function') {
                            try {
                                var caSubjects = fn.call(ca, courseId);
                                if (caSubjects && caSubjects.length > 0) {
                                    raw = caSubjects;
                                    break;
                                }
                            } catch (e) {}
                        }
                    }
                }
            }

            // 3. Normalize
            var self = this;
            return raw.map(function(s, i) {
                return self._normalizeSubject(s, i);
            }).filter(function(s) { return s !== null; });
        },

        /**
         * 构建单个 School 的 ViewModel
         */
        buildSchoolCard: function(schoolId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return this._getUnknownSchool(schoolId);
            }

            var school = curriculum.getSchool(schoolId);
            if (!school) {
                return this._getUnknownSchool(schoolId);
            }

            var courses = curriculum.getCoursesBySchool(schoolId) || [];

            // 从 Progress 读取进度（只读）
            var progressSummary = this._getProgressSummary(schoolId, courses);

            return {
                schoolId: school.id,
                name: school.name || 'Untitled School',
                description: school.description || '',
                icon: school.icon || '🏛️',
                courseCount: courses.length,
                availableCourseCount: courses.filter(function(c) {
                    return c.status !== 'ARCHIVED';
                }).length,
                progressSummary: progressSummary,
                status: school.status || 'ACTIVE'
            };
        },

        /**
         * 构建 School 列表
         */
        buildSchoolList: function() {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return { schools: [], status: 'LOADING' };
            }

            var schools = curriculum.getActiveSchools ? curriculum.getActiveSchools() : [];
            if (!schools || schools.length === 0) {
                return { schools: [], status: 'EMPTY' };
            }

            var self = this;
            return {
                schools: schools.map(function(s) {
                    return self.buildSchoolCard(s.id);
                }),
                status: 'READY'
            };
        },

        /**
         * 构建 School 详情（含 Course 列表）
         */
        buildSchoolDetail: function(schoolId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return { school: null, courses: [], status: 'LOADING' };
            }

            var school = curriculum.getSchool(schoolId);
            if (!school) {
                return { school: null, courses: [], status: 'NOT_FOUND' };
            }

            var courses = curriculum.getCoursesBySchool(schoolId) || [];
            var self = this;

            return {
                school: this.buildSchoolCard(schoolId),
                courses: courses.map(function(c) {
                    return self.buildCourseCard(c.id);
                }),
                status: 'READY'
            };
        },

        /**
         * 构建 Course Card
         */
        buildCourseCard: function(courseId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return this._getUnknownCourse(courseId);
            }

            var course = curriculum.getCourse(courseId);
            if (!course) {
                return this._getUnknownCourse(courseId);
            }

            // 🔥 统一从 _getSubjects 拿
            var subjects = this._getSubjects(courseId);

            // 从 Progress 读取（只读）
            var progress = this._getCourseProgress(courseId);

            // 从 Mastery 读取（只读）
            var mastery = this._getCourseMastery(courseId);

            return {
                courseId: course.id,
                name: course.title || course.name || 'Untitled Course',
                description: course.description || '',
                icon: course.icon || '📘',
                difficulty: course.difficulty || 'beginner',
                subjectCount: subjects.length,
                status: course.status || 'ACTIVE',
                progress: progress,
                mastery: mastery,
                recommendation: this._getCourseRecommendation(courseId)
            };
        },

        /**
         * 构建 Course 详情（Part 167）
         */
        buildCourseDetail: function(courseId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return { course: null, status: 'LOADING' };
            }

            var course = curriculum.getCourse(courseId);
            if (!course) {
                return { course: null, status: 'NOT_FOUND' };
            }

            // 🔥 统一从 _getSubjects 拿
            var subjects = this._getSubjects(courseId);

            return {
                status: 'READY',

                identity: {
                    courseId: course.id,
                    name: course.title || course.name || 'Untitled Course',
                    description: course.description || '',
                    icon: course.icon || '📘',
                    difficulty: course.difficulty || 'beginner',
                    category: course.category || null,
                    schoolId: course.schoolId || null,
                    status: course.status || 'ACTIVE',
                    estimatedHours: course.estimatedHours || null,
                    source: 'Curriculum'
                },

                learningObjectives: this._getLearningObjectives(course),

                prerequisites: this._getPrerequisites(courseId),

                structure: {
                    subjects: subjects.map(function(s) {
                        return {
                            subjectId: s.id,
                            title: s.title || s.name,
                            description: s.description || '',
                            lessonCount: s.lessons ? s.lessons.length : 0,
                            source: 'SubjectRegistry'
                        };
                    }),
                    subjectCount: subjects.length
                },

                progress: this._getCourseProgress(courseId),
                mastery: this._getCourseMastery(courseId),
                recommendation: this._getCourseRecommendation(courseId),
                schedule: this._getCourseSchedule(courseId),
                notes: this._getCourseNotes(courseId),
                actions: this._getAvailableActions(course, courseId)
            };
        },

        /**
         * ═══════════════════════════════════════════════════════════
         * 🔥🔥🔥 构建 Subject 详情（Part 168）
         * ═══════════════════════════════════════════════════════════
         * v1.0.2 关键修复：
         *   旧代码调用 SubjectRegistry.getLessonsBySubject(subjectId)
         *   和 CurriculumAuthority.getLessonsBySubject(subjectId)，
         *   但这两个方法**根本不存在**，导致 lessons = []，
         *   或者从 fallback 拿到错误的数据结构，最后 lessonId 拼成
         *   [object Object] 塞进 URL。
         *
         *   新代码：直接从 subject.lessons 读取，并 normalize 成
         *   标准对象数组，lessonId 保证是字符串。
         */
        buildSubjectDetail: function(subjectId) {
            if (!subjectId) {
                return { subject: null, status: 'NOT_FOUND' };
            }

            // ── 1. 找 subject ──
            var rawSubject = null;

            // 1.1 优先 SubjectRegistry
            var sr = window.LawAIApp?.SubjectRegistry;
            if (sr && typeof sr.getSubject === 'function') {
                try {
                    rawSubject = sr.getSubject(subjectId);
                } catch (e) {}
            }

            // 1.2 Fallback: CurriculumAuthority
            if (!rawSubject) {
                var curriculum0 = window.LawAIApp?.CurriculumAuthority;
                if (curriculum0 && typeof curriculum0.getSubject === 'function') {
                    try {
                        rawSubject = curriculum0.getSubject(subjectId);
                    } catch (e) {}
                }
            }

            if (!rawSubject) {
                return { subject: null, status: 'NOT_FOUND' };
            }

            // ── 2. Normalize subject（含 lessons）──
            var subject = this._normalizeSubject(rawSubject, 0);
            if (!subject) {
                return { subject: null, status: 'NOT_FOUND' };
            }

            var lessons = subject.lessons || [];  // 已 normalize 成对象数组

            // ── 3. Course context（多源 fallback）──
            var course = null;
            if (subject.courseId) {
                // 3.1 CurriculumAuthority
                var curriculum1 = window.LawAIApp?.CurriculumAuthority;
                if (curriculum1 && typeof curriculum1.getCourse === 'function') {
                    try {
                        course = curriculum1.getCourse(subject.courseId);
                    } catch (e) {}
                }

                // 3.2 CourseRegistry fallback
                if (!course) {
                    var cr = window.LawAIApp?.CourseRegistry;
                    if (cr && typeof cr.getCourse === 'function') {
                        try {
                            course = cr.getCourse(subject.courseId);
                        } catch (e) {}
                    }
                }
            }

            // ── 4. 构建返回值 ──
            return {
                status: 'READY',

                identity: {
                    subjectId: subject.id,
                    title: subject.title || subject.name || 'Untitled Subject',
                    description: subject.description || '',
                    icon: subject.icon || '📖',
                    status: subject.status || 'ACTIVE',
                    level: subject.level || null,
                    estimatedHours: subject.estimatedHours || null,
                    source: 'SubjectRegistry'
                },

                courseContext: course ? {
                    courseId: course.id,
                    title: course.title || course.name,
                    icon: course.icon || '📘',
                    schoolId: course.schoolId || null,
                    source: 'Curriculum'
                } : null,

                learningObjectives: this._getSubjectObjectives(subject),
                prerequisites: this._getSubjectPrerequisites(subjectId),

                structure: {
                    // 🔥 每个 lesson 都是对象，lessonId 保证是字符串
                    lessons: lessons.map(function(l, idx) {
                        return {
                            lessonId: l.id,                 // ← 一定是字符串
                            title: l.title || l.name || ('Lesson ' + (idx + 1)),
                            description: l.description || '',
                            order: l.order !== undefined ? l.order : (idx + 1),
                            duration: l.duration || null,
                            type: l.type || 'reading',
                            status: l.status || null,
                            subjectId: subject.id,
                            courseId: subject.courseId || null,
                            source: 'SubjectRegistry'
                        };
                    }),
                    lessonCount: lessons.length
                },

                progress: this._getSubjectProgress(subjectId, lessons),
                mastery: this._getSubjectMastery(subjectId),
                recommendation: this._getSubjectRecommendation(subjectId),
                schedule: this._getSubjectSchedule(subjectId),
                notes: this._getSubjectNotes(subjectId)
            };
        },

        // ============================================================
        // Private: Subject data
        // ============================================================

        _getSubjectObjectives: function(subject) {
            var objectives = subject.learningObjectives || subject.objectives;
            if (objectives && Array.isArray(objectives)) {
                return {
                    available: true,
                    objectives: objectives,
                    source: 'SubjectRegistry'
                };
            }
            return {
                available: false,
                status: 'NOT_AVAILABLE',
                source: 'SubjectRegistry'
            };
        },

        _getSubjectPrerequisites: function(subjectId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || typeof curriculum.getPrerequisites !== 'function') {
                return { available: false, status: 'UNKNOWN', required: [], suggested: [] };
            }

            try {
                var prereqs = curriculum.getPrerequisites(subjectId) || [];
                var required = prereqs.filter(function(p) { return p.type === 'required'; });
                var suggested = prereqs.filter(function(p) { return p.type === 'suggested'; });

                return {
                    available: true,
                    required: required.map(function(p) {
                        var s = curriculum.getSubject ? curriculum.getSubject(p.subjectId) : null;
                        return {
                            subjectId: p.subjectId,
                            name: s ? (s.title || s.name) : 'Unknown',
                            satisfied: p.satisfied === true
                        };
                    }),
                    suggested: suggested.map(function(p) {
                        var s = curriculum.getSubject ? curriculum.getSubject(p.subjectId) : null;
                        return {
                            subjectId: p.subjectId,
                            name: s ? (s.title || s.name) : 'Unknown'
                        };
                    }),
                    source: 'Curriculum'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', required: [], suggested: [] };
            }
        },

        _getSubjectProgress: function(subjectId, lessons) {
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (!progressEngine) {
                return { available: false, status: 'UNKNOWN' };
            }

            try {
                if (typeof progressEngine.getSubjectProgress === 'function') {
                    var p = progressEngine.getSubjectProgress(subjectId);
                    return {
                        available: true,
                        percent: p.percent || 0,
                        completed: p.completed || 0,
                        total: p.total || (lessons ? lessons.length : 0),
                        source: 'Progress'
                    };
                }

                var total = lessons ? lessons.length : 0;
                var completed = 0;
                if (lessons && progressEngine.isLessonCompleted) {
                    for (var i = 0; i < lessons.length; i++) {
                        var lid = lessons[i].id || lessons[i].lessonId;
                        if (progressEngine.isLessonCompleted(lid)) {
                            completed++;
                        }
                    }
                }
                return {
                    available: true,
                    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
                    completed: completed,
                    total: total,
                    derived: true,
                    source: 'Progress (derived)'
                };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getSubjectMastery: function(subjectId) {
            var masteryEngine = window.LawAIApp?.MasteryEngine;
            if (!masteryEngine || typeof masteryEngine.getSubjectMastery !== 'function') {
                return { available: false, status: 'UNKNOWN' };
            }
            try {
                var m = masteryEngine.getSubjectMastery(subjectId);
                return {
                    available: true,
                    level: m.level || 'unknown',
                    label: m.label || 'Unknown',
                    source: 'Mastery'
                };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getSubjectRecommendation: function(subjectId) {
            var recEngine = window.LawAIApp?.RecommendationEngine;
            if (!recEngine || typeof recEngine.getRecommendationFor !== 'function') {
                return null;
            }
            try {
                var rec = recEngine.getRecommendationFor(subjectId);
                if (rec && rec.isRecommended) {
                    return {
                        isRecommended: true,
                        reason: rec.reason || null,
                        confidence: rec.confidence || 'moderate',
                        source: 'Recommendation'
                    };
                }
                return null;
            } catch (e) {
                return null;
            }
        },

        _getSubjectSchedule: function(subjectId) {
            var calAuth = window.LawAIApp?.CalendarAuthority;
            if (!calAuth || !calAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0 };
            }
            try {
                var allSchedules = calAuth.getUpcomingSchedules(50);
                var subjectSchedules = allSchedules.filter(function(s) {
                    return s.activityRef && s.activityRef.indexOf(subjectId) !== -1;
                });
                return {
                    available: true,
                    count: subjectSchedules.length,
                    nextSession: subjectSchedules.length > 0 ? {
                        scheduleId: subjectSchedules[0].scheduleId,
                        startAt: subjectSchedules[0].startAt,
                        title: subjectSchedules[0].title
                    } : null,
                    source: 'Calendar'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', count: 0 };
            }
        },

        _getSubjectNotes: function(subjectId) {
            var notesAuth = window.LawAIApp?.NotesAuthority;
            if (!notesAuth || !notesAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0 };
            }
            try {
                var allNotes = notesAuth.getAllNotes();
                var subjectNotes = allNotes.filter(function(n) {
                    return n.relatedSubjectRef === subjectId;
                });
                return {
                    available: true,
                    count: subjectNotes.length,
                    source: 'Notes'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', count: 0 };
            }
        },

        /**
         * 构建 Lesson 详情（Part 169）
         */
        buildLessonDetail: function(lessonId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || !curriculum.isReady) {
                return { lesson: null, status: 'LOADING' };
            }

            var lesson = curriculum.getLesson ? curriculum.getLesson(lessonId) : null;
            if (!lesson) {
                return { lesson: null, status: 'NOT_FOUND' };
            }

            var subject = lesson.subjectId && curriculum.getSubject ? curriculum.getSubject(lesson.subjectId) : null;
            var course = subject && subject.courseId && curriculum.getCourse ? curriculum.getCourse(subject.courseId) : null;
            var school = course && course.schoolId && curriculum.getSchool ? curriculum.getSchool(course.schoolId) : null;

            return {
                status: 'READY',
                identity: {
                    lessonId: lesson.id,
                    title: lesson.title || lesson.name || 'Untitled Lesson',
                    description: lesson.description || '',
                    status: lesson.status || 'ACTIVE',
                    duration: lesson.duration || null,
                    difficulty: lesson.difficulty || null,
                    type: lesson.type || 'reading',
                    source: 'Curriculum'
                },
                context: {
                    subject: subject ? { subjectId: subject.id, title: subject.title || subject.name } : null,
                    course: course ? { courseId: course.id, title: course.title || course.name } : null,
                    school: school ? { schoolId: school.id, title: school.name } : null,
                    breadcrumb: this._buildBreadcrumb(school, course, subject, lesson)
                },
                learningObjectives: this._getLessonObjectives(lesson),
                prerequisites: this._getLessonPrerequisites(lessonId),
                activities: this._getLessonActivities(lesson),
                progress: this._getLessonProgress(lessonId),
                mastery: this._getLessonMastery(lessonId),
                recommendation: this._getLessonRecommendation(lessonId),
                schedule: this._getLessonSchedule(lessonId),
                notes: this._getLessonNotes(lessonId),
                content: this._getLessonContent(lesson)
            };
        },

        // ============================================================
        // Private: Lesson helpers
        // ============================================================

        _buildBreadcrumb: function(school, course, subject, lesson) {
            var parts = [];
            if (school) parts.push(school.name);
            if (course) parts.push(course.title || course.name);
            if (subject) parts.push(subject.title || subject.name);
            if (lesson) parts.push(lesson.title || lesson.name);
            return parts.join(' → ');
        },

        _getLessonObjectives: function(lesson) {
            if (lesson.learningObjectives && Array.isArray(lesson.learningObjectives)) {
                return { available: true, objectives: lesson.learningObjectives, source: 'Curriculum' };
            }
            return { available: false, status: 'NOT_AVAILABLE', source: 'Curriculum' };
        },

        _getLessonPrerequisites: function(lessonId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || typeof curriculum.getPrerequisites !== 'function') {
                return { available: false, status: 'UNKNOWN', required: [], suggested: [] };
            }
            try {
                var prereqs = curriculum.getPrerequisites(lessonId) || [];
                var required = prereqs.filter(function(p) { return p.type === 'required'; });
                var suggested = prereqs.filter(function(p) { return p.type === 'suggested'; });
                return {
                    available: true,
                    required: required.map(function(p) {
                        var l = curriculum.getLesson ? curriculum.getLesson(p.lessonId) : null;
                        return { lessonId: p.lessonId, name: l ? (l.title || l.name) : 'Unknown', satisfied: p.satisfied === true };
                    }),
                    suggested: suggested.map(function(p) {
                        var l = curriculum.getLesson ? curriculum.getLesson(p.lessonId) : null;
                        return { lessonId: p.lessonId, name: l ? (l.title || l.name) : 'Unknown' };
                    }),
                    source: 'Curriculum'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', required: [], suggested: [] };
            }
        },

        _getLessonActivities: function(lesson) {
            if (lesson.activities && Array.isArray(lesson.activities)) {
                return {
                    available: true,
                    activities: lesson.activities.map(function(a, idx) {
                        return {
                            activityId: a.id || ('activity_' + idx),
                            activityType: a.type || 'reading',
                            title: a.title || 'Activity',
                            description: a.description || '',
                            order: idx + 1,
                            duration: a.duration || null,
                            source: 'Curriculum'
                        };
                    }),
                    source: 'Curriculum'
                };
            }
            var contentLoader = window.LawAIApp?.ContentLoader;
            if (contentLoader && contentLoader.getLessonActivities) {
                try {
                    var acts = contentLoader.getLessonActivities(lesson.id);
                    if (acts && acts.length > 0) {
                        return { available: true, activities: acts, source: 'ContentLoader' };
                    }
                } catch (e) {}
            }
            return { available: false, status: 'NOT_AVAILABLE', activities: [], source: 'Curriculum' };
        },

        _getLessonProgress: function(lessonId) {
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (!progressEngine) {
                return { available: false, status: 'UNKNOWN' };
            }
            try {
                if (typeof progressEngine.getLessonProgress === 'function') {
                    var p = progressEngine.getLessonProgress(lessonId);
                    return { available: true, percent: p.percent || 0, status: p.status || 'unknown', source: 'Progress' };
                }
                if (typeof progressEngine.isLessonCompleted === 'function') {
                    var completed = progressEngine.isLessonCompleted(lessonId);
                    return { available: true, completed: completed, status: completed ? 'completed' : 'not_started', source: 'Progress' };
                }
            } catch (e) {}
            return { available: false, status: 'UNKNOWN' };
        },

        _getLessonMastery: function(lessonId) {
            var masteryEngine = window.LawAIApp?.MasteryEngine;
            if (!masteryEngine || typeof masteryEngine.getLessonMastery !== 'function') {
                return { available: false, status: 'UNKNOWN' };
            }
            try {
                var m = masteryEngine.getLessonMastery(lessonId);
                return { available: true, level: m.level || 'unknown', label: m.label || 'Unknown', source: 'Mastery' };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getLessonRecommendation: function(lessonId) {
            var recEngine = window.LawAIApp?.RecommendationEngine;
            if (!recEngine || typeof recEngine.getRecommendationFor !== 'function') {
                return null;
            }
            try {
                var rec = recEngine.getRecommendationFor(lessonId);
                if (rec && rec.isRecommended) {
                    return { isRecommended: true, reason: rec.reason || null, confidence: rec.confidence || 'moderate', source: 'Recommendation' };
                }
                return null;
            } catch (e) {
                return null;
            }
        },

        _getLessonSchedule: function(lessonId) {
            var calAuth = window.LawAIApp?.CalendarAuthority;
            if (!calAuth || !calAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0 };
            }
            try {
                var allSchedules = calAuth.getUpcomingSchedules(50);
                var lessonSchedules = allSchedules.filter(function(s) {
                    return s.activityRef && s.activityRef.indexOf(lessonId) !== -1;
                });
                return {
                    available: true,
                    count: lessonSchedules.length,
                    nextSession: lessonSchedules.length > 0 ? {
                        scheduleId: lessonSchedules[0].scheduleId,
                        startAt: lessonSchedules[0].startAt
                    } : null,
                    source: 'Calendar'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', count: 0 };
            }
        },

        _getLessonNotes: function(lessonId) {
            var notesAuth = window.LawAIApp?.NotesAuthority;
            if (!notesAuth || !notesAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0 };
            }
            try {
                var allNotes = notesAuth.getAllNotes();
                var lessonNotes = allNotes.filter(function(n) {
                    return n.relatedLessonRef === lessonId;
                });
                return { available: true, count: lessonNotes.length, source: 'Notes' };
            } catch (e) {
                return { available: false, status: 'ERROR', count: 0 };
            }
        },

        _getLessonContent: function(lesson) {
            var contentLoader = window.LawAIApp?.ContentLoader;
            if (!contentLoader) {
                return { available: false, status: 'NOT_AVAILABLE' };
            }
            try {
                if (contentLoader.isLessonLoaded && contentLoader.isLessonLoaded(lesson.id)) {
                    return { available: true, loaded: true, source: 'ContentLoader' };
                }
                return { available: true, loaded: false, source: 'ContentLoader' };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        // ============================================================
        // Private: Read from other authorities
        // ============================================================

        _getLearningObjectives: function(course) {
            if (course.learningObjectives && Array.isArray(course.learningObjectives)) {
                return { available: true, objectives: course.learningObjectives, source: 'Curriculum' };
            }
            return { available: false, status: 'NOT_AVAILABLE', source: 'Curriculum' };
        },

        _getPrerequisites: function(courseId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum || typeof curriculum.getPrerequisites !== 'function') {
                return { available: false, status: 'UNKNOWN', required: [], suggested: [] };
            }
            try {
                var prereqs = curriculum.getPrerequisites(courseId) || [];
                var required = prereqs.filter(function(p) { return p.type === 'required'; });
                var suggested = prereqs.filter(function(p) { return p.type === 'suggested'; });
                return {
                    available: true,
                    required: required.map(function(p) {
                        var c = curriculum.getCourse ? curriculum.getCourse(p.courseId) : null;
                        return { courseId: p.courseId, name: c ? (c.title || c.name) : 'Unknown', satisfied: p.satisfied === true };
                    }),
                    suggested: suggested.map(function(p) {
                        var c = curriculum.getCourse ? curriculum.getCourse(p.courseId) : null;
                        return { courseId: p.courseId, name: c ? (c.title || c.name) : 'Unknown' };
                    }),
                    source: 'Curriculum'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', required: [], suggested: [] };
            }
        },

        _getCourseSchedule: function(courseId) {
            var calAuth = window.LawAIApp?.CalendarAuthority;
            if (!calAuth || !calAuth.isReady) {
                return { available: false, status: 'UNKNOWN', nextSession: null, count: 0 };
            }
            try {
                var allSchedules = calAuth.getUpcomingSchedules(50);
                var courseSchedules = allSchedules.filter(function(s) {
                    return s.activityRef && s.activityRef.indexOf(courseId) !== -1;
                });
                if (courseSchedules.length === 0) {
                    return { available: true, nextSession: null, count: 0, source: 'Calendar' };
                }
                var next = courseSchedules[0];
                return {
                    available: true,
                    nextSession: {
                        scheduleId: next.scheduleId,
                        title: next.title,
                        startAt: next.startAt,
                        duration: next.duration
                    },
                    count: courseSchedules.length,
                    source: 'Calendar'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', nextSession: null, count: 0 };
            }
        },

        _getCourseNotes: function(courseId) {
            var notesAuth = window.LawAIApp?.NotesAuthority;
            if (!notesAuth || !notesAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0, recent: [] };
            }
            try {
                var allNotes = notesAuth.getAllNotes();
                var courseNotes = allNotes.filter(function(n) {
                    return n.relatedCourseRef === courseId;
                });
                courseNotes.sort(function(a, b) {
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                });
                return {
                    available: true,
                    count: courseNotes.length,
                    recent: courseNotes.slice(0, 3).map(function(n) {
                        return {
                            noteId: n.noteId,
                            title: n.title,
                            preview: (n.content || '').substring(0, 80) + (n.content && n.content.length > 80 ? '...' : ''),
                            updatedAt: n.updatedAt
                        };
                    }),
                    source: 'Notes'
                };
            } catch (e) {
                return { available: false, status: 'ERROR', count: 0, recent: [] };
            }
        },

        _getAvailableActions: function(course, courseId) {
            var actions = [];

            actions.push({
                id: 'open_course',
                label: 'Open Course',
                type: 'NAVIGATION',
                target: courseId
            });

            var prereqs = this._getPrerequisites(courseId);
            var hasUnmetPrereqs = prereqs.required && prereqs.required.some(function(p) { return !p.satisfied; });

            if (!hasUnmetPrereqs) {
                actions.push({
                    id: 'start_learning',
                    label: 'Start Learning',
                    type: 'LEARNING_ACTION',
                    target: courseId
                });
            }

            actions.push({
                id: 'schedule',
                label: 'Schedule Session',
                type: 'CALENDAR_COMMAND',
                target: courseId
            });

            actions.push({
                id: 'view_notes',
                label: 'View Notes',
                type: 'NAVIGATION',
                target: 'notes'
            });

            return actions;
        },

        // ============================================================
        // Read from other authorities (只读)
        // ============================================================

        _getProgressSummary: function(schoolId, courses) {
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (!progressEngine || !progressEngine.getProgress) {
                return { available: false, status: 'UNKNOWN' };
            }

            try {
                var totalProgress = 0;
                var count = 0;
                for (var i = 0; i < courses.length; i++) {
                    var p = this._getCourseProgress(courses[i].id);
                    if (p.available) {
                        totalProgress += p.percent;
                        count++;
                    }
                }
                return {
                    available: true,
                    percent: count > 0 ? Math.round(totalProgress / count) : 0,
                    coursesWithProgress: count
                };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getCourseProgress: function(courseId) {
            var progressEngine = window.LawAIApp?.ProgressEngine;
            if (!progressEngine || typeof progressEngine.getCourseProgress !== 'function') {
                return { available: false, status: 'UNKNOWN' };
            }
            try {
                var p = progressEngine.getCourseProgress(courseId);
                return {
                    available: true,
                    percent: p.percent || 0,
                    completed: p.completed || 0,
                    total: p.total || 0
                };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getCourseMastery: function(courseId) {
            var masteryEngine = window.LawAIApp?.MasteryEngine;
            if (!masteryEngine || typeof masteryEngine.getCourseMastery !== 'function') {
                return { available: false, status: 'UNKNOWN' };
            }
            try {
                var m = masteryEngine.getCourseMastery(courseId);
                return {
                    available: true,
                    level: m.level || 'unknown',
                    label: m.label || 'Unknown'
                };
            } catch (e) {
                return { available: false, status: 'ERROR' };
            }
        },

        _getCourseRecommendation: function(courseId) {
            var recEngine = window.LawAIApp?.RecommendationEngine;
            if (!recEngine || typeof recEngine.getRecommendationFor !== 'function') {
                return null;
            }
            try {
                var rec = recEngine.getRecommendationFor(courseId);
                if (rec && rec.isRecommended) {
                    return {
                        isRecommended: true,
                        reason: rec.reason || null
                    };
                }
                return null;
            } catch (e) {
                return null;
            }
        },

        // ============================================================
        // Unknown states
        // ============================================================

        _getUnknownSchool: function(schoolId) {
            return {
                schoolId: schoolId,
                name: 'Unknown School',
                status: 'UNKNOWN',
                courseCount: 0,
                availableCourseCount: 0,
                progressSummary: { available: false, status: 'UNKNOWN' }
            };
        },

        _getUnknownCourse: function(courseId) {
            return {
                courseId: courseId,
                name: 'Unknown Course',
                status: 'UNKNOWN',
                progress: { available: false, status: 'UNKNOWN' },
                mastery: { available: false, status: 'UNKNOWN' },
                recommendation: null
            };
        }
    };

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.SchoolViewModel = SchoolViewModel;

    console.log('[SchoolViewModel] Module loaded (Part 166 v1.0.2 — lessonId normalize fix)');

})();
