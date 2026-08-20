// contentRegistry.js — S4 扩展版
(function() {
    'use strict';

    // ============================================================
    // 原有 ContentRegistry 保留
    // ============================================================
    const OriginalRegistry = window.LawAIApp?.ContentRegistry || {};

    // ============================================================
    // S4 ContentRegistry 扩展
    // ============================================================
    const S4ContentRegistry = {
        // ---------- 原有方法（保留） ----------
        _getStore: OriginalRegistry._getStore || function() {
            return LawAIApp.StorageEngine?.get('content_registry', {}) || {};
        },
        _save: OriginalRegistry._save || function(store) {
            LawAIApp.StorageEngine?.set('content_registry', store);
        },
        register: OriginalRegistry.register || function(contentObject) {
            const store = this._getStore();
            const id = contentObject.contentId;
            if (!id) return null;
            store[id] = {
                ...contentObject,
                registeredAt: store[id]?.registeredAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this._save(store);
            LawAIApp.EventBus?.emit('ContentCreated', { contentId: id });
            return store[id];
        },
        get: OriginalRegistry.get || function(contentId) {
            return this._getStore()[contentId] || null;
        },
        filter: OriginalRegistry.filter || function({ type, academyId, courseId, status } = {}) {
            const store = this._getStore();
            return Object.values(store).filter(item => {
                if (type && item.type !== type) return false;
                if (academyId && item.academyId !== academyId) return false;
                if (courseId && item.courseId !== courseId) return false;
                if (status && item.status !== status) return false;
                return true;
            });
        },
        archive: OriginalRegistry.archive || function(contentId) {
            const store = this._getStore();
            if (store[contentId]) {
                store[contentId].status = 'archived';
                store[contentId].archivedAt = new Date().toISOString();
                this._save(store);
                LawAIApp.EventBus?.emit('ContentArchived', { contentId });
            }
        },

        // ============================================================
        // ═══ S4 新增方法 ═══
        // ============================================================

        /**
         * S4: 注册 Course（自动从 course.json 提取信息）
         */
        registerCourse(courseData) {
            if (!courseData.id) {
                console.warn('[S4ContentRegistry] Course id required');
                return null;
            }

            const entry = {
                contentId: `s4_course_${courseData.id}`,
                type: 'course',
                courseId: courseData.id,
                school: courseData.school,
                title: courseData.title,
                description: courseData.description,
                version: courseData.version,
                status: courseData.status || 'published',
                subjectCount: courseData.subjects?.length || 0,
                metadata: {
                    targetLearningTime: courseData.targetLearningTime,
                    recommendedAI: courseData.recommendedAI
                },
                registeredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            return this.register(entry);
        },

        /**
         * S4: 注册 Subject
         */
        registerSubject(subjectData) {
            if (!subjectData.id) {
                console.warn('[S4ContentRegistry] Subject id required');
                return null;
            }

            const entry = {
                contentId: `s4_subject_${subjectData.id}`,
                type: 'subject',
                subjectId: subjectData.id,
                courseId: subjectData.courseId,
                title: subjectData.title,
                description: subjectData.description,
                version: subjectData.version,
                status: subjectData.status || 'published',
                lessonCount: subjectData.lessons?.length || 0,
                registeredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            return this.register(entry);
        },

        /**
         * S4: 注册 Lesson
         */
        registerLesson(lessonData) {
            if (!lessonData.id) {
                console.warn('[S4ContentRegistry] Lesson id required');
                return null;
            }

            const entry = {
                contentId: `s4_lesson_${lessonData.id}`,
                type: 'lesson',
                lessonId: lessonData.id,
                subjectId: lessonData.subjectId,
                title: lessonData.title,
                difficulty: lessonData.difficulty,
                estimatedDuration: lessonData.estimatedDuration,
                version: lessonData.version,
                status: lessonData.status || 'published',
                hasVideo: !!lessonData.video?.url,
                hasPractice: (lessonData.practice?.length || 0) > 0,
                hasQuiz: (lessonData.quiz?.length || 0) > 0,
                registeredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            return this.register(entry);
        },

        /**
         * S4: 获取所有 Course 条目
         */
        getCourses() {
            return this.filter({ type: 'course' });
        },

        /**
         * S4: 获取某 School 的所有 Course
         */
        getCoursesBySchool(schoolId) {
            return this.filter({ type: 'course' }).filter(c => c.school === schoolId);
        },

        /**
         * S4: 获取某 Course 的所有 Subject
         */
        getSubjectsByCourse(courseId) {
            return this.filter({ type: 'subject' }).filter(s => s.courseId === courseId);
        },

        /**
         * S4: 获取某 Subject 的所有 Lesson
         */
        getLessonsBySubject(subjectId) {
            return this.filter({ type: 'lesson' }).filter(l => l.subjectId === subjectId);
        },

        /**
         * S4: 按难度筛选 Lesson
         */
        getLessonsByDifficulty(difficulty) {
            return this.filter({ type: 'lesson' }).filter(l => l.difficulty === difficulty);
        },

        /**
         * S4: 获取统计
         */
        getS4Stats() {
            const courses = this.getCourses();
            const subjects = this.filter({ type: 'subject' });
            const lessons = this.filter({ type: 'lesson' });
            
            return {
                totalCourses: courses.length,
                totalSubjects: subjects.length,
                totalLessons: lessons.length,
                bySchool: {
                    science: courses.filter(c => c.school === 'science').length,
                    business: courses.filter(c => c.school === 'business').length,
                    art: courses.filter(c => c.school === 'art').length
                },
                byDifficulty: {
                    beginner: lessons.filter(l => l.difficulty === 'beginner').length,
                    intermediate: lessons.filter(l => l.difficulty === 'intermediate').length,
                    advanced: lessons.filter(l => l.difficulty === 'advanced').length,
                    expert: lessons.filter(l => l.difficulty === 'expert').length
                }
            };
        },

        /**
         * S4: 从 ContentLoader 同步所有内容到 Registry
         * 这是“一键同步”方法
         */
        async syncFromLoader() {
            const loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[S4ContentRegistry] ContentLoader not found');
                return false;
            }

            try {
                // 1. 加载 Index
                const index = await loader.loadCourseIndex();
                if (!index) {
                    console.warn('[S4ContentRegistry] No index found');
                    return false;
                }

                // 2. 遍历所有 School
                for (const [schoolId, school] of Object.entries(index.schools || {})) {
                    for (const courseId of school.courses || []) {
                        // 3. 加载 Course
                        const course = await loader.loadCourse(courseId);
                        if (course) {
                            this.registerCourse(course);
                            
                            // 4. 加载 Subjects
                            for (const subjectId of course.subjects || []) {
                                const subject = await loader.loadSubject(courseId, subjectId);
                                if (subject) {
                                    this.registerSubject(subject);
                                    
                                    // 5. 加载 Lessons
                                    for (const lessonId of subject.lessons || []) {
                                        const lesson = await loader.loadLesson(courseId, subjectId, lessonId);
                                        if (lesson) {
                                            this.registerLesson(lesson);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                console.log('[S4ContentRegistry] ✅ Sync complete');
                return true;
            } catch (e) {
                console.error('[S4ContentRegistry] Sync failed:', e);
                return false;
            }
        }
    };

    // ============================================================
    // 合并
    // ============================================================
    const MergedRegistry = {
        ...OriginalRegistry,
        ...S4ContentRegistry,
        _original: OriginalRegistry
    };

    // ============================================================
    // 挂载
    // ============================================================
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.ContentRegistry = MergedRegistry;
    window.LawAIApp.S4ContentRegistry = S4ContentRegistry;

    console.log('[S4ContentRegistry] ✅ Extended with S4 methods');

})();
