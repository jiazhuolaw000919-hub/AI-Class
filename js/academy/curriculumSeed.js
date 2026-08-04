// js/academy/curriculumSeed.js
// Part 57.5 — Curriculum Seed (Initial Data)
// Law AI Academy Developer Bible
//
// PURPOSE: Provide initial academic data
// Only includes Schools and Program placeholders (no full lesson content)

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumSeed) {
        console.log('[CurriculumSeed] Already exists, skipping...');
        return;
    }

    var CurriculumSeed = {
        version: '1.0.0',
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
        // 2. SEED DATA — Programs (Placeholders)
        // ============================================================

        programs: [
            // AI School Programs
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
                id: 'program-ai-agents',
                schoolId: 'school-ai',
                name: 'AI Agents & Automation',
                description: 'Build intelligent AI agents and automations',
                level: 'intermediate',
                status: 'active',
                modules: []
            },
            {
                id: 'program-ai-advanced',
                schoolId: 'school-ai',
                name: 'Advanced AI Applications',
                description: 'Deep dive into AI and machine learning',
                level: 'advanced',
                status: 'active',
                modules: []
            },
            // Business School Programs
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
                id: 'program-business-entrepreneurship',
                schoolId: 'school-business',
                name: 'Entrepreneurship',
                description: 'Start and grow your business',
                level: 'beginner',
                status: 'active',
                modules: []
            },
            {
                id: 'program-business-productivity',
                schoolId: 'school-business',
                name: 'Productivity & Management',
                description: 'Optimize workflows and manage teams',
                level: 'intermediate',
                status: 'active',
                modules: []
            },
            // Technology School Programs
            {
                id: 'program-tech-development',
                schoolId: 'school-technology',
                name: 'Software Development',
                description: 'Build software with modern practices',
                level: 'beginner',
                status: 'active',
                modules: []
            },
            {
                id: 'program-tech-system-design',
                schoolId: 'school-technology',
                name: 'System Design',
                description: 'Design scalable systems and architectures',
                level: 'intermediate',
                status: 'active',
                modules: []
            },
            {
                id: 'program-tech-mobile',
                schoolId: 'school-technology',
                name: 'Mobile Development',
                description: 'Build mobile applications for iOS and Android',
                level: 'beginner',
                status: 'active',
                modules: []
            }
        ],

        // ============================================================
        // 3. SEED DATA — Modules (Placeholders — NO full content)
        // ============================================================

        modules: [
            // AI Foundations Modules
            {
                id: 'module-ai-intro',
                programId: 'program-ai-foundations',
                name: 'Introduction to AI',
                description: 'What is AI and how does it work?',
                order: 1,
                lessons: []
            },
            {
                id: 'module-ai-python',
                programId: 'program-ai-foundations',
                name: 'Python for AI',
                description: 'Essential Python skills for AI development',
                order: 2,
                lessons: []
            },
            {
                id: 'module-ai-ml-basics',
                programId: 'program-ai-foundations',
                name: 'Machine Learning Basics',
                description: 'Core ML concepts and algorithms',
                order: 3,
                lessons: []
            },
            // AI Prompting Modules
            {
                id: 'module-prompt-basics',
                programId: 'program-ai-prompting',
                name: 'Prompt Basics',
                description: 'Fundamentals of prompting',
                order: 1,
                lessons: []
            },
            {
                id: 'module-prompt-advanced',
                programId: 'program-ai-prompting',
                name: 'Advanced Prompting',
                description: 'Complex prompting techniques',
                order: 2,
                lessons: []
            },
            // AI Agents Modules
            {
                id: 'module-agents-intro',
                programId: 'program-ai-agents',
                name: 'Agent Fundamentals',
                description: 'Understanding AI agents',
                order: 1,
                lessons: []
            },
            // Business Strategy Modules
            {
                id: 'module-strategy-basics',
                programId: 'program-business-strategy',
                name: 'Strategy Fundamentals',
                description: 'Core strategic thinking',
                order: 1,
                lessons: []
            },
            // Software Development Modules
            {
                id: 'module-dev-basics',
                programId: 'program-tech-development',
                name: 'Development Basics',
                description: 'Core programming concepts',
                order: 1,
                lessons: []
            }
        ],

        // ============================================================
        // 4. SEED DATA — Lessons (Placeholders — NO full content)
        // ============================================================

        lessons: [
            // AI Intro Lessons
            {
                id: 'lesson-what-is-ai',
                moduleId: 'module-ai-intro',
                title: 'What is Artificial Intelligence?',
                status: 'draft',
                duration: 15
            },
            {
                id: 'lesson-ai-history',
                moduleId: 'module-ai-intro',
                title: 'History of AI',
                status: 'draft',
                duration: 20
            },
            {
                id: 'lesson-ai-today',
                moduleId: 'module-ai-intro',
                title: 'AI Today: Current Applications',
                status: 'draft',
                duration: 15
            },
            // Python for AI Lessons
            {
                id: 'lesson-python-basics',
                moduleId: 'module-ai-python',
                title: 'Python Basics for AI',
                status: 'draft',
                duration: 25
            },
            {
                id: 'lesson-python-libraries',
                moduleId: 'module-ai-python',
                title: 'Essential Python Libraries for AI',
                status: 'draft',
                duration: 20
            }
        ],

        // ============================================================
        // 5. PUBLIC API
        // ============================================================

        /**
         * 加载种子数据到 Registry
         */
        load: function() {
            if (this.loaded) {
                console.log('[CurriculumSeed] Already loaded');
                return this;
            }

            console.log('[CurriculumSeed] 🌱 Loading seed data...');

            try {
                // 1. 加载 Schools
                var schoolRegistry = window.LawAIApp?.SchoolRegistry;
                if (schoolRegistry && typeof schoolRegistry.register === 'function') {
                    this.schools.forEach(function(school) {
                        schoolRegistry.register(school);
                    });
                    console.log('[CurriculumSeed] ✅ Loaded', this.schools.length, 'schools');
                } else {
                    console.warn('[CurriculumSeed] SchoolRegistry not available');
                }

                // 2. 加载 Programs
                var programRegistry = window.LawAIApp?.ProgramRegistry;
                if (programRegistry && typeof programRegistry.register === 'function') {
                    this.programs.forEach(function(program) {
                        programRegistry.register(program);
                    });
                    console.log('[CurriculumSeed] ✅ Loaded', this.programs.length, 'programs');
                } else {
                    console.warn('[CurriculumSeed] ProgramRegistry not available');
                }

                // 3. 加载 Modules (到 AcademyRegistry)
                var academyRegistry = window.LawAIApp?.AcademyRegistry;
                if (academyRegistry && typeof academyRegistry.registerModule === 'function') {
                    this.modules.forEach(function(module) {
                        try {
                            academyRegistry.registerModule(module);
                        } catch (e) {
                            // Module 可能已存在
                        }
                    });
                    console.log('[CurriculumSeed] ✅ Loaded', this.modules.length, 'modules');
                } else {
                    console.warn('[CurriculumSeed] AcademyRegistry not available for modules');
                }

                // 4. 加载 Lessons (到 AcademyRegistry)
                if (academyRegistry && typeof academyRegistry.registerLesson === 'function') {
                    this.lessons.forEach(function(lesson) {
                        try {
                            academyRegistry.registerLesson(lesson);
                        } catch (e) {
                            // Lesson 可能已存在
                        }
                    });
                    console.log('[CurriculumSeed] ✅ Loaded', this.lessons.length, 'lessons');
                }

                this.loaded = true;

                this._emit('CURRICULUM_READY', {
                    schools: this.schools.length,
                    programs: this.programs.length,
                    modules: this.modules.length,
                    lessons: this.lessons.length
                });

                console.log('[CurriculumSeed] ✅ Seed data loaded successfully');

            } catch (error) {
                console.error('[CurriculumSeed] Load failed:', error);
            }

            return this;
        },

        /**
         * 获取种子数据摘要
         */
        getSummary: function() {
            return {
                version: this.version,
                loaded: this.loaded,
                schools: this.schools.length,
                programs: this.programs.length,
                modules: this.modules.length,
                lessons: this.lessons.length
            };
        },

        // ============================================================
        // 6. PRIVATE — Event Helpers
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {
                // 忽略
            }
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.CurriculumSeed = CurriculumSeed;

    console.log('[CurriculumSeed] Module loaded (Part 57.5)');

    // ============================================================
    // Auto-Load — 等待 Registries 就绪
    // ============================================================

    function autoLoadSeed() {
        var schoolReg = window.LawAIApp?.SchoolRegistry;
        var progReg = window.LawAIApp?.ProgramRegistry;

        if (schoolReg && schoolReg._initialized && progReg && progReg._initialized) {
            CurriculumSeed.load();
        } else {
            console.log('[CurriculumSeed] Waiting for registries...');
            document.addEventListener('SCHOOL_REGISTRY_READY', function() {
                if (window.LawAIApp?.ProgramRegistry?._initialized) {
                    CurriculumSeed.load();
                }
            });
            document.addEventListener('PROGRAM_REGISTRY_READY', function() {
                if (window.LawAIApp?.SchoolRegistry?._initialized) {
                    CurriculumSeed.load();
                }
            });
            // 后备轮询
            var attempts = 0;
            var interval = setInterval(function() {
                attempts++;
                if (window.LawAIApp?.SchoolRegistry?._initialized && window.LawAIApp?.ProgramRegistry?._initialized) {
                    clearInterval(interval);
                    CurriculumSeed.load();
                } else if (attempts > 30) {
                    clearInterval(interval);
                    console.warn('[CurriculumSeed] Registries timeout, loading anyway...');
                    CurriculumSeed.load();
                }
            }, 300);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoLoadSeed, 300);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoLoadSeed, 300);
        });
    }

})();
