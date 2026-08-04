// js/academy/programRegistry.js
// Part 57.5 — Program Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Manage Programs inside Schools
// CONSUMES: SchoolRegistry, AcademyRegistry

(function() {
    'use strict';

    if (window.LawAIApp?.ProgramRegistry) {
        console.log('[ProgramRegistry] Already exists, skipping...');
        return;
    }

    class ProgramRegistry {
        constructor() {
            this.version = '1.0.0';
            this._programs = new Map();
            this._initialized = false;

            // 默认 Programs (Placeholders)
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
                {
                    id: 'program-business-productivity',
                    schoolId: 'school-business',
                    name: 'Productivity & Management',
                    description: 'Optimize workflows and manage teams',
                    level: 'intermediate',
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
                },
                {
                    id: 'program-tech-mobile',
                    schoolId: 'school-technology',
                    name: 'Mobile Development',
                    description: 'Build mobile applications for iOS and Android',
                    level: 'beginner',
                    status: 'active',
                    modules: []
                }
            ];
        }

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Program Registry
         */
        initialize() {
            if (this._initialized) {
                console.log('[ProgramRegistry] Already initialized');
                return this;
            }

            console.log('[ProgramRegistry] 📚 Initializing...');

            this.DEFAULT_PROGRAMS.forEach(function(program) {
                this.register(program);
            }.bind(this));

            this._initialized = true;

            this._emit('PROGRAM_REGISTRY_READY', {
                programs: this.getAllPrograms(),
                count: this._programs.size
            });

            console.log('[ProgramRegistry] ✅ Initialized with', this._programs.size, 'programs');
            return this;
        },

        /**
         * 注册 Program
         */
        register: function(programData) {
            var validation = this.validate(programData);
            if (!validation.valid) {
                console.warn('[ProgramRegistry] Validation failed:', validation.errors);
                return null;
            }

            if (this._programs.has(programData.id)) {
                console.warn('[ProgramRegistry] Program already exists:', programData.id);
                return programData.id;
            }

            // 验证 School 存在
            var schoolRegistry = window.LawAIApp?.SchoolRegistry;
            if (schoolRegistry) {
                var school = schoolRegistry.getSchool(programData.schoolId);
                if (!school) {
                    console.warn('[ProgramRegistry] School not found:', programData.schoolId);
                } else {
                    if (!school.programs) school.programs = [];
                    if (!school.programs.includes(programData.id)) {
                        school.programs.push(programData.id);
                    }
                }
            }

            var program = {
                ...programData,
                createdAt: programData.createdAt || new Date().toISOString(),
                status: programData.status || 'active',
                modules: programData.modules || []
            };

            this._programs.set(programData.id, program);

            this._emit('PROGRAM_REGISTERED', {
                programId: program.id,
                name: program.name,
                schoolId: program.schoolId
            });

            console.log('[ProgramRegistry] ✅ Registered:', program.name);
            return program.id;
        },

        /**
         * 获取 Program
         */
        getProgram: function(programId) {
            return this._programs.get(programId) || null;
        },

        /**
         * 获取学校的所有 Programs
         */
        getProgramsBySchool: function(schoolId) {
            return this.getAllPrograms().filter(function(p) {
                return p.schoolId === schoolId;
            });
        },

        /**
         * 获取所有 Programs
         */
        getAllPrograms() {
            return Array.from(this._programs.values());
        },

        /**
         * 获取活跃 Programs
         */
        getActivePrograms: function() {
            return this.getAllPrograms().filter(function(p) {
                return p.status === 'active';
            });
        },

        /**
         * 验证 Program 数据
         */
        validate: function(data) {
            var errors = [];

            if (!data.id) errors.push('id is required');
            if (!data.name) errors.push('name is required');
            if (!data.schoolId) errors.push('schoolId is required');
            if (data.level && !['beginner', 'intermediate', 'advanced'].includes(data.level)) {
                errors.push('level must be: beginner, intermediate, advanced');
            }

            return {
                valid: errors.length === 0,
                errors: errors
            };
        },

        /**
         * 获取统计
         */
        getStats: function() {
            var programs = this.getAllPrograms();
            return {
                totalPrograms: programs.length,
                activePrograms: this.getActivePrograms().length,
                byLevel: {
                    beginner: programs.filter(function(p) { return p.level === 'beginner'; }).length,
                    intermediate: programs.filter(function(p) { return p.level === 'intermediate'; }).length,
                    advanced: programs.filter(function(p) { return p.level === 'advanced'; }).length
                }
            };
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                initialized: this._initialized,
                version: this.version,
                programCount: this._programs.size
            };
        },

        // ============================================================
        // 2. PRIVATE — Event Helpers
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
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

    var programRegistry = new ProgramRegistry();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ProgramRegistry = new ProgramRegistry();

    console.log('[ProgramRegistry] Module loaded (Part 57.5)');

    // 自动初始化 (等待 SchoolRegistry)
    function autoInit() {
        var schoolReg = window.LawAIApp?.SchoolRegistry;
        if (schoolReg && schoolReg._initialized) {
            programRegistry.initialize();
        } else {
            console.log('[ProgramRegistry] Waiting for SchoolRegistry...');
            document.addEventListener('SCHOOL_REGISTRY_READY', function() {
                programRegistry.initialize();
            });
            // 后备轮询
            var attempts = 0;
            var interval = setInterval(function() {
                attempts++;
                if (window.LawAIApp?.SchoolRegistry?._initialized) {
                    clearInterval(interval);
                    programRegistry.initialize();
                } else if (attempts > 20) {
                    clearInterval(interval);
                    console.warn('[ProgramRegistry] SchoolRegistry timeout, initializing anyway...');
                    programRegistry.initialize();
                }
            }, 200);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 200);
        });
    }

})();
