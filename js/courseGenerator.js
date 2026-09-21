// ===========================================
// courseGenerator.js
// Season 5 Part 25-29 — AI Course Generator
// Structure: Course → Subjects → Lessons
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseGenerator = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📚 CourseGenerator V3.0 initialized (Subject-based)');
    },

    // ============================================================
    // 🔥 Bible Part 25: 生成 Course（返回 preview，不 publish）
    // ============================================================
    generate: async function(form) {
        form = form || {};
        var topic = form.topic || 'AI Fundamentals';
        var level = form.level || 'beginner';
        var depth = form.depth || 'practical';
        var time = parseInt(form.time) || 30;
        var goal = form.goal || '';
        var ai = form.ai || 'auto';

        console.log('📚 CourseGenerator.generate:', topic, level, depth);

        var courseId = 'gen_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // 生成 subjects（异步，可能调 AI）
        var subjects = await this._generateSubjects(topic, level, depth, time, goal, ai);

        var course = {
            id: courseId,
            type: 'GENERATED',                       // Bible Part 37
            title: topic,
            description: 'AI-generated ' + topic + ' course for ' + level + ' level.',
            domain: topic,
            level: level,
            difficulty_level: level,
            goal: goal,
            timePerDay: time,
            depth: depth,
            practicePreference: form.practice || 'balanced',
            generatedBy: ai,
            created_by_ai: true,
            isPreview: true,                          // Bible Part 26
            subjects: subjects,                       // 🔥 用 subjects，不是 modules
            createdAt: new Date().toISOString(),
            generatedAt: new Date().toISOString()
        };

        // 🔥 Bible Part 36: 不在 generate 里写入 storage
        // 只发事件
        LawAIApp.EventBus?.emit?.('CoursePreviewGenerated', { courseId: courseId, course: course });
        console.log('✅ Course preview generated:', courseId, '| subjects:', subjects.length);

        return course;
    },

    // ============================================================
    // 🔥 生成 Subjects（Course 的直接子层）
    // ============================================================
    _generateSubjects: async function(topic, level, depth, time, goal, ai) {
        // 按 depth 决定 subject 数量
        var subjectCount;
        if (depth === 'overview') subjectCount = 2;
        else if (depth === 'deep') subjectCount = 5;
        else subjectCount = 3;

        // 尝试用 AI 生成 subject 标题
        var ai = this._isAIAvailable() ? LawAIApp.AILayer : null;
        var subjectTitles = [];

        if (ai) {
            try {
                var prompt = 'Generate ' + subjectCount + ' concise subject titles (each 2-6 words, one per line, no numbering) for a ' + level + ' course on "' + topic + '". Depth: ' + depth + '.' + (goal ? ' Learner goal: ' + goal + '.' : '');
                var result = await ai.request(prompt, { type: 'course-structure' });
                var text = this._extractText(result);
                if (text) {
                    subjectTitles = text.split('\n')
                        .map(function(l) { return l.replace(/^[\d\.\-\*\s]+/, '').trim(); })
                        .filter(function(l) { return l.length > 0 && l.length < 80; })
                        .slice(0, subjectCount);
                }
            } catch (e) {
                console.warn('[CourseGenerator] AI subject titles failed:', e);
            }
        }

        // Fallback titles
        while (subjectTitles.length < subjectCount) {
            var i = subjectTitles.length + 1;
            subjectTitles.push('Module ' + i + ': ' + topic + ' Fundamentals');
        }

        // 生成每个 subject 的 lessons
        var subjects = [];
        for (var i = 0; i < subjectCount; i++) {
            var title = subjectTitles[i];
            var lessons = await this._generateLessons(topic, title, level, depth, time, ai);
            subjects.push({
                id: 'gen_subject_' + Date.now() + '_' + i,
                title: title,
                description: 'Subject ' + (i + 1) + ' of the ' + topic + ' course',
                order: i + 1,
                lessons: lessons
            });
        }

        return subjects;
    },

    // ============================================================
    // 🔥 生成 Lessons（Subject 的子层）
    // ============================================================
    _generateLessons: async function(topic, subjectTitle, level, depth, time, ai) {
        var lessonCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);
        var lessons = [];

        for (var i = 0; i < lessonCount; i++) {
            var lessonTitle = await this._generateLessonTitle(topic, subjectTitle, i + 1, level, ai);
            var lessonContent = await this._generateLessonContent(topic, lessonTitle, level, depth, ai);

            lessons.push({
                id: 'gen_lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                title: lessonTitle,
                content: lessonContent,
                order: i + 1,
                estimatedMinutes: time,
                objectives: [],
                sections: [
                    {
                        id: 'section_1',
                        title: 'Introduction',
                        type: 'foundation',
                        content: [
                            {
                                type: 'paragraph',
                                content: lessonContent
                            }
                        ]
                    }
                ],
                practice: {
                    enabled: false,
                    items: []
                }
            });
        }

        return lessons;
    },

    // ============================================================
    // 🔥 AI 调用辅助
    // ============================================================
    _isAIAvailable: function() {
        try {
            var ai = LawAIApp.AILayer;
            return ai && typeof ai.isAvailable === 'function' && ai.isAvailable();
        } catch (e) {
            return false;
        }
    },

    _extractText: function(result) {
        if (!result) return '';
        if (typeof result === 'string') return result;
        if (result.text) return result.text;
        if (result.content) return result.content;
        if (result.response) return result.response;
        if (result.message) return result.message;
        return '';
    },

    _generateLessonTitle: async function(topic, subjectTitle, num, level, ai) {
        if (ai) {
            try {
                var prompt = 'Generate a concise lesson title (max 8 words, one line, no numbering) for lesson ' + num + ' in the subject "' + subjectTitle + '" from a ' + level + ' course on "' + topic + '".';
                var result = await ai.request(prompt, { type: 'lesson-title' });
                var text = this._extractText(result);
                if (text) {
                    var title = text.split('\n')[0].replace(/^[\d\.\-\*\s]+/, '').trim();
                    if (title.length > 0 && title.length < 100) return title;
                }
            } catch (e) {
                console.warn('[CourseGenerator] AI lesson title failed:', e);
            }
        }
        return subjectTitle + ' — Lesson ' + num;
    },

    _generateLessonContent: async function(topic, lessonTitle, level, depth, ai) {
        if (ai) {
            try {
                var prompt = 'Write a concise lesson introduction (2-3 paragraphs) for a ' + level + ' learner on "' + topic + '", specifically about "' + lessonTitle + '". Depth: ' + depth + '. No markdown headers, just plain explanatory text.';
                var result = await ai.request(prompt, { type: 'lesson-content' });
                var text = this._extractText(result);
                if (text && text.length > 50) return text;
            } catch (e) {
                console.warn('[CourseGenerator] AI lesson content failed:', e);
            }
        }
        // Fallback
        return 'This lesson covers "' + lessonTitle + '" as part of learning ' + topic + ' at ' + level + ' level. (AI content generation unavailable — placeholder text.)';
    },

    // ============================================================
    // 🔥 Bible Part 29: Accept（由 UI 层调用）
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

    // ============================================================
    // 读取
    // ============================================================
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

console.log('📚 CourseGenerator V3.0 ready (Subject-based + AI)');
