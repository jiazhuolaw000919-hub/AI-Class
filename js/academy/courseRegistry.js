// js/academy/courseRegistry.js
// S4 扩展版 — 从 ContentRegistry 动态加载
(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.CourseRegistry) {
        // 如果已存在，进行扩展而不是重新创建
        console.log('[CourseRegistry] Extending existing...');
        const existing = window.LawAIApp.CourseRegistry;
        
        // 添加 S4 方法
        existing.loadFromS4 = async function() {
            const registry = window.LawAIApp?.S4ContentRegistry || window.LawAIApp?.ContentRegistry;
            if (!registry) {
                console.warn('[CourseRegistry] ContentRegistry not available');
                return false;
            }

            // 获取所有 S4 Course
            const s4Courses = registry.getCourses();
            if (!s4Courses || s4Courses.length === 0) {
                console.warn('[CourseRegistry] No S4 courses found');
                return false;
            }

            // 注册到 CourseRegistry
            let count = 0;
            for (const s4Course of s4Courses) {
                // 检查是否已存在
                if (!this._courses.has(s4Course.courseId)) {
                    // 转换为 CourseRegistry 格式
                    const courseData = {
                        id: s4Course.courseId,
                        programId: `program-${s4Course.school}`, // 临时映射
                        title: s4Course.title,
                        description: s4Course.description || '',
                        modules: [],
                        _s4: true, // 标记为 S4 来源
                        _metadata: s4Course.metadata
                    };
                    this._courses.set(s4Course.courseId, courseData);
                    count++;
                }
            }

            console.log(`[CourseRegistry] Loaded ${count} courses from S4`);
            return true;
        };

        // 自动加载 S4 内容
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(() => {
                existing.loadFromS4().catch(() => {});
            }, 500);
        }

        console.log('[CourseRegistry] ✅ Extended with S4 support');
        return;
    }

    // ============================================================
    // 如果不存在，创建新实例（包含 S4 支持）
    // ============================================================
    class CourseRegistry {
        constructor() {
            this._courses = new Map();
            this.initialized = false;
            this.version = '2.0.0';
            this._s4Loaded = false;

            // 保留旧 DEFAULT_COURSES 作为 fallback
            this.DEFAULT_COURSES = [
                {
                    id: 'course-ai-fundamentals',
                    programId: 'program-ai-foundations',
                    title: 'AI Fundamentals',
                    description: 'Essential AI concepts and applications',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-prompt-engineering',
                    programId: 'program-ai-prompting',
                    title: 'Prompt Engineering Foundations',
                    description: 'Master the art of prompting AI models',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-ai-agents',
                    programId: 'program-ai-agents',
                    title: 'AI Agents Introduction',
                    description: 'Build intelligent AI agents and automations',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-business-strategy',
                    programId: 'program-business-strategy',
                    title: 'Business Strategy Foundations',
                    description: 'Strategic thinking and planning',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-entrepreneurship',
                    programId: 'program-business-entrepreneurship',
                    title: 'Entrepreneurship Basics',
                    description: 'Start and grow your business',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-web-development',
                    programId: 'program-tech-development',
                    title: 'Web Development Foundations',
                    description: 'Build web applications with modern practices',
                    modules: [],
                    _legacy: true
                },
                {
                    id: 'course-system-design',
                    programId: 'program-tech-system-design',
                    title: 'Software Architecture Basics',
                    description: 'Design scalable systems and architectures',
                    modules: [],
                    _legacy: true
                }
            ];
        }

        initialize() {
            if (this.initialized) {
                console.log('[CourseRegistry] Already initialized');
                return this;
            }

            console.log('[CourseRegistry] 📖 Initializing...');

            // 先加载默认课程（保证兼容）
            this.DEFAULT_COURSES.forEach((course) => {
                this.register(course);
            });

            this.initialized = true;

            this._emit('COURSE_REGISTRY_READY', {
                courses: this.getAllCourses(),
                count: this._courses.size
            });

            // 尝试异步加载 S4 内容
            this._loadS4Courses();

            console.log('[CourseRegistry] ✅ Initialized with', this._courses.size, 'courses');
            return this;
        }

        async _loadS4Courses() {
            if (this._s4Loaded) return;
            try {
                const registry = window.LawAIApp?.S4ContentRegistry || window.LawAIApp?.ContentRegistry;
                if (!registry) {
                    // 如果 ContentRegistry 还没有 S4 方法，等待
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const retry = window.LawAIApp?.S4ContentRegistry || window.LawAIApp?.ContentRegistry;
                    if (!retry) return;
                }

                const s4Registry = window.LawAIApp?.S4ContentRegistry || window.LawAIApp?.ContentRegistry;
                const s4Courses = s4Registry.getCourses ? s4Registry.getCourses() : [];
                
                if (s4Courses && s4Courses.length > 0) {
                    let count = 0;
                    for (const s4Course of s4Courses) {
                        if (!this._courses.has(s4Course.courseId)) {
                            const courseData = {
                                id: s4Course.courseId,
                                programId: `program-${s4Course.school || 'science'}`,
                                title: s4Course.title,
                                description: s4Course.description || '',
                                modules: [],
                                _s4: true,
                                _metadata: s4Course.metadata || {}
                            };
                            this._courses.set(s4Course.courseId, courseData);
                            count++;
                        }
                    }
                    this._s4Loaded = true;
                    console.log(`[CourseRegistry] ✅ Loaded ${count} courses from S4`);
                    
                    this._emit('COURSE_REGISTRY_UPDATED', {
                        courses: this.getAllCourses(),
                        count: this._courses.size
                    });
                }
            } catch (e) {
                console.warn('[CourseRegistry] S4 load failed:', e);
            }
        }

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
                // 如果是 S4 更新，允许更新
                if (courseData._s4) {
                    const existing = this._courses.get(courseData.id);
                    this._courses.set(courseData.id, {
                        ...existing,
                        ...courseData,
                        _s4: true
                    });
                    return courseData.id;
                }
                console.warn('[CourseRegistry] Course already exists:', courseData.id);
                return courseData.id;
            }

            const programRegistry = window.LawAIApp?.ProgramRegistry;
            if (programRegistry) {
                const program = programRegistry.getProgram?.(courseData.programId);
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
                createdAt: courseData.createdAt || new Date().toISOString()
            };

            this._courses.set(courseData.id, course);

            this._emit('COURSE_REGISTERED', {
                courseId: course.id,
                title: course.title,
                programId: course.programId,
                fromS4: !!courseData._s4
            });

            console.log('[CourseRegistry] ✅ Registered:', course.title);
            return course.id;
        }

                getCourse(id) {
            return this._courses.get(id) || null;
        }

        /**
         * ═══ Part 19: 获取 Course 摘要（轻量级） ═══
         */
        getCourseSummary(courseId) {
            var course = this.getCourse(courseId);
            if (!course) return null;
            
            return {
                id: course.id,
                title: course.title,
                schoolId: course.schoolId || course._metadata?.school,
                description: course.description,
                difficulty: course.difficulty,
                subjectCount: course.subjects ? course.subjects.length : 0,
                status: course.status
            };
        }

        getAllCourses() {
            return Array.from(this._courses.values());
        }

        hasCourse(courseId) {
            if (!courseId) return false;
            return this._courses.has(courseId);
        }

        getCoursesByProgram(programId) {
            return this.getAllCourses().filter((c) => c.programId === programId);
        }

        getActiveCourses() {
            return this.getAllCourses().filter((c) => c.status === 'active');
        }

        getS4Courses() {
            return this.getAllCourses().filter((c) => c._s4 === true);
        }

        getLegacyCourses() {
            return this.getAllCourses().filter((c) => !c._s4);
        }

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

        getStats() {
            const courses = this.getAllCourses();
            return {
                totalCourses: courses.length,
                activeCourses: this.getActiveCourses().length,
                s4Courses: this.getS4Courses().length,
                legacyCourses: this.getLegacyCourses().length
            };
        }

        getStatus() {
            return {
                initialized: this.initialized,
                version: this.version,
                courseCount: this._courses.size,
                s4Loaded: this._s4Loaded
            };
        }

        _emit(eventName, data) {
            try {
                const event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
                if (window.LawAIApp?.EventBus?.emit) {
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

    function autoInit() {
        const programReg = window.LawAIApp?.ProgramRegistry;
        if (programReg && programReg.initialized) {
            courseRegistry.initialize();
        } else {
            document.addEventListener('PROGRAM_REGISTRY_READY', () => {
                courseRegistry.initialize();
            });
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

    console.log('[CourseRegistry] Module loaded (S4 Extended)');

})();
