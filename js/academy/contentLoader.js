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

        // ============================================================
        // ═══ S4 新增方法 ═══
        // ============================================================

        /**
         * S4: 加载 Course Index（获取所有 Course 列表）
         * 路径: content/index.json
         */
        async loadCourseIndex() {
            try {
                const resp = await fetch('content/index.json');
                if (!resp.ok) throw new Error('Index not found');
                return await resp.json();
            } catch (e) {
                console.warn('[S4ContentLoader] No course index found, using fallback');
                return this._getFallbackIndex();
            }
        },

        /**
         * S4: 加载单个 Lesson（带防重复请求 + 防竞态）
         * 路径: content/courses/{courseId}/subjects/{subjectId}/lessons/{lessonId}.json
         */
        _loadingRequests: {},

        async loadLesson(courseId, subjectId, lessonId) {
            const cacheKey = `s4_lesson_${lessonId}`;
            
            // ═══ 1. 检查是否正在加载（防重复请求） ═══
            const requestKey = `${courseId}|${subjectId}|${lessonId}`;
            if (this._loadingRequests[requestKey]) {
                console.log('[S4ContentLoader] Already loading:', lessonId);
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

            // ═══ 3. 创建加载 Promise（防竞态） ═══
            const loadPromise = (async () => {
                try {
                    const resp = await fetch(`content/courses/${courseId}/subjects/${subjectId}/lessons/${lessonId}.json`);
                    if (!resp.ok) throw new Error(`Lesson ${lessonId} not found`);
                    const data = await resp.json();
                    data._cachedAt = Date.now();
                    LawAIApp.StorageEngine?.set(cacheKey, data);
                    return data;
                } catch (e) {
                    console.warn('[S4ContentLoader] Failed to load lesson:', lessonId, e);
                    return null;
                } finally {
                    // ═══ 加载完成后清除请求标记 ═══
                    delete this._loadingRequests[requestKey];
                }
            })();

            this._loadingRequests[requestKey] = loadPromise;
            return loadPromise;
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
                const resp = await fetch(`content/courses/${courseId}/subjects/${subjectId}/subject.json`);
                if (!resp.ok) throw new Error(`Subject ${subjectId} not found`);
                const data = await resp.json();
                data._cachedAt = Date.now();
                LawAIApp.StorageEngine?.set(cacheKey, data);
                return data;
            } catch (e) {
                console.warn('[S4ContentLoader] Failed to load subject:', subjectId, e);
                return null;
            }
        },

        /**
         * S4: 加载单个 Lesson
         * 路径: content/courses/{courseId}/subjects/{subjectId}/lessons/{lessonId}.json
         */
        async loadLesson(courseId, subjectId, lessonId) {
            const cacheKey = `s4_lesson_${lessonId}`;
            
            const cached = LawAIApp.StorageEngine?.get(cacheKey);
            if (cached) {
                const now = Date.now();
                const age = now - (cached._cachedAt || 0);
                if (age < 300000) {
                    return cached;
                }
            }

            try {
                const resp = await fetch(`content/courses/${courseId}/subjects/${subjectId}/lessons/${lessonId}.json`);
                if (!resp.ok) throw new Error(`Lesson ${lessonId} not found`);
                const data = await resp.json();
                data._cachedAt = Date.now();
                LawAIApp.StorageEngine?.set(cacheKey, data);
                return data;
            } catch (e) {
                console.warn('[S4ContentLoader] Failed to load lesson:', lessonId, e);
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
        }
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
