// js/academy/programRegistry.js
// Part 57.5 Recovery Patch — Program Registry (ES6 Class)
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ProgramRegistry) {
        console.log('[ProgramRegistry] Already exists, skipping...');
        return;
    }

    class ProgramRegistry {
        constructor() {
            this._programs = new Map();
            this.initialized = false;
            this.version = '2.0.0';

            this.DEFAULT_PROGRAMS = [
                // AI School Programs
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
                    id: 'program-ai-agents',
                    schoolId: 'school-ai',
                    name: 'AI Agents & Automation',
                    description: 'Build intelligent AI agents and automations',
                    level: 'intermediate',
                    status: 'active',
                    modules: []
                },
                {
                    id: 'program-ai-advanced',
                    schoolId: 'school-ai',
                    name: 'Advanced AI Applications',
                    description: 'Deep dive into AI and machine learning',
                    level: 'advanced',
                    status: 'active',
                    modules: []
                },
                // Business School Programs
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
                    id: 'program-business-entrepreneurship',
                    schoolId: 'school-business',
                    name: 'Entrepreneurship',
                    description: 'Start and grow your business',
                    level: 'beginner',
                    status: 'active',
                    modules: []
                },
                // Technology School Programs
                {
                    id: 'program-tech-development',
                    schoolId: 'school-technology',
                    name: 'Software Development',
                    description: 'Build software with modern practices',
                    level: 'beginner',
                    status: 'active',
                    modules: []
                },
                {
                    id: 'program-tech-system-design',
                    schoolId: 'school-technology',
                    name: 'System Design',
                    description: 'Design scalable systems and architectures',
                    level: 'intermediate',
                    status: 'active',
                    modules: []
                }
            ];
        }

        /**
         * 初始化 Program Registry
         */
        initialize() {
            if (this.initialized) {
                console.log('[ProgramRegistry] Already initialized');
                return this;
            }

            console.log('[ProgramRegistry] 📚 Initializing...');

            this.DEFAULT_PROGRAMS.forEach((program) => {
                this.register(program);
            });

            this.initialized = true;

            this._emit('PROGRAM_REGISTRY_READY', {
                programs: this.getAllPrograms(),
                count: this._programs.size
            });

            console.log('[ProgramRegistry] ✅ Initialized with', this._programs.size, 'programs');
            return this;
        }

        /**
         * 注册 Program
         */
        register(programData) {
            if (!programData.id) {
                console.warn('[ProgramRegistry] Program: id is required');
                return null;
            }

            if (!programData.name) {
                console.warn('[ProgramRegistry] Program: name is required');
                return null;
            }

            if (!programData.schoolId) {
                console.warn('[ProgramRegistry] Program: schoolId is required');
                return null;
            }

            if (this._programs.has(programData.id)) {
                console.warn('[ProgramRegistry] Program already exists:', programData.id);
                return programData.id;
            }

            // 关联到 School
            const schoolRegistry = window.LawAIApp?.SchoolRegistry;
            if (schoolRegistry) {
                const school = schoolRegistry.getSchool(programData.schoolId);
                if (school) {
                    if (!school.programs) school.programs = [];
                    if (!school.programs.includes(programData.id)) {
                        school.programs.push(programData.id);
                    }
                }
            }

            const program = {
                ...programData,
                status: programData.status || 'active',
                modules: programData.modules || [],
                createdAt: new Date().toISOString()
            };

            this._programs.set(programData.id, program);

            this._emit('PROGRAM_LOADED', {
                programId: program.id,
                name: program.name,
                schoolId: program.schoolId
            });

            console.log('[ProgramRegistry] ✅ Registered:', program.name);
            return program.id;
        }

        /**
         * 获取 Program
         */
        getProgram(id) {
            return this._programs.get(id) || null;
        }

        /**
         * 获取所有 Programs
         */
        getAllPrograms() {
            return Array.from(this._programs.values());
        }

        /**
         * 按 School 获取 Programs
         */
        getProgramsBySchool(schoolId) {
            return this.getAllPrograms().filter((p) => p.schoolId === schoolId);
        }

        /**
         * 获取活跃 Programs
         */
        getActivePrograms() {
            return this.getAllPrograms().filter((p) => p.status === 'active');
        }

        /**
         * 更新 Program
         */
        updateProgram(id, updates) {
            const program = this._programs.get(id);
            if (!program) {
                console.warn('[ProgramRegistry] Program not found:', id);
                return null;
            }

            const updated = {
                ...program,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this._programs.set(id, updated);
            return updated;
        }

        /**
         * 获取统计
         */
        getStats() {
            const programs = this.getAllPrograms();
            return {
                totalPrograms: programs.length,
                activePrograms: this.getActivePrograms().length,
                bySchool: {}
            };
        }

        /**
         * 获取状态
         */
        getStatus() {
            return {
                initialized: this.initialized,
                version: this.version,
                programCount: this._programs.size
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

    const programRegistry = new ProgramRegistry();
    window.LawAIApp.ProgramRegistry = programRegistry;

    // 自动初始化 (等待 SchoolRegistry)
    function autoInit() {
        const schoolReg = window.LawAIApp?.SchoolRegistry;
        if (schoolReg && schoolReg.initialized) {
            programRegistry.initialize();
        } else {
            document.addEventListener('SCHOOL_REGISTRY_READY', () => {
                programRegistry.initialize();
            });
            // 后备
            setTimeout(() => {
                if (!programRegistry.initialized) {
                    programRegistry.initialize();
                }
            }, 1000);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(autoInit, 200);
        });
    }

    console.log('[ProgramRegistry] Module loaded (Part 57.5 Recovery)');

})();
