// ================================================================
// ENGINE: CareerEngine
// LAYER: Core Logic Layer
// DOMAIN: Career Development Tracking & Intelligence
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 3.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Tracks career development, job readiness, and professional growth.
//   Maps learning progress to career opportunities.
//   Provides career intelligence, roadmaps, and gap analysis.
//
// PUBLIC API
// ================================================================
//   init()                              -> void
//   setCareerGoal(goal)                 -> void
//   getCareerGoal()                     -> object
//   addMilestone(milestone)             -> void
//   getMilestones()                     -> array
//   getCareerReadiness()                -> object
//   getSkillGap()                       -> array
//   getStatus()                         -> Status object
//   getCareers()                        -> array
//   getCareer(careerId)                 -> object
//   setCareer(def)                      -> object
//   getReadiness(careerId)              -> number
//   getConfidence(careerId)             -> number
//   getGapReport(careerId)              -> object
//   getRoadmap(careerId)                -> object
//   getCareerPaths()                    -> object
//   getRecommendedCareer()              -> object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - ProgressEngine (required) : For progress data
//   - SkillEngine (required) : For skill mastery
//   - ProjectEngine (optional) : For project tracking
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_career_data' (user progress)
//   - Key: 'lawai_careers' (career definitions)
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'CareerGoalSet'     : When career goal is set
//   - 'MilestoneAdded'    : When a milestone is added
//   - 'CareerUpdated'     : When career data changes
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CareerEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'CareerEngine';
    var _engineVersion = '3.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Career Development Tracking & Intelligence';

    var _initialized = false;
    
    // ============================================================
    // CAREER DATA (User Progress)
    // ============================================================
    var _careerData = {
        goal: null,
        milestones: [],
        skills: [],
        interests: [],
        readiness: {
            score: 0,
            level: 'Exploring',
            strengths: [],
            gaps: []
        }
    };

    // ============================================================
    // CAREER PATHS (A版 - 保留)
    // ============================================================
    var _careerPaths = {
        'ai_engineer': {
            title: 'AI Engineer',
            requiredSkills: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps'],
            recommendedCourses: ['day-1', 'day-10', 'day-25', 'day-50', 'day-100'],
            level: 'Advanced'
        },
        'data_scientist': {
            title: 'Data Scientist',
            requiredSkills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization', 'Big Data'],
            recommendedCourses: ['day-1', 'day-15', 'day-30', 'day-60', 'day-90'],
            level: 'Advanced'
        },
        'ml_engineer': {
            title: 'ML Engineer',
            requiredSkills: ['Python', 'Machine Learning', 'MLOps', 'Cloud Computing', 'CI/CD', 'Docker'],
            recommendedCourses: ['day-1', 'day-20', 'day-45', 'day-70', 'day-120'],
            level: 'Advanced'
        },
        'ai_product_manager': {
            title: 'AI Product Manager',
            requiredSkills: ['AI Fundamentals', 'Product Management', 'User Research', 'Strategy', 'Communication'],
            recommendedCourses: ['day-1', 'day-5', 'day-40', 'day-80'],
            level: 'Intermediate'
        },
        'ai_researcher': {
            title: 'AI Researcher',
            requiredSkills: ['Mathematics', 'Statistics', 'Deep Learning', 'Research Methods', 'Python', 'Academic Writing'],
            recommendedCourses: ['day-1', 'day-30', 'day-60', 'day-120', 'day-200'],
            level: 'Advanced'
        }
    };

    // ============================================================
    // CAREER DEFINITIONS (B版 - 增强)
    // ============================================================
    var _careers = {};

    var DEFAULT_CAREERS = [
        {
            careerId: 'ai_engineer',
            careerName: 'AI Engineer',
            description: 'Build and deploy AI models and systems.',
            requiredSkills: ['Foundation', 'Prompt Engineering', 'AI Tools', 'Coding', 'AI Development'],
            requiredLessons: 50,
            recommendedProjects: ['AI-Powered Application'],
            estimatedLearningHours: 200,
            icon: '🤖',
            level: 'intermediate'
        },
        {
            careerId: 'prompt_engineer',
            careerName: 'Prompt Engineer',
            description: 'Design effective prompts for large language models.',
            requiredSkills: ['Foundation', 'Prompt Engineering'],
            requiredLessons: 20,
            recommendedProjects: ['Prompt Engineering Workshop'],
            estimatedLearningHours: 80,
            icon: '✍️',
            level: 'beginner'
        },
        {
            careerId: 'ai_product_manager',
            careerName: 'AI Product Manager',
            description: 'Lead AI product development from concept to launch.',
            requiredSkills: ['Foundation', 'AI Tools', 'AI Business'],
            requiredLessons: 40,
            recommendedProjects: ['AI Business Strategy'],
            estimatedLearningHours: 150,
            icon: '📊',
            level: 'intermediate'
        },
        {
            careerId: 'ai_researcher',
            careerName: 'AI Researcher',
            description: 'Explore cutting-edge AI research and development.',
            requiredSkills: ['Foundation', 'Coding', 'AI Development', 'Advanced Topics'],
            requiredLessons: 80,
            recommendedProjects: ['Research Paper Review'],
            estimatedLearningHours: 300,
            icon: '🔬',
            level: 'advanced'
        },
        {
            careerId: 'data_scientist',
            careerName: 'Data Scientist',
            description: 'Extract insights and build predictive models from data.',
            requiredSkills: ['Foundation', 'Coding', 'AI Development', 'Analytics'],
            requiredLessons: 60,
            recommendedProjects: ['Data Analysis Project'],
            estimatedLearningHours: 220,
            icon: '📈',
            level: 'intermediate'
        },
        {
            careerId: 'ml_engineer',
            careerName: 'ML Engineer',
            description: 'Deploy and scale machine learning models in production.',
            requiredSkills: ['Foundation', 'Coding', 'AI Development', 'AI Tools'],
            requiredLessons: 55,
            recommendedProjects: ['ML Pipeline Project'],
            estimatedLearningHours: 200,
            icon: '⚙️',
            level: 'advanced'
        }
    ];

    // ============================================================
    // PUBLIC API - A版 (保留)
    // ============================================================

    function init() {
        if (_initialized) return;
        _initialized = true;

        // 从 Storage 恢复用户数据
        var saved = _safeGet('career_data', null);
        if (saved) {
            _careerData = { ..._careerData, ...saved };
        }

        // 同步职业定义
        _syncCareers();

        console.log('💼 CareerEngine v' + _engineVersion + ' initialized');
    }

    function setCareerGoal(goal) {
        if (!goal || !goal.path) {
            console.warn('⚠️ Invalid career goal');
            return;
        }

        var pathData = _careerPaths[goal.path];
        if (!pathData) {
            console.warn('⚠️ Career path not found:', goal.path);
            return;
        }

        _careerData.goal = {
            path: goal.path,
            title: pathData.title,
            targetLevel: goal.targetLevel || pathData.level,
            targetDate: goal.targetDate || null,
            setDate: new Date().toISOString(),
            requiredSkills: pathData.requiredSkills.slice(),
            recommendedCourses: pathData.recommendedCourses.slice()
        };

        _save();
        
        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (eventBus && typeof eventBus.emit === 'function') {
            eventBus.emit('CareerGoalSet', { goal: _careerData.goal });
        }

        console.log('💼 Career goal set:', pathData.title);
    }

    function getCareerGoal() {
        return _careerData.goal || null;
    }

    function addMilestone(milestone) {
        if (!milestone || !milestone.title) {
            console.warn('⚠️ Invalid milestone');
            return;
        }

        var entry = {
            id: 'milestone_' + Date.now(),
            title: milestone.title,
            description: milestone.description || '',
            date: new Date().toISOString(),
            achieved: milestone.achieved || false,
            type: milestone.type || 'learning'
        };

        _careerData.milestones.push(entry);
        _save();

        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (eventBus && typeof eventBus.emit === 'function') {
            eventBus.emit('MilestoneAdded', { milestone: entry });
        }

        console.log('💼 Milestone added:', entry.title);
        return entry;
    }

    function getMilestones() {
        return _careerData.milestones.slice();
    }

    function getCareerReadiness() {
        var goal = _careerData.goal;
        if (!goal) {
            return {
                score: 0,
                level: 'Exploring',
                strengths: [],
                gaps: ['Set a career goal to get started'],
                recommendations: ['Choose a career path to see your readiness']
            };
        }

        var progress = _getProgress();
        var requiredSkills = goal.requiredSkills || [];
        var learnedSkills = _careerData.skills || [];
        var matchedSkills = requiredSkills.filter(function(s) {
            return learnedSkills.some(function(ls) { return ls.name === s && ls.level >= 60; });
        });

        var strengths = matchedSkills.slice(0, 3);
        var gaps = requiredSkills.filter(function(s) {
            return !learnedSkills.some(function(ls) { return ls.name === s && ls.level >= 60; });
        });

        var score = Math.round((matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100);

        return {
            score: score,
            level: score >= 80 ? 'Ready' : score >= 50 ? 'Progressing' : 'Building',
            strengths: strengths,
            gaps: gaps,
            recommendations: gaps.length > 0 ? ['Focus on: ' + gaps.join(', ')] : ['You\'re ready to pursue this career path!']
        };
    }

    function getSkillGap() {
        var readiness = getCareerReadiness();
        return readiness.gaps || [];
    }

    function getStatus() {
        var goal = _careerData.goal;
        var readiness = getCareerReadiness();
        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            hasGoal: !!goal,
            goalTitle: goal ? goal.title : 'None',
            readinessScore: readiness.score,
            readinessLevel: readiness.level,
            milestoneCount: _careerData.milestones.length,
            careerCount: Object.keys(_careers).length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    function getCareerPaths() {
        return { ..._careerPaths };
    }

    // ============================================================
    // PUBLIC API - B版 (增强)
    // ============================================================

    function getCareers() {
        _syncCareers();
        return Object.values(_careers);
    }

    function getCareer(careerId) {
        _syncCareers();
        return _careers[careerId] || null;
    }

    function setCareer(def) {
        if (!def.careerId) return null;
        
        var career = getCareer(def.careerId);
        if (career) {
            career = { ...career, ...def, updatedAt: new Date().toISOString() };
        } else {
            career = {
                careerId: def.careerId,
                careerName: def.careerName || def.careerId,
                description: def.description || '',
                requiredSkills: def.requiredSkills || [],
                requiredLessons: def.requiredLessons || 0,
                recommendedProjects: def.recommendedProjects || [],
                estimatedLearningHours: def.estimatedLearningHours || 100,
                icon: def.icon || '💼',
                level: def.level || 'beginner',
                careerReadiness: 0,
                careerConfidence: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        
        _careers[career.careerId] = career;
        _saveCareers();
        return career;
    }

    function getReadiness(careerId) {
        var career = getCareer(careerId);
        if (!career) return 0;
        
        var progress = _getProgress();
        var completed = progress.completedLessons || [];
        var skills = _getSkills();
        
        var lessonProgress = Math.min(100, (completed.length / (career.requiredLessons || 1)) * 100);
        
        var skillProgress = 0;
        var requiredSkills = career.requiredSkills || [];
        if (requiredSkills.length > 0) {
            var matchedSkills = skills.filter(function(s) {
                return requiredSkills.some(function(r) {
                    return s.name && (s.name.indexOf(r) !== -1 || r.indexOf(s.name) !== -1);
                });
            });
            var avgMastery = matchedSkills.length > 0 ?
                matchedSkills.reduce(function(sum, s) { return sum + (s.mastery || 0); }, 0) / matchedSkills.length : 0;
            skillProgress = avgMastery;
        } else {
            skillProgress = 50;
        }
        
        var readiness = Math.round((lessonProgress * 0.5 + skillProgress * 0.5));
        return Math.min(100, readiness);
    }

    function getConfidence(careerId) {
        var readiness = getReadiness(careerId);
        var career = getCareer(careerId);
        if (!career) return 0;
        
        var projectBoost = 0;
        var projects = _getProjects();
        var relatedProjects = projects.filter(function(p) {
            return (career.recommendedProjects || []).some(function(r) {
                return p.title && p.title.indexOf(r) !== -1;
            });
        });
        projectBoost = Math.min(30, relatedProjects.length * 10);
        
        return Math.min(100, readiness + projectBoost);
    }

    function getGapReport(careerId) {
        var career = getCareer(careerId);
        if (!career) return { gaps: [] };
        
        var progress = _getProgress();
        var completed = progress.completedLessons || [];
        var skills = _getSkills();
        
        var gaps = [];
        var requiredSkills = career.requiredSkills || [];
        
        requiredSkills.forEach(function(reqSkill) {
            var matched = skills.filter(function(s) {
                return s.name && (s.name.indexOf(reqSkill) !== -1 || reqSkill.indexOf(s.name) !== -1);
            });
            if (matched.length === 0 || (matched.length > 0 && (matched[0].mastery || 0) < 40)) {
                gaps.push({
                    skill: reqSkill,
                    reason: 'Not yet mastered',
                    recommendation: 'Focus on lessons related to ' + reqSkill
                });
            }
        });
        
        var requiredLessons = career.requiredLessons || 0;
        if (completed.length < requiredLessons) {
            gaps.push({
                skill: 'Overall Progress',
                reason: 'Need ' + (requiredLessons - completed.length) + ' more lessons',
                recommendation: 'Complete ' + (requiredLessons - completed.length) + ' more lessons'
            });
        }
        
        return {
            careerId: careerId,
            careerName: career.careerName,
            gaps: gaps,
            ready: gaps.length === 0
        };
    }

    function getRoadmap(careerId) {
        var career = getCareer(careerId);
        if (!career) return null;
        
        var progress = _getProgress();
        var completed = progress.completedLessons || [];
        var requiredLessons = career.requiredLessons || 50;
        
        var roadmap = {
            careerId: careerId,
            careerName: career.careerName,
            steps: [],
            estimatedDuration: career.estimatedLearningHours || 100
        };
        
        var stepSize = Math.max(5, Math.floor(requiredLessons / 4));
        var milestones = ['Foundation', 'Intermediate', 'Advanced', 'Mastery'];
        
        for (var i = 0; i < milestones.length; i++) {
            var stepLessons = (i + 1) * stepSize;
            var status = completed.length >= stepLessons ? 'completed' : 'pending';
            roadmap.steps.push({
                name: milestones[i],
                lessonsRequired: stepLessons,
                status: status,
                progress: Math.min(100, (completed.length / stepLessons) * 100)
            });
        }
        
        return roadmap;
    }

    function getRecommendedCareer() {
        var careers = getCareers();
        var best = null;
        var bestScore = 0;
        
        for (var i = 0; i < careers.length; i++) {
            var c = careers[i];
            var readiness = getReadiness(c.careerId);
            if (readiness > bestScore) {
                bestScore = readiness;
                best = c;
            }
        }
        
        return best;
    }

    // ============================================================
    // PRIVATE METHODS
    // ============================================================

    function _getProgress() {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                return LawAIApp.ProgressEngine.getState();
            }
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                return LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}
        return { completedLessons: [], level: 1 };
    }

    function _getSkills() {
        try {
            if (LawAIApp.SkillEngine && typeof LawAIApp.SkillEngine.getAll === 'function') {
                return LawAIApp.SkillEngine.getAll();
            }
            if (LawAIApp.SkillEngine && typeof LawAIApp.SkillEngine.getSkills === 'function') {
                return LawAIApp.SkillEngine.getSkills();
            }
        } catch (e) {}
        return [];
    }

    function _getProjects() {
        try {
            if (LawAIApp.ProjectEngine && typeof LawAIApp.ProjectEngine.getCompletedProjects === 'function') {
                return LawAIApp.ProjectEngine.getCompletedProjects();
            }
            if (LawAIApp.ProjectEngine && typeof LawAIApp.ProjectEngine.getAll === 'function') {
                return LawAIApp.ProjectEngine.getAll();
            }
        } catch (e) {}
        return [];
    }

    function _syncCareers() {
        var stored = _safeGet('careers', null);
        if (stored) {
            _careers = stored;
            return;
        }
        
        // 初始化默认职业
        for (var i = 0; i < DEFAULT_CAREERS.length; i++) {
            var c = DEFAULT_CAREERS[i];
            _careers[c.careerId] = { ...c };
        }
        _saveCareers();
    }

    function _saveCareers() {
        _safeSet('careers', _careers);
    }

    function _save() {
        _safeSet('career_data', _careerData);
    }

    function _safeGet(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    function _safeSet(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    // ============================================================
    // AUTO-INIT & EVENT LISTENERS
    // ============================================================

    function _setupEventListeners() {
        var eventBus = LawAIApp.EventBus || window.eventBus;
        if (!eventBus || typeof eventBus.on !== 'function') return;

        eventBus.on('SkillUpdated', function(data) {
            var careers = getCareers();
            for (var i = 0; i < careers.length; i++) {
                var c = careers[i];
                var readiness = getReadiness(c.careerId);
                var confidence = getConfidence(c.careerId);
                setCareer({ careerId: c.careerId, careerReadiness: readiness, careerConfidence: confidence });
            }
        });
        
        eventBus.on('ProjectFinished', function() {
            var careers = getCareers();
            for (var i = 0; i < careers.length; i++) {
                var c = careers[i];
                var readiness = getReadiness(c.careerId);
                setCareer({ careerId: c.careerId, careerReadiness: readiness });
            }
        });

        eventBus.on('LessonCompleted', function() {
            var careers = getCareers();
            for (var i = 0; i < careers.length; i++) {
                var c = careers[i];
                var readiness = getReadiness(c.careerId);
                setCareer({ careerId: c.careerId, careerReadiness: readiness });
            }
        });
    }

    // ============================================================
    // PUBLIC API EXPOSURE
    // ============================================================

    var publicAPI = {
        // A版 API
        init: init,
        setCareerGoal: setCareerGoal,
        getCareerGoal: getCareerGoal,
        addMilestone: addMilestone,
        getMilestones: getMilestones,
        getCareerReadiness: getCareerReadiness,
        getSkillGap: getSkillGap,
        getStatus: getStatus,
        getCareerPaths: getCareerPaths,
        
        // B版 API
        getCareers: getCareers,
        getCareer: getCareer,
        setCareer: setCareer,
        getReadiness: getReadiness,
        getConfidence: getConfidence,
        getGapReport: getGapReport,
        getRoadmap: getRoadmap,
        getRecommendedCareer: getRecommendedCareer
    };

    // 自动初始化
    setTimeout(function() {
        publicAPI.init();
        _setupEventListeners();
    }, 300);

    return publicAPI;
})();

console.log('💼 CareerEngine V3.0 ready (Canon Locked)');
