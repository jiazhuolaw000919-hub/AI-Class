// js/academy/contentAdapter.js
// S4 Content Adapter — 桥接新旧架构
(function() {
    'use strict';

    if (!window.LawAIApp) window.LawAIApp = {};

    const ContentAdapter = {
        _initialized: false,

        /**
         * 初始化 Adapter
         */
        initialize() {
            if (this._initialized) return this;
            console.log('[ContentAdapter] Initializing...');
            this._initialized = true;
            return this;
        },

        /**
         * 将 S4 Course 转换为旧的 Course 格式
         */
        adaptCourse(s4Course) {
            if (!s4Course) return null;
            return {
                id: s4Course.id || s4Course.courseId,
                title: s4Course.title || '',
                description: s4Course.description || '',
                programId: `program-${s4Course.school || 'science'}`,
                modules: s4Course.subjects?.map(s => ({
                    id: s,
                    name: s,
                    lessons: []
                })) || [],
                _s4: true,
                _original: s4Course
            };
        },

        /**
         * 将 S4 Subject 转换为旧的 Module 格式
         */
        adaptSubjectToModule(s4Subject) {
            if (!s4Subject) return null;
            return {
                id: s4Subject.id || s4Subject.subjectId,
                name: s4Subject.title || '',
                description: s4Subject.description || '',
                lessons: s4Subject.lessons || [],
                _s4: true,
                _original: s4Subject
            };
        },

        /**
         * 将 S4 Lesson 转换为旧的 Lesson 格式（如果旧系统需要）
         */
        adaptLesson(s4Lesson) {
            if (!s4Lesson) return null;
            return {
                id: s4Lesson.id || s4Lesson.lessonId,
                title: s4Lesson.title || '',
                content: s4Lesson.overview || '',
                difficulty: s4Lesson.difficulty || 'beginner',
                estimatedDuration: s4Lesson.estimatedDuration || 10,
                video: s4Lesson.video || null,
                flashcards: s4Lesson.flashcards || [],
                notes: s4Lesson.notes || [],
                practice: s4Lesson.practice || [],
                quiz: s4Lesson.quiz || [],
                _s4: true,
                _original: s4Lesson
            };
        },

        /**
         * 检查某个 Course 是否来自 S4
         */
        isS4Course(course) {
            return course && (course._s4 === true || course._original !== undefined);
        },

        /**
         * 获取 S4 原始数据（如果存在）
         */
        getOriginal(course) {
            return course?._original || null;
        },

        /**
         * 将 S4 School 转换为旧的 Academy 格式
         */
        adaptSchool(s4School) {
            if (!s4School) return null;
            return {
                id: s4School.id || s4School.schoolId,
                name: s4School.title || '',
                description: s4School.description || '',
                courses: s4School.courses || [],
                _s4: true,
                _original: s4School
            };
        },

        /**
         * 获取统计
         */
        getStats() {
            const registry = window.LawAIApp?.S4ContentRegistry || window.LawAIApp?.ContentRegistry;
            if (!registry) {
                return { adapted: 0, source: 'none' };
            }
            const courses = registry.getCourses ? registry.getCourses() : [];
            return {
                adapted: courses.length,
                source: 'S4 ContentRegistry'
            };
        }
    };

    window.LawAIApp.ContentAdapter = ContentAdapter;

    // 自动初始化
    ContentAdapter.initialize();

    console.log('[ContentAdapter] ✅ Ready');

})();
