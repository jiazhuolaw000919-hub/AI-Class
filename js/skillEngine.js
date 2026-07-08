// ===========================================
// skillEngine.js
// 技能引擎 - 真实能力衡量（Phase 32 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SkillEngine = (function() {
    var _initialized = false;
    var _skills = {};
    var _skillHistory = {};

    // ===========================================
    // 技能注册
    // ===========================================
    function registerSkill(skillId, def) {
        var skill = getSkill(skillId);
        if (skill) return skill;
        
        skill = {
            skillId: skillId,
            title: def.title || skillId,
            description: def.description || '',
            academyId: def.academyId || 'academy_ai',
            category: def.category || 'General',
            relatedLessons: def.relatedLessons || [],
            experience: 0,
            level: 0,
            mastery: 0,
            confidence: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        _skills[skillId] = skill;
        _saveSkills();
        return skill;
    }

    function getSkill(skillId) {
        _sync();
        return _skills[skillId] || null;
    }

    function getAllSkills() {
        _sync();
        return Object.values(_skills);
    }

    // ===========================================
    // 经验管理
    // ===========================================
    function addExperience(skillId, source, amount) {
        var skill = getSkill(skillId);
        if (!skill) {
            // 尝试自动注册
            var def = { title: skillId.replace('skill_', '').replace(/_/g, ' ') };
            skill = registerSkill(skillId, def);
        }
        
        if (!skill) return null;
        
        skill.experience = (skill.experience || 0) + amount;
        skill.mastery = Math.min(100, skill.experience / 2);
        skill.confidence = Math.min(100, skill.experience / 1.5);
        skill.level = Math.floor(skill.experience / 20);
        skill.updatedAt = new Date().toISOString();
        
        // 记录历史
        if (!_skillHistory[skillId]) _skillHistory[skillId] = [];
        _skillHistory[skillId].push({
            source: source,
            amount: amount,
            timestamp: new Date().toISOString()
        });
        
        _saveSkills();
        _saveHistory();
        LawAIApp.EventBus?.emit?.('SkillUpdated', { skillId: skillId, skill: skill });
        return skill;
    }

    function getSkillHistory(skillId) {
        _syncHistory();
        return _skillHistory[skillId] || [];
    }

    function checkDecay() {
        var skills = getAllSkills();
        var now = Date.now();
        
        skills.forEach(function(skill) {
            var lastUpdate = new Date(skill.updatedAt || skill.createdAt).getTime();
            var daysSince = (now - lastUpdate) / (1000 * 60 * 60 * 24);
            
            if (daysSince > 30) {
                var decay = Math.min(10, daysSince * 0.1);
                skill.mastery = Math.max(0, skill.mastery - decay);
                skill.confidence = Math.max(0, skill.confidence - decay * 0.5);
                skill.updatedAt = new Date().toISOString();
            }
        });
        
        _saveSkills();
        return skills;
    }

    // ===========================================
    // 技能分析
    // ===========================================
    function generateRadar() {
        var skills = getAllSkills();
        var categories = ['Foundation', 'Prompt Engineering', 'AI Tools', 'Coding', 'AI Development'];
        
        return categories.map(function(cat) {
            var related = skills.filter(function(s) { return s.category === cat || s.title.indexOf(cat) !== -1; });
            var avgMastery = related.length > 0 ? 
                related.reduce(function(sum, s) { return sum + s.mastery; }, 0) / related.length : 0;
            
            return {
                name: cat,
                mastery: Math.round(avgMastery),
                skillCount: related.length
            };
        });
    }

    function getOverallMastery() {
        var skills = getAllSkills();
        if (skills.length === 0) return 0;
        var total = skills.reduce(function(sum, s) { return sum + s.mastery; }, 0);
        return Math.round(total / skills.length);
    }

    function getWeakestSkills(limit) {
        limit = limit || 3;
        var skills = getAllSkills();
        skills.sort(function(a, b) { return a.mastery - b.mastery; });
        return skills.slice(0, limit);
    }

    function getRecommendedSkills() {
        var skills = getAllSkills();
        var weak = getWeakestSkills(3);
        var recommendations = weak.map(function(s) {
            return {
                skillId: s.skillId,
                title: s.title,
                currentMastery: Math.round(s.mastery),
                recommendation: 'Practice more to improve ' + s.title
            };
        });
        return recommendations;
    }

    function getGrowthTimeline(skillId) {
        var history = getSkillHistory(skillId);
        return history.map(function(h) {
            return {
                date: h.timestamp,
                source: h.source,
                amount: h.amount
            };
        });
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('skills');
            if (stored) _skills = stored;
        } catch (e) {}
    }

    function _saveSkills() {
        try {
            LawAIApp.StorageEngine?.set?.('skills', _skills);
        } catch (e) {}
    }

    function _syncHistory() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('skill_history');
            if (stored) _skillHistory = stored;
        } catch (e) {}
    }

    function _saveHistory() {
        try {
            LawAIApp.StorageEngine?.set?.('skill_history', _skillHistory);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        _syncHistory();
        
        // 监听事件自动增加经验
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var lessonId = data.lessonId;
            var category = 'General';
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                    var day = parseInt(lessonId.replace('day-', ''));
                    if (!isNaN(day)) {
                        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                        if (lesson && lesson.category) category = lesson.category;
                    }
                }
            } catch (e) {}
            
            var skillId = 'skill_' + category.toLowerCase().replace(/\s/g, '_');
            addExperience(skillId, 'lesson', 3);
        });
        
        LawAIApp.EventBus?.on?.('PracticeCompleted', function(data) {
            if (data.practice) {
                var lessonId = data.practice.lessonId;
                var category = 'General';
                try {
                    if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                        var day = parseInt(lessonId.replace('day-', ''));
                        if (!isNaN(day)) {
                            var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                            if (lesson && lesson.category) category = lesson.category;
                        }
                    }
                } catch (e) {}
                var skillId = 'skill_' + category.toLowerCase().replace(/\s/g, '_');
                addExperience(skillId, 'practice', 5);
            }
        });
        
        // 定期检查衰减
        setInterval(function() {
            checkDecay();
        }, 86400000);
        
        console.log('🧠 SkillEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        register: registerSkill,
        get: getSkill,
        getAll: getAllSkills,
        addExperience: addExperience,
        getHistory: getSkillHistory,
        getRadar: generateRadar,
        getOverallMastery: getOverallMastery,
        getWeakestSkills: getWeakestSkills,
        getRecommended: getRecommendedSkills,
        getGrowthTimeline: getGrowthTimeline,
        checkDecay: checkDecay
    };
})();

console.log('🧠 SkillEngine V2.0 ready');
