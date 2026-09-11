// js/academy/subjectRegistry.js
// S4 Subject Registry — 管理 Subject 的注册、查询和发现
// Law AI Academy Season 4
// v1.0.1 — 加载完成后广播事件，供 UI 刷新

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
            this.version = '1.0.1';
            this._loadPromise = null;
        }

        initialize() {
            if (this.initialized) {
                console.log('[SubjectRegistry] Already initialized');
                return this;
            }
            console.log('[SubjectRegistry] 📖 Initializing...');
            this.initialized = true;
            return this;
        }

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

        getSubject(id) {
            return this._subjects.get(id) || null;
        }

        getAllSubjects() {
            return Array.from(this._subjects.values());
        }

        getSubjectsByCourse(courseId) {
            const subjectIds = this._subjectsByCourse.get(courseId) || [];
            const subjects = [];
            for (const id of subjectIds) {
                const subject = this._subjects.get(id);
                if (subject) subjects.push(subject);
            }
            return subjects;
        }

        hasSubject(subjectId) {
            if (!subjectId) return false;
            return this._subjects.has(subjectId);
        }

        getActiveSubjects() {
            return this.getAllSubjects().filter(s => s.status === 'published');
        }

        getSubjectsByStatus(status) {
            return this.getAllSubjects().filter(s => s.status === status);
        }

        getSubjectSummary(subjectId) {
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
        }

        getModuleCompatible(subjectId) {
            var subject = this.getSubject(subjectId);
            if (!subject) return null;

            return {
                id: subject.id,
                courseId: subject.courseId,
                name: subject.title,
                title: subject.title,
                description: subject.description || '',
                order: subject.order || 0,
                lessons: subject.lessons || [],
                learningObjectives: subject.learningObjectives || subject.objectives || [],
                metadata: subject.metadata || {},
                status: subject.status || 'published',
                _subject: subject
            };
        }

        /**
         * 从 S4 ContentLoader 同步 Subjects
         * @param {string} courseId - Course ID
         * @returns {Promise<boolean>}
         */
        async loadFromS4(courseId) {
            const loader = window.LawAIApp?.S4ContentLoader || window.LawAIApp?.ContentLoader;
            if (!loader) {
                console.warn('[SubjectRegistry] ContentLoader not available');
                return false;
            }

            if (typeof loader.loadCourseSubjects !== 'function') {
                console.warn('[SubjectRegistry] ContentLoader.loadCourseSubjects not available');
                return false;
            }

            try {
                const subjects = await loader.loadCourseSubjects(courseId);
                if (!subjects || subjects.length === 0) {
                    console.warn('[SubjectRegistry] No subjects found for course:', courseId);
                    return false;
                }

                let count = 0;
                for (const subject of subjects) {
                    // 🔥 确保 subject 有 courseId
                    if (!subject.courseId) {
                        subject.courseId = courseId;
                    }
                    const id = this.register(subject);
                    if (id) count++;
                }

                console.log('[SubjectRegistry] ✅ Loaded ' + count + ' subjects from S4 for course:', courseId);

                // 🔥 广播事件，供 UI 刷新
                this._emit('SUBJECTS_LOADED', {
                    courseId: courseId,
                    count: count
                });

                return true;
            } catch (e) {
                console.warn('[SubjectRegistry] S4 load failed:', e);
                return false;
            }
        }

        /**
         * 🔥 一次性加载所有 course 的 subjects
         */
        async loadAllCourses() {
            if (this._loadPromise) {
                return this._loadPromise;
            }

            this._loadPromise = (async () => {
                var courses = [];
                var curriculum = window.LawAIApp?.CurriculumAuthority;

                // 尝试从 CurriculumAuthority 拿所有 course
                if (curriculum && typeof curriculum.getAllCourses === 'function') {
                    try {
                        courses = curriculum.getAllCourses() || [];
                    } catch (e) {}
                }

                // 如果没有，尝试硬编码一个默认列表（兜底）
                if (courses.length === 0) {
                    console.warn('[SubjectRegistry] No courses from CurriculumAuthority, using default: course-ai');
                    courses = [{ id: 'course-ai' }];
                }

                console.log('[SubjectRegistry] 🔄 Loading subjects for ' + courses.length + ' courses...');

                let total = 0;
                for (const c of courses) {
                    try {
                        const ok = await this.loadFromS4(c.id);
                        if (ok) total++;
                    } catch (e) {
                        console.warn('[SubjectRegistry] Failed to load course:', c.id, e);
                    }
                }

                console.log('[SubjectRegistry] ✅ All courses loaded, total successful: ' + total);
                this._emit('SUBJECTS_ALL_LOADED', {
                    courseCount: courses.length,
                    successCount: total,
                    totalSubjects: this._subjects.size
                });

                return total > 0;
            })();

            return this._loadPromise;
        }

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

        getStatus() {
            return {
                initialized: this.initialized,
                version: this.version,
                subjectCount: this._subjects.size,
                courseCount: this._subjectsByCourse.size
            };
        }

        clear() {
            this._subjects.clear();
            this._subjectsByCourse.clear();
            console.log('[SubjectRegistry] Cleared');
        }

        _emit(eventName, data) {
            try {
                const event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit(eventName, data);
                }
            } catch (err) {}
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

    // ============================================================
    // 自动初始化
    // ============================================================

    function autoInit() {
        subjectRegistry.initialize();

        // 🔥 修复：延迟一点，等 CurriculumAuthority 加载
        // 然后尝试加载所有 course 的 subjects
        setTimeout(() => {
            subjectRegistry.loadAllCourses().catch((e) => {
                console.warn('[SubjectRegistry] Auto-load failed:', e);
            });
        }, 500);
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoInit, 200);
        });
    }

    console.log('[SubjectRegistry] Module loaded (v1.0.1)');

})();
