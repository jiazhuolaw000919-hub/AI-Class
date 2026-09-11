// /js/school/SchoolViewModel.js
// Part 166 — School View Model

(function() {
    'use strict';

    var SchoolViewModel = {
        version: '1.0.0',

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

            var courses = curriculum.getCoursesBySchool(schoolId);

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

            var schools = curriculum.getActiveSchools();
            if (schools.length === 0) {
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

            var courses = curriculum.getCoursesBySchool(schoolId);
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

            var subjects = curriculum.getSubjectsByCourse(courseId);

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
                // 注意：不自己算 recommendation，从 Recommendation 读取
                recommendation: this._getCourseRecommendation(courseId)
            };
        },

        /**
         * 构建 Course 详情（Part 167）
         * 包含：identity, objectives, prerequisites, structure, progress, mastery, recommendation, schedule, notes
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
        
            var subjects = curriculum.getSubjectsByCourse(courseId);
            var self = this;
        
            return {
                status: 'READY',
        
                // ============================================================
                // 1. IDENTITY (from Curriculum)
                // ============================================================
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
        
                // ============================================================
                // 2. LEARNING OBJECTIVES (from Curriculum)
                // ============================================================
                learningObjectives: this._getLearningObjectives(course),
        
                // ============================================================
                // 3. PREREQUISITES (from Curriculum)
                // ============================================================
                prerequisites: this._getPrerequisites(courseId),
        
                // ============================================================
                // 4. STRUCTURE (from Curriculum)
                // ============================================================
                structure: {
                    subjects: subjects.map(function(s) {
                        return {
                            subjectId: s.id,
                            title: s.title || s.name,
                            description: s.description || '',
                            lessonCount: s.lessons ? s.lessons.length : 0,
                            source: 'Curriculum'
                        };
                    }),
                    subjectCount: subjects.length
                },
        
                // ============================================================
                // 5. PROGRESS (from Progress - read-only)
                // ============================================================
                progress: this._getCourseProgress(courseId),
        
                // ============================================================
                // 6. MASTERY (from Mastery - read-only)
                // ============================================================
                mastery: this._getCourseMastery(courseId),
        
                // ============================================================
                // 7. RECOMMENDATION (from Recommendation - read-only)
                // ============================================================
                recommendation: this._getCourseRecommendation(courseId),
        
                // ============================================================
                // 8. SCHEDULE (from CalendarAuthority - read-only)
                // ============================================================
                schedule: this._getCourseSchedule(courseId),
        
                // ============================================================
                // 9. NOTES (from NotesAuthority - read-only)
                // ============================================================
                notes: this._getCourseNotes(courseId),
        
                // ============================================================
                // 10. LEARNER ACTIONS
                // ============================================================
                actions: this._getAvailableActions(course, courseId)
            };
        },
        
        // ============================================================
        // Private: Read from other authorities
        // ============================================================
        
        _getLearningObjectives: function(course) {
            // 从 Curriculum 读取
            if (course.learningObjectives && Array.isArray(course.learningObjectives)) {
                return {
                    available: true,
                    objectives: course.learningObjectives,
                    source: 'Curriculum'
                };
            }
            // 如果 Curriculum 没有定义
            return {
                available: false,
                status: 'NOT_AVAILABLE',
                source: 'Curriculum'
            };
        },
        
        _getPrerequisites: function(courseId) {
            var curriculum = window.LawAIApp?.CurriculumAuthority;
            if (!curriculum) {
                return { available: false, status: 'UNKNOWN', required: [], suggested: [] };
            }
        
            // 从 Curriculum 读取
            var prereqs = curriculum.getPrerequisites(courseId) || [];
        
            // 区分 required 和 suggested
            var required = prereqs.filter(function(p) { return p.type === 'required'; });
            var suggested = prereqs.filter(function(p) { return p.type === 'suggested'; });
        
            return {
                available: true,
                required: required.map(function(p) {
                    var c = curriculum.getCourse(p.courseId);
                    return {
                        courseId: p.courseId,
                        name: c ? c.title || c.name : 'Unknown',
                        satisfied: p.satisfied === true
                    };
                }),
                suggested: suggested.map(function(p) {
                    var c = curriculum.getCourse(p.courseId);
                    return {
                        courseId: p.courseId,
                        name: c ? c.title || c.name : 'Unknown'
                    };
                }),
                source: 'Curriculum'
            };
        },
        
        _getCourseSchedule: function(courseId) {
            // 🔥 Part 167: 从 CalendarAuthority 读取
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
                    return {
                        available: true,
                        nextSession: null,
                        count: 0,
                        source: 'Calendar'
                    };
                }
        
                // 最近的 session
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
            // 🔥 Part 167: 从 NotesAuthority 读取
            var notesAuth = window.LawAIApp?.NotesAuthority;
            if (!notesAuth || !notesAuth.isReady) {
                return { available: false, status: 'UNKNOWN', count: 0, recent: [] };
            }
        
            try {
                var allNotes = notesAuth.getAllNotes();
                var courseNotes = allNotes.filter(function(n) {
                    return n.relatedCourseRef === courseId;
                });
        
                // 按时间排序
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
        
            // Navigation
            actions.push({
                id: 'open_course',
                label: 'Open Course',
                type: 'NAVIGATION',
                target: courseId
            });
        
            // 检查是否可以开始
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
        
            // 可以 schedule
            actions.push({
                id: 'schedule',
                label: 'Schedule Session',
                type: 'CALENDAR_COMMAND',
                target: courseId
            });
        
            // 可以 view notes
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

    console.log('[SchoolViewModel] Module loaded (Part 166)');

})();
