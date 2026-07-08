// ===========================================
// careerEngine.js
// 职业智能引擎 - 职业发展洞察（Phase 35 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CareerEngine = (function() {
    var _initialized = false;
    var _careers = {};

    // ===========================================
    // 职业定义
    // ===========================================
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
        }
    ];

    // ===========================================
    // 职业管理
    // ===========================================
    function getAllCareers() {
        _sync();
        return Object.values(_careers);
    }

    function getCareer(careerId) {
        _sync();
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

    // ===========================================
    // 职业分析
    // ===========================================
    function getReadiness(careerId) {
        var career = getCareer(careerId);
        if (!career) return 0;
        
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var skills = LawAIApp.SkillEngine?.getAll?.() || [];
        
        // 检查课程完成度
        var lessonProgress = Math.min(100, (completed.length / (career.requiredLessons || 1)) * 100);
        
        // 检查技能掌握度
        var skillProgress = 0;
        var requiredSkills = career.requiredSkills || [];
        if (requiredSkills.length > 0) {
            var matchedSkills = skills.filter(function(s) {
                return requiredSkills.some(function(r) {
                    return s.title.indexOf(r) !== -1 || r.indexOf(s.title) !== -1;
                });
            });
            var avgMastery = matchedSkills.length > 0 ?
                matchedSkills.reduce(function(sum, s) { return sum + s.mastery; }, 0) / matchedSkills.length : 0;
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
        
        // 基于准备度和项目经验计算信心
        var projectBoost = 0;
        var projects = LawAIApp.ProjectEngine?.getCompletedProjects?.() || [];
        var relatedProjects = projects.filter(function(p) {
            return (career.recommendedProjects || []).some(function(r) {
                return p.title.indexOf(r) !== -1;
            });
        });
        projectBoost = Math.min(30, relatedProjects.length * 10);
        
        return Math.min(100, readiness + projectBoost);
    }

    function getGapReport(careerId) {
        var career = getCareer(careerId);
        if (!career) return { gaps: [] };
        
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var skills = LawAIApp.SkillEngine?.getAll?.() || [];
        
        var gaps = [];
        var requiredSkills = career.requiredSkills || [];
        
        requiredSkills.forEach(function(reqSkill) {
            var matched = skills.filter(function(s) {
                return s.title.indexOf(reqSkill) !== -1 || reqSkill.indexOf(s.title) !== -1;
            });
            if (matched.length === 0 || (matched.length > 0 && matched[0].mastery < 40)) {
                gaps.push({
                    skill: reqSkill,
                    reason: 'Not yet mastered',
                    recommendation: 'Focus on lessons related to ' + reqSkill
                });
            }
        });
        
        // 检查课程缺口
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

    function generateRoadmap(careerId) {
        var career = getCareer(careerId);
        if (!career) return null;
        
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var requiredLessons = career.requiredLessons || 50;
        
        var roadmap = {
            careerId: careerId,
            careerName: career.careerName,
            steps: [],
            estimatedDuration: career.estimatedLearningHours || 100
        };
        
        // 生成步骤
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

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('careers');
            if (stored) {
                _careers = stored;
                return;
            }
        } catch (e) {}
        
        // 初始化默认职业
        DEFAULT_CAREERS.forEach(function(c) {
            _careers[c.careerId] = c;
        });
        _saveCareers();
    }

    function _saveCareers() {
        try {
            LawAIApp.StorageEngine?.set?.('careers', _careers);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        
        // 监听事件更新职业统计
        LawAIApp.EventBus?.on?.('SkillUpdated', function(data) {
            var careers = getAllCareers();
            careers.forEach(function(c) {
                var readiness = getReadiness(c.careerId);
                var confidence = getConfidence(c.careerId);
                setCareer({ careerId: c.careerId, careerReadiness: readiness, careerConfidence: confidence });
            });
        });
        
        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            var careers = getAllCareers();
            careers.forEach(function(c) {
                var readiness = getReadiness(c.careerId);
                setCareer({ careerId: c.careerId, careerReadiness: readiness });
            });
        });
        
        console.log('💼 CareerEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getCareers: getAllCareers,
        getCareer: getCareer,
        setCareer: setCareer,
        getReadiness: getReadiness,
        getConfidence: getConfidence,
        getGapReport: getGapReport,
        getRoadmap: generateRoadmap
    };
})();

console.log('💼 CareerEngine V2.0 ready');
