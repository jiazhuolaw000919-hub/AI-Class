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
