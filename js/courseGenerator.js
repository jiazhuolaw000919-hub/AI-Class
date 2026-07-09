// ===========================================
// courseGenerator.js
// 实时自适应课程生成器（Phase 64 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseGenerator = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📚 CourseGenerator initialized');
    },

    generate: async function(domain, difficulty, userProfile) {
        domain = domain || 'AI Fundamentals';
        difficulty = difficulty || 'beginner';
        userProfile = userProfile || {};

        console.log('📚 Generating course:', domain, difficulty);

        var courseId = 'gen_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // 生成模块
        var modules = this._generateModules(domain, difficulty);

        var course = {
            id: courseId,
            title: domain + ' – ' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Course',
            description: 'AI-generated ' + domain + ' course tailored for ' + difficulty + ' level.',
            difficulty_level: difficulty,
            domain: domain,
            created_by_ai: true,
            modules: modules,
            createdAt: new Date().toISOString()
        };

        // 存储课程
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                var courses = LawAIApp.StorageEngine.get('generated_courses', []);
                courses.push(course);
                LawAIApp.StorageEngine.set('generated_courses', courses);
            }
        } catch (e) {}

        LawAIApp.EventBus?.emit?.('CourseGenerated', { courseId: courseId, course: course });
        console.log('✅ Course generated:', courseId);
        return course;
    },

    _generateModules: function(domain, difficulty) {
        var modules = [];
        var moduleCount = difficulty === 'beginner' ? 3 : (difficulty === 'intermediate' ? 4 : 5);

        for (var i = 0; i < moduleCount; i++) {
            var lessons = [];
            var lessonCount = 2 + Math.floor(Math.random() * 3);

            for (var j = 0; j < lessonCount; j++) {
                lessons.push({
                    title: domain + ' – Module ' + (i + 1) + ' Lesson ' + (j + 1),
                    content: {
                        explanation: 'This is an auto-generated lesson about ' + domain + '.',
                        examples: ['Example 1 for ' + domain],
                        practice: 'Practice task for ' + domain
                    },
                    order: j + 1,
                    estimatedTime: 10 + Math.floor(Math.random() * 10)
                });
            }

            modules.push({
                name: 'Module ' + (i + 1) + ': ' + domain + ' Concepts',
                lessons: lessons
            });
        }

        return modules;
    },

    getGeneratedCourses: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get('generated_courses', []);
            }
        } catch (e) {}
        return [];
    },

    getCourse: function(courseId) {
        var courses = this.getGeneratedCourses();
        for (var i = 0; i < courses.length; i++) {
            if (courses[i].id === courseId) return courses[i];
        }
        return null;
    },

    deleteCourse: function(courseId) {
        try {
            var courses = this.getGeneratedCourses();
            var filtered = courses.filter(function(c) { return c.id !== courseId; });
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('generated_courses', filtered);
            }
            console.log('🗑️ Course deleted:', courseId);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CourseGenerator && typeof LawAIApp.CourseGenerator.init === 'function') {
        LawAIApp.CourseGenerator.init();
    }
}, 400);

console.log('📚 CourseGenerator V2.0 ready');
