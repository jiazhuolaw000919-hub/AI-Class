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

        initialize: function() {
            if (this.initialized) {
                console.log('[ProgramRegistry] Already initialized');
                return this;
            }

            console.log('[ProgramRegistry] 📚 Initializing...');

            this.DEFAULT_PROGRAMS.forEach(function(program) {
                this.register(program);
            }.bind(this));

            this.initialized = true;

            this._emit('PROGRAM_REGISTRY_READY', {
                programs: this.getAllPrograms(),
                count: this._programs.size
            });

            console.log('[ProgramRegistry] ✅ Initialized with', this._programs.size, 'programs');
            return this;
        },

        register: function(programData) {
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

            // ============================================================
            // 🔥 修复：更新 School 的 programs 数组
            // ============================================================
            var schoolRegistry = window.LawAIApp?.SchoolRegistry;
            if (schoolRegistry) {
                var school = schoolRegistry.getSchool(programData.schoolId);
                if (school) {
                    if (!school.programs) school.programs = [];
                    if (!school.programs.includes(programData.id)) {
                        school.programs.push(programData.id);
                        console.log('[ProgramRegistry] ✅ Updated School programs:', school.name, '→', school.programs.length);
                    }
                } else {
                    console.warn('[ProgramRegistry] ⚠️ School not found for program:', programData.schoolId);
                }
            }

            var program = {
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
        },

        getProgram: function(id) {
            return this._programs.get(id) || null;
        },

        getAllPrograms: function() {
            return Array.from(this._programs.values());
        },

        getProgramsBySchool: function(schoolId) {
            return this.getAllPrograms().filter(function(p) {
                return p.schoolId === schoolId;
            });
        },

        getActivePrograms: function() {
            return this.getAllPrograms().filter(function(p) {
                return p.status === 'active';
            });
        },

        updateProgram: function(id, updates) {
            var program = this._programs.get(id);
            if (!program) {
                console.warn('[ProgramRegistry] Program not found:', id);
                return null;
            }

            var updated = {
                ...program,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this._programs.set(id, updated);
            return updated;
        },

        getStats: function() {
            var programs = this.getAllPrograms();
            return {
                totalPrograms: programs.length,
                activePrograms: this.getActivePrograms().length
            };
        },

        getStatus: function() {
            return {
                initialized: this.initialized,
                version: this.version,
                programCount: this._programs.size
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

    var programRegistry = new ProgramRegistry();
    window.LawAIApp.ProgramRegistry = programRegistry;

    function autoInit() {
        var schoolReg = window.LawAIApp?.SchoolRegistry;
        if (schoolReg && schoolReg.initialized) {
            programRegistry.initialize();
        } else {
            document.addEventListener('SCHOOL_REGISTRY_READY', function() {
                programRegistry.initialize();
            });
            setTimeout(function() {
                if (!programRegistry.initialized) {
                    programRegistry.initialize();
                }
            }, 1000);
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 200);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 200);
        });
    }

    console.log('[ProgramRegistry] Module loaded (Part 57.5 Recovery)');

})();
