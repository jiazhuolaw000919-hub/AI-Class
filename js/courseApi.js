// ===========================================
// courseApi.js
// 课程相关 API（Season 4 Chapter 2 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseApi = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📚 CourseApi initialized');
        return this;
    },

    listCourses: async function() {
        var result = await LawAIApp.Database.from('courses').select();
        if (result.error) {
            return { success: false, courses: [], error: result.error };
        }
        return { success: true, courses: result.data || [], error: null };
    },

    getCourse: async function(courseId) {
        var result = await LawAIApp.Database.from('courses').eq('id', courseId).select();
        if (result.error) {
            return { success: false, course: null, error: result.error };
        }
        return { success: true, course: result.data?.[0] || null, error: null };
    },

    createCourse: async function(courseDef) {
        var result = await LawAIApp.Database.from('courses').insert({
            title: courseDef.title || 'Untitled Course',
            description: courseDef.description || '',
            difficulty_level: courseDef.difficulty || 'beginner',
            domain: courseDef.domain || '',
            created_by_ai: courseDef.createdByAI || false
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        var course = result.data[0];
        LawAIApp.EventBus?.emit?.('CourseCreated', course);
        return { success: true, course: course };
    },

    updateCourse: async function(courseId, updates) {
        var result = await LawAIApp.Database.from('courses').update({
            id: courseId,
            ...updates
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        LawAIApp.EventBus?.emit?.('CourseUpdated', { courseId: courseId, updates: updates });
        return { success: true, course: result.data?.[0] || null };
    },

    deleteCourse: async function(courseId) {
        var result = await LawAIApp.Database.from('courses').delete('id', courseId);
        if (result.error) {
            return { success: false, error: result.error };
        }
        LawAIApp.EventBus?.emit?.('CourseDeleted', { courseId: courseId });
        return { success: true };
    },

    getLessonsForCourse: async function(courseId) {
        var result = await LawAIApp.Database.from('lessons').eq('course_id', courseId).select();
        if (result.error) {
            return { success: false, lessons: [], error: result.error };
        }
        return { success: true, lessons: result.data || [], error: null };
    },

    addLesson: async function(courseId, lessonDef) {
        var result = await LawAIApp.Database.from('lessons').insert({
            course_id: courseId,
            title: lessonDef.title || 'Untitled Lesson',
            content: lessonDef.content || {},
            order_index: lessonDef.order || 0,
            estimated_time: lessonDef.estimatedTime || 10
        });

        if (result.error) {
            return { success: false, error: result.error };
        }

        LawAIApp.EventBus?.emit?.('LessonAdded', { courseId: courseId, lesson: result.data[0] });
        return { success: true, lesson: result.data[0] };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CourseApi && typeof LawAIApp.CourseApi.init === 'function') {
        LawAIApp.CourseApi.init();
    }
}, 150);

console.log('📚 CourseApi V2.0 ready');
