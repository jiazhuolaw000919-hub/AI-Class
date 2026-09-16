// js/academy/curriculumSeed.js
// Part 57.5 — Curriculum Seed (Initial Data)
// v2.1.0 — 移除假 courses/subjects/lessons，改由 S4 ContentLoader 提供
//
// ⚠️ 重要变更 (v2.1.0):
//   之前这里硬编码了 course-ai-fundamentals / subject-what-is-ai 等假数据，
//   会污染 CourseRegistry / SubjectRegistry，导致 UI 点击 lesson 时
//   拼出 /content/courses/course-ai-fundamentals/... 的 404 路径。
//
//   现在：courses / subjects / lessons 全部交给 S4 ContentLoader 从
//   /content/courses/{courseId}/... 真实文件加载。
//   本文件只保留 schools / programs / modules 这些"骨架"数据。

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumSeed) {
        console.log('[CurriculumSeed] Already exists, skipping...');
        return;
    }

    var CurriculumSeed = {
        version: '2.1.0',
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
            },
            // 🔥 兼容 S4 content.json 里出现的 school-science / school-art
            {
                id: 'school-science',
                name: 'School of Science',
                shortName: 'Science School',
                description: 'Science, AI, data, and research-driven programs',
                icon: '🔬',
                color: '#8b5cf6',
                status: 'active'
            },
            {
                id: 'school-art',
                name: 'School of Art',
                shortName: 'Art School',
                description: 'Design, creative work, and media production',
                icon: '🎨',
                color: '#ec4899',
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
            },
            // 🔥 S4 兼容：curriculumAuthority 可能会引用这两个 programId
            {
                id: 'program-science',
                schoolId: 'school-science',
                name: 'Science Program',
                description: 'Science-driven programs (S4 fallback)',
                level: 'beginner',
                status: 'active',
                modules: []
            }
        ],

        // ============================================================
        // 3. SEED DATA — Courses
        // ============================================================
        // ⚠️ v2.1.0: 已清空。
        //
        // 之前这里硬编码了:
        //   - course-ai-fundamentals
        //   - course-prompt-engineering
        //   - course-business-strategy
        // 这些 id 在 /content/courses/ 下不存在，导致:
        //   1) CourseRegistry 被假数据污染
        //   2) 渲染 subject 页面时拼出 404 URL
        //
        // 现在 Courses 全部由 S4 通道加载:
        //   - courseRegistry._loadS4Courses() 从
        //     /content/courses/{courseId}/course.json 读取
        //   - fallback 硬编码 ['course-ai'] 已在 courseRegistry 里
        //
        // 如果你确实需要在这里加 course，请确保:
        //   ✅ id 与 /content/courses/{id}/course.json 目录名一致
        //   ✅ 不要与 S4 加载的真实 course 冲突
        courses: [],

        // ============================================================
        // 4. SEED DATA — Subjects
        // ============================================================
        // ⚠️ v2.1.0: 已清空。
        //
        // 之前这里硬编码了:
        //   - subject-what-is-ai     (courseId: course-ai-fundamentals)
        //   - subject-ai-today       (courseId: course-ai-fundamentals)
        //   - subject-prompt-basics  (courseId: course-prompt-engineering)
        //   - subject-strategy-basics(courseId: course-business-strategy)
        // 并且 lessons 里塞的是**对象**而不是字符串 id，
        // 导致 LessonView 拼 URL 时出现 [object%20Object]。
        //
        // 现在 Subjects 全部由 S4 通道加载:
        //   - subjectRegistry.loadAllCourses() → loader.loadCourseSubjects()
        //   - 从 /content/courses/{courseId}/subjects/{subjectId}/subject.json 读取
        //
        // 如果你确实需要在这里加 subject，请遵守:
        //   ✅ id 与磁盘 subject 目录名一致
        //   ✅ courseId 必须指向真实存在的 course
        //   ✅ lessons 数组里**只能放字符串 id**，不能放对象！
        subjects: [],

        // ============================================================
        // 5. SEED DATA — Modules
        // ============================================================
        // 保留：这些是"课程内部的模块"概念，与 S4 course/subject/lesson 是不同层。
        // 目前没有 UI 直接依赖，保留作兼容。
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
        // 6. SEED DATA — Lessons
        // ============================================================
        // ⚠️ v2.1.0: 已清空。
        //
        // 之前这里的 lesson-what-is-ai 属于 day-based 老架构，
        // 与 S4 lesson-ai-fundamentals-001 是两套体系，容易混淆。
        //
        // 现在 Lessons 全部由 S4 通道加载:
        //   - ContentLoader.loadLesson(courseId, subjectId, lessonId)
        //   - 从 /content/courses/{courseId}/subjects/{subjectId}/lessons/{lessonId}.json 读取
        lessons: [],

        // ============================================================
        // 7. PUBLIC API — load
        // ============================================================

        load: function() {
            if (this.loaded) {
                console.log('[CurriculumSeed] Already loaded');
                return this;
            }

            console.log('[CurriculumSeed] 🌱 Loading seed data (v' + this.version + ')...');

            try {
                // ── 1. Schools → SchoolRegistry
                var schoolRegistry = window.LawAIApp?.SchoolRegistry;
                if (schoolRegistry && typeof schoolRegistry.register === 'function') {
                    var schoolOk = 0;
                    this.schools.forEach(function(school) {
                        try {
                            schoolRegistry.register(school);
                            schoolOk++;
                        } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Schools:', schoolOk, '/', this.schools.length);
                } else {
                    console.warn('[CurriculumSeed] SchoolRegistry not available');
                }

                // ── 2. Programs → ProgramRegistry
                var programRegistry = window.LawAIApp?.ProgramRegistry;
                if (programRegistry && typeof programRegistry.register === 'function') {
                    var programOk = 0;
                    this.programs.forEach(function(program) {
                        try {
                            programRegistry.register(program);
                            programOk++;
                        } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Programs:', programOk, '/', this.programs.length);
                } else {
                    console.warn('[CurriculumSeed] ProgramRegistry not available');
                }

                // ── 3. Courses → CourseRegistry
                // v2.1.0: courses 数组为空，这里跳过。
                // Course 由 CourseRegistry._loadS4Courses() 异步加载。
                var courseRegistry = window.LawAIApp?.CourseRegistry;
                if (courseRegistry && typeof courseRegistry.register === 'function') {
                    if (this.courses.length > 0) {
                        var courseOk = 0;
                        this.courses.forEach(function(course) {
                            try {
                                courseRegistry.register(course);
                                courseOk++;
                            } catch (e) {
                                console.warn('[CurriculumSeed] Course register failed:', course.id, e);
                            }
                        });
                        console.log('[CurriculumSeed] ✅ Courses:', courseOk, '/', this.courses.length);
                    } else {
                        console.log('[CurriculumSeed] ⏭️ Courses: skipped (empty — 由 S4 ContentLoader 提供)');
                    }
                } else {
                    console.warn('[CurriculumSeed] CourseRegistry not available');
                }

                // ── 4. Subjects → SubjectRegistry
                // v2.1.0: subjects 数组为空，这里跳过。
                // Subject 由 SubjectRegistry.loadAllCourses() 异步加载。
                var subjectRegistry = window.LawAIApp?.SubjectRegistry;
                if (subjectRegistry && typeof subjectRegistry.register === 'function') {
                    if (this.subjects.length > 0) {
                        var subjectOk = 0;
                        this.subjects.forEach(function(subject) {
                            try {
                                subjectRegistry.register(subject);
                                subjectOk++;
                            } catch (e) {
                                console.warn('[CurriculumSeed] Subject register failed:', subject.id, e);
                            }
                        });
                        console.log('[CurriculumSeed] ✅ Subjects:', subjectOk, '/', this.subjects.length);
                    } else {
                        console.log('[CurriculumSeed] ⏭️ Subjects: skipped (empty — 由 S4 ContentLoader 提供)');
                    }
                } else {
                    console.warn('[CurriculumSeed] SubjectRegistry not available');
                }

                // ── 5. Modules → AcademyRegistry
                var academyRegistry = window.LawAIApp?.AcademyRegistry;
                if (academyRegistry && typeof academyRegistry.registerModule === 'function') {
                    var moduleOk = 0;
                    this.modules.forEach(function(module) {
                        try {
                            academyRegistry.registerModule(module);
                            moduleOk++;
                        } catch (e) {}
                    });
                    console.log('[CurriculumSeed] ✅ Modules:', moduleOk, '/', this.modules.length);
                }

                // ── 6. Lessons → AcademyRegistry
                // v2.1.0: lessons 数组为空，这里跳过。
                if (academyRegistry && typeof academyRegistry.registerLesson === 'function') {
                    if (this.lessons.length > 0) {
                        this.lessons.forEach(function(lesson) {
                            try {
                                academyRegistry.registerLesson(lesson);
                            } catch (e) {}
                        });
                        console.log('[CurriculumSeed] ✅ Lessons:', this.lessons.length);
                    } else {
                        console.log('[CurriculumSeed] ⏭️ Lessons: skipped (empty — 由 S4 ContentLoader 提供)');
                    }
                }

                this.loaded = true;

                this._emit('CURRICULUM_READY', {
                    schools: this.schools.length,
                    programs: this.programs.length,
                    courses: this.courses.length,
                    subjects: this.subjects.length,
                    modules: this.modules.length,
                    lessons: this.lessons.length,
                    source: 'seed-v2.1.0'
                });

                // ── 🔥 通知 CurriculumAuthority 重新 ingest
                var ca = window.LawAIApp?.CurriculumAuthority;
                if (ca && typeof ca._ingestFromRegistries === 'function') {
                    setTimeout(function() {
                        try {
                            ca._ingestFromRegistries();
                            console.log('[CurriculumSeed] 🔄 Re-ingested to CurriculumAuthority');

                            // ── 验证（延迟等 S4 加载）
                            setTimeout(function() {
                                console.log('[CurriculumSeed] === 验证 (after S4 load) ===');
                                console.log('CourseRegistry courses:',
                                    window.LawAIApp?.CourseRegistry?.getAllCourses?.()?.map(function(c) { return c.id; }));
                                console.log('SubjectRegistry subjects:',
                                    window.LawAIApp?.SubjectRegistry?.getAllSubjects?.()?.map(function(s) { return s.id; }));
                                console.log('CA.courses:',
                                    ca.getAllCourses?.()?.length);
                                console.log('CA.subjects(course-ai):',
                                    ca.getSubjectsByCourse?.('course-ai')?.length);
                            }, 1500);

                            // ── 重新渲染
                            if (window.LawAIApp?.AcademyExperienceManager?.render) {
                                try {
                                    window.LawAIApp.AcademyExperienceManager.render();
                                    console.log('[CurriculumSeed] ✅ Re-rendered');
                                } catch (e) {}
                            }
                        } catch (e) {
                            console.warn('[CurriculumSeed] CA ingest failed:', e);
                        }
                    }, 100);
                } else {
                    console.warn('[CurriculumSeed] CurriculumAuthority not available for ingest');
                }

                console.log('[CurriculumSeed] ✅ Seed data loaded (v' + this.version + ')');

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

    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.CurriculumSeed = CurriculumSeed;

    console.log('[CurriculumSeed] Module loaded (v' + CurriculumSeed.version + ')');

    // ============================================================
    // Auto-Load — 等 4 个 Registry 都就绪
    // ============================================================
    function autoLoadSeed() {
        var attempts = 0;
        var maxAttempts = 80;
        var interval = setInterval(function() {
            attempts++;
            var schoolReg = window.LawAIApp?.SchoolRegistry;
            var courseReg = window.LawAIApp?.CourseRegistry;
            var subjectReg = window.LawAIApp?.SubjectRegistry;
            var ca = window.LawAIApp?.CurriculumAuthority;

            // 等 4 个都就绪
            if (schoolReg && courseReg && subjectReg && ca) {
                clearInterval(interval);
                console.log('[CurriculumSeed] ✅ All deps ready, loading...');

                setTimeout(function() {
                    CurriculumSeed.load();
                }, 200);
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[CurriculumSeed] ⏰ Timeout, loading anyway...',
                    { school: !!schoolReg, course: !!courseReg, subject: !!subjectReg, ca: !!ca });
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
