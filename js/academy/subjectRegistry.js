// js/academy/subjectRegistry.js
// S4 Subject Registry — 管理 Subject 的注册、查询和发现
// Law AI Academy Season 4

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.SubjectRegistry) {
        console.log('[SubjectRegistry] Already exists, skipping...');
        return;
    }

    class SubjectRegistry {
        constructor() {
            this._subjects = new Map();
            this._subjectsByCourse = new Map();
            this.initialized = false;
            this.version = '1.0.0';
        }

        /**
         * 初始化 Subject Registry
         */
        initialize() {
            if (this.initialized) {
                console.log('[SubjectRegistry] Already initialized');
                return this;
            }

            console.log('[SubjectRegistry] 📖 Initializing...');
            this.initialized = true;
            return this;
        }

        /**
         * 注册 Subject
         */
        register(subjectData) {
            if (!subjectData.id) {
                console.warn('[SubjectRegistry] Subject: id is required');
                return null;
            }

            if (!subjectData.title) {
                console.warn('[SubjectRegistry] Subject: title is required');
                return null;
            }

            if (!subjectData.courseId) {
                console.warn('[SubjectRegistry] Subject: courseId is required');
                return null;
            }

            // 如果已存在，检查版本
            if (this._subjects.has(subjectData.id)) {
                const existing = this._subjects.get(subjectData.id);
                if (existing.version !== subjectData.version) {
                    console.log('[SubjectRegistry] Updating subject:', subjectData.id, 'v' + existing.version + ' → v' + subjectData.version);
                } else {
                    console.warn('[SubjectRegistry] Subject already exists:', subjectData.id);
                    return subjectData.id;
                }
            }

            const subject = {
                ...subjectData,
                status: subjectData.status || 'published',
                registeredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this._subjects.set(subjectData.id, subject);

            // 按 Course 索引
            if (!this._subjectsByCourse.has(subjectData.courseId)) {
                this._subjectsByCourse.set(subjectData.courseId, []);
            }
            const courseSubjects = this._subjectsByCourse.get(subjectData.courseId);
            if (!courseSubjects.includes(subjectData.id)) {
                courseSubjects.push(subjectData.id);
            }

            this._emit('SUBJECT_REGISTERED', {
                subjectId: subject.id,
                title: subject.title,
                courseId: subject.courseId
            });

            console.log('[SubjectRegistry] ✅ Registered:', subject.title);
            return subject.id;
        }

        /**
         * 批量注册 Subjects
         */
        registerAll(subjects) {
            if (!Array.isArray(subjects)) {
                console.warn('[SubjectRegistry] registerAll expects array');
                return [];
            }

            const results = [];
            for (const subject of subjects) {
                const id = this.register(subject);
                if (id) results.push(id);
            }
            return results;
        }

        /**
         * 获取单个 Subject
         */
        getSubject(id) {
            return this._subjects.get(id) || null;
        }

        /**
         * 获取所有 Subjects
         */
        getAllSubjects() {
            return Array.from(this._subjects.values());
        }

        /**
         * 按 Course 获取 Subjects
         */
        getSubjectsByCourse(courseId) {
            const subjectIds = this._subjectsByCourse.get(courseId) || [];
            const subjects = [];
            for (const id of subjectIds) {
                const subject = this._subjects.get(id);
                if (subject) subjects.push(subject);
            }
            return subjects;
        }
        
        /**
         * ═══ Part 17: 检查 Subject 是否存在 ═══
         */
        hasSubject: function(subjectId) {
            if (!subjectId) return false;
            return this._subjects.has(subjectId);
        },

        /**
         * 获取活跃 Subjects
         */
        getActiveSubjects() {
            return this.getAllSubjects().filter(s => s.status === 'published');
        }

        /**
         * 按状态筛选
         */
        getSubjectsByStatus(status) {
            return this.getAllSubjects().filter(s => s.status === status);
        }

        /**
         * ═══ Part 19: 获取 Subject 摘要（轻量级） ═══
         */
        getSubjectSummary: function(subjectId) {
            var subject = this.getSubject(subjectId);
            if (!subject) return null;
            
            return {
                id: subject.id,
                title: subject.title,
                courseId: subject.courseId,
                description: subject.description,
                difficulty: subject.difficulty,
                lessonCount: subject.lessons ? subject.lessons.length : 0,
                status: subject.status
            };
        },

        /**
         * 从 S4 ContentLoader 同步 Subjects
         */
        async loadFromS4(courseId) {
            const loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[SubjectRegistry] ContentLoader not available');
                return false;
            }

            try {
                // 加载 Course 的所有 Subjects
                const subjects = await loader.loadCourseSubjects(courseId);
                if (!subjects || subjects.length === 0) {
                    console.warn('[SubjectRegistry] No subjects found for course:', courseId);
                    return false;
                }

                let count = 0;
                for (const subject of subjects) {
                    const id = this.register(subject);
                    if (id) count++;
                }

                console.log('[SubjectRegistry] ✅ Loaded ' + count + ' subjects from S4 for course:', courseId);
                return true;
            } catch (e) {
                console.warn('[SubjectRegistry] S4 load failed:', e);
                return false;
            }
        }

        /**
         * 获取统计
         */
        getStats() {
            const subjects = this.getAllSubjects();
            const active = this.getActiveSubjects();
            const byCourse = {};
            for (const [courseId, ids] of this._subjectsByCourse) {
                byCourse[courseId] = ids.length;
            }

            return {
                totalSubjects: subjects.length,
                activeSubjects: active.length,
                byCourse: byCourse,
                version: this.version
            };
        }

        /**
         * 获取状态
         */
        getStatus() {
            return {
                initialized: this.initialized,
                version: this.version,
                subjectCount: this._subjects.size,
                courseCount: this._subjectsByCourse.size
            };
        }

        /**
         * 清空注册表
         */
        clear() {
            this._subjects.clear();
            this._subjectsByCourse.clear();
            console.log('[SubjectRegistry] Cleared');
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

    const subjectRegistry = new SubjectRegistry();
    window.LawAIApp.SubjectRegistry = subjectRegistry;

    // 自动初始化
    function autoInit() {
        subjectRegistry.initialize();
        // 尝试从 S4 加载 subjects
        setTimeout(() => {
            subjectRegistry.loadFromS4('course-ai').catch(() => {});
        }, 800);
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoInit, 200);
        });
    }

    console.log('[SubjectRegistry] Module loaded');

})();
