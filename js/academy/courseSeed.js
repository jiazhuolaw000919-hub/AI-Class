// js/academy/courseSeed.js
// Part 57.6 — Course Seed Data
// Law AI Academy Developer Bible
//
// PURPOSE: Initial course catalogue
// Only foundation courses — no detailed lessons yet

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.CourseSeed) {
    console.log('[CourseSeed] Already exists, skipping...');
    return;
  }

  const CourseSeed = {
    version: '1.0.0',
    loaded: false,

    // ============================================================
    // 1. COURSES — School of Artificial Intelligence
    // ============================================================

    courses: [
      // AI School Courses
      {
        id: 'course-ai-fundamentals',
        programId: 'program-ai-foundations',
        schoolId: 'school-ai',
        title: 'AI Fundamentals',
        description: 'Essential AI concepts and applications',
        difficulty: 'beginner',
        estimatedHours: 8,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Understand AI core concepts',
          'Identify AI applications',
          'Build simple AI projects'
        ]
      },
      {
        id: 'course-prompt-engineering',
        programId: 'program-ai-prompting',
        schoolId: 'school-ai',
        title: 'Prompt Engineering Foundations',
        description: 'Master the art of prompting AI models',
        difficulty: 'beginner',
        estimatedHours: 6,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Write effective prompts',
          'Optimize AI responses',
          'Build prompt-based workflows'
        ]
      },
      {
        id: 'course-ai-tools',
        programId: 'program-ai-prompting',
        schoolId: 'school-ai',
        title: 'AI Tools & Productivity',
        description: 'Leverage AI tools for maximum productivity',
        difficulty: 'beginner',
        estimatedHours: 5,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Use AI tools effectively',
          'Automate daily tasks',
          'Build productivity workflows'
        ]
      },
      {
        id: 'course-ai-agents',
        programId: 'program-ai-agents',
        schoolId: 'school-ai',
        title: 'AI Agents Introduction',
        description: 'Build intelligent AI agents and automations',
        difficulty: 'intermediate',
        estimatedHours: 10,
        status: 'active',
        prerequisites: ['course-ai-fundamentals'],
        learningObjectives: [
          'Understand AI agent architecture',
          'Build simple agents',
          'Deploy agent-based solutions'
        ]
      },

      // Business School Courses
      {
        id: 'course-business-fundamentals',
        programId: 'program-business-strategy',
        schoolId: 'school-business',
        title: 'Business Fundamentals',
        description: 'Core business concepts and practices',
        difficulty: 'beginner',
        estimatedHours: 6,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Understand business basics',
          'Identify business models',
          'Build business strategies'
        ]
      },
      {
        id: 'course-entrepreneurship',
        programId: 'program-business-entrepreneurship',
        schoolId: 'school-business',
        title: 'Entrepreneurship Basics',
        description: 'Start and grow your business',
        difficulty: 'beginner',
        estimatedHours: 8,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Develop business ideas',
          'Create business plans',
          'Launch and grow businesses'
        ]
      },
      {
        id: 'course-business-strategy',
        programId: 'program-business-strategy',
        schoolId: 'school-business',
        title: 'Business Strategy Foundations',
        description: 'Strategic thinking and planning',
        difficulty: 'intermediate',
        estimatedHours: 8,
        status: 'active',
        prerequisites: ['course-business-fundamentals'],
        learningObjectives: [
          'Think strategically',
          'Develop business plans',
          'Execute business strategies'
        ]
      },
      {
        id: 'course-productivity-systems',
        programId: 'program-business-productivity',
        schoolId: 'school-business',
        title: 'Personal Productivity Systems',
        description: 'Optimize workflows and manage teams',
        difficulty: 'intermediate',
        estimatedHours: 6,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Build productivity systems',
          'Optimize workflows',
          'Lead effective teams'
        ]
      },

      // Technology School Courses
      {
        id: 'course-web-development',
        programId: 'program-tech-development',
        schoolId: 'school-technology',
        title: 'Web Development Foundations',
        description: 'Build web applications with modern practices',
        difficulty: 'beginner',
        estimatedHours: 10,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Build web applications',
          'Understand web technologies',
          'Deploy web projects'
        ]
      },
      {
        id: 'course-mobile-development',
        programId: 'program-tech-mobile',
        schoolId: 'school-technology',
        title: 'Mobile Development Foundations',
        description: 'Build mobile applications for iOS and Android',
        difficulty: 'beginner',
        estimatedHours: 10,
        status: 'active',
        prerequisites: [],
        learningObjectives: [
          'Build mobile apps',
          'Understand mobile platforms',
          'Deploy mobile applications'
        ]
      },
      {
        id: 'course-game-development',
        programId: 'program-tech-development',
        schoolId: 'school-technology',
        title: 'Game Development Foundations',
        description: 'Create games with modern engines',
        difficulty: 'intermediate',
        estimatedHours: 12,
        status: 'active',
        prerequisites: ['course-web-development'],
        learningObjectives: [
          'Build games',
          'Understand game engines',
          'Deploy game projects'
        ]
      },
      {
        id: 'course-system-design',
        programId: 'program-tech-system-design',
        schoolId: 'school-technology',
        title: 'Software Architecture Basics',
        description: 'Design scalable systems and architectures',
        difficulty: 'advanced',
        estimatedHours: 12,
        status: 'active',
        prerequisites: ['course-web-development'],
        learningObjectives: [
          'Design software architectures',
          'Build scalable systems',
          'Optimize system performance'
        ]
      }
    ],

    // ============================================================
    // 2. MODULES — Foundation Modules
    // ============================================================

    modules: [
      // AI Fundamentals Modules
      {
        id: 'module-ai-what',
        courseId: 'course-ai-fundamentals',
        title: 'What is AI?',
        description: 'Understanding artificial intelligence',
        order: 1,
        lessons: []
      },
      {
        id: 'module-ai-how',
        courseId: 'course-ai-fundamentals',
        title: 'How AI Works',
        description: 'AI algorithms and models',
        order: 2,
        lessons: []
      },
      {
        id: 'module-ai-applications',
        courseId: 'course-ai-fundamentals',
        title: 'AI Applications',
        description: 'Real-world AI applications',
        order: 3,
        lessons: []
      },

      // Prompt Engineering Modules
      {
        id: 'module-prompt-basics',
        courseId: 'course-prompt-engineering',
        title: 'Prompt Basics',
        description: 'Fundamentals of prompting',
        order: 1,
        lessons: []
      },
      {
        id: 'module-prompt-advanced',
        courseId: 'course-prompt-engineering',
        title: 'Advanced Prompting',
        description: 'Complex prompting techniques',
        order: 2,
        lessons: []
      },

      // AI Tools Modules
      {
        id: 'module-tools-intro',
        courseId: 'course-ai-tools',
        title: 'AI Tools Overview',
        description: 'Introduction to AI tools',
        order: 1,
        lessons: []
      },
      {
        id: 'module-tools-workflow',
        courseId: 'course-ai-tools',
        title: 'AI Workflows',
        description: 'Building AI-powered workflows',
        order: 2,
        lessons: []
      },

      // AI Agents Modules
      {
        id: 'module-agents-basics',
        courseId: 'course-ai-agents',
        title: 'Agent Basics',
        description: 'Understanding AI agents',
        order: 1,
        lessons: []
      },
      {
        id: 'module-agents-build',
        courseId: 'course-ai-agents',
        title: 'Building Agents',
        description: 'Building AI agents',
        order: 2,
        lessons: []
      }
    ],

    // ============================================================
    // 3. PUBLIC API
    // ============================================================

    /**
     * 加载种子数据到 Registry
     */
    load: function() {
      if (this.loaded) {
        console.log('[CourseSeed] Already loaded');
        return this;
      }

      console.log('[CourseSeed] 🌱 Loading course seed data...');

      try {
        // 1. 加载 Courses
        const courseRegistry = window.LawAIApp?.CourseRegistry;
        if (courseRegistry && typeof courseRegistry.registerCourse === 'function') {
          this.courses.forEach(function(course) {
            courseRegistry.registerCourse(course);
          });
          console.log('[CourseSeed] ✅ Loaded', this.courses.length, 'courses');
        } else {
          console.warn('[CourseSeed] CourseRegistry not available');
        }

        // 2. 加载 Modules
        const moduleRegistry = window.LawAIApp?.ModuleRegistry;
        if (moduleRegistry && typeof moduleRegistry.registerModule === 'function') {
          this.modules.forEach(function(module) {
            moduleRegistry.registerModule(module);
          });
          console.log('[CourseSeed] ✅ Loaded', this.modules.length, 'modules');
        } else {
          console.warn('[CourseSeed] ModuleRegistry not available');
        }

        this.loaded = true;

        this._emit('CURRICULUM_UPDATED', {
          courses: this.courses.length,
          modules: this.modules.length,
          type: 'seed'
        });

        console.log('[CourseSeed] ✅ Seed data loaded successfully');

      } catch (error) {
        console.error('[CourseSeed] Load failed:', error);
      }

      return this;
    },

    /**
     * 获取种子数据摘要
     */
    getSummary: function() {
      return {
        version: this.version,
        loaded: this.loaded,
        courses: this.courses.length,
        modules: this.modules.length
      };
    },

    // ============================================================
    // 4. PRIVATE — Event Helpers
    // ============================================================

    _emit: function(eventName, data) {
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
  };

  // ============================================================
  // Export
  // ============================================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.CourseSeed = CourseSeed;

  console.log('[CourseSeed] Module loaded (Part 57.6)');

  // ============================================================
  // Auto-Load
  // ============================================================

  function autoLoadSeed() {
    const courseReg = window.LawAIApp?.CourseRegistry;
    const moduleReg = window.LawAIApp?.ModuleRegistry;

    if (courseReg && courseReg._initialized && moduleReg && moduleReg._initialized) {
      CourseSeed.load();
    } else {
      console.log('[CourseSeed] Waiting for registries...');
      document.addEventListener('COURSE_REGISTRY_READY', function() {
        if (window.LawAIApp?.ModuleRegistry?._initialized) {
          CourseSeed.load();
        }
      });
      document.addEventListener('MODULE_REGISTRY_READY', function() {
        if (window.LawAIApp?.CourseRegistry?._initialized) {
          CourseSeed.load();
        }
      });

      // 后备轮询
      let attempts = 0;
      const interval = setInterval(function() {
        attempts++;
        if (window.LawAIApp?.CourseRegistry?._initialized && window.LawAIApp?.ModuleRegistry?._initialized) {
          clearInterval(interval);
          CourseSeed.load();
        } else if (attempts > 30) {
          clearInterval(interval);
          console.warn('[CourseSeed] Registries timeout, loading anyway...');
          CourseSeed.load();
        }
      }, 300);
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(autoLoadSeed, 300);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoLoadSeed, 300);
    });
  }

})();
