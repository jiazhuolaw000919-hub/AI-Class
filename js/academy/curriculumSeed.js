// js/academy/curriculumSeed.js
// Part 57.5 — Curriculum Seed (Initial Data)
// v2.2.0 — 只保留 school-science / school-business / school-art
//
// ⚠️ 变更历史:
//   v2.1.0: 移除假 courses/subjects/lessons，改由 S4 ContentLoader 提供
//   v2.2.0: 移除 school-ai / school-technology，只保留 3 个真实 school
//            (school-science / school-business / school-art)
//            与你磁盘上 /content/courses/course-ai/course.json 的
//            schoolId: "school-science" 保持一致。

(function() {
    'use strict';

    if (window.LawAIApp?.CurriculumSeed) {
        console.log('[CurriculumSeed] Already exists, skipping...');
        return;
    }

    var CurriculumSeed = {
        version: '2.2.0',
        loaded: false,

        // ============================================================
        // 1. SEED DATA — Schools
        // ============================================================
        // ⚠️ v2.2.0: 只保留 3 个真实 school
        //   之前有 school-ai / school-technology，与真实 course 的
        //   schoolId 不匹配，导致 UI 上出现 5 个 school 但只有 1 个能进 course。
        schools: [
            {
                id: 'school-science',
                name: 'Science',
                displayName: 'Science',
                shortName: 'Science',
                description: 'AI, Programming, Data Science, Mathematics, Technology, and Engineering.',
                icon: '🔬',
                color: '#8b5cf6',
                status: 'active'
            },
            {
                id: 'school-business',
                name: 'Business',
                displayName: 'Business',
                shortName: 'Business',
                description: 'Business, Finance, Marketing, Entrepreneurship, Management, and Career.',
                icon: '📊',
                color: '#10b981',
                status: 'active'
            },
            {
                id: 'school-art',
                name: 'Art',
                displayName: 'Art',
                shortName: 'Art',
                description: 'Design, UI/UX, Photography, Video, Creative Writing, and Digital Art.',
                icon: '🎨',
                color: '#ec4899',
                status: 'active'
            }
        ],

        // ============================================================
        // 2. SEED DATA — Programs
        // ============================================================
        // ⚠️ v2.2.0: schoolId 全部改成真实存在的 3 个 school
        programs: [
            {
                id: 'program-ai-foundations',
                schoolId: 'school-science',          // ← 改：原 school-ai
                name: 'AI Foundations',
                description: 'Essential AI concepts and applications',
                level: 'beginner',
                status: 'active',
                modules: []
            },
            {
                id: 'program-ai-prompting',
                schoolId: 'school-science',          // ← 改：原 school-ai
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
                id: 'program-science',
                schoolId: 'school-science',
                name: 'Science Program',
                description: 'Science-driven programs (S4 fallback)',
                level: 'beginner',
                status: 'active',
                modules: []
            }
            // ⚠️ v2.2.0: 移除 program-tech-development（原属 school-technology）
        ],

        // ============================================================
        // 3. SEED DATA — Courses
        // ============================================================
        // ⚠️ v2.1.0: 已清空。
        // Course 全部由 S4 ContentLoader 从
        // /content/courses/{courseId}/course.json 真实加载。
        courses: [],

        // ============================================================
        // 4. SEED DATA — Subjects
        // ============================================================
        // ⚠️ v2.1.0: 已清空。
        // Subject 全部由 S4 ContentLoader 从
        // /content/courses/{courseId}/subjects/{subjectId}/subject.json 读取。
        subjects: [],

        // ============================================================
        // 5. SEED DATA — Modules
        // ============================================================
        // 保留：课程内部的"模块"概念，与 S4 course/subject/lesson 是不同层。
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
        // Lesson 全部由 S4 ContentLoader 从
        // /content/courses/{courseId}/subjects/{subjectId}/lessons/{lessonId}.json 读取。
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
                    source: 'seed-v2.2.0'
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
                                console.log('SchoolRegistry schools:',
                                    window.LawAIApp?.SchoolRegistry?.getAllSchools?.()?.map(function(s) { return s.id; }));
                                console.log('CourseRegistry courses:',
                                    window.LawAIApp?.CourseRegistry?.getAllCourses?.()?.map(function(c) { return c.id; }));
                                console.log('SubjectRegistry subjects:',
                                    window.LawAIApp?.SubjectRegistry?.getAllSubjects?.()?.map(function(s) { return s.id; }));
                                console.log('CA.courses:',
                                    ca.getAllCourses?.()?.map(function(c) { return c.id; }));
                                console.log('CA.subjects(course-ai):',
                                    ca.getSubjectsByCourse?.('course-ai')?.map(function(s) { return s.id; }));
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
