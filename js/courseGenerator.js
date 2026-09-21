// ===========================================
// courseGenerator.js
// Season 5 Part 25-29 — AI Course Generator
// 1-shot generation (avoid Vercel 10s timeout)
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseGenerator = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📚 CourseGenerator V4.0 initialized (1-shot)');
    },

    // ============================================================
    // 🔥 1-shot generation：只调一次 AI
    // ============================================================
    generate: async function(form) {
        form = form || {};
        var topic = form.topic || 'AI Fundamentals';
        var level = form.level || 'beginner';
        var depth = form.depth || 'practical';
        var time = parseInt(form.time) || 30;
        var goal = form.goal || '';
        var ai = form.ai || 'auto';

        console.log('📚 CourseGenerator.generate (1-shot):', topic, level, depth);

        var courseId = 'gen_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        // 决定 subject 和 lesson 数量
        var subjectCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);
        var lessonCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);

        // 🔥 1 次 AI 调用
        var aiLayer = LawAIApp.AILayer;
        if (!aiLayer || typeof aiLayer.request !== 'function') {
            throw new Error('AI layer not available');
        }

        var prompt = this._buildCoursePrompt(topic, level, depth, subjectCount, lessonCount, goal);
        console.log('📤 Sending 1-shot prompt, length:', prompt.length);

        var t0 = Date.now();
        var result;
        try {
            result = await aiLayer.request('course-generation', { prompt: prompt });
        } catch (e) {
            throw new Error('AI request failed: ' + e.message);
        }

        console.log('📥 AI response received in', (Date.now() - t0) / 1000, 's');

        var text = this._extractText(result);
        if (!text) {
            throw new Error('AI returned empty response (mock or blocked)');
        }

        // 解析 JSON
        var parsed = this._parseCourseJSON(text);
        if (!parsed || !parsed.subjects || parsed.subjects.length === 0) {
            throw new Error('AI returned invalid course JSON');
        }

        // 构建标准 course 对象
        var subjects = parsed.subjects.map(function(s, si) {
            return {
                id: 'gen_subject_' + Date.now() + '_' + si,
                title: s.title || ('Subject ' + (si + 1)),
                description: s.description || '',
                order: si + 1,
                lessons: (s.lessons || []).map(function(l, li) {
                    var lessonContent = l.content || l.text || '';
                    return {
                        id: 'gen_lesson_' + Date.now() + '_' + si + '_' + li,
                        title: l.title || ('Lesson ' + (li + 1)),
                        content: lessonContent,
                        order: li + 1,
                        estimatedMinutes: time,
                        objectives: l.objectives || [],
                        sections: [
                            {
                                id: 'section_1',
                                title: 'Introduction',
                                type: 'foundation',
                                content: [{ type: 'paragraph', content: lessonContent }]
                            }
                        ],
                        practice: { enabled: false, items: [] }
                    };
                })
            };
        });

        var course = {
            id: courseId,
            type: 'GENERATED',
            title: parsed.title || topic,
            description: parsed.description || ('AI-generated course on ' + topic),
            domain: topic,
            level: level,
            difficulty_level: level,
            goal: goal,
            timePerDay: time,
            depth: depth,
            practicePreference: form.practice || 'balanced',
            generatedBy: ai,
            created_by_ai: true,
            isPreview: true,
            subjects: subjects,
            createdAt: new Date().toISOString(),
            generatedAt: new Date().toISOString()
        };

        LawAIApp.EventBus?.emit?.('CoursePreviewGenerated', { courseId: courseId, course: course });
        console.log('✅ Course preview generated:', courseId, '| subjects:', subjects.length);

        return course;
    },

    // ============================================================
    // 🔥 Prompt 构建
    // ============================================================
    _buildCoursePrompt: function(topic, level, depth, subjectCount, lessonCount, goal) {
        return 'You are a curriculum designer. Generate a complete ' + depth + ' course on "' + topic + '" for a ' + level + ' learner.' +
            (goal ? ' The learner\'s goal is: ' + goal + '.' : '') +
            '\n\nRequirements:' +
            '\n- Exactly ' + subjectCount + ' subjects' +
            '\n- Each subject has exactly ' + lessonCount + ' lessons' +
            '\n- Each lesson has a concise title and a 2-3 paragraph explanation (150-300 words)' +
            '\n- Content should be accurate and useful' +
            '\n\nReturn ONLY valid JSON in this exact shape (no markdown, no code fences, no commentary):' +
            '\n{"title":"...","description":"...","subjects":[{"title":"...","description":"...","lessons":[{"title":"...","content":"..."}]}]}';
    },

    // ============================================================
    // 🔥 解析 AI 返回的 JSON
    // ============================================================
    _parseCourseJSON: function(text) {
        if (!text) return null;

        // 去掉 markdown code fence
        var cleaned = text.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

        // 找第一个 { 到最后一个 }
        var start = cleaned.indexOf('{');
        var end = cleaned.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) return null;

        var jsonStr = cleaned.slice(start, end + 1);

        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('[CourseGenerator] JSON parse failed:', e.message);
            console.error('[CourseGenerator] Raw text (first 500):', jsonStr.slice(0, 500));
            return null;
        }
    },

    // ============================================================
    // 🔥 提取 AI 文本
    // ============================================================
    _extractText: function(result) {
        if (!result) return '';
        var text = '';
        if (typeof result === 'string') text = result;
        else if (result.text) text = result.text;
        else if (result.content) text = result.content;
        else if (result.response) text = result.response;
        else if (result.message) text = result.message;

        // 检测 mock
        if (text && (
            text.indexOf('AI response generated successfully') !== -1 ||
            text.indexOf('placeholder') !== -1 ||
            text.length < 10
        )) {
            return '';
        }
        return text;
    },

    // ============================================================
    // Accept
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
            return true;
        } catch (e) {
            return false;
        }
    }
};

setTimeout(function() {
    if (LawAIApp.CourseGenerator && typeof LawAIApp.CourseGenerator.init === 'function') {
        LawAIApp.CourseGenerator.init();
    }
}, 400);

console.log('📚 CourseGenerator V4.0 ready (1-shot + JSON parse)');
