// /js/curriculum/CurriculumAuthority.js
// Part 166 — 唯一的 Curriculum 权威

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
    var _version = '1.0.0';

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

        // 🆕 监听 Registry 更新事件，重新 ingest
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
            
            // 当 SchoolRegistry 更新时
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

        // ============================================================
        // 私有
        // ============================================================

        _loadAsync: function() {
            var self = this;
            setTimeout(function() {
                try {
                    // 从现有的 Registry 加载
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
                    courseCount: Object.keys(_courses).length
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
            
            // 🆕 异步加载所有 Subjects 的 Lessons
            self._loadAllLessons();
        },
        
        // 🆕 异步加载所有 Lessons
        _loadAllLessons: function() {
            var self = this;
            var loader = window.LawAIApp?.ContentLoader || window.LawAIApp?.S4ContentLoader;
            
            if (!loader || typeof loader.loadLesson !== 'function') {
                console.log('[CurriculumAuthority] ContentLoader not ready for lessons');
                return;
            }
            
            // 遍历所有 subjects，加载各自的 lessons
            var subjectIds = Object.keys(_subjects);
            if (subjectIds.length === 0) return;
            
            console.log('[CurriculumAuthority] Loading lessons for', subjectIds.length, 'subjects...');
            
            var pending = subjectIds.length;
            
            subjectIds.forEach(function(subjectId) {
                var subject = _subjects[subjectId];
                if (!subject || !subject.lessons || subject.lessons.length === 0) {
                    pending--;
                    return;
                }
                
                var lessonIds = subject.lessons;
                var courseId = subject.courseId;
                
                lessonIds.forEach(function(lessonId) {
                    // 跳过已加载
                    if (_lessons[lessonId]) return;
                    
                    loader.loadLesson(courseId, subjectId, lessonId)
                        .then(function(lessonData) {
                            if (lessonData) {
                                _lessons[lessonId] = {
                                    id: lessonData.id,
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
                                console.log('[CurriculumAuthority] ✅ Loaded lesson:', lessonId);
                            }
                        })
                        .catch(function(e) {
                            console.warn('[CurriculumAuthority] Failed to load lesson:', lessonId, e);
                        });
                });
                
                pending--;
                
                // 全部完成时触发更新
                if (pending === 0) {
                    setTimeout(function() {
                        self._notifyReady();
                    }, 500);
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

    console.log('[CurriculumAuthority] Module loaded (Part 166)');

})();
