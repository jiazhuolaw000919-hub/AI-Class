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
        registerCourse: function(courseData) {
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
        registerSubject: function(subjectData) {
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
        registerLesson: function(lessonData) {
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
        getCourses: function() {
            return this.filter({ type: 'course' });
        },

        /**
         * S4: 获取某 School 的所有 Course
         */
        getCoursesBySchool: function(schoolId) {
            return this.filter({ type: 'course' }).filter(c => c.school === schoolId);
        },

        /**
         * S4: 获取某 Course 的所有 Subject
         */
        getSubjectsByCourse: function(courseId) {
            return this.filter({ type: 'subject' }).filter(s => s.courseId === courseId);
        },

        /**
         * S4: 获取某 Subject 的所有 Lesson
         */
        getLessonsBySubject: function(subjectId) {
            return this.filter({ type: 'lesson' }).filter(l => l.subjectId === subjectId);
        },

        /**
         * S4: 按难度筛选 Lesson
         */
        getLessonsByDifficulty: function(difficulty) {
            return this.filter({ type: 'lesson' }).filter(l => l.difficulty === difficulty);
        },

        /**
         * S4: 获取统计
         */
        getS4Stats: function() {
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
        },

        // ============================================================
        // ═══ Part 6: Catalog/Index 同步方法 ═══
        // ============================================================

        /**
         * ═══ Part 6: 从 Catalog 同步 Course 到 Registry ═══
         */
        async syncCoursesFromCatalog() {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[S4ContentRegistry] ContentLoader not available');
                return false;
            }

            try {
                var catalog = await loader.loadCourseCatalog();
                if (!catalog || !catalog.courses) {
                    console.warn('[S4ContentRegistry] No courses in catalog');
                    return false;
                }

                var count = 0;
                for (var i = 0; i < catalog.courses.length; i++) {
                    var course = catalog.courses[i];
                    var entry = {
                        contentId: 's4_course_' + course.id,
                        type: 'course',
                        courseId: course.id,
                        school: course.schoolId,
                        title: course.title,
                        description: course.description,
                        version: course.version || '1.0.0',
                        status: course.status || 'published',
                        subjectCount: course.subjectCount || 0,
                        lessonCount: course.lessonCount || 0,
                        metadata: {
                            estimatedHours: course.estimatedHours,
                            tags: course.tags,
                            icon: course.icon
                        }
                    };
                    this.register(entry);
                    count++;
                }

                console.log('[S4ContentRegistry] ✅ Synced ' + count + ' courses from catalog');
                return true;
            } catch (e) {
                console.error('[S4ContentRegistry] Sync failed:', e);
                return false;
            }
        },

        /**
         * ═══ Part 6: 从 Subject Index 同步 Subject 到 Registry ═══
         */
        async syncSubjectsFromIndex() {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[S4ContentRegistry] ContentLoader not available');
                return false;
            }

            try {
                var index = await loader.loadSubjectIndex();
                if (!index || !index.subjects) {
                    console.warn('[S4ContentRegistry] No subjects in index');
                    return false;
                }

                var count = 0;
                for (var i = 0; i < index.subjects.length; i++) {
                    var subject = index.subjects[i];
                    var entry = {
                        contentId: 's4_subject_' + subject.id,
                        type: 'subject',
                        subjectId: subject.id,
                        courseId: subject.courseId,
                        title: subject.title,
                        description: subject.description,
                        version: subject.version || '1.0.0',
                        status: subject.status || 'published',
                        lessonCount: subject.lessonCount || 0,
                        metadata: {
                            order: subject.order,
                            difficulty: subject.difficulty,
                            tags: subject.tags,
                            estimatedMinutes: subject.estimatedMinutes
                        }
                    };
                    this.register(entry);
                    count++;
                }

                console.log('[S4ContentRegistry] ✅ Synced ' + count + ' subjects from index');
                return true;
            } catch (e) {
                console.error('[S4ContentRegistry] Sync failed:', e);
                return false;
            }
        },

        /**
         * ═══ Part 6: 从 Lesson Index 同步 Lesson 到 Registry ═══
         */
        async syncLessonsFromIndex() {
            var loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[S4ContentRegistry] ContentLoader not available');
                return false;
            }

            try {
                var index = await loader.loadLessonIndex();
                if (!index || !index.lessons) {
                    console.warn('[S4ContentRegistry] No lessons in index');
                    return false;
                }

                var count = 0;
                for (var i = 0; i < index.lessons.length; i++) {
                    var lesson = index.lessons[i];
                    var entry = {
                        contentId: 's4_lesson_' + lesson.id,
                        type: 'lesson',
                        lessonId: lesson.id,
                        subjectId: lesson.subjectId,
                        title: lesson.title,
                        difficulty: lesson.difficulty || 'mixed',
                        estimatedDuration: lesson.estimatedMinutes || 15,
                        version: lesson.version || '1.0.0',
                        status: lesson.status || 'published',
                        hasVideo: lesson.hasVideo || false,
                        hasPractice: lesson.hasPractice || false,
                        hasFlashcards: lesson.hasFlashcards || false,
                        hasNotes: lesson.hasNotes || false,
                        hasAITools: lesson.hasAITools || false,
                        hasNews: lesson.hasNews || false,
                        hasResources: lesson.hasResources || false,
                        metadata: {
                            order: lesson.order,
                            tags: lesson.tags,
                            contentRef: lesson.contentRef,
                            courseId: lesson.courseId
                        }
                    };
                    this.register(entry);
                    count++;
                }

                console.log('[S4ContentRegistry] ✅ Synced ' + count + ' lessons from index');
                return true;
            } catch (e) {
                console.error('[S4ContentRegistry] Sync failed:', e);
                return false;
            }
        },

        /**
         * ═══ Part 6: 完整同步所有 Catalog/Index 到 Registry ═══
         */
        async syncAllFromCatalog() {
            console.log('[S4ContentRegistry] 🔄 Syncing all from catalog/index...');
            var results = {
                courses: await this.syncCoursesFromCatalog(),
                subjects: await this.syncSubjectsFromIndex(),
                lessons: await this.syncLessonsFromIndex()
            };
            console.log('[S4ContentRegistry] ✅ Sync complete:', results);
            return results;
        }
    };  // ⬅️ 这里闭合 S4ContentRegistry

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
