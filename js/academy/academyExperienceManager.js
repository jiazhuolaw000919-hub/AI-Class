// js/academy/academyExperienceManager.js
// Part 58.1 — Course Learning Entry Layer
// Law AI Academy Developer Bible

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
        console.log('[AcademyExperienceManager] Already exists, skipping...');
        return;
    }

    // ============================================================
    // 🔥 FALLBACK DATA
    // ============================================================
    var FALLBACK_SCHOOLS = [
        {
            id: 'school-science',
            name: 'School of Science',
            icon: '🔬',
            description: 'Explore the fundamentals of science and technology',
            programs: []
        },
        {
            id: 'school-business',
            name: 'School of Business',
            icon: '💼',
            description: 'Master business strategies and leadership',
            programs: []
        },
        {
            id: 'school-art',
            name: 'School of Art',
            icon: '🎨',
            description: 'Unleash your creativity and artistic expression',
            programs: []
        }
    ];

    var AcademyExperienceManager = {
        version: '6.2.1',
        initialized: false,
        mounted: false,
        status: 'pending',

        _state: {
            currentSchoolId: null,
            currentProgramId: null,
            currentCourseId: null,
            currentModuleId: null,
            currentSubjectId: null,
            currentLessonId: null,
            viewMode: 'dashboard',
            sessionStatus: null,
            currentSessionId: null
        },

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[AcademyExperienceManager] Already initialized');
                return this;
            }

            console.log('[AcademyExperienceManager] 🚀 Initializing...');

            try {
                this._initLayers();
                this._bindEvents();
                this.mount();

                this.initialized = true;
                this.status = 'ready';

                this._emit('ACADEMY_EXPERIENCE_READY', {
                    version: this.version,
                    timestamp: Date.now()
                });

                console.log('[AcademyExperienceManager] ✅ Initialized');

            } catch (error) {
                console.error('[AcademyExperienceManager] Init failed:', error);
                this.status = 'failed';
            }

            return this;
        },

        mount: function() {
            if (this.mounted) {
                console.log('[AcademyExperienceManager] Already mounted');
                return this;
            }

            console.log('[AcademyExperienceManager] 📍 Mounting...');

            var container = document.getElementById('academy-root');
            if (!container) {
                container = this._createContainer();
            }

            this.render();
            this.mounted = true;

            console.log('[AcademyExperienceManager] ✅ Mounted');
            return this;
        },

        render: function() {
            console.log('[AcademyExperienceManager] 🎨 Rendering viewMode:', this._state.viewMode);

            var container = document.getElementById('academy-root');
            if (!container) {
                console.warn('[AcademyExperienceManager] #academy-root not found');
                return this;
            }

            var data = this._getRenderData();

            if (window.LawAIApp && window.LawAIApp.AcademyView && typeof window.LawAIApp.AcademyView.render === 'function') {
                window.LawAIApp.AcademyView.render(data);
            } else {
                this._renderFallback(container, data);
            }

            return this;
        },

        refresh: function() {
            console.log('[AcademyExperienceManager] 🔄 Refreshing...');
            this.render();
            this._emit('ACADEMY_REFRESH', { timestamp: Date.now() });
            return this;
        },

        navigateToSchool: function(schoolId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to school:', schoolId);

            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (!schoolRegistry) {
                console.warn('[AcademyExperienceManager] SchoolRegistry not available, using fallback');
                // 从 fallback 中查找
                var fallbackSchool = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
                if (fallbackSchool) {
                    this._state.currentSchoolId = schoolId;
                    this._state.currentProgramId = null;
                    this._state.currentCourseId = null;
                    this._state.currentModuleId = null;
                    this._state.currentSubjectId = null;
                    this._state.currentLessonId = null;
                    this._state.viewMode = 'school';
                    this.render();
                    this._emit('ACADEMY_VIEW_CHANGED', {
                        viewMode: 'school',
                        currentSchoolId: schoolId
                    });
                }
                return this;
            }

            var school = schoolRegistry.getSchool ? schoolRegistry.getSchool(schoolId) : null;
            if (!school) {
                // 尝试从 fallback 中查找
                var fallbackSchool = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
                if (fallbackSchool) {
                    this._state.currentSchoolId = schoolId;
                    this._state.currentProgramId = null;
                    this._state.currentCourseId = null;
                    this._state.currentModuleId = null;
                    this._state.currentSubjectId = null;
                    this._state.currentLessonId = null;
                    this._state.viewMode = 'school';
                    this.render();
                    this._emit('ACADEMY_VIEW_CHANGED', {
                        viewMode: 'school',
                        currentSchoolId: schoolId
                    });
                } else {
                    console.warn('[AcademyExperienceManager] School not found:', schoolId);
                }
                return this;
            }

            this._state.currentSchoolId = schoolId;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'school';

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'school',
                currentSchoolId: schoolId
            });

            return this;
        },

        navigateToProgram: function(programId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);

            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (!programRegistry) {
                console.warn('[AcademyExperienceManager] ProgramRegistry not available');
                return this;
            }

            var program = programRegistry.getProgram ? programRegistry.getProgram(programId) : null;
            if (!program) {
                console.warn('[AcademyExperienceManager] Program not found:', programId);
                return this;
            }

            this._state.currentProgramId = programId;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'program';

            if (!this._state.currentSchoolId && program.schoolId) {
                this._state.currentSchoolId = program.schoolId;
            }

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'program',
                currentProgramId: programId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        navigateToCourse: function(courseId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to course:', courseId);

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            this._state.currentCourseId = courseId;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'course';

            if (!this._state.currentProgramId && course.programId) {
                this._state.currentProgramId = course.programId;
            }

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'course',
                currentCourseId: courseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        startCourse: function(courseId) {
            console.log('[AcademyExperienceManager] 🚀 Starting course:', courseId);

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (!courseRegistry) {
                console.warn('[AcademyExperienceManager] CourseRegistry not available');
                return this;
            }

            var course = courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                console.warn('[AcademyExperienceManager] Course not found:', courseId);
                return this;
            }

            this._state.currentCourseId = courseId;
            this._state.currentSubjectId = null;
            this._state.viewMode = 'course-learning';

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.initializeCourse === 'function') {
                adapter.initializeCourse(courseId);
                console.log('[AcademyExperienceManager] ✅ Learning journey initialized');
            }

            this._emit('COURSE_STARTED', {
                courseId: courseId,
                title: course.title
            });

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'course-learning',
                currentCourseId: courseId
            });

            console.log('[AcademyExperienceManager] ✅ Course started:', courseId);
            return this;
        },

        selectModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Selecting module:', moduleId);

            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                console.warn('[AcademyExperienceManager] Module not found:', moduleId);
                return this;
            }

            this._state.currentModuleId = moduleId;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'module';

            if (!this._state.currentCourseId && module.courseId) {
                this._state.currentCourseId = module.courseId;
            }

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.selectModule === 'function') {
                adapter.selectModule(moduleId, this._state.currentCourseId);
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'module',
                currentModuleId: moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Module selected:', moduleId);
            return this;
        },

        selectLesson: function(lessonId) {
            console.log('[AcademyExperienceManager] 📍 Selecting lesson:', lessonId);

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                console.warn('[AcademyExperienceManager] Lesson not found:', lessonId);
                return this;
            }

            this._state.currentLessonId = lessonId;
            this._state.currentModuleId = lesson.moduleId || this._state.currentModuleId;
            this._state.currentSubjectId = null;
            this._state.viewMode = 'lesson';

            if (!this._state.currentCourseId && lesson.courseId) {
                this._state.currentCourseId = lesson.courseId;
            }

            if (adapter && typeof adapter.selectLesson === 'function') {
                adapter.selectLesson(lessonId);
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: lessonId,
                currentModuleId: lesson.moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Lesson selected:', lessonId);
            return this;
        },

        startLesson: function(lessonId) {
            console.log('[AcademyExperienceManager] 🚀 Starting lesson:', lessonId);

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var lesson = adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                console.warn('[AcademyExperienceManager] Lesson not found:', lessonId);
                return this;
            }

            var session = adapter.startLessonSession ? adapter.startLessonSession(lessonId) : null;
            if (!session) {
                console.warn('[AcademyExperienceManager] Failed to start session');
                return this;
            }

            this._state.currentLessonId = lessonId;
            this._state.currentModuleId = lesson.moduleId || this._state.currentModuleId;
            this._state.viewMode = 'lesson';
            this._state.sessionStatus = 'active';
            this._state.currentSessionId = session.id;

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: lessonId,
                currentModuleId: lesson.moduleId,
                currentCourseId: this._state.currentCourseId,
                sessionStatus: 'active',
                currentSessionId: session.id
            });

            console.log('[AcademyExperienceManager] ✅ Lesson started:', lessonId);
            return this;
        },

        endLessonSession: function() {
            console.log('[AcademyExperienceManager] 🏁 Ending lesson session...');

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[AcademyExperienceManager] LearningJourneyAdapter not available');
                return this;
            }

            var result = adapter.endLessonSession ? adapter.endLessonSession() : null;
            if (!result) {
                console.warn('[AcademyExperienceManager] No active session to end');
                return this;
            }

            this._state.sessionStatus = 'completed';
            this._state.currentSessionId = null;

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'lesson',
                currentLessonId: this._state.currentLessonId,
                sessionStatus: 'completed'
            });

            console.log('[AcademyExperienceManager] ✅ Session ended');
            return this;
        },

        navigateToModule: function(moduleId) {
            console.log('[AcademyExperienceManager] 📍 Navigating to module:', moduleId);

            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            if (!academyRegistry) {
                console.warn('[AcademyExperienceManager] AcademyRegistry not available');
                return this;
            }

            var module = academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                console.warn('[AcademyExperienceManager] Module not found:', moduleId);
                return this;
            }

            this._state.currentModuleId = moduleId;
            this._state.currentLessonId = null;
            this._state.viewMode = 'module';

            if (!this._state.currentCourseId && module.courseId) {
                this._state.currentCourseId = module.courseId;
            }

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'module',
                currentModuleId: moduleId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            console.log('[AcademyExperienceManager] ✅ Navigated to module:', moduleId);
            return this;
        },

        navigateToSubject: function(subjectId) {
            if (!subjectId) {
                console.warn('[AcademyExperienceManager] navigateToSubject: subjectId required');
                return this;
            }

            var subjectRegistry = window.LawAIApp && window.LawAIApp.SubjectRegistry;
            var subject = subjectRegistry && subjectRegistry.getSubject ? subjectRegistry.getSubject(subjectId) : null;

            if (!subject) {
                console.warn('[AcademyExperienceManager] Subject not found:', subjectId);
                return this;
            }

            this._state.currentSubjectId = subjectId;
            this._state.currentCourseId = subject.courseId || this._state.currentCourseId;
            this._state.currentModuleId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'subject';

            console.log('[AcademyExperienceManager] ✅ State updated:', this._state);

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'subject',
                currentSubjectId: subjectId,
                currentCourseId: this._state.currentCourseId,
                currentProgramId: this._state.currentProgramId,
                currentSchoolId: this._state.currentSchoolId
            });

            return this;
        },

        continueLearning: function() {
            console.log('[AcademyExperienceManager] 📖 Continuing learning...');

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var continueData = adapter && adapter.getContinueLearning ? adapter.getContinueLearning() : null;

            if (continueData && continueData.courseId) {
                this.startCourse(continueData.courseId);
            } else {
                var schools = this._getSchools();
                if (schools && schools.length > 0) {
                    this.navigateToSchool(schools[0].id);
                }
            }

            return this;
        },

        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                mounted: this.mounted,
                status: this.status,
                state: this._state
            };
        },

        getCurrentLearningContext: function() {
            return {
                schoolId: this._state.currentSchoolId,
                programId: this._state.currentProgramId,
                courseId: this._state.currentCourseId,
                moduleId: this._state.currentModuleId,
                lessonId: this._state.currentLessonId,
                viewMode: this._state.viewMode,
                lastActivity: new Date().toISOString()
            };
        },

        goHome: function() {
            console.log('[AcademyExperienceManager] 🏠 Going home...');

            this._state.currentSchoolId = null;
            this._state.currentProgramId = null;
            this._state.currentCourseId = null;
            this._state.currentModuleId = null;
            this._state.currentSubjectId = null;
            this._state.currentLessonId = null;
            this._state.viewMode = 'dashboard';

            this.render();
            this._emit('ACADEMY_VIEW_CHANGED', {
                viewMode: 'dashboard'
            });

            return this;
        },

        prepareLessonExperience: async function(lessonId) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var lessonMeta = loader && loader.getLessonManifest ? await loader.getLessonManifest(lessonId) : null;
            if (!lessonMeta) {
                return {
                    lesson: null,
                    intro: null,
                    objectives: [],
                    content: null,
                    video: null,
                    notes: null,
                    flashcards: [],
                    practice: null,
                    ai: null,
                    summary: null,
                    reflection: null,
                    isCompleted: false,
                    progress: 0,
                    hasVideo: false,
                    hasNotes: false,
                    hasFlashcards: false,
                    hasPractice: false,
                    hasAI: false,
                    hasSummary: false
                };
            }

            var fullLesson = null;
            if (loader && typeof loader.loadLesson === 'function') {
                var courseId = lessonMeta.courseId;
                var subjectId = lessonMeta.subjectId;
                fullLesson = await loader.loadLesson(courseId, subjectId, lessonId);
            }

            var isCompleted = false;
            var progress = 0;
            if (adapter) {
                var state = adapter.getState ? adapter.getState() : null;
                if (state && state.lessonProgress) {
                    var lessonProgress = state.lessonProgress[lessonId];
                    if (lessonProgress) {
                        progress = lessonProgress.progress || 0;
                        isCompleted = lessonProgress.completed || false;
                    }
                }
            }

            var lessonData = fullLesson || lessonMeta;

            return {
                lesson: lessonData,
                intro: lessonData.intro || null,
                objectives: lessonData.learningObjectives || lessonMeta.objectives || [],
                content: lessonData.content || null,
                video: lessonData.video || null,
                notes: lessonData.notes || null,
                flashcards: lessonData.flashcards || [],
                practice: lessonData.practice || null,
                ai: lessonData.aiTools || null,
                summary: lessonData.summary || null,
                reflection: lessonData.reflection || null,
                isCompleted: isCompleted,
                progress: progress,
                hasVideo: !!(lessonData.video && lessonData.video.url),
                hasNotes: !!(lessonData.notes && lessonData.notes.keyPoints && lessonData.notes.keyPoints.length),
                hasFlashcards: !!(lessonData.flashcards && lessonData.flashcards.length),
                hasPractice: !!(lessonData.practice && lessonData.practice.enabled),
                hasAI: !!(lessonData.aiTools && lessonData.aiTools.length),
                hasSummary: !!(lessonData.summary && lessonData.summary.keyTakeaways && lessonData.summary.keyTakeaways.length)
            };
        },

        startPractice: async function(lessonId, type) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                console.warn('[ExperienceManager] PracticeModule not available');
                return null;
            }

            try {
                var practice = await practiceModule.startPractice(lessonId, type);
                if (practice) {
                    this._emit('PRACTICE_STARTED', {
                        lessonId: lessonId,
                        practiceId: practice.practiceId,
                        type: type
                    });
                }
                return practice;
            } catch (e) {
                console.warn('[ExperienceManager] Failed to start practice:', e);
                return null;
            }
        },

        submitPracticeAnswer: function(practice, userAnswer, questionIndex) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                console.warn('[ExperienceManager] PracticeModule not available');
                return null;
            }

            var result = practiceModule.submitAnswer ? practiceModule.submitAnswer(practice, userAnswer, questionIndex) : null;
            if (result) {
                this._emit('PRACTICE_ANSWER_SUBMITTED', {
                    practiceId: practice.practiceId,
                    correct: result.correct,
                    isComplete: result.isComplete,
                    score: result.score,
                    total: result.total
                });
            }
            return result;
        },

        getPracticeStatus: function(practice) {
            var practiceModule = window.LawAIApp && window.LawAIApp.PracticeModule;
            if (!practiceModule) {
                return { exists: false, progress: 0, completed: false };
            }
            return practiceModule.getStatus ? practiceModule.getStatus(practice) : { exists: false, progress: 0, completed: false };
        },

        // ============================================================
        // 2. PRIVATE — Layer Initialization
        // ============================================================

        _initLayers: function() {
            console.log('[AcademyExperienceManager] Initializing layers...');

            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (schoolRegistry && !schoolRegistry.initialized) {
                if (typeof schoolRegistry.initialize === 'function') {
                    schoolRegistry.initialize();
                }
            }

            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (programRegistry && !programRegistry.initialized) {
                if (typeof programRegistry.initialize === 'function') {
                    programRegistry.initialize();
                }
            }

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (courseRegistry && !courseRegistry.initialized) {
                if (typeof courseRegistry.initialize === 'function') {
                    courseRegistry.initialize();
                }
            }

            var curriculumRegistry = window.LawAIApp && window.LawAIApp.CurriculumRegistry;
            if (curriculumRegistry && typeof curriculumRegistry.init === 'function') {
                curriculumRegistry.init();
            }

            // 🔥 确保 SchoolRegistry 有数据
            var existingSchools = this._getSchools();
            if (!existingSchools || existingSchools.length === 0) {
                console.warn('[AcademyExperienceManager] No schools found, using fallback data');
                // 注入 fallback 到 window
                if (!window.LawAIApp) window.LawAIApp = {};
                if (!window.LawAIApp.SchoolRegistry) {
                    window.LawAIApp.SchoolRegistry = {
                        schools: FALLBACK_SCHOOLS,
                        getAllSchools: function() { return this.schools; },
                        getSchool: function(id) {
                            return this.schools.find(function(s) { return s.id === id; });
                        },
                        getProgramsBySchool: function(schoolId) {
                            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
                            if (programRegistry && typeof programRegistry.getProgramsBySchool === 'function') {
                                return programRegistry.getProgramsBySchool(schoolId);
                            }
                            return [];
                        }
                    };
                    console.log('[AcademyExperienceManager] ✅ Created fallback SchoolRegistry with ' + FALLBACK_SCHOOLS.length + ' schools');
                }
            }

            console.log('[AcademyExperienceManager] ✅ Layers initialized');
        },

        // ============================================================
        // 3. PRIVATE — Data Access
        // ============================================================

        _getRenderData: function() {
            return {
                schools: this._getSchools(),
                programs: this._getPrograms(),
                courses: this._getCourses(),
                progress: this._getProgress(),
                currentSchoolId: this._state.currentSchoolId,
                currentProgramId: this._state.currentProgramId,
                currentCourseId: this._state.currentCourseId,
                currentModuleId: this._state.currentModuleId,
                currentSubjectId: this._state.currentSubjectId,
                currentLessonId: this._state.currentLessonId,
                viewMode: this._state.viewMode
            };
        },

        _getSchools: function() {
            var registry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            if (registry) {
                if (typeof registry.getAllSchools === 'function') {
                    var schools = registry.getAllSchools();
                    if (schools && schools.length > 0) {
                        return schools;
                    }
                }
                if (typeof registry.getAll === 'function') {
                    var schools = registry.getAll();
                    if (schools && schools.length > 0) {
                        return schools;
                    }
                }
                if (registry.schools && Array.isArray(registry.schools) && registry.schools.length > 0) {
                    return registry.schools;
                }
            }

            // 🔥 FALLBACK: 返回预定义数据
            console.warn('[AcademyExperienceManager] No schools in registry, using fallback');
            return FALLBACK_SCHOOLS;
        },

        _getPrograms: function() {
            var registry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            if (registry) {
                if (typeof registry.getAllPrograms === 'function') {
                    var programs = registry.getAllPrograms();
                    if (programs && programs.length > 0) {
                        return programs;
                    }
                }
                if (registry.programs && Array.isArray(registry.programs) && registry.programs.length > 0) {
                    return registry.programs;
                }
            }
            return [];
        },

        _getCourses: function() {
            var registry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            if (registry) {
                if (typeof registry.getAllCourses === 'function') {
                    var courses = registry.getAllCourses();
                    if (courses && courses.length > 0) {
                        return courses;
                    }
                }
            }
            return [];
        },

        _getProgress: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.getState === 'function') {
                return adapter.getState();
            }

            var stateManager = window.LawAIApp && window.LawAIApp.LearningStateManager;
            if (stateManager && typeof stateManager.getState === 'function') {
                return stateManager.getState();
            }

            return null;
        },

        _getContinueLearning: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (adapter && typeof adapter.getContinueLearning === 'function') {
                return adapter.getContinueLearning();
            }
            return null;
        },

        _getLearningGuidance: function() {
            var guidance = window.LawAIApp && window.LawAIApp.LearningGuidance;
            if (guidance && typeof guidance.getCurrentGuidance === 'function') {
                return guidance.getCurrentGuidance();
            }
            return null;
        },

        // ============================================================
        // 4. PRIVATE — Container
        // ============================================================

        _createContainer: function() {
            var container = document.createElement('div');
            container.id = 'academy-root';
            container.style.cssText = 'min-height: 100vh; background: #0b1220;';
            document.body.appendChild(container);
            console.log('[AcademyExperienceManager] ✅ Created #academy-root');
            return container;
        },

        // ============================================================
        // 5. PRIVATE — Fallback Render
        // ============================================================

        _renderFallback: function(container, data) {
            var viewMode = data.viewMode || 'dashboard';

            if (viewMode === 'school') {
                this._renderSchoolViewFallback(container, data.currentSchoolId);
            } else if (viewMode === 'program') {
                this._renderProgramViewFallback(container, data.currentProgramId);
            } else if (viewMode === 'course') {
                this._renderCourseViewFallback(container, data.currentCourseId);
            } else if (viewMode === 'course-learning') {
                this._renderCourseLearningViewFallback(container, data.currentCourseId);
            } else {
                this._renderDashboardFallback(container, data);
            }
        },

        _renderDashboardFallback: function(container, data) {
            var schools = data.schools || [];
            var continueData = this._getContinueLearning();

            // 🔥 如果 schools 为空，使用 fallback
            if (!schools || schools.length === 0) {
                schools = FALLBACK_SCHOOLS;
            }

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <a href="/" style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); text-decoration: none; font-family: inherit;">
                        <span style="font-size:16px;">🏠</span> Dashboard
                    </a>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">🏛️ Law AI Academy</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px 0;">Explore your learning path</p>
            `;

            if (continueData) {
                html += this._renderContinueLearningFallback(continueData);
            }

            if (schools && schools.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">🎓 Schools</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < schools.length; i++) {
                    var school = schools[i];
                    var progCount = school.programs ? school.programs.length : 0;
                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToSchool('${school.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="font-size: 32px; margin-bottom: 6px;">${school.icon || '🏛️'}</div>
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${school.name}</h3>
                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${school.description || ''}</p>
                            <span style="color: #4a9eff; font-size: 13px;">${progCount} programs</span>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                        <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px 0;">Welcome to Law AI Academy</h2>
                        <p style="color: #94a3b8; font-size: 15px; margin: 0;">Schools and programs will appear here soon</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderContinueLearningFallback: function(continueData) {
            var progress = continueData.progress || 0;
            var isCompleted = continueData.isCompleted || false;

            return `
                <div style="background: linear-gradient(135deg, rgba(74,158,255,0.08) 0%, rgba(74,158,255,0.02) 100%); 
                            border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; 
                            border: 1px solid rgba(74,158,255,0.12);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${isCompleted ? '🎉' : '📖'}</span>
                            <div>
                                <div style="font-size: 13px; color: #94a3b8;">${isCompleted ? 'Completed Course' : 'Continue Learning'}</div>
                                <div style="font-size: 15px; font-weight: 500;">${continueData.title || 'Your Journey'}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div style="text-align: right;">
                                <div style="font-size: 13px; color: #94a3b8;">${isCompleted ? '✅ Done' : progress + '% complete'}</div>
                            </div>
                            <button onclick="window.LawAIApp.AcademyExperienceManager.startCourse('${continueData.courseId}')" 
                                    style="padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                    onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                ${isCompleted ? 'Review →' : 'Continue →'}
                            </button>
                        </div>
                    </div>
                    ${!isCompleted ? `
                        <div style="margin-top: 10px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: #4a9eff; height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        _renderSchoolViewFallback: function(container, schoolId) {
            var schoolRegistry = window.LawAIApp && window.LawAIApp.SchoolRegistry;
            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;

            var school = schoolRegistry && schoolRegistry.getSchool ? schoolRegistry.getSchool(schoolId) : null;
            // 如果 school 不存在，从 fallback 中查找
            if (!school) {
                school = FALLBACK_SCHOOLS.find(function(s) { return s.id === schoolId; });
            }
            var programs = programRegistry && programRegistry.getProgramsBySchool ? programRegistry.getProgramsBySchool(schoolId) : [];

            if (!school) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>School not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Academy
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">${school.icon || '🏛️'}</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${school.name}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${school.description || ''}</p>
                        </div>
                    </div>
            `;

            if (programs && programs.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📚 Programs (${programs.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < programs.length; i++) {
                    var program = programs[i];
                    var levelLabel = program.level || 'beginner';
                    var levelColor = levelLabel === 'beginner' ? '#10b981' : levelLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
                    var levelEmoji = levelLabel === 'beginner' ? '🟢' : levelLabel === 'intermediate' ? '🟡' : '🔴';
                    var moduleCount = program.modules ? program.modules.length : 0;

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToProgram('${program.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${program.name}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${program.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${levelColor}; font-size: 12px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${levelEmoji} ${levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1)}</span>
                                        <span style="color: #64748b; font-size: 12px;">${moduleCount} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 18px;">→</span>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>No programs available for this school yet.</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderProgramViewFallback: function(container, programId) {
            var programRegistry = window.LawAIApp && window.LawAIApp.ProgramRegistry;
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;

            var program = programRegistry && programRegistry.getProgram ? programRegistry.getProgram(programId) : null;
            var courses = courseRegistry && courseRegistry.getCoursesByProgram ? courseRegistry.getCoursesByProgram(programId) : [];

            if (!program) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Program not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var levelLabel = program.level || 'beginner';
            var levelColor = levelLabel === 'beginner' ? '#10b981' : levelLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
            var levelEmoji = levelLabel === 'beginner' ? '🟢' : levelLabel === 'intermediate' ? '🟡' : '🔴';
            var statusLabel = program.status || 'active';
            var statusColor = statusLabel === 'active' ? '#10b981' : statusLabel === 'draft' ? '#f59e0b' : '#64748b';
            var moduleCount = program.modules ? program.modules.length : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToSchool('${program.schoolId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to School
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">📚</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${program.name}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${program.description || ''}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${levelColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${levelEmoji} ${levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1)}</span>
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${moduleCount} modules</span>
                    </div>
            `;

            if (courses && courses.length > 0) {
                html += `<h2 style="font-size: 18px; font-weight: 600; margin: 24px 0 16px 0;">📖 Courses (${courses.length})</h2>`;
                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">`;

                for (var i = 0; i < courses.length; i++) {
                    var course = courses[i];
                    var courseStatus = course.status || 'active';
                    var courseStatusColor = courseStatus === 'active' ? '#10b981' : courseStatus === 'draft' ? '#f59e0b' : '#64748b';
                    var courseModuleCount = course.modules ? course.modules.length : 0;

                    html += `
                        <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                             onclick="window.LawAIApp.AcademyExperienceManager.navigateToCourse('${course.id}')"
                             onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                                <div>
                                    <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${course.title}</h3>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">${course.description || ''}</p>
                                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                        <span style="color: ${courseStatusColor}; font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${courseStatus}</span>
                                        <span style="color: #64748b; font-size: 11px;">${courseModuleCount} modules</span>
                                    </div>
                                </div>
                                <span style="color: #4a9eff; font-size: 16px;">→</span>
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            } else {
                html += `
                    <div style="text-align: center; padding: 40px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; margin-top: 16px;">
                        <p>📝 No courses available for this program yet.</p>
                        <p style="font-size: 13px;">Content is being prepared</p>
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderCourseViewFallback: function(container, courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var difficultyLabel = course.difficulty || 'beginner';
            var difficultyColor = difficultyLabel === 'beginner' ? '#10b981' : difficultyLabel === 'intermediate' ? '#f59e0b' : '#ef4444';
            var difficultyEmoji = difficultyLabel === 'beginner' ? '🟢' : difficultyLabel === 'intermediate' ? '🟡' : '🔴';
            var statusLabel = course.status || 'active';
            var statusColor = statusLabel === 'active' ? '#10b981' : statusLabel === 'draft' ? '#f59e0b' : '#64748b';
            var moduleCount = course.modules ? course.modules.length : 0;

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var courseState = adapter && adapter.getCourseState ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToProgram('${course.programId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Program
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 48px;">📖</span>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                        <span style="color: ${difficultyColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${difficultyEmoji} ${difficultyLabel.charAt(0).toUpperCase() + difficultyLabel.slice(1)}</span>
                        <span style="color: ${statusColor}; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                        <span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">${moduleCount} modules</span>
                        ${course.estimatedHours ? `<span style="color: #64748b; font-size: 13px; background: rgba(255,255,255,0.06); padding: 2px 12px; border-radius: 12px;">⏱️ ${course.estimatedHours}h</span>` : ''}
                    </div>
            `;

            var completedLessons = courseState && courseState.completedLessons ? courseState.completedLessons.length : 0;
            html += `
                <div style="margin-top: 24px; background: rgba(74,158,255,0.04); border-radius: 12px; padding: 20px; border: 1px solid rgba(74,158,255,0.08);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="font-size: 13px; color: #94a3b8;">📊 Your Progress</div>
                            <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${progress}%</div>
                            <div style="font-size: 12px; color: #64748b;">${completedLessons} lessons completed</div>
                        </div>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.startCourse('${courseId}')" 
                                style="padding: 12px 32px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                                onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                            ${progress > 0 ? '📖 Continue Learning' : '🚀 Start Learning'}
                        </button>
                    </div>
                    ${progress > 0 ? `
                        <div style="margin-top: 12px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.5s;"></div>
                        </div>
                    ` : ''}
                </div>
            `;

            html += `
                <div style="margin-top: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Modules</h2>
                    <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                        <div style="font-size: 36px; margin-bottom: 12px;">📝</div>
                        <p style="font-size: 16px; margin: 0;">Course modules are being prepared</p>
                        <p style="font-size: 13px; margin: 4px 0 0;">Check back soon for lessons</p>
                    </div>
                </div>
            `;

            html += `</div>`;
            container.innerHTML = html;
        },

        _renderCourseLearningViewFallback: function(container, courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;

            if (!course) {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #94a3b8;">
                        <p>Course not found</p>
                        <button onclick="window.LawAIApp.AcademyExperienceManager.goHome()" 
                                style="margin-top: 16px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
                            ← Back to Academy
                        </button>
                    </div>
                `;
                return;
            }

            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            var state = adapter && adapter.getState ? adapter.getState() : null;
            var progress = state ? state.progress : 0;

            var html = '';

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 0 16px 0; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                    <button onclick="window.LawAIApp.AcademyExperienceManager.navigateToCourse('${courseId}')" 
                            style="display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; background: rgba(74,158,255,0.1); color: #4a9eff; border: 1px solid rgba(74,158,255,0.15); font-family: inherit;">
                        <span style="font-size:16px;">←</span> Back to Course
                    </button>
                    <span style="color: #64748b; font-size: 13px; margin-left: auto;">📖 Learning Mode</span>
                </div>
            `;

            html += `
                <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 8px;">
                        <span style="font-size: 40px;">📖</span>
                        <div>
                            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${course.title}</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${course.description || ''}</p>
                        </div>
                    </div>

                    <div style="margin-top: 16px; background: rgba(74,158,255,0.06); border-radius: 8px; padding: 12px 16px; border: 1px solid rgba(74,158,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <span style="color: #94a3b8; font-size: 13px;">📊 Learning Progress</span>
                            <span style="color: #4a9eff; font-weight: 600;">${progress}%</span>
                        </div>
                        <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, progress)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>

                    <div style="margin-top: 24px;">
                        <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">📋 Course Modules</h2>
                        <div style="text-align: center; padding: 60px 20px; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.08);">
                            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                            <p style="font-size: 16px; margin: 0; font-weight: 500;">Learning modules are being prepared</p>
                            <p style="font-size: 14px; margin: 4px 0 0; color: #94a3b8;">Module and lesson content coming soon</p>
                            <p style="font-size: 13px; margin: 8px 0 0; color: #64748b;">Check back for updates</p>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        },

        // ============================================================
        // 6. PRIVATE — View Model Preparation
        // ============================================================

        _prepareMotivationViewModel: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                return {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    achievements: [],
                    achievementCount: 0,
                    nextLevelXp: 0,
                    xpProgress: 0
                };
            }

            var motivation = adapter.getLearningMotivation ? adapter.getLearningMotivation() : null;
            if (!motivation) {
                return {
                    xp: 0,
                    level: 1,
                    streak: 0,
                    achievements: [],
                    achievementCount: 0,
                    nextLevelXp: 0,
                    xpProgress: 0
                };
            }

            return {
                xp: motivation.xp || 0,
                level: motivation.level || 1,
                streak: motivation.streak || 0,
                achievements: motivation.achievements || [],
                achievementCount: motivation.achievementCount || 0,
                nextLevelXp: motivation.nextLevelXp || 0,
                xpProgress: motivation.xpProgress || 0
            };
        },

        _prepareContinueLearningViewModel: function() {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;
            if (!adapter) {
                return {
                    courseId: null,
                    title: '',
                    progress: 0,
                    isCompleted: false,
                    lastActivity: null,
                    lessonId: null,
                    moduleId: null,
                    hasActiveSession: false
                };
            }

            var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;
            if (!continueData || !continueData.courseId) {
                return {
                    courseId: null,
                    title: '',
                    progress: 0,
                    isCompleted: false,
                    lastActivity: null,
                    lessonId: null,
                    moduleId: null,
                    hasActiveSession: false
                };
            }

            var hasActiveSession = adapter.hasActiveSession ? adapter.hasActiveSession() : false;

            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(continueData.courseId) : null;
            var title = course ? (course.title || course.name || continueData.title) : (continueData.title || 'Your Course');

            return {
                courseId: continueData.courseId,
                title: title,
                progress: continueData.progress || 0,
                isCompleted: continueData.isCompleted || false,
                lastActivity: continueData.lastActivity || null,
                lessonId: continueData.lessonId || null,
                moduleId: continueData.moduleId || null,
                hasActiveSession: hasActiveSession
            };
        },

        _prepareDashboardViewModel: function() {
            var schools = this._getSchools();
            var continueData = this._prepareContinueLearningViewModel();
            var motivation = this._prepareMotivationViewModel();
            var guidance = this._getLearningGuidance();

            return {
                schools: schools,
                viewMode: this._state.viewMode || 'dashboard',
                continueLearning: continueData,
                motivation: motivation,
                guidance: guidance,
                hasContinueLearning: continueData.courseId !== null,
                hasSchools: schools && schools.length > 0
            };
        },

        _prepareCourseViewData: function(courseId) {
            var courseRegistry = window.LawAIApp && window.LawAIApp.CourseRegistry;
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var course = courseRegistry && courseRegistry.getCourse ? courseRegistry.getCourse(courseId) : null;
            if (!course) {
                return {
                    course: null,
                    modules: [],
                    progress: 0,
                    isCompleted: false,
                    currentModuleId: null,
                    currentLessonId: null
                };
            }

            var courseState = adapter && adapter.getCourseState ? adapter.getCourseState(courseId) : null;
            var progress = courseState ? courseState.progress : 0;
            var isCompleted = courseState ? courseState.isCompleted : false;
            var modules = adapter && adapter.getCourseModules ? adapter.getCourseModules(courseId) : [];

            return {
                course: course,
                modules: modules,
                progress: progress,
                isCompleted: isCompleted,
                currentModuleId: this._state.currentModuleId || null,
                currentLessonId: this._state.currentLessonId || null
            };
        },

        _prepareModuleViewData: function(moduleId) {
            var academyRegistry = window.LawAIApp && window.LawAIApp.AcademyRegistry;
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var module = academyRegistry && academyRegistry.getModule ? academyRegistry.getModule(moduleId) : null;
            if (!module) {
                return {
                    module: null,
                    lessons: [],
                    progress: 0,
                    isCompleted: false,
                    currentLessonId: null
                };
            }

            var progressData = adapter && adapter.getModuleProgress ? adapter.getModuleProgress(moduleId) : { progress: 0, completed: false };
            var lessons = adapter && adapter.getModuleLessons ? adapter.getModuleLessons(moduleId) : [];

            return {
                module: module,
                lessons: lessons,
                progress: progressData.progress || 0,
                isCompleted: progressData.completed || false,
                currentLessonId: this._state.currentLessonId || null
            };
        },

        _prepareLessonViewData: function(lessonId) {
            var adapter = window.LawAIApp && window.LawAIApp.LearningJourneyAdapter;

            var lesson = adapter && adapter.getLessonDetail ? adapter.getLessonDetail(lessonId) : null;
            if (!lesson) {
                return {
                    lesson: null,
                    isCompleted: false,
                    session: null
                };
            }

            var isCompleted = lesson.isCompleted || false;
            var session = adapter && adapter.getActiveSession ? adapter.getActiveSession() : null;

            return {
                lesson: lesson,
                isCompleted: isCompleted,
                session: session
            };
        },

        _validateViewModel: function(viewModel, expectedKeys) {
            if (!viewModel || typeof viewModel !== 'object') {
                console.warn('[ExperienceManager] Invalid ViewModel: not an object');
                return false;
            }

            var missingKeys = [];
            for (var i = 0; i < expectedKeys.length; i++) {
                var key = expectedKeys[i];
                if (!(key in viewModel)) {
                    missingKeys.push(key);
                }
            }

            if (missingKeys.length > 0) {
                console.warn('[ExperienceManager] ViewModel missing keys:', missingKeys);
                return false;
            }

            return true;
        },

        _normalizeProgress: function(value) {
            if (typeof value !== 'number' || isNaN(value)) {
                return 0;
            }
            if (value < 0) return 0;
            if (value > 100) return 100;
            return Math.round(value);
        },

        _normalizeBoolean: function(value) {
            return value === true || value === 'true' || value === 1;
        },

        _getViewModelDiagnostics: function() {
            var diagnostics = {
                viewModels: {},
                errors: [],
                warnings: []
            };

            try {
                var dashboardVM = this._prepareDashboardViewModel();
                var dashboardKeys = ['schools', 'viewMode', 'continueLearning', 'motivation', 'guidance'];
                var isValid = this._validateViewModel(dashboardVM, dashboardKeys);
                diagnostics.viewModels.dashboard = {
                    valid: isValid,
                    hasData: !!(dashboardVM.schools && dashboardVM.schools.length > 0)
                };
            } catch (e) {
                diagnostics.errors.push('Dashboard VM error: ' + e.message);
            }

            try {
                var motivationVM = this._prepareMotivationViewModel();
                var motivationKeys = ['xp', 'level', 'streak', 'achievements', 'achievementCount', 'nextLevelXp', 'xpProgress'];
                var isValid = this._validateViewModel(motivationVM, motivationKeys);
                diagnostics.viewModels.motivation = {
                    valid: isValid,
                    xp: motivationVM.xp || 0,
                    level: motivationVM.level || 0
                };
            } catch (e) {
                diagnostics.errors.push('Motivation VM error: ' + e.message);
            }

            try {
                var continueVM = this._prepareContinueLearningViewModel();
                var continueKeys = ['courseId', 'title', 'progress', 'isCompleted', 'lastActivity', 'lessonId', 'moduleId', 'hasActiveSession'];
                var isValid = this._validateViewModel(continueVM, continueKeys);
                diagnostics.viewModels.continueLearning = {
                    valid: isValid,
                    hasCourse: !!(continueVM.courseId),
                    progress: continueVM.progress || 0
                };
            } catch (e) {
                diagnostics.errors.push('Continue Learning VM error: ' + e.message);
            }

            return diagnostics;
        },

        // ============================================================
        // 7. PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            console.log('[AcademyExperienceManager] Binding events...');

            var self = this;

            document.addEventListener('ACADEMY_READY', function() {
                console.log('[AcademyExperienceManager] 📡 ACADEMY_READY received');
                if (!self.initialized) {
                    self.init();
                } else {
                    self.refresh();
                }
            });

            document.addEventListener('SCHOOL_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('PROGRAM_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('COURSE_REGISTERED', function() {
                self.refresh();
            });

            document.addEventListener('LEARNING_STATE_UPDATED', function() {
                console.log('[AcademyExperienceManager] 📡 LEARNING_STATE_UPDATED received, refreshing...');
                self.refresh();
            });

            console.log('[AcademyExperienceManager] ✅ Events bound');
        },

        // ============================================================
        // 8. PRIVATE — Event Helpers
        // ============================================================

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp && window.LawAIApp.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
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

    window.LawAIApp.AcademyExperienceManager = AcademyExperienceManager;

    console.log('[AcademyExperienceManager] Module loaded (v6.2.1)');

    // 自动初始化
    function autoInit() {
        if (document.getElementById('academy-root')) {
            AcademyExperienceManager.init();
        } else {
            var observer = new MutationObserver(function() {
                if (document.getElementById('academy-root')) {
                    observer.disconnect();
                    AcademyExperienceManager.init();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
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
