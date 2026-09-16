// /js/curriculum/CurriculumAuthority.js
// Part 166 — 唯一的 Curriculum 权威
// v2.0.0 — 修复 lesson 异步加载 + 幂等性
//
// ⚠️ v2.0.0 变更:
//   1. _loadAllLessons 的 pending 计数 bug 修复
//      旧版 subject 无 lesson 时直接 `return`，不检查 pending === 0，
//      导致 _notifyReady 永远不触发，UI 无法进入 lesson。
//   2. _ingestFromRegistries 幂等性：同一 subject 不会重复 load。
//   3. _loadAllLessons 加锁：防止并发多次加载。
//   4. 加载完 lesson 后强制 _notifyReady，让 UI 刷新。
//   5. 增加 clear() 方法，重新 ingest 前清空旧数据。

(function() {
    'use strict';

    var _schools = {};
    var _courses = {};
    var _subjects = {};
    var _lessons = {};
    var _prerequisites = {};
    var _initialized = false;
    var _loading = false;
    var _readyCallbacks = [];
    var _version = '2.0.0';

    // 🔥 v2.0.0: 防止并发重复加载 lesson
    var _lessonsLoading = false;
    var _lessonsLoadedForSubject = {};

    var CurriculumAuthority = {
        get initialized() { return _initialized; },
        get loading() { return _loading; },
        get isReady() { return _initialized && !_loading; },
        get version() { return _version; },

        init: function() {
            if (_initialized || _loading) return this;
            _loading = true;
            this._loadAsync();
            this._setupEventListeners();
            return this;
        },

        // ============================================================
        // 事件监听
        // ============================================================
        _setupEventListeners: function() {
            var self = this;

            // 当 CourseRegistry 更新时，重新 ingest
            document.addEventListener('COURSE_REGISTRY_UPDATED', function() {
                console.log('[CurriculumAuthority] COURSE_REGISTRY_UPDATED received, re-ingesting...');
                self._ingestFromRegistries();
                self._notifyReady();
            });

            // 当 SubjectRegistry 更新时
            document.addEventListener('SUBJECT_REGISTRY_UPDATED', function() {
                console.log('[CurriculumAuthority] SUBJECT_REGISTRY_UPDATED received, re-ingesting...');
                self._ingestFromRegistries();
                self._notifyReady();
            });

            // SchoolRegistry 更新
            document.addEventListener('SCHOOL_REGISTRY_READY', function() {
                console.log('[CurriculumAuthority] SCHOOL_REGISTRY_READY received, re-ingesting...');
                self._ingestFromRegistries();
                self._notifyReady();
            });

            document.addEventListener('SCHOOL_REGISTERED', function() {
                self._ingestFromRegistries();
                self._notifyReady();
            });

            document.addEventListener('COURSE_REGISTERED', function() {
                self._ingestFromRegistries();
                self._notifyReady();
            });

            document.addEventListener('SUBJECT_REGISTERED', function() {
                self._ingestFromRegistries();
                self._notifyReady();
            });

            document.addEventListener('SUBJECTS_LOADED', function() {
                console.log('[CurriculumAuthority] SUBJECTS_LOADED received, re-ingesting...');
                self._ingestFromRegistries();
                self._notifyReady();
            });

            document.addEventListener('SUBJECTS_ALL_LOADED', function() {
                console.log('[CurriculumAuthority] SUBJECTS_ALL_LOADED received, re-ingesting...');
                self._ingestFromRegistries();
                self._notifyReady();
            });
        },

        _notifyReady: function() {
            this._emit('CURRICULUM_AUTHORITY_UPDATED', {
                schoolCount: Object.keys(_schools).length,
                courseCount: Object.keys(_courses).length,
                subjectCount: Object.keys(_subjects).length,
                lessonCount: Object.keys(_lessons).length
            });

            if (window.LawAIApp?.AcademyExperienceManager?.render) {
                setTimeout(function() {
                    try {
                        window.LawAIApp.AcademyExperienceManager.render();
                    } catch (e) {}
                }, 100);
            }
        },

        onReady: function(cb) {
            if (_initialized) { cb(this); return; }
            _readyCallbacks.push(cb);
        },

        // ============================================================
        // READ API
        // ============================================================

        // School
        getSchool: function(id) { return _schools[id] || null; },
        getAllSchools: function() { return Object.values(_schools); },
        getActiveSchools: function() {
            return Object.values(_schools).filter(function(s) { return s.status !== 'ARCHIVED'; });
        },

        // Course
        getCourse: function(id) { return _courses[id] || null; },
        getAllCourses: function() { return Object.values(_courses); },
        getCoursesBySchool: function(schoolId) {
            return Object.values(_courses).filter(function(c) { return c.schoolId === schoolId; });
        },

        // Subject
        getSubject: function(id) { return _subjects[id] || null; },
        getAllSubjects: function() { return Object.values(_subjects); },
        getSubjectsByCourse: function(courseId) {
            return Object.values(_subjects).filter(function(s) { return s.courseId === courseId; });
        },

        // Lesson
        getLesson: function(id) { return _lessons[id] || null; },
        getAllLessons: function() { return Object.values(_lessons); },
        getLessonsBySubject: function(subjectId) {
            return Object.values(_lessons).filter(function(l) { return l.subjectId === subjectId; });
        },

        // Prerequisite
        getPrerequisites: function(entityId) {
            return _prerequisites[entityId] || [];
        },

        // Navigation
        getSchoolHierarchy: function(schoolId) {
            var school = this.getSchool(schoolId);
            if (!school) return null;
            var courses = this.getCoursesBySchool(schoolId);
            return {
                school: school,
                courses: courses.map(function(c) {
                    return {
                        course: c,
                        subjects: CurriculumAuthority.getSubjectsByCourse(c.id)
                    };
                })
            };
        },

        // ============================================================
        // COMMAND API — 仅 Curriculum 内部使用
        // ============================================================

        _registerSchool: function(school) {
            if (!school.id) return { success: false, error: 'School id required' };
            _schools[school.id] = school;
            return { success: true };
        },

        _registerCourse: function(course) {
            if (!course.id) return { success: false, error: 'Course id required' };
            _courses[course.id] = course;
            return { success: true };
        },

        _registerSubject: function(subject) {
            if (!subject.id) return { success: false, error: 'Subject id required' };
            _subjects[subject.id] = subject;
            return { success: true };
        },

        _registerLesson: function(lesson) {
            if (!lesson.id) return { success: false, error: 'Lesson id required' };
            _lessons[lesson.id] = lesson;
            return { success: true };
        },

        _registerPrerequisite: function(entityId, prereq) {
            if (!_prerequisites[entityId]) _prerequisites[entityId] = [];
            _prerequisites[entityId].push(prereq);
            return { success: true };
        },

        /**
         * 🔥 v2.0.0: 清空所有数据（重新 ingest 前调用）
         */
        clear: function() {
            _schools = {};
            _courses = {};
            _subjects = {};
            _lessons = {};
            _prerequisites = {};
            _lessonsLoadedForSubject = {};
            console.log('[CurriculumAuthority] 🧹 Cleared');
        },

        // ============================================================
        // 私有
        // ============================================================

        _loadAsync: function() {
            var self = this;
            setTimeout(function() {
                try {
                    self._ingestFromRegistries();
                } catch (e) {
                    console.warn('[CurriculumAuthority] Load error:', e);
                }

                _loading = false;
                _initialized = true;

                while (_readyCallbacks.length > 0) {
                    try { _readyCallbacks.shift()(self); } catch (e) {}
                }

                self._emit('CURRICULUM_AUTHORITY_READY', {
                    schoolCount: Object.keys(_schools).length,
                    courseCount: Object.keys(_courses).length,
                    subjectCount: Object.keys(_subjects).length
                });
            }, 0);
        },

        _ingestFromRegistries: function() {
            var self = this;

            // 从 SchoolRegistry 加载
            if (window.LawAIApp?.SchoolRegistry?.getAllSchools) {
                var schools = window.LawAIApp.SchoolRegistry.getAllSchools();
                schools.forEach(function(s) { _schools[s.id] = s; });
            }

            // 从 CourseRegistry 加载
            if (window.LawAIApp?.CourseRegistry?.getAllCourses) {
                var courses = window.LawAIApp.CourseRegistry.getAllCourses();
                courses.forEach(function(c) { _courses[c.id] = c; });
            }

            // 从 SubjectRegistry 加载
            if (window.LawAIApp?.SubjectRegistry?.getAllSubjects) {
                var subjects = window.LawAIApp.SubjectRegistry.getAllSubjects();
                subjects.forEach(function(s) { _subjects[s.id] = s; });
            }

            console.log('[CurriculumAuthority] Ingested:',
                Object.keys(_schools).length, 'schools,',
                Object.keys(_courses).length, 'courses,',
                Object.keys(_subjects).length, 'subjects');

            // 🔥 v2.0.0: 异步加载所有 Subjects 的 Lessons
            self._loadAllLessons();
        },

        /**
         * 🔥 v2.0.0: 异步加载所有 Lessons
         * 修复了 pending 计数 bug：
         *   - 旧版 subject 无 lesson 时直接 `return`，不检查 pending === 0
         *   - 新版用 try/finally 保证每个 subject 处理完后都检查 pending
         *   - 加锁防止并发重复加载
         */
        _loadAllLessons: function() {
            var self = this;

            // 🔥 加锁，防止并发
            if (_lessonsLoading) {
                console.log('[CurriculumAuthority] Lessons already loading, skip');
                return;
            }

            var loader = window.LawAIApp?.ContentLoader || window.LawAIApp?.S4ContentLoader;

            if (!loader || typeof loader.loadLesson !== 'function') {
                console.log('[CurriculumAuthority] ContentLoader not ready for lessons, will retry in 500ms');
                setTimeout(function() { self._loadAllLessons(); }, 500);
                return;
            }

            // 遍历所有 subjects，加载各自的 lessons
            var subjectIds = Object.keys(_subjects);
            if (subjectIds.length === 0) {
                console.log('[CurriculumAuthority] No subjects to load lessons for');
                return;
            }

            // 过滤掉已经加载过的 subject
            var subjectsToLoad = subjectIds.filter(function(subjectId) {
                return !_lessonsLoadedForSubject[subjectId];
            });

            if (subjectsToLoad.length === 0) {
                console.log('[CurriculumAuthority] All subjects already loaded');
                return;
            }

            _lessonsLoading = true;
            console.log('[CurriculumAuthority] Loading lessons for', subjectsToLoad.length, 'subjects...');

            // 🔥 修复: 用计数器而不是 pending--
            var totalSubjects = subjectsToLoad.length;
            var completedSubjects = 0;
            var totalLessonsLoaded = 0;

            function onSubjectComplete() {
                completedSubjects++;
                if (completedSubjects >= totalSubjects) {
                    _lessonsLoading = false;
                    console.log('[CurriculumAuthority] ✅ All lessons loaded, total:', totalLessonsLoaded);

                    // 🔥 强制 notify
                    setTimeout(function() {
                        self._notifyReady();
                    }, 300);
                }
            }

            subjectsToLoad.forEach(function(subjectId) {
                var subject = _subjects[subjectId];

                // 🔥 修复: 用 try/finally 保证 onSubjectComplete 一定被调用
                try {
                    if (!subject || !subject.lessons || subject.lessons.length === 0) {
                        _lessonsLoadedForSubject[subjectId] = true;
                        return;  // finally 会调用 onSubjectComplete
                    }

                    var lessonIds = subject.lessons;
                    var courseId = subject.courseId;
                    var lessonCount = lessonIds.length;
                    var completedLessons = 0;

                    function onLessonComplete() {
                        completedLessons++;
                        if (completedLessons >= lessonCount) {
                            _lessonsLoadedForSubject[subjectId] = true;
                            onSubjectComplete();
                        }
                    }

                    lessonIds.forEach(function(lessonId) {
                        // 🔥 兼容 lesson 是字符串或对象
                        var realLessonId = (typeof lessonId === 'string')
                            ? lessonId
                            : (lessonId.id || lessonId.lessonId);

                        if (!realLessonId) {
                            onLessonComplete();
                            return;
                        }

                        // 跳过已加载
                        if (_lessons[realLessonId]) {
                            onLessonComplete();
                            return;
                        }

                        loader.loadLesson(courseId, subjectId, realLessonId)
                            .then(function(lessonData) {
                                if (lessonData) {
                                    _lessons[realLessonId] = {
                                        id: lessonData.id || realLessonId,
                                        subjectId: lessonData.subjectId || subjectId,
                                        courseId: lessonData.courseId || courseId,
                                        title: lessonData.title,
                                        description: lessonData.description,
                                        order: lessonData.order,
                                        estimatedMinutes: lessonData.estimatedMinutes,
                                        difficulty: lessonData.difficulty,
                                        status: lessonData.status || 'published',
                                        learningObjectives: lessonData.learningObjectives,
                                        sections: lessonData.sections,
                                        video: lessonData.video,
                                        practice: lessonData.practice,
                                        flashcards: lessonData.flashcards,
                                        notes: lessonData.notes,
                                        _loaded: true
                                    };
                                    totalLessonsLoaded++;
                                    console.log('[CurriculumAuthority] ✅ Loaded lesson:', realLessonId);
                                }
                            })
                            .catch(function(e) {
                                console.warn('[CurriculumAuthority] Failed to load lesson:', realLessonId, e);
                            })
                            .then(function() {
                                // finally 语义，无论成功失败都调
                                onLessonComplete();
                            });
                    });
                } finally {
                    // 🔥 修复: 无 lesson 的 subject 也要正确计数
                    if (!subject || !subject.lessons || subject.lessons.length === 0) {
                        onSubjectComplete();
                    }
                }
            });
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, {
                    detail: {
                        source: 'curriculum-authority',
                        version: _version,
                        timestamp: new Date().toISOString(),
                        data: data || {}
                    }
                });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
            } catch (e) {}
        }
    };

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.CurriculumAuthority = CurriculumAuthority;

    // 后台自动初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() { CurriculumAuthority.init(); }, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() { CurriculumAuthority.init(); }, 100);
        });
    }

    console.log('[CurriculumAuthority] Module loaded (Part 166 v2.0.0)');

})();
