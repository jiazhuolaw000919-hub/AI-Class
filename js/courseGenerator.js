// ===========================================
// courseGenerator.js
// Season 5 Part 25-29 — AI Course Generator
// V5.0 — 1-shot with verbose logging
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseGenerator = {
    version: '5.0.0',
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📚 CourseGenerator V5.0 initialized (1-shot)');
    },

    generate: async function(form) {
        console.log('🔵 [Step 1] generate() called');
        form = form || {};
        var topic = form.topic || 'AI Fundamentals';
        var level = form.level || 'beginner';
        var depth = form.depth || 'practical';
        var time = parseInt(form.time) || 30;
        var goal = form.goal || '';
        var ai = form.ai || 'auto';

        console.log('🔵 [Step 2] Parsed form:', { topic: topic, level: level, depth: depth, time: time });

        var courseId = 'gen_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        var subjectCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);
        var lessonCount = depth === 'overview' ? 2 : (depth === 'deep' ? 5 : 3);

        console.log('🔵 [Step 3] Will generate:', subjectCount, 'subjects ×', lessonCount, 'lessons');

        var aiLayer = LawAIApp.AILayer;
        if (!aiLayer || typeof aiLayer.request !== 'function') {
            throw new Error('AI layer not available');
        }

        var prompt = this._buildCoursePrompt(topic, level, depth, subjectCount, lessonCount, goal);
        console.log('🔵 [Step 4] Prompt length:', prompt.length);
        console.log('🔵 [Step 4a] Prompt preview:', prompt.slice(0, 200) + '...');

        var t0 = Date.now();
        var result;
        try {
            console.log('🔵 [Step 5] Calling AILayer.request...');
            result = await aiLayer.request('course-generation', { prompt: prompt });
            console.log('🔵 [Step 6] AILayer.request returned');
        } catch (e) {
            console.error('🔴 [Step 5] AI request failed:', e);
            throw new Error('AI request failed: ' + e.message);
        }

        var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        console.log('🔵 [Step 7] AI response in', elapsed, 's');
        console.log('🔵 [Step 7a] Raw response:', result);

        var text = this._extractText(result);
        console.log('🔵 [Step 8] Extracted text length:', text.length);
        if (!text) {
            throw new Error('AI returned empty response (mock or blocked)');
        }
        console.log('🔵 [Step 8a] Text preview:', text.slice(0, 300));

        var parsed = this._parseCourseJSON(text);
        console.log('🔵 [Step 9] Parsed JSON:', parsed ? ('subjects: ' + (parsed.subjects ? parsed.subjects.length : 0)) : 'FAILED');

        if (!parsed || !parsed.subjects || parsed.subjects.length === 0) {
            throw new Error('AI returned invalid course JSON');
        }

        var subjects = parsed.subjects.map(function(s, si) {
            return {
                id: 'gen_subject_' + Date.now() + '_' + si,
                title: s.title || ('Subject ' + (si + 1)),
                description: s.description || '',
                order: si + 1,
                lessons: (s.lessons || []).map(function(l, li) {
                    // 兼容新旧格式
                    var sections = l.sections || (l.content ? [{
                        id: 'section-01',
                        type: 'foundation',
                        title: 'Introduction',
                        content: [{ type: 'paragraph', content: l.content }]
                    }] : []);
                
                    return {
                        id: 'gen_lesson_' + Date.now() + '_' + si + '_' + li,
                        title: l.title || ('Lesson ' + (li + 1)),
                        description: l.description || '',
                        learningObjectives: l.learningObjectives || [],
                        opening: l.opening || null,
                        sections: sections,
                        keyTakeaways: l.keyTakeaways || [],
                        reflection: l.reflection || null,
                        estimatedMinutes: time,
                        order: li + 1,
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
        console.log('✅ [Step 10] Course preview generated:', courseId, '| subjects:', subjects.length);

        return course;
    },

    // ============================================================
    // 🔥 Part C: Lesson Format 对齐（使用现有 lesson JSON 结构）
    // ============================================================
    _buildCoursePrompt: function(topic, level, depth, subjectCount, lessonCount, goal) {
        var prompt = 'You are a curriculum designer. Generate a complete ' + depth + ' course on "' + topic + '" for a ' + level + ' learner.' +
            (goal ? ' The learner\'s goal is: ' + goal + '.' : '') +
            '\n\nCourse Requirements:' +
            '\n- Exactly ' + subjectCount + ' subjects' +
            '\n- Each subject has exactly ' + lessonCount + ' lessons' +
            '\n- Content should be accurate, useful, and beginner-friendly' +
            '\n\nEach lesson MUST include ALL of the following fields:' +
            '\n1. title: concise lesson title (5-10 words)' +
            '\n2. description: 1-2 sentence summary' +
            '\n3. learningObjectives: array of 3-4 specific objectives' +
            '\n4. opening: { hook: "engaging opening question or statement", relevance: "why this matters" }' +
            '\n5. sections: array of 2-3 sections, each with:' +
            '\n   - id: "section-01", "section-02", etc.' +
            '\n   - type: one of "foundation", "core", "advanced", "practical"' +
            '\n   - title: section title' +
            '\n   - content: array of content blocks, each { type: "paragraph"|"definition"|"important"|"example", content: "..." }' +
            '\n6. keyTakeaways: array of 3-5 key points' +
            '\n7. reflection: { prompt: "reflection question", hint: "hint for reflection" }' +
            '\n\nReturn ONLY valid JSON. No markdown. No code fences. No commentary.' +
            '\n\nExact JSON shape:' +
            '\n{' +
            '\n  "title": "...",' +
            '\n  "description": "...",' +
            '\n  "subjects": [' +
            '\n    {' +
            '\n      "title": "...",' +
            '\n      "description": "...",' +
            '\n      "lessons": [' +
            '\n        {' +
            '\n          "title": "...",' +
            '\n          "description": "...",' +
            '\n          "learningObjectives": ["...", "...", "..."],' +
            '\n          "opening": { "hook": "...", "relevance": "..." },' +
            '\n          "sections": [' +
            '\n            {' +
            '\n              "id": "section-01",' +
            '\n              "type": "foundation",' +
            '\n              "title": "...",' +
            '\n              "content": [' +
            '\n                { "type": "paragraph", "content": "..." },' +
            '\n                { "type": "definition", "term": "...", "definition": "...", "example": "..." },' +
            '\n                { "type": "important", "title": "...", "content": "..." }' +
            '\n              ]' +
            '\n            }' +
            '\n          ],' +
            '\n          "keyTakeaways": ["...", "...", "..."],' +
            '\n          "reflection": { "prompt": "...", "hint": "..." }' +
            '\n        }' +
            '\n      ]' +
            '\n    }' +
            '\n  ]' +
            '\n}';

        return prompt;
    },

    _parseCourseJSON: function(text) {
        if (!text) return null;

        var cleaned = text.trim();
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

        var start = cleaned.indexOf('{');
        var end = cleaned.lastIndexOf('}');

        if (start === -1) return null;

        var jsonStr = (end > start) ? cleaned.slice(start, end + 1) : cleaned.slice(start);

        // 🔥 尝试解析
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('[CourseGenerator] First parse failed:', e.message);
            console.warn('[CourseGenerator] Attempting repair...');

            // 🔥 修复 1: 如果被截断，尝试补全 JSON
            var repaired = jsonStr;

            // 数开闭括号
            var openBraces = (repaired.match(/\{/g) || []).length;
            var closeBraces = (repaired.match(/\}/g) || []).length;
            var openBrackets = (repaired.match(/\[/g) || []).length;
            var closeBrackets = (repaired.match(/\]/g) || []).length;

            // 补全括号
            while (closeBrackets < openBrackets) {
                repaired += ']';
                closeBrackets++;
            }
            while (closeBraces < openBraces) {
                repaired += '}';
                closeBraces++;
            }

            try {
                var parsed = JSON.parse(repaired);
                console.log('[CourseGenerator] ✅ Repaired JSON parsed successfully');
                return parsed;
            } catch (e2) {
                console.error('[CourseGenerator] Repair also failed:', e2.message);
                console.error('[CourseGenerator] Raw (first 2000):', jsonStr.slice(0, 2000));
                return null;
            }
        }
    },

    _extractText: function(result) {
        if (!result) return '';
        var text = '';
        if (typeof result === 'string') text = result;
        else if (result.text) text = result.text;
        else if (result.content) text = result.content;
        else if (result.response) text = result.response;
        else if (result.message) text = result.message;

        if (text && (
            text.indexOf('AI response generated successfully') !== -1 ||
            text.indexOf('placeholder') !== -1 ||
            text.length < 10
        )) {
            return '';
        }
        return text;
    },

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

console.log('📚 CourseGenerator V5.0 ready');
