// ===========================================
// projectEngine.js
// 项目引擎 - 学习成果凝结为项目（Phase 31 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ProjectEngine = (function() {
    var _initialized = false;
    var _projects = [];
    var _portfolio = [];

    // ===========================================
    // 项目管理
    // ===========================================
    function createProject(def) {
        var project = {
            projectId: 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: def.title || 'Learning Project',
            description: def.description || '',
            requiredLessons: def.requiredLessons || [],
            requiredSkills: def.requiredSkills || [],
            milestones: def.milestones || [],
            progress: {
                lessonsCompleted: 0,
                milestonesCompleted: 0,
                overall: 0
            },
            skills: def.skills || [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null
        };
        
        _projects.push(project);
        _saveProjects();
        LawAIApp.EventBus?.emit?.('ProjectCreated', { project: project });
        return project;
    }

    function getProject(projectId) {
        _sync();
        return _projects.find(function(p) { return p.projectId === projectId; }) || null;
    }

    function getActiveProjects() {
        _sync();
        return _projects.filter(function(p) { return p.status === 'active'; });
    }

    function getCompletedProjects() {
        _sync();
        return _projects.filter(function(p) { return p.status === 'completed'; });
    }

    function updateProgress(projectId, progressData) {
        var project = getProject(projectId);
        if (!project) return null;
        
        if (progressData.lessonsCompleted !== undefined) {
            project.progress.lessonsCompleted = progressData.lessonsCompleted;
        }
        if (progressData.milestonesCompleted !== undefined) {
            project.progress.milestonesCompleted = progressData.milestonesCompleted;
        }
        
        // 计算总体进度
        var totalRequired = project.requiredLessons.length || 1;
        project.progress.overall = Math.min(100, Math.round((project.progress.lessonsCompleted / totalRequired) * 100));
        
        // 检查是否完成
        if (project.progress.overall >= 100) {
            project.status = 'completed';
            project.completedAt = new Date().toISOString();
            LawAIApp.EventBus?.emit?.('ProjectFinished', { projectId: projectId, project: project });
            // 自动加入作品集
            addToPortfolio(projectId);
        }
        
        project.updatedAt = new Date().toISOString();
        _saveProjects();
        LawAIApp.EventBus?.emit?.('ProjectUpdated', { project: project });
        return project;
    }

    // ===========================================
    // 作品集管理
    // ===========================================
    function getPortfolio() {
        _syncPortfolio();
        return _portfolio;
    }

    function addToPortfolio(projectId) {
        var project = getProject(projectId);
        if (!project) return null;
        
        var entry = {
            projectId: project.projectId,
            title: project.title,
            description: project.description,
            skills: project.skills || [],
            completedAt: project.completedAt || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        _portfolio.push(entry);
        _savePortfolio();
        LawAIApp.EventBus?.emit?.('PortfolioUpdated', { entry: entry });
        return entry;
    }

    // ===========================================
    // 项目推荐
    // ===========================================
    function recommendProject() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var skills = getAvailableSkills();
        
        var projects = [];
        
        // 基础项目：根据完成度推荐
        if (completed.length < 10) {
            projects.push({
                title: 'AI Foundation Project',
                description: 'Create a simple AI-powered application using basic concepts.',
                requiredLessons: ['day-1', 'day-2', 'day-3', 'day-4', 'day-5'],
                difficulty: 'beginner'
            });
        }
        
        if (completed.length >= 10 && completed.length < 30) {
            projects.push({
                title: 'Prompt Engineering Workshop',
                description: 'Build a prompt library for different use cases.',
                requiredLessons: ['day-10', 'day-15', 'day-20', 'day-25', 'day-30'],
                difficulty: 'intermediate'
            });
        }
        
        if (completed.length >= 30) {
            projects.push({
                title: 'AI-Powered Application',
                description: 'Build a full-stack AI application using multiple AI tools.',
                requiredLessons: ['day-30', 'day-40', 'day-50', 'day-60', 'day-70'],
                difficulty: 'advanced'
            });
        }
        
        return projects[0] || { title: 'Custom Project', description: 'Create your own learning project.', difficulty: 'custom' };
    }

    function generateFromGoal(goalId) {
        var goal = LawAIApp.GoalEngine?.getGoal?.(goalId);
        if (!goal) return null;
        
        var project = {
            title: goal.title + ' Project',
            description: goal.description || 'Project based on learning goal',
            requiredLessons: goal.requiredLessons || [],
            requiredSkills: goal.skills || [],
            milestones: goal.milestones || [],
            goalId: goalId
        };
        
        return createProject(project);
    }

    // ===========================================
    // 反思
    // ===========================================
    function generateReflectionQuestions(projectId) {
        var project = getProject(projectId);
        if (!project) return [];
        
        return [
            'What was the most challenging part of this project?',
            'What skills did you develop during this project?',
            'How would you improve your approach next time?',
            'What did you learn that you didn\'t expect?',
            'How does this project relate to your learning goals?'
        ];
    }

    function saveReflection(projectId, answers) {
        try {
            LawAIApp.StorageEngine?.set?.('project_reflection_' + projectId, {
                projectId: projectId,
                answers: answers,
                savedAt: new Date().toISOString()
            });
            LawAIApp.EventBus?.emit?.('ReflectionSaved', { projectId: projectId });
            return true;
        } catch (e) {
            return false;
        }
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function getAvailableSkills() {
        var skills = [];
        try {
            var radar = LawAIApp.SkillEngine?.getRadar?.() || [];
            skills = radar.map(function(r) { return r.name; });
        } catch (e) {}
        return skills;
    }

    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('projects');
            if (stored) _projects = stored;
        } catch (e) {}
    }

    function _saveProjects() {
        try {
            LawAIApp.StorageEngine?.set?.('projects', _projects);
        } catch (e) {}
    }

    function _syncPortfolio() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('portfolio');
            if (stored) _portfolio = stored;
        } catch (e) {}
    }

    function _savePortfolio() {
        try {
            LawAIApp.StorageEngine?.set?.('portfolio', _portfolio);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        _syncPortfolio();
        
        // 监听课程完成
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            var activeProjects = getActiveProjects();
            activeProjects.forEach(function(project) {
                if (project.requiredLessons && project.requiredLessons.indexOf(lessonId) !== -1) {
                    var newCompleted = (project.progress.lessonsCompleted || 0) + 1;
                    updateProgress(project.projectId, { lessonsCompleted: newCompleted });
                }
            });
        });
        
        console.log('📁 ProjectEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        create: createProject,
        get: getProject,
        getActiveProjects: getActiveProjects,
        getCompletedProjects: getCompletedProjects,
        updateProgress: updateProgress,
        getPortfolio: getPortfolio,
        addToPortfolio: addToPortfolio,
        recommend: recommendProject,
        generateFromGoal: generateFromGoal,
        getReflectionQuestions: generateReflectionQuestions,
        saveReflection: saveReflection
    };
})();

console.log('📁 ProjectEngine V2.0 ready');
})();
