// js/academy/courseRegistry.js
// Part 57.5 Recovery Patch — Course Registry (ES6 Class)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CourseRegistry) {
        console.log('[CourseRegistry] Already exists, skipping...');
        return;
    }

    class CourseRegistry {
        constructor() {
            this._courses = new Map();
            this.initialized = false;
            this.version = '2.0.0';

            this.DEFAULT_COURSES = [
                // AI School Courses
                {
                    id: 'course-ai-fundamentals',
                    programId: 'program-ai-foundations',
                    title: 'AI Fundamentals',
                    description: 'Essential AI concepts and applications',
                    modules: []
                },
                {
                    id: 'course-prompt-engineering',
                    programId: 'program-ai-prompting',
                    title: 'Prompt Engineering Foundations',
                    description: 'Master the art of prompting AI models',
                    modules: []
                },
                {
                    id: 'course-ai-agents',
                    programId: 'program-ai-agents',
                    title: 'AI Agents Introduction',
                    description: 'Build intelligent AI agents and automations',
                    modules: []
                },
                // Business School Courses
                {
                    id: 'course-business-strategy',
                    programId: 'program-business-strategy',
                    title: 'Business Strategy Foundations',
                    description: 'Strategic thinking and planning',
                    modules: []
                },
                {
                    id: 'course-entrepreneurship',
                    programId: 'program-business-entrepreneurship',
                    title: 'Entrepreneurship Basics',
                    description: 'Start and grow your business',
                    modules: []
                },
                // Technology School Courses
                {
                    id: 'course-web-development',
                    programId: 'program-tech-development',
                    title: 'Web Development Foundations',
                    description: 'Build web applications with modern practices',
                    modules: []
                },
                {
                    id: 'course-system-design',
                    programId: 'program-tech-system-design',
                    title: 'Software Architecture Basics',
                    description: 'Design scalable systems and architectures',
                    modules: []
                }
            ];
        }

        /**
         * 初始化 Course Registry
         */
        initialize() {
            if (this.initialized) {
                console.log('[CourseRegistry] Already initialized');
                return this;
            }

            console.log('[CourseRegistry] 📖 Initializing...');

            this.DEFAULT_COURSES.forEach((course) => {
                this.register(course);
            });

            this.initialized = true;

            this._emit('COURSE_REGISTRY_READY', {
                courses: this.getAllCourses(),
                count: this._courses.size
            });

            console.log('[CourseRegistry] ✅ Initialized with', this._courses.size, 'courses');
            return this;
        }

        /**
         * 注册 Course
         */
        register(courseData) {
            if (!courseData.id) {
                console.warn('[CourseRegistry] Course: id is required');
                return null;
            }

            if (!courseData.title) {
                console.warn('[CourseRegistry] Course: title is required');
                return null;
            }

            if (!courseData.programId) {
                console.warn('[CourseRegistry] Course: programId is required');
                return null;
            }

            if (this._courses.has(courseData.id)) {
                console.warn('[CourseRegistry] Course already exists:', courseData.id);
                return courseData.id;
            }

            // 关联到 Program
            const programRegistry = window.LawAIApp?.ProgramRegistry;
            if (programRegistry) {
                const program = programRegistry.getProgram(courseData.programId);
                if (program) {
                    if (!program.courses) program.courses = [];
                    if (!program.courses.includes(courseData.id)) {
                        program.courses.push(courseData.id);
                    }
                }
            }

            const course = {
                ...courseData,
                status: courseData.status || 'active',
                modules: courseData.modules || [],
                createdAt: new Date().toISOString()
            };

            this._courses.set(courseData.id, course);

            this._emit('COURSE_REGISTERED', {
                courseId: course.id,
                title: course.title,
                programId: course.programId
            });

            console.log('[CourseRegistry] ✅ Registered:', course.title);
            return course.id;
        }

        /**
         * 获取 Course
         */
        getCourse(id) {
            return this._courses.get(id) || null;
        }

        /**
         * 获取所有 Courses
         */
        getAllCourses() {
            return Array.from(this._courses.values());
        }

        /**
         * 按 Program 获取 Courses
         */
        getCoursesByProgram(programId) {
            return this.getAllCourses().filter((c) => c.programId === programId);
        }

        /**
         * 获取活跃 Courses
         */
        getActiveCourses() {
            return this.getAllCourses().filter((c) => c.status === 'active');
        }

        /**
         * 更新 Course
         */
        updateCourse(id, updates) {
            const course = this._courses.get(id);
            if (!course) {
                console.warn('[CourseRegistry] Course not found:', id);
                return null;
            }

            const updated = {
                ...course,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this._courses.set(id, updated);
            return updated;
        }

        /**
         * 获取统计
         */
        getStats() {
            const courses = this.getAllCourses();
            return {
                totalCourses: courses.length,
                activeCourses: this.getActiveCourses().length
            };
        }

        /**
         * 获取状态
         */
        getStatus() {
            return {
                initialized: this.initialized,
                version: this.version,
                courseCount: this._courses.size
            };
        }

        /**
         * 私有事件发射
         */
        _emit(eventName, data) {
            try {
                const event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {
                // 忽略
            }
        }
    }

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    const courseRegistry = new CourseRegistry();
    window.LawAIApp.CourseRegistry = courseRegistry;

    // 自动初始化 (等待 ProgramRegistry)
    function autoInit() {
        const programReg = window.LawAIApp?.ProgramRegistry;
        if (programReg && programReg.initialized) {
            courseRegistry.initialize();
        } else {
            document.addEventListener('PROGRAM_REGISTRY_READY', () => {
                courseRegistry.initialize();
            });
            // 后备
            setTimeout(() => {
                if (!courseRegistry.initialized) {
                    courseRegistry.initialize();
                }
            }, 1500);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 300);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoInit, 300);
        });
    }

    console.log('[CourseRegistry] Module loaded (Part 57.5 Recovery)');

})();
