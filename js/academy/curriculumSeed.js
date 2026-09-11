// js/academy/curriculumSeed.js
// Part 57.5 — Curriculum Seed (Initial Data)
// v2.0.0 — 加 Course / Subject 数据 + 注册到 CourseRegistry / SubjectRegistry

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumSeed) {
        console.log('[CurriculumSeed] Already exists, skipping...');
        return;
    }

    var CurriculumSeed = {
        version: '2.0.0',
        loaded: false,

        // ============================================================
        // 1. SEED DATA — Schools
        // ============================================================
        schools: [
            {
                id: 'school-ai',
                name: 'School of Artificial Intelligence',
                shortName: 'AI School',
                description: 'AI literacy, tools, automation, agents, and AI systems',
                icon: '🤖',
                color: '#4a9eff',
                status: 'active'
            },
            {
                id: 'school-business',
                name: 'School of Business',
                shortName: 'Business School',
                description: 'Business strategy, entrepreneurship, management, finance, and productivity',
                icon: '💼',
                color: '#10b981',
                status: 'active'
            },
            {
                id: 'school-technology',
                name: 'School of Technology',
                shortName: 'Tech School',
                description: 'Software development, mobile development, game development, and system design',
                icon: '⚡',
                color: '#f59e0b',
                status: 'active'
            }
        ],

        // ============================================================
        // 2. SEED DATA — Programs
        // ============================================================
        programs: [
            {
                id: 'program-ai-foundations',
                schoolId: 'school-ai',
                name: 'AI Foundations',
                description: 'Essential AI concepts and applications',
                level: 'beginner',
                status: 'active',
                modules: []
            },
            {
                id: 'program-ai-prompting',
                schoolId: 'school-ai',
                name: 'Prompt Engineering',
                description: 'Master the art of prompting AI models',
                level: 'beginner',
                status: 'active',
                modules: []
            },
            {
                id: 'program-business-strategy',
                schoolId: 'school-business',
                name: 'Business Strategy',
                description: 'Strategic thinking and business planning',
                level: 'intermediate',
                status: 'active',
                modules: []
            },
            {
                id: 'program-tech-development',
                schoolId: 'school-technology',
                name: 'Software Development',
                description: 'Build software with modern practices',
                level: 'beginner',
                status: 'active',
                modules: []
            }
        ],

        // ============================================================
        // 3. SEED DATA — Courses 🆕
        // ============================================================
        courses: [
            {
                id: 'course-ai-fundamentals',
                schoolId: 'school-ai',
                programId: 'program-ai-foundations',
                title: 'AI Fundamentals',
                name: 'AI Fundamentals',
                description: 'Learn the basics of Artificial Intelligence',
                icon: '🤖',
                difficulty: 'beginner',
                estimatedHours: 10,
                status: 'active'
            },
            {
                id: 'course-prompt-engineering',
                schoolId: 'school-ai',
                programId: 'program-ai-prompting',
                title: 'Prompt Engineering',
                name: 'Prompt Engineering',
                description: 'Master the art of crafting effective prompts',
                icon: '✍️',
                difficulty: 'beginner',
                estimatedHours: 5,
                status: 'active'
            },
            {
                id: 'course-business-strategy',
                schoolId: 'school-business',
                programId: 'program-business-strategy',
                title: 'Business Strategy Basics',
                name: 'Business Strategy Basics',
                description: 'Strategic thinking fundamentals',
                icon: '📊',
                difficulty: 'intermediate',
                estimatedHours: 8,
                status: 'active'
            }
        ],

        // ============================================================
        // 4. SEED DATA — Subjects 🆕
        // ============================================================
        subjects: [
            {
                id: 'subject-what-is-ai',
                courseId: 'course-ai-fundamentals',
                title: 'What is AI?',
                name: 'What is AI?',
                description: 'Introduction to Artificial Intelligence',
                icon: '🧠',
                status: 'published',
                lessons: [
                    {
                        id: 'lesson-ai-intro',
                        title: 'Introduction to AI',
                        name: 'Introduction to AI',
                        description: 'Learn what AI is and its applications',
                        duration: 10,
                        status: 'published',
                        summary: 'Artificial Intelligence (AI) is the simulation of human intelligence by machines.',
                        sections: {
                            foundation: [
                                'AI stands for Artificial Intelligence',
                                'It enables machines to learn from experience',
                                'Common applications: voice assistants, recommendations, self-driving cars'
                            ]
                        },
                        keyTakeaways: [
                            'AI simulates human intelligence',
                            'Machine learning is a subset of AI',
                            'AI is everywhere in modern life'
                        ],
                        video: {
                            title: 'What is AI?',
                            url: 'https://www.youtube.com/embed/ad79nYk2keg'
                        }
                    },
                    {
                        id: 'lesson-ai-history',
                        title: 'A Brief History of AI',
                        name: 'A Brief History of AI',
                        description: 'How AI evolved from 1950s to today',
                        duration: 12,
                        status: 'published',
                        summary: 'AI has evolved through several waves of innovation since the 1950s.',
                        keyTakeaways: [
                            'AI was born in 1956 at Dartmouth',
                            'AI has gone through multiple "winters"',
                            'Modern AI is powered by deep learning'
                        ]
                    }
                ]
            },
            {
                id: 'subject-ai-today',
                courseId: 'course-ai-fundamentals',
                title: 'AI Today',
                name: 'AI Today',
                description: 'Current applications of AI in the real world',
                icon: '🌍',
                status: 'published',
                lessons: [
                    {
                        id: 'lesson-ai-applications',
                        title: 'AI in Daily Life',
                        name: 'AI in Daily Life',
                        description: 'How AI is used in everyday applications',
                        duration: 15,
                        status: 'published',
                        summary: 'AI powers many tools you use every day.'
                    }
                ]
            },
            {
                id: 'subject-prompt-basics',
                courseId: 'course-prompt-engineering',
                title: 'Prompt Basics',
                name: 'Prompt Basics',
                description: 'Fundamentals of prompting AI',
                icon: '✍️',
                status: 'published',
                lessons: [
                    {
                        id: 'lesson-prompt-intro',
                        title: 'Introduction to Prompting',
                        name: 'Introduction to Prompting',
                        description: 'Learn the basics of how to talk to AI',
                        duration: 12,
                        status: 'published',
                        summary: 'A prompt is the input you give to an AI model.'
                    }
                ]
            },
            {
                id: 'subject-strategy-basics',
                courseId: 'course-business-strategy',
                title: 'Strategy Fundamentals',
                name: 'Strategy Fundamentals',
                description: 'Core strategic thinking concepts',
                icon: '🎯',
                status: 'published',
                lessons: [
                    {
                        id: 'lesson-strategy-intro',
                        title: 'What is Strategy?',
                        name: 'What is Strategy?',
                        description: 'Introduction to business strategy',
                        duration: 20,
                        status: 'published',
                        summary: 'Strategy is the plan of action for achieving a goal.'
                    }
                ]
            }
        ],

        // ============================================================
        // 5. SEED DATA — Modules (保留原结构)
        // ============================================================
        modules: [
            {
                id: 'module-ai-intro',
                programId: 'program-ai-foundations',
                name: 'Introduction to AI',
                description: 'What is AI and how does it work?',
                order: 1,
                lessons: []
            },
            {
                id: 'module-prompt-basics',
                programId: 'program-ai-prompting',
                name: 'Prompt Basics',
                description: 'Fundamentals of prompting',
                order: 1,
                lessons: []
            }
        ],

        // ============================================================
        // 6. SEED DATA — Lessons (保留原结构)
        // ============================================================
        lessons: [
            {
                id: 'lesson-what-is-ai',
                moduleId: 'module-ai-intro',
                title: 'What is Artificial Intelligence?',
                status: 'draft',
                duration: 15
            }
        ],

        // ============================================================
        // 7. PUBLIC API — load
        // ============================================================

        load: function() {
            if (this.loaded) {
                console.log('[CurriculumSeed] Already loaded');
                return this;
            }

            console.log('[CurriculumSeed] 🌱 Loading seed data...');

            try {
                // 1. Schools → SchoolRegistry
                var schoolRegistry = window.LawAIApp?.SchoolRegistry;
                if (schoolRegistry && typeof schoolRegistry.register === 'function') {
                    this.schools.forEach(function(school) {
                        try { schoolRegistry.register(school); } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Schools:', this.schools.length);
                } else {
                    console.warn('[CurriculumSeed] SchoolRegistry not available');
                }

                // 2. Programs → ProgramRegistry
                var programRegistry = window.LawAIApp?.ProgramRegistry;
                if (programRegistry && typeof programRegistry.register === 'function') {
                    this.programs.forEach(function(program) {
                        try { programRegistry.register(program); } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Programs:', this.programs.length);
                } else {
                    console.warn('[CurriculumSeed] ProgramRegistry not available');
                }

                // 3. 🆕 Courses → CourseRegistry
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry) {
                    var registered = 0;
                    this.courses.forEach(function(course) {
                        try {
                            if (typeof courseRegistry.register === 'function') {
                                courseRegistry.register(course);
                                registered++;
                            } else if (typeof courseRegistry.registerCourse === 'function') {
                                courseRegistry.registerCourse(course);
                                registered++;
                            } else if (courseRegistry._courses && typeof courseRegistry._courses.set === 'function') {
                                courseRegistry._courses.set(course.id, course);
                                registered++;
                            }
                        } catch (e) {
                            console.warn('[CurriculumSeed] Course register failed:', course.id, e);
                        }
                    });
                    console.log('[CurriculumSeed] ✅ Courses:', registered, '/', this.courses.length);
                } else {
                    console.warn('[CurriculumSeed] CourseRegistry not available');
                }

                // 4. 🆕 Subjects → SubjectRegistry
                var subjectRegistry = window.LawAIApp?.SubjectRegistry;
                if (subjectRegistry && typeof subjectRegistry.register === 'function') {
                    var registered = 0;
                    this.subjects.forEach(function(subject) {
                        try {
                            subjectRegistry.register(subject);
                            registered++;
                        } catch (e) {
                            console.warn('[CurriculumSeed] Subject register failed:', subject.id, e);
                        }
                    });
                    console.log('[CurriculumSeed] ✅ Subjects:', registered, '/', this.subjects.length);
                } else {
                    console.warn('[CurriculumSeed] SubjectRegistry not available');
                }

                // 5. Modules → AcademyRegistry
                var academyRegistry = window.LawAIApp?.AcademyRegistry;
                if (academyRegistry && typeof academyRegistry.registerModule === 'function') {
                    this.modules.forEach(function(module) {
                        try { academyRegistry.registerModule(module); } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Modules:', this.modules.length);
                }

                // 6. Lessons → AcademyRegistry
                if (academyRegistry && typeof academyRegistry.registerLesson === 'function') {
                    this.lessons.forEach(function(lesson) {
                        try { academyRegistry.registerLesson(lesson); } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Lessons:', this.lessons.length);
                }

                this.loaded = true;

                this._emit('CURRICULUM_READY', {
                    schools: this.schools.length,
                    programs: this.programs.length,
                    courses: this.courses.length,
                    subjects: this.subjects.length,
                    modules: this.modules.length,
                    lessons: this.lessons.length
                });

                // 🔥 通知 CurriculumAuthority 重新 ingest
                var ca = window.LawAIApp?.CurriculumAuthority;
                if (ca && typeof ca._ingestFromRegistries === 'function') {
                    setTimeout(function() {
                        ca._ingestFromRegistries();
                        console.log('[CurriculumSeed] 🔄 Re-ingested to CurriculumAuthority');
                        console.log('[CurriculumSeed] === 验证 ===');
                        console.log('CA.schools:', ca.getAllSchools?.()?.length);
                        console.log('CA.courses:', ca.getAllCourses?.()?.length);
                        console.log('CA.subjects:', ca.getSubjectsByCourse?.('course-ai-fundamentals')?.length);
                        console.log('CA.lesson lesson-ai-intro:', ca.getLesson?.('lesson-ai-intro'));

                        // 重新渲染
                        if (window.LawAIApp?.AcademyExperienceManager?.render) {
                            try {
                                window.LawAIApp.AcademyExperienceManager.render();
                            } catch (e) {}
                        }
                    }, 100);
                }

                console.log('[CurriculumSeed] ✅ Seed data loaded successfully');

            } catch (error) {
                console.error('[CurriculumSeed] Load failed:', error);
            }

            return this;
        },

        getSummary: function() {
            return {
                version: this.version,
                loaded: this.loaded,
                schools: this.schools.length,
                programs: this.programs.length,
                courses: this.courses.length,
                subjects: this.subjects.length,
                modules: this.modules.length,
                lessons: this.lessons.length
            };
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {}
        }
    };

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CurriculumSeed = CurriculumSeed;

    console.log('[CurriculumSeed] Module loaded (v' + CurriculumSeed.version + ')');

    // ============================================================
    // Auto-Load
    // ============================================================
    function autoLoadSeed() {
        // 🔥 等 SchoolRegistry / CourseRegistry / SubjectRegistry 都就绪
        var attempts = 0;
        var maxAttempts = 60;
        var interval = setInterval(function() {
            attempts++;
            var schoolReg = window.LawAIApp?.SchoolRegistry;
            var courseReg = window.LawAIApp?.CourseRegistry;
            var subjectReg = window.LawAIApp?.SubjectRegistry;

            if (schoolReg && courseReg && subjectReg) {
                clearInterval(interval);
                console.log('[CurriculumSeed] Registries ready, loading...');
                CurriculumSeed.load();
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[CurriculumSeed] Registries timeout, loading anyway...');
                CurriculumSeed.load();
            }
        }, 100);
    }

    if (document.readyState === 'complete') {
        setTimeout(autoLoadSeed, 300);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoLoadSeed, 300);
        });
    }

})();
