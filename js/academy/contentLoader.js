// contentLoader.js — S4 扩展版
// 保留所有原有功能，新增 S4 加载能力

(function() {
    'use strict';

    // ============================================================
    // 原有 ContentLoader 保留（兼容旧 Academy）
    // ============================================================
    const OriginalContentLoader = LawAIApp.ContentLoader || {};
    
    // ============================================================
    // S4 ContentLoader 扩展
    // ============================================================
    const S4ContentLoader = {
        // ---------- 原有方法（保留，增加兼容） ----------
        fetchPack: OriginalContentLoader.fetchPack || async function(academyId) {
            const base = `content/${academyId}/`;
            try {
                const [manifest, academy, courses, modules] = await Promise.all([
                    fetch(base + 'manifest.json').then(r => r.json()),
                    fetch(base + 'academy.json').then(r => r.json()),
                    fetch(base + 'courses.json').then(r => r.json()),
                    fetch(base + 'modules.json').then(r => r.json())
                ]);
                return { manifest, academy, courses, modules };
            } catch (e) {
                return this.loadFromLocalStorage(academyId);
            }
        },
       
        loadFromLocalStorage: OriginalContentLoader.loadFromLocalStorage || function(academyId) {
            const packData = LawAIApp.StorageEngine?.get(`pack_${academyId}`);
            return packData || null;
        },

        cachePackToStorage: OriginalContentLoader.cachePackToStorage || function(academyId, packData) {
            LawAIApp.StorageEngine?.set(`pack_${academyId}`, packData);
        },

        installDefaultAIPack: OriginalContentLoader.installDefaultAIPack || function() {
            // 原有逻辑保留
            const packData = {
                manifest: {
                    packName: "AI Academy",
                    packId: "academy_ai",
                    version: "1.0",
                    author: "Law Academy",
                    language: "English",
                    academyId: "academy_ai",
                    minimumEngineVersion: "1.0",
                    totalCourses: 3,
                    totalModules: 6,
                    totalLessons: 12,
                    createdDate: "2026-06-01",
                    updatedDate: "2026-06-01",
                    status: "published",
                    description: "Complete AI learning path from beginner to advanced."
                },
                academy: {
                    id: "academy_ai",
                    name: "AI Academy",
                    shortName: "AI",
                    description: "Master Artificial Intelligence from fundamentals to advanced.",
                    icon: "🤖",
                    themeColor: "#3b82f6",
                    difficulty: "Beginner",
                    category: "Technology",
                    status: "active",
                    enabled: true,
                    order: 1,
                    estimatedHours: 48,
                    estimatedLessons: 12
                },
                courses: [
                    {
                        id: "course_ai_foundation",
                        academyId: "academy_ai",
                        categoryId: "cat_ai",
                        name: "AI Foundation",
                        shortName: "AI Foundation",
                        description: "Core principles of artificial intelligence.",
                        icon: "🧠",
                        themeColor: "#3b82f6",
                        difficulty: "Beginner",
                        difficultyScore: 10,
                        status: "active",
                        enabled: true,
                        order: 1,
                        estimatedHours: 8,
                        estimatedLessons: 4,
                        estimatedXP: 600,
                        learningObjectives: ["Understand AI basics"],
                        prerequisites: [],
                        recommendedNext: ["course_prompt_engineering"],
                        tags: ["AI", "Beginner"],
                        author: "Law Academy",
                        version: "1.0",
                        language: "English"
                    },
                    {
                        id: "course_prompt_engineering",
                        academyId: "academy_ai",
                        categoryId: "cat_ai",
                        name: "Prompt Engineering",
                        shortName: "Prompt Eng.",
                        description: "Master the art of crafting effective prompts.",
                        icon: "✍️",
                        themeColor: "#8b5cf6",
                        difficulty: "Intermediate",
                        difficultyScore: 40,
                        status: "active",
                        enabled: true,
                        order: 2,
                        estimatedHours: 5,
                        estimatedLessons: 4,
                        estimatedXP: 500,
                        learningObjectives: ["Write clear prompts"],
                        prerequisites: ["course_ai_foundation"],
                        recommendedNext: [],
                        tags: ["Prompt", "ChatGPT"],
                        author: "Law Academy",
                        version: "1.0",
                        language: "English"
                    }
                ],
                modules: [
                    { id: "module_ai_basics", courseId: "course_ai_foundation", name: "AI Basics", order: 1, estimatedLessons: 2 },
                    { id: "module_ml_intro", courseId: "course_ai_foundation", name: "Intro to ML", order: 2, estimatedLessons: 2 },
                    { id: "module_prompt_basics", courseId: "course_prompt_engineering", name: "Prompt Basics", order: 1, estimatedLessons: 2 },
                    { id: "module_advanced_prompt", courseId: "course_prompt_engineering", name: "Advanced Prompts", order: 2, estimatedLessons: 2 }
                ]
            };
            this.cachePackToStorage('academy_ai', packData);
            const list = LawAIApp.StorageEngine?.get('academy_list');
            if (list) {
                const ai = list.find(a => a.id === 'academy_ai');
                if (ai) ai.status = 'active';
                LawAIApp.StorageEngine?.set('academy_list', list);
            }
        },

        fetchLesson: OriginalContentLoader.fetchLesson || async function(academyId, lessonNumber) {
            const base = `content/${academyId}/lessons/lesson-${String(lessonNumber).padStart(3, '0')}.json`;
            try {
                const resp = await fetch(base);
                return await resp.json();
            } catch (e) {
                return null;
            }
        },

        validatePack: OriginalContentLoader.validatePack || function(packData) {
            const errors = [];
            if (!packData.manifest) errors.push('Missing manifest');
            if (!packData.academy) errors.push('Missing academy');
            if (!packData.courses || !Array.isArray(packData.courses)) errors.push('Missing courses array');
            if (!packData.modules || !Array.isArray(packData.modules)) errors.push('Missing modules array');
            return errors;
        },

         // ═══ Part 18: 加载状态常量 ═══
        LOAD_STATE: {
            IDLE: 'idle',
            LOADING: 'loading',
            LOADED: 'loaded',
            ERROR: 'error',
            MISSING: 'missing'
        },

        // ============================================================
        // ═══ S4 新增方法 ═══
        // ============================================================

        /**
         * S4: 加载 Course Index（获取所有 Course 列表）
         * 路径: content/index.json
         */
        async loadCourseIndex() {
            try {
                const resp = await fetch('/content/index.json');
                if (!resp.ok) throw new Error('Index not found');
                return await resp.json();
            } catch (e) {
                console.warn('[S4ContentLoader] No course index found, using fallback');
                return this._getFallbackIndex();
            }
        },

        /**
         * S4: 加载单个 Course
         * 路径: content/courses/{courseId}/course.json
         */
        async loadCourse(courseId) {
            const cacheKey = `s4_course_${courseId}`;
            
            const cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                const now = Date.now();
                const age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return cached;
                }
            }

            try {
                const resp = await fetch(`/content/courses/${courseId}/course.json`);
                if (!resp.ok) throw new Error(`Course ${courseId} not found`);
                const data = await resp.json();
                
                // ════════════════════════════════════════════════════
                // ═══ 新增：加载后验证 ═══
                // ════════════════════════════════════════════════════
                const validator = window.LawAIApp?.ContentValidator;
                if (validator && typeof validator.validateCourse === 'function') {
                    const result = validator.validateCourse(data);
                    if (!result.valid) {
                        console.warn('[ContentLoader] Course validation failed:', courseId, result.errors);
                        data._validation = { valid: false, errors: result.errors };
                    } else {
                        data._validation = { valid: true };
                    }
                }
                
                data._cachedAt = Date.now();
                LawAIApp.StorageEngine?.set(cacheKey, data);
                return data;
            } catch (e) {
                console.warn('[ContentLoader] Failed to load course:', courseId, e);
                return null;
            }
        },

        /**
         * S4: 加载单个 Lesson（带防重复请求 + 防竞态）
         * 路径: content/courses/{courseId}/subjects/{subjectId}/lessons/{lessonId}.json
         */
        _loadingRequests: {},
        _loadingLessonId: null,
        _loadingPromise: null,

        // ═══ Part 7: 加载状态追踪 ═══
        _loadingStatus: {},

        /**
         * ═══ Part 7: 获取 Lesson 加载状态 ═══
         */
        getLessonLoadStatus: function(lessonId) {
            return this._loadingStatus[lessonId] || {
                lessonId: lessonId,
                status: 'idle', // idle | loading | loaded | error
                lastAttempt: null,
                error: null
            };
        },

        /**
         * ═══ Part 7: 检查 Lesson 是否已加载 ═══
         */
        isLessonLoaded: function(lessonId) {
            var cacheKey = 's4_lesson_' + lessonId;
            var cached = LawAIApp.StorageEngine?.get(cacheKey);
            return !!cached;
        },

        /**
         * ═══ Part 7: 预加载 Lesson（不阻塞 UI） ═══
         */
        preloadLesson: async function(courseId, subjectId, lessonId) {
            var status = this.getLessonLoadStatus(lessonId);
            if (status.status === 'loading' || status.status === 'loaded') {
                return status;
            }

            this._loadingStatus[lessonId] = {
                lessonId: lessonId,
                status: 'loading',
                lastAttempt: Date.now(),
                error: null
            };

            try {
                var data = await this.loadLesson(courseId, subjectId, lessonId);
                this._loadingStatus[lessonId] = {
                    lessonId: lessonId,
                    status: data ? 'loaded' : 'error',
                    lastAttempt: Date.now(),
                    error: data ? null : 'Lesson not found'
                };
                return this._loadingStatus[lessonId];
            } catch (e) {
                this._loadingStatus[lessonId] = {
                    lessonId: lessonId,
                    status: 'error',
                    lastAttempt: Date.now(),
                    error: e.message || 'Unknown error'
                };
                return this._loadingStatus[lessonId];
            }
        },

                /**
         * ═══ Part 7: 批量加载 Lesson Metadata（轻量级） ═══
         */
        async loadLessonsMetadata(lessonIds) {
            if (!lessonIds || lessonIds.length === 0) return [];

            var results = [];
            var lessonIndex = await this.loadLessonIndex();
            if (!lessonIndex || !lessonIndex.lessons) return [];

            for (var i = 0; i < lessonIds.length; i++) {
                var lesson = lessonIndex.lessons.find(function(l) {
                    return l.id === lessonIds[i];
                });
                if (lesson) {
                    results.push({
                        id: lesson.id,
                        title: lesson.title,
                        order: lesson.order,
                        estimatedMinutes: lesson.estimatedMinutes,
                        difficulty: lesson.difficulty,
                        status: lesson.status,
                        hasVideo: lesson.hasVideo || false,
                        hasPractice: lesson.hasPractice || false,
                        hasFlashcards: lesson.hasFlashcards || false,
                        hasNotes: lesson.hasNotes || false,
                        hasAITools: lesson.hasAITools || false
                    });
                }
            }

            return results;
        },

        /**
         * ═══ Part 17: 获取 Course 的所有 Lessons ═══
         */
        getLessonsByCourse: async function(courseId) {
            var lessonIndex = await this.loadLessonIndex();
            if (!lessonIndex || !lessonIndex.lessons) return [];
            return lessonIndex.lessons.filter(function(l) {
                return l.courseId === courseId;
            });
        },

                /**
         * ═══ Part 18: 获取 Lesson 标准化状态 ═══
         */
        getLessonState: function(lessonId) {
            var status = this.getLessonLoadStatus(lessonId);
            if (!status || status.status === 'idle') {
                return { state: this.LOAD_STATE.IDLE, lessonId: lessonId };
            }
            if (status.status === 'loading') {
                return { state: this.LOAD_STATE.LOADING, lessonId: lessonId };
            }
            if (status.status === 'loaded') {
                return { state: this.LOAD_STATE.LOADED, lessonId: lessonId };
            }
            if (status.status === 'error') {
                return { state: this.LOAD_STATE.ERROR, lessonId: lessonId, error: status.error };
            }
            return { state: this.LOAD_STATE.IDLE, lessonId: lessonId };
        },

        /**
         * ═══ Part 21: 获取统一内容状态 ═══
         */
        getContentState: function(contentType, contentId) {
            if (contentType === 'lesson') {
                return this.getLessonState(contentId);
            }
            // 扩展支持 course/subject
            return {
                state: this.LOAD_STATE.IDLE,
                contentType: contentType,
                contentId: contentId
            };
        },

        /**
         * ═══ Part 21: 获取内容错误记录 ═══
         */
        getContentErrors: function(contentId) {
            var cacheKey = 's4_errors_' + contentId;
            return LawAIApp.StorageEngine?.get(cacheKey) || null;
        },

        /**
         * ═══ Part 21: 记录内容错误 ═══
         */
        recordContentError: function(contentId, error) {
            var cacheKey = 's4_errors_' + contentId;
            var errorLog = {
                contentId: contentId,
                error: error,
                timestamp: Date.now()
            };
            LawAIApp.StorageEngine?.set(cacheKey, errorLog);
            console.warn('[ContentLoader] Error recorded for:', contentId, error);
        },

        /**
         * ═══ Part 7: 预加载 Course 的轻量级数据 ═══
         */
        async preloadCourse(courseId) {
            // 1. 加载 Course 元数据
            var course = await this.loadCourse(courseId);
            if (!course) return null;

            // 2. 加载该 Course 的 Subjects（轻量级）
            var subjectIndex = await this.loadSubjectIndex();
            if (subjectIndex && subjectIndex.subjects) {
                course.subjects = subjectIndex.subjects.filter(function(s) {
                    return s.courseId === courseId;
                });
            }

            // 3. 加载该 Course 的 Lessons（轻量级，只存 ID）
            var lessonIndex = await this.loadLessonIndex();
            if (lessonIndex && lessonIndex.lessons) {
                var courseLessons = lessonIndex.lessons.filter(function(l) {
                    return l.courseId === courseId;
                });
                course.lessonIds = courseLessons.map(function(l) { return l.id; });
                course.lessonCount = courseLessons.length;
            }

            return course;
        },

                /**
         * ═══ Part 8: 按需加载 Lesson（如果已缓存则直接返回） ═══
         */
        loadLessonIfNeeded: async function(courseId, subjectId, lessonId) {
            // 1. 检查是否已缓存
            var cacheKey = 's4_lesson_' + lessonId;
            var cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                var now = Date.now();
                var age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return { source: 'cache', data: cached };
                }
            }
            
            // 2. 检查是否正在加载
            var requestKey = courseId + '|' + subjectId + '|' + lessonId;
            if (this._loadingRequests && this._loadingRequests[requestKey]) {
                var data = await this._loadingRequests[requestKey];
                return { source: 'loading', data: data };
            }
            
            // 3. 加载
            var data = await this.loadLesson(courseId, subjectId, lessonId);
            return { source: 'fresh', data: data };
        },

        /**
         * S4: 加载单个 Lesson（带防重复请求 + 防竞态）
         */
        async loadLesson(courseId, subjectId, lessonId) {
            const cacheKey = `s4_lesson_${lessonId}`;
            const requestKey = `${courseId}|${subjectId}|${lessonId}`;
            
            // ═══ 1. 防竞态 ═══
            if (this._loadingRequests && this._loadingRequests[requestKey]) {
                console.log('[ContentLoader] Already loading:', lessonId);
                return this._loadingRequests[requestKey];
            }

            // ═══ 2. 检查缓存 ═══
            const cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                const now = Date.now();
                const age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return cached;
                }
            }

            // ═══ 3. 创建加载 Promise ═══
            const loadPromise = (async () => {
                try {
                    const resp = await fetch(`/content/courses/${courseId}/subjects/${subjectId}/lessons/${lessonId}.json`);
                    if (!resp.ok) throw new Error(`Lesson ${lessonId} not found`);
                    const data = await resp.json();
                    
                    // ════════════════════════════════════════════════════
                    // ═══ 新增：加载后验证 ═══
                    // ════════════════════════════════════════════════════
                    const validator = window.LawAIApp?.ContentValidator;
                    if (validator && typeof validator.validateLesson === 'function') {
                        const result = validator.validateLesson(data);
                        if (!result.valid) {
                            console.warn('[ContentLoader] Lesson validation failed:', lessonId, result.errors);
                            data._validation = { valid: false, errors: result.errors };
                        } else {
                            data._validation = { valid: true };
                        }
                    }
                    
                    data._cachedAt = Date.now();
                    LawAIApp.StorageEngine?.set(cacheKey, data);
                    return data;
                } catch (e) {
                    console.warn('[ContentLoader] Failed to load lesson:', lessonId, e);
                    this.recordContentError(lessonId, e.message || 'Unknown error');
                    return null;
                } finally {
                    if (this._loadingRequests) {
                        delete this._loadingRequests[requestKey];
                    }
                }
            })();

            if (!this._loadingRequests) this._loadingRequests = {};
            this._loadingRequests[requestKey] = loadPromise;
            return loadPromise;
        },

                /**
         * ═══ Part 11: 加载 Lesson 摘要（轻量级，不含完整内容） ═══
         */
        async loadLessonSummary(lessonId) {
            var lessonIndex = await this.loadLessonIndex();
            if (!lessonIndex || !lessonIndex.lessons) return null;
            
            var lesson = lessonIndex.lessons.find(function(l) {
                return l.id === lessonId;
            });
            
            if (!lesson) return null;
            
            // 只返回轻量级摘要
            return {
                id: lesson.id,
                title: lesson.title,
                subjectId: lesson.subjectId,
                courseId: lesson.courseId,
                order: lesson.order,
                estimatedMinutes: lesson.estimatedMinutes,
                difficulty: lesson.difficulty,
                status: lesson.status,
                hasVideo: lesson.hasVideo || false,
                hasPractice: lesson.hasPractice || false,
                hasFlashcards: lesson.hasFlashcards || false,
                hasNotes: lesson.hasNotes || false,
                hasAITools: lesson.hasAITools || false,
                hasNews: lesson.hasNews || false,
                hasResources: lesson.hasResources || false,
                tags: lesson.tags || []
            };
        },

        /**
         * ═══ Part 11: 批量加载 Lesson 摘要 ═══
         */
        async loadLessonsSummary(lessonIds) {
            if (!lessonIds || lessonIds.length === 0) return [];
            
            var results = [];
            for (var i = 0; i < lessonIds.length; i++) {
                var summary = await this.loadLessonSummary(lessonIds[i]);
                if (summary) results.push(summary);
            }
            return results;
        },

        /**
         * ═══ Part 11: 检查 Lesson 是否存在 ═══
         */
        async hasLesson(lessonId) {
            var lessonIndex = await this.loadLessonIndex();
            if (!lessonIndex || !lessonIndex.lessons) return false;
            
            return lessonIndex.lessons.some(function(l) {
                return l.id === lessonId;
            });
        },

        /**
         * ═══ Part 17: 获取 Lesson 元数据（轻量级） ═══
         */
        getLesson: async function(lessonId) {
            return this.loadLessonSummary(lessonId);
        },

        /**
         * ═══ Part 11: 获取 Lesson 文件路径 ═══
         */
        getLessonPath: function(courseId, subjectId, lessonId) {
            return `/content/courses/${courseId}/subjects/${subjectId}/lessons/${lessonId}.json`;
        },

                /**
         * ═══ Part 23: 获取 Lesson 清单（轻量级，不含完整内容） ═══
         */
        async getLessonManifest(lessonId) {
            var lessonIndex = await this.loadLessonIndex();
            if (!lessonIndex || !lessonIndex.lessons) return null;
            
            var lesson = lessonIndex.lessons.find(function(l) {
                return l.id === lessonId;
            });
            
            if (!lesson) return null;
            
            // 只返回清单信息（不含完整内容路径）
            return {
                id: lesson.id,
                title: lesson.title,
                subjectId: lesson.subjectId,
                courseId: lesson.courseId,
                order: lesson.order,
                estimatedMinutes: lesson.estimatedMinutes,
                difficulty: lesson.difficulty,
                status: lesson.status,
                hasVideo: lesson.hasVideo || false,
                hasPractice: lesson.hasPractice || false,
                hasFlashcards: lesson.hasFlashcards || false,
                hasNotes: lesson.hasNotes || false,
                hasAITools: lesson.hasAITools || false,
                hasNews: lesson.hasNews || false,
                hasResources: lesson.hasResources || false,
                tags: lesson.tags || []
            };
        },

        /**
         * ═══ Part 23: 获取 Subject 清单（轻量级，含 Lesson 引用） ═══
         */
        async getSubjectManifest(subjectId) {
            var subjectIndex = await this.loadSubjectIndex();
            if (!subjectIndex || !subjectIndex.subjects) return null;
            
            var subject = subjectIndex.subjects.find(function(s) {
                return s.id === subjectId;
            });
            
            if (!subject) return null;
            
            return {
                id: subject.id,
                title: subject.title,
                courseId: subject.courseId,
                description: subject.description,
                difficulty: subject.difficulty,
                lessonCount: subject.lessonCount || 0,
                estimatedMinutes: subject.estimatedMinutes || 0,
                status: subject.status,
                tags: subject.tags || []
            };
        },

        /**
         * ═══ Part 23: 获取 Course 清单（轻量级，含 Subject 引用） ═══
         */
        async getCourseManifest(courseId) {
            var course = await this.loadCourse(courseId);
            if (!course) return null;
            
            return {
                id: course.id,
                title: course.title,
                schoolId: course.schoolId,
                description: course.description,
                difficulty: course.difficulty,
                estimatedHours: course.estimatedHours || 0,
                subjectCount: course.subjects ? course.subjects.length : 0,
                status: course.status,
                tags: course.tags || []
            };
        },

        /**
         * ═══ Part 24: 验证内容引用完整性 ═══
         * 检查 Course → Subject → Lesson 引用是否有效
         */
        async validateContentReference(contentType, id) {
            var result = {
                valid: true,
                errors: [],
                warnings: []
            };

            if (contentType === 'lesson') {
                var lesson = await this.loadLessonSummary(id);
                if (!lesson) {
                    result.valid = false;
                    result.errors.push('Lesson not found: ' + id);
                    return result;
                }
                // 检查 Subject 是否存在
                var subject = await this.loadSubjectManifest(lesson.subjectId);
                if (!subject) {
                    result.valid = false;
                    result.errors.push('Subject not found for lesson: ' + lesson.subjectId);
                }
                // 检查 Course 是否存在
                var course = await this.loadCourseManifest(lesson.courseId);
                if (!course) {
                    result.valid = false;
                    result.errors.push('Course not found for lesson: ' + lesson.courseId);
                }
            }

            if (contentType === 'subject') {
                var subject = await this.getSubjectManifest(id);
                if (!subject) {
                    result.valid = false;
                    result.errors.push('Subject not found: ' + id);
                    return result;
                }
                var course = await this.loadCourseManifest(subject.courseId);
                if (!course) {
                    result.valid = false;
                    result.errors.push('Course not found for subject: ' + subject.courseId);
                }
            }

            if (contentType === 'course') {
                var course = await this.loadCourseManifest(id);
                if (!course) {
                    result.valid = false;
                    result.errors.push('Course not found: ' + id);
                }
            }

            return result;
        },

        /**
         * S4: 加载单个 Subject
         * 路径: content/courses/{courseId}/subjects/{subjectId}/subject.json
         */
        async loadSubject(courseId, subjectId) {
            const cacheKey = `s4_subject_${subjectId}`;
            
            const cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                const now = Date.now();
                const age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return cached;
                }
            }

            try {
                const resp = await fetch(`/content/courses/${courseId}/subjects/${subjectId}/subject.json`);
                if (!resp.ok) throw new Error(`Subject ${subjectId} not found`);
                const data = await resp.json();
                
                // ════════════════════════════════════════════════════
                // ═══ 新增：加载后验证 ═══
                // ════════════════════════════════════════════════════
                const validator = window.LawAIApp?.ContentValidator;
                if (validator && typeof validator.validateSubject === 'function') {
                    const result = validator.validateSubject(data);
                    if (!result.valid) {
                        console.warn('[ContentLoader] Subject validation failed:', subjectId, result.errors);
                        data._validation = { valid: false, errors: result.errors };
                    } else {
                        data._validation = { valid: true };
                    }
                }
                
                data._cachedAt = Date.now();
                LawAIApp.StorageEngine?.set(cacheKey, data);
                return data;
            } catch (e) {
                console.warn('[ContentLoader] Failed to load subject:', subjectId, e);
                return null;
            }
        },

        /**
         * S4: 批量加载 Course 的所有 Subjects（只加载元数据，不加载 Lessons）
         */
        async loadCourseSubjects(courseId) {
            const course = await this.loadCourse(courseId);
            if (!course || !course.subjects) return [];

            const subjects = [];
            for (const subjectId of course.subjects) {
                const subject = await this.loadSubject(courseId, subjectId);
                if (subject) subjects.push(subject);
            }
            return subjects;
        },

        /**
         * S4: 批量加载 Subject 的所有 Lessons（只加载元数据）
         */
        async loadSubjectLessons(courseId, subjectId) {
            const subject = await this.loadSubject(courseId, subjectId);
            if (!subject || !subject.lessons) return [];

            const lessons = [];
            for (const lessonId of subject.lessons) {
                const lesson = await this.loadLesson(courseId, subjectId, lessonId);
                if (lesson) lessons.push(lesson);
            }
            return lessons;
        },

        /**
         * S4: 获取学校列表
         */
        async loadSchools() {
            const index = await this.loadCourseIndex();
            return index?.schools || {};
        },

        /**
         * S4: 获取某学校的所有 Course 列表
         */
        async loadCoursesBySchool(schoolId) {
            const index = await this.loadCourseIndex();
            const school = index?.schools?.[schoolId];
            if (!school) return [];
            
            const courses = [];
            for (const courseId of school.courses || []) {
                const course = await this.loadCourse(courseId);
                if (course) courses.push(course);
            }
            return courses;
        },

        // ════════════════════════════════════════════════════════════
        // ═══ Part 13: 支持 School 加载（加在这里） ═══
        // ════════════════════════════════════════════════════════════

        /**
         * ═══ Part 13: 加载 School ═══
         * 路径: content/schools/{schoolId}/school.json
         */
        async loadSchool(schoolId) {
            const cacheKey = `s4_school_${schoolId}`;
            
            const cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                const now = Date.now();
                const age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return cached;
                }
            }

            try {
                const resp = await fetch(`/content/schools/${schoolId}/school.json`);
                if (!resp.ok) throw new Error(`School ${schoolId} not found`);
                const data = await resp.json();
                data._cachedAt = Date.now();
                LawAIApp.StorageEngine?.set(cacheKey, data);
                return data;
            } catch (e) {
                console.warn('[ContentLoader] Failed to load school:', schoolId, e);
                return null;
            }
        },

        /**
         * ═══ Part 13: 加载所有 Schools ═══
         */
        async loadAllSchools() {
            var schoolIds = ['school-science', 'school-business', 'school-art'];
            var schools = [];
            for (var i = 0; i < schoolIds.length; i++) {
                var school = await this.loadSchool(schoolIds[i]);
                if (school) schools.push(school);
            }
            return schools;
        },

        /**
         * Fallback Index（当 content/index.json 不存在时）
         */
        _getFallbackIndex() {
            return {
                version: '1.0.0',
                schools: {
                    science: {
                        id: 'science',
                        title: 'Science',
                        description: 'AI, Programming, Data Science, Technology',
                        courses: ['course-ai']
                    },
                    business: {
                        id: 'business',
                        title: 'Business',
                        description: 'Business, Marketing, Finance',
                        courses: []
                    },
                    art: {
                        id: 'art',
                        title: 'Art',
                        description: 'Design, Creative, Media',
                        courses: []
                    }
                }
            };
        },

                /**
         * 清空 S4 缓存
         */
        clearCache() {
            if (!LawAIApp.StorageEngine) return;
            const keys = LawAIApp.StorageEngine.getAllKeys?.() || [];
            for (const key of keys) {
                if (key.startsWith('s4_')) {
                    LawAIApp.StorageEngine.remove(key);
                }
            }
            console.log('[S4ContentLoader] Cache cleared');
        },

        /**
         * ═══ Part 8: 获取缓存统计 ═══
         */
        getCacheStats() {
            if (!LawAIApp.StorageEngine) {
                return { available: false, message: 'StorageEngine not available' };
            }
            
            var keys = LawAIApp.StorageEngine.getAllKeys?.() || [];
            var s4Keys = keys.filter(function(k) { return k.startsWith('s4_'); });
            
            var stats = {
                available: true,
                totalKeys: keys.length,
                s4Keys: s4Keys.length,
                byType: {
                    course: 0,
                    subject: 0,
                    lesson: 0,
                    catalog: 0,
                    index: 0,
                    other: 0
                }
            };
            
            for (var i = 0; i < s4Keys.length; i++) {
                var key = s4Keys[i];
                if (key.startsWith('s4_course_')) stats.byType.course++;
                else if (key.startsWith('s4_subject_')) stats.byType.subject++;
                else if (key.startsWith('s4_lesson_')) stats.byType.lesson++;
                else if (key.startsWith('s4_catalog_')) stats.byType.catalog++;
                else if (key.includes('index')) stats.byType.index++;
                else stats.byType.other++;
            }
            
            return stats;
        },

        /**
         * ═══ Part 8: 清除单个 Lesson 缓存 ═══
         */
        clearLessonCache(lessonId) {
            if (!LawAIApp.StorageEngine) return false;
            var key = 's4_lesson_' + lessonId;
            var existed = LawAIApp.StorageEngine.get(key) !== null;
            LawAIApp.StorageEngine.remove(key);
            return existed;
        },

        /**
         * ═══ Part 8: 清除 Course 相关缓存 ═══
         */
        clearCourseCache(courseId) {
            if (!LawAIApp.StorageEngine) return false;
            var count = 0;
            var keys = LawAIApp.StorageEngine.getAllKeys?.() || [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key.startsWith('s4_course_' + courseId) || 
                    key.startsWith('s4_subject_') && LawAIApp.StorageEngine.get(key)?.courseId === courseId) {
                    LawAIApp.StorageEngine.remove(key);
                    count++;
                }
            }
            return count;
        },

                /**
         * ═══ Part 10: 主动清理旧缓存（防止内存无限增长） ═══
         * @param {number} maxEntries - 最大缓存条目数，默认 50
         * @param {number} maxAgeMs - 最大缓存年龄（毫秒），默认 10 分钟
         * @returns {Object} 清理统计
         */
        evictOldCache: function(maxEntries, maxAgeMs) {
            maxEntries = maxEntries || 50;
            maxAgeMs = maxAgeMs || 600000; // 10 分钟
            
            if (!LawAIApp.StorageEngine) {
                return { available: false, message: 'StorageEngine not available' };
            }
            
            var allKeys = LawAIApp.StorageEngine.getAllKeys?.() || [];
            var s4Keys = allKeys.filter(function(k) { return k.startsWith('s4_'); });
            
            if (s4Keys.length <= maxEntries) {
                return { 
                    evicted: 0, 
                    remaining: s4Keys.length,
                    message: 'Cache under limit, no eviction needed'
                };
            }
            
            // 按最后访问时间排序（如果有的话）
            var cacheEntries = [];
            for (var i = 0; i < s4Keys.length; i++) {
                var key = s4Keys[i];
                var data = LawAIApp.StorageEngine.get(key);
                if (data) {
                    cacheEntries.push({
                        key: key,
                        cachedAt: data._cachedAt || 0,
                        // 尝试从 key 判断类型
                        type: key.startsWith('s4_lesson_') ? 'lesson' :
                               key.startsWith('s4_subject_') ? 'subject' :
                               key.startsWith('s4_course_') ? 'course' : 'other'
                    });
                }
            }
            
            // 按缓存时间排序（旧的在前）
            cacheEntries.sort(function(a, b) {
                return (a.cachedAt || 0) - (b.cachedAt || 0);
            });
            
            // 计算需要删除的数量
            var toEvictCount = cacheEntries.length - maxEntries;
            
            // 同时检查过期的缓存
            var now = Date.now();
            var expiredCount = 0;
            var toEvict = [];
            
            for (var j = 0; j < cacheEntries.length; j++) {
                var entry = cacheEntries[j];
                var age = now - (entry.cachedAt || 0);
                if (age > maxAgeMs) {
                    // 过期了，标记删除
                    toEvict.push(entry);
                    expiredCount++;
                } else if (toEvict.length < toEvictCount) {
                    // 还没过期但需要腾出空间
                    toEvict.push(entry);
                }
            }
            
            // 执行删除
            var evictedCount = 0;
            for (var k = 0; k < toEvict.length; k++) {
                LawAIApp.StorageEngine.remove(toEvict[k].key);
                evictedCount++;
            }
            
            console.log('[ContentLoader] Cache eviction complete:', {
                evicted: evictedCount,
                expired: expiredCount,
                remaining: cacheEntries.length - evictedCount
            });
            
            return {
                evicted: evictedCount,
                expired: expiredCount,
                remaining: cacheEntries.length - evictedCount,
                maxEntries: maxEntries,
                maxAgeMs: maxAgeMs
            };
        },

        /**
         * ═══ Part 10: 获取缓存大小统计 ═══
         */
        getCacheSize: function() {
            if (!LawAIApp.StorageEngine) {
                return { available: false };
            }
            
            var allKeys = LawAIApp.StorageEngine.getAllKeys?.() || [];
            var s4Keys = allKeys.filter(function(k) { return k.startsWith('s4_'); });
            
            var lessonCount = 0;
            var subjectCount = 0;
            var courseCount = 0;
            var otherCount = 0;
            var totalSize = 0;
            
            for (var i = 0; i < s4Keys.length; i++) {
                var key = s4Keys[i];
                var data = LawAIApp.StorageEngine.get(key);
                if (data) {
                    var size = JSON.stringify(data).length;
                    totalSize += size;
                    
                    if (key.startsWith('s4_lesson_')) lessonCount++;
                    else if (key.startsWith('s4_subject_')) subjectCount++;
                    else if (key.startsWith('s4_course_')) courseCount++;
                    else otherCount++;
                }
            }
            
            return {
                totalEntries: s4Keys.length,
                lessons: lessonCount,
                subjects: subjectCount,
                courses: courseCount,
                other: otherCount,
                totalSizeBytes: totalSize,
                totalSizeKB: Math.round(totalSize / 1024)
            };
        },
    };

    // ============================================================
    // 合并：保留原有，扩展新方法
    // ============================================================
    const MergedLoader = {
        ...OriginalContentLoader,
        ...S4ContentLoader,
        // 如果原有方法被覆盖，保留原引用
        _original: OriginalContentLoader
    };

    // ============================================================
    // 挂载到 LawAIApp
    // ============================================================
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.ContentLoader = MergedLoader;
    window.LawAIApp.S4ContentLoader = S4ContentLoader; // 单独暴露 S4 方法

    console.log('[S4ContentLoader] ✅ Extended with S4 methods');

})();
