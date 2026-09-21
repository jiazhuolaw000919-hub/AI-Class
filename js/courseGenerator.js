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

    // ============================================================
    // 🔥 Bible Part 25: 接受 form，不直接 publish
    // 返回 preview course，不写入 storage
    // ============================================================
    generate: async function(formOrDomain, difficultyParam, userProfileParam) {
        var form;
        // 兼容旧签名
        if (typeof formOrDomain === 'string') {
            form = {
                topic: formOrDomain,
                level: difficultyParam || 'beginner',
                goal: '',
                time: '30',
                depth: 'practical',
                practice: 'balanced',
                ai: ''
            };
        } else {
            form = formOrDomain || {};
        }

        var domain = form.topic || 'AI Fundamentals';
        var difficulty = form.level || 'beginner';

        console.log('📚 CourseGenerator.generate (preview):', domain, difficulty);

        var courseId = 'gen_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // 生成模块
        var modules = this._generateModules(domain, difficulty, form);

        var course = {
            id: courseId,
            type: 'GENERATED',
            title: domain + ' – ' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Course',
            description: 'AI-generated ' + domain + ' course tailored for ' + difficulty + ' level.',
            difficulty_level: difficulty,
            domain: domain,
            level: difficulty,
            goal: (typeof userProfile === 'object' && userProfile.goal) || '',
            timePerDay: (typeof userProfile === 'object' && parseInt(userProfile.time)) || 30,
            depth: (typeof userProfile === 'object' && userProfile.depth) || 'practical',
            practicePreference: (typeof userProfile === 'object' && userProfile.practice) || 'balanced',
            created_by_ai: true,
            isPreview: true,                    // 🔥 Bible Part 26
            modules: modules,
            subjects: modules,                  // 🔥 兼容 UI（modules = subjects）
            generatedAt: new Date().toISOString(),
            generatedBy: 'auto',
            createdAt: new Date().toISOString()
        };

        // 🔥 Bible Part 36: 不直接写入 storage
        // 由 UI 层的 Accept 步骤写入
        // 只发事件
        LawAIApp.EventBus?.emit?.('CoursePreviewGenerated', { courseId: courseId, course: course });
        console.log('✅ Course preview generated:', courseId);

        return course;
    },

    _generateModules: async function(domain, difficulty, form) {
        form = form || {};
        var depth = form.depth || 'practical';
        var moduleCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);
        var modules = [];
    
        for (var i = 0; i < moduleCount; i++) {
            var moduleTitle = await this._generateModuleTitle(domain, i + 1, difficulty);
            var lessons = await this._generateLessonsForModule(domain, moduleTitle, i, depth, form);
            modules.push({
                id: 'gen_module_' + Date.now() + '_' + i,
                name: moduleTitle,
                lessons: lessons
            });
        }
    
        return modules;
    },
    
    _generateModuleTitle: async function(domain, num, difficulty) {
        var ai = LawAIApp.AILayer;
        if (ai && typeof ai.request === 'function' && ai.isAvailable && ai.isAvailable()) {
            try {
                var result = await ai.request(
                    'Generate a short module title (max 6 words) for module ' + num + ' of a ' + difficulty + ' course on ' + domain + '. Return only the title.',
                    { type: 'title' }
                );
                if (result && typeof result === 'string') return result.trim();
                if (result && result.text) return result.text.trim();
            } catch (e) {
                console.warn('[CourseGenerator] AI title generation failed:', e);
            }
        }
        // Fallback
        return 'Module ' + num + ': ' + domain + ' Concepts';
    },

    // ============================================================
    // 🔥 Bible Part 29: Accept course（由 UI 层调用）
    // ============================================================
    acceptGeneratedCourse: function(course) {
        if (!course) return false;
        try {
            // 移除 preview 标记
            course.isPreview = false;
            course.acceptedAt = new Date().toISOString();

            var courses = this.getGeneratedCourses();
            courses.push(course);

            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('generated_courses', courses);
            }

            LawAIApp.EventBus?.emit?.('CourseAccepted', { courseId: course.id, course: course });
            console.log('✅ Course accepted:', course.id);
            return true;
        } catch (e) {
            console.error('[CourseGenerator] accept failed:', e);
            return false;
        }
    },

    // ============================================================
    // 🔥 Bible Part 29: Accept course（由 UI 层调用）
    // ============================================================
    acceptGeneratedCourse: function(course) {
        if (!course) return false;
        try {
            course.isPreview = false;
            course.acceptedAt = new Date().toISOString();

            var courses = this.getGeneratedCourses();
            courses.push(course);

            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('generated_courses', courses);
            }

            LawAIApp.EventBus?.emit?.('CourseAccepted', { courseId: course.id, course: course });
            console.log('✅ Course accepted:', course.id);
            return true;
        } catch (e) {
            console.error('[CourseGenerator] accept failed:', e);
            return false;
        }
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
